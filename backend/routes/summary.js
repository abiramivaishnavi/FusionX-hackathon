const express = require("express");
const router = express.Router();
const fetchNVD = require("../utils/fetchNVD");
const Groq = require("groq-sdk");

// Lazy init — avoids crash at startup if GROQ_API_KEY is missing
let _groq = null;
function getGroq() {
    if (!_groq) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not set in .env");
        }
        _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return _groq;
}

// Simple in-memory cache
const cache = new Map();
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

router.get("/:id", async (req, res) => {
    try {
        const cveId = req.params.id;

        // Check cache first ⚡
        if (cache.has(cveId)) {
            const cached = cache.get(cveId);
            const isExpired = Date.now() - cached.storedAt > CACHE_EXPIRY;

            if (!isExpired) {
                console.log(`Cache HIT ⚡ for ${cveId}`);
                return res.json({
                    id: cveId,
                    summary: cached.summary,
                    cached: true,
                    generatedAt: cached.storedAt
                });
            } else {
                cache.delete(cveId);
            }
        }

        // Not cached — fetch CVE
        const data = await fetchNVD();
        const threat = data.find(t => t.id === cveId);
        if (!threat) return res.status(404).json({ error: "CVE not found" });

        const startTime = Date.now();

        // Use Groq for intelligent summary
        const groq = getGroq();
        const completion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: `You are a cybersecurity expert. Analyze this CVE and give exactly 3 lines:
1. ⚠️ Risk: What is the specific security risk
2. 📍 Impact: What systems or users are affected  
3. 🛠️ Fix: What is the recommended fix or mitigation

CVE ID: ${cveId}
Description: ${threat.description}

Be specific, technical, and concise. Do not repeat the description.`
            }],
            model: "llama-3.3-70b-versatile",
            max_tokens: 200,
            temperature: 0.3
        });

        const summary = completion.choices[0]?.message?.content || "No summary available";
        const responseTime = Date.now() - startTime;

        // Store in cache
        cache.set(cveId, {
            summary,
            storedAt: Date.now()
        });

        console.log(`Cache MISS — generated in ${responseTime}ms for ${cveId}`);

        res.json({
            id: cveId,
            summary,
            cached: false,
            generatedAt: Date.now(),
            responseTime
        });

    } catch (err) {
        console.error("Summary failed:", err.message);
        res.status(500).json({ error: "Summary failed", details: err.message });
    }
});

module.exports = router;