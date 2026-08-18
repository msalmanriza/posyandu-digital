import ServiceModule from "../components/ServiceModule";
import { todayString } from "../utils/helpers";

const statusColors = {
  Hadir: "bg-primary-100 text-primary-700",
  "Tidak Hadir": "bg-red-100 text-red-700",
  Sakit: "bg-amber-100 text-amber-700",
  Izin: "bg-blue-100 text-blue-700",
};

const fields = [
  { name: "tanggal", label: "Tanggal Kehadiran", type: "date", required: true },
  {
    name: "statusKehadiran",
    label: "Status Kehadiran",
    type: "select",
    required: true,
    options: ["Hadir", "Tidak Hadir", "Sakit", "Izin"],
  },
];

const columns = [
  { key: "peserta", label: "Peserta", render: (r) => r.peserta?.nama || "-" },
  {
    key: "statusKehadiran",
    label: "Status",
    render: (r) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[r.statusKehadiran] || "bg-gray-100 text-gray-600"
        }`}
      >
        {r.statusKehadiran}
      </span>
    ),
  },
];

const initialForm = {
  peserta: "",
  tanggal: todayString(),
  statusKehadiran: "Hadir",
};

function Kehadiran() {
  return (
    <ServiceModule
      apiPath="/attendance"
      title="Kehadiran"
      description="Catat daftar kehadiran peserta posyandu."
      fields={fields}
      columns={columns}
      initialForm={initialForm}
    />
  );
}

export default Kehadiran;