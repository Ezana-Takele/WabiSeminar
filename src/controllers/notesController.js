const db = require("../config/database");


// CREATE NOTE
const createNote = async (req, res) => {
    try {
        const { id: meetingId } = req.params;
        const userId = req.user.id;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Note content cannot be empty"
            });
        }

        // Check meeting
        const [meetings] = await db.execute(
            "SELECT id FROM meetings WHERE id = ?",
            [meetingId]
        );

        if (meetings.length === 0) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        // Check active participant
        const [participants] = await db.execute(
            `SELECT id
             FROM meeting_participants
             WHERE meeting_id = ?
             AND user_id = ?
             AND left_at IS NULL`,
            [meetingId, userId]
        );

        if (participants.length === 0) {
            return res.status(403).json({
                message: "You must join the meeting before creating notes"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO notes
             (meeting_id, user_id, content)
             VALUES (?, ?, ?)`,
            [meetingId, userId, content.trim()]
        );

        const [newNote] = await db.execute(
            `SELECT
                n.id,
                n.meeting_id,
                n.user_id,
                u.name AS user_name,
                n.content,
                n.created_at,
                n.updated_at
             FROM notes n
             JOIN users u ON n.user_id = u.id
             WHERE n.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            message: "Note created successfully",
            note: newNote[0]
        });

    } catch (error) {
        console.error("Create note error:", error);

        res.status(500).json({
            message: "Server error while creating note"
        });
    }
};


// GET NOTES
const getNotes = async (req, res) => {
    try {
        const { id: meetingId } = req.params;
        const userId = req.user.id;

        const [meetings] = await db.execute(
            "SELECT id FROM meetings WHERE id = ?",
            [meetingId]
        );

        if (meetings.length === 0) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        const [participants] = await db.execute(
            `SELECT id
             FROM meeting_participants
             WHERE meeting_id = ?
             AND user_id = ?
             AND left_at IS NULL`,
            [meetingId, userId]
        );

        if (participants.length === 0) {
            return res.status(403).json({
                message: "You must join the meeting to view notes"
            });
        }

        const [notes] = await db.execute(
            `SELECT
                n.id,
                n.meeting_id,
                n.user_id,
                u.name AS user_name,
                n.content,
                n.created_at,
                n.updated_at
             FROM notes n
             JOIN users u ON n.user_id = u.id
             WHERE n.meeting_id = ?
             ORDER BY n.created_at ASC`,
            [meetingId]
        );

        res.json({
            notes
        });

    } catch (error) {
        console.error("Get notes error:", error);

        res.status(500).json({
            message: "Server error while fetching notes"
        });
    }
};


// UPDATE NOTE
const updateNote = async (req, res) => {
    try {
        const { id: meetingId, noteId } = req.params;
        const userId = req.user.id;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Note content cannot be empty"
            });
        }

        const [result] = await db.execute(
            `UPDATE notes
             SET content = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?
             AND meeting_id = ?
             AND user_id = ?`,
            [
                content.trim(),
                noteId,
                meetingId,
                userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Note not found or you are not allowed to edit it"
            });
        }

        res.json({
            message: "Note updated successfully"
        });

    } catch (error) {
        console.error("Update note error:", error);

        res.status(500).json({
            message: "Server error while updating note"
        });
    }
};


// DELETE NOTE
const deleteNote = async (req, res) => {
    try {
        const { id: meetingId, noteId } = req.params;
        const userId = req.user.id;

        const [result] = await db.execute(
            `DELETE FROM notes
             WHERE id = ?
             AND meeting_id = ?
             AND user_id = ?`,
            [
                noteId,
                meetingId,
                userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Note not found or you are not allowed to delete it"
            });
        }

        res.json({
            message: "Note deleted successfully"
        });

    } catch (error) {
        console.error("Delete note error:", error);

        res.status(500).json({
            message: "Server error while deleting note"
        });
    }
};


module.exports = {
    createNote,
    getNotes,
    updateNote,
    deleteNote
};