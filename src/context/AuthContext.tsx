import { createContext, ReactNode, useState } from "react";
import { User } from "./types";

type AuthContextProps = { children: ReactNode };

type AuthState = {
  user?: User;
};

export const AuthContext = createContext<AuthState>({});

export const AuthContextProvider = ({ children }: AuthContextProps) => {
  const [authState] = useState<AuthState>({});

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
};
