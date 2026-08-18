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

  if (bulan >= 0 && bulan <= 11) return "Bayi";
  if (bulan >= 12 && bulan <= 35) return "Batita";
  if (bulan >= 36 && bulan <= 119) return "Anak";

  const tahun = bulan / 12;
  if (tahun >= 10 && tahun < 19) return "Remaja";
  if (tahun >= 19 && tahun < 45) return "Dewasa";
  if (tahun >= 45 && tahun < 60) return "Pralansia";
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