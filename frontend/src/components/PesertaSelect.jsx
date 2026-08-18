import { useEffect, useState } from "react";
import api from "../services/api";
import { inputClass } from "./ui";

function PesertaSelect({ value, onChange, name = "peserta" }) {
  const [pesertas, setPesertas] = useState([]);

  useEffect(() => {
    api
      .get("/peserta")
      .then(({ data }) => setPesertas(data))
      .catch(() => setPesertas([]));
  }, []);

  return (
    <select name={name} value={value} onChange={onChange} required className={inputClass}>
      <option value="">-- Pilih peserta --</option>
      {pesertas.map((p) => (
        <option key={p._id} value={p._id}>
          {p.nama}
        </option>
      ))}
    </select>
  );
}

export default PesertaSelect;