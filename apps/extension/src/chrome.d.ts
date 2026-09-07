/**
 * Khai báo tối thiểu chrome runtime API cho content script.
 * (Extension chạy trong Chrome/Edge MV3 — không cần @types/chrome đầy đủ)
 */
declare namespace chrome {
  namespace runtime {
    function getURL(path: string): string;
  }
}
