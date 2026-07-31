import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res.status(400).json({ error: "Missing x-user-id header" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: "subscription is required" });
    }

    // One subscription per user_id — if they already had one (e.g. re-enabling
    // notifications, or a refreshed subscription), overwrite it.
    await sql`
      INSERT INTO subscriptions (user_id, subscription)
      VALUES (${userId}, ${subscription})
      ON CONFLICT (user_id)
      DO UPDATE SET subscription = ${subscription}
    `;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}