import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

export function PasswordInput({ value, onChange }) {

  return (
    <input 
      type="password" 
      placeholder="Choose Password" 
      value={value} 
      onChange={onChange} 
    />
  );
}


export default function SignupPageView() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
   const [islong,SetIsLong] = useState(false);
    const [hasNumber,SetHasNumber] = useState(false);
    const [hasLetter,SetHasLetter] = useState(false);
    const [isValid,SetIsValid] = useState(false);
  
  const handlePasswordChange = (e) => {
    const currentinput = e.target.value;
    setPassword(currentinput);
   
    if(currentinput.length >= 8) {
      SetIsLong(true);
    } else {
      SetIsLong(false);
    }
    if(/\d/.test(currentinput)) {
      SetHasNumber(true);
    } else {
      SetHasNumber(false);
    }
    if(/[a-zA-Z]/.test(currentinput)) {
      SetHasLetter(true);
    } else {
      SetHasLetter(false);
    }
    if (currentinput.length >= 8 && /\d/.test(currentinput) && /[a-zA-Z]/.test(currentinput)) {
  SetIsValid(true);
} else {
  SetIsValid(false);
}
  }


  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });
      const data = await response.json();

        if (data.success) {
            
            navigate('/dashboard');
        }
    
        
    } catch (error) {
      console.error("Error during signup:", error);
    
    }

    
  };
  return (
    <div className="login-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Sign Up</h1>
      <p>Create your modern account credentials here.</p>
      <div className="signup-form">
        <input type="text" placeholder="Choose Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <PasswordInput value={password} onChange={(e)=> handlePasswordChange(e)} />            
        <input type="email" placeholder="Choose Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={handleSignup} disabled={!isValid}>
          Register
        </button>
      </div>
      <p>Already have an account? <button onClick={() => navigate('/')}>Back to Login</button></p>
      <div className="password-requirements">
        <p>Password must meet the following requirements:</p>
        <ul>
          <li style={{ color: islong ? 'green' : 'red' }}>At least 6 characters long</li>
          <li style={{ color: hasNumber ? 'green' : 'red' }}>Contains at least one number</li>
          <li style={{ color: hasLetter ? 'green' : 'red' }}>Contains at least one letter</li>
        </ul>
      </div>
    </div>
    
    );  
  ;}

export function Signup() {
  const navigate = useNavigate();
  
  return (
    <p>Dont have an account? Sign up now <button onClick={() => navigate('/signup')}>Sign Up</button></p>
  );
}
