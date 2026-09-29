import { cpSync, rmSync } from 'node:fs'

rmSync('dist', { recursive: true, force: true })
cpSync('client/dist', 'dist', { recursive: true })
