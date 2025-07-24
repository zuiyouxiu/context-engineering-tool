# 上下文工程管理工具 (Context Engineering Tool)

> 一个引导式的 AI 辅助开发上下文工程管理插件

[![EN](https://img.shields.io/badge/Language-English-blue.svg)](./README.md)

上下文工程管理工具是一个基于模型上下文协议（MCP）的插件，通过结构化的 Markdown 文件帮助 AI 助手维护持久的项目上下文。它通过提供引导指令而非直接操作的方式，提供了一种系统化的方法来跟踪项目目标、决策、进度和模式。

## 功能特性

- **引导式操作**：为 AI 助手提供操作指导，让其自行执行操作
- **结构化上下文管理**：通过 5 个核心文件组织项目信息
- **智能引导**：提供初始化和更新的分步指导
- **灵活更新**：基于不同变更类型的智能更新指导
- **跨平台支持**：自动处理 Windows/macOS/Linux 的路径规范化

### MCP 配置

使用已发布的 npm 包：

```json
{
  "mcpServers": {
    "context-engineering": {
      "command": "npx",
      "args": ["context-engineering-tool"],
      "timeout": 600
    }
  }
}
```

## 快速开始

1. **初始化上下文工程管理**

   ```
   使用 init-context-engineering 创建 context-engineering 目录和核心文件
   ```

2. **读取上下文工程管理**

   ```
   使用 get-context-info 查看所有上下文工程管理内容
   ```

3. **更新上下文工程管理**
   ```
   使用 update-context-engineering 获取更新特定文件的指导
   ```

## 核心文件

### 1. productContext.md（产品上下文）

- 项目高层次概览
- 目标和关键功能
- 整体架构
- 自动整合 projectBrief.md（如果存在）

### 2. activeContext.md（活动上下文）

- 当前工作状态
- 最近的更改
- 开放的问题和议题
- 焦点领域

### 3. progress.md（进度）

- 任务清单格式的任务跟踪
- 已完成、当前和计划的任务
- 进度时间线

### 4. decisionLog.md（决策日志）

- 架构和实现决策
- 理由和影响
- 决策历史

### 5. systemPatterns.md（系统模式）

- 重复出现的模式和标准
- 编码约定
- 架构模式
- 测试策略

## 使用指南

### 对于 AI 助手

1. **每次会话开始**：检查 context-engineering 目录是否存在，然后使用 `get-context-info` 了解项目状态
2. **按需初始化**：对新项目使用 `init-context-engineering`
3. **读取上下文**：使用 `get-context-info` 了解项目状态
4. **更新指导**：使用 `update-context-engineering` 获取更新指导
5. **遵循指导**：执行提供的指导来维护上下文工程管理

### 更新触发条件

- **架构变更**：重大结构性决策
- **功能完成**：新功能或新能力
- **错误修复**：重要问题解决
- **重构**：代码结构改进
- **决策**：任何重要的技术选择
- **进度更新**：任务状态变更

## 工具参考

### init-context-engineering

初始化上下文工程管理，创建所有核心文件。

**参数：**

- `rootPath`：项目根目录路径
- `force`（可选）：强制重新初始化

**返回：** 创建的文件列表和下一步指导

### get-context-info

读取并返回所有上下文工程管理内容（类似于 codelf 的 get-project-info）。

**参数：**

- `rootPath`：项目根目录路径

**返回：** 为 AI 上下文格式化的上下文工程管理内容

### update-context-engineering

提供更新上下文工程管理文件的指导。

**参数：**

- `rootPath`：项目根目录路径
- `changeType`：变更类型（architecture/feature/bugfix/refactor/decision/progress）
- `description`：变更的简要描述

**返回：** 包含模板和时间戳的详细更新指导

## 集成提示

### Cursor 设置

添加到 设置 → 规则 → 用户规则：

```
在开始任何任务之前，检查项目中是否存在 context-engineering 目录,如果没有则运行mcp命令init-context-engineering。
在会话开始时使用mcp命令 get-context-info 读取上下文工程管理内容。
完成任务或对话后，你必须使用mcp命令 update-context-engineering 更新上下文工程管理内容。
遵循mcp指导来维护上下文工程管理文件。
```

### Windsurf 设置

添加到 设置 → Cascade → 记忆和规则 → 全局规则：

```
在开始任何任务之前，检查项目中是否存在 context-engineering 目录,如果没有则运行mcp命令init-context-engineering。
在会话开始时使用mcp命令 get-context-info 读取上下文工程管理内容。
完成任务或对话后，你必须使用mcp命令 update-context-engineering 更新上下文工程管理内容。
遵循mcp指导来维护上下文工程管理文件。
```

## 贡献

欢迎贡献！请随时提交问题或拉取请求。

## 许可证

MIT

## 致谢

受 SPARC 方法论和 codelf 启发。
