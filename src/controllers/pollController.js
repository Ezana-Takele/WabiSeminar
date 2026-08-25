const db = require("../config/database");


// Helper: check if user is currently in the meeting
const checkParticipant = async (meetingId, userId) => {
    const [participants] = await db.execute(
        `SELECT id
         FROM meeting_participants
         WHERE meeting_id = ?
         AND user_id = ?
         AND left_at IS NULL`,
        [meetingId, userId]
    );

    return participants.length > 0;
};


// CREATE POLL
const createPoll = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { id: meetingId } = req.params;
        const userId = req.user.id;
        const { question, options } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({
                message: "Poll question is required"
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                message: "A poll must have at least 2 options"
            });
        }

        const cleanedOptions = options
            .map(option => String(option).trim())
            .filter(option => option.length > 0);

        if (cleanedOptions.length < 2) {
            return res.status(400).json({
                message: "A poll must have at least 2 valid options"
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

        // Check participant
        const isParticipant = await checkParticipant(
            meetingId,
            userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You must join the meeting before creating a poll"
            });
        }

        await connection.beginTransaction();

        // Create poll
        const [pollResult] = await connection.execute(
            `INSERT INTO polls
             (meeting_id, created_by, question)
             VALUES (?, ?, ?)`,
            [
                meetingId,
                userId,
                question.trim()
            ]
        );

        const pollId = pollResult.insertId;

        // Create options
        for (const option of cleanedOptions) {
            await connection.execute(
                `INSERT INTO poll_options
                 (poll_id, option_text)
                 VALUES (?, ?)`,
                [pollId, option]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Poll created successfully",
            poll: {
                id: pollId,
                meeting_id: Number(meetingId),
                created_by: userId,
                question: question.trim(),
                options: cleanedOptions
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error("Create poll error:", error);

        res.status(500).json({
            message: "Server error while creating poll"
        });

    } finally {
        connection.release();
    }
};


// GET ALL POLLS
const getPolls = async (req, res) => {
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

        const isParticipant = await checkParticipant(
            meetingId,
            userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You must join the meeting to view polls"
            });
        }

        const [polls] = await db.execute(
            `SELECT
                p.id,
                p.meeting_id,
                p.created_by,
                u.name AS creator_name,
                p.question,
                p.created_at
             FROM polls p
             JOIN users u ON p.created_by = u.id
             WHERE p.meeting_id = ?
             ORDER BY p.created_at ASC`,
            [meetingId]
        );

        for (const poll of polls) {
            const [options] = await db.execute(
                `SELECT
                    id,
                    option_text
                 FROM poll_options
                 WHERE poll_id = ?
                 ORDER BY id ASC`,
                [poll.id]
            );

            poll.options = options;
        }

        res.json({
            polls
        });

    } catch (error) {
        console.error("Get polls error:", error);

        res.status(500).json({
            message: "Server error while fetching polls"
        });
    }
};


// GET ONE POLL
const getPollById = async (req, res) => {
    try {
        const {
            id: meetingId,
            pollId
        } = req.params;

        const userId = req.user.id;

        const isParticipant = await checkParticipant(
            meetingId,
            userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You must join the meeting to view this poll"
            });
        }

        const [polls] = await db.execute(
            `SELECT
                p.id,
                p.meeting_id,
                p.created_by,
                u.name AS creator_name,
                p.question,
                p.created_at
             FROM polls p
             JOIN users u ON p.created_by = u.id
             WHERE p.id = ?
             AND p.meeting_id = ?`,
            [pollId, meetingId]
        );

        if (polls.length === 0) {
            return res.status(404).json({
                message: "Poll not found"
            });
        }

        const poll = polls[0];

        const [options] = await db.execute(
            `SELECT
                id,
                option_text
             FROM poll_options
             WHERE poll_id = ?
             ORDER BY id ASC`,
            [pollId]
        );

        poll.options = options;

        res.json({
            poll
        });

    } catch (error) {
        console.error("Get poll error:", error);

        res.status(500).json({
            message: "Server error while fetching poll"
        });
    }
};


