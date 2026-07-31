import { neon } from "@neondatabase/serverless";
import webpush from "web-push";

const sql = neon(process.env.DATABASE_URL);

webpush.setVapidDetails(
  "mailto:lagmay.jethro113@gmail.com", 
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Returns how many days from today until this person's next birthday.
// dobDate is a JS Date (from Postgres DATE column, stored at UTC midnight).
function daysUntilNextBirthday(dobDate, today) {
  const month = dobDate.getUTCMonth();
  const day = dobDate.getUTCDate();

  let next = new Date(Date.UTC(today.getUTCFullYear(), month, day));
  if (next < today) {
    next = new Date(Date.UTC(today.getUTCFullYear() + 1, month, day));
  }

  const diffMs = next.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Maps "days until birthday" to which notify flag should trigger it
function getFrequencyKeyForDaysUntil(daysUntil) {
  if (daysUntil === 7) return "notify_week";
  if (daysUntil === 3) return "notify_three_day";
  if (daysUntil === 1) return "notify_one_day";
  if (daysUntil === 0) return "notify_day_of";
  return null;
}

export default async function handler(req, res) {
  // Protect this endpoint so only Vercel's Cron system (or you, manually) can trigger it
  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const rows = await sql`
      SELECT b.id, b.name, b.dob::text, b.notify_week, b.notify_three_day, b.notify_one_day, b.notify_day_of,
             s.subscription, s.user_id
      FROM birthdays b
      JOIN subscriptions s ON b.user_id = s.user_id
    `;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let sentCount = 0;

    for (const row of rows) {
      const daysUntil = daysUntilNextBirthday(new Date(row.dob), today);
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
      } catch (err) {
        // 410 Gone means the subscription is no longer valid (e.g. user uninstalled,
        // cleared browser data) — clean it up so we stop trying to send to it.
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