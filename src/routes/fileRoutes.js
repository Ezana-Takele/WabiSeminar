const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    uploadFile,
    getFiles,
    deleteFile
} = require("../controllers/fileController");


// Upload file
router.post(
    "/:id/files",
    authenticateToken,
    upload.single("file"),
    uploadFile
);


// Get meeting files
router.get(
    "/:id/files",
    authenticateToken,
    getFiles
);


// Delete file
router.delete(
    "/:id/files/:fileId",
    authenticateToken,
    deleteFile
);


module.exports = router;