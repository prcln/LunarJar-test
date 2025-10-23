import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function AdminInviteCodes() {
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    const q = query(collection(db, 'inviteCodes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const codesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCodes(codesData);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Invite Codes</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Code</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Used By</th>
            <th className="border p-2">Used At</th>
          </tr>
        </thead>
        <tbody>
          {codes.map(code => (
            <tr key={code.id}>
              <td className="border p-2 font-mono">{code.code}</td>
              <td className="border p-2">
                {code.used ? 
                  <span className="text-red-600">Used</span> : 
                  <span className="text-green-600">Available</span>
                }
              </td>
              <td className="border p-2">{code.usedBy || '-'}</td>
              <td className="border p-2">
                {code.usedAt ? new Date(code.usedAt.seconds * 1000).toLocaleString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}