
import { ShieldCheck } from "lucide-react";
import Layout from "../../components/layout/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your privacy matters. Below is how we collect, use, and protect your information.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 leading-relaxed text-slate-700">
        <div className="space-y-10">

          <p>
            Welcome to <strong>Studion</strong> AI. We are committed to protecting your personal information
            and respecting your privacy.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">1. Information We Collect</h2>
          <p>
            We may collect certain information when you create an account or use the platform, including:
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Name and email address</li>
            <li>Uploaded documents (PDF, Word, etc.) for processing</li>
            <li>Usage information such as quiz attempts or generated content</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-900">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Generate quizzes, summaries, and learning materials</li>
            <li>Improve platform performance and user experience</li>
            <li>Send service-related emails and updates</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-900">3. File Upload & Data Storage</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>You always maintain ownership of files you upload.</li>
            <li>Uploaded documents are stored temporarily only for processing.</li>
            <li>We never sell, publish, or reuse your documents.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-900">4. Cookies & Tracking</h2>
          <p>
            We may use cookies to enhance the experience (authentication, analytics).  
            No creepy spying. Just basic functionality.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">5. Third-Party Services</h2>
          <p>
            We may use third-party tools for payment, analytics, or storage.  
            These services follow their own privacy policies.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">6. Security</h2>
          <p>
            We use technical and organizational safeguards to protect data.  
            However, no internet transmission is 100% secure.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">7. Your Rights</h2>
          <p>You may request to:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Delete your account</li>
            <li>Delete uploaded files</li>
            <li>Access or export your data</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-900">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy at any time. Continued use of the Service
            means you accept the updated policy.
          </p>

          <h2 className="text-2xl font-semibold text-slate-900">9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy:
            <br />
            📧 <strong>privacy@studion.ai</strong>
          </p>
        </div>
      </section>
    </Layout>
  );
}
