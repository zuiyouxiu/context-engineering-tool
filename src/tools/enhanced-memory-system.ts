// 增强版记忆管理系统 - 基于上下文工程四大支柱
// 实现多级验证、信息溯源、污染防护等关键功能

import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * 信息可信度等级
 */
export enum TrustLevel {
  VERIFIED = 'verified',      // 已验证 (9-10分)
  RELIABLE = 'reliable',      // 可靠 (7-8分)
  MODERATE = 'moderate',      // 一般 (5-6分)
  UNCERTAIN = 'uncertain',    // 不确定 (3-4分)
  UNTRUSTED = 'untrusted'     // 不可信 (1-2分)
}

/**
 * 信息来源类型
 */
export enum SourceType {
  USER_INPUT = 'user_input',
  AI_GENERATED = 'ai_generated',
  CODE_ANALYSIS = 'code_analysis',
  EXTERNAL_DOCS = 'external_docs',
  MEMORY_RETRIEVAL = 'memory_retrieval'
}

/**
 * 记忆条目接口 - 包含溯源和验证信息
 */
export interface MemoryEntry {
  id: string;
  content: any;
  trustLevel: TrustLevel;
  trustScore: number; // 1-10
  sourceType: SourceType;
  sourceDetails: string;
  timestamp: string;
  verificationHistory: VerificationRecord[];
  tags: string[];
  relatedEntries: string[];
  expiryTime?: string;
}

/**
 * 验证记录
 */
export interface VerificationRecord {
  timestamp: string;
  verifier: string; // AI模型、用户、系统
  previousTrust: TrustLevel;
  newTrust: TrustLevel;
  reason: string;
  evidence?: string;
}

/**
 * 分层检索配置
 */
export interface LayeredRetrievalConfig {
  maxContextLength: number;
  priorityLevels: {
    high: string[];    // 高优先级标签
    medium: string[];  // 中优先级标签
    low: string[];     // 低优先级标签
  };
  timeWeights: {
    recent: number;    // 最近24小时权重
    week: number;      // 一周内权重
    month: number;     // 一月内权重
    older: number;     // 更早权重
  };
}

/**
 * 增强版记忆管理器
 */
export class EnhancedMemoryManager {
  private projectRoot: string;
  private memoryPath: string;
  private quarantinePath: string;  // 隔离区路径
  private verifiedPath: string;    // 已验证记忆路径
  private config: LayeredRetrievalConfig;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.memoryPath = path.join(projectRoot, 'context-engineering', 'enhanced-memory');
    this.quarantinePath = path.join(this.memoryPath, 'quarantine');
    this.verifiedPath = path.join(this.memoryPath, 'verified');
    
