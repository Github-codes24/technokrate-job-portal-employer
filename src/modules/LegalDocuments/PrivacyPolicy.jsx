import React from 'react';
import { ShieldCheck, Eye, Lock, FileText, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Eye,
      title: "Information Collection",
      content: "We collect information you provide directly to us when creating an account, such as your name, email address, and professional background to improve our hiring services."
    },
    {
      icon: ShieldCheck,
      title: "How We Use Data",
      content: "Your data is used to personalize your experience, process applications, and communicate updates regarding job postings or candidate status."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We implement industry-standard security measures (encryption and secure servers) to protect your personal information from unauthorized access."
    },
    {
      icon: Globe,
      title: "Cookies Policy",
      content: "We use cookies to understand site usage and improve our interface. You can control cookie settings through your browser preferences."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-9xl mx-auto">
        

        <div className="bg-white overflow-hidden ">
          <div className="flex justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
            <button 
          onClick={() => navigate(-1)}
          className="flex justify-center items-center gap-2 text-white hover:text-white transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 text-white" /> Back
        </button>
            <div className="flex items-center gap-3 mb-2">
                
              <ShieldCheck className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
            </div>
            {/* <p className="text-purple-100">Last updated: April 2026</p> */}
            <p className="text-purple-100"></p>
          </div>

          <div className="p-8 space-y-10">
            <section>
              <p className="text-gray-600 leading-relaxed">
                At <strong>Technokrate Hire</strong>, your privacy is our priority. This policy outlines how we handle your data to provide a transparent and secure hiring ecosystem.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sections.map((section, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-all group">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <section.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>

            <section className="border-t border-gray-100 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" /> Contact Us
              </h3>
              <p className="text-gray-600 text-sm">
                If you have questions about this Privacy Policy, please contact our support team at 
                <span className="text-purple-600 font-semibold ml-1">support@technokrate.com</span>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;