import React from "react";
import '../legal-pages.css';

export default function Terms() {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-last-updated">Last updated: October 12, 2025</p>
      </div>

      <div className="legal-note">
        <strong>Important:</strong> By using our Services, you agree to these terms. Please read them carefully.
      </div>

      <section className="legal-section">
        <h2 className="legal-section-title">1. Acceptance of Terms</h2>
        <p className="legal-text">
          By accessing or using our Services, you agree to be bound by these Terms of Service 
          and all applicable laws and regulations.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-section-title">2. Use of Services</h2>
        <p className="legal-text">
          You agree to use our Services only for lawful purposes and in accordance with these Terms.
        </p>
        <h3 className="legal-subsection-title">2.1 Prohibited Activities</h3>
        <p className="legal-text">You agree not to:</p>
        <ul className="legal-list">
          <li>Use the Services for any illegal purpose</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt the Services</li>
          <li>Upload malicious code or viruses</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2 className="legal-section-title">3. User Accounts</h2>
        <p className="legal-text">
          You are responsible for maintaining the confidentiality of your account credentials 
          and for all activities that occur under your account.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-section-title">4. Intellectual Property</h2>
        <p className="legal-text">
          All content, features, and functionality of the Services are owned by us and are 
          protected by international copyright, trademark, and other intellectual property laws.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-section-title">5. Limitation of Liability</h2>
        <p className="legal-text">
          To the fullest extent permitted by law, we shall not be liable for any indirect, 
          incidental, special, consequential, or punitive damages resulting from your use of 
          the Services.
        </p>
      </section>

      <div className="legal-divider"></div>

      <section className="legal-section">
        <h2 className="legal-section-title">6. Contact Information</h2>
        <div className="legal-contact-box">
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="legal-emphasis" style={{ marginTop: '8px' }}>
            support@yourcompany.com
          </p>
        </div>
      </section>
    </div>
  );
}