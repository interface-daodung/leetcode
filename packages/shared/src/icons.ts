/**
 * Quản lý icon của app.
 *
 * File ảnh gốc đặt tại `packages/shared/asset/icon/`. Mỗi icon có thể có nhiều
 * định dạng (`.ico`, `.png`, `.webp`, ...). Các app (web, extension, winget...)
 * dùng helper trong file này để lấy đường dẫn/URL icon tương ứng.
 *
 * Ảnh là file tĩnh — người dùng tự thêm vào folder. Code ở đây chỉ khai báo
 * tên + định dạng và cung cấp hàm trả path.
 */

export type IconFormat = "ico" | "png" | "webp";

/** Danh sách định dạng icon được hỗ trợ (thứ tự ưu tiên khi chọn mặc định). */
export const ICON_FORMATS: readonly IconFormat[] = ["ico", "png", "webp"] as const;

/** Tên icon logo chính của app. */
export const APP_ICON_NAME = "leetcodeLab";

/**
 * Map tên icon → các định dạng có file.
 *
 * Giá trị là tên file ảnh (không kèm folder). Điền đúng với file thực tế bạn
 * đặt trong `asset/icon/`. Logo chính `leetcodeLab` có 3 định dạng:
 * `leetcodeLab.ico`, `leetcodeLab.png`, `leetcodeLab.webp`.
 */
export const ICON_FILES: Record<string, Partial<Record<IconFormat, string>>> = {
  [APP_ICON_NAME]: {
    ico: `${APP_ICON_NAME}.ico`,
    png: `${APP_ICON_NAME}.png`,
    webp: `${APP_ICON_NAME}.webp`,
  },
};

/**
 * Trả đường dẫn tương đối (tính từ root package shared) tới icon theo format.
 * VD: `asset/icon/leetcodeLab.png`.
 *
 * @param name   Tên icon (key trong `ICON_FILES`), mặc định logo app.
 * @param format Định dạng file ảnh, mặc định dùng format đầu tiên có trong `ICON_FILES`.
 */
export function getIconPath(
  name: string = APP_ICON_NAME,
  format?: IconFormat,
): string {
  return `asset/icon/${getIconFileName(name, format)}`;
}

/**
 * Trả tên file ảnh icon theo format.
 *
 * @param name   Tên icon (key trong `ICON_FILES`).
 * @param format Định dạng file ảnh; nếu rỗng/thiếu sẽ chọn format ưu tiên đầu tiên có.
 */
export function getIconFileName(
  name: string,
  format?: IconFormat,
): string {
  const files = ICON_FILES[name];
  if (!files) {
    throw new Error(`Không tìm thấy icon "${name}" trong ICON_FILES.`);
  }
  const fmt = format ?? ICON_FORMATS.find((f) => files[f]);
  const file = fmt ? files[fmt] : undefined;
  if (!file) {
    throw new Error(
      `Icon "${name}" không có file định dạng "${fmt ?? "mặc định"}".`,
    );
  }
  return file;
}

/**
 * Trả URL icon hoàn chỉnh từ base URL.
 *
 * @param baseUrl Base URL serve ảnh (VD host web, hoặc absolute path).
 * @param name    Tên icon, mặc định logo app.
 * @param format  Định dạng file, mặc định chọn ưu tiên.
 */
export function getAppIconUrl(
  baseUrl = "",
  name: string = APP_ICON_NAME,
  format?: IconFormat,
): string {
  return `${baseUrl.replace(/\/$/, "")}/${getIconPath(name, format)}`;
}
