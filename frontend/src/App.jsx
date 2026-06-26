import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import SignupPageView from './signup';
import { Signup } from './signup';
import DashboardView from './dashboard';
import ProtectedRoute from './protectroute';
import axios from 'axios'; 

axios.defaults.withCredentials = true; 

function Submitlogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3000/login', 
        { username, password }
      );
      
      if (response.data.success) {
        navigate('/dashboard'); 
      }
    } catch (error) {
      console.error("Error during login:", error.response?.data?.message || error.message);
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
  const [message] = useState('Login using username and password');

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