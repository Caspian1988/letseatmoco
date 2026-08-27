const fs = require('fs');

// Montgomery County Open Data Socrata API Endpoint
const MOCO_API_URL = 'https://data.montgomerycountymd.gov/resource/5pue-gfbe.json?$limit=100';

async function buildMoCoDatabase() {
    console.log("Connecting to Montgomery County Open Data API...");

    try {
        const response = await fetch(MOCO_API_URL);
        const rawData = await response.json();

        const uniqueSpots = new Map();

        rawData.forEach(item => {
            if (!item.name || !item.city) return;

            const name = item.name.trim();
            const city = item.city.trim();
            const address = `${item.address1 || ''}, ${city}, MD`.trim();

            // Unique key to deduplicate inspection records
            const key = `${name.toLowerCase()}_${city.toLowerCase()}`;

            if (!uniqueSpots.has(key)) {
                // Heuristic tag generation based on venue name
                let tags = ["Local Favorite"];
                let price = "$$";

                if (name.includes("KABOB") || name.includes("PERSIAN") || name.includes("GRILL")) {
                    tags.push("Halal Options", "Casual");
                } else if (name.includes("CAFE") || name.includes("BAKERY")) {
                    tags.push("Coffee & Snacks", "Quick Bite");
                    price = "$";
                } else if (name.includes("BISTRO") || name.includes("STEAK")) {
                    tags.push("Dinner", "Sit Down");
                    price = "$$$";
                }

                uniqueSpots.set(key, {
                    id: String(uniqueSpots.size + 1),
                    name: name,
                    neighborhood: city,
                    cuisine: "American / Local",
                    price: price,
                    tags: tags,
                    address: address
                });
            }
        });

        const formattedList = Array.from(uniqueSpots.values());

        // Write output directly to restaurants.json
        fs.writeFileSync('restaurants.json', JSON.stringify(formattedList, null, 2));
        console.log(`Successfully generated ${formattedList.length} unique MoCo dining spots in restaurants.json!`);

    } catch (error) {
        console.error("Error fetching data from MoCo Open Data API:", error);
    }
}

buildMoCoDatabase();