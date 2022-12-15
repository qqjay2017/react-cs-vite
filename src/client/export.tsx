import { UserConfig } from "vite";

export * from "react-router-dom";

export interface RcvConfig extends UserConfig {
  /**
   * 路由模式
   * @default 'next'
   */
  routeStyle: "next" | "nuxt" | "remix";
}

export function defineConfig(config: Partial<RcvConfig> = {}) {
  return config;
}
