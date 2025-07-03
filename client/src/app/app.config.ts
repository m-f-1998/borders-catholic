import { ApplicationConfig, provideZonelessChangeDetection } from "@angular/core"
import { routes } from "./app.routes"
import { provideHttpClient } from "@angular/common/http"
import { provideRouter } from "@angular/router"

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection ( ),
    provideRouter ( routes ),
    provideHttpClient ( )
  ]
}
