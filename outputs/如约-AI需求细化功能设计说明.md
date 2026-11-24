## 如约 SureWork · AI 需求细化功能设计说明

> 归属模块：需求发布（需求方侧）。目标是在需求方**按下提交之前**，把"一句模糊的话"变成"可报价、可验收、可仲裁"的结构化需求。
> 本设计同时给出在现有 Vue 工程（`surework-web/`）中的落地位置，可直接排期开发。

---

## 一、功能定位与判定标准

平台已有「需求质量评分」，但只给分不给出路。AI 需求细化是它的手术刀：**诊断 → 追问 → 补写 → 用户确认**，把低质量需求在发布前就修好。

一份"可执行需求"的判定标准（也是 AI 的诊断维度，五维）：

| 维度 | 合格线 | 反例 | 正例 |
| --- | --- | --- | --- |
| 目标（Why） | 说清业务目的与成功样子 | "做个高端点的品牌视觉" | "3 家新店 11 月开业，需要统一视觉以支撑加盟招商" |
| 使用场景（Where） | 交付物在哪里被使用、给谁看 | "做菜单" | "门店吧台立式菜单 + 小程序电子菜单，客群 25–35 岁" |
| 功能/交付范围（What） | 交付物可枚举、边界明确 | "包含设计和源文件" | "Logo 微调 1 套、主视觉 3 案、早晚市菜单各 1 套、分层源文件" |
| 优先级（Which first） | 有取舍与时间刚性 | "尽快" | "菜单优先（10/20 前必须上），主视觉可 11 月初" |
| 验收标准（Done） | 可客观判定通过与否 | "好看就行" | "主视觉在店内实拍验证；源文件含字体授权清单；每条 2 轮修改" |

**核心原则：AI 只做建议，绝不覆盖用户内容。** 所有产出以 diff 形式呈现，逐条由需求方采纳。

---

## 二、触发方式（四个入口，一条主线）

| 入口 | 触发条件 | 打断程度 |
| --- | --- | --- |
| ① 静默预分析 | 描述字段失焦，或停止输入 1.2s（防抖）且字数 ≥ 20 | 不打断。仅在字段右侧出现质量点（灰/黄/绿）与一句"3 处可补充 ›" |
| ② 显式细化 | 点击表单底部「AI 帮我细化」 | 打开右侧细化面板（表单不收起，可对照） |
| ③ 素材转需求 | 粘贴聊天记录/文档/竞品链接 →「从素材生成需求草稿」 | 直接产出结构化草稿，进入 ⑤ 确认流 |
| ④ 提交拦截 | 点「提交审核」时质量分 < 60 | 弹出提示"有 3 项未明确，可能被从业者压价或后期扯皮"，提供【去细化】与【仍要提交】两个出口，不强制 |

发布后 24 小时内、且**尚无投标**时，可在需求详情页再次触发细化；一旦有投标，验收标准类字段变更需走"通知并请求已投标者重新确认"流程（见第六节）。

---

## 三、交互流程（六步，面板内单向下进）

```
① 解析回显 → ② 五维诊断 → ③ 澄清追问 → ④ 生成草稿 → ⑤ 逐条确认 → ⑥ 复检放行
```

**① 解析回显（先证明"我听懂了"）**
AI 用 3–5 条要点复述已识别信息：目标、场景、交付物、时间、预算。每条右侧有【对】【不对】。点【不对】可直接改文字——这一步避免 AI 在错误前提上继续加戏。

**② 五维诊断**
雷达图 + 每维一句结论 + 定位到原文片段（点击可滚动高亮到表单对应文字）。示例：
> 验收标准 · 缺失：全文没有可判定的通过条件，后期争议概率高。

**③ 澄清追问（关键设计：选项式，不甩长问卷）**
最多 5 题，按影响成交与纠纷的程度排序。每题 2–4 个预设选项 + 自由输入 + 【不确定，按平台建议填】。

> Q1（验收标准）这份菜单系统需要覆盖哪些场景？
> ○ 仅门店立式　○ 门店 + 小程序电子菜单　○ 门店 + 外卖平台图　＋ 自定义
>
> Q2（优先级）如果时间紧张，哪一项必须先保？
> ○ 主视觉　○ 菜单系统　○ 源文件规范　＋ 自定义

答完即生成；跳过的问题按"平台建议"填充并打上 `由 AI 建议` 标记，与用户自填区分。

**④ 生成草稿（diff，而非整段替换）**
左原文右建议并排，或字段内联 diff：新增绿底、修改黄底、删除灰底删除线。每条建议头部标注**依据**（"依据：Q1 选择门店+小程序"、"依据：设计类指导价 ¥800–3,000/项"）。

