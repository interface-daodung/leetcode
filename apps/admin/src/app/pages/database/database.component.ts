import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ProblemService, Problem, ProblemInput, Difficulty } from "../../core/problem.service";

const EMPTY_HINTS: { id: number; ord: number; content: string }[] = [];
const EMPTY_ASSETS: { id: number; originalUrl: string; localPath: string; hash: string }[] = [];

type SortDir = "asc" | "desc" | null;
type ColumnId = keyof Problem | "tagsStr" | "hints" | "expander" | "actions";
type ColumnDef = {
  key: ColumnId;
  label: string;
  sortable: boolean;
  editable: boolean;
  visible: boolean;
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
  private readonly sanitizer = inject(DomSanitizer);

  readonly problems = signal<Problem[]>([]);
  readonly loading = signal<boolean>(true);
  readonly toast = signal<{ type: "success" | "error"; message: string } | null>(null);

  readonly query = signal<string>("");
  readonly selectedTag = signal<string>("");
  readonly sortKey = signal<ColumnId | null>(null);
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

  // Column visibility
  readonly visibleColumnKeys = signal<Set<ColumnId>>(new Set(["id", "title", "slug", "difficulty", "url", "tagsStr", "description", "hints"]));

  // Row expansion (hints/assets)
  readonly expandedIds = signal<Set<number>>(new Set());
  readonly rowHints = signal<Map<number, { id: number; ord: number; content: string }[]>>(new Map());
  readonly rowAssets = signal<Map<number, { id: number; originalUrl: string; localPath: string; hash: string }[]>>(new Map());

  // Description modal
  readonly descModal = signal<Problem | null>(null);

  readonly difficulties: readonly Difficulty[] = ["easy", "medium", "hard"];

  readonly allColumns: readonly ColumnDef[] = [
    { key: "expander", label: "", sortable: false, editable: false, visible: true, width: "36px" },
    { key: "id", label: "ID", sortable: true, editable: false, visible: true, width: "70px", align: "right" },
    { key: "title", label: "Tiêu đề", sortable: true, editable: true, visible: true, width: "minmax(160px, 1fr)" },
    { key: "slug", label: "Slug", sortable: true, editable: true, visible: true, width: "140px" },
    { key: "difficulty", label: "Độ khó", sortable: true, editable: true, visible: true, type: "select", options: this.difficulties, width: "110px" },
    { key: "url", label: "URL", sortable: false, editable: true, visible: true, width: "minmax(140px, 1.2fr)" },
    { key: "tagsStr", label: "Tags", sortable: true, editable: true, visible: true, width: "160px" },
    { key: "description", label: "Mô tả", sortable: false, editable: true, visible: true, type: "textarea", width: "minmax(160px, 1.4fr)" },
    { key: "hints", label: "Hints", sortable: false, editable: false, visible: true, width: "minmax(140px, 1fr)" },
    { key: "createdAt", label: "Tạo lúc", sortable: true, editable: false, visible: false, width: "150px" },
  ] as const;

  readonly visibleColumns = computed<ColumnDef[]>(() => {
    const keys = this.visibleColumnKeys();
    return this.allColumns.filter((c) => keys.has(c.key));
  });

  readonly allTags = computed<string[]>(() => {
    const set = new Set<string>();
    for (const p of this.problems()) {
      for (const t of p.tags ?? []) set.add(t);
    }
    return Array.from(set).sort();
  });

  readonly filtered = computed<Problem[]>(() => {
    const q = this.query().trim().toLowerCase();
    const tag = this.selectedTag().trim();
    let list = this.problems();
    if (q) {
      list = list.filter((p) =>
        [p.id, p.title, p.slug, p.difficulty, p.url, this.tagsStr(p.tags), p.description]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }
    if (tag) {
      list = list.filter((p) => (p.tags ?? []).includes(tag));
    }
    return list;
  });

  readonly sorted = computed<Problem[]>(() => {
    const list = this.filtered();
    const key = this.sortKey();
    const dir = this.sortDir();
    if (!key || !dir || key === "expander" || key === "hints") return list;
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

  private readonly prefetchHints = effect(() => {
    const rows = this.paged();
    for (const p of rows) {
      this.ensureHintsLoaded(p.id);
    }
  });

  private ensureHintsLoaded(id: number): void {
    if (this.rowHints().has(id)) return;
    this.problemService.getHints(id).subscribe((h) => {
      this.rowHints.update((m) => new Map(m).set(id, h));
    });
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

  // ===== Column visibility =====
  toggleColumn(key: ColumnId): void {
    this.visibleColumnKeys.update((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // ===== Row selection toggle =====
  toggleExpand(p: Problem): void {
    const id = p.id;
    this.expandedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // ===== Description modal =====
  openDesc(p: Problem): void {
    this.descModal.set(p);
  }

  closeDesc(): void {
    this.descModal.set(null);
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
        this.expandedIds.update((s) => { const n = new Set(s); n.delete(p.id); return n; });
        this.rowHints.update((m) => { const n = new Map(m); n.delete(p.id); return n; });
        this.rowAssets.update((m) => { const n = new Map(m); n.delete(p.id); return n; });
        this.load();
      },
      error: (err: Error) => this.showToast("error", `Xóa thất bại: ${err.message}`),
    });
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
  cellValue(p: Problem, key: ColumnId): unknown {
    if (key === "tagsStr") return this.tagsStr(p.tags);
    return (p as never)[key];
  }

  diffBadgeClass(diff: string): string {
    switch (diff) {
      case "easy": return "bg-green-500/15 text-green-500";
      case "medium": return "bg-yellow-500/15 text-yellow-500";
      case "hard": return "bg-red-500/15 text-red-500";
      default: return "bg-gray-500/15 text-gray-500";
    }
  }

  tagColor(tag: string): string {
    const colors = [
      "bg-blue-500/15 text-blue-500",
      "bg-purple-500/15 text-purple-500",
      "bg-cyan-500/15 text-cyan-500",
      "bg-pink-500/15 text-pink-500",
      "bg-orange-500/15 text-orange-500",
      "bg-teal-500/15 text-teal-500",
      "bg-indigo-500/15 text-indigo-500",
      "bg-rose-500/15 text-rose-500",
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = ((hash << 5) - hash) + tag.charCodeAt(i);
      hash |= 0;
    }
    return colors[Math.abs(hash) % colors.length];
  }

  tagsStr(tags: string[] | undefined | null): string {
    return (tags ?? []).join(", ");
  }

  inputCellValue(p: Problem, key: ColumnId): string {
    const v = this.cellValue(p, key);
    if (v == null) return "";
    return String(v);
  }

  isExpanded(id: number): boolean {
    return this.expandedIds().has(id);
  }

  hintsFor(id: number): { id: number; ord: number; content: string }[] {
    return this.rowHints().get(id) ?? EMPTY_HINTS;
  }

  assetsFor(id: number): { id: number; originalUrl: string; localPath: string; hash: string }[] {
    return this.rowAssets().get(id) ?? EMPTY_ASSETS;
  }

  safeHtml(content: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content ?? "");
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