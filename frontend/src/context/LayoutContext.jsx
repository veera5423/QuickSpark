import React, { createContext, useContext, useState } from 'react';

const LayoutContext = createContext(null);

export const LayoutProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <LayoutContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);

export default LayoutContext;
