import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
 
export default function DashboardView() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function verifyBackendSession() {
        try {
            const response = await fetch('http://localhost:3000/protected', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (!response.ok) {
                localStorage.removeItem('access_token'); 
                navigate('/');
                return;
            }

            const data = await response.json();
            if (data.success === true) {
                setLoading(false); 
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error("Session verification failed:", error);
            navigate('/');
        }
    }

    useEffect(() => {
        verifyBackendSession();
    }, []);

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
            <p>Welcome to the dashboard! You are securely logged in.</p>
        </div>
    );
}