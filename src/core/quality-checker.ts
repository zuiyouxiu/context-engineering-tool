// 上下文质量检查器 - 确保LLM能在当前上下文下完成任务

import {
  ContextPackage,
  ContextQualityAssessment,
  TaskType
} from '../types/context-types.js';

export class ContextQualityChecker {
  
  /**
   * 评估上下文质量 - 上下文工程的核心质量保证
   * 实现"以当前提供的上下文，LLM真的能合理地完成任务吗？"的反复确认
   */
  async assessContextQuality(contextPackage: ContextPackage): Promise<ContextQualityAssessment> {
    const assessments = await Promise.all([
      this.assessCompleteness(contextPackage),
      this.assessFeasibility(contextPackage),
      this.assessClarity(contextPackage)
    ]);

    const [completenessScore, feasibilityScore, clarityScore] = assessments.map(a => a.score);
    const overallScore = this.calculateOverallScore(completenessScore, feasibilityScore, clarityScore);

    const missingInformation = this.identifyMissingInformation(contextPackage);
    const potentialIssues = this.identifyPotentialIssues(contextPackage);
    const optimizationSuggestions = this.generateOptimizationSuggestions(
      contextPackage,
      missingInformation,
      potentialIssues
    );

    const canLLMCompleteTask = this.evaluateTaskCompletability(
      contextPackage,
      overallScore,
      missingInformation
    );

    const confidenceLevel = this.determineConfidenceLevel(overallScore, missingInformation.length);
    
    const reasoning = this.generateReasoningExplanation(
      contextPackage,
      assessments,
      canLLMCompleteTask
    );

    return {
      completenessScore,
      feasibilityScore,
      clarityScore,
      overallScore,
      missingInformation,
      potentialIssues,
      optimizationSuggestions,
      confidenceLevel,
      canLLMCompleteTask,
      reasoning
    };
  }

  /**
   * 评估上下文完整性
   */
  private async assessCompleteness(contextPackage: ContextPackage): Promise<{
    score: number;
    details: string[];
  }> {
    const requiredElements = this.getRequiredElementsForTask(contextPackage.taskType);
    let score = 0;
    const details: string[] = [];

    // 检查系统指令完整性
    if (contextPackage.systemInstructions.length > 0) {
      score += 15;
      details.push('✓ 系统指令已提供');
    } else {
      details.push('✗ 缺少系统指令');
    }

    // 检查用户输入清晰度
    if (contextPackage.userInput.trim().length > 10) {
      score += 20;
      details.push('✓ 用户输入明确');
    } else {
      details.push('✗ 用户输入过于简短或不明确');
    }

    // 检查项目上下文
    const projectContextScore = this.assessProjectContextCompleteness(contextPackage.projectContext);
    score += Math.min(projectContextScore, 25);
    if (projectContextScore > 15) {
      details.push('✓ 项目上下文充分');
    } else {
      details.push('✗ 项目上下文信息不足');
    }

    // 检查相关知识
    if (contextPackage.relevantKnowledge.length > 0) {
      score += 15;
      details.push(`✓ 提供了 ${contextPackage.relevantKnowledge.length} 个相关知识项`);
    } else {
      details.push('✗ 缺少相关知识和参考信息');
    }

    // 检查可用工具
    if (contextPackage.availableTools.length > 0) {
      score += 15;
      details.push(`✓ 提供了 ${contextPackage.availableTools.length} 个可用工具`);
    } else {
      details.push('✗ 缺少工具支持');
    }

    // 检查任务特定要求
    const taskSpecificScore = this.assessTaskSpecificRequirements(contextPackage);
    score += Math.min(taskSpecificScore, 10);

    return { score: Math.min(score, 100), details };
  }

