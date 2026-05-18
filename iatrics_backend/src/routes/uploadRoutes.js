const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const uploadDir = path.join(process.cwd(), "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

router.post(
  "/consultation/:consultationId",
  protect,
  upload.single("file"),
  async (req, res) => {
    return res.status(201).json({
      success: true,
      message: "File uploaded",
      consultationId: req.params.consultationId,
      file: {
        filename: req.file.filename,
        path: req.file.path,
      },
    });
  }
);

module.exports = router;
