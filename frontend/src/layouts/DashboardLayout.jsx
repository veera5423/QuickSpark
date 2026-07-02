 
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import MessageBanner from '../components/common/MessageBanner';
import LayoutContext from '../context/LayoutContext';
import { useState, useEffect } from 'react';

// DashboardLayout will manage the sidebar expanded/collapsed state and provide it
// via LayoutContext so both Sidebar and the main content can react to changes.
const DashboardLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    setIsDesktop(mq.matches);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
    };
  }, []);

  // Sidebar widths: collapsed = 80px, expanded = 256px
  const collapsedWidth = 80;
  const expandedWidth = 256;
  const contentMargin = isDesktop ? (isExpanded ? expandedWidth : collapsedWidth) : 0;

  useEffect(() => {
    // Prevent body scroll on mobile when sidebar (drawer) is open
    if (!isDesktop && isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDesktop, isExpanded]);

  return (
    <LayoutContext.Provider value={{ isExpanded, setIsExpanded }}>
      <div className="min-h-screen flex bg-slate-50 text-slate-900">
        <Sidebar />

        {/* Main Content Area: use inline margin to match sidebar width on desktop */}
        <div
          className={`flex-1 flex flex-col pt-16 md:pt-0 transition-all duration-300`}
          style={{ marginLeft: contentMargin }}
        >
          <Navbar />

          <main className="flex-1 p-5 sm:p-6 md:p-8 bg-[linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] overflow-y-auto mt-4 md:mt-6">
            <MessageBanner />
            {children}
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default DashboardLayout;
