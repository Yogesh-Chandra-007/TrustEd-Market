import { auth, db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let currentUser = null;

export function initializeListingsPage() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            loadUserListings();
        } else {
            window.location.href = "login.html";
        }
    });
}

function loadUserListings() {
    const listingsRef = ref(db, `users/${currentUser.uid}/listings`);
    
    onValue(listingsRef, (snapshot) => {
        const listingsGrid = document.querySelector('.listings-grid');
        listingsGrid.innerHTML = '';
        
        if (!snapshot.exists()) {
            listingsGrid.innerHTML = `
                <div class="no-listings">
                    <i class="fas fa-box-open"></i>
                    <h3>No listings yet</h3>
                    <p>You haven't listed any products for sale.</p>
                    <button class="btn-primary" onclick="window.location.href='sell.html'">
                        <i class="fas fa-plus"></i> List Your First Item
                    </button>
                </div>
            `;
            return;
        }
        
        const listingsData = snapshot.val();
        Object.keys(listingsData).forEach(productId => {
            renderProductCard(productId, listingsData[productId]);
        });
    });
}

function renderProductCard(productId, productData) {
    const listingsGrid = document.querySelector('.listings-grid');
    const listingCard = document.createElement('div');
    listingCard.className = 'listing-card';
    
    const firstImage = productData.images && productData.images.length > 0 
        ? productData.images[0] 
        : 'https://images.unsplash.com/photo-1588514912908-8f5891714f8d?auto=format&fit=crop&w=500&q=80';
    
    // Use proper fallback values for every field
    const name = products.name || "Untitled Product";
    const description = products.description || "No description available.";
    const price = products.price != null ? productData.price : 0;
    const category = products.category || "N/A";
    const status = products.status || "available";
    const views = products.views != null ? productData.views : 0;
    const messages = products.messages != null ? productData.messages : 0;

    listingCard.innerHTML = `
        <div class="listing-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</div>
        <div class="listing-image">
            <img src="${firstImage}" alt="${name}" 
                 onerror="this.src='https://images.unsplash.com/photo-1588514912908-8f5891714f8d?auto=format&fit=crop&w=500&q=80'">
            ${productData.images ? `<div class="image-count"><i class="fas fa-camera"></i> ${productData.images.length}</div>` : ''}
        </div>
        <div class="listing-info">
            <h3>${name}</h3>
            <div class="listing-meta">
                <span class="price">₹${price}</span>
                <span class="category">${category}</span>
            </div>
            <p class="description">${description}</p>
            <div class="listing-stats">
                <div class="stat"><i class="fas fa-eye"></i> ${views} views</div>
                <div class="stat"><i class="fas fa-comment"></i> ${messages} messages</div>
            </div>
            <div class="listing-actions">
                <a href="pd.html?id=${productId}" class="btn-view"><i class="fas fa-eye"></i> View</a>
                ${status === 'available' ? `
                    <button class="btn-edit" data-product-id="${productId}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-mark-sold" data-product-id="${productId}"><i class="fas fa-check"></i> Mark Sold</button>` : ''}
                ${status === 'sold' ? `<button class="btn-relist" data-product-id="${productId}"><i class="fas fa-redo"></i> Relist</button>` : ''}
                <button class="btn-delete" data-product-id="${productId}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `;
    
    listingsGrid.appendChild(listingCard);
}

