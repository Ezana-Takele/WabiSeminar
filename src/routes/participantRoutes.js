const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    joinMeeting,
    leaveMeeting,
    getParticipants
} = require("../controllers/participantController");


// Join meeting
router.post(
    "/:id/join",
    authenticateToken,
    joinMeeting
);

// Leave meeting
router.post(
    "/:id/leave",
    authenticateToken,
    leaveMeeting
);

// Get participants
router.get(
    "/:id/participants",
    authenticateToken,
    getParticipants
);

module.exports = router;