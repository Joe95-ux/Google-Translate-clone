import { Outlet, useNavigate } from "react-router-dom";
import {
  ClerkProvider} from "@clerk/clerk-react";
import { Toaster } from "sonner";
import Footer from "../../components/Footer";

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export default function RootLayout() {
  const navigate = useNavigate();
  
  return (
    <ClerkProvider
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
    >
      <div className="wrapper">
        <Toaster />
       
        <main className="justify-center">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ClerkProvider>
  );
}
