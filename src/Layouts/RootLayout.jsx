import Navbar from "../Components/Shared/Navbar";
import { Outlet } from "react-router";
import Footer from "../Components/Shared/Footer";
import Header from "../Components/Shared/Header";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="sticky z-50 top-0">
        <Header></Header>
        <Navbar></Navbar>
      </div>
      <main className="page-enter mx-auto min-h-[45vh] w-full pt-5 sm:pt-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
