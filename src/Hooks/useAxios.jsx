import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
});

const useAxios = () => {
  return axiosInstance;
};

export default useAxios;
