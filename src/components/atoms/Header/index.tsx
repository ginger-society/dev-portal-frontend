import { auth } from "@/shared/firebase";
import { signOut } from "firebase/auth";
import React from "react";

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="header">
      <div className="icon"></div>
      <span className="brand-name">GingerDB Studio</span>
      {children}
      <div className="user-details">
        <span>Logged in as: {auth.currentUser?.email}</span>
        <button onClick={logOut}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
