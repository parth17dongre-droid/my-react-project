import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('http://localhost:3000/auth-check');
        if (res.data.success) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("ProtectedRoute auth-check failed:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h2>Verifying secure session...</h2>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}