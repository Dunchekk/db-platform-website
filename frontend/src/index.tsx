import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import appRouter from "./app/providers/router/router";
import { ObjectsProvider } from "@/shared/objects/objects.context";
import "@/app/styles/reset.css";
import "@/app/styles/font.css";
import "@/app/styles/config.css";
import "@/app/styles/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("root not found");
}

const router = appRouter;

ReactDOM.createRoot(root).render(
  <ObjectsProvider>
    <RouterProvider router={router} />
  </ObjectsProvider>
);
