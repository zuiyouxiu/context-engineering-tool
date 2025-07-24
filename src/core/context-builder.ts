// 动态上下文构建器 - 上下文工程的核心实现

import {
  ContextPackage,
  TaskType,
  Priority,
  ProjectContext,
  ConversationHistory,
  UserPreferences,
  KnowledgeItem,
  CodePattern,
  ToolDescriptor,
  ActionRecord,
  ContextQualityAssessment,
  MultiSourceConfig
} from '../types/context-types.js';

export class DynamicContextBuilder {
  private config: MultiSourceConfig;
  private memoryManager: any;
  private multiSourceIntegrator: any;
  private qualityChecker: any;

  constructor(
    config: MultiSourceConfig,
    memoryManager: any,
    multiSourceIntegrator: any,
    qualityChecker: any
  ) {
    this.config = config;
    this.memoryManager = memoryManager;
    this.multiSourceIntegrator = multiSourceIntegrator;
    this.qualityChecker = qualityChecker;
  }

  /**
   * 动态构建任务上下文 - 上下文工程核心方法
   * 实现"上下文工程 = 提示词 + 用户画像 + 记忆 + 检索信息 + RAG信息 + MCP信息"
   */
  async buildContext(
    taskType: TaskType,
    userInput: string,
    priority: Priority = 'medium',
    sessionId: string
  ): Promise<ContextPackage> {
    const startTime = Date.now();
    
    try {
      // 1. 并行收集多源信息（上下文工程的多源特性）
      const [
        projectContext,
        shortTermMemory,
        longTermMemory,
        multiSourceInfo,
        availableTools,
        actionHistory,
        systemInstructions
      ] = await Promise.all([
        this.collectProjectContext(),
        this.memoryManager.getShortTermMemory(sessionId),
        this.memoryManager.getLongTermMemory(),
        this.multiSourceIntegrator.integrateMultiSourceInformation(userInput, taskType),
        this.collectAvailableTools(),
        this.memoryManager.getRecentActions(sessionId),
        this.generateSystemInstructions(taskType, userInput)
      ]);

      // 从多源信息中提取相关知识和模式
      const relevantKnowledge = multiSourceInfo.knowledgeItems || [];
      const relatedPatterns = multiSourceInfo.codePatterns || [];

      // 2. 构建初始上下文包
      const contextPackage: ContextPackage = {
        taskType,
        priority,
        systemInstructions,
        userInput,
        projectContext,
        shortTermMemory,
        longTermMemory,
        relevantKnowledge,
        relatedPatterns,
        availableTools,
        actionHistory,
        completenessScore: 0,
        feasibilityAssessment: '',
        optimizationSuggestions: [],
        timestamp: new Date().toISOString(),
        sessionId
      };

      // 3. 上下文质量评估（确保LLM能在当前上下文下完成任务）
      const qualityAssessment = await this.qualityChecker.assessContextQuality(contextPackage);
      
      contextPackage.completenessScore = qualityAssessment.completenessScore;
      contextPackage.feasibilityAssessment = qualityAssessment.reasoning;
      contextPackage.optimizationSuggestions = qualityAssessment.optimizationSuggestions;

      // 4. 如果质量不足，进行迭代优化
      if (qualityAssessment.completenessScore < 80 || !qualityAssessment.canLLMCompleteTask) {
        return await this.optimizeContext(contextPackage, qualityAssessment);
      }

      // 5. 记录上下文构建过程
      await this.logContextBuilding(contextPackage, startTime);

      return contextPackage;

    } catch (error) {
      console.error('动态上下文构建失败:', error);
      // 降级到基础上下文
      return await this.buildFallbackContext(taskType, userInput, priority, sessionId);
    }
  }

  /**
   * 收集项目上下文信息
   */
  private async collectProjectContext(): Promise<ProjectContext> {
    // 这里会从各种源收集项目信息
    // 实际实现会读取各种项目文件和配置
    return {
      goals: ['待从项目文件中提取'],
      keyFeatures: ['待从项目文件中提取'],
      architecture: '待从项目文件中提取',
      currentFocus: ['待从活跃上下文中提取'],
      recentChanges: ['待从最近变更中提取'],
      openIssues: ['待从问题跟踪中提取'],
      completedTasks: ['待从进度文件中提取'],
      pendingTasks: ['待从进度文件中提取'],
      decisions: [],
      patterns: []
    };
  }

