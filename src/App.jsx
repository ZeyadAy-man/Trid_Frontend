import { AuthProvider } from './Context/AuthContext';
import { Canvas } from '@react-three/fiber';
import ShoesShop from './Pages/ShoesShop';

import { noEvents } from '@react-three/xr';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PCFSoftShadowMap } from 'three';
import { Suspense } from "react";
import Login from "./Components/Form/Login/Login";
import SignUp from "./Components/Form/SignUp/Signup";
import ForgetPassword from "./Components/Form/ForgotPassword/Forgotpassword";
import Welcome1 from "./Components/Welcome/welcome1";
import Home from "./Components/HomePage/Home/Home";
import Cart from "./Pages/Cart";
import Profile from "./Components/HomePage/Profile/Profile";
import SportsShop from "./Pages/SportStore";
import AdminDashboard from "./Pages/AdminDashboard";
import ClientShop from "./Pages/ClientShop";
import Unauthorized from "./Pages/Unauthorized";
import ProtectedRoute from "./Components/ProtectedRoute";
import Activate from "./Components/Form/ActivateAccount/activateAccount";
import ResetPassword from "./Components/Form/ForgotPassword/ResetPassword";
import Loader from './Utils/Loader/Loader';
import { Holding } from './Utils/Holding';

export const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Welcome1 />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/forgot-password" element={<ForgetPassword />}></Route>
        <Route path="/cart" element={<Cart />}></Route>
        <Route path="/account" element={<Profile />}></Route>
        <Route path="/activate-account" element={<Activate />}></Route>
        <Route path="/reset-password" element={<ResetPassword />}></Route>
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}>
              <Home />
            </ProtectedRoute>
          }
          />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
          />
        <Route
          path="/client-shop"
          element={
            <ProtectedRoute allowedRoles={["ROLE_CLIENT"]}>
              <ClientShop />
            </ProtectedRoute>
          }
          />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
      
      <Canvas
        style={{ width: '100vw', height: '100vh', flexGrow: 1 }}
        gl={{ antialias: true }}
        shadows="soft"
        camera={{ position: [-0.5, 0.5, 0.5] }}
        events={noEvents}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = PCFSoftShadowMap;
        }}
        >
        <Suspense fallback={<Loader/>}>
          <Routes>
              <Route path='/Room' element={<Holding/>}></Route>
              <Route path="shoes-shop" element={<ShoesShop />}></Route>
              <Route path="sports-shop" element={<SportsShop />}></Route>
          </Routes>
        </Suspense> 
      </Canvas>
    </AuthProvider>
  );
};
