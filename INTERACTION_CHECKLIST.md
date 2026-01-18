## 交互功能清单（用于后端接入后的逐项验收）

- [ ] 左侧导航栏可切换：`Odds / Accounts / Bet History / Settings`
- [ ] 当前页面切换状态被保留（刷新后仍停留在上次页面）
- [ ] 右侧比赛列表可点击选中比赛，选中状态高亮
- [ ] 选中比赛后，主区赔率表刷新为对应比赛
- [ ] 赔率表中点击任意赔率格，会弹出下注弹窗
- [ ] 通知面板卡片可点击并跳转到对应比赛（同时切回 Odds 页）
- [ ] 通知面板支持筛选：All / Opportunities / Alerts / Warnings

### Odds 页面（比赛面板）
- [ ] 体育大类切换：Football / Basketball
- [ ] 联盟筛选切换：NFL / NCAAF / NBA / NCAAB / All
- [ ] Live / Prematch 状态筛选
- [ ] 列表滚动位置可恢复（刷新后保持）

### 赔率对比表（OddsComparisonGrid）
- [ ] 表头固定（滚动时保持）
- [ ] Best Odds / Close Odds 列存在并展示
- [ ] 8 家平台并列展示，logo 加载失败时使用文本回退
- [ ] Moneyline / Spread / Total 三类主线展示
- [ ] 赔率格可点击并打开 Betting Dialog

### Betting Dialog（下注弹窗）
- [ ] 默认只勾选“可下注（ready）”账户
- [ ] 支持单账号勾选/取消
- [ ] 支持按标签一键选中同标签账号
- [ ] 余额/限额展示，超过限额自动限制
- [ ] 单账号输入下注金额
- [ ] 总金额实时汇总
- [ ] “分配金额”工具：输入总额 → 自动分配
- [ ] 快捷金额按钮（来自 Settings 配置）
- [ ] 发送下注后进入状态视图（Sent → Acked → Succeeded/Failed）
- [ ] 成功/失败状态正确显示
- [ ] 失败时显示错误信息与模拟截图
- [ ] 成功后展示 Total Succeeded / Total Sent
- [ ] 账户状态更新：Busy → Cooldown → Ready
- [ ] Cooldown 倒计时实时更新
- [ ] 右键 Busy 账户可 Abort，取消并回到 Ready
- [ ] 账户排序规则：ready → cooldown → busy → offline，再按可下注额度、名字

### Accounts 页面（账户管理）
- [ ] 左侧平台切换（8 个平台）
- [ ] 标签筛选（多选）
- [ ] 限额筛选（All / Unlimited / Limited）
- [ ] 名字搜索
- [ ] Hover 显示备份现金与备注
- [ ] 右键卡片打开编辑弹窗
- [ ] 可编辑：余额、限额、On Hold、标签、备注
- [ ] 标签支持新增（并带颜色）
- [ ] 标签删除按钮：移除该标签在当前平台的所有账户
- [ ] Busy / Cooldown 状态图标与倒计时展示
- [ ] Offline（灰化）、On Hold（🚫）等状态显示正确

### Bet History（批量交易视图）
- [ ] 左侧按日期分组展示 batch trades
- [ ] 批量条目显示：比赛、盘口、平台、时间、总额/成功额
- [ ] 过滤：All / Pending / Won / Lost
- [ ] 搜索：按比赛/类型/平台
- [ ] 右侧详情显示所有账户的状态卡片
- [ ] 详情中显示成功/失败、耗时、失败截图/成功 payout
- [ ] “Performance 统计”下拉选择 1/7/14/30/90 天并更新

### Bet History Bar（右侧小栏）
- [ ] 可折叠/展开
- [ ] 展示 Today’s Bets（按 Noon-to-Noon）
- [ ] 展示 Pending / Won / Lost 数量
- [ ] 每条 batch trade 可展示账户成功/失败/待处理数量

### Account Overview Bar（底部汇总条）
- [ ] 可折叠/展开
- [ ] 总余额、Online/Offline 账户数、Limit↓(24h) 统计正确
- [ ] 每个平台卡片展示 Online / Offline 数量与余额

### Settings 页面
- [ ] 可设置 Cooldown 秒数（写入 localStorage）
- [ ] 可设置快捷分配金额（写入 localStorage）
- [ ] 可切换 Light/Dark 主题
- [ ] NCAA Football Alerts 配置项可展开/勾选（当前为 Demo）

### 全局状态持久化（localStorage）
- [ ] 当前页面、筛选条件、选中比赛
- [ ] 通知筛选、赔率与列表滚动位置
- [ ] Bet History 数据与版本号
- [ ] 标签颜色
- [ ] Cooldown 秒数、快捷金额
