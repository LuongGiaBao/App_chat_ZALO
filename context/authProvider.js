import React, { createContext, useContext, useEffect, useState } from "react";

import auth from "@react-native-firebase/auth";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubcribe = onAuthStateChanged(auth, (authenticatedUser) => {
      authenticatedUser ? setUser(authenticatedUser) : setUser(null);
      setLoading(false);
    });
    return () => unsubcribe();
  }, [user]);
  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const login = async (email, password) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e) {
      console.log(e);
    }
  };

  const logout = async () => {
    try {
      await auth().signOut();
    } catch (e) {
      console.error(e);
    }
  };

  const register = async (name, email, password) => {
    try {
      await auth().createUserWithEmailAndPassword(name, email, password);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be wrapped inside AuthContextProvider");
  }
  return value;
};
