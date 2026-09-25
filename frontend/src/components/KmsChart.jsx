import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  WHO_MALE,
  WHO_FEMALE,
  lookupRef,
  getKmsZone,
} from "../utils/kmsReference";

const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

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

const MAX_Y = 25;
const Y_TICKS = Array.from({ length: MAX_Y / 2 + 1 }, (_, i) => i * 2);
Y_TICKS.push(MAX_Y);

const ZONE_COLORS = {
  merahBawah: "#EF4444",
  kuningBawah: "#FDE047",
  hijauMuda: "#86EFAC",
  hijauTua: "#22C55E",
  kuningAtas: "#FACC15",
  merahAtas: "#DC2626",
};

const ZONES = [
  { key: "zM2", color: ZONE_COLORS.merahBawah, opacity: 0.5 },
  { key: "zM2toM1", color: ZONE_COLORS.kuningBawah, opacity: 0.5 },
  { key: "zM1toMed", color: ZONE_COLORS.hijauMuda, opacity: 0.5, stroke: "#22C55E" },
  { key: "zMedToP1", color: ZONE_COLORS.hijauTua, opacity: 0.55, stroke: "#16a34a" },
  { key: "zP1toP2", color: ZONE_COLORS.kuningAtas, opacity: 0.6 },
  { key: "zP2toTop", color: ZONE_COLORS.merahAtas, opacity: 0.4 },
];

function clampPositive(v) {
  return Math.max(0, v);
}

function parseTanggal(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(value);
  return isNaN(dt.getTime()) ? null : dt;
}

function hitungUsiaBulan(birth, tgl) {
  let bulan =
    (tgl.getFullYear() - birth.getFullYear()) * 12 +
    (tgl.getMonth() - birth.getMonth());
  if (tgl.getDate() < birth.getDate()) bulan -= 1;
  return Math.max(0, bulan);
}

function tanggalPanjang(d) {
  return `${d.getDate()} ${FULL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const CustomTooltip = ({ active, payload, sex }) => {
  if (!active || !payload?.length) return null;
  const pt = payload.find((p) => p.dataKey === "beratKg");
  const d = pt?.payload;
  if (!d || d.berat == null) return null;
  const zone = getKmsZone(d.berat, d.umurBln, sex);
  const isBaik = zone && (zone.key === "hijauMuda" || zone.key === "hijauTua");

  let status = "Naik";
  let statusChip = "bg-green-100 text-green-700";
  let selisihText = "";
  if (d.prevBerat != null) {
    const delta = Math.round((Number(d.berat) - Number(d.prevBerat)) * 100) / 100;
    const ref = d.prevSameMonth ? "penimbangan sebelumnya" : "bulan lalu";
    if (delta > 0) {
      status = "Naik";
      statusChip = "bg-green-100 text-green-700";
      selisihText = `+${delta.toFixed(1)} kg dari ${ref}`;
    } else if (delta === 0) {
      status = "Tetap";
      statusChip = "bg-gray-100 text-gray-600";
      selisihText = `Tidak ada perubahan dari ${ref}`;
    } else {
      status = "Perlu Perhatian";
      statusChip = "bg-red-100 text-red-700";
      selisihText = `${delta.toFixed(1)} kg dari ${ref} (BB turun)`;
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm min-w-[210px]">
      <p className="font-semibold text-gray-800">
        Penimbangan: {d.tanggalLabel || d.calendarLabel || "-"}
      </p>
      <p className="text-gray-600 mt-1">
        Usia Anak: {d.umurBln} Bulan ({d.umurLabel})
      </p>
      <p className="text-gray-600 mt-0.5">
        Berat Badan:{" "}
        <span className="font-semibold text-primary-700">{d.berat} kg</span>
      </p>
      <p className="text-gray-600 mt-0.5">
        Tinggi Badan:{" "}
        <span className="font-semibold text-gray-800">
          {d.tinggi != null ? `${d.tinggi} cm` : "-"}
        </span>
      </p>
      {d.prevBerat != null && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500">Status:</span>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${statusChip}`}
          >
            {status}
          </span>
          <span className="text-xs text-gray-500">{selisihText}</span>
        </div>
      )}
      <p
        className={`mt-1.5 font-medium ${
          isBaik ? "text-green-600" : "text-amber-600"
        }`}
      >
        Status Gizi: {isBaik ? "Gizi Baik" : "Perlu Perhatian"}
      </p>
    </div>
  );
};

function XAxisTick({ x, y, payload, birthMonth }) {
  const m = payload.value;
  const label = birthMonth != null ? MONTHS_ID[(birthMonth + m) % 12] : "";
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" dy={16} fontSize={8.5} fill="#9ca3af">
        {label}
      </text>
    </g>
  );
}

