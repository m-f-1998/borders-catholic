import { CommonModule } from "@angular/common"
import { ChangeDetectionStrategy, Component, Input } from "@angular/core"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { faEnvelope, faEnvelopeOpen, faGlobe, faMapPin, faMobileAlt, faPhone } from "@fortawesome/free-solid-svg-icons"

@Component ( {
    selector: "app-contact",
    imports: [
        CommonModule,
        FontAwesomeModule
    ],
    templateUrl: "./contact.component.html",
    styleUrl: "./contact.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ContactComponent {
  public faPhone = faPhone
  public faMobile = faMobileAlt
  public faEnvelope = faEnvelope
  public faEnvelopeOpen = faEnvelopeOpen
  public faGlobe = faGlobe
  public faMapPin = faMapPin

  @Input ( ) public email: string = ""
  @Input ( ) public phone: string = ""
  @Input ( ) public address: string[] = []
}
