
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

// Note: To make the layout truly dynamic based on sidebar state, 
// you would typically manage the sidebar state (isExpanded) in the layout
// and pass the toggle function down, or use a separate Context for layout management.
// For simplicity in this file, we assume the sidebar itself handles its own fixed position/width
// but we adjust the padding/margin of the main content area to fit the *enhanced* widths (20/64).

const DashboardLayout = ({ children }) => {
  
  // Assuming the Sidebar uses 64px (w-16 or w-20) for collapsed and 256px (w-64) for expanded.
  // The enhanced Sidebar uses w-20 (80px) and w-64 (256px) for desktop view.

  return (
    <div className="min-h-screen flex bg-gray-100">
      
      {/* Sidebar is fixed and handles its own positioning */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div 
        className={`
          flex-1 flex flex-col 
          
          /* Desktop: Adjust margin to accommodate the sidebar's width */
          md:ml-20  /* For collapsed sidebar (w-20) */
          lg:ml-64  /* For expanded sidebar (w-64) */
          
          /* Ensures mobile views start at the top */
          pt-16 md:pt-0 
          
          transition-all duration-300
        `}
      >
        {/* Navbar is fixed to the top/right and adjusts its left boundary */}
        <Navbar />
        
        {/* Main Content Pane */}
        <main className="flex-1 p-6 md:p-8 bg-gray-100 overflow-y-auto mt-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;