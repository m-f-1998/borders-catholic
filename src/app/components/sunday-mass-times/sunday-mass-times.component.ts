import { Component, Input } from "@angular/core"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { faChurch } from "@fortawesome/free-solid-svg-icons"

@Component ( {
  selector: "app-sunday-masses",
  standalone: true,
  imports: [
    FontAwesomeModule
  ],
  templateUrl: "./sunday-mass-times.component.html",
  styleUrl: "./sunday-mass-times.component.scss"
} )
export class SundayMassTimesComponent {
  @Input ( ) public massTimes: Array<{
    church: string,
    time: string,
  }> = [ ]
  public faChurch = faChurch
}
