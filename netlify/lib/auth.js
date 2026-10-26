import { createHmac, timingSafeEqual } from "node:crypto";

// Signed session tokens for the Netlify functions.
// Set AUTH_SECRET (a long random string) in Netlify environment variables.
const TOKEN_TTL_SECONDS = 8 * 60 * 60;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET is missing or shorter than 32 characters");
  }
  return secret;
}

function sign(data, secret) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createToken(user) {
  const secret = getSecret();
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    username: user.username,
    role: user.role,
    unit_id: user.unit_id ?? null,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

// Returns the token payload, or null when the token is missing, forged or expired.
export function verifyRequest(req) {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const [payload, signature] = match[1].split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload, getSecret()));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  let claims;
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!claims || typeof claims.exp !== "number" || claims.exp < Date.now() / 1000) return null;
  return claims;
}

// Users bound to a unit can only reach that unit. Admins without a unit may pick one.
export function resolveUnitKey(claims, requested) {
  if (claims.unit_id !== null && claims.unit_id !== undefined && claims.unit_id !== "") {
    return String(claims.unit_id).slice(0, 120);
  }
  if (claims.role === "admin") {
    const text = String(requested ?? "").trim();
    return text ? text.slice(0, 120) : "global";
  }
  return "global";
}
