import re

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the load function logic
content = content.replace("let filteredProducts = $derived(PRODUCTS.filter(p => p.category === selectedCategory));", "let filteredProducts = $derived(PRODUCTS);")

# 2. Update products array
old_products_start = content.find("const PRODUCTS: FeaturedProduct[] = [")
old_products_end = content.find("];", old_products_start) + 2
old_products_str = content[old_products_start:old_products_end]

new_products_str = """const PRODUCTS: FeaturedProduct[] = [
		{
			id: 'p1',
			name: 'Kemplang Panggang Cap MM Asli Bangka',
			category: 'khas-bangka',
			desc: 'Dipanggang tradisional arang kelapa. Gurih renyah di luar, empuk gurih daging ikan tenggiri di dalam.',
			price: 47500,
			originalPrice: 50000,
			weight: '250 gr',
			rating: 5.0,
			reviewsCount: 142,
			image: '/images/products/kemplang-mm.jpg',
			badge: '🔥 Paling Laris',
			highlight: 'Sambal Terasi Asli'
		},
		{
			id: 'p2',
			name: 'Steak Telor Cumi/Kericu cap Kuda Laut 250 gram',
			category: 'khas-bangka',
			desc: 'Camilan khas Bangka berbahan dasar telur cumi pilihan. Bentuk stik yang sangat renyah dan gurih.',
			price: 45000,
			originalPrice: 50000,
			weight: '250 gr',
			rating: 4.9,
			reviewsCount: 89,
			image: '/images/products/getas-obor.jpg',
			badge: '🦑 Terlaris',
			highlight: 'Asli Telur Cumi'
		},
		{
			id: 'p3',
			name: 'Getas Lonceng Mas Panjang @250g',
			category: 'khas-bangka',
			desc: 'Getas ikan tenggiri super berbentuk lonjong. Tekstur renyah, rasa ikannya sangat pekat.',
			price: 66000,
			originalPrice: 70000,
			weight: '250 gr',
			rating: 4.9,
			reviewsCount: 115,
			image: '/images/products/getas-obor.jpg',
			badge: '⭐ Favorit',
			highlight: 'Super Renyah'
		},
		{
			id: 'p4',
			name: 'Terasi AB No. 1 Pulau Bangka 500g',
			category: 'bumbu',
			desc: 'Terasi udang rebon asli dari Toboali Bangka. Kualitas nomor 1, wangi khas dan tanpa pewarna buatan.',
			price: 60000,
			originalPrice: 65000,
			weight: '500 gr',
			rating: 5.0,
			reviewsCount: 231,
			image: '/images/products/terasi-ab.jpg',
			badge: '🌶️ Bumbu Wajib',
			highlight: 'Wangi Khas'
		},
		{
			id: 'p5',
			name: 'Kopi Kingkong Merah 200g',
			category: 'bumbu',
			desc: 'Kopi legendaris khas Bangka. Aroma pekat yang nikmat disajikan panas maupun dingin.',
			price: 35000,
			originalPrice: 40000,
			weight: '200 gr',
			rating: 4.8,
			reviewsCount: 76,
			image: '/images/products/kopi-cap1.jpg',
			badge: '☕ Legendaris',
			highlight: 'Aroma Kuat'
		},
		{
			id: 'p6',
			name: 'Kopi Cap 1 Biru 250g',
			category: 'bumbu',
			desc: 'Kopi bubuk tradisional khas Bangka sejak 1968. Rasanya mantap dan aromanya sangat wangi.',
			price: 28000,
			originalPrice: 32000,
			weight: '250 gr',
			rating: 4.9,
			reviewsCount: 104,
			image: '/images/products/kopi-cap1.jpg',
			badge: '🏆 Klasik',
			highlight: 'Sejak 1968'
		},
		{
			id: 'p7',
			name: 'Kerupuk Mentah Bangka Ikan Tenggiri Yoyo 500g',
			category: 'kerupuk-mentah',
			desc: 'Kerupuk mentah kualitas super. Mengembang sempurna dan rasa ikan tenggirinya sangat terasa setelah digoreng.',
			price: 45000,
			originalPrice: 50000,
			weight: '500 gr',
			rating: 4.9,
			reviewsCount: 88,
			image: '/images/products/kerupuk-mentah.jpg',
			badge: '🟡 Premium',
			highlight: 'Mengembang Sempurna'
		},
		{
			id: 'p8',
			name: 'Kerupuk Bawang Mentah Polos 1kg',
			category: 'kerupuk-mentah',
			desc: 'Kerupuk mentah rasa bawang yang gurih. Sangat mudah digoreng, cocok untuk lauk pauk.',
			price: 25500,
			originalPrice: 28000,
			weight: '1 kg',
			rating: 4.7,
			reviewsCount: 56,
			image: '/images/products/kerupuk-mentah.jpg',
			badge: '📦 Hemat',
			highlight: 'Praktis'
		}
	];"""

content = content.replace(old_products_str, new_products_str)

# 3. Remove Categories from HTML
content = re.sub(r'<!-- Category Filters -->.*?</div>\s*<!-- Catalog Grid -->', '<!-- Catalog Grid -->', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated catalog correctly")
