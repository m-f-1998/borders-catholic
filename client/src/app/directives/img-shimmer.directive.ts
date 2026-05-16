import { AfterViewInit, Directive, ElementRef, inject } from "@angular/core"

@Directive ( {
  selector: "img[appShimmer]",
  host: {
    "(load)": "onLoad()",
    "(error)": "onError()"
  }
} )
export class ImgShimmerDirective implements AfterViewInit {
  private el = inject ( ElementRef<HTMLImageElement> )

  public onLoad ( ) {
    this.el.nativeElement.classList.remove ( "shimmer-loading" )
  }

  public onError ( ) {
    this.el.nativeElement.classList.remove ( "shimmer-loading" )
    this.el.nativeElement.classList.add ( "img-error" )
  }

  public ngAfterViewInit ( ) {
    const img = this.el.nativeElement
    if ( img.complete && img.naturalWidth > 0 ) return  // already loaded fine
    if ( img.complete && img.naturalWidth === 0 ) {      // already errored before directive ran
      img.classList.add ( "img-error" )
      return
    }
    img.classList.add ( "shimmer-loading" )
  }
}