**⑤ 逐条确认（见第五节）**

**⑥ 复检**
质量分实时更新（如 42 → 86），达标后「提交审核」按钮转为可用态并提示"预计比同类需求多收 2–3 份投标"。

---

## 四、输出形式（五块内容，各归其位）

1. **诊断卡**：五维进度条 + 一句结论 + 原文定位链接。
2. **澄清问题卡**：选项式单选/多选，进度指示（2/5），支持跳过。
3. **结构化需求草稿**：写回表单字段——标题、描述（背景/目标/范围三段）、交付物清单（可勾选增删）、验收标准（有序列表，逐条可判定）、里程碑建议（按 30/40/30 折算金额）。
4. **预算与周期建议**：给区间 + 计算依据（交付物数量 × 品类指导价 + 周期），并标注"低于 ¥X 的需求在需求池会被降权"。这是最容易拍脑袋的地方，AI 给锚点价值最高。
5. **风险提示**：以从业者视角预警，如"未约定修改轮数，易出现无限改稿"、"未指定源文件格式，交付时易起争议"。

附加输出：【复制全文】【存为我的需求模板】——企业高频复用品类（开业物料、月度代运营）沉淀成模板，下次一键复用。

---

## 五、需求方如何确认与修改 AI 结果

这是决定功能口碑的部分，规则要"轻但确定"：

- **逐条三态**：`采纳` / `编辑后采纳`（就地可改）/ `忽略`。忽略时可选一个原因标签（不符合事实 / 太啰嗦 / 暂不需要），用于模型迭代，不强制填写。
- **不做整块覆盖**：面板顶部提供【全部采纳】【全部撤销】，但默认粒度是单条。
- **可撤销**：每次采纳写入表单前压入快照栈，支持【撤销上一步】与回到"AI 细化前"的原文；采纳写入的字段带 2s 高亮描边，让用户看见改了什么。
- **来源标记**：AI 填充的内容在字段旁留 `AI` 小徽标，鼠标悬停显示生成依据；用户手动编辑后徽标自动消失（表示已被本人确认背书）。
- **提交前终审页**：展示需求完整预览 + 质量分 + 一句法务语义提示——"验收标准将作为电子合同附件，是后续争议仲裁的首要依据"，需勾选确认后才可提交。
- **发布后变更**：无投标时改完即生效；已有投标时，改动**验收标准/交付物/预算**三类字段会触发"变更需通知并请求已投标者重新确认"，避免规则中途变更引发的纠纷。
- **可申诉**：AI 建议明显失当（如预算建议离谱）可一键反馈，进入运营规则复核队列。

---

## 六、接口与数据设计

### 6.1 接口

```
POST /api/demands/refine            # 主接口：诊断 + 追问答案 + 生成建议
  req : { draftId, raw: IDemandDraftType, answers?: IClarifyAnswerType[], mode: 'diagnose'|'clarify'|'generate' }
  res : IRefineResultType

POST /api/demands/refine/from-material   # 素材转草稿
GET  /api/demands/refine/sessions/:draftId  # 历史轮次（可回滚）
```

### 6.2 关键类型（`src/types/ai.ts`）

```ts
export interface IDemandDraftType {
  title: string; description: string; deliverables: string[];
  acceptance: string[]; budgetCents: number; cycleDays: number; category: string;
}

export type RefineDimensionType = 'goal' | 'scene' | 'scope' | 'priority' | 'acceptance';

export interface IDiagnosisItemType {
  dimension: RefineDimensionType;
  score: number;                       // 0-100
  verdict: string;                     // 一句结论
  anchorText?: string;                 // 定位到的原文片段
}

export interface IClarifyQuestionType {
  id: string; dimension: RefineDimensionType; text: string;
  options: { label: string; value: string }[];
  allowCustom: boolean; required: boolean;
}

export interface IRefinePatchType {
  id: string;
  field: keyof IDemandDraftType;
  op: 'add' | 'replace' | 'remove';
  baseText?: string;                   // 被改动的原文
  suggestion: string;
  reason: string;                      // 生成依据（必须展示给用户）
  source: 'user-answer' | 'platform-default' | 'model';
}

export interface IRefineResultType {
  sessionId: string;
  qualityScore: number;
  diagnosis: IDiagnosisItemType[];
  questions: IClarifyQuestionType[];
  patches: IRefinePatchType[];
  budgetAdvice?: { minCents: number; maxCents: number; basis: string };
  risks: string[];
  tokensUsed: number;
}
```

### 6.3 存储

