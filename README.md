# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npx nuxi@latest init <project-name>

npm install -D sass sass-loader@latest

# webGLを使用
npm install three cannon-es

# CSS
npm install --save bootstrap @popperjs/core
npm install gsap
npm install --save-dev @types/gsap
npm install driverjs

# 構文エラーを確認するためのデバッグツール
npm install --save-dev prettier eslint @nuxt/eslint-config

```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
