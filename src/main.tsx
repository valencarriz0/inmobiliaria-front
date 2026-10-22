import React from "react";
import ReactDOM from "react-dom/client";
import App from "./routes/App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import AuthProvider from "./context/AuthProvider";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <App />
        <Toaster position="bottom-right" closeButton toastOptions={{ style: { background: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)", fontFamily: "var(--font-sans)" } }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
