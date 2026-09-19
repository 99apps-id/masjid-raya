import { SUBDIR_MUROTTAL_BAWAAN } from "@/lib/murottal";

export interface Ayat {
  /** Nomor surah, dipakai untuk menyusun tautan audio murattal. */
  surahNomor: number;
  /** Nomor ayat pertama pada kutipan. */
  nomor: number;
  /** Nomor ayat terakhir bila kutipannya berupa rentang. */
  sampai?: number;
  surah: string;
  surahArab: string;
  ar: string;
  idn: string;
}

/**
 * Kurasi ayat pendek bermakna kuat untuk papan informasi masjid.
 * Teks Arab dan terjemahan mengikuti mushaf standar Indonesia.
 */
export const KUMPULAN_AYAT: Ayat[] = [
  {
    surahNomor: 1,
    nomor: 1,
    surah: "Al-Fatihah",
    surahArab: "الفاتحة",
    ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    idn: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.",
  },
  {
    surahNomor: 2,
    nomor: 152,
    surah: "Al-Baqarah",
    surahArab: "البقرة",
    ar: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    idn: "Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu. Bersyukurlah kepada-Ku dan janganlah kamu mengingkari (nikmat)-Ku.",
  },
  {
    surahNomor: 2,
    nomor: 186,
    surah: "Al-Baqarah",
    surahArab: "البقرة",
    ar: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    idn: "Dan apabila hamba-hamba-Ku bertanya kepadamu tentang Aku, maka sesungguhnya Aku dekat. Aku mengabulkan permohonan orang yang berdoa apabila dia berdoa kepada-Ku.",
  },
  {
    surahNomor: 2,
    nomor: 255,
    surah: "Al-Baqarah",
    surahArab: "البقرة",
    ar: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
    idn: "Allah, tidak ada tuhan selain Dia, Yang Mahahidup, Yang terus-menerus mengurus (makhluk-Nya). Dia tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi.",
  },
  {
    surahNomor: 2,
    nomor: 286,
    surah: "Al-Baqarah",
    surahArab: "البقرة",
    ar: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    idn: "Allah tidak membebani seseorang melainkan sesuai kesanggupannya.",
  },
  {
    surahNomor: 3,
    nomor: 139,
    surah: "Ali 'Imran",
    surahArab: "آل عمران",
    ar: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    idn: "Dan janganlah kamu merasa lemah dan jangan pula bersedih hati, sebab kamu paling tinggi (derajatnya) jika kamu orang beriman.",
  },
  {
    surahNomor: 4,
    nomor: 103,
    surah: "An-Nisa'",
    surahArab: "النساء",
    ar: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    idn: "Sungguh, shalat itu adalah kewajiban yang ditetapkan waktunya atas orang-orang yang beriman.",
  },
  {
    surahNomor: 5,
    nomor: 2,
    surah: "Al-Ma'idah",
    surahArab: "المائدة",
    ar: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ۖ وَلَا تَعَاوَنُوا عَلَى الْإِثْمِ وَالْعُدْوَانِ",
    idn: "Dan tolong-menolonglah kamu dalam (mengerjakan) kebajikan dan takwa, dan jangan tolong-menolong dalam berbuat dosa dan permusuhan.",
  },
  {
    surahNomor: 7,
    nomor: 56,
    surah: "Al-A'raf",
    surahArab: "الأعراف",
    ar: "إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ",
    idn: "Sungguh, rahmat Allah sangat dekat kepada orang yang berbuat kebaikan.",
  },
  {
    surahNomor: 13,
    nomor: 28,
    surah: "Ar-Ra'd",
    surahArab: "الرعد",
    ar: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    idn: "Yaitu orang-orang yang beriman dan hati mereka menjadi tenteram dengan mengingat Allah. Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.",
  },
  {
    surahNomor: 14,
    nomor: 7,
    surah: "Ibrahim",
    surahArab: "إبراهيم",
    ar: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    idn: "Dan (ingatlah) ketika Tuhanmu memaklumkan, “Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu.”",
  },
  {
    surahNomor: 16,
    nomor: 90,
    surah: "An-Nahl",
    surahArab: "النحل",
    ar: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَىٰ",
    idn: "Sesungguhnya Allah menyuruh (kamu) berlaku adil dan berbuat kebajikan, serta memberi bantuan kepada kerabat.",
  },
  {
    surahNomor: 17,
    nomor: 82,
    surah: "Al-Isra'",
    surahArab: "الإسراء",
    ar: "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ",
    idn: "Dan Kami turunkan dari Al-Qur'an (sesuatu) yang menjadi penawar dan rahmat bagi orang yang beriman.",
  },
  {
    surahNomor: 20,
    nomor: 14,
    surah: "Ta-Ha",
    surahArab: "طه",
    ar: "إِنَّنِي أَنَا اللَّهُ لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدْنِي وَأَقِمِ الصَّلَاةَ لِذِكْرِي",
    idn: "Sungguh, Aku ini Allah, tidak ada tuhan selain Aku, maka sembahlah Aku dan laksanakanlah shalat untuk mengingat-Ku.",
  },
  {
    surahNomor: 24,
    nomor: 35,
    surah: "An-Nur",
    surahArab: "النور",
    ar: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
    idn: "Allah (pemberi) cahaya (kepada) langit dan bumi.",
  },
  {
    surahNomor: 29,
    nomor: 69,
    surah: "Al-'Ankabut",
    surahArab: "العنكبوت",
    ar: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا ۚ وَإِنَّ اللَّهَ لَمَعَ الْمُحْسِنِينَ",
    idn: "Dan orang-orang yang berjihad untuk (mencari keridaan) Kami, Kami akan tunjukkan kepada mereka jalan-jalan Kami. Dan sungguh, Allah beserta orang-orang yang berbuat baik.",
  },
  {
    surahNomor: 30,
    nomor: 21,
    surah: "Ar-Rum",
    surahArab: "الروم",
    ar: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    idn: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
  },
  {
    surahNomor: 31,
    nomor: 17,
    surah: "Luqman",
    surahArab: "لقمان",
    ar: "يَا بُنَيَّ أَقِمِ الصَّلَاةَ وَأْمُرْ بِالْمَعْرُوفِ وَانْهَ عَنِ الْمُنكَرِ وَاصْبِرْ عَلَىٰ مَا أَصَابَكَ",
    idn: "Wahai anakku! Laksanakanlah shalat dan suruhlah (manusia) berbuat yang makruf dan cegahlah (mereka) dari yang mungkar, dan bersabarlah terhadap apa yang menimpamu.",
  },
  {
    surahNomor: 33,
    nomor: 41,
    surah: "Al-Ahzab",
    surahArab: "الأحزاب",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا",
    idn: "Wahai orang-orang yang beriman! Ingatlah kepada Allah dengan mengingat (nama-Nya) sebanyak-banyaknya.",
  },
  {
    surahNomor: 39,
    nomor: 53,
    surah: "Az-Zumar",
    surahArab: "الزمر",
    ar: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    idn: "Janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya Allah mengampuni dosa-dosa semuanya.",
  },
  {
    surahNomor: 40,
    nomor: 60,
    surah: "Ghafir",
    surahArab: "غافر",
    ar: "وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ",
    idn: "Dan Tuhanmu berfirman, “Berdoalah kepada-Ku, niscaya akan Aku perkenankan bagimu.”",
  },
  {
    surahNomor: 49,
    nomor: 10,
    surah: "Al-Hujurat",
    surahArab: "الحجرات",
    ar: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ",
    idn: "Sesungguhnya orang-orang mukmin itu bersaudara.",
  },
  {
    surahNomor: 49,
    nomor: 13,
    surah: "Al-Hujurat",
    surahArab: "الحجرات",
    ar: "إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ",
    idn: "Sesungguhnya yang paling mulia di antara kamu di sisi Allah ialah orang yang paling bertakwa.",
  },
  {
    surahNomor: 55,
    nomor: 60,
    surah: "Ar-Rahman",
    surahArab: "الرحمن",
    ar: "هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ",
    idn: "Tidak ada balasan untuk kebaikan selain kebaikan (pula).",
  },
  {
    surahNomor: 62,
    nomor: 9,
    surah: "Al-Jumu'ah",
    surahArab: "الجمعة",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ",
    idn: "Wahai orang-orang yang beriman! Apabila telah diseru untuk melaksanakan shalat pada hari Jumat, maka segeralah kamu mengingat Allah.",
  },
  {
    surahNomor: 63,
    nomor: 9,
    surah: "Al-Munafiqun",
    surahArab: "المنافقون",
    ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تُلْهِكُمْ أَمْوَالُكُمْ وَلَا أَوْلَادُكُمْ عَن ذِكْرِ اللَّهِ",
    idn: "Wahai orang-orang yang beriman! Janganlah harta bendamu dan anak-anakmu melalaikan kamu dari mengingat Allah.",
  },
  {
    surahNomor: 64,
    nomor: 11,
    surah: "At-Tagabun",
    surahArab: "التغابن",
    ar: "وَمَن يُؤْمِن بِاللَّهِ يَهْدِ قَلْبَهُ",
    idn: "Dan barang siapa beriman kepada Allah, niscaya Dia akan memberi petunjuk ke dalam hatinya.",
  },
  {
    surahNomor: 65,
    nomor: 2,
    sampai: 3,
    surah: "At-Talaq",
    surahArab: "الطلاق",
    ar: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۞ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    idn: "Dan barang siapa bertakwa kepada Allah, niscaya Dia akan membukakan jalan keluar baginya, dan Dia memberinya rezeki dari arah yang tidak disangka-sangkanya.",
  },
  {
    surahNomor: 67,
    nomor: 2,
    surah: "Al-Mulk",
    surahArab: "الملك",
    ar: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا",
    idn: "(Allah) yang menciptakan kematian dan kehidupan untuk menguji kamu, siapa di antara kamu yang lebih baik amalnya.",
  },
  {
    surahNomor: 87,
    nomor: 14,
    sampai: 15,
    surah: "Al-A'la",
    surahArab: "الأعلى",
    ar: "قَدْ أَفْلَحَ مَن تَزَكَّىٰ ۞ وَذَكَرَ اسْمَ رَبِّهِ فَصَلَّىٰ",
    idn: "Sungguh beruntung orang yang menyucikan diri (dengan beriman) dan mengingat nama Tuhannya, lalu dia shalat.",
  },
  {
    surahNomor: 93,
    nomor: 6,
    sampai: 8,
    surah: "Ad-Duha",
    surahArab: "الضحى",
    ar: "أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ ۞ وَوَجَدَكَ ضَالًّا فَهَدَىٰ ۞ وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ",
    idn: "Bukankah Dia mendapatimu sebagai seorang yatim, lalu Dia melindungimu? Dan Dia mendapatimu sebagai seorang yang bingung, lalu Dia memberi petunjuk. Dan Dia mendapatimu sebagai seorang yang kekurangan, lalu Dia memberi kecukupan.",
  },
  {
    surahNomor: 94,
    nomor: 5,
    sampai: 6,
    surah: "Al-Insyirah",
    surahArab: "الشرح",
    ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۞ إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    idn: "Maka sesungguhnya bersama kesulitan ada kemudahan. Sesungguhnya bersama kesulitan ada kemudahan.",
  },
  {
    surahNomor: 99,
    nomor: 7,
    sampai: 8,
    surah: "Az-Zalzalah",
    surahArab: "الزلزلة",
    ar: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ ۞ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ",
    idn: "Maka barang siapa mengerjakan kebaikan seberat zarah, niscaya dia akan melihat (balasan)-nya, dan barang siapa mengerjakan kejahatan seberat zarah, niscaya dia akan melihat (balasan)-nya.",
  },
  {
    surahNomor: 103,
    nomor: 1,
    sampai: 3,
    surah: "Al-'Asr",
    surahArab: "العصر",
    ar: "وَالْعَصْرِ ۞ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ۞ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
    idn: "Demi waktu, sungguh manusia berada dalam kerugian, kecuali orang-orang yang beriman dan mengerjakan kebajikan serta saling menasihati untuk kebenaran dan saling menasihati untuk kesabaran.",
  },
  {
    surahNomor: 108,
    nomor: 1,
    sampai: 2,
    surah: "Al-Kausar",
    surahArab: "الكوثر",
    ar: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۞ فَصَلِّ لِرَبِّكَ وَانْحَرْ",
    idn: "Sungguh, Kami telah memberimu (Muhammad) nikmat yang banyak. Maka laksanakanlah shalat karena Tuhanmu, dan berkurbanlah.",
  },
  {
    surahNomor: 112,
    nomor: 1,
    sampai: 4,
    surah: "Al-Ikhlas",
    surahArab: "الإخلاص",
    ar: "قُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    idn: "Katakanlah (Muhammad), “Dialah Allah, Yang Maha Esa. Allah yang menjadi tumpuan segala sesuatu. (Allah) tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia.”",
  },
  {
    surahNomor: 2,
    nomor: 201,
    surah: "Al-Baqarah",
    surahArab: "البقرة",
    ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    idn: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.",
  },
  {
    surahNomor: 3,
    nomor: 191,
    surah: "Ali 'Imran",
    surahArab: "آل عمران",
    ar: "الَّذِينَ يَذْكُرُونَ اللَّهَ قِيَامًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ",
    idn: "(Yaitu) orang-orang yang mengingat Allah sambil berdiri, duduk atau dalam keadaan berbaring, dan mereka memikirkan tentang penciptaan langit dan bumi.",
  },
  {
    surahNomor: 14,
    nomor: 40,
    surah: "Ibrahim",
    surahArab: "إبراهيم",
    ar: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    idn: "Ya Tuhanku, jadikanlah aku dan anak cucuku orang yang tetap melaksanakan shalat, ya Tuhan kami, perkenankanlah doaku.",
  },
  {
    surahNomor: 21,
    nomor: 87,
    surah: "Al-Anbiya'",
    surahArab: "الأنبياء",
    ar: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    idn: "Tidak ada tuhan selain Engkau, Mahasuci Engkau. Sungguh, aku termasuk orang-orang yang zalim.",
  },
  {
    surahNomor: 25,
    nomor: 74,
    surah: "Al-Furqan",
    surahArab: "الفرقان",
    ar: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    idn: "Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa.",
  },
  {
    surahNomor: 33,
    nomor: 56,
    surah: "Al-Ahzab",
    surahArab: "الأحزاب",
    ar: "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا",
    idn: "Sesungguhnya Allah dan para malaikat-Nya bershalawat untuk Nabi. Wahai orang-orang yang beriman! Bershalawatlah kamu untuk Nabi dan ucapkanlah salam dengan penuh penghormatan kepadanya.",
  },
  {
    surahNomor: 59,
    nomor: 23,
    surah: "Al-Hasyr",
    surahArab: "الحشر",
    ar: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ الْعَزِيزُ الْجَبَّارُ الْمُتَكَبِّرُ",
    idn: "Dialah Allah tidak ada tuhan selain Dia. Maharaja, Yang Mahasuci, Yang Mahasejahtera, Yang Menjaga Keamanan, Pemelihara Keselamatan, Yang Mahaperkasa, Yang Mahakuasa, Yang Memiliki Segala Keagungan.",
  },
  {
    surahNomor: 110,
    nomor: 1,
    sampai: 3,
    surah: "An-Nasr",
    surahArab: "النصر",
    ar: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ ۞ وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا ۞ فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ",
    idn: "Apabila telah datang pertolongan Allah dan kemenangan, dan engkau melihat manusia berbondong-bondong masuk agama Allah, maka bertasbihlah dengan memuji Tuhanmu dan mohonlah ampunan kepada-Nya.",
  },
  {
    surahNomor: 113,
    nomor: 1,
    sampai: 5,
    surah: "Al-Falaq",
    surahArab: "الفلق",
    ar: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
    idn: "Katakanlah, “Aku berlindung kepada Tuhan yang menguasai subuh (fajar), dari kejahatan (makhluk yang) Dia ciptakan, dan dari kejahatan malam apabila telah gelap gulita.”",
  },
  {
    surahNomor: 114,
    nomor: 1,
    sampai: 6,
    surah: "An-Nas",
    surahArab: "الناس",
    ar: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَٰهِ النَّاسِ ۞ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
    idn: "Katakanlah, “Aku berlindung kepada Tuhannya manusia, Raja manusia, Sembahan manusia, dari kejahatan (bisikan) setan yang bersembunyi.”",
  },
];

