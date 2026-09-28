import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DodoApp from "@/components/dodo-app";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DodoApp />
  </StrictMode>,
);
