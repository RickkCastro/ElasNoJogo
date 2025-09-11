import useUser from "../../hooks/useUser";
import "./home.css";
import supabase from "../../lib/supabaseClient";

export default function Home() {
  const { user } = useUser();

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div>
      <h1>Home</h1>
      <div>
        <p>Bem-vinda, {user.email}!</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
