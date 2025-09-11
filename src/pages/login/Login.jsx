import { useEffect } from "react";
import useUser from "../../hooks/useUser";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabaseClient";
import "./login.css";

export default function Login() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  function loginWithGoogle() {
    supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  return (
    <div>
      <h1>Elas No Jogo</h1>
      <button onClick={loginWithGoogle}>Login with Google</button>
    </div>
  );
}
