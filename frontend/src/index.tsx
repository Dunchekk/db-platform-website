import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import AppShall from "./app/AppShall";

const root = document.getElementById("root");

if (!root) {
  throw new Error("root not found");
}

const router = createBrowserRouter([
  {
    path: "*",
    element: <AppShall />,
  },
]);

ReactDOM.createRoot(root).render(<RouterProvider router={router} />);
