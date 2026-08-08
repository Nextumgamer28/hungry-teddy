import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

// Load config dynamically since it's just served statically
const response = await fetch('/firebase-applet-config.json');
const firebaseConfig = await response.json();

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/calendar');

// DOM Elements
const writeReviewBtn = document.getElementById('write-review-btn');
const composeArea = document.getElementById('review-compose-area');
const cancelReviewBtn = document.getElementById('cancel-review-btn');
const submitReviewBtn = document.getElementById('submit-review-btn');
const reviewsList = document.getElementById('reviews-list');
const textInput = document.getElementById('review-text-input');
const userNameEl = document.getElementById('review-user-name');
const userAvatarEl = document.getElementById('review-user-avatar');
const sortSelect = document.getElementById('review-sort-select');

let currentUser = null;
let currentAccessToken = null;
let currentRating = 5;
let cachedReviews = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 5;
const loadMoreBtn = document.getElementById('load-more-btn');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        renderReviews();
    });
}

// Initialize Rating UI
const stars = document.querySelectorAll('.rating-star');
stars.forEach(star => {
    star.addEventListener('click', (e) => {
        currentRating = parseInt(e.target.dataset.value);
        updateStarsUI();
    });


});

function updateStarsUI() {
    stars.forEach(star => {
        if (parseInt(star.dataset.value) <= currentRating) {
            star.style.opacity = '1';
        } else {
            star.style.opacity = '0.3';
        }
    });
}

// Handle Auth State
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        // Logged in
        writeReviewBtn.innerHTML = `<span>✍️</span> Write a Review`;
        userNameEl.textContent = user.displayName || 'Anonymous';
        userAvatarEl.src = user.photoURL || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ccc"/><text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dy=".3em">U</text></svg>';
    } else {
        // Logged out
        writeReviewBtn.innerHTML = `<span>🔒</span> Login to Review`;
        composeArea.classList.add('hidden');
    }
    renderReviews();


});

// Handle "Write Review" Click
writeReviewBtn.addEventListener('click', async () => {
    if (currentUser) {
        // Toggle compose area
        composeArea.classList.toggle('hidden');
    } else {
        // Trigger login
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            currentUser = result.user;
            if (credential && credential.accessToken) {
                currentAccessToken = credential.accessToken;
            }
            composeArea.classList.remove('hidden');
        } catch (error) {
            console.error("Login failed", error);
            alert("Could not log in. Please try again.");
        }
    }


});

// Handle Cancel
cancelReviewBtn.addEventListener('click', () => {
    composeArea.classList.add('hidden');
    textInput.value = '';
    currentRating = 5;
    updateStarsUI();


});

// Handle Submit
submitReviewBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    if (!text) {
        alert("Please write something first!");
        return;
    }
    if (!currentUser) return;

    
    submitReviewBtn.disabled = true;
    submitReviewBtn.textContent = 'Checking...';

    try {
        const profanityRes = await fetch('/api/check-profanity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        const profanityData = await profanityRes.json();
        
        if (profanityData.isProfane) {
            alert("Your review contains inappropriate language and cannot be posted.");
            submitReviewBtn.disabled = false;
            submitReviewBtn.textContent = 'Submit Review';
            return;
        }
    } catch (err) {
        console.error("Error checking profanity:", err);
        // proceed if check fails
    }

    submitReviewBtn.textContent = 'Posting...';

    try {
        await addDoc(collection(db, 'reviews'), {
            text: text,
            rating: currentRating,
            authorId: currentUser.uid,
            authorName: currentUser.displayName || 'Anonymous',
            authorPhoto: currentUser.photoURL || '',
            createdAt: serverTimestamp()
        });
        
        // Trigger backend onboarding/lead tracking (Sheets/Gmail)
        if (currentUser.email) {
            fetch('/api/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken: currentAccessToken,
                    displayName: currentUser.displayName,
                    email: currentUser.email
                })
            }).catch(err => console.error("Onboarding error:", err));
        }
        
        textInput.value = '';
        currentRating = 5;
        updateStarsUI();
        composeArea.classList.add('hidden');
    } catch (error) {
        console.error("Error posting review", error);
        alert("Failed to post review. Please try again.");
    } finally {
        submitReviewBtn.disabled = false;
        submitReviewBtn.textContent = 'Submit Review';
    }


});

