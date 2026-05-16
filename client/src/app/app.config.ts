import { ApplicationConfig, CSP_NONCE, ENVIRONMENT_INITIALIZER, inject, provideZonelessChangeDetection } from "@angular/core"
import { routes } from "./app.routes"
import { provideHttpClient, withFetch } from "@angular/common/http"
import { provideRouter, withInMemoryScrolling } from "@angular/router"
import { FaConfig } from "@fortawesome/angular-fontawesome"

const nonce = document.querySelector ( 'meta[name="csp-nonce"]' )?.getAttribute ( "content" )

const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection ( ),
    provideRouter ( routes, withInMemoryScrolling ( {
      anchorScrolling: "enabled",
      scrollPositionRestoration: "enabled"
    } ) ),
    provideHttpClient (
      withFetch ( )
    ),
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: ( ) => { inject ( FaConfig ).autoAddCss = false },
      multi: true
    }
  ]
}

if ( nonce ) {
  appConfig.providers.push ( {
    provide: CSP_NONCE,
    useValue: nonce
  } )
}

export { appConfig }