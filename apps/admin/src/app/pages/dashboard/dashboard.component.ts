import { Component, inject, signal, OnInit } from "@angular/core";
import { ProblemService, Problem } from "../../core/problem.service";

interface Stats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  tagCount: number;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  private readonly problemService = inject(ProblemService);
  readonly stats = signal<Stats>({ total: 0, easy: 0, medium: 0, hard: 0, tagCount: 0 });
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.problemService.list().subscribe({
      next: (list) => {
        this.stats.set(this.computeStats(list));
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message || "Không tải được danh sách problems");
        this.loading.set(false);
      },
    });
  }

  private computeStats(list: Problem[]): Stats {
    const tagSet = new Set<string>();
    let easy = 0;
    let medium = 0;
    let hard = 0;
    for (const p of list) {
      if (p.difficulty === "easy") easy++;
      else if (p.difficulty === "medium") medium++;
      else if (p.difficulty === "hard") hard++;
      for (const tag of p.tags ?? []) tagSet.add(tag);
    }
    return { total: list.length, easy, medium, hard, tagCount: tagSet.size };
  }
}
