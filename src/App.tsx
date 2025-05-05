import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="band-ui-theme">
        <main className="app">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/diagnostics" element={<DiagnosticsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </main>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
