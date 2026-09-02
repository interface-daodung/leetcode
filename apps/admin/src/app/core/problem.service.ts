import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, catchError, map } from "rxjs";
import { API_URL_TOKEN } from "./api.config";

export type Difficulty = "easy" | "medium" | "hard";

export interface Problem {
  id: number;
  slug?: string | null;
  title: string;
  url?: string | null;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  template?: string | null;
  testCases?: { input: unknown; expected: unknown }[];
  createdAt?: string | null;
}

export type ProblemInput = Omit<Problem, "id" | "createdAt">;

@Injectable({ providedIn: "root" })
export class ProblemService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_URL_TOKEN);

  list(): Observable<Problem[]> {
    return this.http
      .get<Problem[]>(`${this.base}/api/problems`)
      .pipe(catchError(() => of([] as Problem[])));
  }

  get(id: number): Observable<Problem | null> {
    return this.http.get<Problem>(`${this.base}/api/problems/${id}`).pipe(
      catchError(() => of(null)),
      map((p) => p ?? null),
    );
  }

  create(input: ProblemInput): Observable<Problem> {
    return this.http.post<Problem>(`${this.base}/api/problems`, input);
  }

  update(id: number, input: ProblemInput): Observable<Problem> {
    return this.http.put<Problem>(`${this.base}/api/problems/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/problems/${id}`);
  }

  getHints(id: number): Observable<{ id: number; ord: number; content: string }[]> {
    return this.http
      .get<{ id: number; ord: number; content: string }[]>(`${this.base}/api/problems/${id}/hints`)
      .pipe(catchError(() => of([])));
  }

  getAssets(
    id: number,
  ): Observable<{ id: number; originalUrl: string; localPath: string; hash: string }[]> {
    return this.http
      .get<{ id: number; originalUrl: string; localPath: string; hash: string }[]>(
        `${this.base}/api/problems/${id}/assets`,
      )
      .pipe(catchError(() => of([])));
  }
}
