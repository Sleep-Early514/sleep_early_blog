# 本个人博客项目技术栈详细介绍

> 项目名称：`2025-blog`（早点睡的小窝）
> 项目性质：**Git 即数据库**的现代个人博客，前端直接通过 GitHub API 读写仓库内容，无需传统数据库。
> 仓库远程：`github.com/Sleep-Early514/sleep_early_blog`（main 分支）

---

## 一、项目概览

这是一个基于 **Next.js 16 + React 19** 的全栈个人博客系统，最核心的设计理念是：**用 Git 仓库作为内容后端（Content-as-Code）**。

- 博客文章以 **Markdown 文件**存储在 `public/blogs/` 目录中；
- 网站内容（首页卡片、分享、项目、图片等）以 **JSON 文件**存储在 `src/config/` 与 `src/app/*/list.json` 中；
- 浏览器前端通过 **GitHub App 认证 + GitHub REST API**，在页面内直接完成文章的**新增、编辑、删除与发布**，提交后触发 CI 部署，无需数据库、无需后台管理系统。

整个项目没有使用任何传统数据库（如 MySQL/MongoDB），也没有独立的 API 服务端，是一个高度"自托管"的博客解决方案。

---

## 二、核心技术栈总览

| 分类 | 技术 | 版本 | 用途 |
| --- | --- | --- | --- |
| 框架 | Next.js | 16.0.10 | 应用框架（App Router） |
| UI 库 | React / React DOM | 19.2.1 / 19.2.0 | 界面渲染 |
| 语言 | TypeScript | ^5 | 类型安全 |
| 包管理 | pnpm | lock 文件 | 依赖管理 |
| 样式 | Tailwind CSS | ^4 | 原子化 CSS |
| 状态管理 | Zustand | ^5.0.8 | 全局状态 |
| 数据请求 | SWR | ^2.3.6 | 客户端数据获取 |
| Markdown 渲染 | marked + shiki + katex | 17 / 3.15 / 0.16 | 文章渲染 |
| GitHub 认证 | jsrsasign | ^11.1.0 | JWT（RS256）签名 |
| 加密 | Web Crypto API | 内置 | AES-GCM 加密私钥 |
| 动画 | motion（Framer Motion） | ^12.23.24 | 交互动画 |
| 提示 | sonner | ^2.0.7 | Toast 通知 |
| 图标 | lucide-react | ^0.553.0 | 图标库 |
| 时间 | dayjs | ^1.11.18 | 日期处理 |
| 部署 | OpenNext for Cloudflare | ^1.14.4 | Cloudflare Workers 部署 |
| 部署工具 | wrangler | ^4.53.0 | Cloudflare CLI |
| 代码高亮 | shiki | ^3.15.0 | 代码块高亮 |
| 数学公式 | katex | ^0.16.27 | LaTeX 渲染 |
| SEO | next-sitemap | ^4.2.3 | 站点地图 |

---

## 三、核心框架与开发工具

### 3.1 Next.js 16（App Router）

项目采用 Next.js 最新的 **App Router** 架构，使用目录即路由约定：

- `src/app/(home)` —— 首页（路由组，不产生 URL 路径）
- `src/app/blog`、`src/app/about`、`src/app/projects` 等 —— 功能页面
- `src/app/blog/[id]` —— 博客详情动态路由
- `src/app/rss.xml/route.ts` —— RSS 路由处理器
- `src/app/sitemap.ts` —— 站点地图

**关键配置（`next.config.ts`）：**

- `reactCompiler: true` —— 启用 **React Compiler**（自动记忆化，减少手写 useMemo/useCallback）
- `devIndicators: false` —— 关闭开发环境指示器
- `pageExtensions` 支持 `.md` / `.mdx`
- **Turbopack** 作为开发与构建打包器，并通过 `@svgr/webpack` 规则将 `.svg` 文件直接转换为 React 组件
- 路由重定向：`/zh`、`/en` 永久重定向到首页

### 3.2 React 19

- 使用 React 19 新特性与并发特性
- 客户端组件（`'use client'`）与服务端组件（默认）混用
- 通过 `babel-plugin-react-compiler` 启用 React Compiler

### 3.3 TypeScript 严格模式

