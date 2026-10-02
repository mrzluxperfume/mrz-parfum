import { cpSync, rmSync } from 'node:fs'

rmSync('dist', { recursive: true, force: true })
cpSync('client/dist', 'dist', { recursive: true })
// Production sitemap is served by /.netlify/functions/sitemap
rmSync('dist/sitemap.xml', { force: true })
