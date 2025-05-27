
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { LanguageProvider } from "@/context/LanguageContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import AllShows from "./pages/AllShows";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="band-ui-theme">
        <LanguageProvider>
          <main className="app">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/shows" element={<AllShows />} />
              <Route path="/diagnostics" element={<DiagnosticsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </main>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
