import Layout from "../../components/layout/Layout";


export default function Terms() {
  return (
    <Layout>
      
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before using Studion AI.
          </p>

          <div className="mt-6 text-sm text-slate-500">
            Last Updated: 11/7/2025
          </div>
        </div>
      </section>

     
      <section className="max-w-4xl mx-auto px-6 py-16 text-slate-800 leading-relaxed">
        <div className="space-y-10 text-lg">

          <p>
            Welcome to <strong>Studion</strong> AI. By accessing or using this website,
            you agree to these Terms of Service ("Terms"). If you do not agree,
            stop using the Service immediately.
          </p>

          <div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              1. Description of the Service
            </h2>
            <p>
              <strong>Studion</strong> allows users to upload documents (such as PDFs)
              which are processed using AI to generate quizzes, summaries,
              and study content. Generated content may not always be accurate.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              2. Eligibility
            </h2>
            <p>
              You must be at least 13 years old to use the Service. If you are under 18,
              you must have parental or guardian consent.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              3. User Content & Uploads
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>You retain ownership of the documents you upload.</li>
              <li>You grant Studion a temporary license to process the uploaded content.</li>
              <li>We do not sell, publish, or reuse your uploaded documents.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              4. Prohibited Use
            </h2>
            <ul className="list-disc ml-6 space-y-2">
              <li>Do not upload content that you do not own or have permission to use.</li>
              <li>Do not upload illegal, harmful, or malicious content.</li>
              <li>Do not attempt to hack, break, or reverse engineer the platform.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              5. AI Limitations & Disclaimer
            </h2>
            <p>
              AI-generated content may be incorrect or incomplete.
              Studion is not responsible for decisions based on AI output and should not be
              considered academic, medical, legal, or professional advice.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              6. Privacy & Data Handling
            </h2>
            <p>
              Uploaded files may be stored temporarily for processing,
              but we do not sell your documents or personal data.
              For more details, see our Privacy Policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              7. Termination
            </h2>
            <p>
              We may suspend or terminate access if users violate these Terms,
              abuse the system, or engage in unlawful activity.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              8. Limitation of Liability
            </h2>
            <p>
              The Service is provided "as is" and "as available."
              We are not liable for losses resulting from using or being unable to use the platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              9. Changes to the Terms
            </h2>
            <p>
              We may update these Terms at any time. Continued use of the service
              means you accept the updated Terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2 text-slate-900">
              10. Contact Us
            </h2>
            <p>
              For questions, reach out to:
              <br />
              <strong className="text-blue-600">hello@studion.ai</strong>
            </p>
          </div>

        </div>
      </section>
    </Layout>
  );
}
