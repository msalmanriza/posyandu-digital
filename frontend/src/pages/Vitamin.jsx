import ServiceModule from "../components/ServiceModule";
import { todayString } from "../utils/helpers";
import { VITAMIN_LIST } from "../utils/constants";

const fields = [
  { name: "tanggal", label: "Tanggal Pemberian", type: "date", required: true },
  { name: "jenisVitamin", label: "Jenis Vitamin", type: "select", required: true, options: VITAMIN_LIST },
  { name: "catatan", label: "Catatan", type: "text", placeholder: "Catatan (opsional)" },
];

const columns = [
  { key: "peserta", label: "Peserta", render: (r) => r.peserta?.nama || "-" },
  { key: "jenisVitamin", label: "Jenis Vitamin" },
  { key: "catatan", label: "Catatan", render: (r) => r.catatan || "-" },
];

const initialForm = {
  peserta: "",
  tanggal: todayString(),
  jenisVitamin: "",
  catatan: "",
};

function Vitamin() {
  return (
    <ServiceModule
      apiPath="/vitamins"
      title="Vitamin"
      description="Catat pemberian vitamin kepada peserta posyandu."
      fields={fields}
      columns={columns}
      initialForm={initialForm}
    />
  );
}

export default Vitamin;