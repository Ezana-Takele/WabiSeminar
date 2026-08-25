const db = require("../config/database");
const fs = require("fs");
const path = require("path");


// Check if user is currently in meeting
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


// UPLOAD FILE
const uploadFile = async (req, res) => {
    try {
        const { id: meetingId } = req.params;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                message: "Please select a file"
            });
        }

        // Check meeting
        const [meetings] = await db.execute(
            "SELECT id FROM meetings WHERE id = ?",
            [meetingId]
        );

        if (meetings.length === 0) {
            // Delete uploaded file if meeting doesn't exist
            fs.unlinkSync(req.file.path);

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
            fs.unlinkSync(req.file.path);

            return res.status(403).json({
                message: "You must join the meeting before uploading files"
            });
        }

        const filePath = `/uploads/${req.file.filename}`;

        const [result] = await db.execute(
            `INSERT INTO meeting_files
             (meeting_id, uploaded_by, file_name, file_path, file_type, file_size)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                meetingId,
                userId,
                req.file.originalname,
                filePath,
                req.file.mimetype,
                req.file.size
            ]
        );

        res.status(201).json({
            message: "File uploaded successfully",
            file: {
                id: result.insertId,
                meeting_id: Number(meetingId),
                uploaded_by: userId,
                file_name: req.file.originalname,
                file_path: filePath,
                file_type: req.file.mimetype,
                file_size: req.file.size
            }
        });

    } catch (error) {
        console.error("Upload file error:", error);

        // Clean up file if database insertion fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            message: "Server error while uploading file"
        });
    }
};


// GET FILES
const getFiles = async (req, res) => {
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
                message: "You must join the meeting to view files"
            });
        }

        const [files] = await db.execute(
            `SELECT
                mf.id,
                mf.meeting_id,
                mf.uploaded_by,
                u.name AS uploader_name,
                mf.file_name,
                mf.file_path,
                mf.file_type,
                mf.file_size,
                mf.created_at
             FROM meeting_files mf
             JOIN users u ON mf.uploaded_by = u.id
             WHERE mf.meeting_id = ?
             ORDER BY mf.created_at ASC`,
            [meetingId]
        );

        res.json({
            files
        });

    } catch (error) {
        console.error("Get files error:", error);

        res.status(500).json({
            message: "Server error while fetching files"
        });
    }
};


// DELETE FILE
const deleteFile = async (req, res) => {
    try {
        const {
            id: meetingId,
            fileId
        } = req.params;

        const userId = req.user.id;

        // Only uploader can delete
        const [files] = await db.execute(
            `SELECT file_path
             FROM meeting_files
             WHERE id = ?
             AND meeting_id = ?
             AND uploaded_by = ?`,
            [
                fileId,
                meetingId,
                userId
            ]
        );

        if (files.length === 0) {
            return res.status(404).json({
                message: "File not found or you are not allowed to delete it"
            });
        }

        const filePath = files[0].file_path;

        await db.execute(
            `DELETE FROM meeting_files
             WHERE id = ?
             AND meeting_id = ?
             AND uploaded_by = ?`,
            [
                fileId,
                meetingId,
                userId
            ]
        );

        // Delete physical file
        const physicalPath = path.join(
            __dirname,
            "../..",
            filePath
        );

        if (fs.existsSync(physicalPath)) {
            fs.unlinkSync(physicalPath);
        }

        res.json({
            message: "File deleted successfully"
        });

    } catch (error) {
        console.error("Delete file error:", error);

        res.status(500).json({
            message: "Server error while deleting file"
        });
    }
};


module.exports = {
    uploadFile,
    getFiles,
    deleteFile
};