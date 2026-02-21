
import { ChangeDetectionStrategy, Component, input, InputSignal } from "@angular/core"
import { IconComponent } from "app/icon/icon.component"

@Component ( {
  selector: "app-contact",
  imports: [
    IconComponent
  ],
  templateUrl: "./contact.component.html",
  styleUrl: "./contact.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ContactComponent {
  public email: InputSignal<string> = input<string> ( "" )
  public phone: InputSignal<string> = input<string> ( "" )
  public address: InputSignal<string [ ]> = input<string [ ]> ( [ ] )
}
