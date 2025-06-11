"use client";

import React, { createContext, useState, useContext } from "react";

const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    multipleQuestions: null,
    mainInfo: null,
    profilePic: null,
    birthdaySection: null,
    userImages: null,
  });

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => useContext(UserDataContext);
