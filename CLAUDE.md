# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 开发命令

### 构建和运行
```bash
npm run build    # 编译 TypeScript 到 build/ 目录并设置可执行权限
npm start        # 从 build/index.js 运行编译后的 MCP 服务器
npm run dev      # 使用 tsx 以开发模式运行（如果 tsx 可用）
```

### 项目结构
- `index.ts` - 单文件 MCP 服务器实现
- `package.json` - 依赖项：@modelcontextprotocol/sdk, zod
- `tsconfig.json` - TypeScript 配置，目标为 ES2022
- `build/` - 编译输出目录

## 架构概览

这是一个 **模型上下文协议 (MCP) 服务器**，为 AI 助手提供引导式 Memory Bank 功能以进行项目上下文管理。该服务器设计为 **引导工具** 而非直接文件操作系统。

### 核心设计原则

1. **引导式操作**：服务器向 AI 助手提供详细指令，而不是直接操作文件。这确保 AI 理解上下文并保持对文件操作的控制。

2. **结构化上下文管理**：使用 5 个核心 Markdown 文件组织项目信息：
   - `productContext.md` - 高层项目概览、目标、功能、架构
   - `activeContext.md` - 当前工作状态、最近更改、开放问题
   - `progress.md` - 清单格式的任务管理
   - `decisionLog.md` - 重要的架构和实现决策
   - `systemPatterns.md` - 重复模式、编码约定、标准

3. **跨平台路径处理**：在 `normalizePath()` 函数中实现了 Windows/macOS/Linux 的强大路径规范化，包括 URL 解码和 Windows 盘符处理。

### MCP 工具实现

服务器暴露三个主要工具：

- **`init-memory-bank`**：创建 memory-bank 目录和初始模板文件。如果发现现有的 `projectBrief.md`，会进行集成。
- **`get-memory-bank-info`**：读取所有 Memory Bank 文件并返回格式化内容供 AI 上下文使用（类似 codelf 的方法）。
- **`update-memory-bank`**：基于变更类型生成详细的、可操作的更新指令（architecture/feature/bugfix/refactor/decision/progress）。

### 关键实现细节

- **模板系统**：`getMemoryBankTemplates()` 为所有 Memory Bank 文件生成带时间戳的初始模板
- **详细指导**：`getDetailedFileGuide()` 为每种文件类型提供全面的更新策略和触发器
- **变更类型处理**：基于变更类型的特定工作流指令确保一致的 Memory Bank 维护
- **错误处理**：优雅处理缺失目录和文件访问错误

## 在此项目中工作

### MCP 集成
- 发布包名：`memory-bank-mcp`
- 服务器名称：`memory-bank-mcp`
- 需要适当超时的 MCP 客户端配置（建议 600 秒）

### 代码模式
- `index.ts` 中的单文件架构，功能分离清晰
- 用于参数验证的 Zod 模式
- 全程使用 async/await 模式
- 基于模板的内容生成
- 具有用户友好消息的全面错误处理

### Memory Bank 工作流程
1. 检查现有的 memory-bank 目录
2. 如需要，使用 `init-memory-bank` 初始化
3. 在会话开始时使用 `get-memory-bank-info` 读取上下文
4. 在重大更改后按照 `update-memory-bank` 的指导更新文件
5. 在所有 Memory Bank 文件中维护文件关系和一致性