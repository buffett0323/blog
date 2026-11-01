import { GlobalWorkerOptions, getDocument, TextLayer, type PDFPageProxy } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerSrc;

// Renders a PDF page by page (lazily, as pages scroll into view) and pins every `.anno` element
// found in `notesRoot` (see Annotation.astro) next to the text it refers to. `.hl-src` elements
// (Highlight.astro) are highlighted the same way but have no note card.

interface Anno {
	el: HTMLElement;
	page: number;
	text: string;
	line?: number;
	occurrence: number;
	color: string;
	/** A bare highlight (Highlight.astro): no card, no number. */
	bare: boolean;
	/** Set once the page is rendered and the text is found: top of the first highlight, as a fraction of page height. */
	top?: number;
	marks: HTMLElement[];
}

/** A visual line: text runs sharing a baseline, left to right. */
interface Line {
	y: number;
	items: number[];
}

// Canvas resolution cap, in CSS px of page width; pages are scaled down with CSS beyond that.
const MAX_RENDER_WIDTH = 1100;

export async function mountPdfViewer(root: HTMLElement, notesRoot: ParentNode) {
	const pagesEl = root.querySelector<HTMLElement>('.pdf-pages')!;
	const showLines = new URLSearchParams(location.search).has('lines');
	root.classList.toggle('show-lines', showLines);

	const read = (el: HTMLElement, bare: boolean): Anno => ({
		el,
		page: Number(el.dataset.page),
		text: el.dataset.text ?? '',
		line: el.dataset.line ? Number(el.dataset.line) : undefined,
		occurrence: Number(el.dataset.occurrence ?? 1),
		color: el.dataset.color ?? 'yellow',
		bare,
		marks: [],
	});
	const annos = [...notesRoot.querySelectorAll<HTMLElement>('.anno')].map((el) => read(el, false));
	annos.sort((a, b) => a.page - b.page);
	annos.forEach((a, i) => {
		a.el.id = `note-${i + 1}`;
		a.el.querySelector('.anno-num')!.textContent = String(i + 1);
	});
	const highlights = [...notesRoot.querySelectorAll<HTMLElement>('.hl-src')].map((el) => read(el, true));

	const doc = await getDocument({ url: root.dataset.src! }).promise;
	root.querySelector('.pdf-status')?.remove();

	// Lay out empty, correctly sized slots for every page first so scrolling and anchors work.
	const pages = await Promise.all(Array.from({ length: doc.numPages }, (_, i) => doc.getPage(i + 1)));
	const slots = pages.map((page) => {
		const { width, height } = page.getViewport({ scale: 1 });
		const row = document.createElement('section');
		row.className = 'pdf-row';
		row.id = `p${page.pageNumber}`;
		row.innerHTML = `
			<div class="pdf-page" style="aspect-ratio:${width}/${height}">
				<span class="pdf-page-num">${page.pageNumber}</span>
			</div>
			<div class="pdf-gutter"></div>`;
		pagesEl.append(row);
		const pageEl = row.querySelector<HTMLElement>('.pdf-page')!;
		const gutter = row.querySelector<HTMLElement>('.pdf-gutter')!;
		const mine = annos.filter((a) => a.page === page.pageNumber);
		const marks = [...mine, ...highlights.filter((h) => h.page === page.pageNumber)];
		gutter.append(...mine.map((a) => a.el));
		return { page, row, pageEl, gutter, mine, marks, width, rendered: false };
	});

	const resize = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const slot = slots.find((s) => s.pageEl === entry.target);
			if (!slot) continue;
			slot.pageEl.style.setProperty('--total-scale-factor', String(entry.contentRect.width / slot.width));
			placeCards(slot.pageEl, slot.gutter, slot.mine);
		}
	});

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const slot = slots.find((s) => s.row === entry.target);
				if (!entry.isIntersecting || !slot || slot.rendered) continue;
				slot.rendered = true;
				io.unobserve(slot.row);
				renderPage(slot.page, slot.pageEl, slot.marks, showLines).then(() => {
					resize.observe(slot.pageEl);
					placeCards(slot.pageEl, slot.gutter, slot.mine);
				});
			}
		},
		{ rootMargin: '1200px 0px' },
	);
	slots.forEach((s) => io.observe(s.row));

	// Hovering a note lights up its highlight, and the other way round.
	const link = (a: Anno, on: boolean) => {
		a.el.classList.toggle('active', on);
		a.marks.forEach((m) => m.classList.toggle('active', on));
	};
	for (const a of annos) {
		a.el.addEventListener('mouseenter', () => link(a, true));
		a.el.addEventListener('mouseleave', () => link(a, false));
		a.el
			.querySelector('.anno-quote')
			?.addEventListener('click', () => a.marks[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
	}
	root.addEventListener('mouseover', (e) => {
		const id = (e.target as HTMLElement).closest<HTMLElement>('.pdf-mark')?.dataset.note;
		annos.forEach((a, i) => link(a, String(i + 1) === id));
	});
}

async function renderPage(page: PDFPageProxy, pageEl: HTMLElement, annos: Anno[], showLines: boolean) {
	const base = page.getViewport({ scale: 1 });
	const cssWidth = Math.min(pageEl.clientWidth || base.width, MAX_RENDER_WIDTH);
	const scale = (cssWidth / base.width) * Math.min(window.devicePixelRatio || 1, 2);
	const viewport = page.getViewport({ scale });

	const canvas = document.createElement('canvas');
	canvas.width = Math.floor(viewport.width);
	canvas.height = Math.floor(viewport.height);
	const marksEl = document.createElement('div');
	marksEl.className = 'pdf-marks';
	const textEl = document.createElement('div');
	textEl.className = 'textLayer';
	pageEl.style.setProperty('--total-scale-factor', String(pageEl.clientWidth / base.width));
	pageEl.append(canvas, marksEl, textEl);

	const textContent = await page.getTextContent();
	const textLayer = new TextLayer({ textContentSource: textContent, container: textEl, viewport: base });
	await Promise.all([page.render({ canvas, viewport }).promise, textLayer.render()]);

	// TextLayer creates one element per text item (skipping marked-content markers), in order.
	const items = textContent.items.filter((it): it is TextItem => 'str' in it);
	const divs = textLayer.textDivs;
	const lines = groupLines(items);

	if (showLines) {
		lines.forEach((line, i) => {
			const first = divs[line.items[0]];
			const n = document.createElement('span');
			n.className = 'pdf-line-num';
			n.textContent = String(i + 1);
			n.style.top = first.style.top;
			marksEl.append(n);
		});
	}

	const box = pageEl.getBoundingClientRect();
	for (const a of annos) {
		const hit = findText(a, items, lines);
		if (!hit) {
			a.el.classList.add('unanchored');
			console.warn(`[pdf] p.${a.page}: could not find "${a.text}"${a.line ? ` on line ${a.line}` : ''}`);
			continue;
		}
		if (a.line && hit.line !== a.line) a.el.classList.add('unanchored');
		const rects = hit.segments.flatMap(({ item, start, end }) => {
			const node = divs[item]?.firstChild;
			if (!node) return [];
			const range = document.createRange();
			range.setStart(node, start);
			range.setEnd(node, end);
			return [...range.getClientRects()];
		});
		const id = a.el.id.replace('note-', '');
		a.marks = rects.map((r, i) => {
			const m = document.createElement(a.bare ? 'span' : 'a');
			m.className = `pdf-mark ${a.color}${a.bare ? ' bare' : ''}`;
			if (!a.bare) {
				(m as HTMLAnchorElement).href = `#${a.el.id}`;
				m.dataset.note = id;
			}
			m.style.left = pct(r.left - box.left, box.width);
			m.style.top = pct(r.top - box.top, box.height);
			m.style.width = pct(r.width, box.width);
			m.style.height = pct(r.height, box.height);
			if (!a.bare && i === rects.length - 1) m.dataset.badge = id;
			marksEl.append(m);
			return m;
		});
		a.top = rects.length ? (rects[0].top - box.top) / box.height : undefined;
	}
}

const pct = (v: number, of: number) => `${((100 * v) / of).toFixed(3)}%`;

/** Groups text runs into visual lines by baseline, top to bottom. Line numbers in annotations index into this. */
function groupLines(items: TextItem[]): Line[] {
	const lines: Line[] = [];
	items.forEach((it, i) => {
		if (!it.str.trim()) return;
		const y = it.transform[5];
		const tol = Math.max(2, (it.height || Math.abs(it.transform[3])) * 0.5);
		let line = lines.find((l) => Math.abs(l.y - y) < tol);
		if (!line) lines.push((line = { y, items: [] }));
		line.items.push(i);
	});
	lines.sort((a, b) => b.y - a.y);
	for (const l of lines) l.items.sort((a, b) => items[a].transform[4] - items[b].transform[4]);
	return lines;
}

/**
 * Finds the annotation's text starting on its line (or, without a line or if it is not there, anywhere on
 * the page), ignoring whitespace. The text may continue onto following lines; a hyphen that breaks a word
 * at the end of a line is skipped. Returns the matching character ranges within each text item.
 */
function findText(a: Anno, items: TextItem[], lines: Line[]) {
	const needle = a.text.replace(/\s+/g, '');
	if (!needle) return;
	// Flatten the page to non-whitespace characters in line order, remembering where each came from.
	const chars: { item: number; at: number; line: number }[] = [];
	let flat = '';
	lines.forEach((line, li) => {
		const start = chars.length;
		for (const item of line.items) {
			// One entry per UTF-16 unit, so indexes into `flat` and DOM Range offsets agree even for
			// characters outside the BMP (math italic letters are common in papers).
			let at = 0;
			for (const ch of items[item].str) {
				if (!/\s/.test(ch)) {
					flat += ch;
					for (let k = 0; k < ch.length; k++) chars.push({ item, at: at + k, line: li });
				}
				at += ch.length;
			}
		}
		// A trailing hyphen usually splits a word across lines: drop it unless the needle keeps it.
		if (chars.length > start && flat.endsWith('-') && !needle.includes(`${flat.slice(-2, -1)}-`)) {
			flat = flat.slice(0, -1);
			chars.pop();
		}
	});
	const toSegments = (from: number) => {
		const segments: { item: number; start: number; end: number }[] = [];
		for (const c of chars.slice(from, from + needle.length)) {
			const last = segments.at(-1);
			if (last?.item === c.item) last.end = c.at + 1;
			else segments.push({ item: c.item, start: c.at, end: c.at + 1 });
		}
		return { line: chars[from].line + 1, segments };
	};
	const matches: number[] = [];
	for (let from = flat.indexOf(needle); from !== -1; from = flat.indexOf(needle, from + 1)) matches.push(from);
	if (a.line) {
		const onLine = matches.filter((m) => chars[m].line === a.line! - 1)[a.occurrence - 1];
		if (onLine !== undefined) return toSegments(onLine);
	}
	const nth = matches[a.occurrence - 1];
	return nth === undefined ? undefined : toSegments(nth);
}

/** Puts each note level with its highlight, pushing later notes down so they never overlap. */
function placeCards(pageEl: HTMLElement, gutter: HTMLElement, annos: Anno[]) {
	const h = pageEl.clientHeight;
	let bottom = 0;
	for (const a of [...annos].sort((x, y) => (x.top ?? 1) - (y.top ?? 1))) {
		const top = Math.max((a.top ?? 0) * h - 12, bottom);
		a.el.style.top = `${top}px`;
		bottom = top + a.el.offsetHeight + 12;
	}
	gutter.style.minHeight = `${bottom}px`;
}
