import { Component, inject, signal } from "@angular/core";
import { RouterOutlet, RouterLink } from "@angular/router";
import { NgClass } from "@angular/common";
import { ThemeService } from "./core/theme.service";
import { SidebarComponent } from "./shared/sidebar/sidebar.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgClass, SidebarComponent],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  readonly theme = inject(ThemeService);
  readonly sidebarOpen = signal(true);

  toggleTheme(): void {
    this.theme.toggle();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }
}
