import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);                          // The purpose of this useEffect is to call the checkAuth function when the component mounts or when the checkAuth function changes.

  console.log({ authUser });

  if (isCheckingAuth && !authUser)          //displays a loader when the app is checking the user's authentication status
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        {/* Protecting Routes -> based on User is autherized or not ? */}
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />           {/* Incorrect Syntax -> {authUser ? <HomePage /> : <LoginPage />} */}
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} /> 
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {/* To flash the notification */}
      <Toaster 
        position="top-center"
        // position="top-right"
        reverseOrder={false}
      />

    </div>
  );
};
export default App;
