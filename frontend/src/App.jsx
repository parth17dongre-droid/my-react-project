import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import SignupPageView from './signup';
import { Signup } from './signup';
import DashboardView from './dashboard';
import ProtectedRoute from './protectroute';

function Submitlogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dahsboardAllowed, setDashboardAllowed] = useState(false);
  
  const navigate = useNavigate(); 

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      console.log(data);
      if(data.success) {
        localStorage.setItem('access_token', data.access_token);
        setDashboardAllowed(true);
        navigate('/dashboard'); 
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

function LoginPageView({ message }) {
  return (
    <div className="login-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Login Page</h1>
      <p>{message}</p>
      <Submitlogin />
      <Signup />
    </div>
  );
}

export default function App() {
  const [message, setMessage] = useState('Loading...');

  const fetchLandingData = async () => {
    try {
      const response = await fetch('http://localhost:3000');
      const data = await response.text();
      setMessage(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage('Failed to load data from backend.');
    }
  };

  useEffect(() => {
    fetchLandingData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPageView message={message} />} />
        <Route path="/signup" element={<SignupPageView />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardView />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}