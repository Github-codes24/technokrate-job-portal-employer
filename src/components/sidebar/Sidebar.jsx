import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Database,
  Briefcase,
  CreditCard,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Award,
} from 'lucide-react';
import ConfirmModal from "../common/ConfirmModal";
import logo from '../../assets/Logo.svg';
import { getCompanyProfile } from '../../redux/slices/company/companySlice';
import { logout } from '../../redux/slices/auth/SigninSlice';
import ResponsiveLogo from "../../assets/favicon.png";

// ─── Helper ────────────────────────────────────────────────────────────────────
const getImageUrl = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) return val[0] || null;
  return val;
};

// ─── Nav Config ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'staffing', label: 'Staffing (Sales)', icon: Users, path: '/staffing' },
  { id: 'vacancies', label: 'Current Vacancies', icon: Award, path: '/vacancies' },
  {
    id: 'database',
    label: 'Database',
    icon: Database,
    hasDropdown: true,
    children: [
      { id: 'search-candidate', label: 'Search Candidate', path: '/database/search' },
      // { id: 'saved-search', label: 'Saved Search', path: '/database/saved' },
      { id: 'unlocked-candidate', label: 'Unlocked Candidate', path: '/database/unlocked' },
    ],
  },
  { id: 'myjobs', label: 'My Jobs', icon: Briefcase, path: '/my-job' },
  {
    id: 'billing',
    label: 'Plan & Billing',
    icon: CreditCard,
    hasDropdown: true,
    children: [
      { id: 'credit-usage', label: 'Credit Usage', path: '/plan/credit-usage' },
      { id: 'billing-details', label: 'Billing Details', path: '/plan/billing' },
      { id: 'subscription', label: 'Subscription', path: '/plan/subscription' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

// ─── Logo Component ────────────────────────────────────────────────────────────
const SidebarLogo = ({ isCollapsed }) => (
  <div className="flex-shrink-0 bg-white/10 backdrop-blur-md relative border-b border-purple-500">
    <div className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'justify-center px-6 py-1'} bg-white border-b border-gray-100 transition-all duration-300`}>
      <img
        src={isCollapsed ? ResponsiveLogo : logo}
        alt="Logo"
        className={`${isCollapsed ? 'h-10 w-10' : 'h-15 w-auto'} object-contain transition-all duration-300`}
      />
    </div>
  </div>
);

// ─── Nav Item Component ────────────────────────────────────────────────────────
const NavItem = ({ item, isOpen, onToggle, isCollapsed, expandSidebar, onNavigate }) => {
  const location = useLocation();
  const isChildActive = item.children?.some(child => 
    location.pathname === child.path || (child.path !== '/' && location.pathname.startsWith(child.path))
  );

  const activeStyles = "bg-white text-[#8931BA] shadow-lg border-[#8931BA]";
  const inactiveStyles = "text-white/80 border-transparent hover:bg-white/10 hover:text-white";

  const handleParentClick = () => {
    if (isCollapsed) {
      // If collapsed, expand the sidebar first and then open the dropdown
      expandSidebar();
      if (!isOpen) onToggle();
    } else {
      // Normal toggle behavior
      onToggle();
    }
  };

  if (item.hasDropdown) {
    const isActive = isChildActive;

    return (
      <li className="px-3 relative group">
        <button
          onClick={handleParentClick}
          title={isCollapsed ? item.label : ""}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 text-sm font-medium transition-all duration-300 rounded-xl border-l-[3px] mb-1
            ${isActive ? activeStyles : inactiveStyles}`}
        >
          <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#8931BA]' : 'text-white/70'}`} strokeWidth={1.5} />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left tracking-wide truncate">{item.label}</span>
              <div className="transition-transform duration-300">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </>
          )}
        </button>

        {!isCollapsed && (
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <ul className="mt-1 mb-2 space-y-1 ml-4 border-l border-white/20">
              {item.children.map(child => (
                <li key={child.id}>
                  <NavLink
                    to={child.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `block pl-6 pr-4 py-2 text-[13px] transition-all duration-200 rounded-r-lg
                      ${isActive
                        ? 'text-white font-semibold bg-white/20 border-l-2 border-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    {child.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  return (
    <li className="px-3 relative">
      <NavLink
        to={item.path}
        end={item.path === '/'}
        onClick={onNavigate}
        title={isCollapsed ? item.label : ""}
        className={({ isActive }) =>
          `w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 text-sm font-medium transition-all duration-300 rounded-xl border-l-[3px] mb-1
          ${isActive ? activeStyles : inactiveStyles}`
        }
      >
        {({ isActive }) => (
          <>
            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#8931BA]' : 'text-white/70'}`} strokeWidth={1.5} />
            {!isCollapsed && <span className="tracking-wide truncate">{item.label}</span>}
          </>
        )}
      </NavLink>
    </li>
  );
};

// ─── Bottom Branding Component ──────────────────────────────────────────────────
const SidebarBranding = ({ onLogout, isCollapsed, onNavigate }) => {
  const navigate = useNavigate();
  const { profileData, profileLoading } = useSelector(s => s.company);

  const companyName = profileData?.verificationAndDocumentation?.companyLegalName || profileData?.name || 'Servio';
  const logoUrl = getImageUrl(profileData?.companyDetail?.companyLogo);

  return (
    <div className="p-4 bg-black/10 border-t border-white/10 backdrop-blur-sm">
      <div
        onClick={() => {
          if (onNavigate) onNavigate();
          navigate('/company-profile');
        }}
        title={isCollapsed ? companyName : ""}
        className={`flex cursor-pointer items-center ${isCollapsed ? 'justify-center' : 'gap-3 p-2'} rounded-xl mb-4 hover:bg-white/5 transition-all border border-transparent hover:border-white/10`}
      >
        <div className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden bg-white/20 shadow-inner flex-shrink-0">
          {profileLoading ? (
            <div className="w-full h-full animate-pulse bg-white/20" />
          ) : logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {companyName.charAt(0)}
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-none mb-1">{companyName}</p>
            <p className="text-white/40 text-[10px] tracking-tighter">View Profile</p>
          </div>
        )}
      </div>

      <button
        onClick={onLogout}
        title={isCollapsed ? "Log out" : ""}
        className={`group w-full flex items-center cursor-pointer justify-center ${isCollapsed ? 'p-3' : 'gap-2 py-2.5'} bg-white text-[#8931BA] hover:bg-gray-50 transition-all duration-300 rounded-xl text-sm font-bold shadow-lg active:scale-95`}
      >
        <LogOut className={`w-4 h-4 transition-transform  ${!isCollapsed && 'group-hover:-translate-x-1'}`} strokeWidth={2} />
        {!isCollapsed && <span>Log out</span>}
      </button>
    </div>
  );
};

