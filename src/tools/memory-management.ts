// 基于上下文工程理念的持久化记忆管理系统
// 实现短期记忆（会话状态）和长期记忆（用户偏好、项目知识）的管理

import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * 记忆类型定义
 */
export interface ShortTermMemory {
  sessionId: string;
  timestamp: string;
  userQueries: string[];
  aiResponses: string[];
  searchStrategies: string[];
  toolsUsed: string[];
  projectContext: any;
}

export interface LongTermMemory {
  userProfile: {
    codeStyle: any;
    preferredFrameworks: string[];
    commonPatterns: string[];
    expertRoles: string[];
  };
  projectKnowledge: {
    technicalDecisions: Array<{
      decision: string;
      reason: string;
      timestamp: string;
      context: string;
    }>;
    commonSolutions: Array<{
      problem: string;
      solution: string;
      searchKeywords: string[];
      toolsUsed: string[];
    }>;
    architectureInsights: any;
  };
  learningHistory: Array<{
    timestamp: string;
    learningType: string;
    insights: any;
  }>;
}

/**
 * 记忆管理器 - 上下文工程的核心组件
 */
export class MemoryManager {
  private projectRoot: string;
  private memoryPath: string;
  private shortTermPath: string;
  private longTermPath: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.memoryPath = path.join(projectRoot, 'context-engineering', 'memory');
    this.shortTermPath = path.join(this.memoryPath, 'short-term');
    this.longTermPath = path.join(this.memoryPath, 'long-term');
  }

  /**
   * 初始化记忆目录结构
   */
  async initializeMemoryStructure(): Promise<void> {
    try {
      await fs.mkdir(this.memoryPath, { recursive: true });
      await fs.mkdir(this.shortTermPath, { recursive: true });
      await fs.mkdir(this.longTermPath, { recursive: true });

      // 创建基础记忆文件
      const userProfilePath = path.join(this.longTermPath, 'user-profile.json');
      if (!await this.fileExists(userProfilePath)) {
        await this.saveUserProfile({
          codeStyle: {},
          preferredFrameworks: [],
          commonPatterns: [],
          expertRoles: []
        });
      }

      const projectKnowledgePath = path.join(this.longTermPath, 'project-knowledge.json');
      if (!await this.fileExists(projectKnowledgePath)) {
        await this.saveProjectKnowledge({
          technicalDecisions: [],
          commonSolutions: [],
          architectureInsights: {}
        });
      }
    } catch (error) {
      console.error('初始化记忆结构失败:', error);
    }
  }

  /**
   * 保存短期记忆（会话记录）
   */
  async saveShortTermMemory(sessionId: string, memory: Partial<ShortTermMemory>): Promise<void> {
    try {
      const sessionFile = path.join(this.shortTermPath, `session-${sessionId}.json`);
      
      let existingMemory: ShortTermMemory = {
        sessionId,
        timestamp: new Date().toISOString(),
        userQueries: [],
        aiResponses: [],
        searchStrategies: [],
        toolsUsed: [],
        projectContext: {}
      };

      // 如果文件存在，先读取现有内容
      if (await this.fileExists(sessionFile)) {
        try {
          existingMemory = JSON.parse(await fs.readFile(sessionFile, 'utf-8'));
        } catch {
          // 文件损坏，使用默认值
        }
      }

      // 合并新的记忆内容
      const updatedMemory = {
        ...existingMemory,
        ...memory,
        timestamp: new Date().toISOString(),
        userQueries: [...(existingMemory.userQueries || []), ...(memory.userQueries || [])],
        aiResponses: [...(existingMemory.aiResponses || []), ...(memory.aiResponses || [])],
        searchStrategies: [...(existingMemory.searchStrategies || []), ...(memory.searchStrategies || [])],
        toolsUsed: [...(existingMemory.toolsUsed || []), ...(memory.toolsUsed || [])]
      };

      await fs.writeFile(sessionFile, JSON.stringify(updatedMemory, null, 2));
    } catch (error) {
      console.error('保存短期记忆失败:', error);
    }
  }

  /**
   * 获取短期记忆
   */
  async getShortTermMemory(sessionId: string): Promise<ShortTermMemory | null> {
    try {
      const sessionFile = path.join(this.shortTermPath, `session-${sessionId}.json`);
      if (await this.fileExists(sessionFile)) {
        return JSON.parse(await fs.readFile(sessionFile, 'utf-8'));
      }
      return null;
    } catch (error) {
      console.error('获取短期记忆失败:', error);
      return null;
    }
  }

  /**
   * 清理过期的短期记忆（超过7天）
   */
  async cleanupShortTermMemory(): Promise<void> {
    try {
      const files = await fs.readdir(this.shortTermPath);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.shortTermPath, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < sevenDaysAgo) {
            await fs.unlink(filePath);
          }
        }
      }
    } catch (error) {
      console.error('清理短期记忆失败:', error);
    }
  }

  /**
   * 保存用户偏好到长期记忆
   */
  async saveUserProfile(profile: LongTermMemory['userProfile']): Promise<void> {
    try {
      const profilePath = path.join(this.longTermPath, 'user-profile.json');
      
      let existingProfile = {};
      if (await this.fileExists(profilePath)) {
        try {
          existingProfile = JSON.parse(await fs.readFile(profilePath, 'utf-8'));
        } catch {
          // 文件损坏，使用空对象
        }
      }

      const updatedProfile = {
        ...existingProfile,
        ...profile,
        lastUpdated: new Date().toISOString()
      };

      await fs.writeFile(profilePath, JSON.stringify(updatedProfile, null, 2));
    } catch (error) {
      console.error('保存用户偏好失败:', error);
    }
  }

  /**
   * 获取用户偏好
   */
  async getUserProfile(): Promise<LongTermMemory['userProfile'] | null> {
    try {
      const profilePath = path.join(this.longTermPath, 'user-profile.json');
      if (await this.fileExists(profilePath)) {
        return JSON.parse(await fs.readFile(profilePath, 'utf-8'));
      }
      return null;
    } catch (error) {
      console.error('获取用户偏好失败:', error);
      return null;
    }
  }

  /**
   * 保存项目知识到长期记忆
   */
  async saveProjectKnowledge(knowledge: LongTermMemory['projectKnowledge']): Promise<void> {
    try {
      const knowledgePath = path.join(this.longTermPath, 'project-knowledge.json');
      await fs.writeFile(knowledgePath, JSON.stringify(knowledge, null, 2));
    } catch (error) {
      console.error('保存项目知识失败:', error);
    }
  }

  /**
   * 获取项目知识
   */
  async getProjectKnowledge(): Promise<LongTermMemory['projectKnowledge'] | null> {
    try {
      const knowledgePath = path.join(this.longTermPath, 'project-knowledge.json');
      if (await this.fileExists(knowledgePath)) {
        return JSON.parse(await fs.readFile(knowledgePath, 'utf-8'));
      }
      return null;
    } catch (error) {
      console.error('获取项目知识失败:', error);
      return null;
    }
  }

  /**
   * 添加技术决策记录
   */
  async addTechnicalDecision(decision: string, reason: string, context: string): Promise<void> {
    try {
      const knowledge = await this.getProjectKnowledge() || {
        technicalDecisions: [],
        commonSolutions: [],
        architectureInsights: {}
      };

      knowledge.technicalDecisions.push({
        decision,
        reason,
        context,
        timestamp: new Date().toISOString()
      });

      // 保持最近50个决策记录
      if (knowledge.technicalDecisions.length > 50) {
        knowledge.technicalDecisions = knowledge.technicalDecisions.slice(-50);
      }

      await this.saveProjectKnowledge(knowledge);
    } catch (error) {
      console.error('添加技术决策失败:', error);
    }
  }

  /**
   * 添加常用解决方案
   */
  async addCommonSolution(problem: string, solution: string, searchKeywords: string[], toolsUsed: string[]): Promise<void> {
    try {
      const knowledge = await this.getProjectKnowledge() || {
        technicalDecisions: [],
        commonSolutions: [],
        architectureInsights: {}
      };

      knowledge.commonSolutions.push({
        problem,
        solution,
        searchKeywords,
        toolsUsed
      });

      // 保持最近30个解决方案
      if (knowledge.commonSolutions.length > 30) {
        knowledge.commonSolutions = knowledge.commonSolutions.slice(-30);
      }

      await this.saveProjectKnowledge(knowledge);
    } catch (error) {
      console.error('添加解决方案失败:', error);
    }
  }

  /**
   * 生成记忆摘要用于上下文构建
   */
  async generateMemorySummary(sessionId?: string): Promise<{
    recentQueries: string[];
    userPreferences: any;
    relevantDecisions: any[];
    commonSolutions: any[];
    suggestedSearchStrategies: string[];
  }> {
    try {
      const summary = {
        recentQueries: [] as string[],
        userPreferences: {},
        relevantDecisions: [] as any[],
        commonSolutions: [] as any[],
        suggestedSearchStrategies: [] as string[]
      };

      // 获取短期记忆
      if (sessionId) {
        const shortTerm = await this.getShortTermMemory(sessionId);
        if (shortTerm) {
          summary.recentQueries = shortTerm.userQueries.slice(-5); // 最近5个查询
          summary.suggestedSearchStrategies = shortTerm.searchStrategies.slice(-3); // 最近3个搜索策略
        }
      }

      // 获取用户偏好
      const userProfile = await this.getUserProfile();
      if (userProfile) {
        summary.userPreferences = userProfile;
      }

      // 获取项目知识
      const projectKnowledge = await this.getProjectKnowledge();
      if (projectKnowledge) {
        summary.relevantDecisions = projectKnowledge.technicalDecisions.slice(-5); // 最近5个决策
        summary.commonSolutions = projectKnowledge.commonSolutions.slice(-5); // 最近5个解决方案
      }

      return summary;
    } catch (error) {
      console.error('生成记忆摘要失败:', error);
      return {
        recentQueries: [],
        userPreferences: {},
        relevantDecisions: [],
        commonSolutions: [],
        suggestedSearchStrategies: []
      };
    }
  }

  /**
   * 记忆系统健康检查
   */
  async getMemorySystemStatus(): Promise<{
    shortTermSessions: number;
    longTermProfiles: number;
    totalDecisions: number;
    totalSolutions: number;
    lastActivity: string;
    healthScore: number;
  }> {
    try {
      let shortTermSessions = 0;
      let lastActivity = '';

      // 检查短期记忆
      try {
        const shortTermFiles = await fs.readdir(this.shortTermPath);
        shortTermSessions = shortTermFiles.filter(f => f.endsWith('.json')).length;
        
        // 查找最近活动
        for (const file of shortTermFiles) {
          if (file.endsWith('.json')) {
            const filePath = path.join(this.shortTermPath, file);
            const stats = await fs.stat(filePath);
            if (stats.mtime.toISOString() > lastActivity) {
              lastActivity = stats.mtime.toISOString();
            }
          }
        }
      } catch {}

      // 检查长期记忆
      const userProfile = await this.getUserProfile();
      const projectKnowledge = await this.getProjectKnowledge();
      
      const longTermProfiles = userProfile ? 1 : 0;
      const totalDecisions = projectKnowledge?.technicalDecisions.length || 0;
      const totalSolutions = projectKnowledge?.commonSolutions.length || 0;

      // 计算健康分数
      let healthScore = 0;
      if (longTermProfiles > 0) healthScore += 25;
      if (totalDecisions > 0) healthScore += 25;
      if (totalSolutions > 0) healthScore += 25;
      if (shortTermSessions > 0) healthScore += 25;

      return {
        shortTermSessions,
        longTermProfiles,
        totalDecisions,
        totalSolutions,
        lastActivity,
        healthScore
      };
    } catch (error) {
      console.error('记忆系统状态检查失败:', error);
      return {
        shortTermSessions: 0,
        longTermProfiles: 0,
        totalDecisions: 0,
        totalSolutions: 0,
        lastActivity: '',
        healthScore: 0
      };
    }
  }

  // 辅助方法
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 智能提示词生成器 - 基于记忆的上下文构建
 */
