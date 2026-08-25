const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    createAgendaItem,
    getAgenda,
    updateAgendaItem,
    deleteAgendaItem
} = require("../controllers/agendaController");


router.post(
    "/:id/agenda",
    authenticateToken,
    createAgendaItem
);

router.get(
    "/:id/agenda",
    authenticateToken,
    getAgenda
);

router.put(
    "/:id/agenda/:itemId",
    authenticateToken,
    updateAgendaItem
);

router.delete(
    "/:id/agenda/:itemId",
    authenticateToken,
    deleteAgendaItem
);


module.exports = router;