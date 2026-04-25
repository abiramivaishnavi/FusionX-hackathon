const express = require("express");
const router = express.Router();
const fetchNVD = require("../utils/fetchNVD");
const { parse } = require("json2csv");

router.get("/", async (req, res) => {
    try {
        const format = req.query.format || "json";
        const threats = await fetchNVD();

        if (format === "csv") {
            const fields = ["ID", "Severity", "Score", "Description", "Published Date"];
            const opts = { fields };
            const data = threats.map(t => ({
                "ID": t.id,
                "Severity": t.severity,
                "Score": t.score || "N/A",
                "Description": t.description,
                "Published Date": t.date
            }));
            
            try {
                const csv = parse(data, opts);
                res.header("Content-Disposition", 'attachment; filename="threats.csv"');
                res.header("Content-Type", "text/csv");
                return res.send(csv);
            } catch (err) {
                console.error("CSV parse error", err);
                return res.status(500).json({ error: "CSV export failed" });
            }
        }

        res.header("Content-Disposition", 'attachment; filename="threats.json"');
        res.header("Content-Type", "application/json");
        return res.json(threats);

    } catch (err) {
        console.error("Export error:", err.message);
        res.status(500).json({ error: "Export failed", details: err.message });
    }
});

module.exports = router;
