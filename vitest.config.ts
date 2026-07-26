import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

// Chỉ test logic thuần (parser, toàn vẹn dữ liệu, tính toán) — không jsdom,
// không testing-library. Hành vi hook/component kiểm thủ công theo checklist
// trong docs/ai/testing.
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', '.next'],
  },
})