// ─── Main Sidebar Component ─────────────────────────────────────────────────────
const Sidebar = ({ closeMobileSidebar }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCompanyProfile());
    const activeItem = NAV_ITEMS.find(item =>
      item.children?.some(child => location.pathname.startsWith(child.path))
    );
    if (activeItem && !isCollapsed) setOpenDropdownId(activeItem.id);
  }, [dispatch, location.pathname, isCollapsed]);

  const handleLogout = () => {
    // Close modal first
    setShowLogoutModal(false);

    // Dispatch logout (clears Redux auth state + localStorage)
    dispatch(logout());

    // Use setTimeout to ensure Redux state updates before navigation
    // This prevents race conditions with components still trying to fetch data
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 0);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <aside
        className={`h-screen flex flex-col bg-gradient-to-r from-[#8931BA] to-fuchsia-500/80 shadow-[10px_0_30px_rgba(0,0,0,0.1)] z-50 relative overflow-visible transition-all duration-300 ease-in-out border-r border-purple-400 ${
          isCollapsed ? 'w-20' : 'w-72'
        } max-w-[85vw]`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 bg-[#8931BA] text-white rounded-full p-1 shadow-xl border border-gray-200 z-[60] hover:scale-110 transition-transform flex items-center justify-center cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <SidebarLogo isCollapsed={isCollapsed} />

        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 px-1.5">
          <nav>
            <ul className="space-y-1">
              {NAV_ITEMS.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                  expandSidebar={() => setIsCollapsed(false)}
                  onNavigate={closeMobileSidebar}
                  isOpen={openDropdownId === item.id}
                  onToggle={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                />
              ))}
            </ul>
          </nav>
        </div>

        <SidebarBranding
          onLogout={() => setShowLogoutModal(true)}
          isCollapsed={isCollapsed}
          onNavigate={closeMobileSidebar}
        />
      </aside>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Confirm Logout"
        message="You are about to be logged out. Continue?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Sidebar;
