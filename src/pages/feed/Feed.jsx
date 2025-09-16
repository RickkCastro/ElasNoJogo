import useUser from "../../hooks/useUser";
import Menu from "../../components/Menu";

export default function Feed() {
  const { user, profile } = useUser();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Menu />
    </div>
  );
}
