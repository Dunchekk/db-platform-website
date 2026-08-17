import App from "@/app/App";
import { lazy, Suspense } from "react";
import { RouteObject } from "react-router";

type Routes = RouteObject[];

const Admin = lazy(() => import("@/admin/Admin"));

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
    element: (
      <Suspense fallback={null}>
        <Admin />
      </Suspense>
    ),
  },
];

const restRoutes: Routes = [
  {
    path: "*",
    element: <App />,
  },
];

export const routes = [...baseRoutes, ...restRoutes];
