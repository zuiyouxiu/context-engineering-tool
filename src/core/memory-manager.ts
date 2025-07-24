// 记忆管理系统 - 上下文工程的记忆维度实现

import {
  MemoryStore,
  ConversationHistory,
  UserPreferences,
  ActionRecord,
  SessionState,
  LearningMetrics,
  CodingStyle,
  WorkflowPreferences,
  TechnicalPreferences,
  CommunicationStyle,
  MemoryType
} from '../types/context-types.js';
import { promises as fs } from 'fs';
import * as path from 'path';

export class MemoryManager {
  private memoryStore: MemoryStore;
  private memoryPath: string;
  private maxShortTermItems: number = 100;
  private maxConversationHistory: number = 50;

  constructor(projectRoot: string) {
    this.memoryPath = path.join(projectRoot, 'context-engineering', 'memory');
    this.memoryStore = this.initializeMemoryStore();
  }

  /**
   * 初始化记忆存储结构
   */
  private initializeMemoryStore(): MemoryStore {
    return {
      shortTerm: {
        conversations: [],
        recentActions: [],
        sessionState: this.createNewSession(),
        workingContext: {}
      },
      longTerm: {
        userProfile: this.createDefaultUserProfile(),
        projectPatterns: [],
        historicalDecisions: [],
        knowledgeBase: [],
        learningProgress: this.createDefaultLearningMetrics()
      }
    };
  }

