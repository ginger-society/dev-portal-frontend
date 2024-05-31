import { User, onAuthStateChanged } from "firebase/auth";
import { createContext, useState, useEffect } from "react";
import { auth } from "@/shared/firebase";
import router from "./router";

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
  user: User | null;
}

export const AuthContext = createContext<AppContextInterface>(initialState);
interface AuthProviderI {
  children: JSX.Element;
}

export const AuthProvider = ({ children }: AuthProviderI) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // null represents the initial loading state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
        setLoading(false);
      } else {
        console.log({ user });
        setUser(null);
        router.navigate("/login");
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
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
