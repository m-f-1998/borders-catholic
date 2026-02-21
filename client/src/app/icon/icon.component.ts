import { ChangeDetectionStrategy, Component, inject, input, InputSignal, OnInit, signal, WritableSignal } from "@angular/core"
import { AnimationProp, FaIconComponent } from "@fortawesome/angular-fontawesome"
import { IconName, IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core"
import { IconService } from "@services/icons.service"

@Component ( {
  selector: "app-icon",
  imports: [
    FaIconComponent
  ],
  templateUrl: "./icon.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class IconComponent implements OnInit {
  public iconPrefix: InputSignal<"fas" | "fab"> = input<"fas" | "fab"> ( "fas" )
  public iconName: InputSignal<IconName> = input.required ( )
  public iconAnimation: InputSignal<AnimationProp | undefined> = input<AnimationProp | undefined> ( )
  public iconSize: InputSignal<SizeProp | undefined> = input<SizeProp | undefined> ( )

  public loading: WritableSignal<boolean> = signal ( true )
  public icon: WritableSignal<IconProp | undefined> = signal ( undefined )

  public readonly iconSvc: IconService = inject ( IconService )

  public ngOnInit ( ) {
    this.loading.set ( true )
    this.iconSvc.getIcon ( this.iconPrefix ( ), this.iconName ( ) ).then ( icon => {
      this.icon.set ( icon )
    } ).catch ( error => {
      console.error ( "Error loading icon:", error )
    } ).finally ( ( ) => {
      this.loading.set ( false )
    } )
  }
}