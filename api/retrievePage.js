import fetch from "node-fetch";
import { parsePageProperties } from "../parser.js";
import { logIssue } from "../logger.js";

const NOTION_VERSION = "2025-09-03";

export default async function handler(req, res) {
  try {
    const { page_id } = req.body;

    const notionRes = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION
      }
    });

    if (!notionRes.ok) {
      const errorText = await notionRes.text();
      logIssue(`❌ Failed to retrieve page: ${errorText}`);
      return res.status(notionRes.status).json({ error: errorText });
    }

    const data = await notionRes.json();
    const parsed = parsePageProperties(data, logIssue);

    res.status(200).json({ parsed, raw: data });
  } catch (err) {
    logIssue(`❌ Error in retrievePage: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}
