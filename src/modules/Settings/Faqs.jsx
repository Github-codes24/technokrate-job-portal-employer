import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlus, FiSearch } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { Loader2 } from "lucide-react";
import {
  fetchFaqs,
  fetchFaqCategories,
} from "../../redux/slices/settings/supportSlice";

const Faqs = () => {
  const dispatch = useDispatch();
  const { faqs, faqCategories, faqLoading } = useSelector(
    (state) => state.support || {}
  );

  const [activeId, setActiveId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    dispatch(fetchFaqCategories());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(
      fetchFaqs({
        page: 1,
        limit: 20,
        category: selectedCategory === "All" ? "" : selectedCategory,
        search: debouncedSearch,
      })
    );
  }, [dispatch, selectedCategory, debouncedSearch]);

  const toggleAccordion = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  const categories = ["All", ...(faqCategories || [])];

  return (
    <div className="max-w-6xl mx-auto mt-0 h-full border border-gray-200 shadow-[0_0_5px_0_rgba(88,88,88,0.3)] p-4 sm:p-6 rounded-2xl bg-white space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs (e.g. job, billing)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-200 transition"
          />
        </div>

        {/* Categories Pills */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(typeof cat === "string" ? cat : cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === (typeof cat === "string" ? cat : cat.name)
                    ? "bg-purple-700 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {typeof cat === "string" ? cat : cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Accordion List */}
      {faqLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          No FAQs found for your search criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((item, idx) => {
            const id = item._id || item.id || idx;
            const isOpen = activeId === id;

            return (
              <div
                key={id}
                className="border border-[#E4E5E8] rounded-xl bg-white shadow-sm overflow-hidden transition"
              >
                <button
                  onClick={() => toggleAccordion(id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer hover:bg-gray-50/50"
                >
                  <span
                    className={`font-medium text-sm sm:text-base transition-colors ${
                      isOpen ? "text-[#7900BA]" : "text-[#18191C]"
                    }`}
                  >
                    {item.question || item.title}
                  </span>

                  <span className="text-[#0A65CC] flex-shrink-0 ml-3">
                    {isOpen ? (
                      <RxCross2 size={18} className="text-[#7900BA]" />
                    ) : (
                      <FiPlus size={18} />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-3 text-sm text-[#5E6670] leading-relaxed border-t border-[#E4E5E8] bg-gray-50/30">
                    {item.answer || item.description || item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Faqs;
