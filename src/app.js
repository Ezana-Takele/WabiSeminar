const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/database");
const path = require("path");

const meetingRoutes = require("./routes/meetingRoutes");
const participantRoutes = require("./routes/participantRoutes");
const messageRoutes = require("./routes/messageRoutes");
const noteRoutes = require("./routes/noteRoutes");
const pollRoutes = require("./routes/pollRoutes");
const agendaRoutes = require("./routes/agendaRoutes");
const fileRoutes = require("./routes/fileRoutes");
const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb"}));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"))
);

app.use("/api/meetings", meetingRoutes);
app.use("/api/meetings", participantRoutes);
app.use("/api/meetings", messageRoutes);
app.use("/api/meetings", noteRoutes);
app.use("/api/meetings", pollRoutes);
app.use("/api/meetings", agendaRoutes);
app.use("/api/meetings", fileRoutes);

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
