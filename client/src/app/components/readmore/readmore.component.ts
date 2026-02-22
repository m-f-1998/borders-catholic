import { ChangeDetectionStrategy, Component, input, InputSignal, signal, WritableSignal } from "@angular/core"

@Component ( {
  selector: "app-readmore",
  imports: [ ],
  templateUrl: "./readmore.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ReadmoreComponent {
  public subtitle: InputSignal<string | undefined> = input<string | undefined> ( )
  public content: InputSignal<string> = input<string> ( "" )
  public fileURL: InputSignal<string | undefined> = input<string | undefined> ( )
  public fileName: InputSignal<string | undefined> = input<string | undefined> ( )
  public showReadMore: InputSignal<boolean> = input<boolean> ( true )

  public expanded: WritableSignal<boolean> = signal<boolean> ( false )
  public MAXLENGTH: number = 400

  public expand ( ) {
    this.expanded.set ( !this.expanded ( ) )
  }

  public getCutString ( ) {
    return this.content ( ).substring ( 0, this.MAXLENGTH - 1 ) + "..."
  }

}
