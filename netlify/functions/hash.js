import bcrypt from "bcryptjs";

// Temporary helper endpoint for generating password hashes.
// Use: /.netlify/functions/hash?password=YourSecret
// Remove this file after creating users in production.
export default async (req) => {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const url = new URL(req.url);
  const password = String(url.searchParams.get("password") || "");
  if (!password) {
    return new Response("Missing password query param", { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  return Response.json({ hash });
};
