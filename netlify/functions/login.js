import { neon } from "@netlify/neon";
import bcrypt from "bcryptjs";
import { createToken } from "../lib/auth.js";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");

  if (!username || !password) {
    return new Response("Missing credentials", { status: 400 });
  }

  const sql = neon();
  let rows;
  try {
    rows = await sql`
      SELECT id, username, password_hash, role, unit_id, is_active
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `;
  } catch {
    return new Response("Database error", { status: 500 });
  }

  if (!rows.length) {
    return new Response("Invalid", { status: 401 });
  }

  const user = rows[0];
  if (!user.is_active) {
    return new Response("Invalid", { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return new Response("Invalid", { status: 401 });
  }

  let token;
  try {
    token = createToken(user);
  } catch {
    return new Response("Server misconfigured", { status: 500 });
  }

  return Response.json({
    id: user.id,
    username: user.username,
    role: user.role,
    unit_id: user.unit_id,
    token
  });
};