function getStarsHtml(rating) {
    let html = '<div style="color: #fbbf24; font-size: 1.1rem;">';
    for (let i = 1; i <= 5; i++) {
        html += i <= rating ? '★' : '<span style="opacity:0.3">★</span>';
    }
    html += '</div>';
    return html;
}

function renderReviews() {
    reviewsList.innerHTML = '';
    
    // Filter out "Kaidy no 28" per user request
    let filteredReviews = cachedReviews.filter(r => (r.authorName || '').toLowerCase() !== 'kaidy no 28');
    
    if (filteredReviews.length === 0) {
        reviewsList.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; opacity: 0.6;">No reviews yet. Be the first!</div>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    const currentSort = sortSelect ? sortSelect.value : 'recent';
    
    if (currentSort === 'highest') {
        filteredReviews.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            if (ratingB !== ratingA) return ratingB - ratingA;
            const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });
    }

    const visibleReviews = filteredReviews.slice(0, currentPage * ITEMS_PER_PAGE);

    if (loadMoreBtn) {
        if (filteredReviews.length > visibleReviews.length) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    visibleReviews.forEach((data) => {
        const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ccc"/><text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dy=".3em">U</text></svg>';
        const avatar = data.authorPhoto || defaultAvatar;
        
        let dateStr = '';
        if (data.createdAt) {
            dateStr = data.createdAt.toDate().toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } else {
            dateStr = 'Just now';
        }

        const isAuthor = currentUser && currentUser.uid === data.authorId;
        const deleteBtnHtml = isAuthor ? 
            `<button class="delete-review-btn" onclick="window.openDeleteModal('${data.id}')" data-id="${data.id}" style="margin-left: auto; background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.5; padding: 0.4rem; border-radius: 50%; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; position: relative; z-index: 10;" title="Delete Review" onmouseover="this.style.opacity=1; this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.opacity=0.5; this.style.background='transparent'">🗑️</button>` : '';

        const reviewCard = document.createElement('div');
        reviewCard.className = 'glass-card';
        reviewCard.style.padding = '1.25rem';
        reviewCard.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                <img src="${avatar}" alt="${data.authorName}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <div>
                    <div style="font-weight: 600; font-size: 0.95rem;">${data.authorName}</div>
                    <div style="font-size: 0.8rem; opacity: 0.6;">${dateStr}</div>
                </div>
                ${deleteBtnHtml}
            </div>
            <div style="margin-bottom: 0.5rem;">
                ${getStarsHtml(data.rating || 5)}
            </div>
            <p style="margin: 0; line-height: 1.5; font-size: 0.95rem; white-space: pre-wrap;">${data.text}</p>
        `;
        reviewsList.appendChild(reviewCard);
    });

    
}

// Fetch all reviews, sort client-side to avoid composite index requirement
const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));

onSnapshot(reviewsQuery, (snapshot) => {
    cachedReviews = [];
    snapshot.forEach((doc) => {
        cachedReviews.push({ id: doc.id, ...doc.data() });
    });
    renderReviews();
}, (error) => {
    console.error("Error fetching reviews:", error);
    reviewsList.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; opacity: 0.6; color: var(--accent-red);">Failed to load reviews.</div>';
});



let reviewToDeleteId = null;


window.closeDeleteModal = function() {
    reviewToDeleteId = null;
    const deleteModal = document.getElementById('delete-review-modal');
    if (deleteModal) {
        deleteModal.style.display = 'none';
    }
};

window.confirmDeleteReview = async function() {
    const confirmBtn = document.getElementById('confirm-delete-btn');
    if (confirmBtn && reviewToDeleteId) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Deleting...';
        try {
            await deleteDoc(doc(db, 'reviews', reviewToDeleteId));
            console.log("Successfully deleted review:", reviewToDeleteId);
            window.closeDeleteModal();
        } catch (err) {
            console.error("Error deleting review:", err);
            alert("Failed to delete review.");
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Yes, Delete';
        }
    }
};

window.openDeleteModal = function(id) {
    reviewToDeleteId = id;
    const deleteModal = document.getElementById('delete-review-modal');
    if (deleteModal) {
        deleteModal.style.display = 'flex';
        console.log("Delete modal opened for review:", reviewToDeleteId);
    }
};






if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        currentPage = 1;
        renderReviews();
    });
}
