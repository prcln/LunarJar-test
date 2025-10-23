import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.js';

// --- Helper Components ---

/**
 * A reusable component for displaying a loading spinner.
 */
function LoadingSpinner() {
  return <div className="p-10 text-center">Loading codes...</div>;
}

/**
 * A reusable component for displaying an error message.
 */
function ErrorMessage({ message }) {
  return <div className="p-10 text-center text-red-600">Error: {message}</div>;
}

/**
 * A component responsible for rendering a single row in the table.
 * This cleans up the mapping logic in the main component.
 */
function CodeTableRow({ code }) {
  // Format the timestamp safely, providing a fallback.
  const usedAtDate = code.usedAt?.seconds 
    ? new Date(code.usedAt.seconds * 1000).toLocaleString() 
    : '-';

  return (
    <tr key={code.id} className="hover:bg-gray-50">
      <td className="border p-2 font-mono">{code.code}</td>
      <td className="border p-2">
        {code.used ? (
          <span className="font-semibold text-red-600">Used</span>
        ) : (
          <span className="font-semibold text-green-600">Available</span>
        )}
      </td>
      <td className="border p-2">{code.usedBy || '-'}</td>
      <td className="border p-2">{usedAtDate}</td>
    </tr>
  );
}

// --- Main Component ---

export function AdminInviteCodes() {
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start in a loading state
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCodes = async () => {
      try {
        const codesCollection = collection(db, 'inviteCodes');
        const q = query(codesCollection, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setCodes([]);
        } else {
          const codesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCodes(codesData);
        }
      } catch (err) {
        console.error("Failed to fetch invite codes:", err);
        setError("Could not load invite codes. Please try again later.");
      } finally {
        setIsLoading(false); // Stop loading regardless of outcome
      }
    };

    loadCodes();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Conditional rendering based on the current state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold">Invite Codes</h2>
      
      {codes.length === 0 ? (
        <p>No invite codes found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Code</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Used By</th>
              <th className="border p-2 text-left">Used At</th>
            </tr>
          </thead>
          <tbody>
            {codes.map(code => (
              <CodeTableRow key={code.id} code={code} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}