import Admin from "@/admin/Admin";
import App from "@/app/App";
import { RouteObject } from "react-router";

type Routes = RouteObject[];

const baseRoutes: Routes = [
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
    path: "/info/:section",
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
  {
    path: "/admin",
    element: <Admin />,
  },
];

const restRoutes: Routes = [
  {
    path: "*",
    element: <App />,
  },
];

export const routes = [...baseRoutes, ...restRoutes];
