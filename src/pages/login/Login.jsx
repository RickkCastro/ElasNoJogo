import "./login.css";
import supabase from "../../lib/supabaseClient";

export default function Login() {
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
