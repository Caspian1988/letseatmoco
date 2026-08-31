let restaurants = [];
let map;
let markersGroup;

const fallbackData = [
    {
        id: "1",
        name: "168 ASIAN BURRITO",
        neighborhood: "OLNEY",
        cuisine: "Asian / Fusion",
        price: "$$",
        tags: ["Asian Cuisine", "Casual", "Local Favorite"],
        address: "Olney, MD",
        lat: 39.1531, 
        lng: -77.0669
    },
    {
        id: "2",
        name: "168 SEASONS RESTAURANT HK",
        neighborhood: "ROCKVILLE",
        cuisine: "Asian / Fusion",
        price: "$$",
        tags: ["Asian Cuisine", "Casual", "Local Favorite"],
        address: "Rockville, MD",
        lat: 39.0840, 
        lng: -77.1528
    },
    {
        id: "3",
        name: "24/7 GROCERY & FOOD",
        neighborhood: "ROCKVILLE",
        cuisine: "Local Eats",
        price: "$$",
        tags: ["Halal Options", "Quick Bite", "Local Favorite"],
        address: "Rockville, MD",
        lat: 39.0855, 
        lng: -77.1500
    }
];

fetch('restaurants.json')
    .then(res => res.json())
    .then(data => {
        restaurants = data;
        displayRestaurants(restaurants);
    })
    .catch(err => {
        restaurants = fallbackData;
        displayRestaurants(restaurants);
    });

function displayRestaurants(items) {
    const grid = document.getElementById('restaurantGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (!items || items.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: #94a3b8; padding: 2rem;">No spots found matching your filter.</p>`;
        updateMap([]);
        return;
    }

    items.forEach(spot => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div>
                <div class="card-header">
                    <h3 class="card-title">${spot.name}</h3>
                    <span class="price-tag">${spot.price || '$$'}</span>
                </div>
                <div class="neighborhood">${spot.neighborhood || 'Montgomery County'}</div>
                <div class="cuisine">${spot.cuisine || 'Local Eats'}</div>
                <div class="tags">
                    ${(spot.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join('')}
                </div>
            </div>
            <div class="address">${spot.address || ''}</div>
        `;
        grid.appendChild(card);
    });

    updateMap(items);
}

function runAiMatcher() {
    const aiInput = document.getElementById('aiInput');
    const responseBox = document.getElementById('aiResponse');
    
    if (!aiInput) return;
    const input = aiInput.value.toLowerCase().trim();

    if (!input) {
        if (responseBox) responseBox.style.display = 'none';
        displayRestaurants(restaurants);
        return;
    }

    if (responseBox) {
        responseBox.style.display = 'block';
        responseBox.innerHTML = `🤖 <em>Analyzing database for: "${input}"...</em>`;
    }

    const queryWords = input.split(/\s+/).filter(w => w.length > 2);

    const matches = restaurants.filter(r => {
        const fullText = `${r.name} ${r.neighborhood} ${r.cuisine} ${(r.tags || []).join(' ')} ${r.price}`.toLowerCase();
        return queryWords.some(word => fullText.includes(word));
    });

    setTimeout(() => {
        if (matches.length > 0) {
            if (responseBox) {
                responseBox.innerHTML = `🤖 <strong>AI Matcher:</strong> Found ${matches.length} spot(s) matching "${input}"!`;
            }
            displayRestaurants(matches);
        } else {
            if (responseBox) {
                responseBox.innerHTML = `🤖 <strong>AI Matcher:</strong> No exact match for "${input}". Showing all spots below.`;
            }
            displayRestaurants(restaurants);
        }
    }, 200);
}

function runStandardSearch(e) {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
        displayRestaurants(restaurants);
        return;
    }
    const filtered = restaurants.filter(r => 
        r.name.toLowerCase().includes(term) ||
        r.cuisine.toLowerCase().includes(term) ||
        r.neighborhood.toLowerCase().includes(term) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(term)))
    );
    displayRestaurants(filtered);
}

function filterData(category) {
    document.querySelectorAll('.pill').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }

    if (category === 'All') {
        displayRestaurants(restaurants);
    } else {
        const filtered = restaurants.filter(r => 
            r.neighborhood.toLowerCase() === category.toLowerCase() ||
            (r.tags && r.tags.some(t => t.toLowerCase() === category.toLowerCase()))
        );
        displayRestaurants(filtered);
    }
}

function initMap() {
    map = L.map('map').setView([39.15, -77.15], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markersGroup = L.layerGroup().addTo(map);
}

function updateMap(items) {
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (items.length === 0) {
        map.setView([39.15, -77.15], 11);
        return;
    }

    const bounds = [];

    items.forEach(spot => {
        if (spot.lat && spot.lng) {
            const marker = L.marker([spot.lat, spot.lng]);
            marker.bindPopup(`<b>${spot.name}</b><br>${spot.address}`);
            markersGroup.addLayer(marker);
            bounds.push([spot.lat, spot.lng]);
        }
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();

    const aiBtn = document.getElementById('aiBtn');
    const aiInput = document.getElementById('aiInput');
    const searchInput = document.getElementById('searchInput');

    if (aiBtn) aiBtn.addEventListener('click', runAiMatcher);
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') runAiMatcher();
        });
    }
    if (searchInput) searchInput.addEventListener('input', runStandardSearch);
});
