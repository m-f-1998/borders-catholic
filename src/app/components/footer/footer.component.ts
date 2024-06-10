import { CommonModule } from "@angular/common"
import { Component, Input } from "@angular/core"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { faFacebookF, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"

@Component ( {
  selector: "app-footer",
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss"
} )
export class FooterComponent {

  public currentDate = new Date ( )

  public faFacebook = faFacebookF
  public faYoutube = faYoutube
  public faEnvelope = faEnvelope
  public faInstagram = faInstagram

  @Input ( ) public email: string = ""
  @Input ( ) public facebook: string = ""
  @Input ( ) public youtube: string = ""
  @Input ( ) public instagram: string = ""

}
