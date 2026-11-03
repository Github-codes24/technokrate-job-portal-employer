import React, { useState } from "react";
import { Outlet } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';

const MainLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop static & Mobile off-canvas drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform lg:static lg:transform-none transition-transform duration-300 ease-in-out flex-shrink-0 h-screen ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar closeMobileSidebar={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Right Section */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden w-full">
        
        {/* Navbar */}
        <div className="sticky top-0 z-30 flex-shrink-0">
          <Navbar onMenuClick={() => setMobileSidebarOpen(prev => !prev)} />
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 w-full">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default MainLayout;