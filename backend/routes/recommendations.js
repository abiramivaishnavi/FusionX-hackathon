const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { cve } = req.body;
        
        if (!cve) {
            return res.status(400).json({ error: "Missing CVE data" });
        }

        const prompt = `
You are a cybersecurity expert.

Given this vulnerability:
CVE ID: ${cve.id}
Description: ${cve.description}
Severity: ${cve.severity}

Generate a structured response with:

1. Immediate Actions (urgent fixes)
2. Mitigation Steps (temporary protections)
3. Long-Term Fixes (permanent solutions)
4. Risk Summary (impact and exploitability)

Keep it clear, concise, and actionable.
`;

        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ inputs: prompt })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("HF Error:", errorText);
            return res.status(response.status).json({ error: `Hugging Face API error: ${response.status}`, details: errorText });
        }

        const data = await response.json();
        const solution = data[0]?.generated_text || data.generated_text || "No AI response available";
        
        res.json({ solution });
    } catch (err) {
        console.error("Recommendation API error:", err.message);
        res.status(500).json({ error: "Failed to generate AI solution", details: err.message });
    }
});

module.exports = router;
