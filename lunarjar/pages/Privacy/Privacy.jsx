import React from "react";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: October 12, 2025</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p>
        We may collect personal data (like name, email) and usage data (like IP
        address, browser type).
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Information</h2>
      <p>
        We use data to provide and improve our Services, communicate with users,
        and ensure security.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Data Sharing</h2>
      <p>
        We do not sell personal information. We may share data with trusted
        third-party providers who help operate the Services.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Contact</h2>
      <p>
        Questions? Contact us at <strong>your@email.com</strong>.
      </p>
    </div>
  );
}
