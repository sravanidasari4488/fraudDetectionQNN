import { createContext, useState } from "react";

export const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};
