import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GrLinkNext } from "react-icons/gr";
import { BsGlobe } from "react-icons/bs";
import { RiFacebookCircleLine } from "react-icons/ri";
import { FaInstagram, FaWhatsapp, FaTwitter } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import WebsiteContactForm from "./WebsiteContactForm";
import ChatSupportModal from "./ChatSupportModal";
import { fetchSupportContactInfo } from "../../redux/slices/settings/supportSlice";

const Support = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { contactInfo } = useSelector((state) => state.support || {});

  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  const [showChatSupport, setShowChatSupport] = useState(false);

  useEffect(() => {
    dispatch(fetchSupportContactInfo());
  }, [dispatch]);

  const contactLinks = [
    { icon: <BsGlobe />, label: "Website", action: "website-form" },
    { icon: <RiFacebookCircleLine />, label: "Facebook", url: "https://www.facebook.com" },
    { icon: <FaInstagram />, label: "Instagram", url: "https://www.instagram.com" },
    { icon: <FaWhatsapp />, label: "Whatsapp", url: "https://wa.me/911234567890" },
    { icon: <FaTwitter />, label: "Twitter", url: "https://x.com" },
    { icon: <BiSupport />, label: "Customer Service", action: "chat-support" },
  ];

  const handleLinkClick = (item) => {
    if (item.action === "website-form") {
      setShowWebsiteForm(true);
      return;
    }
    // Customer Service row opens the chat modal
    if (item.action === "chat-support") {
      setShowChatSupport(true);
      return;
    }
    if (item.url?.startsWith("http")) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else if (item.url) {
      navigate(item.url);
    }
  };

  // Brand colors for each platform
  const brandColors = {
    Website:            { bg: 'bg-purple-50',  iconColor: '#7900BA',  border: 'border-purple-200'  },
    Facebook:           { bg: 'bg-blue-50',    iconColor: '#1877F2',  border: 'border-blue-200'    },
    Instagram:          { bg: 'bg-pink-50',    iconColor: '#E1306C',  border: 'border-pink-200'    },
    Whatsapp:           { bg: 'bg-green-50',   iconColor: '#25D366',  border: 'border-green-200'   },
    Twitter:            { bg: 'bg-sky-50',     iconColor: '#1DA1F2',  border: 'border-sky-200'     },
    'Customer Service': { bg: 'bg-purple-50',  iconColor: '#7900BA',  border: 'border-purple-200'  },
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-0">
        {/* Header */}
        <h1 className="font-poppins font-semibold text-[17px] text-[#18191C] mb-6">
          Contact Us
        </h1>

        <div className="flex flex-wrap gap-10">
          {/* Left Section - Description */}
          <div className="flex-1 min-w-[300px]">
            <p className="text-[#7900BA] font-medium text-[16px] mb-2">
              Who we are
            </p>
            <h2 className="font-medium text-[32px] text-[#18191C] mb-5">
              We care about customer services
            </h2>
            <p className="font-inter text-[16px] text-[#474C54] mb-6 leading-relaxed">
              Want to chat? We'd love to hear from you! Get in touch with our
              Customer Success Team to inquire about speaking events, advertising
              rates, or just say hello.
            </p>
            <button
              className="bg-[#7900BA] text-white px-8 py-3 rounded-xl font-poppins font-medium hover:bg-[#5C008A] transition-colors"
              onClick={() => setShowChatSupport(true)}
            >
              Chat Support
            </button>
          </div>

          {/* Right Section - Contact Links */}
          <div className="flex-1 min-w-[250px] space-y-3">
            {contactLinks.map((item, index) => {
              const brand = brandColors[item.label] || { bg: 'bg-gray-50', iconColor: '#7900BA', border: 'border-gray-200' };
              return (
                <div
                  key={index}
                  onClick={() => handleLinkClick(item)}
                  className={`flex justify-between items-center px-5 py-4 rounded-xl border ${brand.border} bg-white hover:shadow-md transition-all cursor-pointer group`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon badge with brand background + brand color */}
                    <span
                      className={`flex items-center justify-center w-10 h-10 rounded-xl text-xl ${brand.bg} transition-transform group-hover:scale-110 flex-shrink-0`}
                      style={{ color: brand.iconColor }}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-urbanist font-medium text-[15px] text-[#18191C]">
                        {item.label}
                      </p>
                      {/* Hint label for Website */}
                      {item.action === "website-form" && (
                        <p className="text-[11px] text-purple-500 font-medium mt-0.5">
                          Open contact form →
                        </p>
                      )}
                    </div>
                  </div>
                  <GrLinkNext
                    className="text-[#8391A1] group-hover:translate-x-1 transition-transform flex-shrink-0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Website Contact Form Modal */}
      <WebsiteContactForm
        isOpen={showWebsiteForm}
        onClose={() => setShowWebsiteForm(false)}
      />

      {/* Chat Support Modal */}
      <ChatSupportModal
        isOpen={showChatSupport}
        onClose={() => setShowChatSupport(false)}
      />
    </>
  );
};

export default Support;
