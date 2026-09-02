import { Component, inject, OnInit, signal, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  DxDataGridModule,
  DxButtonModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxToastModule,
  DxDataGridComponent,
} from "devextreme-angular";
import {
  ProblemService,
  Problem,
  ProblemInput,
  Difficulty,
} from "../../core/problem.service";

@Component({
  selector: "app-database",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxDataGridModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxToastModule,
  ],
  templateUrl: "./database.component.html",
})
export class DatabaseComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) grid!: DxDataGridComponent;

  private readonly problemService = inject(ProblemService);
  readonly problems = signal<Problem[]>([]);
  readonly loading = signal<boolean>(true);
  readonly selected = signal<Problem | null>(null);
  readonly hints = signal<{ id: number; ord: number; content: string }[]>([]);
  readonly assets = signal<{ id: number; originalUrl: string; localPath: string; hash: string }[]>([]);
  readonly toast = signal<{ type: "success" | "error"; message: string } | null>(null);
  readonly toastVisible = signal<boolean>(false);

  readonly difficulties: Difficulty[] = ["easy", "medium", "hard"];

  columns: any[] = [
    { dataField: "id", caption: "ID", width: 70, allowEditing: false },
    { dataField: "title", caption: "Tiêu đề", minWidth: 180 },
    { dataField: "slug", caption: "Slug", minWidth: 120 },
    { dataField: "difficulty", caption: "Độ khó", width: 110, dataType: "string" },
    { dataField: "url", caption: "URL", minWidth: 160 },
    { dataField: "tags", caption: "Tags", minWidth: 140, visible: false },
    { dataField: "description", caption: "Mô tả (HTML)", visible: false },
    { dataField: "template", caption: "Template (code)", visible: false },
    { dataField: "testCases", caption: "Test cases", visible: false },
    { dataField: "createdAt", caption: "Tạo lúc", dataType: "date", visible: true, width: 150 },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.problemService.list().subscribe({
      next: (list) => {
        this.problems.set(list);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.showToast("error", `Không tải được: ${e.message}`);
        this.loading.set(false);
      },
    });
  }

  onEditorPreparing(e: any): void {
    if (e.parentType === "dataRow" && e.dataField === "difficulty") {
      e.editorOptions = {
        items: this.difficulties,
        value: e.value,
        onValueChanged: (args: any) => {
          e.setValue(args.value);
        },
      };
    }
  }

  onRowInserted(e: any): void {
    const input = this.toInput(e.data);
    this.problemService.create(input).subscribe({
      next: () => {
        this.showToast("success", `Đã thêm "${e.data.title}"`);
        this.load();
      },
      error: (err: Error) => {
        this.showToast("error", `Thêm thất bại: ${err.message}`);
        this.load();
      },
    });
  }

  onRowUpdated(e: any): void {
    const id = e.data.id;
    const input = this.toInput(e.data);
    this.problemService.update(id, input).subscribe({
      next: () => {
        this.showToast("success", `Đã cập nhật #${id}`);
        this.load();
      },
      error: (err: Error) => {
        this.showToast("error", `Cập nhật thất bại: ${err.message}`);
        this.load();
      },
    });
  }

  onRowRemoved(e: any): void {
    const id = e.data.id;
    this.problemService.delete(id).subscribe({
      next: () => {
        this.showToast("success", `Đã xóa #${id}`);
        this.selected.set(null);
        this.hints.set([]);
        this.assets.set([]);
      },
      error: (err: Error) => {
        this.showToast("error", `Xóa thất bại: ${err.message}`);
        this.load();
      },
    });
  }

  onRowClick(e: any): void {
    this.selectProblem(e.data as Problem);
  }

  onFocusedRowChanged(e: any): void {
    if (e.row && e.row.data) {
      this.selectProblem(e.row.data as Problem);
    }
  }

  onRowDblClick(e: any): void {
    this.selectProblem(e.data as Problem);
  }

  selectProblem(p: Problem): void {
    this.selected.set(p);
    if (p?.id != null) {
      this.problemService.getHints(p.id).subscribe((h) => this.hints.set(h));
      this.problemService.getAssets(p.id).subscribe((a) => this.assets.set(a));
    } else {
      this.hints.set([]);
      this.assets.set([]);
    }
  }

  reload(): void {
    this.load();
  }

  private toInput(data: any): ProblemInput {
    let tags: string[] = [];
    if (Array.isArray(data.tags)) tags = data.tags;
    else if (typeof data.tags === "string" && data.tags.trim()) {
      tags = data.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
    }

    let testCases: { input: unknown; expected: unknown }[] = [];
    if (Array.isArray(data.testCases)) testCases = data.testCases;
    else if (typeof data.testCases === "string" && data.testCases.trim()) {
      try {
        testCases = JSON.parse(data.testCases);
      } catch {
        testCases = [];
      }
    }

    return {
      title: data.title ?? "",
      slug: data.slug ?? null,
      url: data.url ?? null,
      difficulty: (data.difficulty as Difficulty) ?? "easy",
      tags,
      description: data.description ?? "",
      template: data.template ?? null,
      testCases,
    };
  }

  private showToast(type: "success" | "error", message: string): void {
    this.toast.set({ type, message });
    this.toastVisible.set(true);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 3000);
  }

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
}
