import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from "@angular/core"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { IconService } from "@services/icons.service"

@Component ( {
  selector: "app-sunday-masses",
  imports: [
    FontAwesomeModule
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

  public readonly iconSvc: IconService = inject ( IconService )
}
