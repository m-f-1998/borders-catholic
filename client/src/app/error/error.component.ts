import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { faHome } from "@fortawesome/free-solid-svg-icons"

@Component ( {
  selector: "app-error",
  imports: [
    FontAwesomeModule
  ],
  templateUrl: "./error.component.html",
  styleUrl: "./error.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ErrorComponent {

  public error = "500 Internal Server Error"
  public description = "Something went wrong."
  public faHome = faHome

  public socialLinks = [
    {
      url: "https://facebook.com/ss.mary.david",
      icon: "devicon-facebook-plain",
      class: "btn btn-lg btn-icon facebook-link",
      tooltip: "Contact us on Facebook"
    },
  ]

  private readonly route: ActivatedRoute = inject ( ActivatedRoute )
  private readonly router: Router = inject ( Router )

  public constructor ( ) {
    this.error = this.route.snapshot.paramMap.get ( "code" ) ?? "500"
    if ( isNaN ( Number ( this.error ) ) ) {
      this.error = "404"
      this.router.navigate ( [ "/error/404" ] )
    }
    switch ( this.error ) {
      case "400":
        this.error = "400 Bad Request"
        this.description = "Something's not right."
        break
      case "401":
        this.error = "401 Unauthorized"
        this.description = "Client not authorized."
        break
      case "403":
        this.error = "403 Forbidden"
        this.description = "Access denied."
        break
      case "404":
        this.error = "404 Not Found"
        this.description = "Page not found."
        break
      default:
        this.error = "500 Internal Server Error"
        this.description = "Something went wrong."
        break
    }
  }
}
