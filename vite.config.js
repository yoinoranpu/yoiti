import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages (https://<user>.github.io/yoiti/) はサブパス配信になるため、
  // ビルド時だけbaseを変える(開発サーバーは今まで通りルートのまま)。
  base: command === "build" ? "/yoiti/" : "/",
  plugins: [react()],
}))
