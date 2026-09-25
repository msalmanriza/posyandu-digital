export const formatTanggal = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  const tgl = String(d.getDate()).padStart(2, "0");
  const bln = String(d.getMonth() + 1).padStart(2, "0");
  return `${tgl}/${bln}/${d.getFullYear()}`;
};

export const formatTanggalInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const tgl = String(d.getDate()).padStart(2, "0");
  const bln = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${bln}-${tgl}`;
};

export const todayString = () => {
  const d = new Date();
  const tgl = String(d.getDate()).padStart(2, "0");
  const bln = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${bln}-${tgl}`;
};

export const getKategoriUmur = (tanggalLahir) => {
  if (!tanggalLahir) return "Lainnya";
  const lahir = new Date(tanggalLahir);
  const now = new Date();
  const bulan =
    (now.getFullYear() - lahir.getFullYear()) * 12 +
    (now.getMonth() - lahir.getMonth());

  if (bulan >= 1 && bulan < 60) return "Balita";
  if (bulan >= 60 && bulan < 228) return "Apras";

  const tahun = bulan / 12;
  if (tahun >= 19 && tahun < 60) return "Produktif";
  if (tahun >= 60) return "Lansia";
  return "Lainnya";
};

export const hitungUmur = (tanggalLahir) => {
  if (!tanggalLahir) return "-";
  const lahir = new Date(tanggalLahir);
  const now = new Date();
  let tahun = now.getFullYear() - lahir.getFullYear();
  let bulan = now.getMonth() - lahir.getMonth();
  if (bulan < 0) {
    tahun--;
    bulan += 12;
  }
  return `${tahun} thn ${bulan} bln`;
};

export const hitungUmurPada = (tanggalLahir, tanggal) => {
  if (!tanggalLahir || !tanggal) return "-";
  const lahir = new Date(tanggalLahir);
  const tgl = new Date(tanggal);
  let tahun = tgl.getFullYear() - lahir.getFullYear();
  let bulan = tgl.getMonth() - lahir.getMonth();
  if (bulan < 0) {
    tahun--;
    bulan += 12;
  }
  return `${tahun} thn ${bulan} bln`;
};

export const hitungSkorBarthel = (items = {}) => {
  const bobot = { Tergantung: 0, "Perlu Bantuan": 1, Mandiri: 2 };
  const fields = [
    "makan",
    "mandi",
    "perawatanDiri",
    "berpakaian",
    "kontrolBAB",
    "kontrolBAK",
    "toileting",
    "berpindah",
    "berjalan",
    "naikTangga",
  ];
  return fields.reduce((total, key) => total + (bobot[items[key]] ?? 2), 0);
};

export const statusSkorBarthel = (skor) => {
  if (skor >= 15) return "Mandiri";
  if (skor >= 8) return "Ketergantungan Sedang";
  return "Ketergantungan Berat";
};

export const hitungIMT = (beratBadan, tinggiBadan) => {
  if (!beratBadan || !tinggiBadan || tinggiBadan <= 0) return null;
  const tbM = tinggiBadan / 100;
  return Math.round((beratBadan / (tbM * tbM)) * 10) / 10;
};

export const kategoriIMT = (imt) => {
  if (imt == null) return "";
  if (imt < 18.5) return "Kurus (BB Kurang)";
  if (imt < 23) return "Normal";
  if (imt < 25) return "Berat Badan Lebih (Overweight)";
  if (imt < 30) return "Obesitas I";
  return "Obesitas II";
};

export const kategoriTekananDarah = (sistolik, diastolik) => {
  if (!sistolik || !diastolik) return "";
  if (sistolik < 120 && diastolik < 80) return "Normal";
  if (sistolik < 140 && diastolik < 90) return "Pra-Hipertensi";
  if (sistolik < 160 && diastolik < 100) return "Hipertensi Derajat 1";
  return "Hipertensi Derajat 2";
};

export const kategoriGulaDarah = (gulaDarah) => {
  if (!gulaDarah) return "";
  if (gulaDarah < 140) return "Normal";
  if (gulaDarah < 200) return "Berisiko Diabetes (IGT)";
  return "Kemungkinan Diabetes Melitus";
};

export const skorPUMA = ({
  puKelamin = 0,
  puUsia = 0,
  puRokok = 0,
  puSesak = 0,
  puDahak = 0,
  puBatuk = 0,
  puSpirometri = 0,
} = {}) =>
  Number(puKelamin) +
  Number(puUsia) +
  Number(puRokok) +
  Number(puSesak) +
  Number(puDahak) +
  Number(puBatuk) +
  Number(puSpirometri);

export const kategoriPUMA = (skor) => {
  if (skor == null) return "";
  if (skor >= 5) return "Risiko Tinggi PPOK";
  return "Risiko Rendah";
};

export const hitungUmurTahun = (tanggalLahir) => {
  if (!tanggalLahir) return null;
  const lahir = new Date(tanggalLahir);
  const now = new Date();
  let tahun = now.getFullYear() - lahir.getFullYear();
  let bulan = now.getMonth() - lahir.getMonth();
  if (bulan < 0) {
    tahun -= 1;
    bulan += 12;
  }
  return tahun;
};

export const kategoriHb = (kadarHb, jenisKelamin, tanggalLahir) => {
  if (kadarHb == null || kadarHb <= 0 || !tanggalLahir) return "";
  const usia = hitungUmurTahun(tanggalLahir);
  if (usia == null) return "";

  let batasAnemia;
  if (usia < 12) batasAnemia = 11.5;
  else if (usia < 15) batasAnemia = 12.0;
  else batasAnemia = jenisKelamin === "L" ? 13.0 : 12.0;

  if (kadarHb >= batasAnemia) return "Normal";
  if (kadarHb >= 10) return "Anemia Ringan";
  if (kadarHb >= 7) return "Anemia Sedang";
  return "Anemia Berat";
};