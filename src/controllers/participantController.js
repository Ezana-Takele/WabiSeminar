const db = require("../config/database");

// JOIN A MEETING
const joinMeeting = async (req, res) => {
    try {
        const { id: meetingId } = req.params;
        const userId = req.user.id;

        // Check if meeting exists
        const [meetings] = await db.execute(
            "SELECT id FROM meetings WHERE id = ?",
            [meetingId]
        );

        if (meetings.length === 0) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        // Check if user is already an active participant
        const [existing] = await db.execute(
            `SELECT id
             FROM meeting_participants
             WHERE meeting_id = ?
             AND user_id = ?
             AND left_at IS NULL`,
            [meetingId, userId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "You are already in this meeting"
            });
        }

        // Add participant
        const [result] = await db.execute(
            `INSERT INTO meeting_participants
             (meeting_id, user_id, joined_at, left_at)
             VALUES (?, ?, CURRENT_TIMESTAMP, NULL)`,
            [meetingId, userId]
        );

        res.status(201).json({
            message: "Joined meeting successfully",
            participant: {
                id: result.insertId,
                meeting_id: Number(meetingId),
                user_id: userId
            }
        });

    } catch (error) {
        console.error("Join meeting error:", error);

        res.status(500).json({
            message: "Server error while joining meeting"
        });
    }
};


// LEAVE A MEETING
const leaveMeeting = async (req, res) => {
    try {
        const { id: meetingId } = req.params;
        const userId = req.user.id;

        const [result] = await db.execute(
            `UPDATE meeting_participants
             SET left_at = CURRENT_TIMESTAMP
             WHERE meeting_id = ?
             AND user_id = ?
             AND left_at IS NULL`,
            [meetingId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "You are not currently in this meeting"
            });
        }

        res.json({
            message: "Left meeting successfully"
        });

    } catch (error) {
        console.error("Leave meeting error:", error);

        res.status(500).json({
            message: "Server error while leaving meeting"
        });
    }
};


// GET MEETING PARTICIPANTS
const getParticipants = async (req, res) => {
    try {
        const { id: meetingId } = req.params;

        // Check if meeting exists
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
            `SELECT
                mp.id,
                mp.meeting_id,
                mp.user_id,
                u.name,
                u.email,
                mp.joined_at,
                mp.left_at
             FROM meeting_participants mp
             JOIN users u ON mp.user_id = u.id
             WHERE mp.meeting_id = ?
             ORDER BY mp.joined_at ASC`,
            [meetingId]
        );

        res.json({
            participants
        });

    } catch (error) {
        console.error("Get participants error:", error);

        res.status(500).json({
            message: "Server error while fetching participants"
        });
    }
};


module.exports = {
    joinMeeting,
    leaveMeeting,
    getParticipants
};