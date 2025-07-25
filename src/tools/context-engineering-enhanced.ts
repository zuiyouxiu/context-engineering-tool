// 上下文工程增强版实现 - 基于文章理念的四大支柱优化
// 解决"大海捞针"、"上下文污染"、"工具过载"三大挑战

import { promises as fs } from 'fs';
import * as path from 'path';
import { MemoryManager } from './memory-management.js';
import { ProjectContextAnalyzer } from './context-analysis-tools.js';

/**
 * 增强版RAG系统 - 解决"大海捞针"问题
 */
export class EnhancedRAGSystem {
  private projectRoot: string;
  private memoryManager: MemoryManager;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.memoryManager = new MemoryManager(projectRoot);
  }

  /**
   * 分层检索 - 解决长上下文性能衰减
   */
  async performLayeredRetrieval(query: string, maxTokens: number = 8000): Promise<{
    relevantChunks: Array<{
      content: string;
      source: string;
      relevanceScore: number;
      importance: 'high' | 'medium' | 'low';
    }>;
    searchStrategy: string;
    tokenUsage: number;
  }> {
    const chunks: any[] = [];
    let tokenCount = 0;

    // 第一层：高重要性信息（核心配置、主要API）
    const coreFiles = await this.identifyCoreFiles();
    for (const file of coreFiles) {
      if (tokenCount > maxTokens * 0.4) break;
      
      const content = await this.extractRelevantContent(file, query);
      if (content.relevanceScore > 0.8) {
        chunks.push({
          content: content.text,
          source: file,
          relevanceScore: content.relevanceScore,
          importance: 'high' as const
        });
        tokenCount += this.estimateTokens(content.text);
      }
    }

    // 第二层：中等重要性（实现细节、测试文件）
    const implementationFiles = await this.findImplementationFiles(query);
    for (const file of implementationFiles) {
      if (tokenCount > maxTokens * 0.7) break;
      
      const content = await this.extractRelevantContent(file, query);
      if (content.relevanceScore > 0.6) {
        chunks.push({
          content: content.text,
          source: file,
          relevanceScore: content.relevanceScore,
          importance: 'medium' as const
        });
        tokenCount += this.estimateTokens(content.text);
      }
    }

    // 第三层：补充信息（文档、注释）
    const remainingSpace = maxTokens - tokenCount;
    if (remainingSpace > 1000) {
      const docFiles = await this.findDocumentationFiles(query);
      for (const file of docFiles) {
        if (tokenCount > maxTokens * 0.9) break;
        
        const content = await this.extractRelevantContent(file, query);
        if (content.relevanceScore > 0.4) {
          chunks.push({
            content: content.text,
            source: file,
            relevanceScore: content.relevanceScore,
            importance: 'low' as const
          });
          tokenCount += this.estimateTokens(content.text);
        }
      }
    }

    // 按重要性和相关性排序
    chunks.sort((a, b) => {
      const importanceWeight = { high: 3, medium: 2, low: 1 };
      const scoreA = a.relevanceScore * importanceWeight[a.importance];
      const scoreB = b.relevanceScore * importanceWeight[b.importance];
      return scoreB - scoreA;
    });

    return {
      relevantChunks: chunks,
      searchStrategy: this.generateSearchStrategy(query, chunks),
      tokenUsage: tokenCount
    };
  }

  /**
   * 动态知识源连接
   */
  async connectDynamicKnowledgeSources(query: string): Promise<{
    internalKnowledge: any[];
    externalReferences: string[];
    knowledgeGaps: string[];
  }> {
    const internalKnowledge = [];
    const externalReferences = [];
    const knowledgeGaps = [];

    // 检查内部知识库
    const projectKnowledge = await this.memoryManager.getProjectKnowledge();
    if (projectKnowledge) {
      // 查找相关决策
      const relevantDecisions = projectKnowledge.technicalDecisions.filter(decision =>
        this.calculateRelevance(query, decision.decision + ' ' + decision.reason) > 0.5
      );
      internalKnowledge.push(...relevantDecisions);

      // 查找相关解决方案
      const relevantSolutions = projectKnowledge.commonSolutions.filter(solution =>
        this.calculateRelevance(query, solution.problem + ' ' + solution.solution) > 0.5
      );
      internalKnowledge.push(...relevantSolutions);
    }

    // 识别知识缺口（需要外部查询的内容）
    const keyTerms = this.extractKeyTerms(query);
    for (const term of keyTerms) {
      const hasInternalInfo = internalKnowledge.some(item => 
        JSON.stringify(item).toLowerCase().includes(term.toLowerCase())
      );
      
      if (!hasInternalInfo) {
        knowledgeGaps.push(term);
        // 生成外部搜索建议
        externalReferences.push(`建议搜索: "${term}" + 项目技术栈相关的最佳实践`);
      }
    }

    return {
      internalKnowledge,
      externalReferences,
      knowledgeGaps
    };
  }

  // 辅助方法
  private async identifyCoreFiles(): Promise<string[]> {
    const corePatterns = [
      'package.json', 'requirements.txt', 'Cargo.toml', 'go.mod',
      'config/*', 'src/main.*', 'src/index.*', 'app.js', 'main.py',
      '*.config.*', 'docker-compose.yml', 'Dockerfile'
    ];
    
    const files: string[] = [];
    for (const pattern of corePatterns) {
      try {
        const matches = await this.findFilesByPattern(pattern);
        files.push(...matches);
      } catch {}
    }
    
    return files.slice(0, 10); // 限制核心文件数量
  }

  private async extractRelevantContent(filePath: string, query: string): Promise<{
    text: string;
    relevanceScore: number;
  }> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relevanceScore = this.calculateRelevance(query, content);
      
      // 如果相关性低，只返回关键部分
      if (relevanceScore < 0.6) {
        const keyLines = this.extractKeyLines(content, query);
        return {
          text: keyLines.join('\n'),
          relevanceScore
        };
      }
      
      return {
        text: content.length > 2000 ? content.substring(0, 2000) + '...' : content,
        relevanceScore
      };
    } catch {
      return { text: '', relevanceScore: 0 };
    }
  }

  private calculateRelevance(query: string, content: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let matches = 0;
    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        matches++;
      }
    }
    
    return matches / queryTerms.length;
  }

  private extractKeyTerms(query: string): string[] {
    const stopWords = ['如何', '什么', '为什么', '怎么', '是否', '可以', '能够', '的', '在', '用', '和'];
    return query.split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5);
  }

  private extractKeyLines(content: string, query: string): string[] {
    const lines = content.split('\n');
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    return lines.filter(line => {
      const lineLower = line.toLowerCase();
      return queryTerms.some(term => lineLower.includes(term));
    }).slice(0, 20);
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // 粗略估算
  }

  private generateSearchStrategy(query: string, chunks: any[]): string {
    const highImportanceCount = chunks.filter(c => c.importance === 'high').length;
    const mediumImportanceCount = chunks.filter(c => c.importance === 'medium').length;
    
    return `基于分层检索策略：
- 核心信息源: ${highImportanceCount}个高优先级文件
- 实现细节: ${mediumImportanceCount}个中优先级文件
- 建议使用Grep工具深入搜索相关关键词
- 建议使用Read工具查看具体文件内容`;
  }

  private async findFilesByPattern(pattern: string): Promise<string[]> {
    // 简化实现，实际应该使用glob模式匹配
    return [];
  }

  private async findImplementationFiles(query: string): Promise<string[]> {
    const analyzer = new ProjectContextAnalyzer(this.projectRoot);
    const results = await analyzer.searchProjectFiles(query, ['.js', '.ts', '.py', '.go', '.rs']);
    return results.map(r => r.file).slice(0, 10);
  }

  private async findDocumentationFiles(query: string): Promise<string[]> {
    const analyzer = new ProjectContextAnalyzer(this.projectRoot);
    const results = await analyzer.searchProjectFiles(query, ['.md', '.txt', '.rst']);
    return results.map(r => r.file).slice(0, 5);
  }
}

