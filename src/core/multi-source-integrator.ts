// 多源信息整合器 - 上下文工程的多源信息维度实现
// 整合AI编程工具的内置功能：网络搜索、代码索引、文件搜索、第三方文档查询

import {
  TaskType,
  KnowledgeItem,
  CodePattern,
  ProjectContext,
  MultiSourceConfig
} from '../types/context-types.js';
import { promises as fs } from 'fs';
import * as path from 'path';

// 外部工具接口定义
interface ExternalToolProvider {
  webSearch?: (query: string) => Promise<WebSearchResult[]>;
  codeIndexSearch?: (query: string, language?: string) => Promise<CodeSearchResult[]>;
  fileSearch?: (pattern: string, rootPath: string) => Promise<FileSearchResult[]>;
  libraryDocSearch?: (libraryName: string, topic?: string) => Promise<LibraryDocResult[]>;
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  relevanceScore: number;
}

interface CodeSearchResult {
  filePath: string;
  lineNumber: number;
  code: string;
  context: string;
  language: string;
  relevanceScore: number;
}

interface FileSearchResult {
  filePath: string;
  fileName: string;
  size: number;
  lastModified: string;
  relevanceScore: number;
}

interface LibraryDocResult {
  library: string;
  section: string;
  content: string;
  examples: string[];
  relevanceScore: number;
}

export class MultiSourceIntegrator {
  private config: MultiSourceConfig;
  private projectRoot: string;
  private externalTools: ExternalToolProvider;

  constructor(
    config: MultiSourceConfig,
    projectRoot: string,
    externalTools: ExternalToolProvider = {}
  ) {
    this.config = config;
    this.projectRoot = projectRoot;
    this.externalTools = externalTools;
  }

  /**
   * 从多个数据源收集和整合信息
   * 实现上下文工程的核心多源整合能力
   */
  async integrateMultiSourceInformation(
    taskType: TaskType,
    userInput: string,
    sessionId: string
  ): Promise<{
    projectContext: ProjectContext;
    relevantKnowledge: KnowledgeItem[];
    codePatterns: CodePattern[];
    externalReferences: KnowledgeItem[];
  }> {
    const startTime = Date.now();

    try {
      // 并行收集多源信息
      const [
        projectContext,
        internalKnowledge,
        webKnowledge,
        codeKnowledge,
        libraryKnowledge,
        fileKnowledge
      ] = await Promise.all([
        this.collectProjectContext(),
        this.collectInternalKnowledge(userInput, taskType),
        this.collectWebKnowledge(userInput, taskType),
        this.collectCodeKnowledge(userInput, taskType),
        this.collectLibraryKnowledge(userInput, taskType),
        this.collectFileKnowledge(userInput, taskType)
      ]);

      // 整合和去重
      const integratedKnowledge = await this.integrateKnowledgeSources([
        ...internalKnowledge,
        ...webKnowledge,
        ...libraryKnowledge,
        ...fileKnowledge
      ]);

      // 提取代码模式
      const codePatterns = await this.extractCodePatterns(codeKnowledge, taskType);

      const result = {
        projectContext,
        relevantKnowledge: integratedKnowledge.internal,
        codePatterns,
        externalReferences: integratedKnowledge.external
      };

      console.log(`多源信息整合完成: ${Date.now() - startTime}ms`);
      return result;

    } catch (error) {
      console.error('多源信息整合失败:', error);
      return this.getFallbackIntegration();
    }
  }

  /**
   * 收集项目上下文（内部源）
   */
  private async collectProjectContext(): Promise<ProjectContext> {
    try {
      const contextPath = path.join(this.projectRoot, 'context-engineering', 'core-context');
      
      const [
        productContext,
        activeContext,
        progress,
        decisions,
        patterns
      ] = await Promise.all([
        this.readContextFile(path.join(contextPath, 'productContext.md')),
        this.readContextFile(path.join(contextPath, 'activeContext.md')),
        this.readContextFile(path.join(contextPath, 'progress.md')),
        this.readContextFile(path.join(contextPath, 'decisionLog.md')),
        this.readContextFile(path.join(contextPath, 'systemPatterns.md'))
      ]);

      return {
        goals: this.extractGoals(productContext),
        keyFeatures: this.extractKeyFeatures(productContext),
        architecture: this.extractArchitecture(productContext),
        currentFocus: this.extractCurrentFocus(activeContext),
        recentChanges: this.extractRecentChanges(activeContext),
        openIssues: this.extractOpenIssues(activeContext),
        completedTasks: this.extractCompletedTasks(progress),
        pendingTasks: this.extractPendingTasks(progress),
        decisions: this.extractDecisions(decisions),
        patterns: this.extractPatterns(patterns)
      };

    } catch (error) {
      console.log('项目上下文收集失败，使用默认值');
      return this.getDefaultProjectContext();
    }
  }

