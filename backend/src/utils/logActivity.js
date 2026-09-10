import Log from "../models/Log.js";

const logActivity = async ({
  userId,
  namaUser,
  emailUser,
  role,
  modul,
  aksi,
  target,
}) => {
  try {
    await Log.create({
      user: userId,
      namaUser,
      emailUser,
      role,
      modul,
      aksi,
      target,
    });
  } catch (error) {
    console.error("Gagal mencatat aktivitas:", error.message);
  }
};

export default logActivity;
