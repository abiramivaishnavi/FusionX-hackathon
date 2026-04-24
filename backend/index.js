const express = require("express");
const cors = require("cors");
require("dotenv").config();

const threatsRoute = require("./routes/threats");
const statsRoute = require("./routes/stats");
const summaryRoute = require("./routes/summary");
const trendsRoute = require("./routes/trends");

const app = express();

// Middleware FIRST
app.use(cors());
app.use(express.json());

// Routes AFTER
app.use("/api/threats", threatsRoute);
app.use("/api/stats", statsRoute);
app.use("/api/summary", summaryRoute);
app.use("/api/trends", trendsRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});