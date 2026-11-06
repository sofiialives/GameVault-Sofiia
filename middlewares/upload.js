const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { httpError } = require("../utils");

const dossier = path.join(__dirname, "..", "uploads", "jaquettes");
if (!fs.existsSync(dossier)) fs.mkdirSync(dossier, { recursive: true });

const TYPES = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dossier),
    filename: (req, file, cb) => {
        cb(null, `${req.params.id}-${Date.now()}${TYPES[file.mimetype]}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (TYPES[file.mimetype]) return cb(null, true);
    cb(httpError(400, "Format accepté : JPEG, PNG ou WebP"));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 Mo
});

module.exports = upload;
