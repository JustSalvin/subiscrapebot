import config from "./config.json" with { type: "json" };
import { Database } from "./db.js";
import { fetchSubito } from "./subitoApi.js";
import { bot } from "./bot/bot.js";

// Database
const db = await Database.getDb();
await Database.init(db);

// Bot
bot.launch();

// Main loop
while (true) {
  const alerts = await db.collection("alerts").find().toArray()

  for (const alert of alerts) {
    try {
      const data = await fetchSubito({
        query: alert.query,
        sortOrder: 'datedesc',
        shippingOnly: true
      })

      //* Should save raw ads instead?
      const ads = data.ads.map((ad: any) => ({
        url: ad.urls.default || null,
        title: ad.subject,
        description: ad.body,
        image: `${ad.images?.[0]?.cdn_base_url}?rule=card-desktop-new-small-1x-auto` || null,
        price: ad.features.find((f: any) => f.label === "Prezzo")?.values[0].value || "N/A",
        createdAt: new Date(ad.dates.display.replace(" ", "T")) || null,
      }));
      
      for (const ad of ads) {
        const existingAd = await db.collection("ads").findOne({ url: ad.url });
        if (!existingAd) {
          await db.collection("ads").insertOne(ad);

          for (const userId of config.authorizedUsers) {
            bot.telegram.sendMessage(userId, `Found new AD (${alert.query}): ${ad.title}`);
          }

          console.log(`Found new AD (${alert.query}):`, ad.title);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }

  // Waits fetchInterval milliseconds before next fetch 
  await new Promise((resolve) => setTimeout(resolve, config.fetchInterval));
}