  /**
   * 获取短期记忆（当前会话相关）
   */
  async getShortTermMemory(sessionId: string): Promise<ConversationHistory[]> {
    await this.loadMemoryFromDisk();
    
    // 返回当前会话的对话历史
    return this.memoryStore.shortTerm.conversations
      .filter(conv => conv.id.includes(sessionId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, this.maxConversationHistory);
  }

  /**
   * 获取长期记忆（用户偏好和学习进度）
   */
  async getLongTermMemory(): Promise<UserPreferences> {
    await this.loadMemoryFromDisk();
    return this.memoryStore.longTerm.userProfile;
  }

  /**
   * 记录对话历史
   */
  async recordConversation(
    sessionId: string,
    userInput: string,
    aiResponse: string,
    context: any,
    actions: ActionRecord[] = []
  ): Promise<void> {
    const conversation: ConversationHistory = {
      id: `${sessionId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userInput,
      aiResponse,
      context,
      actions,
      outcome: this.extractOutcome(aiResponse, actions)
    };

    this.memoryStore.shortTerm.conversations.push(conversation);
    
    // 限制短期记忆大小
    if (this.memoryStore.shortTerm.conversations.length > this.maxShortTermItems) {
      this.memoryStore.shortTerm.conversations = this.memoryStore.shortTerm.conversations
        .slice(-this.maxShortTermItems);
    }

    // 学习用户模式
    await this.learnFromConversation(conversation);
    
    await this.saveMemoryToDisk();
  }

  /**
   * 记录操作历史
   */
  async recordAction(sessionId: string, action: ActionRecord): Promise<void> {
    action.id = `${sessionId}-action-${Date.now()}`;
    this.memoryStore.shortTerm.recentActions.push(action);
    
    // 限制操作历史大小
    if (this.memoryStore.shortTerm.recentActions.length > this.maxShortTermItems) {
      this.memoryStore.shortTerm.recentActions = this.memoryStore.shortTerm.recentActions
        .slice(-this.maxShortTermItems);
    }

    // 学习操作模式
    await this.learnFromAction(action);
    
    await this.saveMemoryToDisk();
  }

  /**
   * 获取最近操作历史
   */
  async getRecentActions(sessionId: string, limit: number = 10): Promise<ActionRecord[]> {
    await this.loadMemoryFromDisk();
    
    return this.memoryStore.shortTerm.recentActions
      .filter(action => action.id.includes(sessionId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * 更新用户偏好
   */
  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<void> {
    this.memoryStore.longTerm.userProfile = {
      ...this.memoryStore.longTerm.userProfile,
      ...updates
    };
    
    await this.saveMemoryToDisk();
  }

  /**
   * 从对话中学习用户模式
   */
  private async learnFromConversation(conversation: ConversationHistory): Promise<void> {
    const userProfile = this.memoryStore.longTerm.userProfile;
    
    // 分析用户输入模式
    const inputAnalysis = this.analyzeUserInput(conversation.userInput);
    
    // 更新技术偏好
    if (inputAnalysis.mentionedTechnologies.length > 0) {
      inputAnalysis.mentionedTechnologies.forEach(tech => {
        if (!userProfile.technicalPreferences.primaryLanguages.includes(tech)) {
          userProfile.technicalPreferences.primaryLanguages.push(tech);
        }
      });
    }

    // 更新沟通风格偏好
    if (inputAnalysis.isDetailed) {
      userProfile.communicationStyle.responseLength = 'detailed';
      userProfile.communicationStyle.technicalDetail = 'high';
    } else if (inputAnalysis.isBrief) {
      userProfile.communicationStyle.responseLength = 'brief';
    }

    // 更新工作流偏好
    if (inputAnalysis.requiresBreakdown) {
      userProfile.workflowPreferences.taskBreakdownStyle = 'fine-grained';
    }

    // 学习成功模式
    if (conversation.outcome === 'success') {
      const pattern = this.extractSuccessPattern(conversation);
      if (pattern && !userProfile.learningProgress.successPatterns.includes(pattern)) {
        userProfile.learningProgress.successPatterns.push(pattern);
      }
    }
  }

  /**
   * 从操作中学习模式
   */
  private async learnFromAction(action: ActionRecord): Promise<void> {
    const userProfile = this.memoryStore.longTerm.userProfile;
    
    // 学习工具使用偏好
    if (action.success) {
      const toolPattern = `successful_${action.action}`;
      if (!userProfile.learningProgress.successPatterns.includes(toolPattern)) {
        userProfile.learningProgress.successPatterns.push(toolPattern);
      }
    } else {
      const mistakePattern = `failed_${action.action}: ${action.errorMessage}`;
      if (!userProfile.learningProgress.commonMistakes.includes(mistakePattern)) {
        userProfile.learningProgress.commonMistakes.push(mistakePattern);
      }
    }

    // 学习工作流模式
    if (action.duration < 1000) {
      userProfile.workflowPreferences.feedbackFrequency = 'immediate';
    }
  }

  /**
   * 分析用户输入模式
   */
  private analyzeUserInput(input: string): {
    mentionedTechnologies: string[];
    isDetailed: boolean;
    isBrief: boolean;
    requiresBreakdown: boolean;
  } {
    const technologies = ['typescript', 'javascript', 'python', 'react', 'vue', 'node.js', 'express'];
    const mentionedTechnologies = technologies.filter(tech => 
      input.toLowerCase().includes(tech.toLowerCase())
    );

    return {
      mentionedTechnologies,
      isDetailed: input.length > 200 || input.includes('详细') || input.includes('explain'),
      isBrief: input.length < 50 || input.includes('简要') || input.includes('briefly'),
      requiresBreakdown: input.includes('步骤') || input.includes('step') || input.includes('分解')
    };
  }

  /**
   * 提取成功模式
   */
  private extractSuccessPattern(conversation: ConversationHistory): string | null {
    if (conversation.actions.length > 0) {
      const successfulActions = conversation.actions
        .filter(action => action.success)
        .map(action => action.action);
      
      if (successfulActions.length > 0) {
        return `workflow: ${successfulActions.join(' -> ')}`;
      }
    }
    
    return null;
  }

  /**
   * 提取对话结果
   */
  private extractOutcome(aiResponse: string, actions: ActionRecord[]): string {
    if (actions.every(action => action.success)) {
      return 'success';
    } else if (actions.some(action => !action.success)) {
      return 'partial_success';
    } else if (aiResponse.includes('错误') || aiResponse.includes('失败')) {
      return 'failure';
    }
    return 'unknown';
  }

  /**
   * 创建新会话
   */
  private createNewSession(): SessionState {
    return {
      sessionId: `session-${Date.now()}`,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      currentTask: '',
      contextHistory: [],
      userGoals: [],
      activeTools: []
    };
  }

  /**
   * 创建默认用户配置
   */
  private createDefaultUserProfile(): UserPreferences {
    return {
      codingStyle: {
        language: [],
        frameworks: [],
        architecturePatterns: [],
        testingApproach: 'standard',
        documentationLevel: 'standard',
        codeVerbosity: 'standard'
      },
      preferredPatterns: [],
      workflowPreferences: {
        taskBreakdownStyle: 'high-level',
        feedbackFrequency: 'milestone',
        explanationLevel: 'standard',
        reviewProcess: 'hybrid'
      },
      technicalPreferences: {
        primaryLanguages: [],
        frameworks: [],
        tools: [],
        deploymentTargets: [],
        databaseTypes: [],
        testingFrameworks: []
      },
      communicationStyle: {
        responseLength: 'standard',
        technicalDetail: 'medium',
        examplePreference: 'balanced',
        questionHandling: 'guided'
      },
      learningProgress: this.createDefaultLearningMetrics()
    };
  }

  /**
   * 创建默认学习指标
   */
  private createDefaultLearningMetrics(): LearningMetrics {
    return {
      successPatterns: [],
      commonMistakes: [],
      improvementAreas: [],
      masteredConcepts: [],
      currentLearningGoals: []
    };
  }

  /**
   * 从磁盘加载记忆数据（Markdown格式）
   */
  private async loadMemoryFromDisk(): Promise<void> {
    try {
      // 确保目录存在
      await fs.mkdir(this.memoryPath, { recursive: true });

      // 加载短期记忆
      const shortTermPath = path.join(this.memoryPath, 'short-term');
      await this.loadShortTermMemory(shortTermPath);

      // 加载长期记忆
      const longTermPath = path.join(this.memoryPath, 'long-term');
      await this.loadLongTermMemory(longTermPath);

    } catch (error) {
      console.log('记忆数据不存在或损坏，使用默认配置');
    }
  }

  /**
   * 加载短期记忆（Markdown格式）
   */
  private async loadShortTermMemory(shortTermPath: string): Promise<void> {
    try {
      await fs.mkdir(shortTermPath, { recursive: true });

      // 加载对话历史
      const conversationsPath = path.join(shortTermPath, 'conversations.md');
      if (await this.fileExists(conversationsPath)) {
        const data = await fs.readFile(conversationsPath, 'utf-8');
        this.memoryStore.shortTerm.conversations = this.parseConversationsFromMarkdown(data);
      }

      // 加载操作历史
      const actionsPath = path.join(shortTermPath, 'recent-actions.md');
      if (await this.fileExists(actionsPath)) {
        const data = await fs.readFile(actionsPath, 'utf-8');
        this.memoryStore.shortTerm.recentActions = this.parseActionsFromMarkdown(data);
      }

      // 加载会话状态
      const sessionPath = path.join(shortTermPath, 'session-state.md');
      if (await this.fileExists(sessionPath)) {
        const data = await fs.readFile(sessionPath, 'utf-8');
        this.memoryStore.shortTerm.sessionState = this.parseSessionFromMarkdown(data);
      }

    } catch (error) {
      console.log('加载短期记忆失败，使用默认值');
    }
  }

  /**
   * 加载长期记忆（Markdown格式）
   */
  private async loadLongTermMemory(longTermPath: string): Promise<void> {
    try {
      await fs.mkdir(longTermPath, { recursive: true });

      // 加载用户配置
      const profilePath = path.join(longTermPath, 'user-profile.md');
      if (await this.fileExists(profilePath)) {
        const data = await fs.readFile(profilePath, 'utf-8');
        this.memoryStore.longTerm.userProfile = this.parseUserProfileFromMarkdown(data);
      }

      // 加载其他长期记忆数据...

    } catch (error) {
      console.log('加载长期记忆失败，使用默认值');
    }
  }

  /**
   * 保存记忆数据到磁盘（Markdown格式）
   */
  private async saveMemoryToDisk(): Promise<void> {
    try {
      // 确保目录存在
      await fs.mkdir(this.memoryPath, { recursive: true });
      
      // 保存短期记忆
      const shortTermPath = path.join(this.memoryPath, 'short-term');
      await fs.mkdir(shortTermPath, { recursive: true });
      
      await fs.writeFile(
        path.join(shortTermPath, 'conversations.md'),
        this.formatConversationsToMarkdown(this.memoryStore.shortTerm.conversations)
      );
      
      await fs.writeFile(
        path.join(shortTermPath, 'recent-actions.md'),
        this.formatActionsToMarkdown(this.memoryStore.shortTerm.recentActions)
      );
      
      await fs.writeFile(
        path.join(shortTermPath, 'session-state.md'),
        this.formatSessionToMarkdown(this.memoryStore.shortTerm.sessionState)
      );

      // 保存长期记忆
      const longTermPath = path.join(this.memoryPath, 'long-term');
      await fs.mkdir(longTermPath, { recursive: true });
      
      await fs.writeFile(
        path.join(longTermPath, 'user-profile.md'),
        this.formatUserProfileToMarkdown(this.memoryStore.longTerm.userProfile)
      );

    } catch (error) {
      console.error('保存记忆数据失败:', error);
    }
  }

  /**
   * 检查文件是否存在
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 清理过期的短期记忆
   */
  async cleanupShortTermMemory(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    this.memoryStore.shortTerm.conversations = this.memoryStore.shortTerm.conversations
      .filter(conv => new Date(conv.timestamp) > cutoffDate);
    
    this.memoryStore.shortTerm.recentActions = this.memoryStore.shortTerm.recentActions
      .filter(action => new Date(action.timestamp) > cutoffDate);
    
    await this.saveMemoryToDisk();
  }

  /**
   * 导出记忆数据供分析
   */
  async exportMemoryData(): Promise<any> {
    await this.loadMemoryFromDisk();
    return {
      shortTerm: {
        conversationCount: this.memoryStore.shortTerm.conversations.length,
        actionCount: this.memoryStore.shortTerm.recentActions.length,
        recentActivity: this.memoryStore.shortTerm.conversations
          .slice(-5)
          .map(conv => ({
            timestamp: conv.timestamp,
            inputLength: conv.userInput.length,
            outcome: conv.outcome
          }))
      },
      longTerm: {
        userProfile: this.memoryStore.longTerm.userProfile,
        learningProgress: this.memoryStore.longTerm.learningProgress
      }
    };
  }

  // ====== Markdown 格式化和解析方法 ======

  /**
   * 将对话历史格式化为Markdown
   */
  private formatConversationsToMarkdown(conversations: ConversationHistory[]): string {
    let markdown = `# 对话历史记录\n\n`;
    markdown += `*上次更新: ${new Date().toLocaleString()}*\n\n`;
    
    if (conversations.length === 0) {
      markdown += `暂无对话记录。\n`;
      return markdown;
    }

    conversations.forEach(conv => {
      markdown += `## 对话 ${conv.id}\n\n`;
      markdown += `**时间**: ${new Date(conv.timestamp).toLocaleString()}\n\n`;
      markdown += `**用户输入**:\n${conv.userInput}\n\n`;
      markdown += `**AI回应**:\n${conv.aiResponse}\n\n`;
      markdown += `**结果**: ${conv.outcome}\n\n`;
      
      if (conv.actions.length > 0) {
        markdown += `**相关操作**:\n`;
        conv.actions.forEach(action => {
          markdown += `- ${action.action}: ${action.success ? '✅' : '❌'}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `**上下文**: \`${JSON.stringify(conv.context)}\`\n\n`;
      markdown += `---\n\n`;
    });

    return markdown;
  }

  /**
   * 将操作历史格式化为Markdown
   */
  private formatActionsToMarkdown(actions: ActionRecord[]): string {
    let markdown = `# 最近操作记录\n\n`;
    markdown += `*上次更新: ${new Date().toLocaleString()}*\n\n`;
    
    if (actions.length === 0) {
      markdown += `暂无操作记录。\n`;
      return markdown;
    }

    markdown += `| 时间 | 操作 | 状态 | 耗时 | 描述 |\n`;
    markdown += `|------|------|------|------|------|\n`;
    
    actions.forEach(action => {
      const status = action.success ? '✅ 成功' : '❌ 失败';
      const time = new Date(action.timestamp).toLocaleTimeString();
      const duration = `${action.duration}ms`;
      const description = action.contextImpact || '-';
      
      markdown += `| ${time} | ${action.action} | ${status} | ${duration} | ${description} |\n`;
    });

    markdown += `\n## 操作详情\n\n`;
    
    actions.slice(-10).forEach(action => {
      markdown += `### ${action.action} - ${new Date(action.timestamp).toLocaleString()}\n\n`;
      markdown += `- **参数**: \`${JSON.stringify(action.parameters)}\`\n`;
      markdown += `- **结果**: \`${JSON.stringify(action.result)}\`\n`;
      if (!action.success && action.errorMessage) {
        markdown += `- **错误**: ${action.errorMessage}\n`;
      }
      markdown += `- **上下文影响**: ${action.contextImpact}\n\n`;
    });

    return markdown;
  }

  /**
   * 将会话状态格式化为Markdown
   */
  private formatSessionToMarkdown(session: SessionState): string {
    let markdown = `# 当前会话状态\n\n`;
    markdown += `*上次更新: ${new Date().toLocaleString()}*\n\n`;
    
    markdown += `## 基本信息\n\n`;
    markdown += `- **会话ID**: ${session.sessionId}\n`;
    markdown += `- **开始时间**: ${new Date(session.startTime).toLocaleString()}\n`;
    markdown += `- **最后活动**: ${new Date(session.lastActivity).toLocaleString()}\n`;
    markdown += `- **当前任务**: ${session.currentTask || '无'}\n\n`;
    
    if (session.userGoals.length > 0) {
      markdown += `## 用户目标\n\n`;
      session.userGoals.forEach(goal => {
        markdown += `- ${goal}\n`;
      });
      markdown += `\n`;
    }
    
    if (session.activeTools.length > 0) {
      markdown += `## 活跃工具\n\n`;
      session.activeTools.forEach(tool => {
        markdown += `- ${tool}\n`;
      });
      markdown += `\n`;
    }
    
    if (session.contextHistory.length > 0) {
      markdown += `## 上下文历史\n\n`;
      session.contextHistory.forEach((context, index) => {
        markdown += `${index + 1}. ${context}\n`;
      });
      markdown += `\n`;
    }

    return markdown;
  }

  /**
   * 将用户配置格式化为Markdown
   */
  private formatUserProfileToMarkdown(profile: UserPreferences): string {
    let markdown = `# 用户偏好配置\n\n`;
    markdown += `*上次更新: ${new Date().toLocaleString()}*\n\n`;
    
    markdown += `## 编程风格偏好\n\n`;
    markdown += `- **主要语言**: ${profile.codingStyle.language.join(', ') || '未设置'}\n`;
    markdown += `- **框架**: ${profile.codingStyle.frameworks.join(', ') || '未设置'}\n`;
    markdown += `- **架构模式**: ${profile.codingStyle.architecturePatterns.join(', ') || '未设置'}\n`;
    markdown += `- **测试方法**: ${profile.codingStyle.testingApproach}\n`;
    markdown += `- **文档级别**: ${profile.codingStyle.documentationLevel}\n`;
    markdown += `- **代码详细度**: ${profile.codingStyle.codeVerbosity}\n\n`;
    
    markdown += `## 工作流偏好\n\n`;
    markdown += `- **任务分解风格**: ${profile.workflowPreferences.taskBreakdownStyle}\n`;
    markdown += `- **反馈频率**: ${profile.workflowPreferences.feedbackFrequency}\n`;
    markdown += `- **解释级别**: ${profile.workflowPreferences.explanationLevel}\n`;
    markdown += `- **审查过程**: ${profile.workflowPreferences.reviewProcess}\n\n`;
    
    markdown += `## 技术偏好\n\n`;
    markdown += `- **主要语言**: ${profile.technicalPreferences.primaryLanguages.join(', ') || '未设置'}\n`;
    markdown += `- **框架**: ${profile.technicalPreferences.frameworks.join(', ') || '未设置'}\n`;
    markdown += `- **工具**: ${profile.technicalPreferences.tools.join(', ') || '未设置'}\n`;
    markdown += `- **部署目标**: ${profile.technicalPreferences.deploymentTargets.join(', ') || '未设置'}\n`;
    markdown += `- **数据库类型**: ${profile.technicalPreferences.databaseTypes.join(', ') || '未设置'}\n`;
    markdown += `- **测试框架**: ${profile.technicalPreferences.testingFrameworks.join(', ') || '未设置'}\n\n`;
    
    markdown += `## 沟通风格\n\n`;
    markdown += `- **回复长度**: ${profile.communicationStyle.responseLength}\n`;
    markdown += `- **技术细节**: ${profile.communicationStyle.technicalDetail}\n`;
    markdown += `- **示例偏好**: ${profile.communicationStyle.examplePreference}\n`;
    markdown += `- **问题处理**: ${profile.communicationStyle.questionHandling}\n\n`;
    
    markdown += `## 学习进度\n\n`;
    
    if (profile.learningProgress.successPatterns.length > 0) {
      markdown += `### 成功模式\n\n`;
      profile.learningProgress.successPatterns.forEach(pattern => {
        markdown += `- ${pattern}\n`;
      });
      markdown += `\n`;
    }
    
    if (profile.learningProgress.commonMistakes.length > 0) {
      markdown += `### 常见错误\n\n`;
      profile.learningProgress.commonMistakes.forEach(mistake => {
        markdown += `- ${mistake}\n`;
      });
      markdown += `\n`;
    }
    
    if (profile.learningProgress.masteredConcepts.length > 0) {
      markdown += `### 已掌握概念\n\n`;
      profile.learningProgress.masteredConcepts.forEach(concept => {
        markdown += `- ${concept}\n`;
      });
      markdown += `\n`;
    }
    
    if (profile.learningProgress.currentLearningGoals.length > 0) {
      markdown += `### 当前学习目标\n\n`;
      profile.learningProgress.currentLearningGoals.forEach(goal => {
        markdown += `- ${goal}\n`;
      });
      markdown += `\n`;
    }

    return markdown;
  }

  /**
   * 从Markdown解析对话历史
   */
  private parseConversationsFromMarkdown(markdown: string): ConversationHistory[] {
    // 简化的解析实现 - 实际使用中可以使用更复杂的Markdown解析器
    const conversations: ConversationHistory[] = [];
    
    // 基本的正则表达式解析
    const conversationBlocks = markdown.split('## 对话 ');
    
    for (const block of conversationBlocks.slice(1)) {
      try {
        const lines = block.split('\n');
        const id = lines[0];
        
        // 提取基本信息
        const timeMatch = block.match(/\\*\\*时间\\*\\*: (.+)/);
        const userInputMatch = block.match(/\\*\\*用户输入\\*\\*:\\n(.+?)\\n\\n\\*\\*AI回应\\*\\*/s);
        const aiResponseMatch = block.match(/\\*\\*AI回应\\*\\*:\\n(.+?)\\n\\n\\*\\*结果\\*\\*/s);
        const outcomeMatch = block.match(/\\*\\*结果\\*\\*: (.+)/);
        
        if (timeMatch && userInputMatch && aiResponseMatch && outcomeMatch) {
          conversations.push({
            id,
            timestamp: new Date(timeMatch[1]).toISOString(),
            userInput: userInputMatch[1],
            aiResponse: aiResponseMatch[1],
            context: {},
            actions: [],
            outcome: outcomeMatch[1]
          });
        }
      } catch (error) {
        console.log('解析对话记录时出错:', error);
      }
    }
    
    return conversations;
  }

  /**
   * 从Markdown解析操作历史
   */
  private parseActionsFromMarkdown(markdown: string): ActionRecord[] {
    const actions: ActionRecord[] = [];
    
    // 简化解析 - 从表格中提取基本信息
    const tableMatch = markdown.match(/\\| 时间 \\| 操作 \\| 状态 \\| 耗时 \\| 描述 \\|[\\s\\S]*?\\n\\n/);
    if (tableMatch) {
      const rows = tableMatch[0].split('\n').slice(2, -2);
      
      for (const row of rows) {
        const columns = row.split('|').map(col => col.trim());
        if (columns.length >= 6) {
          try {
            actions.push({
              id: `action-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(), // 简化处理
              action: columns[2],
              parameters: {},
              result: {},
              duration: parseInt(columns[4].replace('ms', '')) || 0,
              success: columns[3].includes('✅'),
              contextImpact: columns[5]
            });
          } catch (error) {
            console.log('解析操作记录时出错:', error);
          }
        }
      }
    }
    
    return actions;
  }

  /**
   * 从Markdown解析会话状态
   */
  private parseSessionFromMarkdown(markdown: string): SessionState {
    // 提取基本信息
    const sessionIdMatch = markdown.match(/- \\*\\*会话ID\\*\\*: (.+)/);
    const startTimeMatch = markdown.match(/- \\*\\*开始时间\\*\\*: (.+)/);
    const lastActivityMatch = markdown.match(/- \\*\\*最后活动\\*\\*: (.+)/);
    const currentTaskMatch = markdown.match(/- \\*\\*当前任务\\*\\*: (.+)/);
    
    return {
      sessionId: sessionIdMatch ? sessionIdMatch[1] : `session-${Date.now()}`,
      startTime: startTimeMatch ? new Date(startTimeMatch[1]).toISOString() : new Date().toISOString(),
      lastActivity: lastActivityMatch ? new Date(lastActivityMatch[1]).toISOString() : new Date().toISOString(),
      currentTask: currentTaskMatch ? currentTaskMatch[1] : '',
      contextHistory: [],
      userGoals: [],
      activeTools: []
    };
  }

  /**
   * 从Markdown解析用户配置
   */
  private parseUserProfileFromMarkdown(markdown: string): UserPreferences {
    // 创建默认配置
    const profile = this.createDefaultUserProfile();
    
    // 简化解析 - 提取主要语言等信息
    const primaryLangMatch = markdown.match(/- \\*\\*主要语言\\*\\*: (.+)/);
    if (primaryLangMatch && primaryLangMatch[1] !== '未设置') {
      profile.technicalPreferences.primaryLanguages = primaryLangMatch[1]
        .split(',')
        .map(lang => lang.trim())
        .filter(lang => lang);
    }
    
    // 更多解析逻辑可以在此添加...
    
    return profile;
  }
}