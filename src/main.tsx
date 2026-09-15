import React from "react";
import ReactDOM from "react-dom/client";
import App from "./routes/App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import AuthProvider from "./context/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
