import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  // In Production: No, <StrictMode> has no impact. It's completely stripped out of production builds, and the dual rendering behavior does not occur.
  // <StrictMode> is a tool provided by React to help developers write better, more robust code by identifying potential issues early in the development process. It does this by enabling extra checks and warnings.
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