- `strict: true`，模块解析使用 `bundler` 模式
- 路径别名 `@/*` → `./src/*`
- `global.d.ts` 中声明了 SVG 模块类型与 `Nullable` 等全局工具类型
- 构建时忽略类型错误（`ignoreBuildErrors: true`）

### 3.4 包管理与脚本

使用 **pnpm** 管理依赖，`.npmrc` 开启了 pre/post 脚本。常用脚本：

```bash
pnpm dev          # 开发（Turbopack，端口 2025）
pnpm build        # Next.js 构建
pnpm build:cf     # OpenNext 构建（部署到 Cloudflare 用）
pnpm deploy       # 部署到 Cloudflare Workers
pnpm preview      # 本地预览 Cloudflare 产物
pnpm svg          # 生成 SVG 索引
pnpm cf-typegen   # 生成 Cloudflare 类型
```

### 3.5 代码规范

- **Prettier**：单引号、无分号、使用 Tab 缩进、`prettier-plugin-tailwindcss` 自动排序 Tailwind 类名
- **Code Inspector**（`code-inspector-plugin`）：开发时点击页面元素直接定位源码

---

## 四、样式方案：Tailwind CSS 4 + CSS 变量主题

### 4.1 Tailwind CSS 4

- 使用新版 `@tailwindcss/postcss` 插件，通过 PostCSS 编译
- 搭配 `tailwindcss-animate`（动画工具类）、`tailwind-merge`（类名合并去重）、`clsx`（条件类名）
- 样式文件：`src/styles/globals.css`（全局）、`theme.css`（主题变量）、`article.css`（文章排版）

### 4.2 动态主题系统

网站主题完全由 **CSS 变量**驱动，定义在 `src/config/site-content.json` 中：

```json
"theme": {
  "colorBrand": "#35bfab",
  "colorPrimary": "#334f52",
  ...
}
```

根布局（`src/app/layout.tsx`）将这些配置注入 `<html>` 的 `style` 中（`--color-brand`、`--color-bg` 等），实现**前端可视化换肤**——用户可以在首页配置面板中直接修改颜色并提交到 GitHub。

---

## 五、状态管理与数据获取

### 5.1 Zustand（全局状态）

项目大量使用 Zustand 5 管理客户端状态，按模块拆分多个 store：

| Store | 位置 | 职责 |
| --- | --- | --- |
| `config-store` | `src/app/(home)/stores/` | 站点配置、卡片样式、配置弹窗开关 |
| `layout-edit-store` | `src/app/(home)/stores/` | 首页卡片拖拽布局编辑 |
| `write-store` | `src/app/write/stores/` | 写作编辑器状态 |
| `preview-store` | `src/app/write/stores/` | 写作预览状态 |
| `useAuthStore` | `src/hooks/use-auth.ts` | 登录态与 GitHub 私钥管理 |

### 5.2 SWR（数据获取）

使用 SWR 2 在客户端获取博客索引、分类等数据，并配合自定义 hooks：

- `use-blog-index` —— 博客列表
- `use-categories` —— 文章分类
- `use-read-articles` —— 阅读记录
- `use-markdown-render` —— Markdown 异步渲染

---

## 六、Markdown 渲染管线（核心亮点）

博客文章渲染是项目的技术亮点，采用 **"解析 → 高亮 → 转 React"** 的管线：

### 6.1 渲染流程（`src/lib/markdown-renderer.ts`）

1. **`marked` 17** 负责 Markdown 词法分析与解析，注册了自定义扩展：
   - 块级数学公式 `$$...$$` → KaTeX 渲染
   - 行内数学公式 `$...$` → KaTeX 渲染（智能跳过 `$$` 与转义 `\$`）
   - 自定义标题渲染器：自动为标题生成 `id`（用于目录 TOC）
   - 任务列表（task list）支持
2. **`shiki` 3** 对代码块进行语法高亮（主题 `one-light`），失败时回退为纯文本
3. **`html-react-parser`** 将生成的 HTML 转换为 React 元素，并把 `<img>` 替换为自定义的 `MarkdownImage` 组件（懒加载、点击预览），把 `<pre>` 替换为带"复制代码"按钮的 `CodeBlock` 组件

