// import { createContext, useState, useEffect } from "react";
// import PropTypes from "prop-types";

// // eslint-disable-next-line react-refresh/only-export-components
// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [auth, setAuth] = useState(null);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       const parsedUser = JSON.parse(storedUser);
//       setAuth(parsedUser);
//     }
//   }, []);

//   const login = (userData) => {
//     setAuth(userData);
//     localStorage.setItem("user", JSON.stringify(userData));
//     localStorage.setItem("token", userData.token);
//   };

//   const logout = () => {
//     setAuth(null);
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//   };

//   return (
//     <AuthContext.Provider value={{ auth, login, logout, setAuth }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// AuthProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (storedUser && accessToken && refreshToken) {
      const parsedUser = JSON.parse(storedUser);
      setAuth(parsedUser);
    } else {
      localStorage.clear();
    }
  }, [navigate]);

  const login = (userData) => {
    const authData = {
      email: userData.email,
      fullName: userData.fullName,
      roles: userData.roles[0],
    };

    setAuth(authData);
    localStorage.setItem("user", JSON.stringify(authData));
    localStorage.setItem("accessToken", userData.accessToken);
    localStorage.setItem("refreshToken", userData.refreshToken);

    const role = authData.roles;
    if (role === "ROLE_USER") {
      navigate("/home");
    } else if (role === "ROLE_ADMIN") {
      navigate("/admin-dashboard");
    } else if (role === "ROLE_CLIENT") {
      navigate("/client-shop");
    }
  };

  const updateTokens = (tokens) => {
    setAuth((prevAuth) => ({
      ...prevAuth,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }));

    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  };

  const logout = () => {
    setAuth(null);
    localStorage.clear();
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        setAuth,
        updateTokens,
        isTokenRefreshing,
        setIsTokenRefreshing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
