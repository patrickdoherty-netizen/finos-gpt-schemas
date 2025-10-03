import fetch from "node-fetch";
import { parsePageProperties } from "../parser.js";
import { logIssue } from "../logger.js";

const NOTION_VERSION = "2025-09-03";

export default async function handler(req, res) {
  try {
    console.log("👉 queryDatabase called with body:", req.body);
    console.log("👉 Using NOTION_TOKEN?", !!process.env.NOTION_TOKEN);

    const { data_source_id, page_size = 1 } = req.body;
    console.log("👉 data_source_id received:", data_source_id);

    if (!data_source_id) {
      const message = "❌ data_source_id is required";
      console.error(message);
      return res.status(400).json({ error: message });
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
      console.error("❌ Notion API error body:", errorText);
      logIssue(`❌ Failed to query data source: ${errorText}`);
      return res.status(queryRes.status).json({ error: errorText });
    }

    const data = await queryRes.json();
    console.log("✅ Parsed Notion data:", JSON.stringify(data, null, 2));

    const parsed = data.results.map((page) =>
      parsePageProperties(page, logIssue)
    );

    res.status(200).json({ parsed, raw: data });
  } catch (err) {
    console.error("❌ queryDatabase crashed:", err.message, err.stack);
    logIssue(`❌ Error in queryDatabase: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}
