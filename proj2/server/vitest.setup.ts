import { vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-1234567890";
process.env.PORT = process.env.PORT ?? "4000";

vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/routedash_test");
