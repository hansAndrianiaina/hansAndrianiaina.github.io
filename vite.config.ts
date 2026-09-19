import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Read the environment variable passed from the GitHub Action workflow
const currentBranch = process.env.VITE_GITHUB_REF_NAME

export default defineConfig({
  base: currentBranch === 'dev' ? '/dev/' : '/',
  plugins: [react()],
})
