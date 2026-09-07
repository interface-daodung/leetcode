import { Routes } from "@angular/router";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { DatabaseComponent } from "./pages/database/database.component";

export const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "database", component: DatabaseComponent },
  { path: "**", redirectTo: "/dashboard" },
];
