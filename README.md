# 如约 SureWork · Web 前端工程

企业需求方 × OPC 创作者的在线发布与接单平台（PC Web）。资金由持牌支付机构托管，里程碑验收后自动分账，纠纷由平台依订单留痕仲裁。

本项目由单文件高保真原型工程化而来，**严格遵循企业级前端开发规范**（目录结构、命名、CSS/TS/Vue、Git、ESLint/Prettier、性能与安全）。

## 快速开始

```bash
npm install
npm run dev        # 开发：http://localhost:5173
npm run type-check # 类型检查（vue-tsc）
npm run lint       # ESLint 检查并自动修复
npm run format     # Prettier 格式化
npm run build      # 生产构建（先 type-check 再打包）
npm run preview    # 预览构建产物
```

## 技术栈

| 能力 | 选型 |
| --- | --- |
| 框架 | Vue 3（`<script setup>` 组合式 API）+ TypeScript 严格模式 |
| 构建 | Vite 5 + `@vitejs/plugin-vue` |
| 路由 | Vue Router 4（全部路由懒加载） |
| 状态 | Pinia |
| 样式 | SCSS（设计令牌集中管理 + BEM 命名） |
| 质量 | ESLint 9（flat config）+ Prettier 3 |
| 数据 | `src/api` Mock 层（带随机时延，驱动骨架屏与 loading） |

## 目录结构

```
src/
├── api/            # 接口请求（request.ts 统一封装 + 各业务域）
│   ├── request.ts  # Mock 请求层，替换真实 axios 只改这一处
│   ├── mocks.ts    # 模拟数据集（结构与后端接口文档一致）
│   ├── demand.ts   # 需求池 / 投标 / 运营位
│   ├── order.ts    # 订单 / 里程碑 / 验收 / 分账
│   ├── payment.ts  # 钱包 / 托管流水 / 提现
│   ├── message.ts  # 会话 / 消息（含跳单风控检测）
│   └── user.ts     # 档案 / 认证材料
├── assets/         # 静态资源
├── components/     # 公共组件（AppHeader / DemandCard / MilestoneTimeline / BaseModal …）
├── composables/    # 组合式函数（useAsync / useDemandFilter / useReveal / useToast）
├── constants/      # 常量（分账比例、里程碑拆分、自动验收时钟、筛选档位…）
├── layouts/        # 布局（DefaultLayout：顶栏 + 内容 + 页脚）
├── pages/          # 页面（demand/ 需求方 6 页 · provider/ 从业者 6 页 · shared/）
├── router/         # 路由与标题守卫
├── store/          # Pinia（user 角色切换 · ui 全局提示）
├── styles/         # variables / mixins / reset / transitions / components
├── types/          # 接口类型定义（IxxxType 约定）
├── utils/          # format / validate / functional / storage
├── App.vue
└── main.ts
```

## 核心业务映射

| 业务规则 | 代码位置 |
| --- | --- |
| 里程碑 30/40/30 拆分、≥¥3000 强制拆分 | `constants/index.ts` `MILESTONE_SPLIT` |
| 交付后 7×24h 自动验收放款 | `constants` `AUTO_ACCEPT_HOURS` + `MilestoneTimeline` 倒计时 |
| 验收通过 → 90% 分账从业者 / 10% 平台佣金 | `constants` `COMMISSION_RATE`、`OrderDetailPage` 放款金额计算 |
| 驳回上限 3 次，僵持进仲裁 | `constants` `MAX_REJECT_COUNT` + `rejectMilestone()` 校验 |
| 联系方式保护 / 防跳单 | `utils/validate.ts` `containsContactLeak()`，在 `sendMessage()` 拦截 |
| 敏感信息不落前端存储 | `utils/storage.ts` 仅存界面偏好，带内存降级 |
| XSS 防护 | `utils/validate.ts` `sanitizeText()`；全站文本走插值，无 `v-html` |

## 交互与性能要点

- **加载态**：页面级骨架屏（`SkeletonBlock`，按 dash/table/cards/profile 四种形态）；提交类操作走按钮 loading（`useAsync.runAction` + `.spin`）。
- **过渡**：路由切换 `fade-slide`；列表卡片 `IntersectionObserver` 滚动渐入（`useReveal`）；弹窗 `Teleport` + 遮罩点击/Esc 关闭。
- **性能**：路由全部懒加载、vendor 分包、滚动监听节流且 `passive: true`、`transition` 只动 `transform/opacity`。
- **无障碍**：`role="switch"`/`aria-checked`/`aria-label`、`:focus-visible` 焦点环、`prefers-reduced-motion` 全局降级（动画时长归零并直出内容）。

## 规范落地清单

- 命名：组件大驼峰多单词（`DemandCard.vue`）、工具与样式短横线（`use-demand-filter` 逻辑归入 `composables/`，文件短横线）、变量小驼峰、常量全大写下划线、布尔 `is/has/should` 前缀、方法动词开头、事件处理 `handle` 前缀。
- TypeScript：`strict` + `noUnusedLocals`，禁用 `any`，接口统一 `IxxxType` 后缀，函数入参与返回值显式标注。
- CSS：颜色/圆角/间距/层级全部走 `styles/variables.scss` 令牌；BEM 命名；嵌套 ≤3 层；`z-index` 统一常量管理。
- Git：Conventional Commits（`feat/fix/docs/style/refactor/perf/test/chore` + scope）。
- 构建：`npm run build` 串行执行 `type-check`，类型不通过不允许出包。

## 演示说明

- 右上角「需求方 / 从业者」分段控件切换双视角，路由前缀 `/demand` 与 `/provider` 隔离两侧页面。
- 当前数据全部来自 `src/api/mocks.ts`；接入真实后端时只需替换 `src/api/request.ts` 与各域接口的实现，页面与组件无需改动。
