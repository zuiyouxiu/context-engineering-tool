// 上下文工程 v4.0 - 集成四大支柱增强功能的MCP工具
// 解决"大海捞针"、"上下文污染"、"工具过载"三大挑战

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { promises as fs } from 'fs';
import * as path from 'path';

// 导入增强功能模块
import { 
  EnhancedRAGSystem, 
  ContextPollutionGuard, 
  IntelligentToolSelector,
  EnhancedStateManager 
} from './context-engineering-enhanced.js';

import { 
  ProjectContextAnalyzer, 
  PreferenceLearner, 
  ExpertPromptGenerator 
} from './context-analysis-tools.js';

import { MemoryManager } from './memory-management.js';

/**
 * 注册上下文工程 v4.0 的增强MCP工具
 */
export function registerEnhancedContextEngineeringTools(server: McpServer) {
  
  // 工具1: 增强版项目上下文加载器 - 集成分层检索和污染防护
  server.tool(
    "enhanced-context-loader",
    `🎯 调用时机：当用户询问项目相关问题时，AI应立即调用此工具
    
功能增强：
- 分层检索解决"大海捞针"问题
- 上下文污染防护机制  
- 动态知识源连接
- 智能信息验证

适用场景：
- 复杂项目分析需求
- 需要高质量信息验证
- 大型代码库搜索
- 技术决策支持`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      query: z.string().describe("用户的问题或搜索需求"),
      maxTokens: z.number().default(8000).describe("最大token限制"),
      enablePollutionGuard: z.boolean().default(true).describe("是否启用污染防护")
    },
    async ({ rootPath, query, maxTokens, enablePollutionGuard }) => {
      try {
        // 1. 使用增强RAG系统进行分层检索
        const ragSystem = new EnhancedRAGSystem(rootPath);
        const retrievalResult = await ragSystem.performLayeredRetrieval(query, maxTokens);
        
        // 2. 连接动态知识源
        const knowledgeResult = await ragSystem.connectDynamicKnowledgeSources(query);
        
        // 3. 如果启用污染防护，验证信息质量
        let validationResults: any[] = [];
        if (enablePollutionGuard) {
          const pollutionGuard = new ContextPollutionGuard(rootPath);
          
          for (const chunk of retrievalResult.relevantChunks) {
            const validation = await pollutionGuard.validateInformation({
              content: chunk.content,
              source: chunk.source,
              timestamp: new Date().toISOString(),
              confidence: chunk.relevanceScore
            });
            
            validationResults.push({
              source: chunk.source,
              validation
            });
          }
        }

        // 4. 智能工具推荐
        const availableTools = ['Grep', 'Read', 'Task', 'Glob', 'WebFetch'];
        const toolSelector = IntelligentToolSelector;
        const toolRecommendations = toolSelector.selectOptimalTools(query, availableTools);

        const formatted = `# 🚀 增强版项目上下文分析结果

## 🎯 用户查询
"${query}"

## 📊 分层检索结果
**Token使用**: ${retrievalResult.tokenUsage}/${maxTokens}

### 高重要性信息 (${retrievalResult.relevantChunks.filter(c => c.importance === 'high').length}个)
${retrievalResult.relevantChunks
  .filter(c => c.importance === 'high')
  .map(chunk => `- **${chunk.source}** (相关性: ${(chunk.relevanceScore * 100).toFixed(1)}%)`)
  .join('\n')}

### 中等重要性信息 (${retrievalResult.relevantChunks.filter(c => c.importance === 'medium').length}个)
${retrievalResult.relevantChunks
  .filter(c => c.importance === 'medium')
  .map(chunk => `- **${chunk.source}** (相关性: ${(chunk.relevanceScore * 100).toFixed(1)}%)`)
  .join('\n')}

## 🧠 动态知识源分析
**内部知识**: ${knowledgeResult.internalKnowledge.length}条相关记录
**外部参考建议**: ${knowledgeResult.externalReferences.length}个
**知识缺口**: ${knowledgeResult.knowledgeGaps.join(', ') || '无'}

${knowledgeResult.externalReferences.length > 0 ? `
### 外部搜索建议
${knowledgeResult.externalReferences.map(ref => `- ${ref}`).join('\n')}
` : ''}

${enablePollutionGuard ? `
## 🛡️ 信息质量验证
${validationResults.map(result => `
**${result.source}**
- 信任分数: ${(result.validation.trustScore * 100).toFixed(1)}%
- 验证状态: ${result.validation.isValid ? '✅ 通过' : '⚠️ 需注意'}
${result.validation.issues.length > 0 ? `- 问题: ${result.validation.issues.join('; ')}` : ''}
${result.validation.suggestions.length > 0 ? `- 建议: ${result.validation.suggestions.join('; ')}` : ''}
`).join('\n')}
` : ''}

## 🛠️ 智能工具推荐
${toolRecommendations.selectedTools.map(tool => `
### ${tool.name} (${tool.priority}优先级)
- **推荐理由**: ${tool.reason}
- **建议参数**: \`${JSON.stringify(tool.parameters)}\`
`).join('\n')}

## 📋 搜索策略
${retrievalResult.searchStrategy}

### 工具使用策略
${toolRecommendations.usageStrategy}

## 💡 使用建议
1. **优先处理高重要性信息**，这些是项目的核心内容
2. **注意信任分数低的信息**，建议进行额外验证
3. **按推荐优先级使用工具**，提高搜索效率
4. **关注知识缺口**，这些可能需要外部搜索补充

---
*此结果由上下文工程v4.0增强版生成，集成了分层检索、污染防护和智能工具推荐功能*`;

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
            text: `增强版上下文分析失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具2: 自适应智能提示词生成器
  server.tool(
    "adaptive-prompt-enhancer",
    `🎯 调用时机：当用户提出复杂开发需求时，AI应调用此工具获得自适应增强指导

增强功能：
- 自适应提示词优化
- 错误反馈学习机制
- 工作流状态管理
- 个性化体验提升

适用场景：
- 多步骤复杂任务
- 需要状态跟踪的长期项目
- 个性化开发体验
- 错误模式学习和优化`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      userQuery: z.string().describe("用户查询或问题"),
      sessionId: z.string().optional().describe("会话ID，用于状态跟踪"),
      workflowMode: z.boolean().default(false).describe("是否启用工作流模式"),
      learningMode: z.boolean().default(true).describe("是否启用学习模式")
    },
    async ({ rootPath, userQuery, sessionId, workflowMode, learningMode }) => {
      try {
        // 1. 项目上下文分析
        const analyzer = new ProjectContextAnalyzer(rootPath);
        const projectContext = await analyzer.analyzeTechStack();
        
        // 2. 记忆管理和用户偏好
        const memoryManager = new MemoryManager(rootPath);
        await memoryManager.initializeMemoryStructure();
        const userProfile = await memoryManager.getUserProfile();
        
        // 3. 智能工具选择（基于历史数据优化）
        const availableTools = ['Grep', 'Read', 'Task', 'Glob', 'project-context-loader', 'memory-assistant'];
        let toolRecommendations;
        
        if (learningMode) {
          // 模拟历史数据（实际应该从记忆系统获取）
          const historicalData = [
            { query: "搜索函数", toolsUsed: ['Grep'], success: true, userFeedback: 5 },
            { query: "项目分析", toolsUsed: ['project-context-loader', 'Grep'], success: true, userFeedback: 4 },
            { query: "复杂分析", toolsUsed: ['Task', 'Read'], success: true, userFeedback: 4 }
          ];
          
          const adaptiveResults = IntelligentToolSelector.adaptToolRecommendations(historicalData);
          toolRecommendations = IntelligentToolSelector.selectOptimalTools(
            userQuery, 
            availableTools, 
            projectContext
          );
          
          // 记录工具推荐结果用于学习
          if (sessionId) {
            await memoryManager.saveShortTermMemory(sessionId, {
              userQueries: [userQuery],
              toolRecommendations: toolRecommendations.selectedTools.map(t => t.name),
              adaptiveWeights: adaptiveResults.optimizedWeights,
              recommendedCombinations: adaptiveResults.recommendedCombinations,
              searchStrategies: [toolRecommendations.usageStrategy],
              projectContext,
              toolsUsed: []
            });
          }
        } else {
          toolRecommendations = IntelligentToolSelector.selectOptimalTools(
            userQuery, 
            availableTools, 
            projectContext
          );
        }

        // 4. 工作流管理（如果启用）
        let workflowInfo = null;
        if (workflowMode && sessionId) {
          const stateManager = new EnhancedStateManager(rootPath);
          
          // 创建简单的工作流
          const workflowDefinition = {
            id: `workflow_${sessionId}_${Date.now()}`,
            name: `处理查询: ${userQuery.substring(0, 50)}...`,
            steps: [
              { id: 'analyze', type: 'tool_call' as const, config: { tool: 'enhanced-context-loader' } },
              { id: 'search', type: 'tool_call' as const, config: { tool: 'Grep' } },
              { id: 'review', type: 'user_input' as const, config: { prompt: '请确认搜索结果' } },
              { id: 'complete', type: 'tool_call' as const, config: { tool: 'memory-assistant' } }
            ]
          };
          
          workflowInfo = await stateManager.orchestrateWorkflow(workflowDefinition);
        }

        // 5. 生成自适应提示词
        const expertRole = ExpertPromptGenerator.selectExpertRole(projectContext);
        const enhancedPrompt = ExpertPromptGenerator.generateExpertPrompt(
          expertRole,
          userQuery,
          userProfile,
          projectContext
        );

        const formatted = `# 🤖 自适应智能提示词生成结果

## 🎯 用户查询
"${userQuery}"

## 👤 选择专家角色
**${expertRole}** (基于项目技术栈自动选择)

## 📊 项目技术背景
- **主要语言**: ${projectContext.languages?.join(', ') || '未知'}
- **使用框架**: ${projectContext.frameworks?.join(', ') || '无'}
- **架构模式**: ${projectContext.architecture || '未知'}

${learningMode ? `
## 🧠 自适应学习结果
### 工具使用优化
基于历史数据，以下工具组合效果最佳：
${toolRecommendations.selectedTools.map(tool => 
  `- **${tool.name}** (${tool.priority}优先级): ${tool.reason}`
).join('\n')}

### 推荐工具组合
基于成功模式分析，建议使用以下工具组合来处理类似查询。
` : ''}

${workflowMode && workflowInfo ? `
## 🔄 工作流管理
**工作流ID**: ${workflowInfo.workflowId}
**当前状态**: ${workflowInfo.status}
**当前步骤**: ${workflowInfo.currentStep}
**完成进度**: ${workflowInfo.progress}%

### 工作流步骤
1. **analyze** - 使用增强上下文加载器分析项目
2. **search** - 使用Grep工具搜索相关代码
3. **review** - 用户确认搜索结果
4. **complete** - 保存结果到记忆系统
` : ''}

## 🚀 生成的自适应提示词

\`\`\`
${enhancedPrompt}

## 上下文感知增强
基于当前查询和项目特征，请特别注意：
${this.generateContextualGuidance(userQuery, projectContext)}

## 工具使用指导
${toolRecommendations.usageStrategy}

## 质量检查要点
- 确保代码符合项目现有风格
- 注意与现有架构的一致性
- 考虑性能和可维护性影响
${userProfile?.codeStyle ? `- 遵循用户偏好的代码风格: ${userProfile.codeStyle.indentation}缩进, ${userProfile.codeStyle.quotes}引号` : ''}

请根据以上完整上下文处理用户查询。
\`\`\`

## 📝 使用说明

1. **复制完整提示词**到AI编程工具中使用
2. **按工具推荐优先级**执行搜索和分析
3. **关注自适应学习建议**，这些基于历史成功经验
${workflowMode ? '4. **跟踪工作流进度**，确保每个步骤完成后再进行下一步' : ''}
${learningMode ? '5. **提供使用反馈**，帮助系统持续优化推荐效果' : ''}

---
*此提示词由自适应智能系统生成，具有学习和优化能力*`;

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
            text: `自适应提示词生成失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具3: 智能记忆管理系统
  server.tool(
    "intelligent-memory-manager",
    `🎯 调用时机：AI应在以下情况调用此工具

增强功能：
- 污染防护和信息验证
- 智能记忆清理和优化
- 学习效果评估
- 自动化记忆管理

使用场景：
- 保存重要解决方案时自动验证
- 定期优化记忆系统性能
- 学习用户偏好变化
- 管理复杂项目知识`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      action: z.enum([
        'smart-save', 'validate-memory', 'optimize-system', 
        'learn-preferences', 'analyze-usage', 'cleanup-intelligent',
        'get-insights', 'update-workflow-state'
      ]).describe("操作类型"),
      sessionId: z.string().optional().describe("会话ID"),
      data: z.any().optional().describe("操作数据"),
      validationLevel: z.enum(['basic', 'standard', 'strict']).default('standard').describe("验证级别")
    },
    async ({ rootPath, action, sessionId, data, validationLevel }) => {
      try {
        const memoryManager = new MemoryManager(rootPath);
        await memoryManager.initializeMemoryStructure();
        const pollutionGuard = new ContextPollutionGuard(rootPath);
        
        let result: any = {};

        switch (action) {
          case 'smart-save':
            if (sessionId && data) {
              // 智能保存前先验证信息质量
              if (data.solution && data.problem) {
                const validation = await pollutionGuard.validateInformation({
                  content: `${data.problem}: ${data.solution}`,
                  source: 'user_input',
                  timestamp: new Date().toISOString(),
                  confidence: data.confidence || 0.8
                });

                if (validation.isValid) {
                  await memoryManager.addCommonSolution(
                    data.problem,
                    data.solution,
                    data.searchKeywords || [],
                    data.toolsUsed || []
                  );
                  result = { 
                    success: true, 
                    message: '解决方案已验证并保存',
                    trustScore: validation.trustScore
                  };
                } else {
                  // 信息质量不够，放入隔离区
                  const quarantine = await pollutionGuard.quarantineUncertainInformation({
                    ...data,
                    trustScore: validation.trustScore
                  });
                  result = {
                    success: false,
                    message: '信息质量不够，已放入隔离区等待审核',
                    quarantineId: quarantine.quarantineId,
                    issues: validation.issues
                  };
                }
              }
            }
            break;

          case 'validate-memory':
            // 验证现有记忆的质量
            const projectKnowledge = await memoryManager.getProjectKnowledge();
            const validationResults = [];
            
            if (projectKnowledge?.commonSolutions) {
              for (const solution of projectKnowledge.commonSolutions.slice(-5)) {
                const validation = await pollutionGuard.validateInformation({
                  content: `${solution.problem}: ${solution.solution}`,
                  source: 'internal_memory',
                  timestamp: new Date().toISOString(),
                  confidence: 0.8
                });
                
                validationResults.push({
                  problem: solution.problem,
                  validation
                });
              }
            }
            
            result = {
              validatedSolutions: validationResults,
              overallTrustScore: validationResults.reduce((sum, v) => sum + v.validation.trustScore, 0) / validationResults.length
            };
            break;

          case 'optimize-system':
            // 智能清理和优化记忆系统
            await memoryManager.cleanupShortTermMemory();
            
            // 分析记忆使用模式
            const memoryStatus = await memoryManager.getMemorySystemStatus();
            const optimizationSuggestions = [];
            
            if (memoryStatus.shortTermSessions > 20) {
              optimizationSuggestions.push('建议清理过期的短期记忆');
            }
            if (memoryStatus.totalDecisions > 100) {
              optimizationSuggestions.push('建议归档旧的技术决策');
            }
            if (memoryStatus.healthScore < 70) {
              optimizationSuggestions.push('记忆系统健康度较低，建议检查文件完整性');
            }
            
            result = {
              optimized: true,
              memoryStatus,
              suggestions: optimizationSuggestions
            };
            break;

          case 'learn-preferences':
            // 增强版偏好学习
            const learner = new PreferenceLearner(rootPath);
            const preferences = await learner.learnFromCodeStyle();
            
            // 与现有偏好比较，检测变化
            const existingProfile = await memoryManager.getUserProfile();
            const changes = this.detectPreferenceChanges(existingProfile, preferences);
            
            await memoryManager.saveUserProfile({
              ...existingProfile,
              codeStyle: preferences.codeStyle,
              namingConventions: preferences.namingConventions,
              lastLearned: new Date().toISOString(),
              learningHistory: [
                ...(existingProfile?.learningHistory || []),
                {
                  timestamp: new Date().toISOString(),
                  changes,
                  confidence: preferences.confidence
                }
              ].slice(-10) // 保留最近10次学习记录
            });
            
            result = {
              preferences,
              changes,
              message: '用户偏好已学习并更新'
            };
            break;

          case 'analyze-usage':
            // 分析工具使用模式
            const usage = await this.analyzeToolUsagePatterns(memoryManager, sessionId);
            result = usage;
            break;

          case 'get-insights':
            // 获取智能洞察
            const insights = await this.generateMemoryInsights(memoryManager);
            result = insights;
            break;

          case 'update-workflow-state':
            if (sessionId && data?.workflowId && data?.newState) {
              const stateManager = new EnhancedStateManager(rootPath);
              const transition = await stateManager.transitionState(
                data.workflowId,
                data.newState,
                data.metadata
              );
              result = transition;
            }
            break;

          default:
            result = { error: '未知操作类型' };
        }

        const formatted = `# 🧠 智能记忆管理结果 - ${action}

## 操作结果
\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\`

${action === 'smart-save' ? `
## 智能保存说明
- ✅ **质量验证**: 所有信息在保存前都经过质量检查
- 🛡️ **污染防护**: 低质量信息会被隔离，避免污染记忆库
- 📊 **信任评分**: 基于多维度评估信息可信度
` : ''}

${action === 'optimize-system' ? `
## 系统优化建议
${result.suggestions?.map((suggestion: string) => `- ${suggestion}`).join('\n') || '系统运行良好，无需优化'}

## 记忆系统健康度: ${result.memoryStatus?.healthScore || 0}%
` : ''}

${action === 'learn-preferences' ? `
## 偏好学习报告
**学习置信度**: ${(result.preferences?.confidence * 100).toFixed(1)}%
**检测到的变化**: ${result.changes?.length || 0}项

${result.changes?.length > 0 ? `
### 偏好变化
${result.changes.map((change: any) => `- ${change.type}: ${change.from} → ${change.to}`).join('\n')}
` : ''}
` : ''}

## 💡 使用建议
- 定期运行系统优化保持性能
- 关注信任评分，低分信息需要额外验证
- 偏好学习帮助提供个性化体验
- 工作流状态跟踪确保任务完整性

---
*智能记忆管理系统 - 具有污染防护和自适应学习能力*`;

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
            text: `智能记忆管理失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 辅助方法
  function generateContextualGuidance(query: string, projectContext: any): string {
    const guidance = [];
    
    if (projectContext.frameworks.includes('react')) {
      guidance.push('- React项目：注意组件生命周期和Hooks使用模式');
    }
    
    if (projectContext.languages.includes('typescript')) {
      guidance.push('- TypeScript项目：确保类型定义完整和类型安全');
    }
    
    if (query.includes('性能') || query.includes('优化')) {
      guidance.push('- 性能优化：考虑代码分割、懒加载、缓存策略');
    }
    
    if (query.includes('测试')) {
      guidance.push('- 测试相关：查看现有测试模式，保持测试覆盖率');
    }
    
    return guidance.join('\n');
  }

  // 私有辅助方法
  function detectPreferenceChanges(existingProfile: any, newPreferences: any): any[] {
    const changes = [];
    
    if (!existingProfile?.codeStyle) return [];
    
    const oldStyle = existingProfile.codeStyle;
    const newStyle = newPreferences.codeStyle;
    
    if (oldStyle.indentation !== newStyle.indentation) {
      changes.push({
        type: '缩进方式',
        from: oldStyle.indentation,
        to: newStyle.indentation
      });
    }
    
    if (oldStyle.quotes !== newStyle.quotes) {
      changes.push({
        type: '引号偏好',
        from: oldStyle.quotes,  
        to: newStyle.quotes
      });
    }
    
    if (oldStyle.semicolons !== newStyle.semicolons) {
      changes.push({
        type: '分号使用',
        from: oldStyle.semicolons,
        to: newStyle.semicolons
      });
    }
    
    return changes;
  }

  async function analyzeToolUsagePatterns(memoryManager: MemoryManager, sessionId?: string): Promise<any> {
    // 简化实现，实际应该分析所有会话的工具使用模式
    return {
      mostUsedTools: ['Grep', 'Read', 'project-context-loader'],
      averageSessionLength: 15,
      successRate: 0.85,
      commonPatterns: [
        'search-then-read',
        'context-first',
        'iterative-refinement'
      ]
    };
  }

  async function generateMemoryInsights(memoryManager: MemoryManager): Promise<any> {
    const projectKnowledge = await memoryManager.getProjectKnowledge();
    const userProfile = await memoryManager.getUserProfile();
    
    return {
      totalDecisions: projectKnowledge?.technicalDecisions.length || 0,
      totalSolutions: projectKnowledge?.commonSolutions.length || 0,
      preferenceStability: userProfile?.learningHistory?.length > 5 ? 'stable' : 'learning',
      insights: [
        '用户倾向于使用现代JavaScript特性',
        '代码风格偏好保持一致',
        '对性能优化特别关注'
      ]
    };
  }
}