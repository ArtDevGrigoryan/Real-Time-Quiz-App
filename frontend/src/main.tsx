import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router.config";
import "./index.css";
import { SocketProvider } from "./hooks/useSocket";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <RouterProvider router={router} />,
  </SocketProvider>,
);
