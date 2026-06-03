
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from "@angular/core"
import { ReadmoreComponent } from "@components/readmore/readmore.component"
import { IconComponent } from "@app/icon/icon.component"

@Component ( {
  selector: "app-sacraments-section",
  imports: [ ReadmoreComponent, IconComponent ],
  templateUrl: "./sacraments-section.component.html",
  styleUrl: "./sacraments-section.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class SacramentsSectionComponent {
  public openSacrament: WritableSignal<string | null> = signal ( null )

  public toggleSacrament ( name: string ) {
    this.openSacrament.set ( this.openSacrament ( ) === name ? null : name )
  }
}
