let restaurants = [];

// Fetch updated database dynamically
fetch('restaurants.json')
    .then(res => res.json())
    .then(data => {
        restaurants = data;
        displayRestaurants(restaurants);
    })
    .catch(err => console.error("Error loading restaurants:", err));

function displayRestaurants(items) {
    const grid = document.getElementById('restaurantGrid');
    grid.innerHTML = '';

    if (!items || items.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: #94a3b8;">No spots found matching your filter.</p>`;
        return;
    }

    items.forEach(spot => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div>
                <div class="card-header">
                    <h3 class="card-title">${spot.name}</h3>
                    <span class="price-tag">${spot.price}</span>
                </div>
                <div class="neighborhood">${spot.neighborhood}</div>
                <div class="cuisine">${spot.cuisine}</div>
                <div class="tags">
                    ${spot.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}
                </div>
            </div>
            <div class="address">${spot.address}</div>
        `;
        grid.appendChild(card);
    });
}

// Search Filter Input
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = restaurants.filter(r => 
            r.name.toLowerCase().includes(term) ||
            r.cuisine.toLowerCase().includes(term) ||
            r.neighborhood.toLowerCase().includes(term) ||
            r.tags.some(t => t.toLowerCase().includes(term))
        );
        displayRestaurants(filtered);
    });
});

// Category Pill Filter
function filterData(category) {
    document.querySelectorAll('.pill').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }

    if (category === 'All') {
        displayRestaurants(restaurants);
    } else {
        const filtered = restaurants.filter(r => 
            r.neighborhood.toLowerCase() === category.toLowerCase() ||
            r.tags.some(t => t.toLowerCase() === category.toLowerCase())
        );
        displayRestaurants(filtered);
    }
}