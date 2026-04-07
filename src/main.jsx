import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx"; 
import "./styles/index.css";
import axios from 'axios';
import "yet-another-react-lightbox/styles.css";
// 1. Cấu hình Axios trước khi App bắt đầu chạy
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

createRoot(document.getElementById("root")).render(
  <App />
);