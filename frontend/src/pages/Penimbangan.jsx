import ServiceModule from "../components/ServiceModule";
import { todayString } from "../utils/helpers";
import { VAKSIN_LIST, VITAMIN_LIST } from "../utils/constants";

const fields = [
  { name: "tanggal", label: "Tanggal Penimbangan", type: "date", required: true },
  { name: "beratBadan", label: "Berat Badan (kg)", type: "number", required: true, step: "0.01", min: "0", placeholder: "Contoh: 9.5" },
  { name: "tinggiBadan", label: "Tinggi Badan (cm)", type: "number", step: "0.1", min: "0", placeholder: "Contoh: 75" },
  { name: "lingkarKepala", label: "Lingkar Kepala (cm)", type: "number", step: "0.1", min: "0", placeholder: "Contoh: 45" },
  { name: "lingkarLengan", label: "Lingkar Lengan (cm)", type: "number", step: "0.1", min: "0", placeholder: "Contoh: 15" },
  { name: "imunisasi", label: "Imunisasi yang Diberikan", type: "select", options: VAKSIN_LIST },
  { name: "vitamin", label: "Vitamin yang Diberikan", type: "select", options: VITAMIN_LIST },
  { name: "catatan", label: "Catatan", type: "text", placeholder: "Catatan (opsional)" },
];

const columns = [
  { key: "peserta", label: "Peserta", render: (r) => r.peserta?.nama || "-" },
  { key: "beratBadan", label: "Berat (kg)" },
  { key: "tinggiBadan", label: "Tinggi (cm)", render: (r) => r.tinggiBadan ?? "-" },
  { key: "lingkarKepala", label: "LK (cm)", render: (r) => r.lingkarKepala ?? "-" },
  { key: "lingkarLengan", label: "LL (cm)", render: (r) => r.lingkarLengan ?? "-" },
  { key: "imunisasi", label: "Imunisasi", render: (r) => r.imunisasi || "-" },
  { key: "vitamin", label: "Vitamin", render: (r) => r.vitamin || "-" },
  { key: "catatan", label: "Catatan", render: (r) => r.catatan || "-" },
];

const initialForm = {
  peserta: "",
  tanggal: todayString(),
  beratBadan: "",
  tinggiBadan: "",
  lingkarKepala: "",
  lingkarLengan: "",
  imunisasi: "",
  vitamin: "",
  catatan: "",
};

function Penimbangan() {
  return (
    <ServiceModule
      apiPath="/measurements"
      title="Penimbangan"
      description="Catat hasil penimbangan berat & tinggi badan peserta."
      fields={fields}
      columns={columns}
      initialForm={initialForm}
    />
  );
}

export default Penimbangan;