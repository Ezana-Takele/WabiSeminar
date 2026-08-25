const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    createNote,
    getNotes,
    updateNote,
    deleteNote
} = require("../controllers/notesController");


// Create note
router.post(
    "/:id/notes",
    authenticateToken,
    createNote
);

// Get notes
router.get(
    "/:id/notes",
    authenticateToken,
    getNotes
);

// Update note
router.put(
    "/:id/notes/:noteId",
    authenticateToken,
    updateNote
);

// Delete note
router.delete(
    "/:id/notes/:noteId",
    authenticateToken,
    deleteNote
);

module.exports = router;