export class ContextualPromptBuilder {
  private memoryManager: MemoryManager;

  constructor(memoryManager: MemoryManager) {
    this.memoryManager = memoryManager;
  }

  /**
   * 基于记忆构建上下文感知的提示词
   */
  async buildContextAwarePrompt(
    userQuery: string,
    projectContext: any,
    sessionId?: string
  ): Promise<{
    enhancedPrompt: string;
    memoryContext: string;
    searchGuidance: string;
    toolRecommendations: string[];
  }> {
    try {
      const memorySummary = await this.memoryManager.generateMemorySummary(sessionId);
      
      const memoryContext = this.buildMemoryContext(memorySummary);
      const searchGuidance = this.buildSearchGuidance(userQuery, projectContext, memorySummary);
      const toolRecommendations = this.buildToolRecommendations(userQuery, memorySummary);

      const enhancedPrompt = `
# 智能编程助手上下文

## 用户查询
${userQuery}

## 项目技术背景
- 主要语言: ${projectContext.languages?.join(', ') || '未知'}
- 使用框架: ${projectContext.frameworks?.join(', ') || '无'}
- 架构模式: ${projectContext.architecture || '未知'}

${memoryContext}

${searchGuidance}

## 推荐使用的工具
${toolRecommendations.map(tool => `- ${tool}`).join('\n')}

## 指导原则
基于以上上下文信息，请：
1. 使用推荐的搜索策略和工具来获取项目相关信息
2. 参考用户的编程偏好和历史决策
3. 考虑项目的技术特点给出针对性建议
4. 如果有类似的历史解决方案，可以参考借鉴

请现在开始处理用户的查询。
`.trim();

      return {
        enhancedPrompt,
        memoryContext,
        searchGuidance,
        toolRecommendations
      };
    } catch (error) {
      console.error('构建上下文感知提示词失败:', error);
      return {
        enhancedPrompt: userQuery,
        memoryContext: '',
        searchGuidance: '',
        toolRecommendations: []
      };
    }
  }

