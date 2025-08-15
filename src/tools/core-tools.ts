// 上下文管理MCP工具 - 专注于上下文工程文件管理
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { promises as fs } from 'fs';
import * as path from 'path';
import { normalizePath, formatTimestamp } from '../utils/path-utils.js';
// 硬编码模板内容，从templates目录复制
const getContextEngineeringTemplates = () => ({
  'projectContext.md': `# 项目上下文模板

本文件为AI提供项目的核心背景信息和当前开发状态，适用于各种技术栈和平台。
{GENERATION_DATE} - 更新日志。

## 项目基本信息

### 项目概述
**项目名称**: {PROJECT_NAME}
**项目类型**: {PROJECT_TYPE} (Web前端/Web后端/桌面应用/移动应用/库/工具/服务等)
**核心功能**: {CORE_FUNCTIONALITY}
**目标用户**: {TARGET_USERS}

### 技术栈信息
**主要语言**: {PRIMARY_LANGUAGE}
**辅助语言**: {SECONDARY_LANGUAGES}
**框架/库**: {FRAMEWORKS_AND_LIBRARIES}
**运行环境**: {RUNTIME_ENVIRONMENT}
**构建工具**: {BUILD_TOOLS}
**包管理器**: {PACKAGE_MANAGERS}

### 部署信息
**目标平台**: {TARGET_PLATFORMS}
**部署方式**: {DEPLOYMENT_METHOD}
**环境要求**: {ENVIRONMENT_REQUIREMENTS}

## 项目架构

### 整体架构
**架构模式**: {ARCHITECTURE_PATTERN} (MVC/MVP/MVVM/微服务/分层架构等)
**核心模块**:
- **{MODULE_1}**: {MODULE_1_RESPONSIBILITY}
- **{MODULE_2}**: {MODULE_2_RESPONSIBILITY}
- **{MODULE_3}**: {MODULE_3_RESPONSIBILITY}
- **{MODULE_4}**: {MODULE_4_RESPONSIBILITY}

### 目录结构
\`\`\`
{PROJECT_NAME}/
├── {DIR_1}/              # {DIR_1_PURPOSE}
├── {DIR_2}/              # {DIR_2_PURPOSE}
├── {DIR_3}/              # {DIR_3_PURPOSE}
├── {DIR_4}/              # {DIR_4_PURPOSE}
├── {CONFIG_DIR}/         # {CONFIG_PURPOSE}
├── {DOCS_DIR}/           # {DOCS_PURPOSE}
└── {TESTS_DIR}/          # {TESTS_PURPOSE}
\`\`\`

### 核心依赖
**生产依赖**:
- **{PROD_DEPENDENCY_1}**: {DEPENDENCY_1_PURPOSE}
- **{PROD_DEPENDENCY_2}**: {DEPENDENCY_2_PURPOSE}
- **{PROD_DEPENDENCY_3}**: {DEPENDENCY_3_PURPOSE}

**开发依赖**:
- **{DEV_DEPENDENCY_1}**: {DEV_DEPENDENCY_1_PURPOSE}
- **{DEV_DEPENDENCY_2}**: {DEV_DEPENDENCY_2_PURPOSE}

## 当前开发状态

### 版本信息
**当前版本**: {CURRENT_VERSION}
**开发分支**: {CURRENT_BRANCH}
**下个版本**: {NEXT_VERSION}
**发布计划**: {RELEASE_PLAN}

### 开发重点
**当前迭代目标**: {CURRENT_ITERATION_GOAL}
**主要开发任务**:
1. **{MAIN_TASK_1}**: {TASK_1_DESCRIPTION}
2. **{MAIN_TASK_2}**: {TASK_2_DESCRIPTION}
3. **{MAIN_TASK_3}**: {TASK_3_DESCRIPTION}

### 已知问题
**Critical Issues**:
- **{CRITICAL_ISSUE_1}**: {ISSUE_1_DESCRIPTION}
  - 影响: {ISSUE_1_IMPACT}
  - 状态: {ISSUE_1_STATUS}
  - 计划: {ISSUE_1_PLAN}

**Major Issues**:
- **{MAJOR_ISSUE_1}**: {ISSUE_2_DESCRIPTION}
- **{MAJOR_ISSUE_2}**: {ISSUE_3_DESCRIPTION}

### 技术债务
**高优先级**:
- **{TECH_DEBT_1}**: {DEBT_1_DESCRIPTION}
  - 影响: {DEBT_1_IMPACT}
  - 计划: {DEBT_1_TIMELINE}

**中优先级**:
- **{TECH_DEBT_2}**: {DEBT_2_DESCRIPTION}
- **{TECH_DEBT_3}**: {DEBT_3_DESCRIPTION}

## 项目约束和要求

### 功能要求
**必须支持**:
- {MUST_HAVE_FEATURE_1}
- {MUST_HAVE_FEATURE_2}
- {MUST_HAVE_FEATURE_3}

**应该支持**:
- {SHOULD_HAVE_FEATURE_1}
- {SHOULD_HAVE_FEATURE_2}

**可以支持**:
- {COULD_HAVE_FEATURE_1}
- {COULD_HAVE_FEATURE_2}

### 非功能要求
**性能要求**:
- {PERFORMANCE_REQUIREMENT_1}
- {PERFORMANCE_REQUIREMENT_2}

**兼容性要求**:
- {COMPATIBILITY_REQUIREMENT_1}
- {COMPATIBILITY_REQUIREMENT_2}

**安全要求**:
- {SECURITY_REQUIREMENT_1}
- {SECURITY_REQUIREMENT_2}

**可维护性要求**:
- {MAINTAINABILITY_REQUIREMENT_1}
- {MAINTAINABILITY_REQUIREMENT_2}

## 开发环境和工具

### 开发环境
**IDE/编辑器**: {RECOMMENDED_IDE}
**语言版本**: {LANGUAGE_VERSION}
**运行时版本**: {RUNTIME_VERSION}

### 开发工具链
**代码质量**:
- 格式化工具: {FORMATTER_TOOL}
- 静态分析: {LINTING_TOOL}
- 类型检查: {TYPE_CHECKER} (如适用)

**测试工具**:
- 单元测试: {UNIT_TEST_FRAMEWORK}
- 集成测试: {INTEGRATION_TEST_FRAMEWORK}
- E2E测试: {E2E_TEST_FRAMEWORK}

**构建和部署**:
- 构建脚本: {BUILD_SCRIPTS}
- CI/CD: {CI_CD_PLATFORM}
- 部署工具: {DEPLOYMENT_TOOLS}

## 团队协作

### 开发流程
**分支策略**: {BRANCHING_STRATEGY}
**代码审查**: {CODE_REVIEW_POLICY}
**发布流程**: {RELEASE_PROCESS}

### 沟通渠道
**项目管理**: {PROJECT_MANAGEMENT_TOOL}
**文档**: {DOCUMENTATION_PLATFORM}
**问题跟踪**: {ISSUE_TRACKING_SYSTEM}

## AI编码指导

### 编码原则
1. **{CODING_PRINCIPLE_1}**: {PRINCIPLE_1_DESCRIPTION}
2. **{CODING_PRINCIPLE_2}**: {PRINCIPLE_2_DESCRIPTION}
3. **{CODING_PRINCIPLE_3}**: {PRINCIPLE_3_DESCRIPTION}

### 代码风格要求
**命名约定**: {NAMING_CONVENTION_SUMMARY}
**文件组织**: {FILE_ORGANIZATION_SUMMARY}
**注释要求**: {COMMENT_REQUIREMENTS}

### 质量标准
**代码覆盖率**: {CODE_COVERAGE_TARGET}
**性能基准**: {PERFORMANCE_BENCHMARKS}
**安全检查**: {SECURITY_CHECKS}

### 特别注意事项
**谨慎修改区域**:
- {CAUTION_AREA_1}: {CAUTION_REASON_1}
- {CAUTION_AREA_2}: {CAUTION_REASON_2}

**禁止修改区域**:
- {FORBIDDEN_AREA_1}: {FORBIDDEN_REASON_1}
- {FORBIDDEN_AREA_2}: {FORBIDDEN_REASON_2}

### 推荐实践
**最佳实践**:
- {BEST_PRACTICE_1}
- {BEST_PRACTICE_2}
- {BEST_PRACTICE_3}

**避免事项**:
- {ANTI_PATTERN_1}
- {ANTI_PATTERN_2}

## 相关资源

### 文档链接
- **API文档**: {API_DOCS_LINK}
- **用户文档**: {USER_DOCS_LINK}
- **开发文档**: {DEV_DOCS_LINK}

### 外部资源
- **官方文档**: {OFFICIAL_DOCS_LINKS}
- **社区资源**: {COMMUNITY_RESOURCES}
- **学习资料**: {LEARNING_RESOURCES}
`,
  'codingStandards.md': `# 编码规范模板

本文件为AI提供项目的编码规范、设计模式和最佳实践，适用于各种编程语言和技术栈。
{GENERATION_DATE} - 更新日志。

## 通用编码原则

### 代码质量原则
1. **可读性优先**: {READABILITY_PRINCIPLE}
2. **一致性**: {CONSISTENCY_PRINCIPLE}
3. **简洁性**: {SIMPLICITY_PRINCIPLE}
4. **可维护性**: {MAINTAINABILITY_PRINCIPLE}
5. **性能考虑**: {PERFORMANCE_PRINCIPLE}

### 设计原则
1. **{DESIGN_PRINCIPLE_1}**: {DESIGN_PRINCIPLE_1_DESC}
2. **{DESIGN_PRINCIPLE_2}**: {DESIGN_PRINCIPLE_2_DESC}
3. **{DESIGN_PRINCIPLE_3}**: {DESIGN_PRINCIPLE_3_DESC}
4. **{DESIGN_PRINCIPLE_4}**: {DESIGN_PRINCIPLE_4_DESC}

## 命名规范

### 通用命名原则
- **清晰明确**: 名称应该准确反映用途和含义
- **避免缩写**: 除非是领域内公认的缩写
- **一致性**: 同类型的对象使用一致的命名模式
- **语言习惯**: 遵循目标语言的命名约定

### 项目特定命名规范
#### 文件和目录
- **文件命名**: {FILE_NAMING_CONVENTION}
- **目录命名**: {DIRECTORY_NAMING_CONVENTION}
- **配置文件**: {CONFIG_FILE_NAMING}

#### 代码元素
- **类/组件**: {CLASS_NAMING_CONVENTION}
- **函数/方法**: {FUNCTION_NAMING_CONVENTION}
- **变量**: {VARIABLE_NAMING_CONVENTION}
- **常量**: {CONSTANT_NAMING_CONVENTION}
- **接口/协议**: {INTERFACE_NAMING_CONVENTION}

#### 特殊命名规则
- **私有成员**: {PRIVATE_NAMING_CONVENTION}
- **测试文件**: {TEST_FILE_NAMING}
- **工具函数**: {UTILITY_NAMING_CONVENTION}

## 代码组织

### 文件结构
**标准文件结构**:
1. {FILE_HEADER_SECTION}: {HEADER_CONTENT}
2. {IMPORT_SECTION}: {IMPORT_ORGANIZATION}
3. {CONSTANTS_SECTION}: {CONSTANTS_ORGANIZATION}
4. {MAIN_CODE_SECTION}: {MAIN_CODE_ORGANIZATION}
5. {HELPER_SECTION}: {HELPER_ORGANIZATION}

### 模块/包组织
**组织原则**:
- **功能分组**: {FUNCTIONAL_GROUPING_RULE}
- **依赖管理**: {DEPENDENCY_ORGANIZATION}
- **接口隔离**: {INTERFACE_SEPARATION}

### 代码分层
**架构层次** (从上到下):
1. **{LAYER_1}**: {LAYER_1_RESPONSIBILITY}
2. **{LAYER_2}**: {LAYER_2_RESPONSIBILITY}
3. **{LAYER_3}**: {LAYER_3_RESPONSIBILITY}
4. **{LAYER_4}**: {LAYER_4_RESPONSIBILITY}

## 编码风格

### 格式化规范
**缩进和空格**:
- 缩进方式: {INDENTATION_STYLE}
- 行长度限制: {LINE_LENGTH_LIMIT}
- 空行使用: {BLANK_LINE_RULES}

**括号和标点**:
- 括号风格: {BRACE_STYLE}
- 分号使用: {SEMICOLON_RULES}
- 逗号规则: {COMMA_RULES}

### 注释规范
**注释类型**:
- **文档注释**: {DOCUMENTATION_COMMENT_FORMAT}
- **行内注释**: {INLINE_COMMENT_RULES}
- **块注释**: {BLOCK_COMMENT_USAGE}

**注释内容要求**:
- **函数注释**: 必须包含 {FUNCTION_COMMENT_REQUIREMENTS}
- **类注释**: 必须包含 {CLASS_COMMENT_REQUIREMENTS}
- **复杂逻辑**: {COMPLEX_LOGIC_COMMENT_RULES}

### 语言特定规范
**{PRIMARY_LANGUAGE}特定规范**:
- {LANGUAGE_SPECIFIC_RULE_1}
- {LANGUAGE_SPECIFIC_RULE_2}
- {LANGUAGE_SPECIFIC_RULE_3}

**其他语言规范** (如适用):
- **{SECONDARY_LANGUAGE_1}**: {SECONDARY_RULES_1}
- **{SECONDARY_LANGUAGE_2}**: {SECONDARY_RULES_2}
`,
  'apiReference.md': `# API接口参考模板

本文件为AI提供项目的API接口定义和使用说明，适用于各种技术栈和接口类型。
{GENERATION_DATE} - 更新日志。

## 接口概览

### API类型
**接口类型**: {API_TYPE} (REST API/GraphQL/gRPC/SDK/Library API/等)
**版本管理**: {API_VERSIONING_STRATEGY}
**认证方式**: {AUTHENTICATION_METHOD}
**数据格式**: {DATA_FORMAT}

### 基础信息
**Base URL**: {BASE_URL}
**API版本**: {API_VERSION}
**文档版本**: {DOCUMENTATION_VERSION}
**更新频率**: {UPDATE_FREQUENCY}

## 核心接口

### {MODULE_1}相关接口

#### {INTERFACE_1_1}
**功能描述**: {INTERFACE_1_1_DESCRIPTION}
**接口路径/方法**: {INTERFACE_1_1_ENDPOINT}
**HTTP方法**: {INTERFACE_1_1_METHOD} (GET/POST/PUT/DELETE/等)
**权限要求**: {INTERFACE_1_1_PERMISSIONS}

**请求参数**:
- **{PARAM_1_1}**: {PARAM_1_1_TYPE} - {PARAM_1_1_DESCRIPTION}
  - 必需性: {PARAM_1_1_REQUIRED}
  - 默认值: {PARAM_1_1_DEFAULT}
  - 取值范围: {PARAM_1_1_RANGE}

- **{PARAM_1_2}**: {PARAM_1_2_TYPE} - {PARAM_1_2_DESCRIPTION}
  - 必需性: {PARAM_1_2_REQUIRED}
  - 格式要求: {PARAM_1_2_FORMAT}

**响应数据**:
- **{RESPONSE_FIELD_1_1}**: {RESPONSE_FIELD_1_1_TYPE} - {RESPONSE_FIELD_1_1_DESCRIPTION}
- **{RESPONSE_FIELD_1_2}**: {RESPONSE_FIELD_1_2_TYPE} - {RESPONSE_FIELD_1_2_DESCRIPTION}

**状态码/错误码**:
- **{SUCCESS_CODE_1}**: {SUCCESS_DESCRIPTION_1}
- **{ERROR_CODE_1_1}**: {ERROR_DESCRIPTION_1_1}
- **{ERROR_CODE_1_2}**: {ERROR_DESCRIPTION_1_2}

## 数据模型

### 请求数据模型

#### {REQUEST_MODEL_1}
**用途**: {REQUEST_MODEL_1_PURPOSE}
**字段定义**:
\`\`\`
{
  "{FIELD_1_1}": {FIELD_1_1_TYPE},     // {FIELD_1_1_DESCRIPTION}
  "{FIELD_1_2}": {FIELD_1_2_TYPE},     // {FIELD_1_2_DESCRIPTION}
  "{FIELD_1_3}": {FIELD_1_3_TYPE}      // {FIELD_1_3_DESCRIPTION}
}
\`\`\`

**验证规则**:
- **{FIELD_1_1}**: {FIELD_1_1_VALIDATION}
- **{FIELD_1_2}**: {FIELD_1_2_VALIDATION}

### 响应数据模型

#### {RESPONSE_MODEL_1}
**用途**: {RESPONSE_MODEL_1_PURPOSE}
**字段定义**:
\`\`\`
{
  "{RESPONSE_FIELD_1}": {RESPONSE_TYPE_1},     // {RESPONSE_DESC_1}
  "{RESPONSE_FIELD_2}": {RESPONSE_TYPE_2},     // {RESPONSE_DESC_2}
  "{RESPONSE_FIELD_3}": {RESPONSE_TYPE_3}      // {RESPONSE_DESC_3}
}
\`\`\`

#### 统一响应格式
\`\`\`
{
  "success": boolean,                    // 操作是否成功
  "code": {STATUS_CODE_TYPE},           // 状态码/错误码
  "message": string,                     // 状态消息
  "data": {DATA_TYPE},                  // 具体数据
  "timestamp": {TIMESTAMP_TYPE}         // 响应时间戳
}
\`\`\`

## 错误处理

### 错误响应格式
\`\`\`
{
  "success": false,
  "code": {ERROR_CODE},
  "message": "{ERROR_MESSAGE}",
  "details": {ERROR_DETAILS},           // 详细错误信息(可选)
  "timestamp": "{TIMESTAMP}"
}
\`\`\`

### 错误码定义

#### 通用错误码
- **{COMMON_ERROR_1}**: {COMMON_ERROR_DESC_1}
- **{COMMON_ERROR_2}**: {COMMON_ERROR_DESC_2}
- **{COMMON_ERROR_3}**: {COMMON_ERROR_DESC_3}

#### 业务错误码

##### {MODULE_1}相关错误
- **{MODULE_1_ERROR_1}**: {MODULE_1_ERROR_DESC_1}
- **{MODULE_1_ERROR_2}**: {MODULE_1_ERROR_DESC_2}

## 认证和授权

### 认证方式
**认证类型**: {AUTH_TYPE} (Token/OAuth/API Key/等)
**Token格式**: {TOKEN_FORMAT}
**Token有效期**: {TOKEN_EXPIRY}
**刷新机制**: {TOKEN_REFRESH_MECHANISM}

### 权限等级
- **{PERMISSION_LEVEL_1}**: {PERMISSION_DESC_1}
- **{PERMISSION_LEVEL_2}**: {PERMISSION_DESC_2}
- **{PERMISSION_LEVEL_3}**: {PERMISSION_DESC_3}

### 请求头要求
\`\`\`
{
  "Authorization": "{AUTH_HEADER_FORMAT}",
  "Content-Type": "{CONTENT_TYPE}",
  "Accept": "{ACCEPT_TYPE}",
  "{CUSTOM_HEADER}": "{CUSTOM_HEADER_VALUE}"
}
\`\`\`

## 使用示例

### 基本使用流程

#### 1. 认证获取Token
\`\`\`
{AUTHENTICATION_EXAMPLE}
\`\`\`

#### 2. 调用核心接口
\`\`\`
{CORE_API_EXAMPLE}
\`\`\`

#### 3. 处理响应
\`\`\`
{RESPONSE_HANDLING_EXAMPLE}
\`\`\`

### 常见使用场景

#### 场景1: {SCENARIO_1_NAME}
**业务描述**: {SCENARIO_1_DESCRIPTION}
**调用序列**:
1. {SCENARIO_1_STEP_1}
2. {SCENARIO_1_STEP_2}
3. {SCENARIO_1_STEP_3}

### 错误处理示例
\`\`\`
{ERROR_HANDLING_EXAMPLE}
\`\`\`

## 性能和限制

### 接口限制
**请求频率限制**: {RATE_LIMIT}
**并发连接限制**: {CONCURRENT_LIMIT}
**数据大小限制**: {DATA_SIZE_LIMIT}
**超时设置**: {TIMEOUT_CONFIG}

### 性能优化建议
- **缓存策略**: {CACHING_RECOMMENDATIONS}
- **批量操作**: {BATCH_OPERATION_TIPS}
- **数据压缩**: {COMPRESSION_SUPPORT}
- **CDN使用**: {CDN_RECOMMENDATIONS}
`
});

