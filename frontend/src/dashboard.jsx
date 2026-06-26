import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardView() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/protected');
                if (response.data.success) {
                    setData(response.data.message);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard resource records:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3000/logout');
            window.location.href = '/'; 
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <h2>Loading secure dashboard workspace...</h2>
            </div>
        );
    }


    return (
        <div className="dashboard-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Dashboard</h1>
            <p>{data || "Welcome to the dashboard! You are securely logged in."}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}