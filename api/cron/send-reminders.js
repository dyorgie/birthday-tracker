import { neon } from "@neondatabase/serverless";
import webpush from "web-push";

const sql = neon(process.env.DATABASE_URL);

webpush.setVapidDetails(
  "mailto:your-email@example.com", // TODO: replace with your real email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Returns how many days from today until this person's next birthday,
// given their birth month/day (1-indexed month, matching calendar convention).
function daysUntilNextBirthday(month, day, today) {
  let next = new Date(Date.UTC(today.getUTCFullYear(), month - 1, day));
  if (next < today) {
    next = new Date(Date.UTC(today.getUTCFullYear() + 1, month - 1, day));
  }

  const diffMs = next.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function getFrequencyKeyForDaysUntil(daysUntil) {
  if (daysUntil === 7) return "notify_week";
  if (daysUntil === 3) return "notify_three_day";
  if (daysUntil === 1) return "notify_one_day";
  if (daysUntil === 0) return "notify_day_of";
  return null;
}

export default async function handler(req, res) {
  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const rows = await sql`
      SELECT b.id, b.name, b.birth_month, b.birth_day,
             b.notify_week, b.notify_three_day, b.notify_one_day, b.notify_day_of,
             s.subscription, s.user_id
      FROM birthdays b
      JOIN subscriptions s ON b.user_id = s.user_id
    `;

    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    let sentCount = 0;

    for (const row of rows) {
      const daysUntil = daysUntilNextBirthday(row.birth_month, row.birth_day, today);
      const frequencyKey = getFrequencyKeyForDaysUntil(daysUntil);

      if (!frequencyKey || !row[frequencyKey]) continue;

      const payload = JSON.stringify({
        title: "🎂 Birthday Reminder",
        body:
          daysUntil === 0
            ? `${row.name}'s birthday is today!`
            : `${row.name}'s birthday is in ${daysUntil} day${daysUntil > 1 ? "s" : ""}.`,
      });

      try {
        await webpush.sendNotification(row.subscription, payload);
        sentCount++;

        const parsedPayload = JSON.parse(payload);
        await sql`
          INSERT INTO notification_log (user_id, title, body)
          VALUES (${row.user_id}, ${parsedPayload.title}, ${parsedPayload.body})
        `;
      } catch (err) {
        if (err.statusCode === 410) {
          await sql`DELETE FROM subscriptions WHERE user_id = ${row.user_id}`;
        } else {
          console.error("Push failed for", row.user_id, err);
        }
      }
    }

    return res.status(200).json({ checked: rows.length, sent: sentCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}