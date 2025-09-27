import { db } from '../firebase.js';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

let displayedWishes = [];
let currentLimit = 10;

// Accordion functionality
function createAccordionItem(wish, index) {
  const categoryColors = {
    'personal': 'category-personal',
    'career': 'category-career', 
    'relationships': 'category-relationships',
    'health': 'category-health',
    'dreams': 'category-dreams',
    'other': 'category-other'
  };

  const categoryNames = {
    'personal': 'Personal Growth',
    'career': 'Career & Success',
    'relationships': 'Love & Relationships', 
    'health': 'Health & Wellness',
    'dreams': 'Dreams & Aspirations',
    'other': 'Other'
  };

  const date = wish.createdAt ? new Date(wish.createdAt).toLocaleDateString() : 'Unknown date';
  const categoryClass = categoryColors[wish.category] || 'category-other';
  const categoryName = categoryNames[wish.category] || wish.category;

  return `
    <div class="accordion-item" data-index="${index}">
      <div class="accordion-header" data-accordion-index="${index}">
        <div class="accordion-title">
          <span class="category-badge ${categoryClass}">${categoryName}</span>
          <span>By ${wish.name || 'Anonymous'}</span>
        </div>
        <svg class="accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      <div class="accordion-content" id="content-${index}">
        <div class="wish-content">
          "${wish.wish}"
        </div>
        <div class="wish-meta">
          <span class="wish-author">— ${wish.name || 'Anonymous'}</span>
          <span class="wish-date">${date}</span>
        </div>
      </div>
    </div>
  `;
}

// Toggle accordion function
function toggleAccordion(index) {
  const content = document.getElementById(`content-${index}`);
  const header = document.querySelector(`[data-index="${index}"] .accordion-header`);
  const icon = document.querySelector(`[data-index="${index}"] .accordion-icon`);

  if (!content || !header || !icon) return;

  const isExpanded = content.classList.contains('expanded');

  // Close all other accordions
  document.querySelectorAll('.accordion-content').forEach(item => {
    item.classList.remove('expanded');
  });
  document.querySelectorAll('.accordion-header').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelectorAll('.accordion-icon').forEach(item => {
    item.classList.remove('expanded');
  });

  // Toggle current accordion
  if (!isExpanded) {
    content.classList.add('expanded');
    header.classList.add('active');
    icon.classList.add('expanded');
  }
}

// Add event listeners to accordion items
function addAccordionEventListeners() {
  // Remove existing event listeners to prevent duplicates
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.removeEventListener('click', handleAccordionClick);
  });

  // Add new event listeners
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', handleAccordionClick);
  });
}

// Handle accordion click events
function handleAccordionClick(event) {
  const index = event.currentTarget.getAttribute('data-accordion-index');
  if (index !== null) {
    toggleAccordion(parseInt(index));
  }
}

