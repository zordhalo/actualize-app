import { useState, useEffect } from "react";
import { useAuth } from "./auth/useAuth";

export default function useUser() {
  const { isReady, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    if (!isAuthenticated) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/user");
      if (response.ok) {
        const userData = await response.json();
        setData(userData);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      fetchUser();
    }
  }, [isReady, isAuthenticated]);

  return {
    data,
    loading: !isReady || loading,
    error,
    refetch: fetchUser,
  };
}
