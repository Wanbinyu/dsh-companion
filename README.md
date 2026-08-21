<h1 align="center">dsh-companion</h1>

<p align="center">
  <strong>会读懂任务状态的 DeepSeek Harness Web 桌面伙伴</strong><br>
  用角色动作、状态气泡和可选计费数据，让长任务的进展更直观。
</p>

<p align="center">
  <a href="README.en.md">English</a> · <strong>简体中文</strong>
</p>

<p align="center">
  <a href="https://github.com/Wanbinyu/dsh-companion/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Wanbinyu/dsh-companion/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/Wanbinyu/dsh-companion/releases/latest"><img alt="Release" src="https://img.shields.io/github/v/release/Wanbinyu/dsh-companion?style=flat-square"></a>
  <img alt="DeepSeek Harness >= 0.1.0-rc.6" src="https://img.shields.io/badge/DeepSeek_Harness-%3E%3D0.1.0--rc.6-4f8cff?style=flat-square">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/code-MIT-2ea44f?style=flat-square"></a>
</p>

> [!IMPORTANT]
> 这是非官方社区插件，与 DeepSeek 官方无隶属或背书关系。

## 运行效果

<p align="center">
  <img src="https://raw.githubusercontent.com/Wanbinyu/dsh-companion/main/docs/images/companion-overview.png" width="320" alt="dsh-companion 空闲状态、角色和计费信息">
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/Wanbinyu/dsh-companion/main/docs/images/companion-dialogue-settings.png" width="250" alt="dsh-companion 台词设置面板">
</p>

<p align="center"><sub>真实运行截图：状态与计费概览 · 毛玻璃台词设置面板</sub></p>

## 核心能力

- **感知真实任务状态**：区分空闲、思考、工具调用、等待确认、完成和失败，不只是循环播放装饰动画。
- **有反馈的角色互动**：支持拖动、缩放、点击回应、五分钟休息动作、十分钟长任务动作和完成气泡；工作、完成、待机台词均可编辑。
- **可选计费联动**：安装 `dsh-billing` 后自动显示本轮/会话费用、Token、额度进度和未定价提醒，无需复制计费逻辑或额外配置。
- **本地运行且保护隐私**：只保留状态、轮次、工具名称、时间和短错误码；不读取提示词、回复、工具参数、文件内容或 API Key，不发送遥测。

## 快速开始

要求 Node.js `>=22.19` 和 DeepSeek Harness `0.1.0-rc.6` 或更高版本。项目使用当前固定的 `0.1.0-rc.8` 软件包完成验证。

安装发布版并启动 Harness Web：

```bash
dsh plugin --profile web add https://github.com/Wanbinyu/dsh-companion/releases/download/v0.1.9/dsh-companion-0.1.9.tgz
dsh web
```

