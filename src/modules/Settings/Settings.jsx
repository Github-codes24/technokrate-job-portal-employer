import React, { useState } from "react";
import General from "./General";
import Faqs from "./Faqs";
import Support from "./Support";
import Terms from "./Terms";
import { RiUserSettingsFill } from "react-icons/ri";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { BiSupport } from "react-icons/bi";
import { CgNotes } from "react-icons/cg";

function Settings() {
  const [tabIndex, setTabIndex] = useState(0);
  const [history, setHistory] = useState(true);

  const tabsData = [
    {
      tabName: "General",
      icon: <RiUserSettingsFill />,
      component: history ? <General setHistory={setHistory} /> : "na",
    },
    {
      tabName: "FAQ",
      icon: <AiOutlineQuestionCircle />,
      component: <Faqs />,
    },
    {
      tabName: "Support",
      icon: <BiSupport />,
      component: <Support />,
    },
    {
      tabName: "Terms & Services",
      icon: <CgNotes />,
      component: <Terms />,
    },
  ];

  const handleTabs = (idx) => {
    setTabIndex(idx);
    setHistory(true);
  };

  return (
    <div className="flex flex-col  p-5 rounded-xl bg-white">

      {/* Tabs - Fixed */}
      <div className="shrink-0 ">
        <div className="flex gap-8 flex-wrap">
          {tabsData.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabs(index)}
              className={`flex items-center gap-2 pb-0 px-4 font-semibold text-sm
              ${index === tabIndex
                  // border-b-2 border-[#7900BA]
                  ? "text-[#7900BA] "
                  : "text-[#767F8C] hover:text-[#7900BA]"
                }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.tabName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col overflow-y-auto mt-2">
        <div className="bg-white p-2 flex-1">
          {tabsData[tabIndex].component}
        </div>
      </div>

    </div>
  );

}

export default Settings;
