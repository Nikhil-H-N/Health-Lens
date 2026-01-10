const multer = require("multer");
const path = require("path");

// 1️⃣ Storage location + filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/vaccinations");
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

// 2️⃣ File type validation (PDF / Images only)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and image files are allowed"), false);
    }
};

// 3️⃣ Export multer instance
const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;
