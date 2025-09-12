import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UserProvider from "./Context/UserContext/UserProvider.jsx";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Login from "./pages/login/Login.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        element={
                            <ProtectedRoute>
                                <Outlet />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/login" element={<Login />} />
                        <Route path="/*" element={<AppRoutes />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </UserProvider>
    </StrictMode>
);
