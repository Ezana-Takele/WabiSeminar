const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting
} = require("../controllers/meetingController");


router.post(
    "/",
    authenticateToken,
    createMeeting
);

router.get(
    "/",
    authenticateToken,
    getMeetings
);

router.get(
    "/:id",
    authenticateToken,
    getMeetingById
);

router.put(
    "/:id",
    authenticateToken,
    updateMeeting
);

router.delete(
    "/:id",
    authenticateToken,
    deleteMeeting
);


module.exports = router;