  /**
   * 收集内部知识（项目内部源）
   */
  private async collectInternalKnowledge(
    userInput: string,
    taskType: TaskType
  ): Promise<KnowledgeItem[]> {
    const knowledge: KnowledgeItem[] = [];

    try {
      // 从项目文档中搜索相关信息
      const docFiles = await this.findDocumentationFiles();
      for (const docFile of docFiles) {
        const content = await fs.readFile(docFile, 'utf-8');
        const relevantSections = this.extractRelevantSections(content, userInput);
        
        relevantSections.forEach((section, index) => {
          knowledge.push({
            id: `internal-${path.basename(docFile)}-${index}`,
            type: 'best-practice',
            title: `项目文档: ${path.basename(docFile)}`,
            description: section.title,
            content: section.content,
            tags: [taskType, 'internal', 'documentation'],
            relevanceScore: this.calculateRelevanceScore(section.content, userInput),
            lastUsed: new Date().toISOString(),
            useCount: 0
          });
        });
      }

    } catch (error) {
      console.log('内部知识收集失败');
    }

    return knowledge;
  }

  /**
   * 收集网络知识（外部网络搜索）
   */
  private async collectWebKnowledge(
    userInput: string,
    taskType: TaskType
  ): Promise<KnowledgeItem[]> {
    const knowledge: KnowledgeItem[] = [];

    if (!this.config.sources.externalAPIs || !this.externalTools.webSearch) {
      return knowledge;
    }

    try {
      // 构建搜索查询
      const searchQuery = this.buildWebSearchQuery(userInput, taskType);
      const searchResults = await this.externalTools.webSearch(searchQuery);

      searchResults
        .filter(result => result.relevanceScore > 0.7)
        .slice(0, 5)
        .forEach((result, index) => {
          knowledge.push({
            id: `web-${Date.now()}-${index}`,
            type: 'solution',
            title: result.title,
            description: result.snippet,
            content: `来源: ${result.url}\n\n${result.snippet}`,
            tags: [taskType, 'external', 'web-search'],
            relevanceScore: result.relevanceScore,
            lastUsed: new Date().toISOString(),
            useCount: 0
          });
        });

    } catch (error) {
      console.log('网络知识收集失败');
    }

    return knowledge;
  }

  /**
   * 收集代码知识（代码索引搜索）
   */
  private async collectCodeKnowledge(
    userInput: string,
    taskType: TaskType
  ): Promise<CodeSearchResult[]> {
    if (!this.externalTools.codeIndexSearch) {
      return [];
    }

    try {
      const searchQuery = this.buildCodeSearchQuery(userInput, taskType);
      const codeResults = await this.externalTools.codeIndexSearch(searchQuery);

      return codeResults
        .filter(result => result.relevanceScore > 0.6)
        .slice(0, 10);

    } catch (error) {
      console.log('代码知识收集失败');
      return [];
    }
  }

  /**
   * 收集库文档知识（第三方库文档查询）
   */
  private async collectLibraryKnowledge(
    userInput: string,
    taskType: TaskType
  ): Promise<KnowledgeItem[]> {
    const knowledge: KnowledgeItem[] = [];

    if (!this.externalTools.libraryDocSearch) {
      return knowledge;
    }

    try {
      // 提取用户输入中提到的库
      const mentionedLibraries = this.extractMentionedLibraries(userInput);
      
      for (const library of mentionedLibraries) {
        const docs = await this.externalTools.libraryDocSearch(library, userInput);
        
        docs
          .filter(doc => doc.relevanceScore > 0.7)
          .slice(0, 3)
          .forEach((doc, index) => {
            knowledge.push({
              id: `lib-${library}-${index}`,
              type: 'example',
              title: `${doc.library} 文档: ${doc.section}`,
              description: `${doc.library} 库的相关文档和示例`,
              content: doc.content,
              tags: [taskType, 'external', 'library-docs', library],
              relevanceScore: doc.relevanceScore,
              lastUsed: new Date().toISOString(),
              useCount: 0
            });
          });
      }

    } catch (error) {
      console.log('库文档知识收集失败');
    }

    return knowledge;
  }