  private buildMemoryContext(memorySummary: any): string {
    let context = '';

    if (memorySummary.userPreferences && Object.keys(memorySummary.userPreferences).length > 0) {
      context += `\n## 用户编程偏好\n`;
      if (memorySummary.userPreferences.codeStyle) {
        const style = memorySummary.userPreferences.codeStyle;
        context += `- 代码风格: ${style.indentation || '默认'}缩进, ${style.quotes || '默认'}引号\n`;
      }
      if (memorySummary.userPreferences.preferredFrameworks?.length > 0) {
        context += `- 偏好框架: ${memorySummary.userPreferences.preferredFrameworks.join(', ')}\n`;
      }
    }

    if (memorySummary.recentQueries?.length > 0) {
      context += `\n## 最近相关查询\n`;
      memorySummary.recentQueries.forEach((query: string, index: number) => {
        context += `${index + 1}. ${query}\n`;
      });
    }

    if (memorySummary.relevantDecisions?.length > 0) {
      context += `\n## 相关技术决策\n`;
      memorySummary.relevantDecisions.slice(0, 3).forEach((decision: any) => {
        context += `- ${decision.decision}: ${decision.reason}\n`;
      });
    }

    return context;
  }

  private buildSearchGuidance(userQuery: string, projectContext: any, memorySummary: any): string {
    const keywords = this.extractSearchKeywords(userQuery);
    const frameworks = projectContext.frameworks || [];
    
    let guidance = `\n## 搜索策略建议\n`;
    guidance += `### 推荐搜索关键词\n${keywords.join(', ')}\n\n`;
    
    if (frameworks.length > 0) {
      guidance += `### 框架特定搜索\n`;
      frameworks.forEach((framework: string) => {
        guidance += `- 在 ${framework} 相关文件中搜索: ${keywords[0]} ${framework}\n`;
      });
    }

    if (memorySummary.suggestedSearchStrategies?.length > 0) {
      guidance += `\n### 历史有效搜索策略\n`;
      memorySummary.suggestedSearchStrategies.forEach((strategy: string) => {
        guidance += `- ${strategy}\n`;
      });
    }

    return guidance;
  }

