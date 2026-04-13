import { createBrowserRouter } from "react-router";
import { routes } from "./routes";

function getGithubPagesBasename(): string {
  if (typeof window === "undefined") return "/";

  const { hostname, pathname } = window.location;
  const isGithubIo = /(^|\.)github\.io$/i.test(hostname);
  if (!isGithubIo) return "/";

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";

  return `/${segments[0]}`;
}

const appRouter = createBrowserRouter([...routes], {
  basename: getGithubPagesBasename(),
});

export default appRouter;
