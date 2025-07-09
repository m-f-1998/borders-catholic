
import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { IconService } from "@services/icons.service"

@Component ( {
  selector: "app-contact",
  imports: [
    FontAwesomeModule
  ],
  templateUrl: "./contact.component.html",
  styleUrl: "./contact.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ContactComponent {
  @Input ( ) public email: string = ""
  @Input ( ) public phone: string = ""
  @Input ( ) public address: string [ ] = [ ]

  public readonly iconSvc: IconService = inject ( IconService )
}
