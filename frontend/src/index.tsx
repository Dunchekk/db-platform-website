import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import appRouter from "./app/providers/router/router";

const root = document.getElementById("root");

if (!root) {
  throw new Error("root not found");
}

const router = appRouter;

ReactDOM.createRoot(root).render(<RouterProvider router={router} />);
