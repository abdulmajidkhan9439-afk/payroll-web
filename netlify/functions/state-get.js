import { neon } from "@netlify/neon";
import { resolveUnitKey, verifyRequest } from "../lib/auth.js";

export default async (req) => {
  if(req.method !== "GET"){
    return new Response("Method Not Allowed", { status: 405 });
  }

  let claims;
  try{
    claims = verifyRequest(req);
  }catch{
    return new Response("Server misconfigured", { status: 500 });
  }
  if(!claims){
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const unitKey = resolveUnitKey(claims, url.searchParams.get("unit_id"));
  const sql = neon();

  try{
    await sql`
      CREATE TABLE IF NOT EXISTS app_state (
        unit_key TEXT PRIMARY KEY,
        state_json JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    const rows = await sql`
      SELECT state_json, updated_at
      FROM app_state
      WHERE unit_key = ${unitKey}
      LIMIT 1
    `;

    if(!rows.length){
      return Response.json({ found:false, state:null, unit_key: unitKey });
    }

    const row = rows[0];
    return Response.json({
      found: true,
      unit_key: unitKey,
      state: row.state_json || null,
      updated_at: row.updated_at || null
    });
  }catch{
    return new Response("Database error", { status: 500 });
  }
};

