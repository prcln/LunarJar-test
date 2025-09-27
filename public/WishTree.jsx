import { useParams } from "react-router-dom";

export default function WishTree() {
  const { userId } = useParams();  // grab tree owner’s ID from the URL

  return (
    <div>
      <h1>User {userId}'s Wish Tree 🎋</h1>
      {/* load and render tree data for this user */}
    </div>
  );
}