const db = require("../config/database");


// CREATE AGENDA ITEM
const createAgendaItem = async (req, res) => {
    try {
        const { id: meetingId } = req.params;
        const userId = req.user.id;
        const { title, position } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Agenda title is required"
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
                message: "You must join the meeting before adding agenda items"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO agenda_items
             (meeting_id, created_by, title, completed, position)
             VALUES (?, ?, ?, ?, ?)`,
            [
                meetingId,
                userId,
                title.trim(),
                false,
                position ?? 0
            ]
        );

        res.status(201).json({
            message: "Agenda item created successfully",
            item: {
                id: result.insertId,
                meeting_id: Number(meetingId),
                created_by: userId,
                title: title.trim(),
                completed: false,
                position: position ?? 0
            }
        });

    } catch (error) {
        console.error("Create agenda item error:", error);

        res.status(500).json({
            message: "Server error while creating agenda item"
        });
    }
};


// GET AGENDA
const getAgenda = async (req, res) => {
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
                message: "You must join the meeting to view the agenda"
            });
        }

        const [items] = await db.execute(
            `SELECT
                id,
                meeting_id,
                created_by,
                title,
                completed,
                position,
                created_at
             FROM agenda_items
             WHERE meeting_id = ?
             ORDER BY position ASC, id ASC`,
            [meetingId]
        );

        res.json({
            agenda: items
        });

    } catch (error) {
        console.error("Get agenda error:", error);

        res.status(500).json({
            message: "Server error while fetching agenda"
        });
    }
};


// UPDATE AGENDA ITEM
const updateAgendaItem = async (req, res) => {
    try {
        const {
            id: meetingId,
            itemId
        } = req.params;

        const userId = req.user.id;

        const {
            title,
            completed,
            position
        } = req.body;

        const [result] = await db.execute(
            `UPDATE agenda_items
             SET title = ?,
                 completed = ?,
                 position = ?
             WHERE id = ?
             AND meeting_id = ?
             AND created_by = ?`,
            [
                title,
                completed ?? false,
                position ?? 0,
                itemId,
                meetingId,
                userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Agenda item not found or you are not allowed to edit it"
            });
        }

        res.json({
            message: "Agenda item updated successfully"
        });

    } catch (error) {
        console.error("Update agenda item error:", error);

        res.status(500).json({
            message: "Server error while updating agenda item"
        });
    }
};


// DELETE AGENDA ITEM
const deleteAgendaItem = async (req, res) => {
    try {
        const {
            id: meetingId,
            itemId
        } = req.params;

        const userId = req.user.id;

        const [result] = await db.execute(
            `DELETE FROM agenda_items
             WHERE id = ?
             AND meeting_id = ?
             AND created_by = ?`,
            [
                itemId,
                meetingId,
                userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Agenda item not found or you are not allowed to delete it"
            });
        }

        res.json({
            message: "Agenda item deleted successfully"
        });

    } catch (error) {
        console.error("Delete agenda item error:", error);

        res.status(500).json({
            message: "Server error while deleting agenda item"
        });
    }
};


module.exports = {
    createAgendaItem,
    getAgenda,
    updateAgendaItem,
    deleteAgendaItem
};