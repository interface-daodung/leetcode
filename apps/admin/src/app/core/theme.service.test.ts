import { describe, it, expect, beforeEach } from "vitest";
import { TestBed } from "@angular/core/testing";
import { ThemeService } from "./theme.service";

describe("ThemeService", () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it("mặc định không dark khi không có localStorage", () => {
    TestBed.configureTestingModule({});
    const svc = TestBed.inject(ThemeService);
    expect(svc.isDark()).toBe(false);
  });

  it("đọc từ localStorage nếu đã lưu", () => {
    localStorage.setItem("admin:theme", "dark");
    TestBed.configureTestingModule({});
    const svc = TestBed.inject(ThemeService);
    expect(svc.isDark()).toBe(true);
  });

  it("toggle() đổi trạng thái", () => {
    TestBed.configureTestingModule({});
    const svc = TestBed.inject(ThemeService);
    expect(svc.isDark()).toBe(false);
    svc.toggle();
    expect(svc.isDark()).toBe(true);
    svc.toggle();
    expect(svc.isDark()).toBe(false);
  });

  it("setDark(true) cập nhật signal", () => {
    TestBed.configureTestingModule({});
    const svc = TestBed.inject(ThemeService);
    svc.setDark(true);
    expect(svc.isDark()).toBe(true);
    expect(localStorage.getItem("admin:theme")).toBe("dark");
  });
});
