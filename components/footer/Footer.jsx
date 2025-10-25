import React from 'react';
import './Footer.css'; // Add a CSS file for styling
import { LanguageSwitcher } from '../../context/LanguageContext';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p>&copy; {currentYear} Lunar Tree Project. Chúc Mừng Năm Mới!</p>
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/tos">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
        <div>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}

export default Footer;