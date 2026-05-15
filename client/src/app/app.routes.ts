import { Routes } from "@angular/router"

export const routes: Routes = [
  { path: "", loadComponent: () => import("./home/home.component").then(m => m.HomeComponent) },
  { path: "error", loadComponent: () => import("./error/error.component").then(m => m.ErrorComponent) },
  { path: "error/:code", loadComponent: () => import("./error/error.component").then(m => m.ErrorComponent) },
  { path: "**", redirectTo: "/error/404" }
]