### 6.2 特殊的环境适配

由于部署目标是 Cloudflare Workers（无 Node.js 完整环境），`shiki` 和 `katex` 都采用**动态 import 懒加载**，加载失败时优雅降级（数学公式保留原始 `$` 语法、代码块退化为普通 `<code>`）。

### 6.3 目录（TOC）

渲染时从解析后的 token 树中提取 `h1~h3` 标题，生成 TOC 供 `blog-toc.tsx` 侧边栏目录使用。

---

## 七、内容管理架构：GitHub 即后端（最具特色）

这是本项目最与众不同的部分：**没有数据库，GitHub 仓库就是内容存储**。

### 7.1 认证流程（GitHub App）

用户通过浏览器输入 GitHub App 的 **Private Key** 完成认证（`src/lib/auth.ts`）：

1. **`signAppJwt`**：使用 `jsrsasign` 以 **RS256** 算法为私钥签发 **JWT**（App ID 作为 `iss`，有效期 8 分钟）
2. **`getInstallationId`**：用 JWT 查询仓库对应的安装 ID
3. **`createInstallationToken`**：换取短期有效的 **Installation Token**（GitHub 限制 1 小时）

Token 缓存在 `sessionStorage` 中，私钥（PEM）使用 **Web Crypto API 的 AES-GCM** 加密后存储（`src/lib/aes256-util.ts`），并在 401 时自动清除认证状态。

### 7.2 内容读写（GitHub REST API）

`src/lib/github-client.ts` 封装了完整的 GitHub API 调用：

- **单文件读写**：`GET/PUT /contents/{path}`（Base64 编码，更新时携带 `sha`）
- **批量提交**（Git Data API）：`getRef → createBlob → createTree → createCommit → updateRef`，实现一次提交多个文件（例如批量删除文章）
- **递归列目录**：用于同步远程仓库文件
- 错误处理：401 清除登录态、422 提示"操作太快"

### 7.3 内容类型与存储位置

| 内容 | 存储位置 |
| --- | --- |
| 博客文章（Markdown） | `public/blogs/{slug}/index.md` + `config.json` |
| 博客索引 | `public/blogs/index.json` |
| 首页配置 | `src/config/site-content.json` |
| 卡片样式 | `src/config/card-styles.json` |
| 分享链接 | `src/app/share/list.json` |
| 项目展示 | `src/app/projects/list.json` |
| 博主推荐 | `src/app/bloggers/list.json` |
| 图片墙 | `src/app/pictures/list.json` |
| 代码片段 | `src/app/snippets/list.json` |

所有写入都走统一的 `push-*.ts` 服务（如 `push-blog.ts`、`push-shares.ts`），通过 `putFile` / 批量提交写入远程仓库，**写入即提交（commit）**，提交后由平台的 CI 自动重新部署，从而实现"前端改内容"。

### 7.4 安全设计

- 私钥仅存在于浏览器端，服务端不持有
- 私钥在 `sessionStorage` 中经 AES-GCM 加密
- 配置项 `isCachePem` 控制是否持久化私钥
- 所有内容均写入公开仓库，通过 GitHub App 的细粒度权限（仅仓库写入）控制

---

## 八、页面功能与交互

### 8.1 首页卡片化布局（`src/app/(home)`）

首页由多张"卡片"拼装而成，且**每张卡片可独立开关、拖拽排序**：

- `ArtCard` —— 头像/插画卡片（支持圣诞帽装饰 🎩）
- `HiCard` —— 欢迎语
- `ClockCard` / `CalendarCard` —— 时钟与日历
- `ShareCard` / `SocialButtons` —— 分享链接与社交按钮
- `AritcleCard` —— 文章列表
- `WriteButtons` —— 写作入口
- `HatCard` / `BeianCard` / `LikePosition` —— 装饰与备案信息

卡片显隐由 `card-styles.json` 控制，布局偏移通过 `layout-edit-store` 支持**拖拽编辑**，快捷键 `Ctrl/Cmd + L` 或 `Ctrl/Cmd + ,` 打开配置面板。

### 8.2 动态背景

