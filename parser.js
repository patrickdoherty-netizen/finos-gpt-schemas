export function parseNotionProperty(prop, logIssue) {
  switch (prop.type) {
    case "title":
      return prop.title.map((t) => t.plain_text).join(" ");
    case "rich_text":
      return prop.rich_text.map((t) => t.plain_text).join(" ");
    case "number":
      return prop.number;
    case "select":
      return prop.select?.name || null;
    case "multi_select":
      return prop.multi_select.map((s) => s.name);
    case "status":
      return prop.status?.name || null;
    case "files":
      return prop.files.map((f) => f.name || f.external?.url || f.file?.url);
    case "people":
      return prop.people.map((p) => p.name || p.id);
    case "relation":
      return prop.relation.map((r) => r.id);
    case "rollup":
      if (prop.rollup.array) return prop.rollup.array.map((a) => parseNotionProperty(a, logIssue));
      if (prop.rollup.number !== null) return prop.rollup.number;
      if (prop.rollup.date) return prop.rollup.date.start;
      return null;
    case "url":
      return prop.url;
    case "email":
      return prop.email;
    case "phone_number":
      return prop.phone_number;
    case "date":
      return prop.date ? { start: prop.date.start, end: prop.date.end } : null;
    case "checkbox":
      return prop.checkbox;
    case "formula":
      return prop.formula[prop.formula.type];
    case "created_time":
      return prop.created_time;
    case "last_edited_time":
      return prop.last_edited_time;
    case "created_by":
      return prop.created_by;
    case "last_edited_by":
      return prop.last_edited_by;
    case "place":
      return {
        name: prop.place?.name,
        address: prop.place?.address,
        latitude: prop.place?.latitude,
        longitude: prop.place?.longitude
      };
    case "button":
      return "[Button property – UI action, no value]";
    default:
      logIssue(`⚠️ Unknown Notion property type: ${prop.type}`);
      return prop; // fallback: preserve raw JSON
  }
}

export function parsePageProperties(page, logIssue) {
  const parsed = {};
  for (const [key, value] of Object.entries(page.properties)) {
    parsed[key] = parseNotionProperty(value, logIssue);
  }
  return parsed;
}
