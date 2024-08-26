"use server"
import Link from 'next/link';

export default async function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy for AligarhHostel.com</h1>
      <p className="mb-6">Last updated: {currentDate}</p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
        <p>AligarhHostel.com ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website and services.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
        <ul className="list-disc pl-5">
          <li>Personal information (name, email, phone number)</li>
          <li>Payment information</li>
          <li>Authentication data through Google Sign-In</li>
          <li>Usage data and cookies</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
        <ul className="list-disc pl-5">
          <li>To provide and manage our services</li>
          <li>To communicate with you</li>
          <li>To improve our website and services</li>
          <li>For security and fraud prevention</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
        <p>We do not sell your personal information. We may share information with:</p>
        <ul className="list-disc pl-5">
          <li>Service providers</li>
          <li>Legal authorities when required by law</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
        <p>We implement reasonable security measures to protect your information.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal information.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">7. Changes to This Policy</h2>
        <p>We may update this policy and will notify you of any significant changes.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">8. Contact Us</h2>
        <p>For questions about this policy, contact us at <a href="mailto:contact@aligarhhostel.com" className="text-blue-600 hover:underline">support@aligarhhostel.com</a>.</p>
      </section>

      <Link href="/" className="text-blue-600 hover:underline">
        Back to Home
      </Link>
    </div>
  );
}