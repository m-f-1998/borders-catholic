import { Routes } from "@angular/router"

import { HomeComponent } from "./home/home.component"
import { SacramentsComponent } from "./sacraments/sacraments.component"
import { ErrorComponent } from "./error/error.component"

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "sacraments", component: SacramentsComponent },
  { path: "error", component: ErrorComponent },
  { path: "error/:code", component: ErrorComponent },
  { path: "**", redirectTo: "/error/404" }
]
