import { ChangeDetectionStrategy, Component, input, InputSignal } from "@angular/core"
import { IconComponent } from "app/icon/icon.component"

@Component ( {
  selector: "app-sunday-masses",
  imports: [
    IconComponent
  ],
  templateUrl: "./sunday-mass-times.component.html",
  styleUrl: "./sunday-mass-times.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class SundayMassTimesComponent {
  public massTimes: InputSignal<Array<{
    church: string
    time: string
  }>> = input<Array<{ church: string; time: string }>> ( [ ] )
}
