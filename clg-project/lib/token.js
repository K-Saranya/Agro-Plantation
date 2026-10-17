const crypto = require("crypto");

function sign(payload, secret, expiresInSeconds = 60 * 60 * 24) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds })
  ).toString("base64url");
  const data = `${header}.${body}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function verify(token, secret) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    const error = new Error("Invalid token");
    error.name = "JsonWebTokenError";
    throw error;
  }
  const [header, body, signature] = parts;
  const data = `${header}.${body}`;
  const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    const error = new Error("Invalid token");
    error.name = "JsonWebTokenError";
    throw error;
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    const error = new Error("Token expired");
    error.name = "TokenExpiredError";
    throw error;
  }
  return payload;
}

module.exports = { sign, verify };
