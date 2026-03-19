import App from "@/app/App";
import { createBrowserRouter } from "react-router";

function getGithubPagesBasename(): string {
  if (typeof window === "undefined") return "/";

  const { hostname, pathname } = window.location;
  const isGithubIo = /(^|\.)github\.io$/i.test(hostname);
  if (!isGithubIo) return "/";

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";

  return `/${segments[0]}`;
}

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
], {
  basename: getGithubPagesBasename(),
});

export default appRouter;
