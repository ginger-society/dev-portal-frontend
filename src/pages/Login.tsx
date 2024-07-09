import { AuthContext } from "@/shared/AuthContext";
import { auth } from "@/shared/firebase";
import router from "@/shared/router";
import { Button, ButtonType, Input } from "@ginger-society/ginger-ui";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState, useEffect, useContext } from "react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user } = useContext(AuthContext);
  const [error, setError] = useState<string>();
  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message.split(":")[1]);
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
    } catch (err: any) {
      setError(err.message.split(":")[1]);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <div className="app-details-container">
          <img width={200} src="/ginger_icon.png" />
          <h1>GingerDB Studio</h1>
        </div>
        <Input label="Email" onChange={(e) => setEmail(e.target.value)} />
        <Input
          label="Password"
          type="password"
          placeholder="Password.."
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className="text-error">{error}</span>
        <div className="btn-group">
          <Button label="Sign in" type={ButtonType.Primary} onClick={signIn} />
          <Button label="Sign Up" onClick={signUp} />
        </div>
      </div>
    </div>
  );
};
