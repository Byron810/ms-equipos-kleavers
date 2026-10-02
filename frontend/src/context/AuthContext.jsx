import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("id_token");
    if (token) {
      const payload = decodeToken(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser(payload);
      } else {
        localStorage.removeItem("id_token");
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("id_token", token);
    setUser(decodeToken(token));
  };

  const logout = () => {
    localStorage.removeItem("id_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
