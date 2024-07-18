import { createContext, useState, useEffect } from "react";
import router from "./router";
import { IAMService } from "@/services";
import { ValidateTokenResponse } from "@/services/IAMService_client";

const initialState = {
  isAuthenticated: null,
  loading: false,
  user: null,
};

interface AppContextInterface {
  isAuthenticated: boolean | null;
  loading: boolean;
  setIsAuthenticated?: (value: boolean) => void;
  setLoading?: (value: boolean) => void;
  user: ValidateTokenResponse | null;
}

export const AuthContext = createContext<AppContextInterface>(initialState);
interface AuthProviderI {
  children: JSX.Element;
}

export const AuthProvider = ({ children }: AuthProviderI) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // null represents the initial loading state
  const [user, setUser] = useState<ValidateTokenResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await IAMService.identityValidateToken();
        setIsAuthenticated(true);
        setUser(userData);
        setLoading(false);
      } catch (e) {
        setUser(null);
        location.href = "http://localhost:3001#random-id/login";
        setIsAuthenticated(false);
      }
    };

    checkSession();

    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   if (user) {
    //     setIsAuthenticated(true);
    //     setUser(user);
    //     setLoading(false);
    //   } else {

    //   }
    // });
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
