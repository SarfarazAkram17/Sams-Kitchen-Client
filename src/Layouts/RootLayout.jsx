import React from "react";
import Navbar from "../Components/Shared/Navbar";
import { Outlet } from "react-router";
import Footer from "../Components/Shared/Footer";
import Header from "../Components/Shared/Header";

const RootLayout = () => {
  return (
    <div className="xl:container mx-auto">
      <div className="sticky z-50 top-0">
        <Header></Header>
      </div>
      <Navbar></Navbar>
      <div className="my-8">
        <Outlet></Outlet>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default RootLayout;
