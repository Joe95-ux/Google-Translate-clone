import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./scenes/home";
import Privacy from "./scenes/privacy";
import Activity from "./scenes/activity";
import Terms from "./scenes/terms";
import AboutUs from "./scenes/about-us";
import Ocr from "./scenes/ocr";
import HomeLayout from "./scenes/layouts/homeLayout";
import RootLayout from "./scenes/layouts/rootLayout";
import AuthLayout from "./scenes/layouts/authLayout"; 
import SignInPage from "./scenes/auth/sign-in";
import SignUpPage from "./scenes/auth/sign-up";

const App = () => {
  return (
    <div className="">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<Home />} />
          </Route>
          <Route element={<AuthLayout/>}>
            <Route path="/sign-in" element={<SignInPage />} /> 
            <Route path="/sign-up" element={<SignUpPage />} />
          </Route>
          <Route element={<RootLayout/>}>
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/ocr" element={<Ocr />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="*" element={<Navigate to='/' replace/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
