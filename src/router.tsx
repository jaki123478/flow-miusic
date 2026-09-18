import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

function DefaultPending() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted" aria-busy="true">
      Caricamento…
    </div>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultPendingComponent: DefaultPending,
    defaultPendingMs: 200,
  });
}
