import { useContext } from "react";
import UserProvider from "../Context/UserProvider";

export default function useUser() {
    return useContext(UserProvider);
}
