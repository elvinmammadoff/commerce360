"use client";

import * as React from "react";
import type { CurrentUser } from "@/lib/types";

type UserContextValue = {
  user: CurrentUser;
  updateUser: (updates: Partial<Pick<CurrentUser, "name" | "title">>) => void;
};

const UserContext = React.createContext<UserContextValue | null>(null);

export function UserProvider({
  initial,
  children,
}: {
  initial: CurrentUser;
  children: React.ReactNode;
}) {
  const [user, setUser] = React.useState(initial);

  const updateUser = React.useCallback(
    (updates: Partial<Pick<CurrentUser, "name" | "title">>) => {
      setUser((prev) => {
        const name = updates.name ?? prev.name;
        const initials = name
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return { ...prev, ...updates, initials };
      });
    },
    [],
  );

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}
