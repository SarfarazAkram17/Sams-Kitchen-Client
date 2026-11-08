import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./Router/Router.jsx";
import AuthProvider from "./Contexts/Auth/AuthProvider.jsx";
import ConfirmProvider from "./Contexts/Confirm/ConfirmProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfirmProvider>
          <ToastContainer></ToastContainer>
          <RouterProvider router={router}></RouterProvider>
        </ConfirmProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