    this.config = {
      maxContextLength: 8000, // tokens
      priorityLevels: {
        high: ['critical', 'architecture', 'security', 'performance'],
        medium: ['feature', 'bug', 'refactor', 'decision'],
        low: ['discussion', 'idea', 'note', 'temporary']
      },
      timeWeights: {
        recent: 1.0,
        week: 0.8,
        month: 0.6,
        older: 0.4
      }
    };
  }

  /**
   * 初始化增强记忆系统
   */
  async initializeEnhancedMemorySystem(): Promise<void> {
    try {
      await fs.mkdir(this.memoryPath, { recursive: true });
      await fs.mkdir(this.quarantinePath, { recursive: true });
      await fs.mkdir(this.verifiedPath, { recursive: true });
      
      // 创建系统元数据文件
      const metadataPath = path.join(this.memoryPath, 'system-metadata.json');
      if (!await this.fileExists(metadataPath)) {
        await fs.writeFile(metadataPath, JSON.stringify({
          version: '2.0',
          initialized: new Date().toISOString(),
          totalEntries: 0,
          verifiedEntries: 0,
          quarantinedEntries: 0,
          lastCleanup: new Date().toISOString()
        }, null, 2));
      }
    } catch (error) {
      console.error('初始化增强记忆系统失败:', error);
    }
  }

  /**
   * 保存记忆条目（支持多级验证）
   */
  async saveMemoryEntry(
    content: any, 
    sourceType: SourceType, 
    sourceDetails: string,
    tags: string[] = [],
    initialTrustLevel?: TrustLevel
  ): Promise<string> {
    try {
      const entryId = this.generateEntryId();
      const trustLevel = initialTrustLevel || this.determineTrustLevel(sourceType, content);
      const trustScore = this.calculateTrustScore(trustLevel, sourceType);

      const entry: MemoryEntry = {
        id: entryId,
        content,
        trustLevel,
        trustScore,
        sourceType,
        sourceDetails,
        timestamp: new Date().toISOString(),
        verificationHistory: [{
          timestamp: new Date().toISOString(),
          verifier: 'system',
          previousTrust: TrustLevel.UNCERTAIN,
          newTrust: trustLevel,
          reason: 'Initial assessment based on source type'
        }],
        tags,
        relatedEntries: []
      };

      // 根据可信度决定存储位置
      const targetPath = trustLevel === TrustLevel.UNTRUSTED || trustLevel === TrustLevel.UNCERTAIN
        ? this.quarantinePath
        : this.verifiedPath;

      const filePath = path.join(targetPath, `${entryId}.json`);
      await fs.writeFile(filePath, JSON.stringify(entry, null, 2));

      await this.updateSystemMetadata();
      return entryId;
    } catch (error) {
      console.error('保存记忆条目失败:', error);
      throw error;
    }
  }

  /**
   * 验证记忆条目（多级验证流程）
   */
  async verifyMemoryEntry(
    entryId: string, 
    verifier: string, 
    newTrustLevel: TrustLevel, 
    reason: string,
    evidence?: string
  ): Promise<boolean> {
    try {
      const entry = await this.getMemoryEntry(entryId);
      if (!entry) return false;

      const oldTrustLevel = entry.trustLevel;
      
      // 记录验证历史
      entry.verificationHistory.push({
        timestamp: new Date().toISOString(),
        verifier,
        previousTrust: oldTrustLevel,
        newTrust: newTrustLevel,
        reason,
        evidence
      });

      // 更新信任等级和分数
      entry.trustLevel = newTrustLevel;
      entry.trustScore = this.calculateTrustScore(newTrustLevel, entry.sourceType);

      // 如果信任等级提升，可能需要移动文件
      await this.relocateEntryIfNeeded(entry, oldTrustLevel);
      
      return true;
    } catch (error) {
      console.error('验证记忆条目失败:', error);
      return false;
    }
  }

  /**
   * 分层检索 - 解决"大海捞针"问题
   */
  async layeredRetrieval(
    query: string, 
    maxResults: number = 10
  ): Promise<{
    results: MemoryEntry[];
    searchStrategy: string;
    confidence: number;
  }> {
    try {
      const searchStrategy = await this.analyzeQueryAndBuildStrategy(query);
      
      // 第一层：高可信度 + 高优先级标签
      const highPriorityResults = await this.retrieveByPriority(
        query, 
        'high', 
        [TrustLevel.VERIFIED, TrustLevel.RELIABLE]
      );

      // 第二层：中等可信度 + 中优先级标签
      const mediumPriorityResults = await this.retrieveByPriority(
        query, 
        'medium', 
        [TrustLevel.VERIFIED, TrustLevel.RELIABLE, TrustLevel.MODERATE]
      );

      // 第三层：补充检索
      const supplementResults = await this.retrieveByPriority(
        query, 
        'low', 
        Object.values(TrustLevel)
      );

      // 合并和排序结果
      const allResults = [...highPriorityResults, ...mediumPriorityResults, ...supplementResults];
      const rankedResults = this.rankResults(allResults, query);
      
      const finalResults = rankedResults.slice(0, maxResults);
      const confidence = this.calculateSearchConfidence(finalResults, query);

      return {
        results: finalResults,
        searchStrategy,
        confidence
      };
    } catch (error) {
      console.error('分层检索失败:', error);
      return {
        results: [],
        searchStrategy: 'fallback',
        confidence: 0
      };
    }
  }

  /**
   * 上下文污染检测和清理
   */
  async detectAndCleanContamination(): Promise<{
    detectedIssues: string[];
    cleanedEntries: string[];
    recommendations: string[];
  }> {
    try {
      const issues: string[] = [];
      const cleaned: string[] = [];
      const recommendations: string[] = [];

      // 检测矛盾信息
      const contradictions = await this.detectContradictions();
      issues.push(...contradictions.map(c => `矛盾信息: ${c.description}`));

      // 检测过时信息
      const outdatedEntries = await this.detectOutdatedEntries();
      issues.push(...outdatedEntries.map(e => `过时信息: ${e.id}`));

      // 检测低质量信息传播
      const lowQualityChains = await this.detectLowQualityChains();
      issues.push(...lowQualityChains.map(c => `低质量信息链: ${c.rootId}`));

      // 执行清理操作
      for (const entry of outdatedEntries) {
        if (entry.trustScore < 5) {
          await this.quarantineEntry(entry.id, '自动检测为过时低质量信息');
          cleaned.push(entry.id);
        }
      }

      // 生成建议
      if (contradictions.length > 0) {
        recommendations.push('建议手动审查矛盾信息并进行人工验证');
      }
      if (lowQualityChains.length > 0) {
        recommendations.push('建议重新验证相关信息链的源头');
      }

      return { detectedIssues: issues, cleanedEntries: cleaned, recommendations };
    } catch (error) {
      console.error('污染检测失败:', error);
      return { detectedIssues: [], cleanedEntries: [], recommendations: [] };
    }
  }

  /**
   * 动态上下文构建 - 基于分层检索和信任度
   */
  async buildDynamicContext(
    userQuery: string, 
    projectContext: any,
    maxTokens: number = 4000
  ): Promise<{
    contextPrompt: string;
    usedEntries: MemoryEntry[];
    searchMetrics: any;
  }> {
    try {
      // 分层检索相关记忆
      const retrievalResult = await this.layeredRetrieval(userQuery);
      
      // 按重要性和可信度筛选上下文
      const contextEntries = this.selectContextEntries(
        retrievalResult.results, 
        maxTokens
      );

      // 构建动态上下文提示词
      const contextPrompt = this.constructContextPrompt(
        userQuery,
        projectContext,
        contextEntries
      );

      const searchMetrics = {
        totalRetrieved: retrievalResult.results.length,
        totalUsed: contextEntries.length,
        averageTrustScore: this.calculateAverageScore(contextEntries),
        searchConfidence: retrievalResult.confidence,
        searchStrategy: retrievalResult.searchStrategy
      };

      return {
        contextPrompt,
        usedEntries: contextEntries,
        searchMetrics
      };
    } catch (error) {
      console.error('构建动态上下文失败:', error);
      return {
        contextPrompt: `基于用户查询: ${userQuery}`,
        usedEntries: [],
        searchMetrics: {}
      };
    }
  }

  // 私有辅助方法

  private generateEntryId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineTrustLevel(sourceType: SourceType, content: any): TrustLevel {
    switch (sourceType) {
      case SourceType.CODE_ANALYSIS:
        return TrustLevel.RELIABLE;
      case SourceType.USER_INPUT:
        return TrustLevel.MODERATE;
      case SourceType.AI_GENERATED:
        return TrustLevel.UNCERTAIN;
      case SourceType.EXTERNAL_DOCS:
        return TrustLevel.MODERATE;
      case SourceType.MEMORY_RETRIEVAL:
        return TrustLevel.UNCERTAIN;
      default:
        return TrustLevel.UNCERTAIN;
    }
  }

  private calculateTrustScore(trustLevel: TrustLevel, sourceType: SourceType): number {
    const baseScores = {
      [TrustLevel.VERIFIED]: 9,
      [TrustLevel.RELIABLE]: 7,
      [TrustLevel.MODERATE]: 5,
      [TrustLevel.UNCERTAIN]: 3,
      [TrustLevel.UNTRUSTED]: 1
    };

    const sourceBonus = {
      [SourceType.CODE_ANALYSIS]: 1,
      [SourceType.USER_INPUT]: 0,
      [SourceType.AI_GENERATED]: -1,
      [SourceType.EXTERNAL_DOCS]: 0,
      [SourceType.MEMORY_RETRIEVAL]: -0.5
    };

    return Math.max(1, Math.min(10, baseScores[trustLevel] + sourceBonus[sourceType]));
  }

  private async relocateEntryIfNeeded(entry: MemoryEntry, oldTrustLevel: TrustLevel): Promise<void> {
    const shouldBeInQuarantine = entry.trustLevel === TrustLevel.UNTRUSTED || 
                                entry.trustLevel === TrustLevel.UNCERTAIN;
    const wasInQuarantine = oldTrustLevel === TrustLevel.UNTRUSTED || 
                           oldTrustLevel === TrustLevel.UNCERTAIN;

    if (shouldBeInQuarantine !== wasInQuarantine) {
      const oldPath = path.join(
        wasInQuarantine ? this.quarantinePath : this.verifiedPath, 
        `${entry.id}.json`
      );
      const newPath = path.join(
        shouldBeInQuarantine ? this.quarantinePath : this.verifiedPath, 
        `${entry.id}.json`
      );

      await fs.rename(oldPath, newPath);
    }

    // 更新条目文件
    const targetPath = shouldBeInQuarantine ? this.quarantinePath : this.verifiedPath;
    const filePath = path.join(targetPath, `${entry.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
  }

  private async getMemoryEntry(entryId: string): Promise<MemoryEntry | null> {
    try {
      // 先在已验证目录查找
      let filePath = path.join(this.verifiedPath, `${entryId}.json`);
      if (await this.fileExists(filePath)) {
        return JSON.parse(await fs.readFile(filePath, 'utf-8'));
      }

      // 再在隔离目录查找
      filePath = path.join(this.quarantinePath, `${entryId}.json`);
      if (await this.fileExists(filePath)) {
        return JSON.parse(await fs.readFile(filePath, 'utf-8'));
      }

      return null;
    } catch (error) {
      console.error('获取记忆条目失败:', error);
      return null;
    }
  }

  private async analyzeQueryAndBuildStrategy(query: string): Promise<string> {
    // 简化的查询分析，实际可以更复杂
    const keywords = query.toLowerCase().split(/\s+/);
    
    if (keywords.some(k => ['bug', 'error', 'fix', '错误', '修复'].includes(k))) {
      return 'bug-focused-search';
    }
    if (keywords.some(k => ['architecture', 'design', '架构', '设计'].includes(k))) {
      return 'architecture-focused-search';
    }
    if (keywords.some(k => ['implement', 'code', '实现', '代码'].includes(k))) {
      return 'implementation-focused-search';
    }
    
    return 'general-semantic-search';
  }

  private async retrieveByPriority(
    query: string, 
    priority: 'high' | 'medium' | 'low', 
    allowedTrustLevels: TrustLevel[]
  ): Promise<MemoryEntry[]> {
    const results: MemoryEntry[] = [];
    const priorityTags = this.config.priorityLevels[priority];

    // 这里简化实现，实际需要更复杂的语义匹配
    const allEntries = await this.getAllMemoryEntries();
    
    for (const entry of allEntries) {
      if (!allowedTrustLevels.includes(entry.trustLevel)) continue;
      
      const hasRelevantTags = entry.tags.some(tag => priorityTags.includes(tag));
      const contentMatch = this.simpleContentMatch(query, entry.content);
      
      if (hasRelevantTags || contentMatch) {
        results.push(entry);
      }
    }

    return results;
  }

  private rankResults(results: MemoryEntry[], query: string): MemoryEntry[] {
    return results.sort((a, b) => {
      // 综合排序：信任度 + 时间权重 + 相关性
      const scoreA = this.calculateRelevanceScore(a, query);
      const scoreB = this.calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(entry: MemoryEntry, query: string): number {
    let score = entry.trustScore * 0.4; // 信任度权重

    // 时间权重
    const entryTime = new Date(entry.timestamp).getTime();
    const now = Date.now();
    const daysDiff = (now - entryTime) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 1) score += this.config.timeWeights.recent * 2;
    else if (daysDiff <= 7) score += this.config.timeWeights.week * 2;
    else if (daysDiff <= 30) score += this.config.timeWeights.month * 2;
    else score += this.config.timeWeights.older * 2;

    // 内容相关性（简化）
    const contentRelevance = this.simpleContentMatch(query, entry.content) ? 3 : 0;
    score += contentRelevance;

    return score;
  }

  private calculateSearchConfidence(results: MemoryEntry[], query: string): number {
    if (results.length === 0) return 0;

    const avgTrustScore = results.reduce((sum, r) => sum + r.trustScore, 0) / results.length;
    const resultsRatio = Math.min(results.length / 5, 1); // 期望5个结果
    
    return (avgTrustScore / 10) * 0.7 + resultsRatio * 0.3;
  }

  private async detectContradictions(): Promise<Array<{id: string, description: string}>> {
    // 简化实现，实际需要更复杂的矛盾检测逻辑
    return [];
  }

  private async detectOutdatedEntries(): Promise<MemoryEntry[]> {
    const allEntries = await this.getAllMemoryEntries();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    return allEntries.filter(entry => {
      const entryTime = new Date(entry.timestamp).getTime();
      return entryTime < thirtyDaysAgo && entry.trustScore < 6;
    });
  }

  private async detectLowQualityChains(): Promise<Array<{rootId: string}>> {
    // 简化实现
    return [];
  }

  private async quarantineEntry(entryId: string, reason: string): Promise<void> {
    const entry = await this.getMemoryEntry(entryId);
    if (entry) {
      entry.trustLevel = TrustLevel.UNTRUSTED;
      entry.trustScore = 1;
      await this.relocateEntryIfNeeded(entry, entry.trustLevel);
    }
  }

  private selectContextEntries(entries: MemoryEntry[], maxTokens: number): MemoryEntry[] {
    // 简化的token计算和选择逻辑
    let currentTokens = 0;
    const selected: MemoryEntry[] = [];
    
    for (const entry of entries) {
      const entryTokens = this.estimateTokens(entry.content);
      if (currentTokens + entryTokens <= maxTokens) {
        selected.push(entry);
        currentTokens += entryTokens;
      } else {
        break;
      }
    }
    
    return selected;
  }

  private constructContextPrompt(
    userQuery: string, 
    projectContext: any, 
    contextEntries: MemoryEntry[]
  ): string {
    let prompt = `# 智能上下文助手\n\n## 用户查询\n${userQuery}\n\n`;
    
    if (projectContext) {
      prompt += `## 项目背景\n`;
      prompt += `- 主要语言: ${projectContext.languages?.join(', ') || '未知'}\n`;
      prompt += `- 框架: ${projectContext.frameworks?.join(', ') || '无'}\n\n`;
    }

    if (contextEntries.length > 0) {
      prompt += `## 相关记忆上下文\n`;
      contextEntries.forEach((entry, index) => {
        prompt += `### 记忆 ${index + 1} (可信度: ${entry.trustScore}/10)\n`;
        prompt += `${JSON.stringify(entry.content, null, 2)}\n\n`;
      });
    }

    prompt += `## 指导原则\n`;
    prompt += `请基于以上上下文信息回答用户查询，优先参考高可信度的记忆内容。\n`;

    return prompt;
  }

  private calculateAverageScore(entries: MemoryEntry[]): number {
    if (entries.length === 0) return 0;
    return entries.reduce((sum, e) => sum + e.trustScore, 0) / entries.length;
  }

  private async getAllMemoryEntries(): Promise<MemoryEntry[]> {
    const entries: MemoryEntry[] = [];
    
    try {
      // 读取已验证目录
      const verifiedFiles = await fs.readdir(this.verifiedPath);
      for (const file of verifiedFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.verifiedPath, file);
          const entry = JSON.parse(await fs.readFile(filePath, 'utf-8'));
          entries.push(entry);
        }
      }

      // 读取隔离目录
      const quarantineFiles = await fs.readdir(this.quarantinePath);
      for (const file of quarantineFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.quarantinePath, file);
          const entry = JSON.parse(await fs.readFile(filePath, 'utf-8'));
          entries.push(entry);
        }
      }
    } catch (error) {
      console.error('读取所有记忆条目失败:', error);
    }

    return entries;
  }

  private simpleContentMatch(query: string, content: any): boolean {
    const queryLower = query.toLowerCase();
    const contentStr = JSON.stringify(content).toLowerCase();
    return contentStr.includes(queryLower);
  }

  private estimateTokens(content: any): number {
    // 简化的token估算
    return JSON.stringify(content).length / 4;
  }

  private async updateSystemMetadata(): Promise<void> {
    try {
      const metadataPath = path.join(this.memoryPath, 'system-metadata.json');
      const allEntries = await this.getAllMemoryEntries();
      
      const verifiedCount = allEntries.filter(e => 
        e.trustLevel === TrustLevel.VERIFIED || e.trustLevel === TrustLevel.RELIABLE
      ).length;
      
      const quarantinedCount = allEntries.filter(e => 
        e.trustLevel === TrustLevel.UNTRUSTED || e.trustLevel === TrustLevel.UNCERTAIN
      ).length;

      const metadata = {
        version: '2.0',
        initialized: new Date().toISOString(),
        totalEntries: allEntries.length,
        verifiedEntries: verifiedCount,
        quarantinedEntries: quarantinedCount,
        lastCleanup: new Date().toISOString()
      };

      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('更新系统元数据失败:', error);
    }
  }

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
 * 动态工具选择器 - 解决工具过载问题
 */
