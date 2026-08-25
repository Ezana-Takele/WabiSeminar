const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/database");
const meetingRoutes = require("./routes/meetingRoutes");
const participantRoutes = require("./routes/participantRoutes");
const messageRoutes = require("./routes/messageRoutes");
const noteRoutes = require("./routes/noteRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/meetings", meetingRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/meetings", messageRoutes);
app.use("/api/meetings", noteRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "WabiSeminar backend is running 🚀"
    });
});

app.get("/api/test-db-name", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT DATABASE() AS database_name"
        );

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database check failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

console.log("MESSAGE ROUTES LOADED");
console.log("Message endpoint: POST /api/messages/:id/messages");

app.listen(PORT, () => {
    console.log(`WabiSeminar server running on port ${PORT}`);
});

app.get("/api/test-database", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        res.json({
            message: "MySQL connection successful 🎉",
            data: rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "MySQL connection failed"
        });
    }
});

const authRoutes = require("./routes/authroutes");

app.use("/api/auth", authRoutes);
