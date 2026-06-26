import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
export default function ProtectedRoute() {
    const token = localStorage.getItem('access_token');
    const navigate = useNavigate();

    if (!token) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
}
