import useUser from "../../hooks/useUser";
import Menu from "../../components/Menu";
import "./home.css";

export default function Home() {
  const { user, profile } = useUser();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Menu />
    </div>
  );
}
