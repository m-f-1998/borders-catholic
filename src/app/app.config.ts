import { ApplicationConfig } from '@angular/core'
import { routes } from './app.routes'
import { provideHttpClient } from '@angular/common/http'
import { provideRouter } from '@angular/router'
import { provideClientHydration } from '@angular/platform-browser'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter ( routes ),
    provideClientHydration ( ),
    provideHttpClient ( )
  ]
}
