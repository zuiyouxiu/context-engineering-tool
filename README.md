# Context Engineering Tool

上下文工程管理MCP服务器 - 专注于context-docs文件管理，提供项目上下文的读取、更新和初始化功能。

## 功能特性

🔧 **核心工具**
- 📖 **get-context-info** - 读取项目上下文信息
- ✏️ **update-context-engineering** - 更新上下文文件  
- 🆕 **init-context-engineering** - 初始化结构

## 快速安装

### 方式1: 从NPM安装 (推荐)

```bash
# 安装
npm install -g context-engineering-tool

# 配置到Claude Code
claude mcp add context-engineering-tool context-engineering-tool
```

### 方式2: 从源码安装

```bash
# 克隆仓库
git clone https://github.com/zuiyouxiu/context-engineering-tool.git
cd context-engineering-tool

# 安装依赖并构建
npm install
npm run build

# 配置到Claude Code
claude mcp add context-engineering-tool node build/index.js
```

### 方式3: 一键安装脚本

```bash
curl -fsSL https://raw.githubusercontent.com/zuiyouxiu/context-engineering-tool/main/install.sh | bash
```

## 使用方法

安装后在Claude Code中直接使用：

### 1. 初始化项目上下文
```
请帮我初始化项目的上下文工程结构
```

### 2. 读取项目上下文
```
读取当前项目的上下文信息
```

### 3. 更新上下文信息
```
更新项目上下文：添加了新的用户认证模块
```

## 文件结构

工具会在项目根目录创建 `context-doc/` 目录，包含：

- **PROJECT_CONTEXT.md** - 项目基础信息和架构描述
- **DEVELOPMENT_MEMORY.md** - 技术决策和变更记录
- **WORK_SESSION.md** - 当前工作状态和任务

## 系统要求

- Node.js >= 16.0.0
- Claude Code CLI

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 运行
npm start
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！