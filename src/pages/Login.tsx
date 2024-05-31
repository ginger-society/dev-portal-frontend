import { AuthContext } from "@/shared/AuthContext";
import { auth } from "@/shared/firebase";
import router from "@/shared/router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState, useEffect, useContext } from "react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user } = useContext(AuthContext);

  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      router.navigate("/");
    }
  }, [user]);

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <div className="app-details-container">
          <img width={200} src="/ginger_icon.png" />
          <h1>GingerDB Studio</h1>
        </div>
        <div className="form-group">
          <label>Email / Username</label>
          <input
            className="base-input"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            className="base-input"
            type="password"
            placeholder="Password.."
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="btn-group">
          <button className="base-button primary" onClick={signIn}>
            Sign In
          </button>
          <button className="base-button secondary" onClick={signUp}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};