export class DynamicToolSelector {
  private availableTools: Map<string, any>;
  private usageHistory: Map<string, number>;

  constructor() {
    this.availableTools = new Map();
    this.usageHistory = new Map();
    this.initializeTools();
  }

  /**
   * 基于查询和上下文动态选择工具
   */
  selectOptimalTools(
    query: string, 
    context: any, 
    maxTools: number = 5
  ): Array<{name: string, confidence: number, reason: string}> {
    const queryAnalysis = this.analyzeQuery(query);
    const contextAnalysis = this.analyzeContext(context);
    
    const toolScores = new Map<string, {score: number, reason: string}>();

    // 为每个工具计算相关性分数
    for (const [toolName, toolInfo] of this.availableTools) {
      const score = this.calculateToolRelevance(toolName, toolInfo, queryAnalysis, contextAnalysis);
      const reason = this.generateSelectionReason(toolName, queryAnalysis, contextAnalysis);
      toolScores.set(toolName, {score, reason});
    }

    // 按分数排序并选择最佳工具
    const sortedTools = Array.from(toolScores.entries())
      .sort(([,a], [,b]) => b.score - a.score)
      .slice(0, maxTools);

    return sortedTools.map(([name, {score, reason}]) => ({
      name,
      confidence: Math.min(score / 10, 1),
      reason
    }));
  }

