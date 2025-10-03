let issues: string[] = [];

export function logIssue(message: string) {
  console.warn(message);
  issues.push(`${new Date().toISOString()} - ${message}`);
}

export function getIssues() {
  return issues;
}

export function clearIssues() {
  issues = [];
}
