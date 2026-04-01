import { StoreProvider } from "./store";
import { EditorPage } from "./ui/pages";
import { TooltipProvider } from "./ui/shared/tooltip";
import { Toaster } from "./ui/shared";

function App() {
  return (
    <StoreProvider>
      <TooltipProvider>
        <EditorPage />
        <Toaster/>
      </TooltipProvider>
    </StoreProvider>
  );
}

export default App;
