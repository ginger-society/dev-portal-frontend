import { createContext, useState, useEffect } from "react";
import router from "./router";
import { IAMService } from "@/services";
import { ValidateTokenResponse } from "@/services/IAMService_client";
import { GINGER_SOCIETY_IAM_FRONTEND_USERS } from "./references";

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
        location.href = `${GINGER_SOCIETY_IAM_FRONTEND_USERS}#dev-portal-staging/login`;
        setIsAuthenticated(false);
      }
    };

    if (!location.hash.startsWith("#/public")) {
      checkSession();
    }
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
