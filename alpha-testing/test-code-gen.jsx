import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

async function generateInviteCode(code, maxUses = 1) {
  try {
    await setDoc(doc(db, 'inviteCodes', code.toUpperCase()), {
      code: code.toUpperCase(),
      used: false,
      usedBy: null,
      usedAt: null,
      usedCount: 0,
      maxUses: maxUses, // 1 for single use, null for unlimited
      createdAt: serverTimestamp()
    });
    console.log(`Invite code created: ${code.toUpperCase()}`);
  } catch (error) {
    console.error('Error creating invite code:', error);
  }
}

// Generate some codes
async function createMultipleCodes() {
  const codes = [
    'ALPHA2024',
    'EARLYBIRD',
    'TESTUSER',
    'BETA001',
    'BETA002'
  ];

  for (const code of codes) {
    await generateInviteCode(code, 1); // Single use
  }

  // Create unlimited use code
  await generateInviteCode('TEAMACCESS', null);
}
