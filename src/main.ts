import config from "./config.json" with { type: "json" };
import { MongoClient } from "mongodb";
import { fetchSubito } from "./subitoApi.js";

// Database connection
if (!process.env.DB_URL) {
  throw new Error("DB_URL environment variable is not set.");
}

const client = new MongoClient(process.env.DB_URL);
await client.connect();
const db = client.db("subiscrapebot");
const adsCollection = db.collection("ads");

//* Should be in database
const alerts = [
  {
    query: "iphone",
    sortOrder: "datedesc",
  },

  {
    query: "ps5",
    sortOrder: "datedesc",
  }
];

// Main loop
while (true) {
  for (const alert of alerts) {
    try {
      const data = await fetchSubito({
        query: alert.query,
        sortOrder: alert.sortOrder,
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
        const existingAd = await adsCollection.findOne({ url: ad.url });
        if (!existingAd) {
          await adsCollection.insertOne(ad);

          //* Will be replaced with Telegram notification system
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
