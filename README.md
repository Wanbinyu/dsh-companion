# dsh-companion

[English](README.en.md) | 简体中文

> 非官方社区插件，与 DeepSeek 官方无隶属或背书关系。

一个真正了解任务状态的 DeepSeek Harness Web 桌面宠物。它不是循环播放动画的装饰组件，而是根据当前会话的运行状态切换动作，并在需要用户处理时给出明确提醒。

## 功能

- 通过官方 `shell.overlay` 插槽悬浮在 Harness 界面上，不替换页面组件、不注入 DOM；
- 区分空闲、思考、工具调用、等待确认、完成和失败六种状态；
- 显示当前工具、轮次、任务耗时和脱敏错误码；
- 安装 `dsh-billing` 时自动增加 Token 与参考费用，无需额外配置；
- 拖动后记住位置，支持 80-140 px 缩放；
- 可关闭状态气泡、计费信息或动画，并遵循系统“减少动态效果”设置；
- 中英文界面随 Harness 语言自动切换；
- 完全本地运行，不读取 API Key、提示词或工具结果，不上传遥测。

## 状态映射

| 宠物状态 | Harness 信号 | 表现 |
| --- | --- | --- |
| 空闲 | 当前会话未运行 | 轻微呼吸 |
| 思考 | Turn 正在运行 | 头部和视线移动 |
| 工具 | 存在未完成的 `tool/call` | 手臂工作、胸灯闪烁 |
| 等待 | Approval、Question 或 Plan Review | 黄色提醒、天线闪烁 |
| 完成 | `turn/end: completed` | 短暂庆祝后回到空闲 |
| 失败 | Error、max-tokens 或 interrupted | 红色提示和短暂抖动 |

并行工具调用会按 Call ID 跟踪：一个工具完成时，如果仍有其他工具运行，宠物不会错误地提前回到“思考”。

## 安装

要求 Node.js `>=22.19` 和 DeepSeek Harness `0.1.0-rc.6` 或更高版本。项目使用 `0.1.0-rc.8` 完成开发验证。

发布版：

```bash
dsh plugin --profile web add https://github.com/Wanbinyu/dsh-companion/releases/download/v0.1.0/dsh-companion-0.1.0.tgz
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
dsh plugin --profile web add G:\dsh-packages\dsh-companion-0.1.0.tgz
```

卸载：

```bash
dsh plugin --profile web remove dsh-companion
```

## 使用

- 拖动宠物可调整位置，位置会保存在当前浏览器；
- 单击宠物可临时显示或隐藏状态气泡；
- 点击齿轮可调整大小、动画和信息显示；
- “回到右下角”会清除自定义位置；
- Harness 等待批准、问题回答或计划审阅时，等待状态优先于工具动画。

## 可选计费集成

插件不依赖 `dsh-billing`。如果当前 Web profile 已安装该插件，Companion 会读取公开的只读 `billing` 会话投影，显示累计 Token 和参考费用；没有安装、模型未配置价格或没有用量数据时不显示。

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

宠物位置、大小、气泡、计费显示和动画开关属于浏览器偏好，使用 Harness Store 持久化，不写入会话日志。

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
