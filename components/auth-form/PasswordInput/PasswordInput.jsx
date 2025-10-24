import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './PasswordInput.css'; // We will create this CSS file

export default function PasswordInput({ value, onChange, placeholder, id }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    // 1. The wrapper div that will be our positioning anchor.
    <div className="password-input-container">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        id={id}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="password-input"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="password-toggle-icon" // The icon button
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}