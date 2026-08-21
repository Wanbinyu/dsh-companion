# dsh-companion

[English](README.en.md) | 简体中文

> 非官方社区插件，与 DeepSeek 官方无隶属或背书关系。

一个真正了解任务状态的 DeepSeek Harness Web 桌面宠物。它不是循环播放动画的装饰组件，而是根据当前会话的运行状态切换动作，并在需要用户处理时给出明确提醒。

## 功能

- 通过官方 `shell.overlay` 插槽悬浮在 Harness 界面上，不替换页面组件、不注入 DOM；
- 区分空闲、思考、工具调用、等待确认、完成和失败六种状态；
- 显示当前工具、轮次、任务耗时和脱敏错误码；
- 安装 `dsh-billing` 时自动显示本轮/会话费用、Token、额度进度与未定价提醒，无需额外配置；
- 拖动后记住位置，支持 80-140 px 缩放；
- 使用用户提供的黑西装蓝鲸少年作为唯一角色，界面不再包含角色或外观切换；
- 六种状态通过角色动作以及贴合眼部、左手、领针和鲸尾的无文字提示表达；
- 高对比毛玻璃设置面板支持自定义界面强调色，并在当前浏览器中持久保存；
- 空闲 5 分钟后进入带 `Z` 提示的休息动作，单击角色会唤醒并显示短反馈气泡；
- 连续工作达到 10 分钟后切换专注动作和时钟提示，不读取任务内容；
- 完成气泡使用更醒目的成功样式和图标，并继续显示耗时与可选计费信息；
- 借鉴 `pet-tty` 的心情语机制，为工作、完成和待机提供独立台词句库；工作/完成台词按事件稳定选择，待机台词每 10 秒轮换；
- 设置面板的“台词”页可逐行编辑三组短句，留空恢复中英文默认台词，内容仅保存在当前浏览器；
- 可关闭状态气泡或计费信息；角色动画自动运行，并遵循系统“减少动态效果”设置；
- 中英文界面随 Harness 语言自动切换；
- 完全本地运行，不读取 API Key、提示词或工具结果，不上传遥测。

## 状态映射

| 宠物状态 | Harness 信号 | 表现 |
| --- | --- | --- |
| 空闲 | 当前会话未运行 | 轻微呼吸，持续 5 分钟后休息 |
| 思考 | Turn 正在运行 | 眼部聚焦镜与轻微观察动作；10 分钟后进入长任务动作 |
| 工具 | 存在未完成的 `tool/call` | 左手旁的袖珍终端；10 分钟后显示时钟提示 |
| 等待 | Approval、Question 或 Plan Review | 鲸尾旁的金色提示环 |
| 完成 | `turn/end: completed` | 领针与鲸尾闪光，以及带图标的完成气泡 |
| 失败 | Error、max-tokens 或 interrupted | 领口红色警示与短暂抖动 |

并行工具调用会按 Call ID 跟踪：一个工具完成时，如果仍有其他工具运行，宠物不会错误地提前回到“思考”。

## 安装

要求 Node.js `>=22.19` 和 DeepSeek Harness `0.1.0-rc.6` 或更高版本。项目使用 `0.1.0-rc.8` 完成开发验证。

发布版：

```bash
dsh plugin --profile web add https://github.com/Wanbinyu/dsh-companion/releases/download/v0.1.9/dsh-companion-0.1.9.tgz
dsh web
```

本地开发版，在本仓库目录运行：

```bash
npm install
npm run build
dsh plugin --profile web add .
dsh web
```

`dsh 0.1.0-rc.7` 在 Windows 上处理含空格的本地插件路径时可能拆分错误。如果仓库路径含空格，请先把安装包输出到无空格目录：

```powershell
New-Item -ItemType Directory -Force G:\dsh-packages
npm pack --pack-destination G:\dsh-packages
dsh plugin --profile web add G:\dsh-packages\dsh-companion-0.1.9.tgz
```

卸载：

```bash
dsh plugin --profile web remove dsh-companion
```

## 使用

- 拖动宠物可调整位置，位置会保存在当前浏览器；
- 聚焦宠物后可用方向键精确移动，按住 Shift 时加速；
- 单击宠物会播放短反馈动作和气泡；休息状态下单击会立即唤醒；
- 点击齿轮可调整大小、界面强调色和信息显示；
- 设置面板可在“状态”和“台词”页之间切换；自定义台词每行一句，最多 12 句、每句 80 个字符；
- “回到右下角”会清除自定义位置；
- Harness 等待批准、问题回答或计划审阅时，等待状态优先于工具动画。
- 状态气泡关闭后仍会显示单击反馈；反馈约 1.8 秒后自动消失，不会修改持久设置。

## 可选计费集成

插件不依赖 `dsh-billing`。如果当前 Web profile 已安装该插件，Companion 会读取公开的只读 `billing` 会话投影，显示本轮费用、会话累计费用、累计 Token、额度进度和未定价模型数量；没有安装或没有用量数据时不显示。计价、模型目录、额度计算和去重仍全部由计费插件负责，Companion 不复制计费逻辑。

计费数据不会被复制到新的存储，也不会发送到外部服务。

## 配置

默认配置位于 Web profile 的 `cordis.patch.yml`：

```yaml
- insert:
    - id: companion
      name: dsh-companion
      config:
        successHoldMs: 5000
        errorHoldMs: 10000
```

| 选项 | 默认值 | 范围 | 说明 |
| --- | ---: | ---: | --- |
| `successHoldMs` | `5000` | 0-60000 | 完成动画保留时间（毫秒） |
| `errorHoldMs` | `10000` | 0-120000 | 失败提醒保留时间（毫秒） |

宠物位置、大小、界面强调色、气泡、计费显示和自定义台词属于浏览器偏好，使用 Harness Store 持久化，不写入会话日志。角色动画自动运行且没有单独开关，并遵循系统“减少动态效果”设置；强调色不会修改角色图片，等待、完成和错误仍保留清晰的语义提示色。

## 素材来源与许可

蓝鲸少年角色图由用户生成并提供。当前运行时素材基于用户提供图片做确定性透明背景清理与 WebP 压缩，记录在 `assets/suave-whale-boy/`。六种状态复用同一角色图，并通过 CSS 动作以及贴合角色眼部、左手、领针和鲸尾的无文字提示表达。运行时素材会内联进浏览器包，不产生网络请求。

用户已确认允许本项目公开再分发该角色图。该位图素材不自动适用仓库的 MIT 许可证，代码仍遵循仓库许可证。

## 隐私边界

Companion 的宿主投影只保存状态、轮次、工具名称、时间和错误码。它不会保存或展示：

- 用户提示词和模型回复；
- 工具参数和工具结果；
- API Key、请求头或完整供应商错误消息；
- 工作区文件内容和路径；
- 任何外部遥测标识。

## 开发

```bash
npm install
npm run verify
```

`verify` 会执行 Host/Web 类型检查、状态投影与客户端派生测试、浏览器模块构建和安装包内容检查。

项目结构：

```text
src/projection.ts        Host 端只读会话状态投影
src/client/derive.ts     状态、耗时和可选计费派生
src/client/Companion.tsx shell.overlay 悬浮组件
src/client/store.ts      Harness 持久化偏好 Store
cordis.patch.yml         DSH 插件清单
```

## 反馈

问题与建议请提交到 [GitHub Issues](https://github.com/Wanbinyu/dsh-companion/issues)。

## 许可证

[MIT](LICENSE)
