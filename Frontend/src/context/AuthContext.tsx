import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  Children,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("authToken")
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    setUser(userData);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  };

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  }, []);

  const refetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem("authToken");
    if (!currentToken) {
      setIsLoading(false);
      return;
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
    setIsLoading(true);
    try {
      const response = await api.get("/customers/profile");
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user profile, logging out.", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refetchUser();
  }, [token]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