[下载 v0.1.9 安装包](https://github.com/Wanbinyu/dsh-companion/releases/download/v0.1.9/dsh-companion-0.1.9.tgz) · [查看全部版本](https://github.com/Wanbinyu/dsh-companion/releases)

卸载：

```bash
dsh plugin --profile web remove dsh-companion
```

## 使用方式

- 拖动角色可调整位置；聚焦后可用方向键精确移动，按住 Shift 时加速。
- 单击角色会播放短反馈动作并显示气泡；休息状态下单击会立即唤醒。
- 点击齿轮可调整 80-140 px 大小、界面强调色、状态气泡和计费信息。
- 设置面板可在“状态”和“台词”页之间切换；三组台词均可逐行编辑，留空即可恢复中英文默认内容。
- “回到右下角”会清除自定义位置。位置、大小、强调色和台词都只保存在当前浏览器。
- Harness 等待批准、问题回答或计划审阅时，等待状态优先于工具动画。

角色动画默认运行，并遵循系统“减少动态效果”设置。关闭常驻状态气泡后，约 1.8 秒的单击反馈仍会正常显示。

## 状态映射

| 宠物状态 | Harness 信号 | 角色表现 |
| --- | --- | --- |
| 空闲 | 当前会话未运行 | 轻微呼吸，持续 5 分钟后进入休息动作 |
| 思考 | Turn 正在运行 | 眼部聚焦镜与观察动作；10 分钟后进入长任务动作 |
| 工具 | 存在未完成的 `tool/call` | 左手旁显示袖珍终端；10 分钟后出现时钟提示 |
| 等待 | Approval、Question 或 Plan Review | 鲸尾旁显示金色提示环 |
| 完成 | `turn/end: completed` | 领针与鲸尾闪光，并显示带图标的完成气泡 |
| 失败 | Error、max-tokens 或 interrupted | 领口红色警示与短暂抖动 |

并行工具调用会按 Call ID 跟踪。一个工具完成时，如果仍有其他工具运行，角色不会错误地提前回到“思考”。

## 可选计费集成

插件不依赖 `dsh-billing`。如果当前 Web profile 已安装该插件，Companion 会读取公开、只读的 `billing` 会话投影，并显示：

- 本轮费用与会话累计费用；
- 累计 Token 和额度进度；
- 未定价模型数量。

未安装计费插件或还没有用量数据时，相关区域自动隐藏。计价、模型目录、额度计算和用量去重仍全部由 `dsh-billing` 负责；计费数据不会复制到新的存储，也不会发送到外部服务。

## 配置

默认 Host 配置位于 Web profile 的 `cordis.patch.yml`：

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

宠物位置、大小、界面强调色、气泡、计费显示和自定义台词属于浏览器偏好，通过 Harness Store 持久化，不写入会话日志。强调色不会修改角色图片，等待、完成和错误仍保留独立的语义提示色。

## 实现与兼容性

- 通过官方 `shell.overlay` 插槽渲染，不替换 Harness 页面组件，也不在 Slot 外查询或修改 DOM。
- 使用官方 Session Projection、Locale 和 Store API。
- 浏览器包将 `@deepseek-ai/dsh-client-runtime/client` 保持为外部依赖，以兼容其 ModuleLoader 包装格式。
- 中英文界面跟随 Harness 语言自动切换。
- 支持 DeepSeek Harness `0.1.0-rc.6` 及以上版本，持续以 `rc.8` 依赖完成开发验证。

## 隐私边界

Companion 的宿主投影只保存状态、轮次、工具名称、时间和错误码。它不会保存或展示：

- 用户提示词和模型回复；
- 工具参数和工具结果；
- API Key、请求头或完整供应商错误消息；
- 工作区文件内容和路径；
- 任何外部遥测标识。

## 素材来源与许可

蓝鲸少年角色图由用户生成并提供。当前运行时素材基于用户提供图片做确定性透明背景清理与 WebP 压缩，记录在 `assets/suave-whale-boy/`。六种状态复用同一角色图，并通过 CSS 动作以及贴合眼部、左手、领针和鲸尾的无文字提示表达；素材内联进浏览器包，不产生网络请求。

用户已确认允许本项目公开再分发该角色图。该位图素材不自动适用仓库的 MIT 许可证，代码仍遵循仓库许可证。

## 本地开发

```bash
npm install
npm run verify
```

`verify` 会执行 Host/Web 类型检查、状态投影与客户端派生测试、浏览器模块构建和安装包内容检查。

本地安装开发版：

```bash
npm run build
dsh plugin --profile web add .
dsh web
```

`dsh 0.1.0-rc.7` 在 Windows 上处理含空格的本地插件路径时可能拆分错误。遇到此问题时，请先把安装包输出到无空格目录：

```powershell
New-Item -ItemType Directory -Force G:\dsh-packages
npm pack --pack-destination G:\dsh-packages
dsh plugin --profile web add G:\dsh-packages\dsh-companion-0.1.9.tgz
```

项目结构：

```text
src/projection.ts        Host 端只读会话状态投影
src/client/derive.ts     状态、耗时和可选计费派生
src/client/Companion.tsx shell.overlay 悬浮组件
src/client/store.ts      Harness 持久化偏好 Store
cordis.patch.yml         DSH 插件清单
```

## 反馈与许可

问题与建议请提交到 [GitHub Issues](https://github.com/Wanbinyu/dsh-companion/issues)。代码采用 [MIT License](LICENSE)；角色位图许可见上方说明。
