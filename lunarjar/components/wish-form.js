import { db } from '../firebase.js';
import { collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
//import { loadWishes, onWishSubmitted } from '../wish-render/wish-render.js';

function WishForm() {
  // Global state
  let wishData = {
    name: '',
    wish: '',
    category: 'personal',
    isAnonymous: false
  };

  let isSubmitting = false;

  // DOM elements
  const nameInput = document.getElementById('name');
  const anonymousToggle = document.getElementById('anonymousToggle');
  const categorySelect = document.getElementById('category');
  const wishTextarea = document.getElementById('wish');
  const charCount = document.getElementById('charCount');
  const submitBtn = document.getElementById('submitBtn');
  const messageContainer = document.getElementById('messageContainer');

  // Event listeners
  nameInput.addEventListener('input', function() {
    wishData.name = this.value;
    updateSubmitButton();
  });

  anonymousToggle.addEventListener('click', function() {
    wishData.isAnonymous = !wishData.isAnonymous;
    this.classList.toggle('active');
    nameInput.disabled = wishData.isAnonymous;
    if (wishData.isAnonymous) {
      nameInput.value = '';
      wishData.name = '';
    }
    updateSubmitButton();
  });

  categorySelect.addEventListener('change', function() {
    wishData.category = this.value;
  });

  wishTextarea.addEventListener('input', function() {
    wishData.wish = this.value;
    charCount.textContent = this.value.length;
    updateSubmitButton();
  });

  submitBtn.addEventListener('click', handleSubmit);

  // Functions
  function updateSubmitButton() {
    const isValid = wishData.wish.trim() && 
                    (wishData.name.trim() || wishData.isAnonymous);
    
    submitBtn.disabled = !isValid || isSubmitting;

  }

  function showMessage(text, type = 'success') {
    messageContainer.innerHTML = `<div class="${type}-message">${text}</div>`;
    messageContainer.style.display = 'block';

    // Auto hide after 5 seconds
    setTimeout(() => {
      messageContainer.style.display = 'none';
    }, 5000);
  }

  // Submit button
  async function handleSubmit() {
    if (isSubmitting) return;

    isSubmitting = true;

    // Update button state
    submitBtn.innerHTML = `
      <div class="loading-spinner"></div>
      Adding to tree...
    `;
    submitBtn.disabled = true;

    // Prepare data for Firebase
    const wishPayload = {
      name: wishData.isAnonymous ? 'Anonymous' : wishData.name,
      wish: wishData.wish,
      category: wishData.category,
      isAnonymous: wishData.isAnonymous,
      timestamp: new Date(),
      createdAt: new Date().toISOString()
    };

    try {
      console.log('Saving wish to Firebase:', wishPayload);
      
      // Add document to 'wishes' collection
      const docRef = await addDoc(collection(db, "wishes"), wishPayload);
      
      console.log('✅ Wish saved successfully with ID:', docRef.id);
      showMessage('Your wish has been added to the tree! ✨', 'success');
      resetForm();
      
    } catch (error) {
      console.error('❌ Firebase error:', error);
      
      if (error.code === 'permission-denied') {
        showMessage('Permission denied. Please check Firebase security rules.', 'error');
      } else if (error.code === 'unavailable') {
        showMessage('Firebase is temporarily unavailable. Please try again.', 'error');
      } else {
        showMessage('Something went wrong. Please try again.', 'error');
      }
    } finally {
      onWishSubmitted();
      
      isSubmitting = false;
      
      // Reset button
      submitBtn.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
        </svg>
        Add Wish to Tree
      `;
      
      updateSubmitButton();
    }
  }

  function resetForm() {
    wishData = {
      name: '',
      wish: '',
      category: 'personal',
      isAnonymous: false
    };

    nameInput.value = '';
    nameInput.disabled = false;
    anonymousToggle.classList.remove('active');
    categorySelect.value = 'personal';
    wishTextarea.value = '';
    charCount.textContent = '0';
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

  // Initialize
  updateSubmitButton();

  // Test Firebase connection on load
  getStats()
    .then(data => {
      if (data.success) {
        console.log('✅ Firebase connection successful');
        console.log('📊 Current stats:', data.stats);
      }
    })
    .catch(error => {
      console.warn('⚠️ Firebase not connected yet:', error.message);
    });
}

export default WishForm;