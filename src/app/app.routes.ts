import { Routes } from "@angular/router"

import { HawickHomeComponent } from "./home/home.component"
import { HawickSacramentsComponent } from "./sacraments/sacraments.component"

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: HawickHomeComponent },
      { path: 'sacraments', component: HawickSacramentsComponent },
    ]
  }
]
