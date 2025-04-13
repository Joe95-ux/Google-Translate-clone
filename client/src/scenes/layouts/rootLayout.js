import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Footer from "../../components/Footer";

export default function RootLayout() {
  return (
    <div className="wrapper">
      <Toaster richColors closeButton position="top-right" />

      <main className="justify-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
