import { Injectable, inject } from "@angular/core"
import { FaIconLibrary } from "@fortawesome/angular-fontawesome"
import { IconName, IconPrefix, IconProp, IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { faExclamationTriangle, faSpinner } from "@fortawesome/free-solid-svg-icons"

@Injectable ( {
  providedIn: "root"
} )
export class IconService {
  private readonly faLibrary = inject ( FaIconLibrary )

  public constructor ( ) {
    this.faLibrary.addIcons ( faSpinner, faExclamationTriangle )
  }

  public async getIcon ( prefix: IconPrefix, name: IconName ): Promise<IconProp> {
    const existing = this.faLibrary.getIconDefinition ( prefix, name )
    if ( existing ) {
      return { prefix, iconName: name }
    }

    try {
      const definition = await this.importIcon ( prefix, name )
      this.faLibrary.addIcons ( definition )
      return { prefix, iconName: name }
    } catch ( error ) {
      console.error ( `Could not find icon: ${prefix} ${name}`, error )
      return { prefix: "fas", iconName: "exclamation-triangle" as IconName }
    }
  }

  private async importIcon ( prefix: IconPrefix, name: IconName ): Promise<IconDefinition> {
    const iconVariableName = `fa${this.toPascalCase ( name )}`

    let iconModule: IconDefinition
    switch ( prefix ) {
      case "fab":
        const brandIcons = await import ( /* @vite-ignore */ "@fortawesome/free-brands-svg-icons" )
        iconModule = ( brandIcons as unknown as Record<string, IconDefinition> ) [ iconVariableName ]
        break
      case "fas":
      default:
        const solidIcons = await import ( /* @vite-ignore */ "@fortawesome/free-solid-svg-icons" )
        iconModule = ( solidIcons as unknown as Record<string, IconDefinition> ) [ iconVariableName ]
        break
    }

    return iconModule
  }

  private toPascalCase ( str: string ): string {
    return str
      .split ( "-" )
      .map ( part => part.charAt ( 0 ).toUpperCase ( ) + part.slice ( 1 ) )
      .join ( "" )
  }
}