
import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db';

export const GET = async () => {
	try {
		let count = 0;

		// Local: Abon Ikan Ciu/selar -> Shopee: Abon Ikan Ciu/selar Super Sambalingkung Khas Bangka - 200 Gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = 51693176293, updated_at = NOW() WHERE id = $2`, [4461261796, '07b28ac3-f9dc-4769-b0da-8d154ae794c5']);
		count++;

		// Local: Asam kuning Bangka spesial @ 250 gram -> Shopee: Asam kuning Bangka spesial 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [29804656094, 'a9900000-0000-0000-0000-000000000004']);
		count++;

		// Local: Asem kuning Bangka spesial 250 gram -> Shopee: Asam kuning Bangka spesial 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [29804656094, 'a9900000-0000-0000-0000-000000000059']);
		count++;

		// Local: Emping Kecil Manis Pedas 250g -> Shopee: Emping kecil manis pedas 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [12006429431, 'a9900000-0000-0000-0000-000000000061']);
		count++;

		// Local: Getas CAP Ikan Tenggiri@200g -> Shopee: Getas Super cap ikan tenggiri  khas Bangka berat 200 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [52912791329, 'a9900000-0000-0000-0000-000000000049']);
		count++;

		// Local: Gula Aren / Gula Kabung Bangka 1 Turus Isi 5 Butir -> Shopee: Gula Aren/gula kabung Bangka 1 turos isi 5 keping
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [15550332547, 'a9900000-0000-0000-0000-000000000069']);
		count++;

		// Local: Hanoman Sari Udang Orange Tua 1 ball 5 kg -> Shopee: Kerupuk mentah Sari Udang warna orange tua 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [23747704683, '5ffaa1c3-222d-4441-baf9-081cb99cf0e2']);
		count++;

		// Local: Kacang Mede goreng super 250g -> Shopee: Kacang Mede goreng super berat 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [55762777912, 'a9900000-0000-0000-0000-000000000078']);
		count++;

		// Local: Kecap Asin Kuda Terbang@300ml -> Shopee: Kecap asin Bangka cap kuda terbang botol kecil 300ml
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26003587262, 'a9900000-0000-0000-0000-000000000085']);
		count++;

		// Local: Kecap Asin SS Botol Besar -> Shopee: Kecap asin Bangka cap SS botol besar
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [3469125252, 'a9900000-0000-0000-0000-000000000089']);
		count++;

		// Local: Kecap Istimewa cap Siong/Gajah kecil -> Shopee: Kecap Istimewa cap Siong/Gajah
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4169047477, 'a9900000-0000-0000-0000-000000000091']);
		count++;

		// Local: Kemplang Goreng Cumi RJS -> Shopee: Kemplang goreng cumi khas Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [18560546609, 'a9900000-0000-0000-0000-000000000033']);
		count++;

		// Local: Kemplang Goreng Ikan Ciu -> Shopee: Kemplang goreng ikan tenggiri khas Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [18760546489, 'a9900000-0000-0000-0000-000000000036']);
		count++;

		// Local: Kemplang Goreng Ikan RJS -> Shopee: Kemplang goreng ikan tenggiri khas Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [18760546489, 'a9900000-0000-0000-0000-000000000034']);
		count++;

		// Local: Kemplang Goreng Udang RJS -> Shopee: Kemplang goreng udang khas Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [18360547084, 'a9900000-0000-0000-0000-000000000035']);
		count++;

		// Local: Kemplang Koin cumi San Crispy -> Shopee: Kemplang Koin Cumi San Crispy ( Kerupuk / Getas / Kemplang Makanan Khas Bangka)
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [3173021463, 'a9900000-0000-0000-0000-000000000029']);
		count++;

		// Local: Kemplang Mentah Cumi Bangka 500g -> Shopee: Kemplang goreng cumi khas Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [18560546609, 'aabb7551-d4bb-4378-a0b4-425c4ed05c6e']);
		count++;

		// Local: Kemplang Mentah Ikan Bangka 500g -> Shopee: Kemplang mentah ikan Bangka 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13435636487, 'a9900000-0000-0000-0000-000000000102']);
		count++;

		// Local: Kemplang Mentah Udang Bangka 500g -> Shopee: Kemplang mentah udang Bangka 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13135650711, '11b53335-9321-4faf-bbd9-b9804382ba69']);
		count++;

		// Local: Kemplang Panggang 323 -> Shopee: Kemplang panggang Bangka cap Sanjaya
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19417356194, 'a9900000-0000-0000-0000-000000000039']);
		count++;

		// Local: Kemplang Panggang 33 Besar -> Shopee: KEMPLANG PANGGANG 33 / KEMPLANG KERUPUK KHAS BANGKA
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4866259091, 'a9900000-0000-0000-0000-000000000038']);
		count++;

		// Local: Kemplang Panggang 33 Kecil -> Shopee: Kemplang panggang Bangka cap 33 kecil bantat
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [16779113761, 'a9900000-0000-0000-0000-000000000037']);
		count++;

		// Local: Kemplang Panggang Sanjaya Besar -> Shopee: Kemplang panggang Bangka cap Sanjaya
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19417356194, 'a9900000-0000-0000-0000-000000000040']);
		count++;

		// Local: Kemplang goreng pasir Achon Bantet -> Shopee: Kemplang goreng pasir Bangka cap Achon
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13739159829, 'a9900000-0000-0000-0000-000000000025']);
		count++;

		// Local: Kemplang goreng pasir Achon Besar -> Shopee: Kemplang goreng pasir Bangka cap Achon
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13739159829, 'a9900000-0000-0000-0000-000000000027']);
		count++;

		// Local: Kemplang goreng pasir Achon Kecil -> Shopee: Kemplang goreng pasir Bangka cap Achon
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13739159829, 'a9900000-0000-0000-0000-000000000026']);
		count++;

		// Local: Kemplang goreng pasir Asui Lebar -> Shopee: Kemplang goreng pasir lebar cap enak produksi Asui Sungailiat
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [27058611274, 'a9900000-0000-0000-0000-000000000022']);
		count++;

		// Local: Kemplang goreng pasir Tjokro Hijau -> Shopee: KEMPLANG GORENG PASIR TJOKRO / KEMPLANG KERUPUK KHAS BANGKA
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4066269485, 'a9900000-0000-0000-0000-000000000016']);
		count++;

		// Local: Keripik Pisang Manis@150g -> Shopee: Keripik Pisang Kepok Manis
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14865304003, 'a9900000-0000-0000-0000-000000000119']);
		count++;

		// Local: Keripik Pisang Manis@200g -> Shopee: Keripik Pisang Kepok Manis
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14865304003, '3a248fb5-8f0e-4fe8-905c-58976e47114f']);
		count++;

		// Local: Keripik Singkong Balado berat 200 gram -> Shopee: Keripik Singkong Balado  berat 200 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [56906935974, 'a9900000-0000-0000-0000-000000000120']);
		count++;

		// Local: Keripik Singkong Original@200g -> Shopee: Keripik Singkong Original berat 200 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [46656956187, 'a9900000-0000-0000-0000-000000000121']);
		count++;

		// Local: Keripik Tempe Kotak -> Shopee: Keripik Tempe berat 150 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [54406932360, 'a9900000-0000-0000-0000-000000000002']);
		count++;

		// Local: Keripik Tempe bulat -> Shopee: Keripik Tempe berat 150 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [54406932360, 'a9900000-0000-0000-0000-000000000122']);
		count++;

		// Local: Kerupuk  dakota Bawang Mentah Polos 1 ball 5 kg -> Shopee: Kerupuk mentah Bawang Polos 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [17930044586, 'ff36289e-be2d-424a-b28e-87821f38dc24']);
		count++;

		// Local: Kerupuk / Kemplang Ikan Ampera 89 500g -> Shopee: Kerupuk/kemplang ikan  Ampera 89 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [27923500164, 'a9900000-0000-0000-0000-000000000123']);
		count++;

		// Local: Kerupuk Bawang  Bibir mentah 1 ball berat 5 kg -> Shopee: Kerupuk mentah bawang bibir 1 ball berat  5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [3652116200, 'dbca4974-78ec-43e2-8d50-48b10f692558']);
		count++;

		// Local: Kerupuk Bawang Bentuk Kancing 1 Ball 5kg -> Shopee: Kerupuk bawang bentuk kancing 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [25170588611, 'a9900000-0000-0000-0000-000000000124']);
		count++;

		// Local: Kerupuk Bawang Bibir Mentah 3kg -> Shopee: Kerupuk bawang bibir mentah 3 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [7552017952, 'a9900000-0000-0000-0000-000000000127']);
		count++;

		// Local: Kerupuk Bawang Mentah Polos 1 Ball 3kg -> Shopee: Kerupuk mentah Bawang Polos 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [17930044586, 'a9900000-0000-0000-0000-000000000131']);
		count++;

		// Local: Kerupuk Hanoman Bawang Polos 5 kg -> Shopee: Kerupuk mentah Bawang Polos 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [17930044586, 'c74d46f5-922b-446a-a075-88fe65747da3']);
		count++;

		// Local: Kerupuk Hanoman Sari Udang Orange Muda 5 kg -> Shopee: Kerupuk mentah Sari Udang warna orange muda 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [49858139261, '4ee09a50-3daf-496e-a3be-59dc9e85fb52']);
		count++;

		// Local: Kerupuk Hanoman Sari Udang Orange Tua 1 ball 5 kg -> Shopee: Kerupuk mentah Sari Udang warna orange tua 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [23747704683, '4bd45333-bcb8-493b-8616-eedda063e599']);
		count++;

		// Local: Kerupuk Jengkol Bulat 1 Ball 5kg -> Shopee: Kerupuk jengkol bulat 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13097114963, 'a9900000-0000-0000-0000-000000000137']);
		count++;

		// Local: Kerupuk Jengkol Bulat 1kg -> Shopee: Kerupuk jengkol bulat 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [9798392584, 'a9900000-0000-0000-0000-000000000138']);
		count++;

		// Local: Kerupuk Jengkol Sisir 1kg -> Shopee: Kerupuk jengkol sisir 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14750280231, 'a9900000-0000-0000-0000-000000000143']);
		count++;

		// Local: Kerupuk Keriting Mawar Warna Warni Mentah 500g -> Shopee: kerupuk keriting mawar warna warni mentah 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [7853181664, 'a9900000-0000-0000-0000-000000000151']);
		count++;

		// Local: Kerupuk Keriting Mawar Warna Warni mentah 5kg -> Shopee: kerupuk keriting mawar warna warni mentah 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4453189980, 'a9900000-0000-0000-0000-000000000149']);
		count++;

		// Local: Kerupuk Keriting Mentah Palembang 1 kg -> Shopee: kerupuk keriting ikan Palembang mentah 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [6853177317, '67ca53a0-0e6d-4720-9a98-9e2bbb600fef']);
		count++;

		// Local: Kerupuk Keriting Mentah mini Palembang 250 gr -> Shopee: Kerupuk keriting mentah ukuran mini Ampera 89 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [29623493022, 'bf1c3fb6-89b4-4846-8def-580971ef8d87']);
		count++;

		// Local: Kerupuk Keriting ikan Mentah Palembang sedang 500 gr -> Shopee: Kerupuk Keriting Ikan Mentah Palembang 500 Gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [5524336228, '287fcff3-7aa7-4789-b0c0-942bf82960f9']);
		count++;

		// Local: Kerupuk Keriting palembang  Mentah Ukuran Mini 1kg -> Shopee: kerupuk keriting ikan Palembang mentah 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [6853177317, 'a9900000-0000-0000-0000-000000000152']);
		count++;

		// Local: Kerupuk Mentah Bangka Super Mini Ikan Tenggiri 500g -> Shopee: Kerupuk mentah Bangka super ukuran mini  ikan tenggiri 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26984018503, 'a9900000-0000-0000-0000-000000000158']);
		count++;

		// Local: Kerupuk Mentah Bangka Super Ukuran Mini Ikan Tenggiri 1kg -> Shopee: kerupuk mentah Bangka ikan tenggiri yang biasa ukuran mini 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [40909842575, 'a9900000-0000-0000-0000-000000000159']);
		count++;

		// Local: Kerupuk Mentah Rasa Bawang Bentuk Kancing 1kg -> Shopee: Kerupuk mentah rasa bawang bentuk  kancing 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [17235862796, 'a9900000-0000-0000-0000-000000000167']);
		count++;

		// Local: Kerupuk Mentah Sari Udang Warna Orange Tua 1 Ball 5kg -> Shopee: Kerupuk mentah Sari Udang warna orange tua 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [23747704683, 'a9900000-0000-0000-0000-000000000171']);
		count++;

		// Local: Kerupuk Mentah Tersanjung 1 kg -> Shopee: kerupuk tersanjung mentah 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4558646586, '2fef7769-c0e4-457f-bdc0-bbc6ab7a0e46']);
		count++;

		// Local: Kerupuk Mentah Tersanjung 500g -> Shopee: Kerupuk mentah tersanjung 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [40709839993, 'a9900000-0000-0000-0000-000000000172']);
		count++;

		// Local: Kerupuk Mie Kuning Mentah Ukuran Mini 500g -> Shopee: kerupuk mie kuning mentah ukuran mini 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [9638337615, 'a9900000-0000-0000-0000-000000000174']);
		count++;

		// Local: Kerupuk Mie Kuning Mentah Ukuran Sedang 1kg -> Shopee: Kerupuk mie kuning mentah ukuran sedang 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [9138329497, 'a9900000-0000-0000-0000-000000000175']);
		count++;

		// Local: Kerupuk Mie Kuning Mentah Ukuran Sedang 500g -> Shopee: kerupuk mie kuning mentah  500 gram ukuran sedang
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [8838324747, 'a9900000-0000-0000-0000-000000000176']);
		count++;

		// Local: Kerupuk Mie Kuning Ukuran Mini Mentah 1kg -> Shopee: kerupuk mie kuning ukuran mini mentah 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [5052408733, 'a9900000-0000-0000-0000-000000000177']);
		count++;

		// Local: Kerupuk Sari Udang  mentah warna Orange Muda 1 Kg -> Shopee: Kerupuk Sari udang mentah warna orange muda 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [20223142340, '8f437db9-640e-4498-a1ee-c5dd7cd1c283']);
		count++;

		// Local: Kerupuk Sari Udang Ampera 89 Warna Putih 1 Ball 5kg -> Shopee: Kerupuk sari udang Ampera 89 warna putih 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19514257996, 'a9900000-0000-0000-0000-000000000181']);
		count++;

		// Local: Kerupuk Sari Udang Ampera 89 warna  Putih 1kg -> Shopee: Kerupuk sari udang Ampera 89 warna putih 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19914266793, 'a9900000-0000-0000-0000-000000000179']);
		count++;

		// Local: Kerupuk Sari Udang Ampera 89 warna Putih 500gram -> Shopee: Kerupuk sari udang Ampera 89 warna putih 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14388564103, 'a9900000-0000-0000-0000-000000000180']);
		count++;

		// Local: Kerupuk Sari Udang Orange Tua dakota di repack 1kg -> Shopee: Kerupuk Sari Udang warna orange tua di repack 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [23247713642, 'a9900000-0000-0000-0000-000000000182']);
		count++;

		// Local: Kerupuk Sari Udang Warna Orange Muda Mentah 500 Gr -> Shopee: Kerupuk sari udang warna orange muda mentah 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19923147556, '7975c59b-eb0a-42fc-8ed2-5ca4c29cac69']);
		count++;

		// Local: Kerupuk Sari Udang warna Orange Tua di repack 500g -> Shopee: Kerupuk Sari udang warna orange tua di repack 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [17198062204, 'a9900000-0000-0000-0000-000000000183']);
		count++;

		// Local: Kerupuk Sisir Warna 1 Ball 5kg -> Shopee: Kerupuk Sisir warna 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [22447712134, 'a9900000-0000-0000-0000-000000000140']);
		count++;

		// Local: Kerupuk Tempe 1 kg -> Shopee: Kerupuk tempe mentah 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [20723130744, 'dab3babd-dd1f-443f-a150-c22683abe6c3']);
		count++;

		// Local: Kerupuk Tempe 250g -> Shopee: Kerupuk tempe mentah 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [21423138463, 'a9900000-0000-0000-0000-000000000186']);
		count++;

		// Local: Kerupuk Tempe 500 gr -> Shopee: Kerupuk tempe mentah 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [18623137304, 'eb145fa7-dcc2-4bda-bff1-4a18aea01bd7']);
		count++;

		// Local: Kerupuk Terasi Putih Berat 1 kg -> Shopee: Kerupuk mentah  putih bentuk lidah 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14468669211, '907e233f-e8a5-46e5-9496-1537a4502699']);
		count++;

		// Local: Kerupuk Warna Warni Bentuk Kepang / Rantai 500g -> Shopee: Kerupuk warna warni bentuk kepang/rantai 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [21556817314, 'a9900000-0000-0000-0000-000000000189']);
		count++;

		// Local: Kerupuk Warna-Warni Bentuk Kepang/Rantai 1 kg -> Shopee: Kerupuk warna warni bentuk kepang/rantai 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [20356818162, '8598e035-342f-41cc-9177-20e233732852']);
		count++;

		// Local: Kerupuk Warna-Warni Bentuk Kepang\Rantai 1ball 5 kg -> Shopee: Kerupuk warna warni bentuk kepang/rantai 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [20656818900, '9b03ae37-e6c4-4b5b-a7aa-7fb659fc8a46']);
		count++;

		// Local: Kerupuk bawang mentah bentuk  Angka 8 1 kg -> Shopee: Kerupuk bawang mentah bentuk angka 8 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19660542613, 'e902c5cd-e8d0-422f-9676-e1b28cf4d975']);
		count++;

		// Local: Kerupuk ikan item cap Rajawali -> Shopee: Kerupuk ikan item Bangka cap Rajawali
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [40707501764, 'a9900000-0000-0000-0000-000000000134']);
		count++;

		// Local: Kerupuk ikan putih cap Rajawali -> Shopee: Kerupuk ikan yang putih cap Rajawali
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26738598823, 'a9900000-0000-0000-0000-000000000136']);
		count++;

		// Local: Kerupuk jengkol sisir Warna Hitam berat 250 gram -> Shopee: Kerupuk jengkol sisir berat 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [29339043281, 'a9900000-0000-0000-0000-000000000142']);
		count++;

		// Local: Kerupuk keriting  Mawar biasa  Putih 5 kg -> Shopee: kerupuk keriting mawar biasa putih 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [7051833156, '07c41754-d452-4218-b0ce-27a780449b75']);
		count++;

		// Local: Kerupuk mentah Sari Udang Warna Orange Muda mentah 1 Ball 5kg -> Shopee: Kerupuk mentah Sari Udang warna orange muda 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [49858139261, 'a9900000-0000-0000-0000-000000000170']);
		count++;

		// Local: Kerupuk mentah putih bentuk lidah 1 kg -> Shopee: Kerupuk mentah  putih bentuk lidah 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14468669211, 'a9900000-0000-0000-0000-000000000165']);
		count++;

		// Local: Kerupuk warna-warni  Bentuk Kepang/Rantai 250 gram -> Shopee: Kerupuk warna warni bentuk kepang/rantai 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [19456818359, 'a9900000-0000-0000-0000-000000000162']);
		count++;

		// Local: Kopi Kingkong hitam 200gram -> Shopee: Kopi bubuk cap Kingkong kantong hitam 200 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [28757968314, 'a9900000-0000-0000-0000-000000000009']);
		count++;

		// Local: Kopi Kingkong hitam 400 grram -> Shopee: Kopi bubuk cap Kingkong kantong hitam 400 grram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26507964031, 'afb307a3-ec76-4a79-a7d1-9fe446f71222']);
		count++;

		// Local: Kue Bangkit / Kue Rintak bravery -> Shopee: Kue Bangkit/kue Rinta Bravery
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [12239195446, 'a9900000-0000-0000-0000-000000000007']);
		count++;

		// Local: Kue angka 8 cap Anugrah -> Shopee: Kue angka 8 cap Anugrah 200 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [29837175128, 'a9900000-0000-0000-0000-000000000200']);
		count++;

		// Local: Kue gamerose mini @160g -> Shopee: Kue gamerose mini 160 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [12339194772, 'a9900000-0000-0000-0000-000000000203']);
		count++;

		// Local: Kue masin 89@250g -> Shopee: Kue masin 89 berat 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26437180406, 'a9900000-0000-0000-0000-000000000205']);
		count++;

		// Local: Kuping Gajah@200gram -> Shopee: Snack Kuping  gajah berat 200 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [49862822157, 'a9900000-0000-0000-0000-000000000227']);
		count++;

		// Local: Madu Manis 1kg -> Shopee: MADU ASLI BANGKA  MADU MANIS  / MADU PAHIT 1KG - MADU PAHIT
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = 22917516514, updated_at = NOW() WHERE id = $2`, [4166392453, 'a9900000-0000-0000-0000-000000000212']);
		count++;

		// Local: Madu Pahit 1kg -> Shopee: MADU ASLI BANGKA  MADU MANIS  / MADU PAHIT 1KG - MADU PAHIT
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = 22917516514, updated_at = NOW() WHERE id = $2`, [4166392453, 'a9900000-0000-0000-0000-000000000011']);
		count++;

		// Local: Michang / Bipang / Cha Liau Bangka -> Shopee: Michang/Bipang/cha liau Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [14290421359, 'a9900000-0000-0000-0000-000000000214']);
		count++;

		// Local: Permen Gula Aren -> Shopee: Permen gula aren Bangka berat 100 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [46412820325, 'a9900000-0000-0000-0000-000000000217']);
		count++;

		// Local: Permen Hack@14 Pcs -> Shopee: Permen hack  isi 14 pcs
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [46012820417, 'a9900000-0000-0000-0000-000000000218']);
		count++;

		// Local: Sagu Tapioka Cap Kampung Tani kuning@500g -> Shopee: Tepung Tapioka/  sagu cap kampung Tani berat 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [53956932610, 'a9900000-0000-0000-0000-000000000236']);
		count++;

		// Local: Sagu Tapioka cap kampung tani@1 kg hijau -> Shopee: Tepung Tapioka/Sagu Tani kwalitas super cap kampung tanii berat 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [27787175046, 'a9900000-0000-0000-0000-000000000237']);
		count++;

		// Local: Sambal Balado Super Pedas 72 300 ml -> Shopee: Sambal balado 72 super pedas 300 ml
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [22468840350, '1cf38a77-4f3d-42f2-8736-e7f8a11ec4ae']);
		count++;

		// Local: Sikat Coklat Khas Bangka -> Shopee: Sikat coklat khas  Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [13975879606, 'a9900000-0000-0000-0000-000000000225']);
		count++;

		// Local: Stik keju/telur gabus 160g -> Shopee: Stik keju/telur gabus 160 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [11891016901, 'a9900000-0000-0000-0000-000000000231']);
		count++;

		// Local: Teng Teng Kacang -> Shopee: TENG TENG BANGKA KACANG BIASA – Teng teng KACANG KHAS BANGKA
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [2916890727, 'a9900000-0000-0000-0000-000000000235']);
		count++;

		// Local: Terasi AB No. 1 Pulau Bangka 100g -> Shopee: Terasi AB No. 1 pulau Bangka 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [10423085994, 'a9900000-0000-0000-0000-000000000238']);
		count++;

		// Local: Terasi AB No. 1 Pulau Bangka 500g -> Shopee: Terasi AB No. 1 pulau Bangka 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [10423085994, 'a9900000-0000-0000-0000-000000000239']);
		count++;

		// Local: getas  bulat cap 99 -> Shopee: Getas Bulat Cap 99 Makanan Khas Bangka
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4635451815, 'db53a02b-b1c5-461b-9aab-f638e022fcc2']);
		count++;

		// Local: kecap gajah cap siong besar -> Shopee: Kecap Istimewa cap Siong/Gajah
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4169047477, '92a0ad9d-0f55-4fde-beb3-35b078c67ddf']);
		count++;

		// Local: kerupuk keriting mawar warna-warni memntah 500 gram -> Shopee: kerupuk keriting mawar warna warni mentah 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [7853181664, '692e96bb-0471-4557-b514-c79bd97a1896']);
		count++;

		// Local: kerupuk keriting mawar warna-warni mentah 3 kg -> Shopee: kerupuk keriting mawar warna warni mentah 3 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [4353185504, 'db3e378c-ff7a-4fe8-8f07-acf5d57a65b0']);
		count++;

		// Local: kerupuk/kempelang udang mentah Bangka 1 kg -> Shopee: kerupuk/kempelang  udang mentah Bangka 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [5962000928, 'a9900000-0000-0000-0000-000000000191']);
		count++;

		// Local: kerupuk/kemplang ikan ampera 89 1 kg -> Shopee: Kerupuk/kemplang ikan  Ampera 89 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [27923500164, '5d1851fe-22e8-4e88-9a90-eb94308e4647']);
		count++;

		// Local: kerupuk/kemplang ikan ampera 89 1 kg mini tebal -> Shopee: Kerupuk/kemplang mentah sari udang ukuran mini Ampera 89 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26623495812, 'bf69d042-3c85-40ec-96a2-7f92d19522a5']);
		count++;

		// Local: kerupuk/kemplang ikan ampera 89 5 kg -> Shopee: Kerupuk/kemplang ikan  Ampera 89 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [27923500164, 'c14609b6-e5b4-44dd-9b94-91dcfcf7a00f']);
		count++;

		// Local: kerupuk/kemplang ikan ampera 89 5 kg mini tebal -> Shopee: Kerupuk Mentah Ikan Ampera 89 ukuran mini 1 ball 5 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [18091496953, '9231debf-2064-4155-8560-bf2cbefa3623']);
		count++;

		// Local: kerupuk/kemplang ikan ampera 89 500 gr mini tebal (putih) -> Shopee: Kerupuk/kemplang mentah sari udang ukuran mini Ampera 89 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26223486595, '799ac16f-65f2-4295-8a90-148f2286b599']);
		count++;

		// Local: kerupuk/kemplang udang ampera 89 1 kg mini tebal (putih) -> Shopee: Kerupuk/kemplang mentah sari udang ukuran mini Ampera 89 1 kg
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26623495812, '1bafa1c9-e667-450c-b487-4f6fb0ab64c7']);
		count++;

		// Local: kerupuk/kemplang udang ampera 89 250 gr mini tebal -> Shopee: Kerupuk/kemplang mentah sari udang Ampera 89 ukuran mini 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26720383651, '0df11b10-2d00-4beb-9d72-e1d8d6d99795']);
		count++;

		// Local: kerupuk/kemplang udang ampera 89 5 kg mini tebal -> Shopee: Kerupuk/kemplang mentah sari udang Ampera 89 ukuran mini 250 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26720383651, '3f5c7418-2c46-40ea-b784-4e1b7d011f97']);
		count++;

		// Local: kerupuk/kemplang udang ampera 89 500 gr mini tebal -> Shopee: Kerupuk/kemplang mentah sari udang ukuran mini Ampera 89 500 gram
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [26223486595, '453e8181-8151-49e5-ad62-65396b9ced15']);
		count++;

		return json({ success: true, message: `Berhasil menautkan ${count} produk secara otomatis!` });
	} catch (err: any) {
		return json({ error: err.message });
	}
};
