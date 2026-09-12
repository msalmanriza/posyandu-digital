export const VAKSIN_LIST = [
  {
    label: "Saat Lahir (0 Bulan)",
    options: ["BCG", "Hepatitis B 0"],
  },
  {
    label: "1 Bulan",
    options: ["Polio 1"],
  },
  {
    label: "2 Bulan",
    options: ["DPT-HB-Hib 1", "Polio 2", "PCV 1"],
  },
  {
    label: "3 Bulan",
    options: ["DPT-HB-Hib 2", "Polio 3"],
  },
  {
    label: "4 Bulan",
    options: ["DPT-HB-Hib 3", "IPV (Polio Suntik)", "PCV 2"],
  },
  {
    label: "9 Bulan",
    options: ["Campak-Rubella (MR) Dosis 1", "Japanese Encephalitis (JE)"],
  },
  {
    label: "12 Bulan",
    options: ["Polio 4", "PCV 3 (Booster Pneumokokus)"],
  },
  {
    label: "18 Bulan",
    options: [
      "DPT-HB-Hib Lanjutan (Booster 18 Bulan)",
      "Campak-Rubella (MR) Lanjutan (Booster 18 Bulan)",
    ],
  },
  "Lainnya",
];

export const VITAMIN_LIST = [
  {
    label: "Vitamin A",
    options: [
      "Vitamin A Biru (Usia 6 - 11 Bulan)",
      "Vitamin A Merah (Usia 1 - 5 Tahun / 12 - 59 Bulan)",
      "Obat Cacing & Vitamin A (Paket Integrasi Anak 1-5 Tahun)",
    ],
  },
  {
    label: "Suplemen Lainnya",
    options: [
      "Suplemen Zat Besi (Fe) / Zink Anak",
      "Multivitamin / Vitamin B Kompleks",
    ],
  },
  "Lainnya",
];

export const RIWAYAT_PENYAKIT_LANSIA = [
  "Tidak Ada",
  "Hipertensi",
  "Diabetes Melitus",
  "Penyakit Jantung",
  "Stroke",
  "Asma / PPOK",
  "Gangguan Ginjal",
  "Rematik / Nyeri Sendi",
  "Kolesterol Tinggi",
  "Lainnya",
];

export const BARTH_ITEM_LIST = [
  { name: "makan", label: "Makan" },
  { name: "mandi", label: "Mandi" },
  { name: "perawatanDiri", label: "Perawatan diri (berdandan / bersisir)" },
  { name: "berpakaian", label: "Berpakaian" },
  { name: "kontrolBAB", label: "Kontrol buang air besar" },
  { name: "kontrolBAK", label: "Kontrol buang air kecil" },
  { name: "toileting", label: "Ke toilet / membersihkan diri" },
  { name: "berpindah", label: "Berpindah dari tempat tidur ke kursi" },
  { name: "berjalan", label: "Berjalan di permukaan datar" },
  { name: "naikTangga", label: "Naik turun tangga" },
];

export const STATUS_BARTHEL = ["Tergantung", "Perlu Bantuan", "Mandiri"];

export const SKRINING_LANSIA_OPTS = {
  merokok: ["Ya", "Tidak"],
  kognitif: ["Normal", "Perlu Evaluasi Kognitif"],
  mobilitas: ["Mandiri", "Perlu Bantuan", "Tergantung"],
  malnutrisi: ["Normal", "Berisiko Malnutrisi", "Malnutrisi"],
  pancaIndra: ["Baik", "Gangguan"],
  kesimpulan: ["Sehat / Mandiri", "Perlu Pemantauan", "Rujuk ke Puskesmas"],
};

export const PENYAKIT_DEWASA_LIST = [
  "Tidak Ada",
  "Hipertensi",
  "Diabetes Melitus",
  "Stroke",
  "Penyakit Jantung",
  "Asma",
  "Kolesterol Tinggi",
  "Lainnya",
];

export const YA_TIDAK = ["Ya", "Tidak"];

export const JENIS_KUNJUNGAN_DEWASA = [
  "Rutin Bulanan",
  "Berkala 6 Bulan",
  "Berkala Tahunan",
];

export const PANCA_INDRA_DEWASA = ["Normal", "Gangguan"];

export const GEJALA_TBC_LIST = [
  { name: "gejalaBatuk", label: "Batuk > 2 minggu" },
  { name: "gejalaDemam", label: "Demam > 2 minggu" },
  { name: "penurunanBeratBadan", label: "Penurunan berat badan" },
  { name: "kontakTBC", label: "Kontak erat pasien TBC" },
];

export const PUMA_ROKOK_OPTS = [
  { value: 0, label: "Tidak / < 20 pack-year (0)" },
  { value: 1, label: "20 - 30 pack-year (1)" },
  { value: 2, label: "> 30 pack-year (2)" },
];

export const PUMA_YA_TIDAK_OPTS = [
  { value: 0, label: "Tidak (0)" },
  { value: 1, label: "Ya (1)" },
];

export const PUMA_PERTANYAAN = [
  { name: "puRokok", label: "Riwayat merokok (pack-year)" },
  { name: "puSesak", label: "Pernah merasa napas pendek saat berjalan lebih cepat di jalan datar / sedikit menanjak?" },
  { name: "puDahak", label: "Biasanya mempunyai dahak dari paru / sulit mengeluarkan dahak (saat tidak flu)?" },
  { name: "puBatuk", label: "Biasanya batuk (saat tidak menderita flu)?" },
  { name: "puSpirometri", label: "Pernah disarankan pemeriksaan spirometri / peak flow meter oleh tenaga medis?" },
];