/**
 * 上下文污染防护系统
 */
export class ContextPollutionGuard {
  private projectRoot: string;
  private memoryManager: MemoryManager;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.memoryManager = new MemoryManager(projectRoot);
  }

  /**
   * 多级验证体系
   */
  async validateInformation(information: {
    content: string;
    source: string;
    timestamp: string;
    confidence: number;
  }): Promise<{
    isValid: boolean;
    trustScore: number;
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let trustScore = information.confidence;

    // 第一级：源验证
    const sourceValidation = await this.validateSource(information.source);
    if (!sourceValidation.isReliable) {
      issues.push(`信息源不可靠: ${sourceValidation.reason}`);
      trustScore *= 0.7;
    }

    // 第二级：内容一致性检查
    const consistencyCheck = await this.checkConsistency(information.content);
    if (!consistencyCheck.isConsistent) {
      issues.push(`内容一致性问题: ${consistencyCheck.conflicts.join(', ')}`);
      trustScore *= 0.8;
      suggestions.push('建议与现有信息进行交叉验证');
    }

    // 第三级：时效性验证
    const freshnessCheck = this.checkFreshness(information.timestamp);
    if (!freshnessCheck.isFresh) {
      issues.push(`信息过时: ${freshnessCheck.age}天前`);
      trustScore *= 0.9;
      suggestions.push('建议更新此信息');
    }

    // 第四级：错误模式检测
    const errorPatterns = this.detectErrorPatterns(information.content);
    if (errorPatterns.length > 0) {
      issues.push(`检测到错误模式: ${errorPatterns.join(', ')}`);
      trustScore *= 0.6;
      suggestions.push('建议人工审核此信息');
    }

    return {
      isValid: trustScore > 0.6 && issues.length < 3,
      trustScore,
      issues,
      suggestions
    };
  }

  /**
   * 信息溯源机制
   */
  async traceInformationSource(informationId: string): Promise<{
    sourceChain: Array<{
      source: string;
      timestamp: string;
      transformations: string[];
    }>;
    originalSource: string;
    verificationStatus: 'verified' | 'unverified' | 'conflicted';
  }> {
    // 简化实现，实际应该维护完整的信息溯源链
    return {
      sourceChain: [],
      originalSource: 'unknown',
      verificationStatus: 'unverified'
    };
  }

  /**
   * 隔离沙箱机制
   */
  async quarantineUncertainInformation(information: any): Promise<{
    quarantineId: string;
    reviewRequired: boolean;
    autoReleaseTime?: string;
  }> {
    const quarantineId = `quarantine_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const quarantinePath = path.join(this.projectRoot, 'context-engineering', 'memory', 'quarantine');
    
    try {
      await fs.mkdir(quarantinePath, { recursive: true });
      
      const quarantineFile = path.join(quarantinePath, `${quarantineId}.json`);
      const quarantineData = {
        id: quarantineId,
        information,
        quarantineTime: new Date().toISOString(),
        reviewRequired: information.trustScore < 0.5,
        autoReleaseTime: information.trustScore > 0.7 ? 
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : // 24小时后自动释放
          undefined,
        reason: 'Low trust score or content inconsistency'
      };
      
      await fs.writeFile(quarantineFile, JSON.stringify(quarantineData, null, 2));
      
      return {
        quarantineId,
        reviewRequired: quarantineData.reviewRequired,
        autoReleaseTime: quarantineData.autoReleaseTime
      };
    } catch (error) {
      console.error('隔离信息失败:', error);
      return {
        quarantineId: 'error',
        reviewRequired: true
      };
    }
  }

  // 辅助方法
  private async validateSource(source: string): Promise<{
    isReliable: boolean;
    reason: string;
  }> {
    // 检查源的可靠性
    if (source.includes('stackoverflow.com') || source.includes('github.com')) {
      return { isReliable: true, reason: 'Trusted community source' };
    }
    
    if (source.includes('blog') || source.includes('medium.com')) {
      return { isReliable: false, reason: 'Personal blog content needs verification' };
    }
    
    if (source.startsWith('internal:')) {
      return { isReliable: true, reason: 'Internal project source' };
    }
    
    return { isReliable: false, reason: 'Unknown or unverified source' };
  }

  private async checkConsistency(content: string): Promise<{
    isConsistent: boolean;
    conflicts: string[];
  }> {
    const conflicts: string[] = [];
    
    // 检查与现有项目知识的一致性
    const projectKnowledge = await this.memoryManager.getProjectKnowledge();
    if (projectKnowledge) {
      // 简化的冲突检测逻辑
      for (const decision of projectKnowledge.technicalDecisions) {
        if (this.hasConflict(content, decision.decision)) {
          conflicts.push(`与技术决策冲突: ${decision.decision}`);
        }
      }
    }
    
    return {
      isConsistent: conflicts.length === 0,
      conflicts
    };
  }

  private checkFreshness(timestamp: string): Promise<{
    isFresh: boolean;
    age: number;
  }> {
    const informationTime = new Date(timestamp);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - informationTime.getTime()) / (1000 * 60 * 60 * 24));
    
    return Promise.resolve({
      isFresh: ageInDays < 30, // 30天内算新鲜
      age: ageInDays
    });
  }

  private detectErrorPatterns(content: string): string[] {
    const errorPatterns = [];
    
    // 检测常见错误模式
    if (content.includes('asyncdef') || content.includes('async def') && content.includes('return ') && !content.includes('await')) {
      errorPatterns.push('异步函数错误：可能缺少await关键字');
    }
    
    if (content.includes('import React') && content.includes('class ') && !content.includes('Component')) {
      errorPatterns.push('React组件错误：类组件应继承Component');
    }
    
    // 可以添加更多错误模式检测
    
    return errorPatterns;
  }

  private hasConflict(content: string, decision: string): boolean {
    // 简化的冲突检测逻辑
    const contentKeywords = content.toLowerCase().split(/\s+/);
    const decisionKeywords = decision.toLowerCase().split(/\s+/);
    
    // 如果有相同关键词但结论相反，视为冲突
    const commonKeywords = contentKeywords.filter(word => decisionKeywords.includes(word));
    
    if (commonKeywords.length > 2) {
      // 检查否定词
      const contentNegative = content.includes('不') || content.includes('不应该') || content.includes('避免');
      const decisionNegative = decision.includes('不') || decision.includes('不应该') || decision.includes('避免');
      
      return contentNegative !== decisionNegative;
    }
    
    return false;
  }
}

/**
 * 智能工具选择器 - 解决工具过载问题
 */
export class IntelligentToolSelector {
  private static readonly MAX_TOOLS = 5; // 限制推荐工具数量

  /**
   * 基于语义匹配的动态工具选择
   */
  static selectOptimalTools(query: string, availableTools: string[], projectContext?: any): {
    selectedTools: Array<{
      name: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
      parameters: { [key: string]: any };
    }>;
    usageStrategy: string;
  } {
    const toolScores = this.calculateToolRelevance(query, availableTools, projectContext);
    const selectedTools = toolScores
      .sort((a, b) => b.score - a.score)
      .slice(0, this.MAX_TOOLS)
      .map(tool => ({
        name: tool.name,
        priority: this.determinePriority(tool.score),
        reason: tool.reason,
        parameters: this.generateOptimalParameters(tool.name, query, projectContext)
      }));

    return {
      selectedTools,
      usageStrategy: this.generateUsageStrategy(selectedTools, query)
    };
  }

  /**
   * 工具使用效果反馈学习
   */
  static async learnFromToolUsage(toolName: string, query: string, success: boolean, executionTime: number): Promise<void> {
    // 简化的学习机制，实际应该维护工具使用效果数据库
    const learningData = {
      toolName,
      query,
      success,
      executionTime,
      timestamp: new Date().toISOString()
    };

    // 在实际实现中，这里应该更新工具选择模型
    console.log('工具使用反馈记录:', learningData);
  }

  /**
   * 自适应工具推荐优化
   */
  static adaptToolRecommendations(historicalData: Array<{
    query: string;
    toolsUsed: string[];
    success: boolean;
    userFeedback?: number; // 1-5评分
  }>): {
    optimizedWeights: { [toolName: string]: number };
    recommendedCombinations: Array<{
      tools: string[];
      effectiveness: number;
      useCase: string;
    }>;
  } {
    const toolEffectiveness: { [key: string]: number } = {};
    const toolCombinations: { [key: string]: { count: number; success: number; rating: number } } = {};

    // 分析历史数据
    for (const entry of historicalData) {
      // 单个工具效果分析
      for (const tool of entry.toolsUsed) {
        if (!toolEffectiveness[tool]) {
          toolEffectiveness[tool] = 0;
        }
        toolEffectiveness[tool] += entry.success ? 1 : 0;
      }

      // 工具组合效果分析
      const combinationKey = entry.toolsUsed.sort().join('+');
      if (!toolCombinations[combinationKey]) {
        toolCombinations[combinationKey] = { count: 0, success: 0, rating: 0 };
      }
      toolCombinations[combinationKey].count++;
      if (entry.success) toolCombinations[combinationKey].success++;
      if (entry.userFeedback) toolCombinations[combinationKey].rating += entry.userFeedback;
    }

    // 计算优化权重
    const optimizedWeights: { [toolName: string]: number } = {};
    for (const [tool, effectiveness] of Object.entries(toolEffectiveness)) {
      const totalUsage = historicalData.filter(d => d.toolsUsed.includes(tool)).length;
      optimizedWeights[tool] = totalUsage > 0 ? effectiveness / totalUsage : 0.5;
    }

    // 推荐最佳组合
    const recommendedCombinations = Object.entries(toolCombinations)
      .map(([combination, stats]) => ({
        tools: combination.split('+'),
        effectiveness: stats.count > 2 ? stats.success / stats.count : 0,
        useCase: this.inferUseCase(combination)
      }))
      .filter(combo => combo.effectiveness > 0.6)
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 3);

    return {
      optimizedWeights,
      recommendedCombinations
    };
  }

  // 辅助方法
  private static calculateToolRelevance(query: string, tools: string[], projectContext?: any): Array<{
    name: string;
    score: number;
    reason: string;
  }> {
    const scores = [];
    
    for (const tool of tools) {
      let score = 0;
      let reason = '';
      
      // 基于工具特性计算相关性
      switch (tool) {
        case 'Grep':
          if (/搜索|查找|grep|函数|方法|类/.test(query)) {
            score = 0.9;
            reason = '查询需要代码搜索功能';
          }
          break;
        case 'Read':
          if (/读取|查看|文件|内容/.test(query)) {
            score = 0.8;
            reason = '查询需要文件读取功能';
          }
          break;
        case 'Task':
          if (/复杂|多个|分析|探索/.test(query)) {
            score = 0.85;
            reason = '查询需要复杂分析功能';
          }
          break;
        case 'project-context-loader':
          if (/项目|分析|技术栈/.test(query)) {
            score = 0.95;
            reason = '查询需要项目上下文信息';
          }
          break;
      }
      
      // 根据项目上下文调整分数
      if (projectContext) {
        if (projectContext.languages?.includes('typescript') && tool === 'Grep') {
          score += 0.1;
          reason += '，TypeScript项目适合代码搜索';
        }
      }
      
      if (score > 0) {
        scores.push({ name: tool, score, reason });
      }
    }
    
    return scores;
  }

  private static determinePriority(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  private static generateOptimalParameters(toolName: string, query: string, projectContext?: any): { [key: string]: any } {
    const baseParams: { [key: string]: any } = {};
    
    switch (toolName) {
      case 'Grep':
        const keywords = query.split(/\s+/).filter(word => word.length > 2);
        baseParams.pattern = keywords[0] || query;
        if (projectContext?.languages?.includes('typescript')) {
          baseParams.type = 'ts';
        }
        break;
      case 'project-context-loader':
        baseParams.rootPath = '${PROJECT_ROOT}';
        baseParams.query = query;
        baseParams.analysisType = 'all';
        break;
      case 'Task':
        baseParams.description = `分析用户查询: ${query}`;
        baseParams.prompt = query;
        break;
    }
    
    return baseParams;
  }

  private static generateUsageStrategy(tools: any[], query: string): string {
    const highPriorityTools = tools.filter(t => t.priority === 'high');
    const mediumPriorityTools = tools.filter(t => t.priority === 'medium');
    
    let strategy = '建议的工具使用策略：\n';
    
    if (highPriorityTools.length > 0) {
      strategy += `1. 优先使用: ${highPriorityTools.map(t => t.name).join(', ')}\n`;
    }
    
    if (mediumPriorityTools.length > 0) {
      strategy += `2. 辅助使用: ${mediumPriorityTools.map(t => t.name).join(', ')}\n`;
    }
    
    strategy += `3. 执行顺序建议: 先分析上下文，再搜索具体内容，最后整合结果`;
    
    return strategy;
  }

  private static inferUseCase(combination: string): string {
    if (combination.includes('project-context-loader') && combination.includes('Grep')) {
      return '项目分析 + 代码搜索';
    }
    if (combination.includes('Task') && combination.includes('Read')) {
      return '复杂分析 + 文件读取';
    }
    return '通用组合';
  }
}

/**
 * 增强版状态管理系统
 */
export class EnhancedStateManager {
  private projectRoot: string;
  private statePath: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.statePath = path.join(projectRoot, 'context-engineering', 'memory', 'state');
  }

  /**
   * 复杂工作流编排
   */
  async orchestrateWorkflow(workflowDefinition: {
    id: string;
    name: string;
    steps: Array<{
      id: string;
      type: 'tool_call' | 'user_input' | 'decision' | 'parallel';
      config: any;
      dependencies?: string[];
    }>;
    metadata?: any;
  }): Promise<{
    workflowId: string;
    status: 'created' | 'running' | 'paused' | 'completed' | 'failed';
    currentStep: string;
    progress: number;
  }> {
    try {
      await fs.mkdir(this.statePath, { recursive: true });
      
      const workflowState = {
        ...workflowDefinition,
        status: 'created' as const,
        currentStep: workflowDefinition.steps[0]?.id || '',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        executionLog: []
      };

      const stateFile = path.join(this.statePath, `workflow_${workflowDefinition.id}.json`);
      await fs.writeFile(stateFile, JSON.stringify(workflowState, null, 2));

      return {
        workflowId: workflowDefinition.id,
        status: workflowState.status,
        currentStep: workflowState.currentStep,
        progress: workflowState.progress
      };
    } catch (error) {
      console.error('工作流编排失败:', error);
      throw error;
    }
  }

  /**
   * 状态转换管理
   */
  async transitionState(workflowId: string, newState: string, metadata?: any): Promise<{
    success: boolean;
    previousState: string;
    newState: string;
    transitionTime: string;
  }> {
    try {
      const stateFile = path.join(this.statePath, `workflow_${workflowId}.json`);
      const workflowState = JSON.parse(await fs.readFile(stateFile, 'utf-8'));
      
      const previousState = workflowState.currentStep;
      const transitionTime = new Date().toISOString();
      
      // 更新状态
      workflowState.currentStep = newState;
      workflowState.updatedAt = transitionTime;
      workflowState.executionLog.push({
        from: previousState,
        to: newState,
        timestamp: transitionTime,
        metadata
      });

      // 计算进度
      const totalSteps = workflowState.steps.length;
      const currentStepIndex = workflowState.steps.findIndex((step: any) => step.id === newState);
      workflowState.progress = Math.floor(((currentStepIndex + 1) / totalSteps) * 100);

      await fs.writeFile(stateFile, JSON.stringify(workflowState, null, 2));

      return {
        success: true,
        previousState,
        newState,
        transitionTime
      };
    } catch (error) {
      console.error('状态转换失败:', error);
      return {
        success: false,
        previousState: '',
        newState: '',
        transitionTime: ''
      };
    }
  }

  /**
   * 获取工作流状态
   */
  async getWorkflowStatus(workflowId: string): Promise<any> {
    try {
      const stateFile = path.join(this.statePath, `workflow_${workflowId}.json`);
      return JSON.parse(await fs.readFile(stateFile, 'utf-8'));
    } catch {
      return null;
    }
  }
}