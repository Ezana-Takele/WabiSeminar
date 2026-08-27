const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// GET: Fetch all meetings
router.get("/", async (req, res) => {
    try {
        const [meetings] = await pool.query(
            `SELECT
                id,
                host_id,
                title,
                description,
                date,
                time,
                duration,
                completed,
                created_at,
                updated_at
             FROM meetings
             ORDER BY date ASC, time ASC`
        );

        res.json(meetings);

    } catch (error) {
        console.error("Get meetings error:", error);

        res.status(500).json({
            message: "Failed to get meetings"
        });
    }
});

// POST: Create a new meeting
router.post("/", async (req, res) => {
    try {
        const {
            host_id,
            title,
            description,
            date,
            time,
            duration
        } = req.body;

        const effectiveHostId = host_id || 1;

        if (!title || !date || !time) {
            return res.status(400).json({
                message: "Title, date, and time are required"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO meetings
            (host_id, title, description, date, time, duration, completed)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                effectiveHostId,
                title,
                description || null,
                date,
                time,
                duration || 30,
                false
            ]
        );

        res.status(201).json({
            message: "Meeting created successfully",
            meeting: {
                id: result.insertId,
                host_id: effectiveHostId,
                title,
                description: description || null,
                date,
                time,
                duration: duration || 30,
                completed: false
            }
        });

    } catch (error) {
        console.error("Create meeting error:", error);

        res.status(500).json({
            message: "Server error while creating meeting"
        });
    }
});

// POST: Join a meeting
router.post("/:id/join", async (req, res) => {
    const meetingId = req.params.id;
    const { user_id } = req.body;

    try {
        // Check that the user exists
        const [users] = await pool.query(
            "SELECT id FROM users WHERE id = ?",
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check that the meeting exists
        const [meetings] = await pool.query(
            "SELECT id FROM meetings WHERE id = ?",
            [meetingId]
        );

        if (meetings.length === 0) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

       // Check if the user has ever joined this meeting
const [existingParticipant] = await pool.query(
    `SELECT id, left_at
     FROM meeting_participants
     WHERE meeting_id = ? AND user_id = ?`,
    [meetingId, user_id]
);

if (existingParticipant.length > 0) {

    // User is currently inside the meeting
    if (existingParticipant[0].left_at === null) {
        return res.status(409).json({
            message: "User is already in this meeting"
        });
    }

    // User left before, so allow them to rejoin
    await pool.query(
        `UPDATE meeting_participants
         SET joined_at = NOW(), left_at = NULL
         WHERE id = ?`,
        [existingParticipant[0].id]
    );

    return res.status(200).json({
        message: "Successfully rejoined meeting",
        participant_id: existingParticipant[0].id,
        meeting_id: Number(meetingId),
        user_id: Number(user_id)
    });
}

// User has never joined, so create a new participant
const [result] = await pool.query(
    `INSERT INTO meeting_participants
     (meeting_id, user_id, joined_at)
     VALUES (?, ?, NOW())`,
    [meetingId, user_id]
);

res.status(201).json({
    message: "Successfully joined meeting",
    participant_id: result.insertId,
    meeting_id: Number(meetingId),
    user_id: Number(user_id)
});


    } catch (error) {
        console.error("Join meeting error:", error);
        res.status(500).json({ message: "Failed to join meeting" });
    }
});

// GET: Fetch one meeting
router.get("/:id", async (req, res) => {
    const meetingId = req.params.id;

    try {
        const [meetings] = await pool.query(
            `SELECT
                id,
                host_id,
                title,
                description,
                date,
                time,
                duration,
                completed,
                created_at,
                updated_at
             FROM meetings
             WHERE id = ?`,
            [meetingId]
        );

        if (meetings.length === 0) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        res.json(meetings[0]);

    } catch (error) {
        console.error("Get meeting error:", error);

        res.status(500).json({
            message: "Failed to get meeting"
        });
    }
});
router.post("/:id/leave", async (req, res) => {
    const meetingId = req.params.id;
    const { user_id } = req.body;

    console.log("LEAVE REQUEST:", {
        meetingId,
        user_id
    });

    try {
        const [result] = await pool.query(
            `UPDATE meeting_participants
             SET left_at = NOW()
             WHERE meeting_id = ?
             AND user_id = ?
             AND left_at IS NULL`,
            [meetingId, user_id]
        );

        console.log("UPDATE RESULT:", result);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Participant not found or already left"
            });
        }

        res.json({
            message: "Successfully left meeting",
            meeting_id: Number(meetingId),
            user_id: Number(user_id)
        });

    } catch (error) {
        console.error("Leave meeting error:", error);

        res.status(500).json({
            message: "Failed to leave meeting"
        });
    }
});

module.exports = router;