- `blurred-bubbles.tsx` —— Canvas 实现彩色模糊气泡动画背景
- `snowfall.tsx` —— Canvas 雪花飘落特效（圣诞节开关 `enableChristmas`）
- 支持自定义背景图片（`backgroundImages`）

### 8.3 写作编辑器（`src/app/write`）

完整的 Markdown 写作界面，支持：

- 封面图、标签、摘要、分类等元信息编辑
- 图片上传后拖入正文
- 实时预览（preview-store）
- 发布（push-blog.ts）与删除（delete-blog.ts）

### 8.4 其他页面

- **博客列表/详情**（blog）：分类筛选、TOC 目录、阅读记录、点赞
- **分享**（share）：社交分享卡片网格
- **项目**（projects）：项目展示卡片
- **图片墙**（pictures）：随机瀑布布局
- **博主**（bloggers）：博主推荐
- **代码片段**（snippets）：代码片段集合
- **音乐**（music）：音乐播放卡片
- **时钟**（clock）、**SVG 集合**（svgs）、**工具箱**（image-toolbox）

### 8.5 全局交互组件

`src/components/` 下包含：代码块（复制按钮）、Markdown 图片（懒加载/预览）、星级评分、颜色选择器、对话框、滚动回顶按钮、音乐卡片、导航卡片等。

---

## 九、动画与视觉

- **motion（Framer Motion）12**：卡片悬停/点击动效、布局动画、按钮缩放
- **Liquid Grass**：动态引入的液体草地效果（`ssr: false`）
- **sonner**：全局 Toast 通知（底部右侧，富颜色 + 自定义图标）
- **lucide-react**：统一线性图标
- **自定义光标**：`/images/cursor.svg`
- **圣诞主题**：雪花背景、圣诞帽、节日音乐（`public/music/`）

---

## 十、SEO 与站点能力

- **`src/app/sitemap.ts`**：动态生成站点地图
- **`next-sitemap`**：构建期生成 sitemap（devDependency）
- **`src/app/rss.xml/route.ts`**：静态 RSS 2.0 订阅源（含 `enclosure` 封面、分类、CDATA 描述），`force-static`
- **`public/manifest.json`**：PWA Manifest（standalone 模式）
- 根布局导出 `Metadata`（title/description/OpenGraph/Twitter Card）

---

## 十一、部署架构：Cloudflare Workers（OpenNext）

### 11.1 部署目标

项目主推部署到 **Cloudflare Workers/Pages**，使用 **OpenNext for Cloudflare**（`@opennextjs/cloudflare`）把 Next.js 应用适配到 Cloudflare 边缘运行时：

- `open-next.config.ts`：`defineCloudflareConfig()` 标准配置
- `wrangler.toml`：
  - Worker 入口 `.open-next/worker.js`
  - 静态资源目录 `.open-next/assets`
  - `nodejs_compat` 兼容标志
  - 开启 observability（100% 采样、调用日志、持久化日志）
- 构建命令 `pnpm run build:cf`，部署命令 `pnpm deploy`

### 11.2 兼容性适配

代码中有多处针对 Cloudflare Workers 环境的降级处理（如 shiki/katex 懒加载、避免 Node API 依赖），说明项目在"边缘计算"环境下做了细致的兼容。

### 11.3 备选方案

README 中也提供了 **Vercel** 一键部署的流程说明（设置环境变量后直接 Import 部署），因此同一套代码可同时部署到 Vercel 或 Cloudflare。

---

## 十二、环境变量

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `NEXT_PUBLIC_GITHUB_OWNER` | `yysuni` | GitHub 仓库所有者 |
| `NEXT_PUBLIC_GITHUB_REPO` | `2025-blog-public` | 内容仓库名 |
| `NEXT_PUBLIC_GITHUB_BRANCH` | `main` | 操作分支 |
| `NEXT_PUBLIC_GITHUB_APP_ID` | `-` | GitHub App ID（JWT 签发） |
| `NEXT_PUBLIC_GITHUB_ENCRYPT_KEY` | 内置默认值 | PEM 私钥 AES-GCM 加密密钥 |
| `BLOG_SLUG_KEY` | 空 | 博客 slug 密钥 |
| `NEXT_PUBLIC_SITE_URL` | `https://www.yysuni.com` | 站点 URL（RSS 生成用） |