// VOTE
const votePoll = async (req, res) => {
    try {
        const {
            id: meetingId,
            pollId
        } = req.params;

        const userId = req.user.id;
        const { option_id } = req.body;

        if (!option_id) {
            return res.status(400).json({
                message: "Option ID is required"
            });
        }

        const isParticipant = await checkParticipant(
            meetingId,
            userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You must join the meeting before voting"
            });
        }

        // Check poll belongs to meeting
        const [polls] = await db.execute(
            `SELECT id
             FROM polls
             WHERE id = ?
             AND meeting_id = ?`,
            [pollId, meetingId]
        );

        if (polls.length === 0) {
            return res.status(404).json({
                message: "Poll not found"
            });
        }

        // Check option belongs to this poll
        const [options] = await db.execute(
            `SELECT id
             FROM poll_options
             WHERE id = ?
             AND poll_id = ?`,
            [option_id, pollId]
        );

        if (options.length === 0) {
            return res.status(400).json({
                message: "Invalid option for this poll"
            });
        }

        // Check existing vote
        const [existingVotes] = await db.execute(
            `SELECT id
             FROM poll_votes
             WHERE poll_id = ?
             AND user_id = ?`,
            [pollId, userId]
        );

        if (existingVotes.length > 0) {
            return res.status(409).json({
                message: "You have already voted in this poll"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO poll_votes
             (poll_id, option_id, user_id)
             VALUES (?, ?, ?)`,
            [
                pollId,
                option_id,
                userId
            ]
        );

        res.status(201).json({
            message: "Vote recorded successfully",
            vote: {
                id: result.insertId,
                poll_id: Number(pollId),
                option_id: Number(option_id),
                user_id: userId
            }
        });

    } catch (error) {
        console.error("Vote error:", error);

        res.status(500).json({
            message: "Server error while voting"
        });
    }
};


// GET POLL RESULTS
const getPollResults = async (req, res) => {
    try {
        const {
            id: meetingId,
            pollId
        } = req.params;

        const userId = req.user.id;

        const isParticipant = await checkParticipant(
            meetingId,
            userId
        );

        if (!isParticipant) {
            return res.status(403).json({
                message: "You must join the meeting to view results"
            });
        }

        const [polls] = await db.execute(
            `SELECT
                id,
                meeting_id,
                question
             FROM polls
             WHERE id = ?
             AND meeting_id = ?`,
            [pollId, meetingId]
        );

        if (polls.length === 0) {
            return res.status(404).json({
                message: "Poll not found"
            });
        }

        const [results] = await db.execute(
            `SELECT
                po.id AS option_id,
                po.option_text,
                COUNT(pv.id) AS vote_count
             FROM poll_options po
             LEFT JOIN poll_votes pv
                ON po.id = pv.option_id
             WHERE po.poll_id = ?
             GROUP BY po.id, po.option_text
             ORDER BY po.id ASC`,
            [pollId]
        );

        const totalVotes = results.reduce(
            (total, option) =>
                total + Number(option.vote_count),
            0
        );

        res.json({
            poll: polls[0],
            total_votes: totalVotes,
            results
        });

    } catch (error) {
        console.error("Get poll results error:", error);

        res.status(500).json({
            message: "Server error while fetching poll results"
        });
    }
};


// DELETE POLL
const deletePoll = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const {
            id: meetingId,
            pollId
        } = req.params;

        const userId = req.user.id;

        // Only creator can delete
        const [polls] = await connection.execute(
            `SELECT id
             FROM polls
             WHERE id = ?
             AND meeting_id = ?
             AND created_by = ?`,
            [
                pollId,
                meetingId,
                userId
            ]
        );

        if (polls.length === 0) {
            return res.status(404).json({
                message: "Poll not found or you are not allowed to delete it"
            });
        }

        await connection.beginTransaction();

        // Delete votes
        await connection.execute(
            `DELETE FROM poll_votes
             WHERE poll_id = ?`,
            [pollId]
        );

        // Delete options
        await connection.execute(
            `DELETE FROM poll_options
             WHERE poll_id = ?`,
            [pollId]
        );

        // Delete poll
        await connection.execute(
            `DELETE FROM polls
             WHERE id = ?`,
            [pollId]
        );

        await connection.commit();

        res.json({
            message: "Poll deleted successfully"
        });

    } catch (error) {
        await connection.rollback();

        console.error("Delete poll error:", error);

        res.status(500).json({
            message: "Server error while deleting poll"
        });

    } finally {
        connection.release();
    }
};


module.exports = {
    createPoll,
    getPolls,
    getPollById,
    votePoll,
    getPollResults,
    deletePoll
};