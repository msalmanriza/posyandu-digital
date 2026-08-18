import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function TrendChart({ data }) {
  const hasData = data.some((d) => d.rataBerat > 0 || d.rataTinggi > 0);

  if (!hasData) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl h-72 flex flex-col items-center justify-center text-gray-400">
        <div className="text-4xl mb-3">📈</div>
        <p className="font-medium">Belum ada data penimbangan</p>
        <p className="text-sm mt-1">
          Grafik tren akan tampil setelah ada penimbangan
        </p>
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="rataBerat"
            name="Rata-rata Berat Badan (kg)"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="rataTinggi"
            name="Rata-rata Tinggi Badan (cm)"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-sm">
        <span className="inline-flex items-center gap-2 text-gray-700">
          <span className="w-3 h-3 rounded-full bg-green-600"></span>
          Berat Badan (kg)
        </span>
        <span className="inline-flex items-center gap-2 text-gray-700">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          Tinggi Badan (cm)
        </span>
        <span className="text-xs text-gray-400">
          Arahkan kursor ke titik untuk melihat detail per bulan
        </span>
      </div>
    </>
  );
}

export default TrendChart;