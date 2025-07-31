import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://tour-nest.vercel.app",
});

const useAxios = () => {
  return axiosInstance;
};

export default useAxios;
