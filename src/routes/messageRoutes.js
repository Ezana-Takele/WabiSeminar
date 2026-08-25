const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    sendMessage,
    getMessages,
    deleteMessage
} = require("../controllers/messageController");


// Send message
router.post(
    "/:id/messages",
    authenticateToken,
    sendMessage
);

// Get messages
router.get(
    "/:id/messages",
    authenticateToken,
    getMessages
);

// Delete message
router.delete(
    "/:id/messages/:messageId",
    authenticateToken,
    deleteMessage
);

module.exports = router;