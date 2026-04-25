const express = require("express");
const cors = require("cors");
require("dotenv").config();
const rateLimit = require("express-rate-limit");

const threatsRoute = require("./routes/threats");
const statsRoute = require("./routes/stats");
const summaryRoute = require("./routes/summary");
const trendsRoute = require("./routes/trends");
const exportRoute = require("./routes/export");

let recommendationsRoute;
try { recommendationsRoute = require("./routes/recommendations"); } catch (e) {}
let advisorRoute;
try { advisorRoute = require("./routes/advisor"); } catch (e) {}

const app = express();

app.use(cors());
app.use(express.json());

const messageObj = { error: "Too many requests", retryAfter: "60 seconds" };

const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, message: messageObj });
const summaryLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: messageObj });
const advisorLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: messageObj });

app.use(generalLimiter); 
app.use("/api/summary", summaryLimiter, summaryRoute);

if (advisorRoute) {
    app.use("/api/advisor", advisorLimiter, advisorRoute);
}

app.use("/api/threats", threatsRoute);
app.use("/api/stats", statsRoute);
app.use("/api/trends", trendsRoute);
app.use("/api/export", exportRoute);

if (recommendationsRoute) {
    app.use("/api/recommendations", recommendationsRoute);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});