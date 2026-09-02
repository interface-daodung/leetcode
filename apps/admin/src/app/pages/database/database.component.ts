import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ProblemService, Problem, ProblemInput, Difficulty } from "../../core/problem.service";

type SortDir = "asc" | "desc" | null;
type ColumnDef = {
  key: keyof Problem | "tagsStr";
  label: string;
  sortable: boolean;
  editable: boolean;
  width?: string;
  type?: "text" | "select" | "textarea";
  options?: readonly string[];
  align?: "left" | "right" | "center";
};

@Component({
  selector: "app-database",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: "./database.component.html",
})
export class DatabaseComponent implements OnInit {
  private readonly problemService = inject(ProblemService);

  readonly problems = signal<Problem[]>([]);
  readonly loading = signal<boolean>(true);
  readonly selected = signal<Problem | null>(null);
  readonly hints = signal<{ id: number; ord: number; content: string }[]>([]);
  readonly assets = signal<{ id: number; originalUrl: string; localPath: string; hash: string }[]>([]);
  readonly toast = signal<{ type: "success" | "error"; message: string } | null>(null);

  readonly query = signal<string>("");
  readonly sortKey = signal<ColumnDef["key"] | null>(null);
  readonly sortDir = signal<SortDir>(null);
  readonly page = signal<number>(1);
  readonly pageSize = signal<number>(20);
  readonly pageSizeOptions = [10, 20, 50, 100];

  readonly editingId = signal<number | null>(null);
  readonly editBuffer = signal<Problem | null>(null);
  readonly showAddForm = signal<boolean>(false);
  readonly newDraft = signal<ProblemInput>({
    title: "",
    slug: null,
    url: null,
    difficulty: "easy",
    tags: [],
    description: "",
    template: null,
    testCases: [],
  });

  readonly difficulties: readonly Difficulty[] = ["easy", "medium", "hard"];

  readonly columns: readonly ColumnDef[] = [
    { key: "id", label: "ID", sortable: true, editable: false, width: "70px", align: "right" },
    { key: "title", label: "Tiêu đề", sortable: true, editable: true, width: "minmax(160px, 1fr)" },
    { key: "slug", label: "Slug", sortable: true, editable: true, width: "140px" },
    { key: "difficulty", label: "Độ khó", sortable: true, editable: true, type: "select", options: this.difficulties, width: "110px" },
    { key: "url", label: "URL", sortable: false, editable: true, width: "minmax(140px, 1.2fr)" },
    { key: "tagsStr", label: "Tags", sortable: true, editable: true, width: "140px" },
    { key: "description", label: "Mô tả", sortable: false, editable: true, type: "textarea", width: "minmax(160px, 1.4fr)" },
    { key: "createdAt", label: "Tạo lúc", sortable: true, editable: false, width: "150px" },
  ] as const;

