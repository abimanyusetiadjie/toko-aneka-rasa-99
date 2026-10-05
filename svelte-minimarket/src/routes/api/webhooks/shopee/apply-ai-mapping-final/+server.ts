import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db';

export const GET = async () => {
	try {
		let count = 0;

		// Local: Abon Ikan Belincis -> Shopee: Amplang/Getas ikan tenggiri
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19136962564, '56676484-5a3b-419d-9120-b0c8423ca1dd']);
		count++;

		// Local: Bong Li Piang 89 -> Shopee: BONGLIPIANG 89 KHAS BANGKA - BONG LI PIANG - PIANG NANAS MAKANAN KUE KHAS BANGKA
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [9514016364, 'becb08ae-8563-46c8-9d5a-21bbfb711bb5']);
		count++;

		// Local: BubbleWrap KPK 1/2 Putih 3.1kg -> Shopee: Kerupuk mentah  putih bentuk lidah 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14468669211, '2694255f-da5d-45f8-82f1-a5727e29774c']);
		count++;

		// Local: Dahkota kerupuk  bawang warna warni -> Shopee: Kerupuk warna warni bentuk kepang/rantai 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [21556817314, 'd16c95e0-0351-4c6a-871d-68b71c126c34']);
		count++;

		// Local: Engpiang Goreng -> Shopee: INDOMIE GORENG BANGKA
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [3174056940, 'b2dbf278-2a90-4eb4-82dd-f3f0643e5db4']);
		count++;

		// Local: Getas 2 Kunci Panjang@250g -> Shopee: Getas cap lonceng bentuk panjang
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [15864113992, 'a9900000-0000-0000-0000-000000000051']);
		count++;

		// Local: Getas AMC Panjang@250g -> Shopee: Getas cap lonceng bentuk panjang
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [15864113992, 'a9900000-0000-0000-0000-000000000053']);
		count++;

		// Local: Getas Lonceng Mas Bulat@250g -> Shopee: Getas cap lonceng bentuk panjang
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [15864113992, 'a9900000-0000-0000-0000-000000000065']);
		count++;

		// Local: Getas Lonceng Mas Panjang@250g -> Shopee: Getas cap lonceng bentuk panjang
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [15864113992, 'a9900000-0000-0000-0000-000000000064']);
		count++;

		// Local: Getas Obor Biru Bulat@250g -> Shopee: Getas Super Cap Obor Tiga Roda Bulat kantong biru 250 Gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [2931419239, 'a9900000-0000-0000-0000-000000000067']);
		count++;

		// Local: Getas Obor Biru Panjang@250g -> Shopee: Getas Super Cap Obor Tiga Roda Panjang kantong biru 250 Gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [8629084574, 'a9900000-0000-0000-0000-000000000066']);
		count++;

		// Local: Getas Obor Merah Bulat@250g -> Shopee: Getas Bulat Obor Merah Cap Tiga Roda Makanan Khas Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [7724353647, 'a9900000-0000-0000-0000-000000000063']);
		count++;

		// Local: Getas Obor Merah Panjang@250g -> Shopee: Getas cap lonceng bentuk panjang
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [15864113992, 'a9900000-0000-0000-0000-000000000062']);
		count++;

		// Local: Getas S Sari Laut Bulat@250g -> Shopee: Kemplang panggang Bangka cap Sari Laut
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13639159139, 'a9900000-0000-0000-0000-000000000057']);
		count++;

		// Local: Gula Aren 1pcs -> Shopee: Gula Aren/gula kabung Bangka 1 keping
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14350329664, '9605d025-4cb7-4b68-bd7b-7e42b0276893']);
		count++;

		// Local: Indomie Kaldu Udang Bangka -> Shopee: INDOMIE KALDU UDANG EDISI HANYA DI BANGKA
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [8000987236, 'a9900000-0000-0000-0000-000000000071']);
		count++;

		// Local: Kacang Atom SP @250g -> Shopee: Kacang telur/Kacang medan cap SP 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [20417364941, 'a9900000-0000-0000-0000-000000000072']);
		count++;

		// Local: Kacang Atom SP @500g -> Shopee: Kacang telur/kacang medan cap SP 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [21317363638, 'a9900000-0000-0000-0000-000000000001']);
		count++;

		// Local: Kacang Bawang @500g -> Shopee: Kacang Bawang Super Original di repack 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [50956940645, 'a9900000-0000-0000-0000-000000000073']);
		count++;

		// Local: Kacang Medan SP 500g -> Shopee: Kacang telur/kacang medan cap SP 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [21317363638, 'a9900000-0000-0000-0000-000000000082']);
		count++;

		// Local: Kacang medan SP @250g -> Shopee: Kacang telur/Kacang medan cap SP 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [20417364941, 'a9900000-0000-0000-0000-000000000081']);
		count++;

		// Local: Kecap Asin Rose 600ml -> Shopee: Kecap asin Bangka cap SS botol besar
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [3469125252, 'a9900000-0000-0000-0000-000000000087']);
		count++;

		// Local: Kecap Gajah Besar -> Shopee: Kecap Istimewa cap Siong/Gajah
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4169047477, 'a9900000-0000-0000-0000-000000000088']);
		count++;

		// Local: Kecap Gajah Biasa kecil -> Shopee: Kecap Istimewa cap Siong/Gajah
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4169047477, 'a9900000-0000-0000-0000-000000000014']);
		count++;

		// Local: Kembang Tahu / Fucuk -> Shopee: Kembang tahu/ Fucuk khas Bangka 90-100 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [29954654970, '8fb72607-55ab-42a4-981f-f9db58e69cd5']);
		count++;

		// Local: Kemplang Koin ikan San Crispy -> Shopee: Kemplang Koin Ikan San Crispy ( Kerupuk / Getas / Kemplang  Makanan Snack Khas Bangka)
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4565098655, 'a9900000-0000-0000-0000-000000000028']);
		count++;

		// Local: Kemplang Koin udang San Crispy -> Shopee: Kemplang Koin Udang San Crispy ( Kerupuk / Getas / Kemplang Makanan Snack Khas Bangka)
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [7564510132, 'a9900000-0000-0000-0000-000000000101']);
		count++;

		// Local: Kemplang Mentah Ikan Bangka 250g -> Shopee: Kemplang/kerupuk oven ikan tenggiri Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [43873997468, '4b4e3064-c8c8-4b49-8c0a-c59829769078']);
		count++;

		// Local: Kemplang OVN Cumi RJS -> Shopee: Kemplang goreng cumi khas Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [18560546609, 'a9900000-0000-0000-0000-000000000031']);
		count++;

		// Local: Kemplang OVN Ikan RJS -> Shopee: Kemplang mentah ikan Bangka 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13435636487, 'a9900000-0000-0000-0000-000000000032']);
		count++;

		// Local: Kemplang OVN Sambal Terasi -> Shopee: Kemplang oven ikan sambel terasi
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [18859344976, '68240132-740c-4c33-beb2-e0baf6e28114']);
		count++;

		// Local: Kemplang OVN Udang RJS -> Shopee: Kemplang mentah udang Bangka 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13135650711, 'a9900000-0000-0000-0000-000000000030']);
		count++;

		// Local: Kemplang P Sari Laut Besar -> Shopee: Kemplang panggang Bangka cap Sari Laut
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13639159139, 'a9900000-0000-0000-0000-000000000041']);
		count++;

		// Local: Kemplang goreng pasir Asui Kecil -> Shopee: Kemplang goreng pasir Bangka cap Achon
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13739159829, 'a9900000-0000-0000-0000-000000000024']);
		count++;

		// Local: Keripik Pangsit Goreng@200g -> Shopee: Keripik bawang/pangsit goreng berat 200 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [41553033631, 'a9900000-0000-0000-0000-000000000117']);
		count++;

		// Local: Keripik Pisang Asin -> Shopee: Keripik pisang kepok asin 180 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [16133253852, 'a9900000-0000-0000-0000-000000000118']);
		count++;

		// Local: Kerupuk Bawang Polos 250g -> Shopee: Kerupuk bawang bentuk kancing 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [23504480192, 'a9900000-0000-0000-0000-000000000133']);
		count++;

		// Local: Kerupuk Hanoman Bibir 5 kg -> Shopee: Kerupuk mentah bawang bibir 1 ball berat  5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [3652116200, '9955dbed-1b5d-4e30-9773-3b0dd6993c47']);
		count++;

		// Local: Kerupuk Keriting Biasa Bangka@1kg -> Shopee: Kerupuk keriting mawar putih 1kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [5335455002, 'e87615aa-b1dc-46e9-90b4-c360ddcb7b23']);
		count++;

		// Local: Kerupuk Keriting Biasa Bangka@250g -> Shopee: Kerupuk ikan item Bangka cap Rajawali
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [40707501764, 'b50bcd15-8ea2-414a-bdbf-1e6af9b5682c']);
		count++;

		// Local: Kerupuk Keriting Biasa Bangka@500g -> Shopee: Kerupuk keriting mawar putih 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13696828151, 'b8a6a02d-f80a-4e6a-9ad1-b051aeb64c36']);
		count++;

		// Local: Kerupuk Keriting Kecil Bangka@250g -> Shopee: Michang/Bipang/cha liau Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14290421359, 'e5b91adb-4af8-4a69-9dea-9903dfa81ea9']);
		count++;

		// Local: Kerupuk Keriting Kecil Bangka@500g -> Shopee: Kerupuk keriting mawar putih 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13696828151, 'f19ae23e-92ac-44c0-bf91-116ca8e1cd9a']);
		count++;

		// Local: Kerupuk Keriting Menta sedang  Palembang 250 gr -> Shopee: Kerupuk mentah tersanjung berat 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [43159852619, 'be1df03d-847f-4719-8ec7-0bbc5d136526']);
		count++;

		// Local: Kerupuk Keriting Mentah Palembang  5kg -> Shopee: Kerupuk Keriting Ikan Mentah Palembang Ampera 89 ukuran sedang5kg - 5kg besar
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = 21836180652, updated_at = NOW() WHERE id = $2`, [7435451487, 'df08b310-0c71-474c-8019-793653bf172d']);
		count++;

		// Local: Kerupuk Keriting Mentah Palembang Mini 5 kg -> Shopee: kerupuk keriting mawar warna warni mentah 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4453189980, '37780267-a6fb-4e62-8a91-3f2ea34e73f4']);
		count++;

		// Local: Kerupuk Keriting palembang Mentah Ukuran Mini 500g -> Shopee: Kerupuk Keriting Ikan Mentah Palembang 500 Gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [5524336228, 'a9900000-0000-0000-0000-000000000153']);
		count++;

		// Local: Kerupuk Mentah Bangka Ikan  500g -> Shopee: Kemplang mentah ikan Bangka 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13435636487, 'a9900000-0000-0000-0000-000000000157']);
		count++;

		// Local: Kerupuk Mie Kuning Mini 5 kg -> Shopee: kerupuk tersanjung mentah 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [7858479928, 'd28ae9e5-5165-4425-a10c-0dda5b673b47']);
		count++;

		// Local: Kerupuk Tempe 5 kg -> Shopee: kerupuk tersanjung mentah 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [7858479928, '6b4d0439-0203-4165-81b2-38ce0a94b29f']);
		count++;

		// Local: Kerupuk ikan pancing besar -> Shopee: Kerupuk keriting ikan tenggiri Sanjaya 230 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [17135626219, 'a9900000-0000-0000-0000-000000000019']);
		count++;

		// Local: Kerupuk ikan pancing kecil -> Shopee: Kerupuk keriting ikan tenggiri Sanjaya 230 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [17135626219, 'a9900000-0000-0000-0000-000000000144']);
		count++;

		// Local: Kerupuk keriting Sanjaya Besar -> Shopee: Kerupuk keriting ikan tenggiri Sanjaya 230 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [17135626219, 'a9900000-0000-0000-0000-000000000021']);
		count++;

		// Local: Kerupuk keriting Sanjaya Kecil -> Shopee: Kerupuk keriting ikan tenggiri Sanjaya 230 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [17135626219, '60fe6a22-82fc-42bc-a49c-f2675416b8e6']);
		count++;

		// Local: Kiamboi Putih -> Shopee: Kiamboi putih asin, asem , manis 60 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [53412787684, 'a9900000-0000-0000-0000-000000000192']);
		count++;

		// Local: Kopi Cap 1 Biru 250g -> Shopee: Kopi Bubuk cap 1 kantong biru dari Bangka 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [18781773414, 'a9900000-0000-0000-0000-000000000196']);
		count++;

		// Local: Kopi Cap 1 Biru 500g -> Shopee: Kopi bubuk Cap 1 kantong biru 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [29357974529, 'a9900000-0000-0000-0000-000000000195']);
		count++;

		// Local: Kopi Cap 1 Premium -> Shopee: Kopi bubuk Cap 1 kantong biru 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [29357974529, 'a9900000-0000-0000-0000-000000000199']);
		count++;

		// Local: Kopi Cap 1 Silver -> Shopee: Kopi bubuk cap 1 kantong silver dari Bangka 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [20174909813, 'a9900000-0000-0000-0000-000000000197']);
		count++;

		// Local: Kopi Kingkong Merah 200g -> Shopee: Kopi bubuk asli cap kingkong kantong merah 200 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [10837933001, 'a9900000-0000-0000-0000-000000000193']);
		count++;

		// Local: Kopi Kingkong Merah 450g -> Shopee: Kopi bubuk asli cap kingkong kantong merah 450 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [11137936501, 'a9900000-0000-0000-0000-000000000194']);
		count++;

		// Local: Kopi Kingkong Merah 70g -> Shopee: Kopi bubussk asli cap kingkong  kantong merah 70 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [10337931762, 'a9900000-0000-0000-0000-000000000010']);
		count++;

		// Local: Kue Bangkit / Kue Rintak LN -> Shopee: Kue Bangkit/kue Rinta Bravery
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [12239195446, 'a9900000-0000-0000-0000-000000000201']);
		count++;

		// Local: Kue Bulan kose -> Shopee: Kue gamerose mini 160 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [12339194772, 'a9900000-0000-0000-0000-000000000202']);
		count++;

		// Local: Kue Cetak Satu -> Shopee: Kue gamerose mini 160 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [12339194772, '4abf072d-02f2-48e5-ba42-811572df4d6a']);
		count++;

		// Local: Kue Sempret  ED -> Shopee: Kue gamerose mini 160 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [12339194772, 'a9900000-0000-0000-0000-000000000208']);
		count++;

		// Local: Pang Pang@250g -> Shopee: Pang Pang beratnya 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [47456948229, 'a9900000-0000-0000-0000-000000000216']);
		count++;

		// Local: Pang Pang@500g -> Shopee: Pang Pang berat 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [50006931173, 'a9900000-0000-0000-0000-000000000215']);
		count++;

		// Local: Pilus Putih@160 -> Shopee: Kue gamerose mini 160 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [12339194772, 'b7be2757-f8ad-4172-a422-8eb139095764']);
		count++;

		// Local: Roti Kering Gula Mr. Jo Rokerz Asli -> Shopee: ROTI KERING GULA MR JO ROKERS ASLI BANGKA  ROKER ROTI BANGKA  ROTI KERING BAGELEN BANGKA CAP ROCKERS
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [8800421484, 'a9900000-0000-0000-0000-000000000221']);
		count++;

		// Local: Sambal Super Pedas 72 @140ml -> Shopee: Sambal balado 72 Super Pedas140 ml
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19179909482, 'abf0a67c-f07e-45da-8fa7-1d9df08e7782']);
		count++;

		// Local: Spring Roll / Sumpia Udang 250g -> Shopee: Spring rol/Sumpia udang 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [15627856445, 'a9900000-0000-0000-0000-000000000228']);
		count++;

		// Local: Spring Roll / Sumpia Udang 500g -> Shopee: Spring rol/Sumpia udang 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [15427854591, 'a9900000-0000-0000-0000-000000000229']);
		count++;

		// Local: Stik Kuda Laut@250 -> Shopee: Steak Telor Cumi/Kericu cap Kuda Laut 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26257969286, 'a9900000-0000-0000-0000-000000000047']);
		count++;

		// Local: Stik balado -> Shopee: Stik rasa sambal Balado berat 160 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [40703033424, 'a9900000-0000-0000-0000-000000000233']);
		count++;

		// Local: Tauco Bangka -> Shopee: Michang/Bipang/cha liau Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14290421359, 'a9900000-0000-0000-0000-000000000234']);
		count++;

		// Local: Terasi Bangka Toboali "AMS" 250 gram -> Shopee: Asam kuning Bangka spesial 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [29804656094, 'a9900000-0000-0000-0000-000000000005']);
		count++;

		// Local: Terasi Bangka Toboali "AMS" 500 gram -> Shopee: Terasi AB No. 1 pulau Bangka 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [10423085994, 'a9900000-0000-0000-0000-000000000240']);
		count++;

		// Local: Terasi Bubuk AMS -> Shopee: Terasi bubuk Toboali "AMS" 100 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [16389719949, 'cebbb336-ee18-46f7-9366-47447629c808']);
		count++;

		// Local: Terasi Panggang Piring Khas Bangka Cap Juwita -> Shopee: Terasi Panggang piring khas Bangka cap Anugrah 88/Sambel terasi panggang piring pedas
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19223175700, 'a9900000-0000-0000-0000-000000000242']);
		count++;

		// Local: getas sumber sari laut panjang 250 gr -> Shopee: Getas cap lonceng bentuk panjang
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [15864113992, '84816cde-363d-47fe-a760-f828d74ece81']);
		count++;

		// Local: kelubi besar -> Shopee: Asinan Buah Kelubi
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [6864423039, '99938728-0e6b-4352-a80b-78b499d297c3']);
		count++;

		// Local: kelubi kecil -> Shopee: Asinan Buah Kelubi
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [6864423039, 'b2f552de-2546-4207-b3cc-5e1f59a710ad']);
		count++;

		// Local: kemplang pasir 2 putera -> Shopee: Kemplang goreng pasir mini cap Achon
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19981763365, 'a9900000-0000-0000-0000-000000000015']);
		count++;

		// Local: kerupuk/kemplang sari udang mini 5 kg -> Shopee: Kerupuk mentah Sari Udang warna orange muda 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [49858139261, '88253d54-8fb3-4104-818a-8a3b9b431039']);
		count++;

		// Local: kue masin jills -> Shopee: Kue masin 89 berat 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26437180406, 'c4f7ec1f-8c86-40c8-9b87-0fc2ed0a0e36']);
		count++;

		// Local: kue semprong arwama -> Shopee: Kue gamerose mini 160 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [12339194772, '56b64ead-b334-455a-aa4f-213057330440']);
		count++;
		return json({ success: true, message: `Berhasil menautkan ${count} produk!` });
	} catch (err: any) {
		return json({ error: err.message });
	}
};