  /**
   * 收集可用工具信息
   */
  private async collectAvailableTools(): Promise<ToolDescriptor[]> {
    return [
      {
        name: 'get-context-info',
        description: '读取并返回所有上下文工程管理文件内容',
        inputSchema: { rootPath: 'string' },
        outputFormat: 'markdown',
        capabilities: ['文件读取', '上下文聚合', '格式化输出'],
        limitations: ['仅读取，不修改文件'],
        recommendedUse: ['会话开始时', '需要完整项目上下文时']
      },
      {
        name: 'update-context-engineering',
        description: '生成详细的上下文工程管理文件更新指导',
        inputSchema: { rootPath: 'string', changeType: 'string', description: 'string' },
        outputFormat: 'markdown',
        capabilities: ['更新指导生成', '变更类型处理', '优先级管理'],
        limitations: ['需要人工执行指导'],
        recommendedUse: ['完成重要变更后', '需要更新文档时']
      },
      {
        name: 'init-context-engineering',
        description: '初始化上下文工程管理目录和核心文件',
        inputSchema: { rootPath: 'string', force: 'boolean' },
        outputFormat: 'status',
        capabilities: ['目录创建', '模板生成', '初始化设置'],
        limitations: ['只能初始化，不能深度定制'],
        recommendedUse: ['新项目开始时', '重新组织项目时']
      }
    ];
  }

  /**
   * 生成系统指令（上下文工程的提示词维度）
   */
  private async generateSystemInstructions(taskType: TaskType, userInput: string): Promise<string[]> {
    const baseInstructions = [
      '你是一个专业的软件开发助手，使用上下文工程方法来提供准确、相关的帮助。',
      '当前上下文包含了项目信息、用户偏好、历史记忆和相关知识，请充分利用这些信息。',
      '在做出决策或建议时，考虑用户的编程风格、项目目标和已有的架构模式。',
      '如果上下文信息不足以完成任务，明确说明需要哪些额外信息。'
    ];

    const taskSpecificInstructions = this.getTaskSpecificInstructions(taskType);
    
    return [...baseInstructions, ...taskSpecificInstructions];
  }

  private getTaskSpecificInstructions(taskType: TaskType): string[] {
    const instructions: Record<TaskType, string[]> = {
      architecture: [
        '关注系统架构的长期影响和可扩展性。',
        '考虑现有架构模式和技术栈的一致性。',
        '评估架构变更对其他组件的影响。'
      ],
      feature: [
        '确保新功能与项目目标和现有功能协调。',
        '考虑用户体验和性能影响。',
        '提供清晰的实现步骤和测试策略。'
      ],
      bugfix: [
        '专注于问题的根本原因，而非症状。',
        '考虑修复对其他功能的潜在影响。',
        '提供预防类似问题的建议。'
      ],
      refactor: [
        '保持功能不变，专注于代码质量提升。',
        '考虑重构对团队协作和维护的影响。',
        '确保重构后的代码遵循项目的编码标准。'
      ],
      decision: [
        '提供详细的决策背景和考虑因素。',
        '分析各选项的利弊和长期影响。',
        '基于项目上下文推荐最佳选择。'
      ],
      progress: [
        '提供准确的进度评估和里程碑跟踪。',
        '识别潜在的阻塞因素和风险。',
        '建议优化工作流程的方法。'
      ],
      general: [
        '根据任务的具体性质调整方法。',
        '保持灵活性，适应各种类型的请求。'
      ]
    };

    return instructions[taskType] || instructions.general;
  }

  /**
   * 优化上下文质量
   */
  private async optimizeContext(
    contextPackage: ContextPackage,
    qualityAssessment: ContextQualityAssessment
  ): Promise<ContextPackage> {
    const optimizedContext = { ...contextPackage };

    // 根据质量评估结果进行优化
    if (qualityAssessment.missingInformation.length > 0) {
      // 尝试获取缺失信息
      for (const missingInfo of qualityAssessment.missingInformation) {
        await this.tryToFillMissingInformation(optimizedContext, missingInfo);
      }
    }

    // 应用优化建议
    for (const suggestion of qualityAssessment.optimizationSuggestions) {
      await this.applySuggestion(optimizedContext, suggestion);
    }

    // 重新评估质量
    const newAssessment = await this.qualityChecker.assessContextQuality(optimizedContext);
    optimizedContext.completenessScore = newAssessment.completenessScore;
    optimizedContext.feasibilityAssessment = newAssessment.reasoning;
    optimizedContext.optimizationSuggestions = newAssessment.optimizationSuggestions;

    return optimizedContext;
  }

