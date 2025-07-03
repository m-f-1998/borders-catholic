import { ApplicationConfig, CSP_NONCE, provideZonelessChangeDetection } from "@angular/core"
import { routes } from "./app.routes"
import { provideHttpClient } from "@angular/common/http"
import { provideRouter } from "@angular/router"

const nonce = document.querySelector ( 'meta[name="csp-nonce"]' )?.getAttribute ( "content" )

const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection ( ),
    provideRouter ( routes ),
    provideHttpClient ( )
  ]
}

if ( nonce ) {
  appConfig.providers.push ( {
    provide: CSP_NONCE,
    useValue: nonce
  } )
}

export { appConfig }