  /**
   * 评估任务可行性
   */
  private async assessFeasibility(contextPackage: ContextPackage): Promise<{
    score: number;
    details: string[];
  }> {
    let score = 0;
    const details: string[] = [];

    // 检查任务复杂度与上下文匹配度
    const taskComplexity = this.assessTaskComplexity(contextPackage.taskType, contextPackage.userInput);
    const contextSupport = this.assessContextSupport(contextPackage);
    
    if (contextSupport >= taskComplexity) {
      score += 40;
      details.push('✓ 上下文支持度与任务复杂度匹配');
    } else {
      score += Math.max(0, 40 - (taskComplexity - contextSupport) * 10);
      details.push('⚠ 任务复杂度可能超出当前上下文支持度');
    }

    // 检查工具可用性
    const requiredTools = this.identifyRequiredTools(contextPackage.taskType, contextPackage.userInput);
    const availableToolNames = contextPackage.availableTools.map(tool => tool.name);
    const toolCoverage = requiredTools.filter(tool => availableToolNames.includes(tool)).length / requiredTools.length;
    
    score += toolCoverage * 30;
    if (toolCoverage > 0.8) {
      details.push('✓ 所需工具基本齐全');
    } else {
      details.push(`⚠ 工具覆盖率较低 (${Math.round(toolCoverage * 100)}%)`);
    }

    // 检查依赖信息可用性
    const dependencyScore = this.assessDependencyInformation(contextPackage);
    score += dependencyScore * 0.3;

    return { score: Math.min(score, 100), details };
  }

  /**
   * 评估上下文清晰度
   */
  private async assessClarity(contextPackage: ContextPackage): Promise<{
    score: number;
    details: string[];
  }> {
    let score = 0;
    const details: string[] = [];

    // 检查指令清晰度
    const instructionClarity = this.assessInstructionClarity(contextPackage.systemInstructions);
    score += instructionClarity * 0.3;
    if (instructionClarity > 70) {
      details.push('✓ 系统指令清晰明确');
    } else {
      details.push('⚠ 系统指令可能存在歧义');
    }

    // 检查用户意图明确性
    const intentClarity = this.assessUserIntentClarity(contextPackage.userInput);
    score += intentClarity * 0.4;
    if (intentClarity > 70) {
      details.push('✓ 用户意图明确');
    } else {
      details.push('⚠ 用户意图不够明确');
    }

    // 检查信息一致性
    const consistencyScore = this.assessInformationConsistency(contextPackage);
    score += consistencyScore * 0.3;
    if (consistencyScore > 70) {
      details.push('✓ 上下文信息一致');
    } else {
      details.push('⚠ 上下文信息存在不一致');
    }

    return { score: Math.min(score, 100), details };
  }

  /**
   * 识别缺失信息
   */
  private identifyMissingInformation(contextPackage: ContextPackage): string[] {
    const missing: string[] = [];

    // 基于任务类型检查必需信息
    const requiredInfo = this.getRequiredInformationForTask(contextPackage.taskType);
    
    requiredInfo.forEach(info => {
      if (!this.hasInformation(contextPackage, info)) {
        missing.push(info);
      }
    });

    // 通用缺失检查
    if (contextPackage.projectContext.goals.length === 0) {
      missing.push('项目目标和价值主张');
    }

    if (contextPackage.projectContext.architecture === '') {
      missing.push('技术架构和技术栈信息');
    }

    if (contextPackage.relevantKnowledge.length === 0) {
      missing.push('相关技术文档或最佳实践');
    }

    if (contextPackage.shortTermMemory.length === 0) {
      missing.push('历史上下文和对话记录');
    }

    return missing;
  }

