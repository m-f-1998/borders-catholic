import { CommonModule } from "@angular/common"
import { ChangeDetectionStrategy, Component, Input} from "@angular/core"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"

@Component ( {
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: "./expanded-image.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ExpandedImageComponent {

  @Input ( ) public imageURLs: string [ ] = [ ]
  @Input ( ) public index: number = 0

  constructor (
    public activeRouter: NgbActiveModal
  ) { }

  public close ( ) {
    this.activeRouter.dismiss ( )
  }

  public nextImage ( ) {
    if ( this.index === this.imageURLs.length - 1 ) {
      this.index = 0
    } else this.index++
  }

  public prevImage ( ) {
    if ( this.index === 0 ) {
      this.index = this.imageURLs.length
    } else this.index--
  }

}
