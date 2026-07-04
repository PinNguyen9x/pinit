# ---------- Stage 1: deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
# .npmrc chứa legacy-peer-deps=true nên phải copy vào để npm ci hiểu
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# ---------- Stage 2: builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# API_URL được truyền vào lúc build (Next inline biến vào bundle nếu dùng ở client)
ARG API_URL
ENV API_URL=${API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- Stage 3: runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Chạy bằng user không phải root cho an toàn
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# output: 'standalone' của Next chỉ bundle đúng file cần thiết
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