```
demand_refine_sessions(id, draft_id, enterprise_id, round, model, input_hash,
                       quality_before, quality_after, tokens, created_at)
demand_refine_patches(id, session_id, field, op, base_text, suggestion, reason, source,
                      status[accepted|edited|dismissed], dismiss_reason, created_at)
```

`input_hash` 用于内容相同则命中缓存（省钱且响应快）；`status/dismiss_reason` 是模型迭代的数据资产。

### 6.4 模型调用约束

- 强制结构化输出（JSON schema）；解析失败降级为**逐行文本协议**（`维度|字段|建议|依据`），坏一行只丢一行，不整单失败。
- 字符串值内禁止未转义英文双引号，引用词统一用「」——历史上模型在 JSON 字符串里吐引号是最常见的解析炸点。
- 输出校验：`field` 必须在白名单、`budgetAdvice` 不得超出品类指导价 ±50%、验收标准每条 ≤ 60 字且含可判定动词，不合规的 patch 直接丢弃并记日志。
- 脱敏：只上传需求文本，不上传联系方式与附件原文；隐私政策补一句"发布辅助场景下的模型处理告知"，并给企业级"关闭 AI 细化"开关。
- 配额：L0 每日 3 次、L2 认证企业不限次（把 AI 能力做成认证权益，顺带拉认证转化）。

---

## 七、在现有工程中的落点

| 变更 | 位置 |
| --- | --- |
| 类型定义 | 新建 `src/types/ai.ts` |
| 接口 | 新建 `src/api/ai.ts`（`fetchRefine` 走 `api/request.ts`，mock 返回固定诊断+追问+patches） |
| 状态与流程 | 新建 `src/composables/useAiRefine.ts`（持有 `round`、`answers`、`patches`、`snapshots` 撤销栈、`qualityScore`） |
| 组件 | 新建 `AiRefinePanel.vue`（右侧面板容器，复用 `BaseModal` 的 Teleport 模式）、`AiDiagnosisCard.vue`、`AiClarifyList.vue`、`AiDiffView.vue`、`AiPatchItem.vue` |
| 页面改造 | `src/pages/demand/WorkbenchPage.vue` 的发布弹窗升级为**左表单 + 右 AI 面板**双栏（`BaseModal` 已有 `wide` 变体，扩为 `xl`）；提交拦截接在 `handlePublish` 前 |
| 常量 | `src/constants/index.ts` 增 `QUALITY_SUBMIT_THRESHOLD = 60`、`AI_REFINE_DEBOUNCE_MS = 1200`、`MAX_CLARIFY_QUESTIONS = 5`、`REFINE_DAILY_LIMIT` |
| 详情页 | `src/pages/demand/BidManagePage.vue` 需求卡展示质量分与"本需求经 AI 细化"徽标（对从业者是信任信号，会提升投标率） |

**Prompt 骨架（system）**

```
你是外包平台的需求分析助手。输入是企业原始需求草稿，输出严格遵循给定 JSON schema。
规则：
1. 先复述你已理解的信息（解析回显），不得臆造未提及的事实。
2. 按 目标/使用场景/功能范围/优先级/验收标准 五维打分并给一句结论，指出原文缺失处。
3. 最多 5 个澄清问题，必须选项式，每题 2-4 个选项，选项要具体可点选，禁止"请详细描述"。
4. 生成 patches：每条必须含 reason（依据），不得整段替换，不得新增未确认的事实。
5. 预算建议必须给出计算依据，且落在品类指导价区间内。
6. 字符串值内禁止使用未转义英文双引号，引用词用「」。
```

---

## 八、度量与分期

**北极星与护栏指标**：需求平均质量分、AI 建议采纳率（低于 30% 说明建议太水）、细化后 24h 投标数提升、履约纠纷率与"验收标准缺失类"纠纷占比、平均澄清轮次（>2 轮说明问题问得不好）、细化后提交转化（掉了就是流程太重）。

| 期次 | 范围 |
| --- | --- |
| MVP（1 迭代） | 入口①②④ + 五维诊断 + 选项式澄清 + diff 逐条采纳 + 撤销 + 质量分与提交拦截 |
| V2 | 素材转草稿、预算/周期建议、风险提示、需求模板沉淀、配额与认证权益 |
| V3 | 投标后的变更协同（通知重确认）、对话式连续发单、采纳率回流优化 prompt |

**明确的反直觉取舍**：不做"一键生成完整需求"。看似省事，实则把不真实的内容塞进合同附件，纠纷风险转嫁给平台仲裁。宁可多一次确认，也要保证**提交出去的内容是需求方自己认账的**。
