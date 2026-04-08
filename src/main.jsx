import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import CalendarComponent from "./pages/CalendarComponent";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CalendarComponent />
  </StrictMode>
);
