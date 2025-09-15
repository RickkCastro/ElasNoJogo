import useUser from "../../hooks/useUser";
import Menu from "../../components/Menu";
import "./home.css";

export default function Home() {
  const { user, profile } = useUser();

  return (
    <div className="min-h-screen bg-background">
      <Menu />

      <main className="max-w-6xl mx-auto px-4 py-8"></main>
    </div>
  );
}
