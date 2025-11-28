import config from "../config.json" with { type: "json" };
import { Database } from "../services/db.js";
import { fetchSubito } from "../services/subito_api.js";

export async function watchSubito(callback: Function) {
  const db = await Database.getDb();
  await Database.init(db);

  while (true) {
    const alerts = await db.collection("alerts").find().toArray()
  
    for (const alert of alerts) {
      try {
        const data = await fetchSubito({
          query: alert.query,
          sortOrder: 'datedesc',
          shippingOnly: true
        })
        
        for (const ad of data.ads) {
          const id = ad.urn.split(":")[2]; 

          const existingAd = await db.collection("ads").findOne({ id });
          if (existingAd) continue

          await db.collection("ads").insertOne({ id, ...ad });
          callback({ ad, alert })
          
          console.log(`Found new ad (Generative query: ${alert.query}):`, ad.urls.default);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
  
    // Waits fetchInterval milliseconds before next fetch 
    await new Promise((resolve) => setTimeout(resolve, config.fetchInterval));
  }
}