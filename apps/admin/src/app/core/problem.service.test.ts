import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { ProblemService, Problem } from "./problem.service";
import { API_URL_TOKEN } from "./api.config";

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_URL_TOKEN, useValue: "http://api.test" },
    ],
  });
  const svc = TestBed.inject(ProblemService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { svc, httpMock };
}

const SAMPLE: Problem = {
  id: 1,
  title: "Two Sum",
  difficulty: "easy",
  tags: ["array", "hashmap"],
  description: "<p>...</p>",
  createdAt: "2026-09-01T00:00:00Z",
};

describe("ProblemService", () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it("list() gọi GET /api/problems và trả mảng", async () => {
    const { svc, httpMock } = setup();
    let result: Problem[] | undefined;
    svc.list().subscribe((r) => (result = r));
    const req = httpMock.expectOne("http://api.test/api/problems");
    expect(req.request.method).toBe("GET");
    req.flush([SAMPLE]);
    expect(result).toEqual([SAMPLE]);
  });

  it("get(id) gọi GET /api/problems/:id", () => {
    const { svc, httpMock } = setup();
    let result: Problem | null | undefined;
    svc.get(42).subscribe((r) => (result = r));
    const req = httpMock.expectOne("http://api.test/api/problems/42");
    expect(req.request.method).toBe("GET");
    req.flush(SAMPLE);
    expect(result).toEqual(SAMPLE);
  });

  it("create() gọi POST /api/problems", () => {
    const { svc, httpMock } = setup();
    const input = {
      title: "Three Sum",
      difficulty: "medium" as const,
      tags: ["array"],
      description: "<p>...</p>",
    };
    let result: Problem | undefined;
    svc.create(input).subscribe((r) => (result = r));
    const req = httpMock.expectOne("http://api.test/api/problems");
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(input);
    req.flush({ ...SAMPLE, id: 2, ...input });
    expect(result?.id).toBe(2);
  });

  it("update() gọi PUT /api/problems/:id", () => {
    const { svc, httpMock } = setup();
    const input = { title: "Two Sum (edit)", difficulty: "easy" as const, tags: [], description: "" };
    let result: Problem | undefined;
    svc.update(1, input).subscribe((r) => (result = r));
    const req = httpMock.expectOne("http://api.test/api/problems/1");
    expect(req.request.method).toBe("PUT");
    req.flush({ ...SAMPLE, ...input });
    expect(result?.title).toBe("Two Sum (edit)");
  });

  it("delete() gọi DELETE /api/problems/:id", () => {
    const { svc, httpMock } = setup();
    let done = false;
    svc.delete(7).subscribe(() => (done = true));
    const req = httpMock.expectOne("http://api.test/api/problems/7");
    expect(req.request.method).toBe("DELETE");
    req.flush(null);
    expect(done).toBe(true);
  });

  it("getHints() gọi GET /api/problems/:id/hints", () => {
    const { svc, httpMock } = setup();
    let result: { id: number; ord: number; content: string }[] | undefined;
    svc.getHints(1).subscribe((r) => (result = r));
    const req = httpMock.expectOne("http://api.test/api/problems/1/hints");
    expect(req.request.method).toBe("GET");
    req.flush([{ id: 10, ord: 1, content: "Use hashmap" }]);
    expect(result?.length).toBe(1);
    expect(result?.[0].content).toBe("Use hashmap");
  });

  it("getAssets() gọi GET /api/problems/:id/assets", () => {
    const { svc, httpMock } = setup();
    let result: { id: number; originalUrl: string; localPath: string; hash: string }[] | undefined;
    svc.getAssets(1).subscribe((r) => (result = r));
    const req = httpMock.expectOne("http://api.test/api/problems/1/assets");
    expect(req.request.method).toBe("GET");
    req.flush([{ id: 20, originalUrl: "https://x/y.png", localPath: "x/y.png", hash: "abc" }]);
    expect(result?.length).toBe(1);
  });
});
