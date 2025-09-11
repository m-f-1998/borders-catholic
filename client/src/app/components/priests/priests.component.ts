
import { ChangeDetectionStrategy, Component, input, InputSignal } from "@angular/core"

@Component ( {
  selector: "app-priests",
  imports: [],
  templateUrl: "./priests.component.html",
  styleUrl: "./priests.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class PriestsComponent {
  public priests: InputSignal<Array<
    {
      name: string
      image: string
      role: string
      residence: string
    }
  >> = input<Array<{
    name: string
    image: string
    role: string
    residence: string
  }>> ( [ ] )
}
