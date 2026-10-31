import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : import.meta.env.VITE_Api_Url,
  withCredentials: true,
});

const useAxios = () => {
  return axiosInstance;
};

export default useAxios;
