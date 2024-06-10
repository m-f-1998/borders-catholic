import { Routes } from "@angular/router"

import { HawickHomeComponent } from "./hawick/home/home.component"
import { HawickSacramentsComponent } from "./hawick/sacraments/sacraments.component"

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: HawickHomeComponent },
      { path: 'sacraments', component: HawickSacramentsComponent },
    ]
  }
]