  /**
   * 识别潜在问题
   */
  private identifyPotentialIssues(contextPackage: ContextPackage): string[] {
    const issues: string[] = [];

    // 检查信息过载
    const totalInfoItems = 
      contextPackage.relevantKnowledge.length +
      contextPackage.relatedPatterns.length +
      contextPackage.shortTermMemory.length;

    if (totalInfoItems > 50) {
      issues.push('信息过载：上下文包含过多信息，可能影响LLM性能');
    }

    // 检查信息时效性
    const hasStaleInfo = this.checkForStaleInformation(contextPackage);
    if (hasStaleInfo) {
      issues.push('信息时效性问题：部分信息可能已过时');
    }

    // 检查任务复杂度不匹配
    const taskComplexity = this.assessTaskComplexity(contextPackage.taskType, contextPackage.userInput);
    if (taskComplexity > 8 && contextPackage.relevantKnowledge.length < 3) {
      issues.push('任务复杂度与支持信息不匹配：复杂任务需要更多参考信息');
    }

    // 检查工具能力不足
    const requiredCapabilities = this.identifyRequiredCapabilities(contextPackage);
    const availableCapabilities = this.extractAvailableCapabilities(contextPackage);
    const missingCapabilities = requiredCapabilities.filter(cap => !availableCapabilities.includes(cap));
    
    if (missingCapabilities.length > 0) {
      issues.push(`缺少必要能力：${missingCapabilities.join(', ')}`);
    }

    return issues;
  }

  /**
   * 生成优化建议
   */
  private generateOptimizationSuggestions(
    contextPackage: ContextPackage,
    missingInfo: string[],
    issues: string[]
  ): string[] {
    const suggestions: string[] = [];

    // 基于缺失信息的建议
    missingInfo.forEach(missing => {
      suggestions.push(`补充${missing}以提高上下文完整性`);
    });

    // 基于问题的建议
    if (issues.some(issue => issue.includes('信息过载'))) {
      suggestions.push('精简上下文信息，保留最相关的内容');
    }

    if (issues.some(issue => issue.includes('时效性'))) {
      suggestions.push('更新过时信息，确保信息的时效性');
    }

    // 基于任务类型的特定建议
    const taskSpecificSuggestions = this.getTaskSpecificOptimizations(contextPackage);
    suggestions.push(...taskSpecificSuggestions);

    // 基于质量评分的建议
    if (contextPackage.relevantKnowledge.length === 0) {
      suggestions.push('通过网络搜索或文档查询获取相关技术信息');
    }

    if (contextPackage.shortTermMemory.length === 0) {
      suggestions.push('建立对话历史记录以维持上下文连续性');
    }

    return [...new Set(suggestions)]; // 去重
  }

  /**
   * 评估任务可完成性
   */
  private evaluateTaskCompletability(
    contextPackage: ContextPackage,
    overallScore: number,
    missingInfo: string[]
  ): boolean {
    // 基础质量要求
    if (overallScore < 60) {
      return false;
    }

    // 关键信息缺失检查
    const criticalMissing = [
      '用户明确需求',
      '基本技术栈信息',
      '必要工具支持'
    ];

    const hasCriticalMissing = criticalMissing.some(critical => 
      missingInfo.some(missing => missing.includes(critical))
    );

    if (hasCriticalMissing) {
      return false;
    }

    // 任务复杂度检查
    const taskComplexity = this.assessTaskComplexity(contextPackage.taskType, contextPackage.userInput);
    const contextSupport = this.assessContextSupport(contextPackage);

    return contextSupport >= (taskComplexity * 0.7);
  }

