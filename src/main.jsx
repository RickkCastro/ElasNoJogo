import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UserProvider from "./Context/UserContext/UserProvider.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthGuard from "./components/AuthGuard.jsx";
import Login from "./pages/login/Login.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import CompleteProfile from "./pages/completeProfile/CompleteProfile.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter>
        <AuthGuard>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    </UserProvider>
  </StrictMode>
);
