const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    createPoll,
    getPolls,
    getPollById,
    votePoll,
    getPollResults,
    deletePoll
} = require("../controllers/pollController");


router.post(
    "/:id/polls",
    authenticateToken,
    createPoll
);

router.get(
    "/:id/polls",
    authenticateToken,
    getPolls
);

router.get(
    "/:id/polls/:pollId",
    authenticateToken,
    getPollById
);

router.post(
    "/:id/polls/:pollId/vote",
    authenticateToken,
    votePoll
);

router.get(
    "/:id/polls/:pollId/results",
    authenticateToken,
    getPollResults
);

router.delete(
    "/:id/polls/:pollId",
    authenticateToken,
    deletePoll
);


module.exports = router;