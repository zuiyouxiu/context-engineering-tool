// 基于MCP真实能力的可行上下文工程工具
// 只使用文件系统操作，不依赖外部API

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
 * 注册所有可行的上下文工程MCP工具
 */
export function registerContextEngineeringTools(server: McpServer) {
  
  // 工具1: 分析项目上下文并生成智能搜索指导
  server.tool(
    "analyze-project-context",
    `分析项目技术栈并生成智能搜索指导
基于项目分析，构造引导AI使用内置搜索能力的提示词：
- 检测编程语言和框架
- 分析项目架构模式  
- 生成智能搜索引导提示
- 推荐使用内置搜索工具的策略`,
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

  // 工具2: 学习用户偏好 (基于代码分析)
  server.tool(
    "learn-user-preferences",
    `从项目代码中学习用户编程偏好
基于代码风格分析，无需外部依赖：
- 分析代码缩进、引号、命名风格
- 学习项目约定和模式
- 更新用户偏好配置
- 生成个性化建议`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      saveToMemory: z.boolean().default(true).describe("是否保存学习结果到记忆文件"),
      analysisScope: z.enum(['code-style', 'naming', 'structure', 'all']).default('all').describe("学习范围")
    },
    async ({ rootPath, saveToMemory, analysisScope }) => {
      try {
        const learner = new PreferenceLearner(rootPath);
        const results: any = {};

        if (analysisScope === 'code-style' || analysisScope === 'all') {
          results.codeStylePrefs = await learner.learnFromCodeStyle();
        }

        // 可以添加更多学习维度...

        const formatted = `# 🧠 用户偏好学习结果

## 📝 代码风格偏好
${results.codeStylePrefs ? `
**缩进方式**: ${results.codeStylePrefs.codeStyle.indentation === 'tabs' ? 'Tab' : '空格'}
**缩进大小**: ${results.codeStylePrefs.codeStyle.indentSize}
**引号偏好**: ${results.codeStylePrefs.codeStyle.quotes === 'single' ? '单引号' : '双引号'}
**分号使用**: ${results.codeStylePrefs.codeStyle.semicolons ? '使用' : '不使用'}

**命名约定**:
- 变量: ${results.codeStylePrefs.namingConventions.variables}
- 函数: ${results.codeStylePrefs.namingConventions.functions}  
- 常量: ${results.codeStylePrefs.namingConventions.constants}

**学习置信度**: ${(results.codeStylePrefs.confidence * 100).toFixed(1)}%
` : '(跳过代码风格学习)'}

## 💾 保存状态
${saveToMemory ? '✅ 偏好已保存到用户记忆文件' : '⏭️ 跳过保存到记忆文件'}

## 🎯 个性化建议
基于学习到的偏好，AI助手将：
- 生成符合你代码风格的代码示例
- 使用你偏好的命名约定
- 遵循你的项目结构模式
- 提供个性化的开发建议

下次使用"generate-expert-prompt"工具时，这些偏好将自动应用。
`;

        if (saveToMemory && results.codeStylePrefs) {
          // 保存到记忆文件的逻辑已在PreferenceLearner中实现
        }

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
            text: `用户偏好学习失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具3: 生成专家提示词 (动态提示词)
  server.tool(
    "generate-expert-prompt",
    `基于项目上下文生成个性化专家提示词
根据技术栈自动选择专家角色：
- 前端开发专家 (React/Vue/Angular)
- 后端开发专家 (Node.js/Python/Go)
- 全栈开发专家 (多技术栈)
- 数据分析专家 (Python数据处理)`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      taskDescription: z.string().describe("当前任务描述"),
      forceRole: z.enum(['frontend-developer', 'backend-developer', 'fullstack-developer', 'data-analyst']).optional().describe("强制指定专家角色"),
      includePreferences: z.boolean().default(true).describe("是否包含用户偏好")
    },
    async ({ rootPath, taskDescription, forceRole, includePreferences }) => {
      try {
        // 1. 分析项目技术栈
        const analyzer = new ProjectContextAnalyzer(rootPath);
        const techStack = await analyzer.analyzeTechStack();

        // 2. 选择专家角色
        const expertRole = forceRole || ExpertPromptGenerator.selectExpertRole(techStack);

        // 3. 加载用户偏好
        let userPreferences = null;
        if (includePreferences) {
          try {
            const prefsPath = path.join(rootPath, 'context-engineering', 'memory', 'long-term', 'user-profile.json');
            userPreferences = JSON.parse(await fs.readFile(prefsPath, 'utf-8'));
          } catch {
            // 偏好文件不存在，使用默认值
          }
        }

        // 4. 生成专家提示词
        const expertPrompt = ExpertPromptGenerator.generateExpertPrompt(
          expertRole,
          taskDescription,
          userPreferences,
          techStack
        );

        const formatted = `# 🎯 专家提示词生成结果

## 👤 选择的专家角色
**${expertRole}** - ${ExpertPromptGenerator['EXPERT_ROLES'][expertRole as keyof typeof ExpertPromptGenerator['EXPERT_ROLES']].name}

${forceRole ? '(强制指定角色)' : '(基于项目技术栈自动选择)'}

## 🧠 生成的专家提示词

\`\`\`
${expertPrompt}
\`\`\`

## 📋 提示词组成要素

### 技术上下文
- **主要语言**: ${techStack.languages.join(', ') || '未检测到'}
- **使用框架**: ${techStack.frameworks.join(', ') || '无'}
- **架构模式**: ${techStack.architecture || '未知'}

### 用户偏好 ${includePreferences ? '(已包含)' : '(已跳过)'}
${userPreferences && includePreferences ? `
- **代码风格**: ${userPreferences.codeStyle?.indentation || '默认'} 缩进
- **引号偏好**: ${userPreferences.codeStyle?.quotes || '默认'}
- **分号使用**: ${userPreferences.codeStyle?.semicolons ? '使用' : '不使用'}
` : '- 使用默认偏好设置'}

## 💡 使用建议
1. 将生成的提示词复制到AI对话中作为系统提示
2. 如果需要调整角色，使用 \`forceRole\` 参数
3. 使用 \`learn-user-preferences\` 工具改进个性化效果
4. 定期重新生成以获得最新的上下文信息
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
            text: `专家提示词生成失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具4: 推荐MCP工具 (工具调用优化)
  server.tool(
    "recommend-mcp-tools",
    `基于任务需求推荐最适合的MCP工具
智能分析用户查询并推荐：
- 最相关的工具及使用方法
- 建议的参数配置
- 工具执行顺序规划
- 使用理由和置信度`,
    {
      query: z.string().describe("用户的需求或问题描述"),
      taskType: z.enum(['analysis', 'development', 'documentation', 'debugging', 'optimization']).optional().describe("任务类型"),
      maxRecommendations: z.number().default(3).describe("最大推荐数量")
    },
    async ({ query, taskType, maxRecommendations }) => {
      try {
        const recommendations = MCPToolRecommender.recommendTools(query, taskType);
        const topRecommendations = recommendations.slice(0, maxRecommendations);

        const formatted = `# 🛠️ MCP工具推荐结果

**查询**: "${query}"
**任务类型**: ${taskType || '自动推断'}

## 🎯 推荐的工具

${topRecommendations.map((rec, index) => `
### ${index + 1}. ${rec.toolName}
**描述**: ${rec.description}
**推荐理由**: ${rec.reason}
**置信度**: ${(rec.confidence * 100).toFixed(1)}%

**建议参数**:
\`\`\`json
${JSON.stringify(rec.suggestedParameters, null, 2)}
\`\`\`

**使用示例**:
调用工具 \`${rec.toolName}\` 并传入上述参数
`).join('\n')}

## 📋 执行建议

### 推荐执行顺序
${topRecommendations.map((rec, index) => 
  `${index + 1}. **${rec.toolName}** - ${rec.description}`
).join('\n')}

### 参数说明
- \`rootPath\`: 替换为你的实际项目路径
- 其他参数根据具体需求调整

### 最佳实践
1. 按推荐顺序执行工具以获得最佳效果
2. 先使用分析类工具了解项目状况
3. 再使用生成类工具创建内容
4. 最后使用管理类工具保存结果

${topRecommendations.length === 0 ? '⚠️ 未找到匹配的工具推荐，请尝试更具体的查询描述。' : ''}
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
            text: `MCP工具推荐失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具5: 记忆管理工具
  server.tool(
    "manage-memory",
    `上下文工程记忆管理系统
实现短期记忆（会话状态）和长期记忆（用户偏好、项目知识）的管理：
- 保存和获取会话记忆
- 管理用户偏好和项目知识
- 添加技术决策和解决方案
- 生成记忆摘要用于上下文构建`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      action: z.enum(['save-session', 'get-session', 'add-decision', 'add-solution', 'get-summary', 'cleanup', 'status']).describe("操作类型"),
      sessionId: z.string().optional().describe("会话 ID"),
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

          case 'get-summary':
            result = await memoryManager.generateMemorySummary(sessionId);
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
- **保存会话**: action='save-session', sessionId='xxx', data={...}
- **获取记忆摘要**: action='get-summary', sessionId='xxx'
- **记录技术决策**: action='add-decision', data={decision, reason, context}
- **记录解决方案**: action='add-solution', data={problem, solution, searchKeywords, toolsUsed}

### 记忆系统状态
定期使用 action='status' 检查记忆系统健康状况。

### 清理维护
使用 action='cleanup' 清理过期的短期记忆（超过7天）。`;

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

  // 工具6: 构建上下文感知的智能提示词
  server.tool(
    "build-contextual-prompt",
    `基于记忆和项目上下文构建智能提示词
这是上下文工程的核心功能，将用户问题转化为包含全面上下文的智能提示：
- 整合项目技术信息和用户记忆
- 生成针对性的搜索策略和工具推荐
- 提供上下文感知的AI编程指导`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      userQuery: z.string().describe("用户查询或问题"),
      sessionId: z.string().optional().describe("会话 ID，用于获取上下文记忆")
    },
    async ({ rootPath, userQuery, sessionId }) => {
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

        // 4. 保存本次查询到短期记忆
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

## 📊 项目技术背景
- **主要语言**: ${projectContext.languages?.join(', ') || '未知'}
- **使用框架**: ${projectContext.frameworks?.join(', ') || '无'}
- **架构模式**: ${projectContext.architecture || '未知'}

## 🧠 记忆上下文
${result.memoryContext || '暂无相关记忆'}

## 🔍 搜索策略建议
${result.searchGuidance}

## 🛠️ 推荐工具
${result.toolRecommendations.map(tool => `- ${tool}`).join('\n')}

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

  // 工具7: 上下文工程状态报告
  server.tool(
    "context-engineering-status",
    `生成上下文工程系统的全面状态报告
检查和评估：
- 项目上下文工程文件完整性
- 用户偏好学习进度
- 记忆系统健康状况
- 系统使用统计`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      includeRecommendations: z.boolean().default(true).describe("是否包含改进建议")
    },
    async ({ rootPath, includeRecommendations }) => {
      try {
        const contextPath = path.join(rootPath, 'context-engineering');
        const memoryPath = path.join(contextPath, 'memory');
        const coreContextPath = path.join(contextPath, 'core-context');

        // 检查文件存在性
        const fileChecks = {
          contextEngineering: await fs.access(contextPath).then(() => true).catch(() => false),
          coreContext: await fs.access(coreContextPath).then(() => true).catch(() => false),
          memory: await fs.access(memoryPath).then(() => true).catch(() => false)
        };

        // 统计文件数量
        const fileCounts = {
          coreFiles: 0,
          memoryFiles: 0,
          totalSize: 0
        };

        if (fileChecks.coreContext) {
          try {
            const coreFiles = await fs.readdir(coreContextPath);
            fileCounts.coreFiles = coreFiles.filter(f => f.endsWith('.md')).length;
          } catch {}
        }

        if (fileChecks.memory) {
          try {
            const memoryFiles = await fs.readdir(memoryPath, { recursive: true });
            fileCounts.memoryFiles = memoryFiles.filter(f => typeof f === 'string' && f.endsWith('.md')).length;
          } catch {}
        }

        // 检查用户偏好
        let userPrefsStatus = 'not-configured';
        try {
          const prefsPath = path.join(memoryPath, 'long-term', 'user-profile.json');
          await fs.access(prefsPath);
          userPrefsStatus = 'configured';
        } catch {}

        // 快速项目分析
        let projectAnalysis: any = {};
        try {
          const analyzer = new ProjectContextAnalyzer(rootPath);
          projectAnalysis = await analyzer.analyzeTechStack();
        } catch {}

        const healthScore = (
          (fileChecks.contextEngineering ? 25 : 0) +
          (fileChecks.coreContext ? 25 : 0) +
          (fileChecks.memory ? 25 : 0) +
          (userPrefsStatus === 'configured' ? 25 : 0)
        );

        const formatted = `# 📊 上下文工程系统状态报告

## 🏥 系统健康度: ${healthScore}%

${healthScore >= 75 ? '🟢 系统状态良好' : 
  healthScore >= 50 ? '🟡 系统部分配置' : 
  '🔴 系统需要初始化'}

## 📁 文件系统状态

### 核心组件
- **上下文工程目录**: ${fileChecks.contextEngineering ? '✅ 存在' : '❌ 缺失'}
- **核心上下文文件**: ${fileChecks.coreContext ? '✅ 存在' : '❌ 缺失'} (${fileCounts.coreFiles}个文件)
- **记忆系统**: ${fileChecks.memory ? '✅ 存在' : '❌ 缺失'} (${fileCounts.memoryFiles}个文件)

### 配置状态
- **用户偏好**: ${userPrefsStatus === 'configured' ? '✅ 已配置' : '⚠️ 未配置'}

## 🔧 项目技术栈
${projectAnalysis.languages ? `
- **编程语言**: ${projectAnalysis.languages.join(', ')}
- **框架**: ${projectAnalysis.frameworks.join(', ') || '无'}
- **架构**: ${projectAnalysis.architecture || '未知'}
` : '- 未检测到技术栈信息'}

## 📈 使用建议

### 立即行动项
${!fileChecks.contextEngineering ? '1. 🚀 运行 `init-context-engineering` 初始化系统\n' : ''}
${userPrefsStatus !== 'configured' ? '2. 🧠 运行 `learn-user-preferences` 学习编程偏好\n' : ''}
${!projectAnalysis.languages ? '3. 📊 运行 `analyze-project-context` 分析项目\n' : ''}
4. 🎯 使用 `build-contextual-prompt` 生成智能提示词
5. 💾 通过 `manage-memory` 积累项目知识

### 优化建议
${includeRecommendations ? `
- 定期使用 \`analyze-project-context\` 保持项目信息更新
- 通过 \`learn-user-preferences\` 持续改进个性化体验  
- 使用 \`generate-expert-prompt\` 获得针对性的AI助手配置
- 利用 \`recommend-mcp-tools\` 优化工具使用效率
` : '(跳过优化建议)'}

## 🎯 下一步行动

基于当前状态，建议${healthScore < 50 ? '首先初始化系统' : 
  healthScore < 75 ? '完善配置' : 
  '保持系统更新'}：

${healthScore < 50 ? `
1. 运行 \`init-context-engineering\` 创建基础结构
2. 使用 \`analyze-project-context\` 了解项目
3. 通过 \`learn-user-preferences\` 个性化配置
` : healthScore < 75 ? `
1. 补全缺失的配置项
2. 运行分析工具完善项目信息
3. 测试工具推荐功能
` : `
1. 定期运行状态检查
2. 根据项目变化更新配置
3. 探索高级功能和优化
`}
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
            text: `状态报告生成失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );
}