import { bootstrapApplication } from "@angular/platform-browser"
import { appConfig } from "./app/app.config"
import { AppComponent } from "./app/app.component"

const updateTheme = ( ) => {
  document.querySelector ( "html" )?.setAttribute ( "data-bs-theme",
      window.matchMedia ( "(prefers-color-scheme: dark)" ).matches ? "dark" : "light" )
}

window.matchMedia ( "(prefers-color-scheme: dark)" ).addEventListener ( "change", ( ) => {
  updateTheme ( )
} )

updateTheme ( )

bootstrapApplication ( AppComponent, appConfig )
  .catch ( ( err ) => console.error ( err ) )
