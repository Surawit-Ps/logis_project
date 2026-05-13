import { CookieService } from "../cookies/cookie";

export class UserService {
  // ✅ ดึง JWT Payload
  private static getPayload(): any | null {
    try {
      const token = CookieService.get("access_token");

      if (!token) return null;

      const base64Payload = token.split(".")[1];

      if (!base64Payload) return null;

      const decoded = atob(base64Payload);

      return JSON.parse(decoded);
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  }

  // ✅ ดึง Role
  static getRole(): string | null {
    const payload = this.getPayload();

    console.log("JWT Payload:", payload);

    return payload?.Role || null;
  }

  // ✅ ดึง User ID
  static getUserId(): string | null {
    const payload = this.getPayload();

    return payload?.user_id || null;
  }

  // ✅ ดึง Email
  static getEmail(): string | null {
    const payload = this.getPayload();

    return payload?.Email || null;
  }

  // ✅ เช็ค login
  static isAuthenticated(): boolean {
    return !!CookieService.get("access_token");
  }
}