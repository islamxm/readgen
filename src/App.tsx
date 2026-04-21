import { Toaster, TooltipProvider } from "@shared/ui";
import { StoreProvider } from "./store";
import { BrowserRouter, Routes, Route } from "react-router";
import { EditorPage } from "@pages/editor-page";
import { HomePage } from "@pages/home-page";

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor" element={<EditorPage />} />
          </Routes>
          <Toaster />
        </TooltipProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
