import useUser from "../../hooks/useUser";
import "./home.css";

export default function Home() {
  const { user } = useUser();

  return (
    <div>
      <h1>Home</h1>
      <div>
        <p>Bem-vinda, {user.email}!</p>
      </div>
    </div>
  );
}