// Load wishes from Firebase
export async function loadWishes(makeResponsive = true) {
  const container = document.getElementById('accordionContainer');
  const loadingElement = document.getElementById('loadingWishes');
  
  if (!container || !loadingElement) return;

  try {
    if (makeResponsive) {
      // Add responsive transition
      container.style.transition = 'all 0.3s ease';
    }

    loadingElement.style.display = 'block';
    loadingElement.textContent = 'Loading wishes from the tree... 🌟';

    // Your existing query code...
    const q = query(
      collection(db, "wishes"), 
      orderBy("timestamp", "desc"), 
      limit(currentLimit)
    );
    const querySnapshot = await getDocs(q);
    
    displayedWishes = [];
    querySnapshot.forEach((doc) => {
      displayedWishes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    loadingElement.style.display = 'none';

    if (displayedWishes.length === 0) {
      container.innerHTML = '<div class="no-wishes">No wishes yet. Be the first to make a wish! 🌟</div>';
      updateStats(0, 0);
      return;
    }

    const accordionHTML = displayedWishes.map((wish, index) => 
      createAccordionItem(wish, index)
    ).join('');

    const loadMoreBtn = displayedWishes.length >= currentLimit 
      ? `<button class="load-more-btn">Load More Wishes</button>` 
      : '';

    container.innerHTML = accordionHTML + loadMoreBtn;

    addAccordionEventListeners();
    addLoadMoreEventListener();
    await updateStats(displayedWishes.length);

  } catch (error) {
    console.error('Error loading wishes:', error);
    loadingElement.textContent = 'Failed to load wishes. Please try again later.';
  }
}

// Load more wishes
function loadMoreWishes() {
  currentLimit += 10;
  loadWishes();
}

// Add event listener for load more button
function addLoadMoreEventListener() {
  const loadMoreBtn = document.querySelector('.load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadMoreWishes);
  }
}

// Update statistics
async function updateStats(totalDisplayed = null) {
  try {
    // Get total count if not provided
    if (totalDisplayed === null) {
      const allWishesSnapshot = await getDocs(collection(db, "wishes"));
      totalDisplayed = allWishesSnapshot.size;
    }

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const todayQuery = query(
      collection(db, "wishes"),
      where("createdAt", ">=", todayISO)
    );
    const todaySnapshot = await getDocs(todayQuery);
    const todayCount = todaySnapshot.size;

    // Update DOM
    const totalElement = document.getElementById('totalWishes');
    const todayElement = document.getElementById('todayWishes');
    
    if (totalElement) totalElement.textContent = totalDisplayed;
    if (todayElement) todayElement.textContent = todayCount;

  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Get statistics from Firebase
async function getStats() {
  try {
    const wishesSnapshot = await getDocs(collection(db, "wishes"));
    const totalWishes = wishesSnapshot.size;
    
    // Count by category
    const categories = {};
    wishesSnapshot.forEach((doc) => {
      const data = doc.data();
      categories[data.category] = (categories[data.category] || 0) + 1;
    });
    
    console.log('📊 Current stats:', {
      total: totalWishes,
      categories: categories
    });
    
    return {
      success: true,
      stats: {
        total: totalWishes,
        categories: categories
      }
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { success: false, error: error.message };
  }
}

// Get wishes by category
async function getWishesByCategory(category) {
  try {
    const q = query(collection(db, "wishes"), where("category", "==", category));
    const querySnapshot = await getDocs(q);
    
    const wishes = [];
    querySnapshot.forEach((doc) => {
      wishes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return wishes;
  } catch (error) {
    console.error('Error getting wishes by category:', error);
    return [];
  }
}

// Filter wishes by category
window.filterWishesByCategory = function(category) {
  if (category === 'all') {
    loadWishes();
    return;
  }

  const filteredWishes = displayedWishes.filter(wish => wish.category === category);
  const container = document.getElementById('accordionContainer');
  
  if (filteredWishes.length === 0) {
    container.innerHTML = `<div class="no-wishes">No wishes found in this category. 🌟</div>`;
    return;
  }

  const accordionHTML = filteredWishes.map((wish, index) => 
    createAccordionItem(wish, index)
  ).join('');

  container.innerHTML = accordionHTML;
  
  // Add event listeners after updating DOM
  addAccordionEventListeners();
  
  // Add event listeners after updating DOM
  addAccordionEventListeners();
};

// Search wishes
window.searchWishes = function(searchTerm) {
  if (!searchTerm.trim()) {
    loadWishes();
    return;
  }

  const filteredWishes = displayedWishes.filter(wish => 
    wish.wish.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wish.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const container = document.getElementById('accordionContainer');
  
  if (filteredWishes.length === 0) {
    container.innerHTML = `<div class="no-wishes">No wishes found matching "${searchTerm}". 🔍</div>`;
    return;
  }

  const accordionHTML = filteredWishes.map((wish, index) => 
    createAccordionItem(wish, index)
  ).join('');

  container.innerHTML = accordionHTML;
};

// Test Firebase connection and load wishes on page load
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const statsData = await getStats();
    if (statsData.success) {
      console.log('✅ Firebase connection successful');
      console.log('📊 Current stats:', statsData.stats);
    }
    
    // Load wishes for display
    await loadWishes();
    
  } catch (error) {
    console.warn('⚠️ Firebase not connected yet:', error.message);
  }
});

// After successfully submitting a wish
export async function onWishSubmitted() {
  // Reset the current limit to show latest wishes
  currentLimit = 10;
  
  // Reload wishes to include the new one
  await loadWishes();
  
  // Scroll to the container to show the updated content
  const container = document.getElementById('accordionContainer');
  if (container) {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Export functions for external use
window.getStats = getStats;
window.getWishesByCategory = getWishesByCategory;
window.loadWishes = loadWishes;