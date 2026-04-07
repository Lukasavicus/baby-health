import { RouterProvider } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { router } from "./routes";
import { UIBootstrapProvider } from "./UIBootstrapContext";

export default function App() {
  return (
    <UIBootstrapProvider>
      <RouterProvider router={router} />
      <Toaster />
    </UIBootstrapProvider>
  );
}
