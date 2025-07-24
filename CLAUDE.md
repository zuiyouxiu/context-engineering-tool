# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 开发命令

### 构建和运行
```bash
npm run build    # 编译 TypeScript 到 build/ 目录并设置可执行权限
npm start        # 从 build/index.js 运行编译后的 MCP 服务器
npm run dev      # 使用 tsx 以开发模式运行新架构 (src/index.ts)
npm run dev:old  # 使用旧版本 (index.ts)
npm run clean    # 清理构建目录
```

### 项目结构 v2.0
```
src/
├── core/                    # 核心模块
│   ├── context-builder.ts   # 动态上下文构建器
│   ├── memory-manager.ts    # 记忆管理系统
│   ├── multi-source-integrator.ts  # 多源信息整合器
│   └── quality-checker.ts   # 上下文质量检查器
├── services/
│   └── intelligent-formatter.ts    # 智能格式化器
├── types/
│   └── context-types.ts     # 类型定义
├── utils/
│   └── path-utils.ts        # 工具函数
└── index.ts                 # 主服务器文件

# 旧版本
index.ts                     # 旧版单文件实现（保留）
package.json                 # 依赖项和脚本
tsconfig.json               # TypeScript 配置
build/                      # 编译输出目录
```

## 架构概览 v2.0

这是一个基于 **上下文工程理念** 的 **模型上下文协议 (MCP) 服务器**，实现了完整的上下文工程管理系统。

### 上下文工程核心理念

**上下文工程 = 提示词 + 用户画像 + 记忆 + 检索信息 + RAG信息 + MCP信息**

### 核心设计原则

1. **动态上下文构建**：不再是静态文件管理，而是动态收集、整合和优化上下文信息。

2. **多源信息整合**：从多个来源收集信息：
   - 内部源：项目文件、记忆、用户偏好
   - 外部源：网络搜索、代码索引、文件搜索、第三方库文档

3. **质量驱动**：反复确认"以当前提供的上下文，LLM真的能合理地完成任务吗？"

4. **记忆管理**：维护短期记忆（对话历史）和长期记忆（用户偏好、学习进度）

5. **智能格式化**：优化信息呈现方式，减少LLM认知负担

### MCP 工具实现 v2.0

服务器暴露以下工具：

#### 新增核心工具

- **`build-dynamic-context`**：动态构建任务上下文，整合多源信息，自动质量评估
- **`manage-memory`**：记忆管理，支持短期/长期记忆的获取、更新和清理
- **`retrieve-external-knowledge`**：外部知识检索，整合AI编程工具的搜索功能

#### 增强版传统工具

- **`get-context-info`**：增强版，现在包含记忆管理和用户偏好信息
- **`update-context-engineering`**：保留原有功能，与新系统兼容
- **`init-context-engineering`**：保留原有功能，与新系统兼容

### 外部工具集成

系统设计为与AI编程工具的内置功能无缝集成：

1. **网络搜索功能**：通过 `ExternalToolAdapter.webSearch()` 集成
2. **代码索引搜索功能**：通过 `ExternalToolAdapter.codeIndexSearch()` 集成
3. **文件搜索功能**：通过 `ExternalToolAdapter.fileSearch()` 集成
4. **第三方库文档查询**：通过 `ExternalToolAdapter.libraryDocSearch()` 集成

### 关键实现细节

- **模块化架构**：每个功能独立模块，易于测试和维护
- **TypeScript 严格模式**：完整的类型定义和检查
- **异步并行处理**：多源信息收集采用并行处理，提高性能
- **智能缓存**：记忆系统提供持久化缓存
- **优雅降级**：外部工具不可用时自动降级到内部功能

## 在此项目中工作

### MCP 集成
- 发布包名：`context-engineering-tool`
- 服务器名称：`context-engineering-tool`
- 版本：v2.0.0
- 需要适当超时的 MCP 客户端配置（建议 600 秒）

### 代码模式
- 模块化架构，每个模块职责单一
- 用于参数验证的 Zod 模式
- 全程使用 async/await 模式
- 智能格式化和错误处理
- TypeScript 严格类型检查

### 新版上下文工程管理工作流程

1. **初始化阶段**：
   - 使用 `init-context-engineering` 创建基础结构
   - 系统自动创建记忆管理目录

2. **会话开始**：
   - 使用 `get-context-info` 获取完整项目上下文（包含记忆信息）
   - 系统自动加载用户偏好和历史记录

3. **任务执行**：
   - 使用 `build-dynamic-context` 为具体任务构建优化上下文
   - 系统自动整合内外部信息源
   - 自动质量评估和优化建议

4. **知识获取**：
   - 使用 `retrieve-external-knowledge` 获取相关技术信息
   - 系统自动格式化外部搜索结果

5. **记忆管理**：
   - 使用 `manage-memory` 管理对话历史和用户偏好
   - 系统自动学习用户模式

6. **文档更新**：
   - 使用传统的 `update-context-engineering` 更新核心文档
   - 系统自动记录操作历史

### 向后兼容性

- 保留所有原有工具接口
- 旧版工作流程依然有效
- 渐进式升级路径
- 新旧功能可以并存使用

### 开发建议

- 优先使用新版工具获得更好的上下文工程体验
- 利用记忆系统提高工作效率
- 充分利用外部工具集成获取更全面的信息
- 定期使用记忆管理功能优化个性化体验