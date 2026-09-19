import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const site = 'https://tokoanekarasa99.my.id';
	const today = new Date().toISOString().split('T')[0];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${site}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${site}/logo.png</image:loc>
      <image:title>Toko Aneka Rasa 99 - Pusat Oleh-Oleh Khas Bangka di Poris Tangerang</image:title>
    </image:image>
  </url>
</urlset>`;

	return new Response(sitemap.trim(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=86400, s-maxage=86400'
		}
	});
};