  private buildToolRecommendations(userQuery: string, memorySummary: any): string[] {
    const recommendations = [];

    if (userQuery.includes('搜索') || userQuery.includes('查找')) {
      recommendations.push('Grep - 强大的代码搜索工具');
      recommendations.push('Task - 复杂搜索任务代理');
    }

    if (userQuery.includes('文件') || userQuery.includes('配置')) {
      recommendations.push('Read - 读取特定文件内容');
      recommendations.push('Glob - 文件模式匹配');
    }

    if (userQuery.includes('实现') || userQuery.includes('代码')) {
      recommendations.push('Grep - 搜索相关实现');
      recommendations.push('Read - 查看相关代码文件');
    }

    // 如果没有特定推荐，给出通用建议
    if (recommendations.length === 0) {
      recommendations.push('Task - 智能分析用户需求');
      recommendations.push('Grep - 搜索相关代码');
    }

    return recommendations;
  }

  private extractSearchKeywords(query: string): string[] {
    // 简单的关键词提取，实际可以更复杂
    const stopWords = ['如何', '怎么', '什么', '为什么', '是否', '可以', '能够'];
    const words = query.split(/\s+/).filter(word => 
      word.length > 1 && !stopWords.includes(word)
    );
    return words.slice(0, 5);
  }
}