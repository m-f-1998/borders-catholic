
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core"
import { IconComponent } from "@app/icon/icon.component"

@Component ( {
  selector: "app-expanded-image",
  templateUrl: "./expanded-image.component.html",
  styleUrl: "./expanded-image.component.scss",
  imports: [ IconComponent ],
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ExpandedImageComponent {
  @Input ( ) public imageURLs: string [ ] = [ ]
  @Input ( ) public index: number = 0

  @Output ( ) public closed = new EventEmitter<void> ( )

  public close ( ) {
    this.closed.emit ( )
  }

  public nextImage ( ) {
    if ( this.index === this.imageURLs.length - 1 ) {
      this.index = 0
    } else this.index++
  }

  public prevImage ( ) {
    if ( this.index === 0 ) {
      this.index = this.imageURLs.length - 1
    } else this.index--
  }

}