  /**
   * 收集文件知识（文件搜索）
   */
  private async collectFileKnowledge(
    userInput: string,
    taskType: TaskType
  ): Promise<KnowledgeItem[]> {
    const knowledge: KnowledgeItem[] = [];

    if (!this.externalTools.fileSearch) {
      return knowledge;
    }

    try {
      // 构建文件搜索模式
      const searchPatterns = this.buildFileSearchPatterns(userInput, taskType);
      
      for (const pattern of searchPatterns) {
        const files = await this.externalTools.fileSearch(pattern, this.projectRoot);
        
        files
          .filter(file => file.relevanceScore > 0.6)
          .slice(0, 5)
          .forEach((file, index) => {
            knowledge.push({
              id: `file-${pattern}-${index}`,
              type: 'pattern',
              title: `项目文件: ${file.fileName}`,
              description: `相关项目文件: ${file.filePath}`,
              content: `文件路径: ${file.filePath}\n最后修改: ${file.lastModified}\n大小: ${file.size} bytes`,
              tags: [taskType, 'internal', 'file-search'],
              relevanceScore: file.relevanceScore,
              lastUsed: new Date().toISOString(),
              useCount: 0
            });
          });
      }

    } catch (error) {
      console.log('文件知识收集失败');
    }

    return knowledge;
  }

  /**
   * 整合知识源并去重
   */
  private async integrateKnowledgeSources(
    allKnowledge: KnowledgeItem[]
  ): Promise<{ internal: KnowledgeItem[]; external: KnowledgeItem[] }> {
    // 按来源分类
    const internal = allKnowledge.filter(item => 
      item.tags.includes('internal')
    );
    const external = allKnowledge.filter(item => 
      item.tags.includes('external')
    );

    // 去重和排序
    const deduplicatedInternal = this.deduplicateKnowledge(internal);
    const deduplicatedExternal = this.deduplicateKnowledge(external);

    // 根据相关性和配置权重排序
    const sortedInternal = this.sortByRelevanceAndWeights(deduplicatedInternal);
    const sortedExternal = this.sortByRelevanceAndWeights(deduplicatedExternal);

    return {
      internal: sortedInternal.slice(0, this.config.limits.maxKnowledgeItems),
      external: sortedExternal.slice(0, this.config.limits.maxKnowledgeItems)
    };
  }

  /**
   * 提取代码模式
   */
  private async extractCodePatterns(
    codeResults: CodeSearchResult[],
    taskType: TaskType
  ): Promise<CodePattern[]> {
    const patterns: CodePattern[] = [];

    // 分析代码结果，提取模式
    const groupedByLanguage = this.groupCodeByLanguage(codeResults);

    Object.entries(groupedByLanguage).forEach(([language, codes]) => {
      const commonPatterns = this.identifyCommonPatterns(codes, language);
      
      commonPatterns.forEach((pattern, index) => {
        patterns.push({
          id: `pattern-${language}-${index}`,
          name: pattern.name,
          description: pattern.description,
          category: this.mapTaskTypeToPatternCategory(taskType),
          codeExample: pattern.example,
          useCase: pattern.useCase,
          benefits: pattern.benefits,
          tradeoffs: pattern.tradeoffs,
          relatedPatterns: [],
          applicationCount: pattern.frequency
        });
      });
    });

    return patterns;
  }

  // 辅助方法

