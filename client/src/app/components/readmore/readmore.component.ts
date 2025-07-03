import { ChangeDetectionStrategy, Component, Input } from "@angular/core"

@Component ( {
  selector: "app-readmore",
  imports: [],
  templateUrl: "./readmore.component.html",
  styleUrl: "./readmore.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ReadmoreComponent {

  @Input ( ) public subtitle?: string
  @Input ( ) public content: string = ""
  @Input ( ) public fileURL?: string
  @Input ( ) public fileName?: string
  @Input ( ) public expanded: boolean = false
  @Input ( ) public showReadMore = true

  public MAXLENGTH: number = 400

  public expand ( ) {
    this.expanded = !this.expanded
  }

  public getCutString ( ) {
    return this.content.substring ( 0, this.MAXLENGTH - 1 ) + "..."
  }

}
