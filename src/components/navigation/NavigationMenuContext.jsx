"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const NavigationMenuContext = createContext(null);

export function NavigationMenuProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const openMenu = useCallback(() => {
    setIsSearchOpen(false);
    setIsOpen(true);
  }, []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const openSearch = useCallback(() => {
    setIsOpen(true);
    setIsSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const value = useMemo(
    () => ({
      isOpen,
      openMenu,
      closeMenu,
      isSearchOpen,
      openSearch,
      closeSearch,
    }),
    [isOpen, openMenu, closeMenu, isSearchOpen, openSearch, closeSearch],
  );

  return (
    <NavigationMenuContext.Provider value={value}>
      {children}
    </NavigationMenuContext.Provider>
  );
}

export function useNavigationMenu() {
  const context = useContext(NavigationMenuContext);

  if (!context) {
    throw new Error("useNavigationMenu must be used within NavigationMenuProvider");
  }

  return context;
}
