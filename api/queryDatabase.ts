import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";
import { parsePageProperties } from "../parser";
import { logIssue } from "../logger";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { database_id, page_size = 1 } = req.body;

    const notionRes = await fetch(`https://api.notion.com/v1/databases/${database_id}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ page_size })
    });

    const data = await notionRes.json();
    const parsed = data.results.map((page: any) =>
      parsePageProperties(page, logIssue)
    );

    res.status(200).json({ parsed, raw: data });
  } catch (err: any) {
    logIssue(`❌ Error in queryDatabase: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}