/** Nama lengkap rujukan, mis. "Al-Isra' : 82" atau "At-Talaq : 2–3". */
export function rujukanAyat(ayat: Ayat): string {
  const rentang = ayat.sampai ? `${ayat.nomor}–${ayat.sampai}` : `${ayat.nomor}`;
  return `${ayat.surah} : ${rentang}`;
}

function tigaDigit(nilai: number): string {
  return String(nilai).padStart(3, "0");
}

/**
 * Tautan murattal satu ayat dari EveryAyah. `subdir` menentukan suara
 * reciter (lihat lib/murottal.ts); bawaan: Mishary Rashid Alafasy 128 kbps.
 * Untuk kutipan berupa rentang, yang diputar adalah ayat pertamanya.
 * Untuk memutar seluruh rentang, pakai daftarUrlAudioAyat().
 */
export function urlAudioAyat(ayat: Ayat, subdir: string = SUBDIR_MUROTTAL_BAWAAN): string {
  const berkas = `${tigaDigit(ayat.surahNomor)}${tigaDigit(ayat.nomor)}`;
  return `https://everyayah.com/data/${subdir}/${berkas}.mp3`;
}

/**
 * Daftar putar murottal untuk satu kutipan: seluruh ayat dari `nomor`
 * sampai `sampai` (bila ada) diurutkan menaik, satu URL per ayat, semuanya
 * dengan suara reciter yang sama.
 * Batas pengaman 20 ayat agar rentang salah ketik tidak membanjiri jaringan.
 */
