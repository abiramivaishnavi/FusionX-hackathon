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