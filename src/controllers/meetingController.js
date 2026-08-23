const db = require("../config/database");

// CREATE MEETING
const createMeeting = async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            time,
            duration
        } = req.body;

        if (!title || !date || !time || !duration) {
            return res.status(400).json({
                message: "Title, date, time and duration are required"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO meetings
            (host_id, title, description, date, time, duration, completed)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                title,
                description || null,
                date,
                time,
                duration,
                false
            ]
        );

        res.status(201).json({
            message: "Meeting created successfully",
            meeting: {
                id: result.insertId,
                host_id: req.user.id,
                title,
                description: description || null,
                date,
                time,
                duration,
                completed: false
            }
        });

    } catch (error) {
        console.error("Create meeting error:", error);

        res.status(500).json({
            message: "Server error while creating meeting"
        });
    }
};


// GET ALL MEETINGS FOR LOGGED-IN USER
const getMeetings = async (req, res) => {
    try {
        const [meetings] = await db.execute(
            `SELECT *
             FROM meetings
             WHERE host_id = ?
             ORDER BY date ASC, time ASC`,
            [req.user.id]
        );

        res.json({
            meetings
        });

    } catch (error) {
        console.error("Get meetings error:", error);

        res.status(500).json({
            message: "Server error while fetching meetings"
        });
    }
};


// GET ONE MEETING
const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;

        const [meetings] = await db.execute(
            `SELECT *
             FROM meetings
             WHERE id = ? AND host_id = ?`,
            [id, req.user.id]
        );

        if (meetings.length === 0) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        res.json({
            meeting: meetings[0]
        });

    } catch (error) {
        console.error("Get meeting error:", error);

        res.status(500).json({
            message: "Server error while fetching meeting"
        });
    }
};


// UPDATE MEETING
const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            date,
            time,
            duration,
            completed
        } = req.body;

        const [existing] = await db.execute(
            `SELECT id
             FROM meetings
             WHERE id = ? AND host_id = ?`,
            [id, req.user.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        await db.execute(
            `UPDATE meetings
             SET title = ?,
                 description = ?,
                 date = ?,
                 time = ?,
                 duration = ?,
                 completed = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND host_id = ?`,
            [
                title,
                description || null,
                date,
                time,
                duration,
                completed ?? false,
                id,
                req.user.id
            ]
        );

        res.json({
            message: "Meeting updated successfully"
        });

    } catch (error) {
        console.error("Update meeting error:", error);

        res.status(500).json({
            message: "Server error while updating meeting"
        });
    }
};


// DELETE MEETING
const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            `DELETE FROM meetings
             WHERE id = ? AND host_id = ?`,
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        res.json({
            message: "Meeting deleted successfully"
        });

    } catch (error) {
        console.error("Delete meeting error:", error);

        res.status(500).json({
            message: "Server error while deleting meeting"
        });
    }
};


module.exports = {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting
};