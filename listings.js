import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getDatabase(app);

// Wait for user login state
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserListings(user.uid);
    } else {
        console.log("No user signed in");
        document.querySelector(".listings-grid").innerHTML = "<p>Please log in to see your listings.</p>";
    }
});

// Load user listings
function loadUserListings(uid) {
    const listingsRef = ref(db, `users/${uid}/listings`);

    onValue(listingsRef, (snapshot) => {
        const listingsGrid = document.querySelector('.listings-grid');
        listingsGrid.innerHTML = '';

        if (!snapshot.exists()) {
            listingsGrid.innerHTML = "<p>No listings yet.</p>";
            return;
        }

        const listingsData = snapshot.val();

        Object.keys(listingsData).forEach(productId => {
            const productData = listingsData[productId];
            console.log("Loaded product:", productId, productData); // 🔎 Debug
            renderProductCard(productId, productData);
        });
    });
}

// Render product thumbnail card
function renderProductCard(productId, productData) {
    const listingsGrid = document.querySelector('.listings-grid');

    const card = document.createElement('div');
    card.classList.add('listing-card');
    card.innerHTML = `
        <div class="listing-thumbnail">
            <img src="${productData.imageURL || 'assets/placeholder.png'}" alt="${productData.title}">
        </div>
        <div class="listing-info">
            <h3>${productData.title || "Untitled"}</h3>
            <p>${productData.description || "No description available."}</p>
            <span class="price">₹${productData.price || 0}</span>
            <small>${productData.location || "Unknown location"}</small>
        </div>
    `;

    // Open details page when clicked
    card.addEventListener('click', () => {
        openProductDetails(productId, productData);
    });

    listingsGrid.appendChild(card);
}

// Open product details (modal or separate section)
function openProductDetails(productId, productData) {
    document.querySelector('#detailsTitle').textContent = productData.title || "Untitled";
    document.querySelector('#detailsDescription').textContent = productData.description || "No description available.";
    document.querySelector('#detailsPrice').textContent = `₹${productData.price || 0}`;
    document.querySelector('#detailsLocation').textContent = productData.location || "Unknown location";
    document.querySelector('#detailsCondition').textContent = productData.condition || "N/A";
}
