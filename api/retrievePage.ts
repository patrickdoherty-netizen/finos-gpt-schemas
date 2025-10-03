import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";
import { parsePageProperties } from "../parser";
import { logIssue } from "../logger";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { page_id } = req.body;

    const notionRes = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28"
      }
    });

    const data = await notionRes.json();
    const parsed = parsePageProperties(data, logIssue);

    res.status(200).json({ parsed, raw: data });
  } catch (err: any) {
    logIssue(`❌ Error in retrievePage: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}
