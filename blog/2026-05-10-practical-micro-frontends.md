---
slug: practical-micro-frontends-building-scalable-uis
title: "Practical Micro Frontends: Building Scalable UIs"
description: "Tách monolith UI thành nhiều mảnh nhỏ, mỗi team tự build & deploy độc lập. Bài này giải thích Module Federation, routing, shared state, và pitfalls khi đưa Micro Frontends vào production."
author: Pin Nguyen
author_title: Software Developer
author_image_url: https://avatars.githubusercontent.com/Pinnguyen
tags: [Micro Frontends, React, Module Federation, Architecture, Scalable UI]
date: '2026-05-10T08:00:00Z'
image: https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=1200&auto=format&fit=crop&q=80
---

Khi codebase frontend càng lớn, càng nhiều team đụng nhau: deploy chậm, build lâu, ai merge cũng phải chờ. **Micro Frontends (MFE)** giải quyết bằng cách chia 1 app to thành nhiều app nhỏ — mỗi team owns 1 mảnh, tự build, tự deploy, ráp lại thành 1 UI thống nhất.

<!-- truncate -->

# Practical Micro Frontends: Building Scalable UIs

> Bài viết này hướng đến developer đang gặp pain với monolith frontend. Mình sẽ đi qua **khái niệm**, **kiến trúc**, **code mẫu Module Federation**, và **5 pitfalls** thường gặp khi triển khai thực tế.

## Mục lục

