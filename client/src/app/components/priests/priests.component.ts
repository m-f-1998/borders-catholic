
import { ChangeDetectionStrategy, Component, Input } from "@angular/core"

@Component ( {
  selector: "app-priests",
  imports: [],
  templateUrl: "./priests.component.html",
  styleUrl: "./priests.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class PriestsComponent {
  @Input ( ) public priests: Array<
    {
      name: string
      image: string
      role: string
      residence: string
    }
  > = [ ]
}
