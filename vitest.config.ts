import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@domain": fromRoot("./src/domain"),
      "@application": fromRoot("./src/application"),
      "@infra": fromRoot("./src/infrastructure"),
      "@presentation": fromRoot("./src/presentation"),
      "@main": fromRoot("./src/main"),
      "@shared": fromRoot("./src/shared"),
      "@lib": fromRoot("./src/lib"),
      "@": fromRoot("./"),
    },
  },
});
