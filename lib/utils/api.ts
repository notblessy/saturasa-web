import axios from "axios";
import { Cookies } from "react-cookie";

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json; charset=utf-8",
  },
  validateStatus: function (status) {
    return status < 505; // Resolve only if the status code is less than 500
  },
});

const cookies = new Cookies();

instance.interceptors.request.use(
  async (config) => {
    const token = cookies.get("accessToken");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const fetcher = async (url: string) => {
  return await instance.get(url).then((res) => {
    return res?.data as ApiResponse<any>;
  });
};

export default instance;
