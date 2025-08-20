import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://sams-kitchen.vercel.app",
  withCredentials: true
});

const useAxios = () => {
  return axiosInstance;
};

export default useAxios;