  private initializeTools(): void {
    // 初始化可用工具列表
    this.availableTools.set('Grep', {
      category: 'search',
      strengths: ['code_search', 'pattern_matching', 'regex'],
      weaknesses: ['large_files'],
      typical_use: ['finding_functions', 'searching_patterns', 'code_analysis']
    });

    this.availableTools.set('Read', {
      category: 'file_access',
      strengths: ['file_reading', 'content_analysis'],
      weaknesses: ['large_files'],
      typical_use: ['reading_configs', 'analyzing_specific_files']
    });

    this.availableTools.set('Task', {
      category: 'complex_operation',
      strengths: ['multi_step', 'complex_analysis', 'autonomous'],
      weaknesses: ['simple_tasks'],
      typical_use: ['complex_searches', 'multi_file_analysis', 'research']
    });

    // 可以继续添加更多工具...
  }

  private analyzeQuery(query: string): any {
    const keywords = query.toLowerCase().split(/\s+/);
    const analysis = {
      hasSearchIntent: keywords.some(k => ['搜索', '查找', 'find', 'search'].includes(k)),
      hasFileIntent: keywords.some(k => ['文件', '配置', 'file', 'config'].includes(k)),
      hasCodeIntent: keywords.some(k => ['代码', '函数', 'code', 'function'].includes(k)),
      hasImplementIntent: keywords.some(k => ['实现', '开发', 'implement', 'develop'].includes(k)),
      complexity: this.assessQueryComplexity(query)
    };

    return analysis;
  }

