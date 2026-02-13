import { createBrowserRouter, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import StudentsPage from "./pages/StudentsPage";
import InstitutionStudentRegistrationPage from "./pages/InstitutionStudentRegistrationPage";
import { RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/dashboard",
        element: (
            <RequireAuth>
                <Dashboard />
            </RequireAuth>
        ),
    },
    {
        path: "/onboarding",
        element: (
            <RequireAuth>
                <Onboarding />
            </RequireAuth>
        ),
    },
    {
        path: "/students",
        element: (
            <RequireAuth>
                <StudentsPage />
            </RequireAuth>
        ),
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);
