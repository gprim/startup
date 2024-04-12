import { createContext, ReactNode, useEffect, useState } from "react";
import { User } from "./types";
import { LocalStorage, LocalStorageKeys } from "./LocalStorage";
import { Api } from "./Api";

type AuthContextProps = { children: ReactNode };

type AuthState = {
  user?: User;
  createAccount: (
    username: string,
    password: string,
    email: string,
  ) => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthState>({
  createAccount: async () => false,
  login: async () => false,
  logout: async () => false,
});

export const AuthContextProvider = ({ children }: AuthContextProps) => {
  const [authState, setAuthState] = useState<{ user?: User }>({});

  useEffect(() => {
    const user = LocalStorage.get<User>(LocalStorageKeys.USER);

    if (user) setAuthState((prevState) => ({ ...prevState, user }));

    (async () => {
      const { ok } = await Api.get("/api/auth");
      if (!ok) {
        setAuthState({});
        return;
      }
    })();
  }, []);

  const createAccount = async (
    username: string,
    password: string,
    email: string,
  ): Promise<boolean> => {
    const user: User = {
      username,
      password,
      email,
    };

    const { ok } = await Api.post("/api/auth", user);

    if (!ok) return false;

    LocalStorage.store(LocalStorageKeys.USER, user);

    setAuthState((prevState) => ({ ...prevState, user }));

    return true;
  };

  const login = async (username: string, password: string) => {
    const { ok } = await Api.put("/api/auth", { username, password });

    if (!ok) return false;

    const user = { username, password };

    LocalStorage.store(LocalStorageKeys.USER, user);

    setAuthState((prevState) => ({ ...prevState, user }));

    return true;
  };

  const logout = async () => {
    const { ok } = await Api.delete("/api/auth");

    if (!ok) return false;

    LocalStorage.store(LocalStorageKeys.USER, "");

    setAuthState((prevState) => ({ ...prevState, user: undefined }));

    return true;
  };

  const authContext: AuthState = {
    user: authState.user,
    createAccount,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};
