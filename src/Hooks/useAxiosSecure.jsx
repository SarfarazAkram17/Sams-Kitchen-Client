import axios from "axios";
import useAuth from "./useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const axiosSecure = axios.create({
  baseURL: "https://sams-kitchen.vercel.app",
  withCredentials: true,
});

const useAxiosSecure = () => {
  const { logOutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error?.response?.status;

        if (status === 401) {
          await logOutUser();
          navigate("/login");
        }
        if (status === 403) {
          toast.error("You don't have permission to access this resource.");
          navigate("/forbidden");
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [logOutUser, navigate]);
  return axiosSecure;
};

export default useAxiosSecure;