  private async readContextFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return '';
    }
  }

  private extractGoals(content: string): string[] {
    const goalSection = this.extractSection(content, '## 项目目标');
    return this.extractListItems(goalSection);
  }

  private extractKeyFeatures(content: string): string[] {
    const featureSection = this.extractSection(content, '## 关键功能');
    return this.extractListItems(featureSection);
  }

  private extractArchitecture(content: string): string {
    return this.extractSection(content, '## 整体架构');
  }

  private extractCurrentFocus(content: string): string[] {
    const focusSection = this.extractSection(content, '## 当前关注点');
    return this.extractListItems(focusSection);
  }

  private extractRecentChanges(content: string): string[] {
    const changesSection = this.extractSection(content, '## 最近变更');
    return this.extractListItems(changesSection);
  }

  private extractOpenIssues(content: string): string[] {
    const issuesSection = this.extractSection(content, '## 待解决问题');
    return this.extractListItems(issuesSection);
  }

  private extractCompletedTasks(content: string): string[] {
    const completedSection = this.extractSection(content, '## 已完成任务');
    return this.extractListItems(completedSection);
  }

  private extractPendingTasks(content: string): string[] {
    const pendingSection = this.extractSection(content, '## 当前任务');
    return this.extractListItems(pendingSection);
  }

  private extractDecisions(content: string): any[] {
    // 提取决策记录的逻辑
    return [];
  }

  private extractPatterns(content: string): any[] {
    // 提取模式记录的逻辑
    return [];
  }

  private extractSection(content: string, sectionTitle: string): string {
    const lines = content.split('\n');
    const startIndex = lines.findIndex(line => line.trim() === sectionTitle);
    if (startIndex === -1) return '';

    const endIndex = lines.findIndex((line, index) => 
      index > startIndex && line.startsWith('## ')
    );

    const sectionLines = endIndex === -1 
      ? lines.slice(startIndex + 1)
      : lines.slice(startIndex + 1, endIndex);

    return sectionLines.join('\n').trim();
  }

  private extractListItems(content: string): string[] {
    return content
      .split('\n')
      .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
      .map(line => line.replace(/^[\s\*\-]+/, '').trim())
      .filter(item => item.length > 0);
  }

  private async findDocumentationFiles(): Promise<string[]> {
    // 查找项目中的文档文件
    return [];
  }

  private extractRelevantSections(content: string, query: string): Array<{ title: string; content: string }> {
    // 提取相关段落的逻辑
    return [];
  }

  private calculateRelevanceScore(content: string, query: string): number {
    // 计算相关性评分的逻辑
    const queryWords = query.toLowerCase().split(' ');
    const contentWords = content.toLowerCase().split(' ');
    
    let matches = 0;
    queryWords.forEach(word => {
      if (contentWords.includes(word)) {
        matches++;
      }
    });

    return matches / queryWords.length;
  }

  private buildWebSearchQuery(userInput: string, taskType: TaskType): string {
    return `${userInput} ${taskType} programming development`;
  }

  private buildCodeSearchQuery(userInput: string, taskType: TaskType): string {
    return userInput; // 简化实现
  }

  private extractMentionedLibraries(userInput: string): string[] {
    const commonLibraries = [
      'react', 'vue', 'angular', 'express', 'fastify', 'nest',
      'typescript', 'mongoose', 'sequelize', 'prisma', 'lodash',
      'axios', 'fetch', 'socket.io', 'redis', 'postgresql'
    ];

    return commonLibraries.filter(lib => 
      userInput.toLowerCase().includes(lib)
    );
  }

  private buildFileSearchPatterns(userInput: string, taskType: TaskType): string[] {
    const patterns = [];
    
    // 基于任务类型的文件模式
    switch (taskType) {
      case 'feature':
        patterns.push('*.component.*', '*.service.*', '*.controller.*');
        break;
      case 'bugfix':
        patterns.push('*.test.*', '*.spec.*', '*.js', '*.ts');
        break;
      case 'architecture':
        patterns.push('*.config.*', 'package.json', 'tsconfig.json');
        break;
      default:
        patterns.push('*.*');
    }

    return patterns;
  }

  private deduplicateKnowledge(knowledge: KnowledgeItem[]): KnowledgeItem[] {
    const seen = new Set<string>();
    return knowledge.filter(item => {
      const key = `${item.title}-${item.description}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private sortByRelevanceAndWeights(knowledge: KnowledgeItem[]): KnowledgeItem[] {
    return knowledge.sort((a, b) => {
      const scoreA = a.relevanceScore * this.config.weights.relevance;
      const scoreB = b.relevanceScore * this.config.weights.relevance;
      return scoreB - scoreA;
    });
  }

  private groupCodeByLanguage(codeResults: CodeSearchResult[]): Record<string, CodeSearchResult[]> {
    return codeResults.reduce((groups, result) => {
      const lang = result.language || 'unknown';
      if (!groups[lang]) {
        groups[lang] = [];
      }
      groups[lang].push(result);
      return groups;
    }, {} as Record<string, CodeSearchResult[]>);
  }

  private identifyCommonPatterns(codes: CodeSearchResult[], language: string): Array<{
    name: string;
    description: string;
    example: string;
    useCase: string;
    benefits: string[];
    tradeoffs: string[];
    frequency: number;
  }> {
    // 识别常见代码模式的逻辑
    return [];
  }

  private mapTaskTypeToPatternCategory(taskType: TaskType): 'architectural' | 'design' | 'coding' | 'testing' {
    const mapping: Record<TaskType, 'architectural' | 'design' | 'coding' | 'testing'> = {
      architecture: 'architectural',
      feature: 'design',
      bugfix: 'coding',
      refactor: 'coding',
      decision: 'design',
      progress: 'coding',
      general: 'coding'
    };

    return mapping[taskType] || 'coding';
  }

  private getDefaultProjectContext(): ProjectContext {
    return {
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
    };
  }

  private getFallbackIntegration(): {
    projectContext: ProjectContext;
    relevantKnowledge: KnowledgeItem[];
    codePatterns: CodePattern[];
    externalReferences: KnowledgeItem[];
  } {
    return {
      projectContext: this.getDefaultProjectContext(),
      relevantKnowledge: [],
      codePatterns: [],
      externalReferences: []
    };
  }
}