# 上下文工程管理工具 v2.0

基于上下文工程理念的智能项目管理系统，专为AI编程工具设计的MCP服务器。

## 🎯 核心理念

**上下文工程 = 提示词 + 用户画像 + 记忆 + 检索信息 + RAG信息 + MCP信息**

不再是简单的文件管理，而是构建一个动态系统，以正确格式提供正确的信息和工具，使LLM能够可靠地完成指定任务。

## ✨ 主要特性

### 🚀 v2.0 新功能

- **动态上下文构建**：实时整合多源信息，构建任务相关的智能上下文
- **记忆管理系统**：维护短期记忆（对话历史）和长期记忆（用户偏好）
- **多源信息整合**：无缝集成AI编程工具的搜索功能
- **智能质量评估**：自动评估上下文质量，确保LLM能完成任务
- **外部工具集成**：支持网络搜索、代码索引、文件搜索、库文档查询

### 🔧 传统功能（增强版）

- **项目上下文管理**：5个核心Markdown文件的结构化管理
- **变更类型处理**：基于变更类型的智能更新指导
- **跨平台支持**：完善的路径规范化处理

## 🏗️ 架构设计

```
src/
├── core/                    # 核心引擎
│   ├── context-builder.ts   # 动态上下文构建器
│   ├── memory-manager.ts    # 记忆管理系统
│   ├── multi-source-integrator.ts  # 多源信息整合器
│   └── quality-checker.ts   # 上下文质量检查器
├── services/
│   └── intelligent-formatter.ts    # 智能格式化器
├── types/
│   └── context-types.ts     # 完整类型定义
└── utils/
    └── path-utils.ts        # 工具函数
```

## 🛠️ MCP工具接口

### 新增核心工具

#### `build-dynamic-context`
动态构建任务上下文，整合多源信息
```typescript
{
  rootPath: string,      // 项目根目录
  taskType: TaskType,    // 任务类型
  userInput: string,     // 用户需求
  priority?: Priority,   // 优先级
  sessionId?: string     // 会话ID
}
```

#### `manage-memory`
记忆管理，支持短期/长期记忆操作
```typescript
{
  rootPath: string,
  action: 'get-short-term' | 'get-long-term' | 'update-preferences' | 'cleanup' | 'export',
  sessionId?: string,
  data?: any
}
```

#### `retrieve-external-knowledge`
外部知识检索，整合AI编程工具搜索功能
```typescript
{
  rootPath: string,
  query: string,
  taskType: TaskType,
  sources?: ('web' | 'code' | 'files' | 'libraries')[],
  sessionId?: string
}
```

### 增强版传统工具

#### `get-context-info` (增强版)
现在包含记忆管理和用户偏好信息

#### `update-context-engineering` (兼容版)
保留原有功能，与新系统兼容

#### `init-context-engineering` (兼容版)
初始化上下文工程管理结构

## 🚀 快速开始

### 安装

```bash
npm install context-engineering-tool
```

### 开发

```bash
# 开发模式（新架构）
npm run dev

# 开发模式（旧版本）
npm run dev:old

# 编译
npm run build

# 运行
npm start
```

### MCP配置

在你的MCP客户端中添加：

```json
{
  "mcpServers": {
    "context-engineering-tool": {
      "command": "npx",
      "args": ["context-engineering-tool"],
      "timeout": 600000
    }
  }
}
```

## 📖 使用指南

### 基础工作流程

1. **初始化项目**
   ```
   使用工具: init-context-engineering
   创建基础的上下文工程管理结构
   ```

2. **获取项目上下文**
   ```
   使用工具: get-context-info
   获取完整项目上下文（包含记忆信息）
   ```

3. **智能任务处理**
   ```
   使用工具: build-dynamic-context
   为具体任务构建优化的上下文
   自动整合内外部信息源
   ```

4. **外部知识获取**
   ```
   使用工具: retrieve-external-knowledge
   获取相关技术信息和最佳实践
   ```

5. **记忆管理**
   ```
   使用工具: manage-memory
   管理对话历史和个人偏好
   ```

### 高级特性

#### 外部工具集成

系统设计为与AI编程工具的内置功能无缝集成：

- **网络搜索**：获取最新技术信息和解决方案
- **代码索引搜索**：查找项目中的相关代码
- **文件搜索**：定位相关项目文件
- **库文档查询**：获取第三方库的最新文档

#### 记忆学习系统

- **短期记忆**：维护当前会话的对话历史和操作记录
- **长期记忆**：学习用户的编程偏好、常用模式和成功经验
- **自适应优化**：根据历史数据优化上下文构建策略

#### 质量保证系统

- **完整性检查**：确保上下文包含完成任务所需的全部信息
- **可行性评估**：评估LLM在当前上下文下完成任务的可能性
- **清晰度验证**：确保信息呈现清晰明确
- **优化建议**：提供上下文改进建议

## 🔄 向后兼容性

- 保留所有v1.0工具接口
- 现有工作流程继续有效
- 支持渐进式升级
- 新旧功能可以并存使用

## 🤝 外部工具接口

为了与AI编程工具集成，你需要提供以下接口的实现：

```typescript
interface ExternalToolProvider {
  webSearch?: (query: string) => Promise<WebSearchResult[]>;
  codeIndexSearch?: (query: string, language?: string) => Promise<CodeSearchResult[]>;
  fileSearch?: (pattern: string, rootPath: string) => Promise<FileSearchResult[]>;
  libraryDocSearch?: (libraryName: string, topic?: string) => Promise<LibraryDocResult[]>;
}
```

通过服务器初始化时传入：

```typescript
const server = getServer(yourExternalToolProvider);
```

## 📊 性能特性

- **并行处理**：多源信息收集采用异步并行处理
- **智能缓存**：记忆系统提供持久化缓存
- **优雅降级**：外部工具不可用时自动降级
- **资源优化**：智能限制上下文大小，避免信息过载

## 🔧 配置选项

系统支持多种配置选项：

```typescript
const config: MultiSourceConfig = {
  sources: {
    projectFiles: true,
    conversationHistory: true,
    userProfile: true,
    knowledgeBase: true,
    externalAPIs: true
  },
  weights: {
    recency: 0.3,
    relevance: 0.4,
    userPreference: 0.2,
    projectImportance: 0.1
  },
  limits: {
    maxHistoryItems: 20,
    maxKnowledgeItems: 10,
    maxContextSize: 50000
  }
};
```

## 📈 版本历史

### v2.0.0 (当前版本)
- 🚀 全新架构：基于上下文工程理念重新设计
- ✨ 动态上下文构建：多源信息实时整合
- 🧠 记忆管理系统：短期/长期记忆维护
- 🔍 外部工具集成：支持AI编程工具的搜索功能
- 📊 质量评估系统：自动评估上下文质量
- 🎨 智能格式化：优化LLM信息理解

### v1.0.0
- 📁 基础文件管理：5个核心Markdown文件
- 🔧 变更类型处理：基于变更类型的更新指导
- 🌐 跨平台支持：完善的路径处理

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

---

**🎯 上下文工程的核心目标：构建一个动态系统，以正确格式提供正确的信息和工具，使LLM能够可靠地完成指定任务。**