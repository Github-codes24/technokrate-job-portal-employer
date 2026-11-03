import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { fetchEmployerTerms } from "../../redux/slices/settings/supportSlice";

function Terms() {
  const dispatch = useDispatch();
  const { terms, termsLoading } = useSelector((state) => state.support || {});

  useEffect(() => {
    dispatch(fetchEmployerTerms());
  }, [dispatch]);

  const defaultTermsList = [
    "Users must be at least 18 years old or the minimum age required for employment in their jurisdiction.",
    "Users must provide accurate and truthful information during registration and when using the App.",
    "Users are required to create an account to access certain features of the App.",
    "Users are responsible for keeping their account information secure and confidential.",
    "The App is not liable for any unauthorized access to your account resulting from your negligence.",
    "Provide accurate and up-to-date information in their profiles, resumes, and applications.",
    "Apply only for positions they are qualified for and genuinely interested in.",
    "Refrain from engaging in any fraudulent or unethical activities.",
  ];

  // If backend returns html/string content or terms array
  const apiTermsContent =
    terms?.content ||
    terms?.terms ||
    terms?.description ||
    (typeof terms === "string" ? terms : null);

  const termsList = Array.isArray(terms?.list)
    ? terms.list
    : Array.isArray(terms)
    ? terms
    : defaultTermsList;

  const handleDownload = () => {
    const title = "Terms & Services\n\n";
    let body = "";

    if (apiTermsContent && typeof apiTermsContent === "string") {
      body = apiTermsContent;
    } else {
      body = termsList.map((term, index) => `${index + 1}) ${term}`).join("\n");
    }

    const fullText = title + body;

    try {
      const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Terms_and_Services.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download terms document:", e);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 space-y-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <h1 className="font-poppins font-semibold text-[22px] text-[#18191C]">
        Terms & Services
      </h1>

      {termsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
        </div>
      ) : apiTermsContent && typeof apiTermsContent === "string" ? (
        <div
          className="font-inter font-normal text-[15px] text-[#666666] space-y-4 leading-relaxed prose max-w-none"
          dangerouslySetInnerHTML={{ __html: apiTermsContent }}
        />
      ) : (
        /* Default/Array Terms List */
        <div className="font-inter font-normal text-[16px] text-[#666666] space-y-4 leading-relaxed">
          {termsList.map((term, index) => (
            <p key={index} className="flex gap-2">
              <span className="font-semibold text-purple-700">{index + 1})</span>
              <span>{typeof term === "string" ? term : term.text || term.title}</span>
            </p>
          ))}
        </div>
      )}

      {/* Download Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleDownload}
          className="font-poppins font-medium text-[16px] h-[52px] px-10 rounded-xl bg-[#7900BA] text-white hover:bg-[#5C008A] transition-colors cursor-pointer shadow-md shadow-purple-100"
        >
          Download Terms
        </button>
      </div>
    </div>
  );
}

export default Terms;
