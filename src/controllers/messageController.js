const db = require("../config/database");

// SEND MESSAGE
const sendMessage = async (req, res) => {
    try {
        const { id: meetingId } = req.params;
        const userId = req.user.id;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message cannot be empty"
            });
        }

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

        // Check if user is currently in the meeting
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
                message: "You must join the meeting before sending messages"
            });
        }

        // Save message
        const [result] = await db.execute(
            `INSERT INTO messages
             (meeting_id, sender_id, message)
             VALUES (?, ?, ?)`,
            [meetingId, userId, message.trim()]
        );

        // Return the newly created message
        const [newMessage] = await db.execute(
            `SELECT
                m.id,
                m.meeting_id,
                m.sender_id,
                u.name AS sender_name,
                m.message,
                m.created_at
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            message: "Message sent successfully",
            data: newMessage[0]
        });

    } catch (error) {
        console.error("Send message error:", error);

        res.status(500).json({
            message: "Server error while sending message"
        });
    }
};


// GET ALL MESSAGES
const getMessages = async (req, res) => {
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

        // Check if user is currently in the meeting
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
                message: "You must join the meeting to view messages"
            });
        }

        const [messages] = await db.execute(
            `SELECT
                m.id,
                m.meeting_id,
                m.sender_id,
                u.name AS sender_name,
                m.message,
                m.created_at
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.meeting_id = ?
             ORDER BY m.created_at ASC`,
            [meetingId]
        );

        res.json({
            messages
        });

    } catch (error) {
        console.error("Get messages error:", error);

        res.status(500).json({
            message: "Server error while fetching messages"
        });
    }
};


// DELETE MESSAGE
const deleteMessage = async (req, res) => {
    try {
        const { id: meetingId, messageId } = req.params;
        const userId = req.user.id;

        // Only allow the sender to delete their own message
        const [result] = await db.execute(
            `DELETE FROM messages
             WHERE id = ?
             AND meeting_id = ?
             AND sender_id = ?`,
            [messageId, meetingId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Message not found or you are not allowed to delete it"
            });
        }

        res.json({
            message: "Message deleted successfully"
        });

    } catch (error) {
        console.error("Delete message error:", error);

        res.status(500).json({
            message: "Server error while deleting message"
        });
    }
};


module.exports = {
    sendMessage,
    getMessages,
    deleteMessage
};