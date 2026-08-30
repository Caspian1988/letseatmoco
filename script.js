let restaurants = [];

// Fallback dataset so local testing works without CORS blocks
const fallbackData = [
    {
        id: "1",
        name: "168 ASIAN BURRITO",
        neighborhood: "OLNEY",
        cuisine: "Asian / Fusion",
        price: "$$",
        tags: ["Asian Cuisine", "Casual", "Local Favorite"],
        address: "Olney, MD"
    },
    {
        id: "2",
        name: "168 SEASONS RESTAURANT HK",
        neighborhood: "ROCKVILLE",
        cuisine: "Asian / Fusion",
        price: "$$",
        tags: ["Asian Cuisine", "Casual", "Local Favorite"],
        address: "Rockville, MD"
    },
    {
        id: "3",
        name: "24/7 GROCERY & FOOD",
        neighborhood: "ROCKVILLE",
        cuisine: "Local Eats",
        price: "$$",
        tags: ["Halal Options", "Quick Bite", "Local Favorite"],
        address: "Rockville, MD"
    }
];

// Fetch restaurants.json, or load fallback if running off local file system
fetch('restaurants.json')
    .then(res => res.json())
    .then(data => {
        restaurants = data;
        displayRestaurants(restaurants);
    })
    .catch(err => {
        console.warn("Local file system detected. Loading fallback dataset.");
        restaurants = fallbackData;
        displayRestaurants(restaurants);
    });

// Render cards dynamically
function displayRestaurants(items) {
    const grid = document.getElementById('restaurantGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (!items || items.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: #94a3b8; padding: 2rem;">No spots found matching your filter.</p>`;
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
}

// AI Matcher Logic
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

// Standard Search Input
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

// Category Pills Filter
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
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
