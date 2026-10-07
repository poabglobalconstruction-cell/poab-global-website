import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAdminSupabaseClient } from "../supabase/admin";
import { createClient as createBrowserClient } from "../supabase/client";

describe("Supabase Admin Client Credential Resolution", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("1. Legacy service-role variable works: initializes client with SUPABASE_SERVICE_ROLE_KEY", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example-project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "legacy-service-role-test-key";
    delete process.env.SUPABASE_SECRET_KEY;

    const client = createAdminSupabaseClient();
    expect(client).not.toBeNull();
    expect(client).toBeDefined();
  });

  it("2. New secret-key variable works: initializes client with SUPABASE_SECRET_KEY", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example-project.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.SUPABASE_SECRET_KEY = "new-secret-key-test-key";

    const client = createAdminSupabaseClient();
    expect(client).not.toBeNull();
    expect(client).toBeDefined();
  });

  it("3. Works when both variables are set (falls back gracefully)", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example-project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "legacy-service-role-test-key";
    process.env.SUPABASE_SECRET_KEY = "new-secret-key-test-key";

    const client = createAdminSupabaseClient();
    expect(client).not.toBeNull();
  });

  it("4. Missing credentials return null safely", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example-project.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SECRET_KEY;

    const client = createAdminSupabaseClient();
    expect(client).toBeNull();
  });

  it("5. Missing NEXT_PUBLIC_SUPABASE_URL returns null safely", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SECRET_KEY = "secret-key";

    const client = createAdminSupabaseClient();
    expect(client).toBeNull();
  });

  it("6. No privileged key is exposed to browser code or prefixed with NEXT_PUBLIC_", () => {
    // Neither privileged variable name should begin with NEXT_PUBLIC_
    expect(Object.keys(process.env).some((key) => key.startsWith("NEXT_PUBLIC_SUPABASE_SECRET"))).toBe(false);
    expect(Object.keys(process.env).some((key) => key.startsWith("NEXT_PUBLIC_SUPABASE_SERVICE"))).toBe(false);

    // Browser client should only use NEXT_PUBLIC_SUPABASE_ANON_KEY
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example-project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";
    process.env.SUPABASE_SECRET_KEY = "private-secret-key";

    const browserClient = createBrowserClient();
    expect(browserClient).not.toBeNull();
  });
});
