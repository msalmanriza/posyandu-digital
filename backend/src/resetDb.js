import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import connectDB from "./config/db.js";
import {
  resetDataCollections,
  purgeUsers,
  seedDefaultUsers,
} from "./utils/dbReset.js";

dotenv.config();

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);

const ask = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });

const run = async () => {
  if (flag("--seed")) {
    await connectDB();
    console.log("\n🌱  Menyiapkan akun default Admin & Kader...");
    const created = await seedDefaultUsers();
    created.forEach((u) =>
      console.log(`    - ${u.email} (${u.role}) : ${u.status}`)
    );
    await mongoose.disconnect();
    console.log(
      "\n✅  Seeding selesai. Segera ganti password default setelah login pertama.\n"
    );
    process.exit(0);
  }

  const force = flag("--yes") || flag("--force");
  if (!force) {
    const jawab = await ask(
      "⚠️  PERINGATAN: Seluruh data akan dihapus permanen (tidak dapat dikembalikan).\nKetik 'RESET' untuk melanjutkan: "
    );
    if (jawab.trim() !== "RESET") {
      console.log("🚫 Dibatalkan. Tidak ada data yang dihapus.");
      process.exit(0);
    }
  }

  await connectDB();

  const purgeUser = flag("--purge-users");

  console.log("\n🧹  Membersihkan seluruh data...");
  const results = await resetDataCollections();
  results.forEach((r) =>
    console.log(`    - ${r.collection}: ${r.deletedCount} dokumen dihapus`)
  );

  if (purgeUser) {
    const n = await purgeUsers();
    console.log(`    - User (akun login): ${n} akun dihapus`);
    console.log("\n🌱  Membuat ulang akun default Admin & Kader...");
    const created = await seedDefaultUsers();
    created.forEach((u) =>
      console.log(`    - ${u.email} (${u.role}) : ${u.status}`)
    );
  } else {
    console.log(
      "    - User (akun login): DIKELUARKAN, tetap aman dan tidak dihapus"
    );
  }

  await mongoose.disconnect();
  console.log(
    "\n✅  Pembersihan data selesai. Database siap untuk produksi / live.\n"
  );
  console.log(
    "ℹ️  Catatan: akun login (User) dipertahankan secara default. Gunakan flag "
  );
  console.log(
    "   --purge-users untuk ikut menghapus semua akun dan seed ulang default.\n"
  );
  process.exit(0);
};

run().catch(async (err) => {
  console.error("❌  Gagal reset database:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});