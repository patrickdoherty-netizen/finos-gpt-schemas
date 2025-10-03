import fetch from "node-fetch";
import { parsePageProperties } from "../parser.js";
import { logIssue } from "../logger.js";

const NOTION_VERSION = "2025-09-03";

export default async function handler(req, res) {
  try {
    const { data_source_id, page_size = 1 } = req.body;

    if (!data_source_id) {
      const message = "❌ data_source_id is required";
      logIssue(message);
      return res.status(400).json({ error: message });
    }

    // Query the data source directly
    const queryRes = await fetch(`https://api.notion.com/v1/data-sources/${data_source_id}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ page_size })
    });

    if (!queryRes.ok) {
      const errorText = await queryRes.text();
      logIssue(`❌ Failed to query data source: ${errorText}`);
      return res.status(queryRes.status).json({ error: errorText });
    }

    const data = await queryRes.json();
    const parsed = data.results.map((page) =>
      parsePageProperties(page, logIssue)
    );

    res.status(200).json({ parsed, raw: data });
  } catch (err) {
    logIssue(`❌ Error in queryDatabase: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}
