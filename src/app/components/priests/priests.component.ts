import { CommonModule } from "@angular/common"
import { Component, Input } from "@angular/core"

@Component ( {
  selector: "app-priests",
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: "./priests.component.html",
  styleUrl: "./priests.component.scss"
} )
export class PriestsComponent {
  @Input ( ) public priests: Array<
    {
      name: string,
      image: string,
      role: string,
      residence: string
    }
  > = [ ]
}