> 说明：因为是公开仓库，环境变量主要影响 GitHub App 的归属与安全，也可直接在 `src/consts.ts` 中硬编码修改。

---

## 十三、目录结构速览

```
Blog2/
├── next.config.ts          # Next.js 配置（React Compiler、Turbopack、SVG loader）
├── open-next.config.ts     # OpenNext Cloudflare 配置
├── wrangler.toml           # Cloudflare Workers 配置
├── postcss.config.mjs      # Tailwind 4 PostCSS
├── tsconfig.json           # TS 严格模式 + 路径别名
├── global.d.ts             # SVG / 全局类型声明
├── scripts/
│   └── gen-svgs-index.js   # SVG 索引生成脚本
├── public/
│   ├── blogs/              # 博客文章（Markdown + JSON + 图片）
│   ├── images/             # 静态图片资源（art、share、hats、christmas…）
│   └── manifest.json       # PWA 清单
└── src/
    ├── app/                # 页面（App Router）
    │   ├── (home)/         # 首页卡片体系 + 配置弹窗 + stores
    │   ├── blog/           # 博客列表与详情
    │   ├── write/          # 写作编辑器
    │   ├── about/ projects/ share/ pictures/ bloggers/ snippets/
    │   ├── music/ clock/ svgs/ image-toolbox/
    │   └── rss.xml/ sitemap.ts
    ├── components/         # 通用组件（CodeBlock、MarkdownImage、NavCard…）
    ├── config/             # 站点配置 JSON（site-content、card-styles）
    ├── hooks/              # 自定义 Hooks（auth、markdown、blog-index…）
    ├── layout/             # 全局布局（header、footer、背景动画）
    ├── lib/                # 核心库（github-client、auth、markdown-renderer、aes256…）
    ├── styles/             # 全局/主题/文章样式
    └── svgs/               # SVG 图标（编译为 React 组件）
```

---

## 十四、数据流总结

```
┌─────────────┐   GitHub App Private Key    ┌──────────────────┐
│   浏览器前端   │ ──────────────────────────► │  GitHub API       │
│ (React/Next) │  RS256 JWT → Installation   │  (jsrsasign 签名)  │
│              │  Token → REST API           │                   │
│  写文章/改配置 │ ◄────────────────────────── │  contents / git   │
└─────────────┘   commit 写入仓库             │  Data API         │
        │                                     └────────┬─────────┘
        │ 读取（静态文件/构建时）                          │ push 触发
        ▼                                              ▼
┌─────────────┐                              ┌──────────────────┐
│  站点渲染     │                              │  CI 自动部署       │
│ (SSR/静态)   │                              │ Cloudflare/Vercel │
└─────────────┘                              └──────────────────┘
```

1. **读**：博客文章以 Markdown 文件存在于仓库中，页面构建/运行时直接读取渲染；
2. **写**：前端页面调用 GitHub API，将修改**作为一次 Git commit** 推送到仓库；
3. **发布**：push 触发平台 CI 重新构建部署，刷新后即可看到新内容。

这种模式让**内容与代码同源、可版本化、可回滚**，完全去中心化，无需自建服务器与数据库。

---

## 十五、技术亮点总结

1. **Git 即数据库**：零后端、零数据库的博客内容管理，全链路前端完成
2. **GitHub App 细粒度认证**：浏览器端 RS256 JWT + AES-GCM 私钥加密
3. **Next.js 16 + React Compiler**：前沿框架特性，自动性能优化
4. **Turbopack 构建**：下一代打包器，快速冷启动
5. **Tailwind CSS 4 动态主题**：CSS 变量驱动的可视化换肤
6. **完整 Markdown 渲染管线**：marked + shiki + katex，含 TOC、任务列表、数学公式
7. **边缘部署**：OpenNext + Cloudflare Workers，全球边缘运行，兼容性优雅降级
8. **丰富的视觉交互**：Canvas 动画背景、拖拽布局、卡片式首页、节日特效
9. **开箱即用的 SEO**：sitemap、RSS、PWA Manifest、OpenGraph 齐全
10. **非程序员友好**：前端可视化配置，支持直接改网站内容并一键发布
