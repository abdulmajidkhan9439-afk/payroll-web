import { neon } from "@netlify/neon";

function normalizeUnitKey(raw){
  const text = String(raw ?? "").trim();
  if(!text) return "global";
  return text.slice(0, 120);
}

function validateState(state){
  return !!state && typeof state === "object";
}

export default async (req) => {
  if(req.method !== "POST"){
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try{
    body = await req.json();
  }catch{
    return new Response("Bad Request", { status: 400 });
  }

  const unitKey = normalizeUnitKey(body?.unit_id);
  const state = body?.state;

  if(!validateState(state)){
    return new Response("Invalid state payload", { status: 400 });
  }

  const sql = neon();
  try{
    await sql`
      CREATE TABLE IF NOT EXISTS app_state (
        unit_key TEXT PRIMARY KEY,
        state_json JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO app_state (unit_key, state_json, updated_at)
      VALUES (${unitKey}, ${JSON.stringify(state)}::jsonb, NOW())
      ON CONFLICT (unit_key)
      DO UPDATE SET
        state_json = EXCLUDED.state_json,
        updated_at = NOW()
    `;

    return Response.json({ ok:true, unit_key: unitKey });
  }catch{
    return new Response("Database error", { status: 500 });
  }
};

