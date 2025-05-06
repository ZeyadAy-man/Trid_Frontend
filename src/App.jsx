import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { Canvas } from "@react-three/fiber";
import ShoesShop from "./Pages/ShoesShop";
import { noEvents } from "@react-three/xr";
import { PCFSoftShadowMap } from "three";
import { Suspense } from "react";
import Layout from "./Admin/Layout/Layout.jsx";
import Users from "./Admin/Users/Users";
import ShowAdminPage from "./Admin/ShowAdminPage/ShowAdminPage";
import Login from "./Components/Form/Login/Login";
import SignUp from "./Components/Form/SignUp/Signup";
import ForgetPassword from "./Components/Form/ForgotPassword/Forgotpassword";
import Welcome1 from "./Components/Welcome/welcome1";
import Home from "./Components/HomePage/Home/Home";
import Cart from "./Pages/Cart";
import Profile from "./Components/HomePage/Profile/Profile";
import SportsShop from "./Pages/SportStore";
import ClientShop from "./Pages/ClientShop";
import Unauthorized from "./Pages/Unauthorized";
import ProtectedRoute from "./Components/ProtectedRoute";
import Activate from "./Components/Form/ActivateAccount/activateAccount";
import ResetPassword from "./Components/Form/ForgotPassword/ResetPassword";
import Dashboard from "./Admin/Dashboard/Dashboard.jsx";

import Loader from "./Utils/Loader/Loader";
import { Holding } from "./Utils/Holding";

const CanvasContainer = () => {
  const location = useLocation();
  const threeDRoutes = ["/shoes-shop", "/sports-shop", "/Room"];
  const shouldShowCanvas = threeDRoutes.includes(location.pathname);

  if (!shouldShowCanvas) {
    return null;
  }

  return (
    <Canvas
      style={{ width: "100vw", height: "100vh", flexGrow: 1 }}
      gl={{ antialias: true }}
      shadows="soft"
      camera={{ position: [-0.5, 0.5, 0.5] }}
      events={noEvents}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = PCFSoftShadowMap;
      }}
    >
      <Suspense fallback={<Loader />}>
        {location.pathname === "/Room" && <Holding />}
        {location.pathname === "/shoes-shop" && <ShoesShop />}
        {location.pathname === "/sports-shop" && <SportsShop />}
      </Suspense>
    </Canvas>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Welcome1 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/account" element={<Profile />} />
        <Route path="/activate-account" element={<Activate />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}> */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="showAdmin" element={<ShowAdminPage />} />
        </Route>
        {/* </ProtectedRoute> */}

        <Route
          path="/client-shop"
          element={
            <ProtectedRoute allowedRoles={["ROLE_CLIENT"]}>
              <ClientShop />
            </ProtectedRoute>
          }
        />
        <Route path="/shoes-shop" element={<div />} />
        <Route path="/sports-shop" element={<div />} />
        <Route path="/Room" element={<div />} />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Unauthorized />} />
      </Routes>

      <CanvasContainer />
    </AuthProvider>
  );
};
