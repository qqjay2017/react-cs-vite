import { defineConfig } from "rollup";
import path from "node:path";
import { readFileSync } from "node:fs";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import type { Plugin, RollupOptions } from "rollup";
import MagicString from "magic-string";
import commonjs from "@rollup/plugin-commonjs";
import copy from 'rollup-plugin-copy'
import json from '@rollup/plugin-json'
import { fileURLToPath } from "node:url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname,'__dirname');
const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url)).toString()
);
// const envConfig = defineConfig({});

const clientConfig = defineConfig({
  input:{
    client: path.resolve(__dirname, "src/client/client.tsx"),
    export: path.resolve(__dirname, "src/client/export.tsx"),

  },
  external: ["./env", "@vite/env"],
  plugins: [
    ...createPublicCopyPlugins(),
    typescript({
      tsconfig: path.resolve(__dirname, "src/client/tsconfig.json"),
      declaration:true,
      declarationDir: path.resolve(__dirname, "dist/client"),
    }),
  ],
  output: {
    dir: path.resolve(__dirname, "dist/client", ),
    sourcemap: true,
  },
});

const sharedNodeOptions = defineConfig({
  treeshake: {
    moduleSideEffects: "no-external",
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
  output: {
    dir: path.resolve(__dirname, "dist"),
    entryFileNames: `node/[name].js`,
    chunkFileNames: "node/chunks/dep-[hash].js",
    exports: "named",
    format: "esm",
    externalLiveBindings: false,
    freeze: false,
  },
  onwarn(warning, warn) {
    // node-resolve complains a lot about this but seems to still work?
    if (warning.message.includes("Package subpath")) {
      return;
    }
    // we use the eval('require') trick to deal with optional deps
    if (warning.message.includes("Use of eval")) {
      return;
    }
    if (warning.message.includes("Circular dependency")) {
      return;
    }
    warn(warning);
  },
});

function createNodeConfig(isProduction: boolean) {
  return defineConfig({
    ...sharedNodeOptions,
    input: {
      cli: path.resolve(__dirname, "src/node/cli.ts"),
      index: path.resolve(__dirname, "src/node/cli.ts"),
    },
    output: {
      ...sharedNodeOptions.output,
      sourcemap: !isProduction,
    },
    external: [
      "fsevents",
      ...Object.keys(pkg.dependencies),
      ...(isProduction ? [] : Object.keys(pkg.devDependencies)),
    ],
    plugins: createNodePlugins(
      isProduction,
      !isProduction,
      // in production we use api-extractor for dts generation
      // in development we need to rely on the rollup ts plugin
      isProduction ? false : path.resolve(__dirname, "dist/node")
    ),
  });
}

export default (commandLineArgs: any): RollupOptions[] => {
  console.log(commandLineArgs,'commandLineArgs');
  const isDev = commandLineArgs.watch;
  const isProduction = !isDev;
  return defineConfig([
    clientConfig,
    createNodeConfig(isProduction)]);
};

function createNodePlugins(
  isProduction: boolean,
  sourceMap: boolean,
  declarationDir: string | false
): Plugin[] {
  return [
    nodeResolve({ preferBuiltins: true }),
    typescript({
      tsconfig: path.resolve(__dirname, "src/node/tsconfig.json"),
      sourceMap,
      declaration: declarationDir !== false,
      declarationDir: declarationDir !== false ? declarationDir : undefined,
    }),
    // Some deps have try...catch require of optional deps, but rollup will
    // generate code that force require them upfront for side effects.
    // Shim them with eval() so rollup can skip these calls.
    isProduction &&
      shimDepsPlugin({
        // chokidar -> fsevents
        "fsevents-handler.js": {
          src: `require('fsevents')`,
          replacement: `__require('fsevents')`,
        },
        // postcss-import -> sugarss
        "process-content.js": {
          src: 'require("sugarss")',
          replacement: `__require('sugarss')`,
        },
        "lilconfig/dist/index.js": {
          pattern: /: require,/g,
          replacement: `: __require,`,
        },
        // postcss-load-config calls require after register ts-node
        "postcss-load-config/src/index.js": {
          pattern: /require(?=\((configFile|'ts-node')\))/g,
          replacement: `eval('require')`,
        },
      }),
    commonjs({
      extensions: [".js",".ts"],
      // Optional peer deps of ws. Native deps that are mostly for performance.
      // Since ws is not that perf critical for us, just ignore these deps.
      ignore: ["bufferutil", "utf-8-validate"],
    }),
    json(),
    cjsPatchPlugin(),
  ];
}

function createPublicCopyPlugins(){
  return [
    copy({
      targets: [
        { src: 'src/public/**/*', dest: 'dist/public' },
        { src: 'src/html/index.html', dest: 'dist/' },
      
      ]
    })
  ]
}

// #region ======== Plugins ========

interface ShimOptions {
  src?: string;
  replacement: string;
  pattern?: RegExp;
}

function shimDepsPlugin(deps: Record<string, ShimOptions>): Plugin {
  const transformed: Record<string, boolean> = {};
  return {
    name: "shim-deps",
    transform(code, id) {
      for (const file in deps) {
        if (id.replace(/\\/g, "/").endsWith(file)) {
          const { src, replacement, pattern } = deps[file];

          const magicString = new MagicString(code);
          if (src) {
            const pos = code.indexOf(src);
            if (pos < 0) {
              this.error(
                `Could not find expected src "${src}" in file "${file}"`
              );
            }
            transformed[file] = true;
            magicString.overwrite(pos, pos + src.length, replacement);
            console.log(`shimmed: ${file}`);
          }

          if (pattern) {
            let match;
            while ((match = pattern.exec(code))) {
              transformed[file] = true;
              const start = match.index;
              const end = start + match[0].length;
              magicString.overwrite(start, end, replacement);
            }
            if (!transformed[file]) {
              this.error(
                `Could not find expected pattern "${pattern}" in file "${file}"`
              );
            }
            console.log(`shimmed: ${file}`);
          }

          return {
            code: magicString.toString(),
            map: magicString.generateMap({ hires: true }),
          };
        }
      }
    },
    buildEnd(err) {
      if (!err) {
        for (const file in deps) {
          if (!transformed[file]) {
            this.error(
              `Did not find "${file}" which is supposed to be shimmed, was the file renamed?`
            );
          }
        }
      }
    },
  };
}

/**
 * Inject CJS Context for each deps chunk
 */
function cjsPatchPlugin(): Plugin {
  const cjsPatch = `
import { fileURLToPath as __cjs_fileURLToPath } from 'node:url';
import { dirname as __cjs_dirname } from 'node:path';
import { createRequire as __cjs_createRequire } from 'node:module';

const __filename = __cjs_fileURLToPath(import.meta.url);
const __dirname = __cjs_dirname(__filename);
const require = __cjs_createRequire(import.meta.url);
const __require = require;
`.trimStart();

  return {
    name: "cjs-chunk-patch",
    renderChunk(code, chunk) {
      if (!chunk.fileName.includes("chunks/dep-")) return;

      const match = code.match(/^(?:import[\s\S]*?;\s*)+/);
      const index = match ? match.index + match[0].length : 0;
      const s = new MagicString(code);
      // inject after the last `import`
      s.appendRight(index, cjsPatch);
      console.log("patched cjs context: " + chunk.fileName);

      return {
        code: s.toString(),
        map: s.generateMap(),
      };
    },
  };
}
