// 精简的核心MCP工具 - 只保留最必要的3个工具
// 基于上下文工程理念，充分利用AI编程工具内置能力

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { promises as fs } from 'fs';
import * as path from 'path';
import { 
  ProjectContextAnalyzer, 
  PreferenceLearner, 
  ExpertPromptGenerator, 
  MCPToolRecommender 
} from './context-analysis-tools.js';
import { MemoryManager, ContextualPromptBuilder } from './memory-management.js';

/**
 * 注册3个精简的核心上下文工程MCP工具
 */
export function registerCoreContextEngineeringTools(server: McpServer) {
  
  // 工具1: 项目上下文加载器 - 当AI需要了解项目背景时调用
  server.tool(
    "project-context-loader",
    `🎯 调用时机：当用户询问项目相关问题时，AI应立即调用此工具
适用场景：
- 用户问项目架构、技术栈、功能
- 需要生成项目相关代码时
- 讨论项目优化、重构方案时
- 需要推荐技术方案时

功能：快速加载项目技术背景，为AI提供准确的项目上下文`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      query: z.string().optional().describe("用户的问题或搜索需求，用于生成搜索指导"),
      analysisType: z.enum(['tech-stack', 'architecture', 'search-guidance', 'all']).default('all').describe("分析类型")
    },
    async ({ rootPath, query, analysisType }) => {
      try {
        const analyzer = new ProjectContextAnalyzer(rootPath);
        const results: any = {};

        if (analysisType === 'tech-stack' || analysisType === 'all') {
          results.techStack = await analyzer.analyzeTechStack();
        }

        if (analysisType === 'architecture' || analysisType === 'all') {
          results.architecture = await analyzer.analyzeProjectStructure();
        }

        if ((analysisType === 'search-guidance' || analysisType === 'all') && query) {
          results.searchGuidance = await analyzer.generateSearchGuidance(query, results.techStack);
        }

        const formatted = `# 📊 项目上下文分析结果

## 🔧 技术栈分析
${results.techStack ? `
**编程语言**: ${results.techStack.languages.join(', ') || '未检测到'}
**框架**: ${results.techStack.frameworks.join(', ') || '无'}
**工具**: ${results.techStack.tools.join(', ') || '无'}
**架构类型**: ${results.techStack.architecture || '未知'}
**依赖数量**: ${Object.keys(results.techStack.dependencies || {}).length}个
` : '(跳过技术栈分析)'}

## 🏗️ 架构模式分析
${results.architecture ? `
**模式**: ${results.architecture.pattern}
**置信度**: ${(results.architecture.confidence * 100).toFixed(1)}%
**特征**: ${results.architecture.features.join(', ')}
` : '(跳过架构分析)'}

## 🔍 智能搜索指导
${results.searchGuidance ? `
### 推荐使用的内置工具
${results.searchGuidance.suggestedTools.map((tool: string) => `- **${tool}**`).join('\n')}

### 搜索关键词建议
${results.searchGuidance.searchKeywords.join(', ')}

### 上下文提示
${results.searchGuidance.contextualHints.map((hint: string) => `- ${hint}`).join('\n')}

### 智能搜索提示词
\`\`\`
${results.searchGuidance.searchPrompt}
\`\`\`
` : '(跳过搜索指导)'}

## 💡 分析建议
- 基于检测到的技术栈，推荐使用对应的开发模式
- 项目架构${results.architecture?.confidence > 0.7 ? '清晰' : '需要进一步整理'}
- ${results.searchGuidance ? '已生成智能搜索指导，请使用建议的内置工具进行深入搜索' : '建议提供具体问题以获得搜索指导'}
`;

        return {
          content: [{
            type: "text",
            text: formatted
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `项目上下文分析失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具2: 智能提示词增强器 - 当面对复杂任务时调用
  server.tool(
    "smart-prompt-enhancer",
    `🎯 调用时机：当用户提出复杂开发需求时，AI应调用此工具获得增强指导
适用场景：
- 多步骤的开发任务（如创建完整功能模块）
- 需要考虑多个技术因素的任务
- 用户描述不够详细，需要补充上下文
- 需要选择技术方案或架构决策时

功能：生成增强的工作提示，帮助AI更好地理解和执行复杂任务`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      userQuery: z.string().describe("用户查询或问题"),
      sessionId: z.string().optional().describe("会话ID，用于获取上下文记忆"),
      expertRole: z.enum(['frontend-developer', 'backend-developer', 'fullstack-developer', 'data-analyst']).optional().describe("强制指定专家角色")
    },
    async ({ rootPath, userQuery, sessionId, expertRole }) => {
      try {
        // 1. 分析项目上下文
        const analyzer = new ProjectContextAnalyzer(rootPath);
        const projectContext = await analyzer.analyzeTechStack();
        
        // 2. 初始化记忆管理
        const memoryManager = new MemoryManager(rootPath);
        await memoryManager.initializeMemoryStructure();
        
        // 3. 构建上下文感知的提示词
        const promptBuilder = new ContextualPromptBuilder(memoryManager);
        const result = await promptBuilder.buildContextAwarePrompt(
          userQuery, 
          projectContext, 
          sessionId
        );

        // 4. 选择专家角色（如果需要）
        const selectedExpertRole = expertRole || ExpertPromptGenerator.selectExpertRole(projectContext);
        
        // 5. 获取工具推荐
        const toolRecommendations = MCPToolRecommender.recommendTools(userQuery).slice(0, 3);

        // 6. 保存本次查询到短期记忆
        if (sessionId) {
          await memoryManager.saveShortTermMemory(sessionId, {
            userQueries: [userQuery],
            projectContext,
            searchStrategies: [result.searchGuidance],
            toolsUsed: result.toolRecommendations
          });
        }

        const formatted = `# 🤖 上下文感知的智能提示词

## 🎯 用户查询
"${userQuery}"

## 👤 推荐专家角色
**${selectedExpertRole}** ${expertRole ? '(用户指定)' : '(自动选择)'}

## 📊 项目技术背景
- **主要语言**: ${projectContext.languages?.join(', ') || '未知'}
- **使用框架**: ${projectContext.frameworks?.join(', ') || '无'}
- **架构模式**: ${projectContext.architecture || '未知'}

## 🧠 记忆上下文
${result.memoryContext || '暂无相关记忆'}

## 🔍 搜索策略建议
${result.searchGuidance}

## 🛠️ 推荐工具组合
${toolRecommendations.map(tool => `- **${tool.toolName}**: ${tool.description} (置信度: ${(tool.confidence * 100).toFixed(1)}%)`).join('\n')}

---

## 🚀 完整的智能提示词

以下是为您生成的完整上下文感知提示词，请复制并使用：

\`\`\`
${result.enhancedPrompt}
\`\`\`

## 📝 使用说明

1. **直接使用**: 将上面的智能提示词复制给AI编程工具
2. **遵循建议**: AI将根据提示使用推荐的搜索工具
3. **上下文感知**: AI将考虑项目背景和您的历史偏好
4. **记忆积累**: 本次对话将被记录，为未来提供更好的上下文

这样，AI编程工具就能给出更精准、更个性化的帮助了！`;

        return {
          content: [{
            type: "text",
            text: formatted
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `构建智能提示词失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具3: 记忆助手 - 获取用户偏好或保存有价值的解决方案
  server.tool(
    "memory-assistant",
    `🎯 调用时机：AI应在以下情况调用此工具

获取信息时：
- 生成代码前，获取用户的代码风格偏好
- 需要了解历史技术决策时
- 查找类似问题的解决方案时

保存信息时：
- 成功解决了复杂技术问题后
- 发现了有价值的代码模式后
- 用户表达了特定偏好后

功能：智能的项目记忆管理，让AI能够提供个性化和一致的开发体验`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      action: z.enum([
        'save-session', 'get-session', 'get-summary', 
        'learn-preferences', 'add-decision', 'add-solution', 
        'cleanup', 'status'
      ]).describe("操作类型"),
      sessionId: z.string().optional().describe("会话ID"),
      data: z.any().optional().describe("操作数据")
    },
    async ({ rootPath, action, sessionId, data }) => {
      try {
        const memoryManager = new MemoryManager(rootPath);
        await memoryManager.initializeMemoryStructure();

        let result: any = {};

        switch (action) {
          case 'save-session':
            if (sessionId && data) {
              await memoryManager.saveShortTermMemory(sessionId, data);
              result = { success: true, message: '会话记忆已保存' };
            }
            break;

          case 'get-session':
            if (sessionId) {
              result = await memoryManager.getShortTermMemory(sessionId);
            }
            break;

          case 'get-summary':
            result = await memoryManager.generateMemorySummary(sessionId);
            break;

          case 'learn-preferences':
            // 集成用户偏好学习功能
            const learner = new PreferenceLearner(rootPath);
            const preferences = await learner.learnFromCodeStyle();
            await memoryManager.saveUserProfile(preferences);
            result = { 
              success: true, 
              preferences,
              message: '用户偏好已学习并保存' 
            };
            break;

          case 'add-decision':
            if (data?.decision && data?.reason) {
              await memoryManager.addTechnicalDecision(data.decision, data.reason, data.context || '');
              result = { success: true, message: '技术决策已记录' };
            }
            break;

          case 'add-solution':
            if (data?.problem && data?.solution) {
              await memoryManager.addCommonSolution(
                data.problem, 
                data.solution, 
                data.searchKeywords || [], 
                data.toolsUsed || []
              );
              result = { success: true, message: '解决方案已记录' };
            }
            break;

          case 'cleanup':
            await memoryManager.cleanupShortTermMemory();
            result = { success: true, message: '过期记忆已清理' };
            break;

          case 'status':
            result = await memoryManager.getMemorySystemStatus();
            break;
        }

        const formatted = `# 🧠 记忆管理结果

## 操作: ${action}

\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\`

## 使用建议

### 常用操作
- **学习用户偏好**: action='learn-preferences'
- **保存会话**: action='save-session', sessionId='xxx', data={...}
- **获取记忆摘要**: action='get-summary', sessionId='xxx'
- **记录技术决策**: action='add-decision', data={decision, reason, context}
- **记录解决方案**: action='add-solution', data={problem, solution, searchKeywords, toolsUsed}

### 记忆系统状态
定期使用 action='status' 检查记忆系统健康状况。

### 清理维护
使用 action='cleanup' 清理过期的短期记忆（超过7天）。

### 偏好学习
action='learn-preferences' 会自动分析项目代码，学习您的：
- 代码缩进和引号偏好
- 命名约定习惯
- 项目结构模式
并将这些偏好用于未来的智能提示词生成。`;

        return {
          content: [{
            type: "text",
            text: formatted
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `记忆管理失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );
}