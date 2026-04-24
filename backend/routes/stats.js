const express = require("express");
const router = express.Router();
const fetchNVD = require("../utils/fetchNVD");

/**
 * GET /api/stats
 * Returns severity breakdown (HIGH, MEDIUM, LOW counts) and total threats.
 */
router.get("/", async (req, res) => {
    try {
        const threats = await fetchNVD();

        // Count threats by severity level
        const severityCounts = {
            HIGH: 0,
            MEDIUM: 0,
            LOW: 0,
            CRITICAL: 0,
        };

        threats.forEach((threat) => {
            const level = threat.severity.toUpperCase();
            if (severityCounts.hasOwnProperty(level)) {
                severityCounts[level]++;
            }
        });

        res.json({
            success: true,
            total: threats.length,
            breakdown: {
                critical: severityCounts.CRITICAL,
                high: severityCounts.HIGH,
                medium: severityCounts.MEDIUM,
                low: severityCounts.LOW,
            },
        });
    } catch (error) {
        console.error("Error in /api/stats:", error.message);

        res.status(500).json({
            success: false,
            error: "Failed to fetch threat statistics",
        });
    }
});

module.exports = router;