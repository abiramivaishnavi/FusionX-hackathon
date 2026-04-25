const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cache = new Map();
const CACHE_EXPIRY = 60 * 60 * 1000;

router.post("/", async (req, res) => {
    try {
        const { cve } = req.body;
        if (!cve) return res.status(400).json({ error: "CVE data required" });

        const cveId = cve.id;

        // Check cache ⚡
        if (cache.has(cveId)) {
            const cached = cache.get(cveId);
            if (Date.now() - cached.storedAt < CACHE_EXPIRY) {
                console.log(`Cache HIT ⚡ for ${cveId}`);
                return res.json({ solution: cached.solution, cached: true });
            }
            cache.delete(cveId);
        }

        const completion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: `You are a senior cybersecurity expert. Analyze this CVE.

CVE ID: ${cveId}
Severity: ${cve.severity}
Score: ${cve.score || "N/A"}
Description: ${cve.description}

Respond in this HTML format exactly:

<h3>⚠️ Risk Analysis</h3>
<p>Specific risk and exploitation method</p>

<h3>📍 Impact Assessment</h3>
<p>Affected systems, users, or data</p>

<h3>🛠️ Immediate Actions</h3>
<ul>
<li>Action 1</li>
<li>Action 2</li>
<li>Action 3</li>
</ul>

<h3>🔒 Long-term Mitigation</h3>
<ul>
<li>Step 1</li>
<li>Step 2</li>
</ul>

Be specific and technical. Do not repeat the description.`
            }],
            model: "llama-3.3-70b-versatile",
            max_tokens: 500,
            temperature: 0.3
        });

        const solution = completion.choices[0]?.message?.content || "No solution available";
        cache.set(cveId, { solution, storedAt: Date.now() });
        console.log(`✅ Recommendation generated for ${cveId}`);

        res.json({ solution, cached: false });

    } catch (err) {
        console.error("Recommendations error:", err.message);
        res.status(500).json({ error: "Failed to generate", details: err.message });
    }
});

module.exports = router;