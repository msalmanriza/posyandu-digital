import ServiceModule from "../components/ServiceModule";
import { todayString } from "../utils/helpers";
import { VAKSIN_LIST } from "../utils/constants";

const fields = [
  { name: "tanggal", label: "Tanggal Imunisasi", type: "date", required: true },
  { name: "jenisVaksin", label: "Jenis Vaksin", type: "select", required: true, options: VAKSIN_LIST },
  { name: "usiaBulan", label: "Usia (bulan)", type: "number", min: "0", placeholder: "Contoh: 6" },
];

const columns = [
  { key: "peserta", label: "Peserta", render: (r) => r.peserta?.nama || "-" },
  { key: "jenisVaksin", label: "Jenis Vaksin" },
  { key: "usiaBulan", label: "Usia (bln)", render: (r) => r.usiaBulan ?? "-" },
];

const initialForm = {
  peserta: "",
  tanggal: todayString(),
  jenisVaksin: "",
  usiaBulan: "",
};

function Imunisasi() {
  return (
    <ServiceModule
      apiPath="/immunizations"
      title="Imunisasi"
      description="Catat riwayat imunisasi peserta posyandu."
      fields={fields}
      columns={columns}
      initialForm={initialForm}
    />
  );
}

export default Imunisasi;