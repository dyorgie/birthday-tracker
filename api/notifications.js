import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(400).json({ error: "Missing x-user-id header" });
  }

  try {
    if (req.method === "GET") {
      const rows = await sql`
        SELECT id, title, body, sent_at, read
        FROM notification_log
        WHERE user_id = ${userId}
        ORDER BY sent_at DESC
        LIMIT 10
      `;
      return res.status(200).json(rows);
    }

    if (req.method === "PATCH") {
      // Mark all of this user's notifications as read
      await sql`
        UPDATE notification_log
        SET read = TRUE
        WHERE user_id = ${userId} AND read = FALSE
      `;
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}