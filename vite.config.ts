import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Check if the current GitHub Action branch is 'dev'
const isDevBranch = process.env.GITHUB_REF_NAME === 'dev'

export default defineConfig({
  base: isDevBranch ? '/dev' : '/',
  plugins: [react()],
})