1. [Micro Frontends là gì?](#mfe-la-gi)
2. [So sánh: Monolith vs Micro Frontends](#so-sanh)
3. [Kiến trúc tổng quan](#kien-truc)
4. [Hands-on: Module Federation với Webpack 5](#hands-on)
5. [Shared state giữa các MFE](#shared-state)
6. [5 pitfalls thường gặp](#pitfalls)
7. [Khi nào KHÔNG nên dùng MFE](#khi-nao-khong-nen)

## 1. Micro Frontends là gì? {#mfe-la-gi}

Tưởng tượng bạn có 1 trang e-commerce:

```
┌──────────────────────────────────────────┐
│              Header (Team A)             │
├──────────┬─────────────────┬─────────────┤
│  Sidebar │   Product List  │   Cart      │
│ (Team A) │    (Team B)     │  (Team C)   │
├──────────┴─────────────────┴─────────────┤
│              Footer (Team A)             │
└──────────────────────────────────────────┘
```

Mỗi vùng tô màu là **1 micro frontend** — 1 React app độc lập:

- **Team A**: shell app (header, sidebar, footer, routing)
- **Team B**: product catalog
- **Team C**: cart & checkout

Mỗi team có repo riêng, CI/CD riêng, deploy ra production riêng. User mở trang vẫn thấy 1 UI liền mạch.

### Định nghĩa ngắn gọn

> **Micro Frontends** = áp dụng tư duy **microservices** vào tầng UI: chia nhỏ, độc lập, deploy riêng, ráp lại lúc runtime.

## 2. So sánh: Monolith vs Micro Frontends {#so-sanh}

| Tiêu chí | Monolith UI | Micro Frontends |
|---|---|---|
| **Build time** | 8-15 phút (toàn app) | 1-2 phút (chỉ MFE đổi) |
| **Deploy** | Cả app cùng lúc | Mỗi MFE deploy riêng |
| **Team coordination** | Phải sync release | Mỗi team chạy độc lập |
| **Tech stack** | 1 stack cho cả app | Mỗi MFE có thể khác stack |
| **Bug isolation** | 1 bug có thể kéo cả app | Bug giới hạn trong 1 MFE |
| **Complexity** | Thấp lúc đầu, cao về sau | Cao lúc đầu, ổn định về sau |
| **Phù hợp** | Startup, MVP, team < 10 | Enterprise, team > 20 |

**Tóm lại**: MFE không phải "tốt hơn" — nó là **trade-off**. Bạn đổi sự đơn giản lấy sự độc lập.

## 3. Kiến trúc tổng quan {#kien-truc}

Có 3 cách phổ biến để ráp các MFE lại:

### 3.1 Build-time integration

Mỗi MFE được publish như 1 npm package. Shell app `npm install` và import vào.

```
shell-app
  ├── @company/header   ← npm package
  ├── @company/product  ← npm package
  └── @company/cart     ← npm package
```

**Vấn đề**: muốn update 1 MFE thì phải rebuild shell → mất luôn cái độc lập.

### 3.2 Server-side integration (SSI / Edge-side includes)

Mỗi MFE render HTML ở server riêng, nginx/edge ráp lại.

```
GET /products
  ├── nginx fetch /header from team-A.com
  ├── nginx fetch /product-list from team-B.com
  └── nginx merge → trả về user
```

**Phù hợp**: SEO-heavy, content sites.

### 3.3 Runtime integration (phổ biến nhất)

Trình duyệt load shell app trước, rồi dynamic load JS bundle của từng MFE từ CDN.

```
Browser load shell.js
  → shell render skeleton
  → shell fetch product.js từ cdn.team-b.com
  → product MFE mount vào DOM
```

Công cụ phổ biến nhất hiện nay: **Module Federation** (Webpack 5).

## 4. Hands-on: Module Federation với Webpack 5 {#hands-on}

Xây 1 demo nhỏ: **shell app** + **product MFE**.

### 4.1 Cấu hình product MFE (host)

```js
// product/webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container

module.exports = {
  entry: './src/index.js',
  output: { publicPath: 'http://localhost:3001/' },
  plugins: [
    new ModuleFederationPlugin({
      name: 'product',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductList': './src/ProductList',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
}
```

Giải thích:
- `name: 'product'` → tên của MFE này
- `filename: 'remoteEntry.js'` → manifest mà shell sẽ load
- `exposes` → component nào được "share ra"
- `shared` → react/react-dom dùng chung, không load trùng

### 4.2 Cấu hình shell app (consumer)

```js
// shell/webpack.config.js
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    product: 'product@http://localhost:3001/remoteEntry.js',
  },
  shared: ['react', 'react-dom'],
})
```

### 4.3 Dùng remote component trong shell

```jsx
// shell/src/App.jsx
import React, { lazy, Suspense } from 'react'

const ProductList = lazy(() => import('product/ProductList'))

export default function App() {
  return (
    <div>
      <h1>My Shop</h1>
      <Suspense fallback={<div>Loading products...</div>}>
        <ProductList />
      </Suspense>
    </div>
  )
}
```

**Magic**: `import('product/ProductList')` không phải import từ disk — Webpack sẽ fetch JS từ `http://localhost:3001/remoteEntry.js` lúc runtime.

### 4.4 Deploy độc lập

```
Team B đổi ProductList → deploy lên cdn.team-b.com
                       → shell KHÔNG cần rebuild
                       → user reload tự thấy version mới
```

Đó chính là **giá trị cốt lõi** của MFE: deploy độc lập.

## 5. Shared state giữa các MFE {#shared-state}

Câu hỏi đau đầu nhất: **Header (Team A) đếm số item trong cart, Cart MFE (Team C) sửa cart. Làm sao sync?**

### Cách 1: Custom events (DOM events)

```js
// Cart MFE phát event
window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 3 } }))

// Header lắng nghe
window.addEventListener('cart:updated', (e) => {
  setCount(e.detail.count)
})
```

**Ưu**: đơn giản, không phụ thuộc framework.
**Nhược**: khó type-safe, dễ "ma trận" event.

### Cách 2: Shared store (Zustand / Redux qua module federation)

Expose store như 1 module:

```js
// auth-mfe expose userStore
exposes: { './userStore': './src/store' }

// các MFE khác import
import { useUser } from 'auth/userStore'
```

**Ưu**: type-safe, devtools tốt.
**Nhược**: tất cả MFE phải dùng cùng 1 state lib.

### Cách 3: URL là single source of truth

Cart info đẩy lên URL params, mỗi MFE đọc từ URL.

```
/products?cart=3&filter=phones
```

**Ưu**: refresh không mất state, share link dễ.
**Nhược**: chỉ phù hợp với state nhỏ, đơn giản.

> **Khuyến nghị thực tế**: Dùng kết hợp — auth/user dùng shared store, UI ephemeral state dùng custom events, deep-linkable state dùng URL.

## 6. 5 pitfalls thường gặp {#pitfalls}

Đây là các bug mình từng gặp khi triển khai MFE ở production:

### Pitfall 1: CSS leak

MFE A định nghĩa `.button { color: red }`, đè lên `.button` của MFE B.

**Fix**:
- CSS Modules / Styled Components → scope tự động
- Hoặc prefix tất cả class: `.team-a__button`
- Shadow DOM cho các MFE quan trọng (Web Components)

### Pitfall 2: Duplicate React

Mỗi MFE bundle 1 bản React → load 3 lần → bug `hooks can only be called inside function components`.

**Fix**: khai báo `shared: { react: { singleton: true, eager: true } }`.

### Pitfall 3: Routing conflict

Shell dùng react-router v6, product MFE dùng v5 → crash.

**Fix**:
- Thống nhất version qua `shared`
- Hoặc dùng routing 2 cấp: shell handle path top-level, MFE handle sub-path

### Pitfall 4: Version skew

Shell deploy lúc 10h sáng, expect product MFE version 2.0. Product MFE deploy lúc 11h → từ 10-11h shell load product 1.x → API mismatch.

**Fix**:
- Contract testing giữa shell ↔ MFE
- Versioned bundle: `remoteEntry-v2.js`
- Feature flag để rollback nhanh

### Pitfall 5: Slow loading

Mỗi MFE = 1 network request → user thấy loading nhiều chỗ.

**Fix**:
- Preload MFE critical (header, sidebar) trong `<link rel="modulepreload">`
- Skeleton UI thay vì spinner
- Bundle splitting tốt: MFE chỉ load khi user thực sự cần

## 7. Khi nào KHÔNG nên dùng MFE {#khi-nao-khong-nen}

MFE không phải silver bullet. Đừng dùng nếu:

- **Team < 10 người**: overhead lớn hơn lợi ích, monolith vẫn nhanh hơn
- **App nhỏ**: 5-10 màn hình, không cần độc lập deploy
- **Team chưa giỏi DevOps**: MFE đòi CI/CD, contract testing, observability tốt
- **Cần SEO mạnh**: SSR + MFE phức tạp, cân nhắc Next.js monolith trước

> **Quy tắc cá nhân**: Bắt đầu monolith, chia thành module rõ ràng. Khi nào 2+ team đụng nhau trong cùng folder mỗi sprint → đó là tín hiệu cân nhắc MFE.

## Tóm tắt 1 phút

- **MFE = microservices cho UI**: chia nhỏ, deploy độc lập, ráp lại runtime
- **Module Federation** (Webpack 5) là cách phổ biến nhất hiện nay
- **Shared state** dùng kết hợp custom events + shared store + URL
- **Đừng over-engineer**: monolith → modular monolith → MFE chỉ khi thật sự cần
- **Đo lường**: nếu build time, deploy frequency, team coordination không cải thiện → bạn đã chia sai

Cảm ơn bạn đã đọc. Nếu đang cân nhắc đưa MFE vào team, hãy bắt đầu từ 1 mảnh nhỏ (footer, header) để team quen với CI/CD multi-repo trước khi đụng các mảnh phức tạp như checkout hay auth.
