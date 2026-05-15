
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, input, InputSignal, NgZone, OnDestroy, signal, WritableSignal } from "@angular/core"
import { DOCUMENT } from "@angular/common"
import { Router, RouterModule } from "@angular/router"
import { IconComponent } from "@app/icon/icon.component"

const SECTION_ORDER = [ "hero", "sunday-mass", "contact", "gallery", "sacraments" ] as const
type SectionId = typeof SECTION_ORDER [ number ]

@Component ( {
  selector: "app-header",
  imports: [
    RouterModule,
    IconComponent
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class HeaderComponent implements AfterViewInit, OnDestroy {
  public currentPage: InputSignal<string> = input<string> ( "" )

  public isMenuCollapsed: WritableSignal<boolean> = signal ( true )
  public activeSection: WritableSignal<SectionId> = signal ( "hero" )

  private observer: IntersectionObserver | null = null
  private readonly visible = new Set<SectionId> ()

  public readonly router: Router = inject ( Router )
  private readonly zone: NgZone = inject ( NgZone )
  private readonly doc: Document = inject ( DOCUMENT )

  public goTo ( routerLink: string = "", id?: string ) {
    this.isMenuCollapsed.set ( true )
    if ( id ) {
      this.router.navigate ( [ routerLink ], { fragment: id } )
    } else {
      this.router.navigate ( [ routerLink ] )
      this.doc.documentElement.scrollTo ( { top: 0, behavior: "smooth" } )
    }
  }

  public toggleMenu ( ) {
    this.isMenuCollapsed.set ( !this.isMenuCollapsed ( ) )
  }

  public ngAfterViewInit ( ) {
    setTimeout ( ( ) => this.initScrollSpy ( ), 300 )
  }

  public ngOnDestroy ( ) {
    this.observer?.disconnect ( )
  }

  private initScrollSpy ( ) {
    this.observer = new IntersectionObserver (
      ( entries ) => {
        entries.forEach ( entry => {
          const id = entry.target.id as SectionId
          if ( entry.isIntersecting ) {
            this.visible.add ( id )
          } else {
            this.visible.delete ( id )
          }
        } )
        const active = SECTION_ORDER.find ( id => this.visible.has ( id ) ) ?? "hero"
        if ( this.activeSection ( ) !== active ) {
          this.zone.run ( ( ) => this.activeSection.set ( active ) )
        }
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    )

    SECTION_ORDER.forEach ( id => {
      const el = this.doc.getElementById ( id )
      if ( el ) this.observer!.observe ( el )
    } )
  }
}
