/**
 * Mock Backend Service (Local Authentication & Persistence)
 *
 * This service manages local authentication and sessions directly in browser localStorage.
 * No external database, Supabase credentials, or server-side fs/promises are used.
 * Data is safely kept in browser localStorage and easily migratable to Supabase or
 * another database in the future.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserRecord extends User {
  passwordHash: string;
  salt?: string;
}

const USERS_KEY = "mock_db_users";
const SESSION_KEY = "mock_session_token";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Preserves existing localStorage password hashing logic (reversible base64 hash)
const mockHash = (str: string): string => {
  try {
    return btoa(unescape(encodeURIComponent(str))).split("").reverse().join("");
  } catch {
    return btoa(str).split("").reverse().join("");
  }
};

// PBKDF2 verification helper for backward compatibility with any salt-hashed accounts
async function verifyPbkdf2(
  password: string,
  saltHex: string,
  expectedHashHex: string,
): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !window.crypto?.subtle) return false;
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );
    const saltBytes = new Uint8Array(
      saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
    );
    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations: 100000,
        hash: "SHA-512",
      },
      keyMaterial,
      512,
    );
    const hashHex = Array.from(new Uint8Array(derivedBits))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex === expectedHashHex;
  } catch {
    return false;
  }
}

const getUsers = (): UserRecord[] => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return [];
  }
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to read users from localStorage:", error);
    return [];
  }
};

const saveUsers = (users: UserRecord[]): void => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users to localStorage:", error);
  }
};

export const mockBackend = {
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: string | null }> {
    await delay(250);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      return { user: null, error: "Please enter your name." };
    }
    if (!trimmedEmail) {
      return { user: null, error: "Please enter your email." };
    }
    if (!password || password.length < 6) {
      return { user: null, error: "Password must be at least 6 characters long." };
    }

    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase())) {
      return { user: null, error: "An account with this email already exists." };
    }

    // Use name as internal ID for full backward compatibility with XP & lesson records
    const internalId = trimmedName;

    const newUser: UserRecord = {
      id: internalId,
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: mockHash(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    // Auto login session
    const sessionToken = btoa(encodeURIComponent(newUser.id) + ":" + Date.now());
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(SESSION_KEY, sessionToken);
      } catch {}
    }

    const { passwordHash: _ph, salt: _s, ...user } = newUser;
    return { user, error: null };
  },

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: string | null }> {
    await delay(250);
    const trimmedEmail = email.trim().toLowerCase();
    const users = getUsers();

    const userRecord = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!userRecord) {
      return { user: null, error: "Invalid email or password." };
    }

    let isMatch = userRecord.passwordHash === mockHash(password);

    if (!isMatch && userRecord.salt) {
      isMatch = await verifyPbkdf2(password, userRecord.salt, userRecord.passwordHash);
    }

    if (!isMatch) {
      return { user: null, error: "Invalid email or password." };
    }

    const sessionToken = btoa(encodeURIComponent(userRecord.id) + ":" + Date.now());
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(SESSION_KEY, sessionToken);
      } catch {}
    }

    const { passwordHash: _ph, salt: _s, ...user } = userRecord;
    return { user, error: null };
  },

  async logout(): Promise<void> {
    await delay(100);
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {}
    }
  },

  async getSessionUser(): Promise<User | null> {
    await delay(100);
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return null;
    }

    const token = localStorage.getItem(SESSION_KEY);
    if (!token) return null;

    try {
      let userId: string | null = null;
      try {
        const decoded = atob(token);
        const parts = decoded.split(":");
        const firstPart = parts[0];
        if (firstPart) {
          userId = decodeURIComponent(firstPart);
        }
      } catch {
        userId = token;
      }

      if (userId) {
        const currentId = userId;
        const users = getUsers();
        const userRecord = users.find(
          (u) => u.id === currentId || u.email.toLowerCase() === currentId.toLowerCase(),
        );
        if (userRecord) {
          const { passwordHash: _ph, salt: _s, ...user } = userRecord;
          return user;
        }
      }
    } catch (error) {
      console.error("Failed to restore session user:", error);
    }

    return null;
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    await delay(250);
    const trimmedEmail = email.trim().toLowerCase();
    const users = getUsers();
    const userRecord = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!userRecord) {
      return { success: false, error: "No account found with that email address." };
    }
    return { success: true, error: null };
  },

  updateProfileName(oldId: string, newName: string): void {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    const trimmed = newName.trim();
    if (!trimmed) return;

    const users = getUsers();
    const targetUser = users.find((u) => u.id === oldId);
    if (targetUser) {
      targetUser.name = trimmed;
      targetUser.id = trimmed;
      saveUsers(users);

      const sessionToken = btoa(encodeURIComponent(trimmed) + ":" + Date.now());
      try {
        localStorage.setItem(SESSION_KEY, sessionToken);
      } catch {}
    }
  },
};
