import { useEffect, useState } from "react";
import { auth } from "../firebase/auth"; // Updated import path
import { Navigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner"; // Optional - create this component

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner /> {/* Or your loading component */}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}