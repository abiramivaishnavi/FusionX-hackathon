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