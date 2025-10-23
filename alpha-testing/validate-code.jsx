  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '../firebase'

  
  export const validateInviteCode = async (code) => {
    if (!code || code.trim() === '') {
      return { valid: false, error: 'Invite code is required' };
    }

    try {
      const codeRef = doc(db, 'inviteCodes', code.toUpperCase());
      const codeDoc = await getDoc(codeRef);

      if (!codeDoc.exists()) {
        return { valid: false, error: 'Invalid invite code' };
      }

      const codeData = codeDoc.data();

      if (codeData.used && codeData.maxUses === 1) {
        return { valid: false, error: 'This invite code has already been used' };
      }

      if (codeData.maxUses && codeData.usedCount >= codeData.maxUses) {
        return { valid: false, error: 'This invite code has reached its usage limit' };
      }

      return { valid: true, codeRef, codeData };
    } catch (err) {
      console.error('Error validating invite code:', err);
      return { valid: false, error: 'Error validating invite code' };
    }
  };