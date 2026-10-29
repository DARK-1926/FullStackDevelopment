import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./middleware/auth.js";
import { fallbackStore } from "./fallbackStore.js";

describe("Backend Auth & Credential Storage", () => {
  it("hashes password with bcrypt and verifies correctly", async () => {
    const rawPassword = "studentSecretPassword123";
    const hash = await bcrypt.hash(rawPassword, 10);

    expect(hash).not.toEqual(rawPassword);
    const isValid = await bcrypt.compare(rawPassword, hash);
    expect(isValid).toBe(true);

    const isWrong = await bcrypt.compare("wrongpassword", hash);
    expect(isWrong).toBe(false);
  });

  it("signs and verifies JWT authentication token", () => {
    const payload = { id: "user-123", email: "student@university.edu" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    expect(token).toBeTruthy();
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.id).toBe("user-123");
    expect(decoded.email).toBe("student@university.edu");
  });

  it("creates and retrieves user with secured credentials in store", async () => {
    const testEmail = `test_${Date.now()}@university.edu`;
    const hashedPassword = await bcrypt.hash("securepass", 10);

    const created = fallbackStore.createUser({
      name: "Test Student",
      email: testEmail,
      password: hashedPassword,
      university: "Test Tech University",
    });

    expect(created._id).toBeTruthy();
    expect(created.email).toBe(testEmail);

    const retrieved = fallbackStore.findUserByEmail(testEmail);
    expect(retrieved).toBeTruthy();
    expect(retrieved.name).toBe("Test Student");
    expect(await bcrypt.compare("securepass", retrieved.password)).toBe(true);
  });
});

