import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element was not found.");

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
