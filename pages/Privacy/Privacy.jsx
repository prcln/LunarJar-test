import React from "react";
import '../legal-pages.css';

export default function Privacy() {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-last-updated">Last updated: October 12, 2025</p>
      </div>

      <section className="legal-section">
        <h2 className="legal-section-title">1. Information We Collect</h2>
        <p className="legal-text">
          We may collect personal data (like name, email) and usage data (like IP
          address, browser type).
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-section-title">2. How We Use Information</h2>
        <p className="legal-text">
          We use data to provide and improve our Services, communicate with users,
          and ensure security.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-section-title">3. Data Sharing</h2>
        <p className="legal-text">
          We do not sell personal information. We may share data with trusted
          third-party providers who help operate the Services.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-section-title">4. Contact</h2>
        <div className="legal-contact-box">
          <p>
            Questions? Contact us at <span className="legal-emphasis">your@email.com</span>
          </p>
        </div>
      </section>
    </div>
  );
}