  private async tryToFillMissingInformation(context: ContextPackage, missingInfo: string): Promise<void> {
    // 实现具体的信息填充逻辑
    console.log(`尝试填充缺失信息: ${missingInfo}`);
  }

  private async applySuggestion(context: ContextPackage, suggestion: string): Promise<void> {
    // 实现具体的建议应用逻辑
    console.log(`应用优化建议: ${suggestion}`);
  }

  /**
   * 降级上下文构建
   */
  private async buildFallbackContext(
    taskType: TaskType,
    userInput: string,
    priority: Priority,
    sessionId: string
  ): Promise<ContextPackage> {
    return {
      taskType,
      priority,
      systemInstructions: ['基础系统指令'],
      userInput,
      projectContext: {
        goals: [],
        keyFeatures: [],
        architecture: '',
        currentFocus: [],
        recentChanges: [],
        openIssues: [],
        completedTasks: [],
        pendingTasks: [],
        decisions: [],
        patterns: []
      },
      shortTermMemory: [],
      longTermMemory: {} as UserPreferences,
      relevantKnowledge: [],
      relatedPatterns: [],
      availableTools: [],
      actionHistory: [],
      completenessScore: 30,
      feasibilityAssessment: '降级模式：上下文信息有限',
      optimizationSuggestions: ['重新初始化完整上下文'],
      timestamp: new Date().toISOString(),
      sessionId
    };
  }

  /**
   * 记录上下文构建过程
   */
  private async logContextBuilding(contextPackage: ContextPackage, startTime: number): Promise<void> {
    const duration = Date.now() - startTime;
    console.log(`上下文构建完成: ${duration}ms, 质量评分: ${contextPackage.completenessScore}`);
    
    // 记录到操作历史
    const actionRecord: ActionRecord = {
      id: `context-build-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'build-dynamic-context',
      parameters: {
        taskType: contextPackage.taskType,
        priority: contextPackage.priority,
        sessionId: contextPackage.sessionId
      },
      result: {
        completenessScore: contextPackage.completenessScore,
        itemsCount: {
          knowledge: contextPackage.relevantKnowledge.length,
          patterns: contextPackage.relatedPatterns.length,
          tools: contextPackage.availableTools.length
        }
      },
      duration,
      success: true,
      contextImpact: 'Full context package built'
    };

    await this.memoryManager.recordAction(contextPackage.sessionId, actionRecord);
  }

  /**
   * 格式化上下文包用于LLM消费
   */
  formatContextForLLM(contextPackage: ContextPackage): string {
    const sections = [
      '# 动态上下文包',
      `任务类型: ${contextPackage.taskType}`,
      `优先级: ${contextPackage.priority}`,
      `质量评分: ${contextPackage.completenessScore}/100`,
      '',
      '## 系统指令',
      ...contextPackage.systemInstructions.map(inst => `- ${inst}`),
      '',
      '## 用户输入',
      contextPackage.userInput,
      '',
      '## 项目上下文',
      `**目标**: ${contextPackage.projectContext.goals.join(', ')}`,
      `**关键功能**: ${contextPackage.projectContext.keyFeatures.join(', ')}`,
      `**当前关注**: ${contextPackage.projectContext.currentFocus.join(', ')}`,
      '',
      '## 相关知识',
      ...contextPackage.relevantKnowledge.slice(0, 5).map(item => 
        `**${item.title}**: ${item.description}`
      ),
      '',
      '## 可用工具',
      ...contextPackage.availableTools.map(tool => 
        `**${tool.name}**: ${tool.description}`
      ),
      ''
    ];

    if (contextPackage.completenessScore < 80) {
      sections.push(
        '## ⚠️ 上下文质量警告',
        contextPackage.feasibilityAssessment,
        '',
        '**优化建议**:',
        ...contextPackage.optimizationSuggestions.map(s => `- ${s}`),
        ''
      );
    }

    return sections.join('\n');
  }
}