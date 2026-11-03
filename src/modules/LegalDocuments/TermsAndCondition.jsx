import React from 'react';
import { FileText, Scale, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsAndCondition = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-9xl mx-auto">
       

        <div className="bg-white  overflow-hidden ">
          <div className="flex justify-between bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
             <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-white transition-colors  font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
            <div className="flex items-center gap-3 mb-2">
              <Scale className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold">Terms & Conditions</h1>
            </div>
            <p></p>
          </div>

          <div className="p-8 prose prose-purple max-w-none">
            <div className="space-y-8 text-gray-600">
              <section>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" /> 1. Acceptance of Terms
                </h2>
                <p className="mt-2 text-sm leading-relaxed">
                  By accessing or using the MyJob platform, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, please refrain from using our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-purple-500" /> 2. User Responsibilities
                </h2>
                <ul className="mt-2 space-y-2 text-sm list-disc pl-5">
                  <li>Users must provide accurate and truthful information in their profiles.</li>
                  <li>Employers are responsible for the validity of their job postings.</li>
                  <li>Unauthorized scraping or use of data for spamming is strictly prohibited.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" /> 3. Account Security
                </h2>
                <p className="mt-2 text-sm leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials. Any activity occurring under your account is your sole responsibility.
                </p>
              </section>

              <section className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                <h2 className="text-lg font-bold text-purple-900">4. Limitation of Liability</h2>
                <p className="mt-2 text-sm text-purple-800 italic">
                  "Technokrate Hire is a facilitator for hiring. We are not responsible for the outcome of interviews, employment disputes, or the quality of candidates/employers beyond our verification processes."
                </p>
              </section>

              <div className="pt-8 text-center border-t border-gray-100">
                {/* <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                  © 2026 MyJob Platform — All Rights Reserved
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndCondition;