let issues = [];

export function logIssue(message) {
  console.warn(message);
  issues.push(`${new Date().toISOString()} - ${message}`);
}

export function getIssues() {
  return issues;
}

export function clearIssues() {
  issues = [];
}
