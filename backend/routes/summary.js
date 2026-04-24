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