  private analyzeContext(context: any): any {
    return {
      projectSize: context?.projectSize || 'unknown',
      languages: context?.languages || [],
      frameworks: context?.frameworks || [],
      recentActivity: context?.recentActivity || 'unknown'
    };
  }

  private calculateToolRelevance(
    toolName: string, 
    toolInfo: any, 
    queryAnalysis: any, 
    contextAnalysis: any
  ): number {
    let score = 0;

    // 基于查询意图计算分数
    if (toolName === 'Grep' && queryAnalysis.hasSearchIntent) score += 8;
    if (toolName === 'Read' && queryAnalysis.hasFileIntent) score += 8;
    if (toolName === 'Task' && queryAnalysis.complexity === 'high') score += 9;

    // 基于使用历史调整分数
    const usageCount = this.usageHistory.get(toolName) || 0;
    const popularityBonus = Math.min(usageCount * 0.1, 2);
    score += popularityBonus;

    return score;
  }

  private generateSelectionReason(
    toolName: string, 
    queryAnalysis: any, 
    contextAnalysis: any
  ): string {
    if (toolName === 'Grep' && queryAnalysis.hasSearchIntent) {
      return '查询包含搜索意图，Grep最适合代码搜索';
    }
    if (toolName === 'Read' && queryAnalysis.hasFileIntent) {
      return '查询涉及特定文件，Read工具最合适';
    }
    if (toolName === 'Task' && queryAnalysis.complexity === 'high') {
      return '查询较复杂，需要Task工具的多步处理能力';
    }
    
    return '基于查询特征的一般性推荐';
  }

  private assessQueryComplexity(query: string): 'low' | 'medium' | 'high' {
    const words = query.split(/\s+/).length;
    const complexIndicators = ['架构', '设计', '实现', '分析', 'architecture', 'design', 'implement', 'analyze'];
    
    if (words > 20 || complexIndicators.some(ind => query.toLowerCase().includes(ind))) {
      return 'high';
    } else if (words > 10) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 记录工具使用情况
   */
  recordToolUsage(toolName: string): void {
    const current = this.usageHistory.get(toolName) || 0;
    this.usageHistory.set(toolName, current + 1);
  }
}

/**
 * 注册增强版上下文工程工具的主函数
 * 基于上下文工程四大支柱的全面实现
 */
export function registerEnhancedContextEngineeringTools(server: any) {
  console.log('🚀 增强版上下文工程工具 v4.0 已加载');
  console.log('🏛️ 四大支柱：RAG、记忆系统、状态管理、动态提示词');
  console.log('🛡️ 三大挑战解决：大海捞针、上下文污染、工具过载');
  
  // 这里可以注册具体的工具到server
  // 由于当前是概念验证版本，主要展示架构设计
  // 实际工具注册可以在后续版本中完善
}