function KmsLegend() {
  const items = [
    { color: ZONE_COLORS.merahBawah, label: "BGM (Kurang)" },
    { color: ZONE_COLORS.kuningBawah, label: "Kuning (Waspada)" },
    { color: ZONE_COLORS.hijauMuda, border: ZONE_COLORS.hijauTua, label: "Hijau Muda (Normal)" },
    { color: ZONE_COLORS.hijauTua, label: "Hijau Tua (Ideal)" },
    { color: ZONE_COLORS.kuningAtas, label: "Kuning Atas (Waspada)" },
    { color: ZONE_COLORS.merahAtas, label: "Merah (Berlebih)" },
  ];

  return (
    <div className="mt-5 pt-4 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-400 mb-2">
        Keterangan Zona KMS (Berat/Umur)
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {items.map((it) => (
          <span key={it.label} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="inline-block w-3 h-3 rounded-[2px] border border-gray-300"
              style={{ backgroundColor: it.color, borderColor: it.border || "transparent" }}
            />
            {it.label}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Garis &amp; Titik Biru = Riwayat berat badan anak. Ketuk titik untuk
        detail.
      </p>
    </div>
  );
}

function KmsChart({
  data,
  birthDate,
  sex = "L",
  title = "Grafik Pertumbuhan (Berat Badan / Umur)",
}) {
  const formatUmur = (bln) => {
    if (bln == null) return "";
    const tahun = Math.floor(bln / 12);
    const sisa = bln % 12;
    if (tahun > 0 && sisa > 0) return `${tahun} th ${sisa} bl`;
    if (tahun > 0) return `${tahun} th`;
    return `${bln} bl`;
  };

  const birth = parseTanggal(birthDate);
  const birthMonth = birth ? birth.getMonth() : null;
  const birthStart = birth ? birth.getFullYear() * 12 + birth.getMonth() : null;
  const refData = sex === "P" ? WHO_FEMALE : WHO_MALE;

  const fullData = [];
  for (let m = 0; m <= 60; m++) {
    const ref = lookupRef(refData, m);
    const total = birthStart != null ? birthStart + m : null;
    fullData.push({
      umurBln: m,
      umurLabel: formatUmur(m),
      calendarLabel:
        total != null
          ? `${FULL_MONTHS[((total % 12) + 12) % 12]} ${Math.floor(total / 12)}`
          : "",
      zM2: clampPositive(ref.m2),
      zM2toM1: clampPositive(ref.m1 - ref.m2),
      zM1toMed: clampPositive(ref.med - ref.m1),
      zMedToP1: clampPositive(ref.p1 - ref.med),
      zP1toP2: clampPositive(ref.p2 - ref.p1),
      zP2toTop: clampPositive(MAX_Y - ref.p2),
      boundaryM2: ref.m2,
      boundaryP2: ref.p2,
      beratKg: null,
    });
  }

  const sorted = [...data]
    .filter((m) => m.beratBadan != null)
    .sort(
      (a, b) =>
        (parseTanggal(a.tanggal)?.getTime() || 0) -
        (parseTanggal(b.tanggal)?.getTime() || 0)
    );

  const chartData = fullData.map((row) => ({ ...row }));
  let prevMeas = null;
  sorted.forEach((m) => {
    const d = parseTanggal(m.tanggal);
    if (!d || !birth) return;
    const bulan = hitungUsiaBulan(birth, d);
    if (bulan < 0 || bulan > 60) return;
    const row = chartData[bulan];
    if (!row) return;
    const prevDate = prevMeas ? parseTanggal(prevMeas.tanggal) : null;
    row.berat = m.beratBadan;
    row.beratKg = m.beratBadan;
    row.tinggi = m.tinggiBadan ?? null;
    row.tanggalLabel = tanggalPanjang(d);
    row.prevBerat = prevMeas ? prevMeas.beratBadan : null;
    row.prevSameMonth =
      prevMeas && prevDate
        ? prevDate.getFullYear() === d.getFullYear() &&
          prevDate.getMonth() === d.getMonth()
        : false;
    prevMeas = m;
  });

  const ticks = Array.from({ length: 61 }, (_, i) => i);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-5 leading-relaxed">
        Grafik ini mencatat riwayat kenaikan berat badan anak setiap bulan untuk
        memastikan tumbuh kembangnya tetap sehat dan ideal.
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[900px]">
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis
                dataKey="umurBln"
                type="number"
                domain={[0, 60]}
                ticks={ticks}
                tick={<XAxisTick birthMonth={birthMonth} />}
                tickLine={{ stroke: "#d1d5db" }}
                axisLine={{ stroke: "#d1d5db" }}
                interval={0}
                maxRotation={0}
                height={28}
              />

              <YAxis
                domain={[0, MAX_Y]}
                ticks={Y_TICKS}
                tickFormatter={(v) => `${v} kg`}
                tick={{ fontSize: 11 }}
                tickLine={{ stroke: "#d1d5db" }}
                axisLine={{ stroke: "#d1d5db" }}
                width={55}
              />

              <Tooltip content={<CustomTooltip sex={sex} />} cursor={{ strokeDasharray: "3 3" }} />

              {ZONES.map((z) => (
                <Area
                  key={z.key}
                  type="monotone"
                  dataKey={z.key}
                  stackId="kms"
                  fill={z.color}
                  fillOpacity={z.opacity}
                  stroke={z.stroke || "none"}
                  strokeWidth={z.stroke ? 0.5 : 0}
                  isAnimationActive={false}
                  tooltipType="none"
                />
              ))}

              <Line
                type="monotone"
                dataKey="boundaryM2"
                stroke="#dc2626"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                tooltipType="none"
              />
              <Line
                type="monotone"
                dataKey="boundaryP2"
                stroke="#dc2626"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                tooltipType="none"
              />

              <Line
                type="monotone"
                dataKey="beratKg"
                stroke="#2563eb"
                strokeWidth={2.5}
                connectNulls
                dot={{ r: 6, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 9, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <KmsLegend />
    </div>
  );
}

export default KmsChart;