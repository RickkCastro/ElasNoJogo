import "./login.css";
import useUser from "../../hooks/useUser";

export default function Login() {
  const { supabase } = useUser();
  
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
