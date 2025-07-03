
import { ChangeDetectionStrategy, Component } from "@angular/core"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope, faGlobe } from "@fortawesome/free-solid-svg-icons"

@Component ( {
  selector: "app-footer",
  imports: [
    FontAwesomeModule
  ],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class FooterComponent {

  public currentDate = new Date ( )

  public faGithub: any = faGithub
  public faLinkedin: any = faLinkedin
  public faEmail: any = faEnvelope
  public faWebsite: any = faGlobe

  public copyrightNotice ( ) {
    const year = new Date ( ).getFullYear ( )
    return `© ${year}. All rights reserved.`
  }

  public goToAuthor ( ) {
    window.location.href = "https://matthewfrankland.co.uk"
  }

}