const getDetailedFileGuide = () => ({
  'projectContext.md': { role: '项目基础信息和架构描述', priority: '高' },
  'codingStandards.md': { role: '编码规范和设计模式', priority: '中' },
  'apiReference.md': { role: 'API接口文档和使用说明', priority: '中' }
});

/**
 * 注册上下文管理MCP工具
 */
export function registerCoreTools(server: McpServer) {
  
  // 工具1: 获取完整项目上下文信息
  server.tool(
    "get-context-info",
    `获取项目的完整上下文信息，包括项目概览、技术决策记录和当前工作状态。
适用场景：了解项目、分析代码、制定计划、回答项目相关问题时调用`,
    {
      rootPath: z.string().describe("项目的根目录绝对路径，例如：/Users/name/my-project 或 C:\\projects\\my-app")
    },
    async ({ rootPath }) => {
      try {
        const contextDir = path.join(rootPath, 'context-docs');
        const files = ['projectContext.md', 'codingStandards.md', 'apiReference.md'];
        
        let contextInfo = `# 项目上下文信息\n\n`;
        
        for (const file of files) {
          const filePath = path.join(contextDir, file);
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            contextInfo += `## ${file}\n\n${content}\n\n---\n\n`;
          } catch {
            contextInfo += `## ${file}\n\n*文件不存在或无法读取*\n\n---\n\n`;
          }
        }

        return {
          content: [{
            type: "text",
            text: contextInfo
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `获取上下文信息失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具2: 更新上下文工程管理文件
  server.tool(
    "update-context-info",
    `完整替换对应文档的内容。用于更新或完善项目信息、技术决策或工作进展。
注意：此工具会完全替换目标文件内容，不是追加模式。适合提供完整的文档内容进行更新。
适用场景：完善项目文档、更新技术规范、重写API文档、整理项目信息`,
    {
      rootPath: z.string().describe("项目的根目录绝对路径，例如：/Users/name/my-project 或 C:\\projects\\my-app"),
      changeType: z.enum(['context', 'memory', 'session']).describe("信息类型 - context：项目基本信息/架构/功能描述；memory：编码规范/设计模式/技术标准；session：API接口/使用说明/接口文档"),
      content: z.string().describe("完整的文档内容，将完全替换目标文件。应该提供完整的Markdown文档，包含所有必要的章节和信息")
    },
    async ({ rootPath, changeType, content }) => {
      try {
        const contextDir = path.join(rootPath, 'context-docs');
        await fs.mkdir(contextDir, { recursive: true });

        // 根据changeType选择目标文件
        const targetFile = getTargetFileByChangeType(changeType);
        const filePath = path.join(contextDir, targetFile);
        const timestamp = formatTimestamp();
        
        // 读取现有内容
        let existingContent = '';
        try {
          existingContent = await fs.readFile(filePath, 'utf-8');
        } catch {
          // 文件不存在，使用模板
          const templates = getContextEngineeringTemplates();
          existingContent = (templates as any)[targetFile] || '';
        }

        // 直接使用用户提供的内容替换文件内容
        const updatedContent = content;

        await fs.writeFile(filePath, updatedContent);

        return {
          content: [{
            type: "text",
            text: `✅ 已更新 ${targetFile}：\n\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `更新上下文文件失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具3: 初始化上下文工程管理结构
  server.tool(
    "init-context-info",
    `为项目创建上下文管理文件结构。仅在项目缺少上下文文档时使用，会创建项目信息、技术记录和工作进展文件。
适用场景：新项目开始时、发现项目没有上下文文档时、需要规范项目信息管理时调用`,
    {
      rootPath: z.string().describe("项目的根目录绝对路径，将在此目录下创建 context-docs 文件夹")
    },
    async ({ rootPath }) => {
      try {
        const contextDir = path.join(rootPath, 'context-docs');
        await fs.mkdir(contextDir, { recursive: true });

        const templates = getContextEngineeringTemplates();
        const guide = getDetailedFileGuide();
        let createdFiles = [];
        let existingFiles = [];

        for (const [filename, content] of Object.entries(templates)) {
          const filePath = path.join(contextDir, filename);
          
          // 检查文件是否存在
          try {
            await fs.access(filePath);
            // 文件已存在，跳过创建
            existingFiles.push(filename);
            continue;
          } catch {
            // 文件不存在，可以创建
          }

          await fs.writeFile(filePath, content as string);
          createdFiles.push(filename);
        }

        let result = `# 上下文工程管理初始化完成\n\n`;
        
        if (createdFiles.length > 0) {
          result += `## ✅ 已创建文件\n${createdFiles.map(f => `- ${f}`).join('\n')}\n\n`;
        }

        if (existingFiles.length > 0) {
          result += `## ℹ️ 已存在文件（未覆盖）\n${existingFiles.map(f => `- ${f}`).join('\n')}\n\n`;
        }

        result += `## 📋 文件说明\n`;
        for (const [filename, info] of Object.entries(guide)) {
          const fileInfo = info as { role: string; priority: string };
          result += `### ${filename}\n**作用**: ${fileInfo.role}\n**优先级**: ${fileInfo.priority}\n\n`;
        }

        return {
          content: [{
            type: "text",
            text: result
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `初始化上下文工程失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );
}

// 辅助函数：智能section定位和内容插入
function getTargetSectionForChange(changeType: string, targetFile: string): { section: string; insertStyle: 'append' | 'prepend' } {
  const sectionMap: Record<string, Record<string, { section: string; insertStyle: 'append' | 'prepend' }>> = {
    'PROJECT_CONTEXT.md': {
      'context': { section: '## 项目概览', insertStyle: 'append' },
      'default': { section: '## 项目概览', insertStyle: 'append' }
    },
    'DEVELOPMENT_MEMORY.md': {
      'memory': { section: '## 技术决策记录', insertStyle: 'append' },
      'decision': { section: '## 技术决策记录', insertStyle: 'append' },
      'default': { section: '## 技术决策记录', insertStyle: 'append' }
    },
    'WORK_SESSION.md': {
      'session': { section: '## 当前任务', insertStyle: 'prepend' },
      'progress': { section: '## 进展状态', insertStyle: 'append' },
      'default': { section: '## 当前任务', insertStyle: 'prepend' }
    }
  };

  const fileMap = sectionMap[targetFile];
  if (!fileMap) return { section: '', insertStyle: 'append' };
  
  return fileMap[changeType] || fileMap['default'];
}

function formatContentForSection(content: string, changeType: string, targetFile: string): string {
  const timestamp = formatTimestamp();
  
  // 根据文件类型格式化内容
  switch (targetFile) {
    case 'DEVELOPMENT_MEMORY.md':
      // 开发记忆文件需要结构化格式
      return `### ${timestamp} - ${changeType}

**内容**：
${content}

**记录时间**：${timestamp}
`;

    case 'WORK_SESSION.md':
      // 工作会话文件使用任务列表格式
      if (changeType === 'progress') {
        const lines = content.split('\n').filter(line => line.trim());
        const taskItems = lines.map(line => line.startsWith('- ') ? line : `- ${line}`).join('\n');
        return `${taskItems}

*更新时间：${timestamp}*
`;
      }
      return `### ${timestamp} - ${changeType}

${content}
`;

    default:
      // 其他文件使用通用格式
      return `### ${timestamp} - ${changeType}

${content}
`;
  }
}

function insertContentIntoSection(existingContent: string, targetSection: string, newContent: string, insertStyle: 'append' | 'prepend'): string {
  const lines = existingContent.split('\n');
  let sectionIndex = -1;
  let nextSectionIndex = lines.length;
  
  // 找到目标section
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === targetSection.trim()) {
      sectionIndex = i;
      break;
    }
  }
  
  // 如果没找到section，追加到末尾
  if (sectionIndex === -1) {
    return existingContent + '\n\n' + targetSection + '\n\n' + newContent;
  }
  
  // 找到下一个section的开始位置
  for (let i = sectionIndex + 1; i < lines.length; i++) {
    if (lines[i].match(/^#{1,6}\s/)) {
      nextSectionIndex = i;
      break;
    }
  }
  
  // 在section内插入内容
  const beforeSection = lines.slice(0, sectionIndex + 1);
  const sectionContent = lines.slice(sectionIndex + 1, nextSectionIndex);
  const afterSection = lines.slice(nextSectionIndex);
  
  // 移除section末尾的空行
  while (sectionContent.length > 0 && sectionContent[sectionContent.length - 1].trim() === '') {
    sectionContent.pop();
  }
  
  let updatedSection: string[];
  if (insertStyle === 'prepend') {
    updatedSection = ['', newContent, ''].concat(sectionContent);
  } else {
    updatedSection = sectionContent.concat(['', newContent]);
  }
  
  return beforeSection.concat(updatedSection).concat([''], afterSection).join('\n');
}

// 根据changeType选择目标文件
function getTargetFileByChangeType(changeType: string): string {
  switch (changeType) {
    case 'context':
      return 'projectContext.md';
    case 'memory':
      return 'codingStandards.md';
    case 'session':
      return 'apiReference.md';
    default:
      return 'projectContext.md';
  }
}

