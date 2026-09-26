import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE, withBase } from '../consts';
import { publishedPosts } from '../series';

export async function GET(context) {
	const posts = await publishedPosts();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: withBase(`/posts/${post.id}/`),
		})),
	});
}