  /**
   * 确定置信度等级
   */
  private determineConfidenceLevel(
    overallScore: number,
    missingInfoCount: number
  ): 'low' | 'medium' | 'high' {
    if (overallScore >= 85 && missingInfoCount <= 1) {
      return 'high';
    } else if (overallScore >= 70 && missingInfoCount <= 3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 生成推理解释
   */
  private generateReasoningExplanation(
    contextPackage: ContextPackage,
    assessments: Array<{ score: number; details: string[] }>,
    canComplete: boolean
  ): string {
    const [completeness, feasibility, clarity] = assessments;
    
    let reasoning = `上下文质量评估结果：\n`;
    reasoning += `- 完整性：${completeness.score}/100\n`;
    reasoning += `- 可行性：${feasibility.score}/100\n`;
    reasoning += `- 清晰度：${clarity.score}/100\n\n`;

    if (canComplete) {
      reasoning += `✅ 判断：LLM能够在当前上下文下合理完成任务\n\n`;
      reasoning += `主要优势：\n`;
      
      assessments.forEach(assessment => {
        assessment.details
          .filter(detail => detail.startsWith('✓'))
          .forEach(detail => reasoning += `${detail}\n`);
      });
    } else {
      reasoning += `❌ 判断：当前上下文不足以支持LLM完成任务\n\n`;
      reasoning += `主要问题：\n`;
      
      assessments.forEach(assessment => {
        assessment.details
          .filter(detail => detail.startsWith('✗') || detail.startsWith('⚠'))
          .forEach(detail => reasoning += `${detail}\n`);
      });
    }

    return reasoning;
  }

  // 辅助方法

  private calculateOverallScore(
    completeness: number,
    feasibility: number,
    clarity: number
  ): number {
    // 加权平均，完整性权重最高
    return Math.round(completeness * 0.4 + feasibility * 0.35 + clarity * 0.25);
  }

  private getRequiredElementsForTask(taskType: TaskType): string[] {
    const baseElements = ['系统指令', '用户输入', '项目上下文'];
    
    const taskSpecificElements: Record<TaskType, string[]> = {
      architecture: [...baseElements, '架构决策历史', '技术栈信息'],
      feature: [...baseElements, '功能规格', '用户需求', '测试策略'],
      bugfix: [...baseElements, '错误描述', '重现步骤', '相关代码'],
      refactor: [...baseElements, '重构目标', '现有代码结构', '约束条件'],
      decision: [...baseElements, '决策背景', '可选方案', '评估标准'],
      progress: [...baseElements, '当前状态', '目标里程碑', '任务清单'],
      general: baseElements
    };

    return taskSpecificElements[taskType] || baseElements;
  }

  private assessProjectContextCompleteness(projectContext: any): number {
    let score = 0;
    
    if (projectContext.goals?.length > 0) score += 5;
    if (projectContext.keyFeatures?.length > 0) score += 5;
    if (projectContext.architecture) score += 5;
    if (projectContext.currentFocus?.length > 0) score += 3;
    if (projectContext.recentChanges?.length > 0) score += 3;
    if (projectContext.decisions?.length > 0) score += 2;
    if (projectContext.patterns?.length > 0) score += 2;

    return score;
  }

  private assessTaskSpecificRequirements(contextPackage: ContextPackage): number {
    // 根据任务类型评估特定要求的满足情况
    // 这里简化实现
    return 8;
  }

  private assessTaskComplexity(taskType: TaskType, userInput: string): number {
    const baseComplexity: Record<TaskType, number> = {
      architecture: 9,
      feature: 7,
      decision: 6,
      refactor: 5,
      bugfix: 4,
      progress: 3,
      general: 5
    };

    let complexity = baseComplexity[taskType] || 5;
    
    // 基于用户输入调整复杂度
    if (userInput.length > 200) complexity += 1;
    if (userInput.includes('复杂') || userInput.includes('困难')) complexity += 1;
    if (userInput.includes('简单') || userInput.includes('基础')) complexity -= 1;

    return Math.max(1, Math.min(10, complexity));
  }

  private assessContextSupport(contextPackage: ContextPackage): number {
    let support = 0;
    
    support += Math.min(contextPackage.relevantKnowledge.length, 5);
    support += Math.min(contextPackage.availableTools.length, 3);
    support += Math.min(contextPackage.shortTermMemory.length / 2, 2);
    
    return Math.min(10, support);
  }

  private identifyRequiredTools(taskType: TaskType, userInput: string): string[] {
    const baseTools: Record<TaskType, string[]> = {
      architecture: ['get-context-info', 'update-context-engineering'],
      feature: ['get-context-info', 'update-context-engineering'],
      bugfix: ['get-context-info'],
      refactor: ['get-context-info', 'update-context-engineering'],
      decision: ['update-context-engineering'],
      progress: ['get-context-info', 'update-context-engineering'],
      general: ['get-context-info']
    };

    return baseTools[taskType] || ['get-context-info'];
  }

  private assessDependencyInformation(contextPackage: ContextPackage): number {
    // 评估依赖信息的可用性
    return 70; // 简化实现
  }

  private assessInstructionClarity(instructions: string[]): number {
    if (instructions.length === 0) return 0;
    
    // 简单的清晰度评估
    let clarity = 0;
    instructions.forEach(instruction => {
      if (instruction.length > 20 && instruction.length < 200) clarity += 20;
      if (instruction.includes('具体') || instruction.includes('明确')) clarity += 10;
    });

    return Math.min(100, clarity);
  }

  private assessUserIntentClarity(userInput: string): number {
    let clarity = 50; // 基础分

    // 长度合适
    if (userInput.length > 20 && userInput.length < 500) clarity += 20;
    
    // 包含明确动词
    const actionWords = ['创建', '修复', '优化', '实现', '设计', '分析'];
    if (actionWords.some(word => userInput.includes(word))) clarity += 15;
    
    // 包含具体细节
    if (userInput.includes('具体') || userInput.includes('详细')) clarity += 15;

    return Math.min(100, clarity);
  }

  private assessInformationConsistency(contextPackage: ContextPackage): number {
    // 评估信息一致性
    return 80; // 简化实现
  }

  private getRequiredInformationForTask(taskType: TaskType): string[] {
    const requirements: Record<TaskType, string[]> = {
      architecture: ['技术栈', '架构模式', '性能要求', '扩展性考虑'],
      feature: ['功能需求', '用户故事', '验收标准', '技术实现'],
      bugfix: ['错误现象', '预期行为', '环境信息', '重现步骤'],
      refactor: ['重构目标', '现有问题', '约束条件', '成功标准'],
      decision: ['决策背景', '可选方案', '评估标准', '影响分析'],
      progress: ['当前状态', '目标设定', '时间计划', '资源分配'],
      general: ['基本需求', '上下文信息']
    };

    return requirements[taskType] || requirements.general;
  }

  private hasInformation(contextPackage: ContextPackage, infoType: string): boolean {
    // 检查是否包含特定类型的信息
    const allText = [
      contextPackage.userInput,
      contextPackage.projectContext.architecture,
      ...contextPackage.projectContext.goals,
      ...contextPackage.relevantKnowledge.map(k => k.content)
    ].join(' ').toLowerCase();

    return allText.includes(infoType.toLowerCase());
  }

  private checkForStaleInformation(contextPackage: ContextPackage): boolean {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    return contextPackage.shortTermMemory.some(memory => 
      new Date(memory.timestamp).getTime() < oneWeekAgo
    );
  }

  private identifyRequiredCapabilities(contextPackage: ContextPackage): string[] {
    const capabilities = ['文件读写', '代码分析'];
    
    if (contextPackage.userInput.includes('网络') || contextPackage.userInput.includes('API')) {
      capabilities.push('网络访问');
    }
    
    if (contextPackage.userInput.includes('数据库')) {
      capabilities.push('数据库操作');
    }

    return capabilities;
  }

  private extractAvailableCapabilities(contextPackage: ContextPackage): string[] {
    return contextPackage.availableTools.flatMap(tool => tool.capabilities);
  }

  private getTaskSpecificOptimizations(contextPackage: ContextPackage): string[] {
    const suggestions: string[] = [];
    
    switch (contextPackage.taskType) {
      case 'architecture':
        suggestions.push('收集更多架构决策历史和技术选型信息');
        break;
      case 'feature':
        suggestions.push('明确功能需求和验收标准');
        break;
      case 'bugfix':
        suggestions.push('收集错误日志和重现步骤');
        break;
    }

    return suggestions;
  }
}