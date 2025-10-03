import { VercelRequest, VercelResponse } from "@vercel/node";
import { getIssues, clearIssues } from "../logger";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const issues = getIssues();

  const report = issues.length > 0
    ? `Daily Report:\n\n${issues.join("\n")}\n\nNext Step: Ask GPT to regenerate parser if new property types appear.`
    : "Daily Report: ✅ No issues or unknown property types today.";

  clearIssues();
  res.status(200).json({ report });
}
