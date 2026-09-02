import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ThemeService } from "../../core/theme.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./header.component.html",
})
export class HeaderComponent {
  readonly theme = inject(ThemeService);

  toggleTheme(): void {
    this.theme.toggle();
  }
}