export function daftarUrlAudioAyat(
  ayat: Ayat,
  subdir: string = SUBDIR_MUROTTAL_BAWAAN
): string[] {
  const akhir = ayat.sampai ?? ayat.nomor;
  const mulai = Math.min(ayat.nomor, akhir);
  const selesai = Math.min(Math.max(ayat.nomor, akhir), mulai + 19);
  const daftar: string[] = [];
  for (let n = mulai; n <= selesai; n++) {
    const berkas = `${tigaDigit(ayat.surahNomor)}${tigaDigit(n)}`;
    daftar.push(`https://everyayah.com/data/${subdir}/${berkas}.mp3`);
  }
  return daftar;
}

/**
 * Daftar putar murottal satu surah penuh: ayat 1 sampai `jumlahAyat`,
 * semuanya dengan suara reciter yang sama. Dipakai mode surah penuh.
 */
export function daftarUrlAudioSurah(
  surahNomor: number,
  jumlahAyat: number,
  subdir: string = SUBDIR_MUROTTAL_BAWAAN
): string[] {
  const total = Math.min(Math.max(Math.floor(jumlahAyat), 0), 300);
  const daftar: string[] = [];
  for (let n = 1; n <= total; n++) {
    const berkas = `${tigaDigit(surahNomor)}${tigaDigit(n)}`;
    daftar.push(`https://everyayah.com/data/${subdir}/${berkas}.mp3`);
  }
  return daftar;
}

/** Ambil sejumlah ayat acak tanpa pengulangan. */
export function ambilAyatAcak(jumlah: number): Ayat[] {
  const salinan = [...KUMPULAN_AYAT];
  for (let i = salinan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [salinan[i], salinan[j]] = [salinan[j], salinan[i]];
  }
  return salinan.slice(0, Math.min(jumlah, salinan.length));
}
