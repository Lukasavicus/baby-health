import { RouterProvider } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { router } from "./routes";
import { UIBootstrapProvider } from "./UIBootstrapContext";
import { AuthProvider } from "./AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <UIBootstrapProvider>
        <RouterProvider router={router} />
        <Toaster />
      </UIBootstrapProvider>
    </AuthProvider>
  );
}
