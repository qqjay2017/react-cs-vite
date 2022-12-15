import { existsSync } from "fs";
import { resolve } from "path";
import { InlineConfig, loadConfigFromFile } from "vite";
import { paths } from "./paths";
import lodash from "lodash-es";

import react from "@vitejs/plugin-react-swc";
import Pages from "vite-plugin-pages";

export const resolveConfig = async () => {
  const configs = [];
  let mainConfigPath = resolve(paths.workspaceRoot, "./config/config.ts");
  if (existsSync(mainConfigPath)) {
    const mainConfig = await loadConfigFromFile(
      {
        command: "serve",
        mode: "development",
        ssrBuild: false,
      },
      mainConfigPath
    );
    configs.push(mainConfig);
  }
  let envConfigPath = resolve(
    paths.workspaceRoot,
    `./config/config.${paths.RCV_ENV}.ts`
  );
  if (existsSync(envConfigPath)) {
    //  源码: 调用esbuild的build方法
    const envConfig = await loadConfigFromFile(
      {
        command: "build",
        mode: "development",
        ssrBuild: false,
      },
      envConfigPath
    );
    configs.push(envConfig);
  }

  let mergedConfig: InlineConfig = lodash.merge(
    {},
    ...configs.map((m) => m?.config).filter(Boolean)
  );
  const defaultConfig: InlineConfig = {
    configFile: false,
    mode: "development",
    root: paths.root,
    server: {
      port: 1337,
      fs: {
        allow: [paths.workspaceRoot, ".."],
      },
    },
    publicDir: paths.publicDir,
    define: {},
    plugins: [
      Pages({
        dirs: paths.pagesDirs,
      }),
      react(),
    ],
  };
  mergedConfig = lodash.merge<InlineConfig, InlineConfig, InlineConfig>(
    {},
    defaultConfig,
    mergedConfig
  );
  if (mergedConfig && mergedConfig.define) {
    Reflect.ownKeys(mergedConfig.define).forEach((k) => {
      if (mergedConfig.define) {
        let key = String(k);
        mergedConfig.define[key] = JSON.stringify(mergedConfig.define?.[key]);
      }
    });
  }
  return {
    configs,
    mergedConfig: mergedConfig,
  };
};
