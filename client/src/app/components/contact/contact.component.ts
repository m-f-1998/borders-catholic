
import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from "@angular/core"
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
  public email: InputSignal<string> = input<string> ( "" )
  public phone: InputSignal<string> = input<string> ( "" )
  public address: InputSignal<string [ ]> = input<string [ ]> ( [ ] )

  public readonly iconSvc: IconService = inject ( IconService )
}
