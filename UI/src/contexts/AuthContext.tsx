import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "DOCTOR" | "PATIENT" | "SUPER_ADMIN" | "STAFF";
  avatar?: string;
  phone?: string;
  address?: string;
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  age?: number;
  gender?: string;
  doshaType?: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  is_verified?: "PENDING" | "VERIFIED" | "REJECTED";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: {
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          dispatch({ type: "AUTH_START" });
          const response = await authAPI.getMe();
          dispatch({ type: "AUTH_SUCCESS", payload: response.data.data });
        } catch (error) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          dispatch({ type: "AUTH_FAILURE", payload: "Session expired" });
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: {
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authAPI.login(credentials);
      const { accessToken, refreshToken, ...userData } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      dispatch({ type: "AUTH_SUCCESS", payload: userData });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      dispatch({ type: "AUTH_START" });
      const response = await authAPI.register(userData);
      const { accessToken, refreshToken, ...user } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    const token = localStorage.getItem("accessToken");

    // Call logout API first WITH token
    authAPI.logout(token).finally(() => {
      // Now safely clear tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      dispatch({ type: "LOGOUT" });
    });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
