import { createServer } from "vite";

import { resolveConfig } from "./resolveConfig";

;(async () => {
  const { mergedConfig } = await resolveConfig();

  const server = await createServer(mergedConfig);
  await server.listen();
  server.printUrls();
})();
