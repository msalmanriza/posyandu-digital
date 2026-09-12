import { useEffect, useState } from "react";
import api from "../services/api";
import { inputClass } from "./ui";
import { getKategoriUmur } from "../utils/helpers";

function PesertaSelect({ value, onChange, name = "peserta", filterKategori }) {
  const [pesertas, setPesertas] = useState([]);

  useEffect(() => {
    api
      .get("/peserta")
      .then(({ data }) => setPesertas(data))
      .catch(() => setPesertas([]));
  }, []);

  const list = filterKategori
    ? pesertas.filter((p) =>
        Array.isArray(filterKategori)
          ? filterKategori.includes(getKategoriUmur(p.tanggalLahir))
          : getKategoriUmur(p.tanggalLahir) === filterKategori
      )
    : pesertas;

  return (
    <select name={name} value={value} onChange={onChange} required className={inputClass}>
      <option value="">-- Pilih peserta --</option>
      {list.map((p) => (
        <option key={p._id} value={p._id}>
          {p.nama}
        </option>
      ))}
    </select>
  );
}

export default PesertaSelect;