  readonly filtered = computed<Problem[]>(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.problems();
    if (!q) return list;
    return list.filter((p) =>
      [p.id, p.title, p.slug, p.difficulty, p.url, this.tagsStr(p.tags), p.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  });

  readonly sorted = computed<Problem[]>(() => {
    const list = this.filtered();
    const key = this.sortKey();
    const dir = this.sortDir();
    if (!key || !dir) return list;
    const mul = dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = this.cellValue(a, key);
      const bv = this.cellValue(b, key);
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * mul;
      if (bv == null) return 1 * mul;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * mul;
      return String(av).localeCompare(String(bv)) * mul;
    });
  });

  readonly totalPages = computed<number>(() => {
    const len = this.sorted().length;
    return Math.max(1, Math.ceil(len / this.pageSize()));
  });

  readonly paged = computed<Problem[]>(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.sorted().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.problemService.list().subscribe({
      next: (list) => {
        this.problems.set(list);
        this.loading.set(false);
        this.page.set(Math.min(this.page(), Math.max(1, Math.ceil(list.length / this.pageSize()))));
      },
      error: (e: Error) => {
        this.showToast("error", `Không tải được: ${e.message}`);
        this.loading.set(false);
      },
    });
  }

  reload(): void {
    this.load();
  }

  // ===== Sort =====
  toggleSort(col: ColumnDef): void {
    if (!col.sortable) return;
    const key = col.key;
    if (this.sortKey() !== key) {
      this.sortKey.set(key);
      this.sortDir.set("asc");
      return;
    }
    const cur = this.sortDir();
    this.sortDir.set(cur === "asc" ? "desc" : null);
  }

  sortIcon(col: ColumnDef): string {
    if (this.sortKey() !== col.key) return "fa-sort text-muted opacity-40";
    if (this.sortDir() === "asc") return "fa-sort-up text-primary";
    if (this.sortDir() === "desc") return "fa-sort-down text-primary";
    return "fa-sort text-muted opacity-40";
  }

  // ===== Edit =====
  startEdit(p: Problem): void {
    this.editingId.set(p.id);
    this.editBuffer.set({ ...p, tags: [...(p.tags ?? [])], testCases: [...(p.testCases ?? [])] });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editBuffer.set(null);
  }

  saveEdit(): void {
    const buf = this.editBuffer();
    if (!buf) return;
    const input = this.toInput(buf);
    this.problemService.update(buf.id, input).subscribe({
      next: () => {
        this.showToast("success", `Đã cập nhật #${buf.id}`);
        this.editingId.set(null);
        this.editBuffer.set(null);
        this.load();
      },
      error: (err: Error) => this.showToast("error", `Cập nhật thất bại: ${err.message}`),
    });
  }

  patchEdit(key: keyof Problem, value: unknown): void {
    const buf = this.editBuffer();
    if (!buf) return;
    this.editBuffer.set({ ...buf, [key]: value } as Problem);
  }

  patchEditTags(value: string): void {
    const buf = this.editBuffer();
    if (!buf) return;
    const tags = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    this.editBuffer.set({ ...buf, tags });
  }

  // ===== Add =====
  openAddForm(): void {
    this.showAddForm.set(true);
    this.newDraft.set({
      title: "",
      slug: null,
      url: null,
      difficulty: "easy",
      tags: [],
      description: "",
      template: null,
      testCases: [],
    });
  }

  closeAddForm(): void {
    this.showAddForm.set(false);
  }

  patchDraft<K extends keyof ProblemInput>(key: K, value: ProblemInput[K]): void {
    this.newDraft.update((d) => ({ ...d, [key]: value }));
  }

  patchDraftTags(value: string): void {
    const tags = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    this.newDraft.update((d) => ({ ...d, tags }));
  }

  submitAdd(): void {
    const draft = this.newDraft();
    if (!draft.title.trim() || !draft.description.trim()) {
      this.showToast("error", "Tiêu đề và mô tả không được rỗng");
      return;
    }
    this.problemService.create(draft).subscribe({
      next: () => {
        this.showToast("success", `Đã thêm "${draft.title}"`);
        this.showAddForm.set(false);
        this.load();
      },
      error: (err: Error) => this.showToast("error", `Thêm thất bại: ${err.message}`),
    });
  }

  // ===== Delete =====
  remove(p: Problem): void {
    if (!confirm(`Xóa #${p.id} "${p.title}"?`)) return;
    this.problemService.delete(p.id).subscribe({
      next: () => {
        this.showToast("success", `Đã xóa #${p.id}`);
        if (this.selected()?.id === p.id) {
          this.selected.set(null);
          this.hints.set([]);
          this.assets.set([]);
        }
        this.load();
      },
      error: (err: Error) => this.showToast("error", `Xóa thất bại: ${err.message}`),
    });
  }

  // ===== Selection + detail panel =====
  selectProblem(p: Problem): void {
    if (this.editingId() === p.id) return;
    this.selected.set(p);
    if (p?.id != null) {
      this.problemService.getHints(p.id).subscribe((h) => this.hints.set(h));
      this.problemService.getAssets(p.id).subscribe((a) => this.assets.set(a));
    } else {
      this.hints.set([]);
      this.assets.set([]);
    }
  }

  // ===== Pagination =====
  goPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
  }

  prevPage(): void {
    this.goPage(this.page() - 1);
  }

  nextPage(): void {
    this.goPage(this.page() + 1);
  }

  // ===== Helpers =====
  cellValue(p: Problem, key: ColumnDef["key"]): unknown {
    if (key === "tagsStr") return this.tagsStr(p.tags);
    return (p as never)[key];
  }

  diffBadgeClass(diff: string): string {
    switch (diff) {
      case "easy":
        return "bg-green-500/15 text-green-500";
      case "medium":
        return "bg-yellow-500/15 text-yellow-500";
      case "hard":
        return "bg-red-500/15 text-red-500";
      default:
        return "bg-gray-500/15 text-gray-500";
    }
  }

  tagsStr(tags: string[] | undefined | null): string {
    return (tags ?? []).join(", ");
  }

  inputCellValue(p: Problem, key: ColumnDef["key"]): string {
    const v = this.cellValue(p, key);
    if (v == null) return "";
    return String(v);
  }

  private toInput(data: Problem): ProblemInput {
    return {
      title: data.title ?? "",
      slug: data.slug ?? null,
      url: data.url ?? null,
      difficulty: (data.difficulty as Difficulty) ?? "easy",
      tags: data.tags ?? [],
      description: data.description ?? "",
      template: data.template ?? null,
      testCases: (data.testCases as { input: unknown; expected: unknown }[]) ?? [],
    };
  }

  private showToast(type: "success" | "error", message: string): void {
    this.toast.set({ type, message });
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 3000);
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // Math helpers for template
  rangeEnd(): number {
    return Math.min(this.page() * this.pageSize(), this.sorted().length);
  }
  rangeStart(): number {
    return this.sorted().length === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1;
  }
  pages(): number[] {
    const tp = this.totalPages();
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);
    const cur = this.page();
    const out = new Set<number>([1, tp, cur, cur - 1, cur + 1]);
    return Array.from(out).filter((p) => p >= 1 && p <= tp).sort((a, b) => a - b);
  }
}
