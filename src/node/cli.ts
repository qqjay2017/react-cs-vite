import { createServer ,searchForWorkspaceRoot } from "vite";
import { fileURLToPath } from "url";
// import { createHtmlPlugin } from "vite-plugin-html";
import Pages from 'vite-plugin-pages'
// import type { Plugin, ViteDevServer, ResolvedConfig } from 'vite'
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const root = resolve(__dirname, "..");
console.log(  searchForWorkspaceRoot(process.cwd()),'searchForWorkspaceRoot');
const publicDir = resolve(root, "public");
const pwd = process.env.pwd||'';
console.log(resolve(pwd,'./src/pages'),'ppp');
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
const base = '/base/';

;(async () => {
  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    base:base,
    configFile: false,
    mode:'development',
  
    root: root,
    server: {
      port: 1337,
      fs:{
        allow:[
          searchForWorkspaceRoot(process.cwd()),
          '..'
        ]
      }
    },
    publicDir: publicDir,
    define:{
      // '__PWD__':JSON.stringify(process.env.pwd)
    },
    plugins: [
      Pages({
       
        dirs: resolve(pwd,'./src/pages'),
      }),
      react(),
      // createHtmlPlugin({
      //   entry: '/client/client.js',
      //   verbose:true,
      //   inject:{
      //     data:{}
      //   }

      
      // }),
      // testHtmlPlugin()
     
    ],
  });
  await server.listen();
  server.printUrls();
})();


// function testHtmlPlugin():Plugin{
//   return {
//     name:'test-html',
//     configResolved(server: ViteDevServer){
//       return ()=>{
//         server.middlewares.use(async (req, res, next) => {
//            // if not html, next it.
//            if (!req.url?.endsWith('.html') && req.url !== '/') {
//             return next()
//           }
//           let url = req.url
//           const pageName = (() => {
//             if (url === '/') {
//               return 'index'
//             }
//             return url.match(new RegExp(`${options.pagesDir}/(.*)/`))?.[1] || 'index'
//           })()

//         })

//       }
//     }
    
//   }
// }