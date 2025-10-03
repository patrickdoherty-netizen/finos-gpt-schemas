import fetch from "node-fetch";
import { parsePageProperties } from "../parser.js";
import { logIssue } from "../logger.js";

const NOTION_VERSION = "2025-09-03";

export default async function handler(req, res) {
  try {
    const { database_id, page_size = 1 } = req.body;

    // Step 1: Fetch database metadata to get data_source_id
    const dbRes = await fetch(`https://api.notion.com/v1/databases/${database_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION
      }
    });

    if (!dbRes.ok) {
      const errorText = await dbRes.text();
      logIssue(`❌ Failed to fetch database metadata: ${errorText}`);
      return res.status(dbRes.status).json({ error: errorText });
    }

    const dbData = await dbRes.json();
    const dataSourceId = dbData.data_sources?.[0]?.id;

    if (!dataSourceId) {
      const message = "❌ No data_source_id found for database";
      logIssue(message);
      return res.status(400).json({ error: message });
    }

    // Step 2: Query the data source
    const queryRes = await fetch(`https://api.notion.com/v1/data-sources/${dataSourceId}/query`, {
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
