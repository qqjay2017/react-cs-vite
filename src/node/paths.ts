import {searchForWorkspaceRoot } from "vite";
import { resolve } from "path";
import * as dotenv  from 'dotenv'
import dotenvExpand  from 'dotenv-expand'
import { fileURLToPath } from "url";
dotenvExpand.expand(dotenv.config({
}))

export const paths = (()=>{
    const workspaceRoot = searchForWorkspaceRoot(process.cwd());
    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    return {
        __dirname,
        RCV_ENV: process.env.RCV_ENV||'dev',
        workspaceRoot:  workspaceRoot,
        publicDir: resolve(workspaceRoot, "./public"),
        root:  resolve(__dirname, ".."),
        pagesDirs: resolve(workspaceRoot, "./src/pages"),
        configRoot: resolve(workspaceRoot, "./config")
    }
})()