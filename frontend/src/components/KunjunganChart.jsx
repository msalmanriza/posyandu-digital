import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const FULL_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm min-w-[190px]">
      <p className="font-semibold text-gray-800 mb-1">
        Bulan {FULL_MONTHS[d.bulan - 1] || d.label} {d.tahun}
      </p>
      <p className="text-green-700">● {d.ditimbang} Anak Ditimbang</p>
      <p className="text-blue-700">● {d.kehadiran} Kehadiran</p>
    </div>
  );
};

function KunjunganChart({ data }) {
  const hasData = data.some((d) => d.ditimbang > 0 || d.kehadiran > 0);
  const maxVal = data.reduce(
    (mx, d) => Math.max(mx, d.ditimbang || 0, d.kehadiran || 0),
    0
  );
  const upper = Math.max(10, Math.ceil(maxVal / 10) * 10);
  const yTicks = Array.from({ length: upper / 10 + 1 }, (_, i) => i * 10);

  if (!hasData) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl h-72 flex flex-col items-center justify-center text-gray-400">
        <div className="text-4xl mb-3">📊</div>
        <p className="font-medium">Belum ada data kunjungan</p>
        <p className="text-sm mt-1">
          Grafik akan tampil setelah ada penimbangan &amp; kehadiran
        </p>
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          barGap={4}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            interval={0}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, upper]}
            ticks={yTicks}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={{ stroke: "#d1d5db" }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar
            dataKey="ditimbang"
            name="Total Balita Ditimbang"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
          />
          <Bar
            dataKey="kehadiran"
            name="Total Kehadiran"
            fill="#2563eb"
            radius={[4, 4, 0, 0]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-sm">
        <span className="inline-flex items-center gap-2 text-gray-700">
          <span className="w-3 h-3 rounded-sm bg-green-500"></span>
          Total Balita Ditimbang
        </span>
        <span className="inline-flex items-center gap-2 text-gray-700">
          <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
          Total Kehadiran Posyandu
        </span>
        <span className="text-xs text-gray-400">
          Arahkan kursor ke bar untuk melihat detail per bulan
        </span>
      </div>
    </>
  );
}

export default KunjunganChart;