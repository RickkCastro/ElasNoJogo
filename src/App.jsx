import "./App.css";
import { useUser } from "./Context/UserProvider";

function App() {
    const { user, supabase } = useUser();

    function loginWithGoogle() {
        supabase.auth.signInWithOAuth({
            provider: "google",
        });
    }

    return (
        <div>
            <h1>Elas No Jogo</h1>
            {user ? (
                <div>
                    <p>Bem-vinda, {user.email}!</p>
                </div>
            ) : (
                <button onClick={loginWithGoogle}>Login with Google</button>
            )}
        </div>
    );
}

export default App;
