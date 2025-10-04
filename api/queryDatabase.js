import fetch from "node-fetch";
import { parsePageProperties } from "../parser.js";
import { logIssue } from "../logger.js";

const NOTION_VERSION = "2025-09-03";

export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    console.log("👉 Raw body received:", req.body);
    console.log("👉 Parsed body:", body);

    const { data_source_id, page_size = 1 } = body;
    console.log("👉 Using data_source_id:", data_source_id);

    if (!data_source_id) {
      return res.status(400).json({ error: "❌ data_source_id is required" });
    }

    const queryRes = await fetch(`https://api.notion.com/v1/data-sources/${data_source_id}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ page_size })
    });

    console.log("👉 Notion response status:", queryRes.status);

    if (!queryRes.ok) {
      const errorText = await queryRes.text();
      console.error("❌ Notion API error:", errorText);
      return res.status(queryRes.status).json({ error: errorText });
    }

    const data = await queryRes.json();
    console.log("✅ Notion data:", JSON.stringify(data, null, 2));

    const parsed = data.results.map((page) =>
      parsePageProperties(page, logIssue)
    );

    res.status(200).json({ parsed, raw: data });
  } catch (err) {
    console.error("❌ Handler crashed:", err.message);
    res.status(500).json({ error: err.message });
  }
}
