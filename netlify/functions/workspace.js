import { getDatabase } from "@netlify/database";

const headers = {
  "content-type": "application/json",
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  const key = event.queryStringParameters?.key || "default";

  try {
    const connectionString =
      process.env.NETLIFY_DATABASE_URL ||
      process.env.NETLIFY_DATABASE_CONNECTION_STRING ||
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL;
    const db = connectionString ? getDatabase({ connectionString }) : getDatabase();

    if (event.queryStringParameters?.health === "1") {
      return json(200, {
        ok: true,
        hasExplicitConnectionString: Boolean(connectionString),
      });
    }

    if (event.httpMethod === "GET") {
      const rows = await db.sql`
        SELECT data, updated_at
        FROM pm_workspace_state
        WHERE workspace_key = ${key}
        LIMIT 1
      `;
      return json(200, rows[0] || { data: null, updated_at: null });
    }

    if (event.httpMethod === "PUT" || event.httpMethod === "POST") {
      const parsed = JSON.parse(event.body || "{}");
      const data = parsed.data || parsed;
      const rows = await db.sql`
        INSERT INTO pm_workspace_state (workspace_key, data, updated_at)
        VALUES (${key}, ${JSON.stringify(data)}::jsonb, NOW())
        ON CONFLICT (workspace_key)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        RETURNING data, updated_at
      `;
      return json(200, rows[0]);
    }

    return json(405, { error: "Method not allowed" });
  } catch (error) {
    return json(500, {
      error: error.message,
      hint: "Netlify Database is not available to this function runtime. Ensure the production database is provisioned and a connection string is exposed to the function as NETLIFY_DATABASE_URL or DATABASE_URL.",
    });
  }
}
