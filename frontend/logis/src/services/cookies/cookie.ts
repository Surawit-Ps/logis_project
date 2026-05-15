export class CookieService {
  // ✅ อ่าน Cookie
  static get(name: string): string | null {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );

    return match ? decodeURIComponent(match[2]) : null;
  }

  // ✅ ตั้ง Cookie
  static set(
    name: string,
    value: string,
    days: number = 1,
    path: string = "/"
  ): void {
    const expires = new Date();

    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=${path}`;
  }

  // ✅ ลบ Cookie
  static delete(name: string, path: string = "/"): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}`;
  }
}