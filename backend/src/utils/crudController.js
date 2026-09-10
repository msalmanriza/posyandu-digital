import logActivity from "./logActivity.js";

const crudController = (Model, options = {}) => {
  const {
    searchFields = [],
    searchRefs = [],
    populate = null,
    activity = null,
  } = options;

  const recordActivity = (req, aksi, doc) => {
    if (!activity) return;
    return logActivity({
      userId: req.user?._id,
      namaUser: req.user?.nama,
      emailUser: req.user?.email,
      role: req.user?.role,
      modul: activity.modul,
      aksi,
      target: activity.target ? activity.target(doc) : "",
    });
  };

  const getList = async (req, res) => {
    try {
      const { search, tanggal, peserta } = req.query;
      const filter = {};

      if (tanggal) {
        const start = new Date(`${tanggal}T00:00:00.000Z`);
        const end = new Date(`${tanggal}T23:59:59.999Z`);
        filter.tanggal = { $gte: start, $lte: end };
      }
      if (peserta) {
        filter.peserta = peserta;
      }

      if (search) {
        const ors = searchFields.map((field) => ({
          [field]: { $regex: search, $options: "i" },
        }));
        for (const ref of searchRefs) {
          const ids = await ref.Model.find({
            [ref.field]: { $regex: search, $options: "i" },
          }).distinct("_id");
          ors.push({ [ref.path]: { $in: ids } });
        }
        if (ors.length) {
          filter.$or = ors;
        }
      }

      let query = Model.find(filter).sort({ tanggal: -1, createdAt: -1 });
      if (populate) {
        query = query.populate(populate);
      }
      res.json(await query);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const getById = async (req, res) => {
    try {
      let query = Model.findById(req.params.id);
      if (populate) {
        query = query.populate(populate);
      }
      const doc = await query;
      if (!doc) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
      res.json(doc);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const create = async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      let query = Model.findById(doc._id);
      if (populate) {
        query = query.populate(populate);
      }
      const full = await query;
      await recordActivity(
        req,
        activity?.aksi?.create || `menambah ${activity?.modul || "data"}`,
        full
      );
      res.status(201).json(full);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  const update = async (req, res) => {
    try {
      let query = Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (populate) {
        query = query.populate(populate);
      }
      const doc = await query;
      if (!doc) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
      await recordActivity(
        req,
        activity?.aksi?.update || `mengubah ${activity?.modul || "data"}`,
        doc
      );
      res.json(doc);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  const remove = async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }
      await recordActivity(
        req,
        activity?.aksi?.delete || `menghapus ${activity?.modul || "data"}`,
        doc
      );
      res.json({ message: "Data berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  return { getList, getById, create, update, remove };
};

export default crudController;