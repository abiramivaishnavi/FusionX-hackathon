const express = require("express");
const router = express.Router();
const fetchNVD = require("../utils/fetchNVD");

router.get("/", async (req, res) => {
    try {
        const data = await fetchNVD();
        const trends = {};

        data.forEach(item => {
            const date = item.date ? item.date.split("T")[0] : "Unknown";
            if (!trends[date]) {
                trends[date] = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 };
            }
            const sev = item.severity || "UNKNOWN";
            if (trends[date][sev] !== undefined) trends[date][sev]++;
        });

        res.json(trends);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch trends" });
    }
});

module.exports = router;