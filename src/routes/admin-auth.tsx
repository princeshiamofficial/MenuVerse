import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin-auth")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/auth" });
  },
});
