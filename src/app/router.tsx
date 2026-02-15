import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Onboarding from "../pages/Onboarding";
import StudentsPage from "../pages/StudentsPage";
import StudentDetailsPage from "../pages/StudentDetailsPage";
import SettingsPage from "../pages/SettingsPage";
import Verify from "../pages/Verify";

import DesignTest from "../pages/DesignTest";

export const router = createBrowserRouter([
    { path: "/", element: <Landing /> },
    { path: "/design-test", element: <DesignTest /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    {
        path: "/onboarding",
        element: (
            <ProtectedRoute>
                <Onboarding />
            </ProtectedRoute>
        ),
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: "/students",
        element: (
            <ProtectedRoute>
                <StudentsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/students/:id",
        element: (
            <ProtectedRoute>
                <StudentDetailsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/settings",
        element: (
            <ProtectedRoute>
                <SettingsPage />
            </ProtectedRoute>
        ),
    },
    {
        path: "/verify",
        element: <Verify />,
    },
]);