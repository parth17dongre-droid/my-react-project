import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function ForgotPasswordOTP() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      const res = await axios.post('http://localhost:3000/forgot-password-otp', {email});
      if (res.data.success) {
        setMessage(res.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request. Try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post('http://localhost:3000/verify-otp', { email, otp });
      if (res.data.success) {
        setMessage("Verification complete. Please select a secure new password.");
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired verification code.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/reset-password-otp', { email, newPassword });
      if (res.data.success) {
        alert("Password updated and logged in successfully!");
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Password synchronization failed.");
    }
  };
return (
  <div className="recovery-container">
    <h2 className="recovery-title">Account Recovery</h2>
    
    {message && <p className="status-message success">{message}</p>}
    {error && <p className="status-message error">{error}</p>}

    {step === 1 && (
      <form onSubmit={handleRequestOtp} className="recovery-form">
        <p className="form-instruction">Enter the Gmail address associated with your secure portal account.</p>
        <label className="form-label">Gmail Address</label>
        <input 
          type="email" 
          required
          placeholder="name@gmail.com" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="form-input"
        />
        <button type="submit" className="btn-primary">
          Send OTP Code
        </button>
      </form>
    )}

    {step === 2 && (
      <form onSubmit={handleVerifyOtp} className="recovery-form">
        <p className="form-instruction">A unique authentication code was sent to <strong>{email}</strong>.</p>
        <label className="form-label">Enter 6-Digit OTP</label>
        <input 
          type="text" 
          required
          maxLength="6"
          placeholder="000000" 
          value={otp} 
          onChange={e => setOtp(e.target.value)} 
          className="form-input otp-input"
        />
        <button type="submit" className="btn-primary">
          Verify Code
        </button>
      </form>
    )}

    {step === 3 && (
      <form onSubmit={handlePasswordReset} className="recovery-form">
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input 
            type="password" 
            required
            placeholder="Minimum 8 characters" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input 
            type="password" 
            required
            placeholder="Re-type new password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            className="form-input"
          />
        </div>

        <button type="submit" className="btn-submit">
          Update Password & Sign In
        </button>
      </form>
    )}
    
    <div className="form-footer">
      <span onClick={() => navigate('/')} className="link-back">
        Back to Login
      </span>
    </div>
  </div>
);
}