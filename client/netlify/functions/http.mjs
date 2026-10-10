export function readJson(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  return JSON.parse(raw);
}

export function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-Mrz-Admin",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    },
    body: JSON.stringify(payload),
  };
}

export function preflight(event) {
  if (event.httpMethod !== "OPTIONS") return null;
  return json(204, {});
}
