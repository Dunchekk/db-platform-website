import App from "@/app/App";
import { createBrowserRouter } from "react-router";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/about",
    element: <App />,
  },
  {
    path: "/checkout",
    element: <App />,
  },
  {
    path: "/info",
    element: <App />,
  },
  {
    path: "/object/:id",
    element: <App />,
  },
  {
    path: "/object/:id/checkout",
    element: <App />,
  },
]);

export default appRouter;
