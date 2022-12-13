import { createServer } from "vite";
import { fileURLToPath } from "url";
import { createHtmlPlugin } from "vite-plugin-html";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const root = resolve(__dirname, "..");

const publicDir = resolve(root, "public");


import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
(async () => {
  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    configFile: false,
    root: root,
    server: {
      port: 1337,
    },
    publicDir: publicDir,
    plugins: [
      react(),
      createHtmlPlugin({
        entry: '/client/client.js',
        template:'/html/index.html',
      }),
    ],
  });
  await server.listen();
  server.printUrls();
})();
