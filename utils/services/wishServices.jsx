// services/wishService.js
import { 
  collection, 
  doc,
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';


import { db } from '../../firebase.js';

/**
 * Retrieve wishes with various filtering options
 */
export const wishService = {
  
  /**
   * Get a single wish by ID
   * @param {string} wishId - The wish document ID
   * @returns {Promise<Object|null>} The wish data or null if not found
   */
  async getWishById(wishId) {
    try {
      const wishRef = doc(db, 'wishes', wishId);
      const wishSnap = await getDoc(wishRef);
      
      if (wishSnap.exists()) {
        return {
          id: wishSnap.id,
          ...wishSnap.data()
        };
      }
      
      console.log('Wish not found:', wishId);
      return null;
    } catch (error) {
      console.error('Error getting wish:', error);
      throw error;
    }
  },

  /**
   * Get all wishes from a specific tree
   * @param {string} treeId - The tree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of wishes
   */
  async getWishesByTree(treeId, options = {}) {
    const {
      limitCount = 50,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      lastVisible = null
    } = options;

    try {
      let q = query(
        collection(db, 'wishes'),
        where('treeId', '==', treeId),
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      );

      // Pagination support
      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const wishes = [];
      
      querySnapshot.forEach((doc) => {
        wishes.push({
          id: doc.id,
          ...doc.data(),
          _docRef: doc // Save for pagination
        });
      });

      return {
        wishes,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error('Error getting wishes by tree:', error);
      throw error;
    }
  },

  /**
   * Get all wishes globally (across all trees)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of wishes
   */
  async getAllWishes(options = {}) {
    const {
      limitCount = 50,
      orderByField = 'createdAt',
      orderDirection = 'desc',
      lastVisible = null
    } = options;

    try {
      let q = query(
        collection(db, 'wishes'),
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      );

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(q);
      const wishes = [];
      
      querySnapshot.forEach((doc) => {
        wishes.push({
          id: doc.id,
          ...doc.data(),
          _docRef: doc
        });
      });

      return {
        wishes,
        lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error('Error getting all wishes:', error);
      throw error;
    }
  },

  /**
   * Get wishes by category
   * @param {string} category - The category to filter by
   * @param {string|null} treeId - Optional tree ID to filter
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of wishes
   */
  async getWishesByCategory(category, treeId = null, options = {}) {
    const {
      limitCount = 50,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    try {
      let q;
      
      if (treeId) {
        q = query(
          collection(db, 'wishes'),
          where('treeId', '==', treeId),
          where('category', '==', category),
          orderBy(orderByField, orderDirection),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, 'wishes'),
          where('category', '==', category),
          orderBy(orderByField, orderDirection),
          limit(limitCount)
        );
      }

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
      throw error;
    }
  },

  /**
   * Get wishes by author/user
   * @param {string} userId - The user ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of wishes
   */
  async getWishesByUser(userId, options = {}) {
    const {
      limitCount = 50,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options;

    try {
      const q = query(
        collection(db, 'wishes'),
        where('userId', '==', userId),
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      );

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
      console.error('Error getting wishes by user:', error);
      throw error;
    }
  },

  /**
   * Get recent wishes (today or last N days)
   * @param {number} days - Number of days to look back
   * @param {string|null} treeId - Optional tree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of wishes
   */
  async getRecentWishes(days = 1, treeId = null, options = {}) {
    const {
      limitCount = 50,
      orderDirection = 'desc'
    } = options;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
      const startDateISO = startDate.toISOString();

      let q;
      
      if (treeId) {
        q = query(
          collection(db, 'wishes'),
          where('treeId', '==', treeId),
          where('createdAt', '>=', startDateISO),
          orderBy('createdAt', orderDirection),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, 'wishes'),
          where('createdAt', '>=', startDateISO),
          orderBy('createdAt', orderDirection),
          limit(limitCount)
        );
      }

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
      console.error('Error getting recent wishes:', error);
      throw error;
    }
  },

  /**
   * Search wishes by text
   * Note: This is a client-side filter. For better performance with large datasets,
   * consider using Algolia or similar search service
   * @param {string} searchTerm - The search term
   * @param {string|null} treeId - Optional tree ID
   * @returns {Promise<Array>} Array of matching wishes
   */
  async searchWishes(searchTerm, treeId = null) {
    try {
      let q;
      
      if (treeId) {
        q = query(
          collection(db, 'wishes'),
          where('treeId', '==', treeId),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'wishes'),
          orderBy('createdAt', 'desc'),
          limit(100) // Limit for performance
        );
      }

      const querySnapshot = await getDocs(q);
      const wishes = [];
      const searchLower = searchTerm.toLowerCase();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const wishText = (data.wish || '').toLowerCase();
        const userName = (data.name || '').toLowerCase();
        
        if (wishText.includes(searchLower) || userName.includes(searchLower)) {
          wishes.push({
            id: doc.id,
            ...data
          });
        }
      });

      return wishes;
    } catch (error) {
      console.error('Error searching wishes:', error);
      throw error;
    }
  },

  /**
   * Get wish statistics
   * @param {string|null} treeId - Optional tree ID
   * @returns {Promise<Object>} Statistics object
   */
  async getWishStats(treeId = null) {
    try {
      let totalQuery;
      let todayQuery;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      if (treeId) {
        totalQuery = query(
          collection(db, 'wishes'),
          where('treeId', '==', treeId)
        );
        
        todayQuery = query(
          collection(db, 'wishes'),
          where('treeId', '==', treeId),
          where('createdAt', '>=', todayISO)
        );
      } else {
        totalQuery = query(collection(db, 'wishes'));
        
        todayQuery = query(
          collection(db, 'wishes'),
          where('createdAt', '>=', todayISO)
        );
      }

      const [totalSnapshot, todaySnapshot] = await Promise.all([
        getDocs(totalQuery),
        getDocs(todayQuery)
      ]);

      // Category breakdown
      const categoryCount = {};
      totalSnapshot.forEach((doc) => {
        const category = doc.data().category || 'other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      return {
        total: totalSnapshot.size,
        today: todaySnapshot.size,
        byCategory: categoryCount
      };
    } catch (error) {
      console.error('Error getting wish stats:', error);
      throw error;
    }
  },

  /**
   * Get wishes with comments count
   * @param {string} treeId - The tree ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of wishes with comment counts
   */
  async getWishesWithCommentCount(treeId, options = {}) {
    const { limitCount = 50 } = options;

    try {
      const wishesResult = await this.getWishesByTree(treeId, { limitCount });
      
      // Get comment counts for each wish
      const wishesWithCounts = await Promise.all(
        wishesResult.wishes.map(async (wish) => {
          const commentsRef = collection(db, 'wishes', wish.id, 'comments');
          const commentsSnapshot = await getDocs(commentsRef);
          
          return {
            ...wish,
            commentCount: commentsSnapshot.size
          };
        })
      );

      return {
        wishes: wishesWithCounts,
        lastVisible: wishesResult.lastVisible,
        hasMore: wishesResult.hasMore
      };
    } catch (error) {
      console.error('Error getting wishes with comment count:', error);
      throw error;
    }
  }
};


export default wishService;