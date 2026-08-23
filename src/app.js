const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/database");
const meetingRoutes = require("./routes/meetingRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/meetings", meetingRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "WabiSeminar backend is running 🚀"
    });
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
