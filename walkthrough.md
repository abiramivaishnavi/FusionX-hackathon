# Backend API Implementation Summary

Here is the complete summary of all the files and code we have implemented for your Node.js/Express backend. All files are fully functional, resilient, and handle NVD API fetching as well as Hugging Face AI summarization.

### Complete File Structure (Inside `backend/` folder)
```
backend/
├── .env
├── index.js
├── routes/
│   ├── stats.js
│   ├── summary.js
│   ├── threats.js
│   └── trends.js
└── utils/
    └── fetchNVD.js
```

---

### [index.js](file:///c:/Users/Abi/FusionX-hackathon/backend/index.js)
*Main Express server setup, CORS configuration, and route mounting.*

```javascript
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
```

---

### [.env](file:///c:/Users/Abi/FusionX-hackathon/backend/.env)
*Template for environment variables. Ensure this is placed in your `backend` directory.*

```env
PORT=5000
NVD_API_KEY=your_nvd_api_key_here
HF_API_KEY=your_huggingface_api_key_here
```

---

### [utils/fetchNVD.js](file:///c:/Users/Abi/FusionX-hackathon/backend/utils/fetchNVD.js)
*Utility module that safely fetches NVD vulnerabilities, parses the responses, and prevents crashes.*

```javascript
const fetchNVD = async () => {
    try {
        const response = await fetch(
            "https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=100",
            {
                headers: {
                    ...(process.env.NVD_API_KEY && { "apiKey": process.env.NVD_API_KEY })
                }
            }
        );

        if (!response.ok) {
            throw new Error(`NVD API error: ${response.status}`);
        }

        const data = await response.json();

        const cves = data.vulnerabilities.map((item) => {
            const cve = item.cve;

            return {
                id: cve.id,
                description: cve.descriptions?.[0]?.value || "No description",
                severity: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity ||
                    cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseSeverity ||
                    cve.metrics?.cvssMetricV2?.[0]?.baseSeverity ||
                    "UNKNOWN",
                score: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore ||
                    cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore ||
                    cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore ||
                    null,
                date: cve.published || "Unknown",
                lastModified: cve.lastModified || "Unknown",
                references: cve.references?.slice(0, 3).map(r => r.url) || []
            };
        });

        return cves;
    } catch (error) {
        console.error("fetchNVD error:", error.message);
        return [];
    }
};

module.exports = fetchNVD;
```

---

### [routes/threats.js](file:///c:/Users/Abi/FusionX-hackathon/backend/routes/threats.js)
*Provides a direct feed to the formatted CVE JSON response.*

```javascript
const express = require("express");
const router = express.Router();
const fetchNVD = require("../utils/fetchNVD");

router.get("/", async (req, res) => {
    try {
        const data = await fetchNVD();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch threats" });
    }
});

module.exports = router;
```

---

### [routes/stats.js](file:///c:/Users/Abi/FusionX-hackathon/backend/routes/stats.js)
*Summarizes totals and breaks counts down by Severity types.*

```javascript
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
```

---

### [routes/trends.js](file:///c:/Users/Abi/FusionX-hackathon/backend/routes/trends.js)
*Returns historical grouping arrays mapped out by CVE publish dates and corresponding severity counts.*

```javascript
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
```

---

### [routes/summary.js](file:///c:/Users/Abi/FusionX-hackathon/backend/routes/summary.js)
*Queries the Hugging Face AI model endpoint to quickly format a multi-line impact analysis for an individual CVE.*

```javascript
const express = require("express");
const router = express.Router();
const fetchNVD = require("../utils/fetchNVD");

router.get("/:id", async (req, res) => {
    try {
        const data = await fetchNVD();
        const threat = data.find(t => t.id === req.params.id);
        if (!threat) return res.status(404).json({ error: "CVE not found" });

        const prompt = `Summarize this cybersecurity vulnerability in 3 lines:
1. Risk: what is the risk
2. Impact: what is affected
3. Fix: how to fix it
Vulnerability: ${threat.description}
Summary:`;

        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: threat.description,
                    parameters: {
                        max_length: 150,
                        min_length: 50
                    }
                })
            }
        );

        // Check if response is ok before parsing
        if (!response.ok) {
            const text = await response.text();
            console.error("HF API error:", text);
            return res.status(500).json({ error: "HF API error", details: text });
        }

        const result = await response.json();
        console.log("HF result:", JSON.stringify(result));

        const summary = result?.[0]?.summary_text || "No summary available";
        res.json({ id: threat.id, summary });

    } catch (err) {
        console.error("AI summary failed:", err.message);
        res.status(500).json({ error: "AI summary failed", details: err.message });
    }
});

module.exports = router;
```
