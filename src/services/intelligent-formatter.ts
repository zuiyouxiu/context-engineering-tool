// 智能格式化器 - 优化信息呈现，减少LLM认知负担

import {
  ContextPackage,
  KnowledgeItem,
  CodePattern,
  ConversationHistory,
  UserPreferences,
  ProjectContext,
  TaskType
} from '../types/context-types.js';

export class IntelligentFormatter {
  
  /**
   * 格式化完整上下文包供LLM消费
   * 核心原则：简洁明了 > 庞杂JSON，格式规范影响LLM理解效率
   */
  formatContextPackage(contextPackage: ContextPackage): string {
    const sections: string[] = [];

    // 标题和基本信息
    sections.push(this.formatHeader(contextPackage));
    
    // 核心任务信息
    sections.push(this.formatTaskSection(contextPackage));
    
    // 项目上下文（结构化呈现）
    sections.push(this.formatProjectContext(contextPackage.projectContext));
    
    // 用户偏好和学习状态
    sections.push(this.formatUserContext(contextPackage.longTermMemory));
    
    // 相关知识（分类呈现）
    sections.push(this.formatKnowledgeSection(contextPackage.relevantKnowledge));
    
    // 代码模式和最佳实践
    sections.push(this.formatPatternsSection(contextPackage.relatedPatterns));
    
    // 可用工具和能力
    sections.push(this.formatToolsSection(contextPackage.availableTools));
    
    // 历史上下文（精简版）
    sections.push(this.formatHistorySection(contextPackage.shortTermMemory));
    
    // 质量指标和建议
    sections.push(this.formatQualitySection(contextPackage));

    return sections.filter(section => section.trim()).join('\n\n');
  }

  /**
   * 格式化标题和基本信息
   */
  private formatHeader(contextPackage: ContextPackage): string {
    return `# 🎯 动态上下文包
    
**任务类型**: ${this.translateTaskType(contextPackage.taskType)}
**优先级**: ${this.formatPriority(contextPackage.priority)}
**上下文质量**: ${this.formatScoreWithColor(contextPackage.completenessScore)}
**会话ID**: ${contextPackage.sessionId}
**生成时间**: ${this.formatTimestamp(contextPackage.timestamp)}`;
  }

  /**
   * 格式化任务部分
   */
  private formatTaskSection(contextPackage: ContextPackage): string {
    let section = `## 📋 任务信息

**用户需求**:
${this.formatUserInput(contextPackage.userInput)}

**系统指引**:`;

    contextPackage.systemInstructions.forEach((instruction, index) => {
      section += `\n${index + 1}. ${instruction}`;
    });

    return section;
  }

  /**
   * 格式化项目上下文
   */
  private formatProjectContext(projectContext: ProjectContext): string {
    let section = `## 🏗️ 项目上下文`;

    // 项目目标 - 核心驱动力
    if (projectContext.goals.length > 0) {
      section += `\n\n**🎯 项目目标**:`;
      projectContext.goals.slice(0, 3).forEach(goal => {
        section += `\n• ${goal}`;
      });
    }

    // 关键功能 - 产品能力
    if (projectContext.keyFeatures.length > 0) {
      section += `\n\n**⚡ 关键功能**:`;
      projectContext.keyFeatures.slice(0, 5).forEach(feature => {
        section += `\n• ${feature}`;
      });
    }

    // 技术架构 - 实现基础
    if (projectContext.architecture) {
      section += `\n\n**🔧 技术架构**:`;
      section += `\n${this.summarizeArchitecture(projectContext.architecture)}`;
    }

    // 当前关注点 - 工作重点
    if (projectContext.currentFocus.length > 0) {
      section += `\n\n**🔥 当前关注点**:`;
      projectContext.currentFocus.slice(0, 3).forEach(focus => {
        section += `\n• ${focus}`;
      });
    }

    // 最近变更 - 演进趋势
    if (projectContext.recentChanges.length > 0) {
      section += `\n\n**📈 最近变更**:`;
      projectContext.recentChanges.slice(0, 3).forEach(change => {
        section += `\n• ${change}`;
      });
    }

    // 待解决问题 - 风险识别
    if (projectContext.openIssues.length > 0) {
      section += `\n\n**⚠️ 待解决问题**:`;
      projectContext.openIssues.slice(0, 3).forEach(issue => {
        section += `\n• ${issue}`;
      });
    }

    return section;
  }

  /**
   * 格式化用户上下文
   */
  private formatUserContext(userPreferences: UserPreferences): string {
    let section = `## 👤 用户偏好`;

    // 编程风格
    if (userPreferences.codingStyle) {
      section += `\n\n**💻 编程偏好**:`;
      if (userPreferences.codingStyle.language.length > 0) {
        section += `\n• 主要语言: ${userPreferences.codingStyle.language.join(', ')}`;
      }
      if (userPreferences.codingStyle.frameworks.length > 0) {
        section += `\n• 框架选择: ${userPreferences.codingStyle.frameworks.join(', ')}`;
      }
      section += `\n• 代码风格: ${userPreferences.codingStyle.codeVerbosity}`;
      section += `\n• 文档水平: ${userPreferences.codingStyle.documentationLevel}`;
    }

    // 沟通风格
    if (userPreferences.communicationStyle) {
      section += `\n\n**💬 沟通偏好**:`;
      section += `\n• 回复长度: ${userPreferences.communicationStyle.responseLength}`;
      section += `\n• 技术细节: ${userPreferences.communicationStyle.technicalDetail}`;
      section += `\n• 示例偏好: ${userPreferences.communicationStyle.examplePreference}`;
    }

    // 学习进度
    if (userPreferences.learningProgress) {
      section += `\n\n**📚 学习状态**:`;
      if (userPreferences.learningProgress.successPatterns.length > 0) {
        section += `\n• 成功模式: ${userPreferences.learningProgress.successPatterns.slice(0, 3).join(', ')}`;
      }
      if (userPreferences.learningProgress.masteredConcepts.length > 0) {
        section += `\n• 已掌握: ${userPreferences.learningProgress.masteredConcepts.slice(0, 3).join(', ')}`;
      }
    }

    return section;
  }

  /**
   * 格式化知识部分
   */
  private formatKnowledgeSection(knowledge: KnowledgeItem[]): string {
    if (knowledge.length === 0) {
      return `## 📚 相关知识\n\n*暂无相关知识，建议通过搜索获取相关信息*`;
    }

    let section = `## 📚 相关知识`;

    // 按类型分组
    const groupedKnowledge = this.groupKnowledgeByType(knowledge);

    Object.entries(groupedKnowledge).forEach(([type, items]) => {
      section += `\n\n**${this.formatKnowledgeType(type)}**:`;
      
      items.slice(0, 3).forEach(item => {
        section += `\n\n• **${item.title}** (相关度: ${Math.round(item.relevanceScore * 100)}%)`;
        section += `\n  ${this.summarizeContent(item.description, 100)}`;
      });
    });

    return section;
  }

  /**
   * 格式化模式部分
   */
  private formatPatternsSection(patterns: CodePattern[]): string {
    if (patterns.length === 0) {
      return `## 🔄 代码模式\n\n*暂无相关代码模式*`;
    }

    let section = `## 🔄 代码模式`;

    patterns.slice(0, 3).forEach(pattern => {
      section += `\n\n**${pattern.name}** (${pattern.category})`;
      section += `\n• 描述: ${pattern.description}`;
      section += `\n• 适用场景: ${pattern.useCase}`;
      if (pattern.benefits.length > 0) {
        section += `\n• 优势: ${pattern.benefits.slice(0, 2).join(', ')}`;
      }
    });

    return section;
  }

  /**
   * 格式化工具部分
   */
  private formatToolsSection(tools: any[]): string {
    if (tools.length === 0) {
      return `## 🛠️ 可用工具\n\n*暂无可用工具*`;
    }

    let section = `## 🛠️ 可用工具`;

    tools.forEach(tool => {
      section += `\n\n**${tool.name}**`;
      section += `\n• 功能: ${tool.description}`;
      if (tool.capabilities && tool.capabilities.length > 0) {
        section += `\n• 能力: ${tool.capabilities.slice(0, 3).join(', ')}`;
      }
      if (tool.recommendedUse && tool.recommendedUse.length > 0) {
        section += `\n• 建议使用: ${tool.recommendedUse.slice(0, 2).join(', ')}`;
      }
    });

    return section;
  }

  /**
   * 格式化历史部分
   */
  private formatHistorySection(history: ConversationHistory[]): string {
    if (history.length === 0) {
      return `## 📖 对话历史\n\n*这是新的对话会话*`;
    }

    let section = `## 📖 对话历史`;

    // 只显示最相关的历史
    const relevantHistory = history
      .filter(conv => conv.outcome === 'success' || conv.outcome === 'partial_success')
      .slice(0, 2);

    if (relevantHistory.length > 0) {
      relevantHistory.forEach((conv, index) => {
        section += `\n\n**对话 ${index + 1}** (${this.formatRelativeTime(conv.timestamp)})`;
        section += `\n• 用户: ${this.summarizeContent(conv.userInput, 60)}`;
        section += `\n• 结果: ${this.formatOutcome(conv.outcome)}`;
        if (conv.actions.length > 0) {
          section += `\n• 操作: ${conv.actions.length} 个动作执行`;
        }
      });
    } else {
      section += `\n\n*最近的对话历史中暂无成功案例可供参考*`;
    }

    return section;
  }

  /**
   * 格式化质量部分
   */
  private formatQualitySection(contextPackage: ContextPackage): string {
    let section = `## 📊 上下文质量评估`;

    section += `\n\n**完整性评分**: ${this.formatScoreWithColor(contextPackage.completenessScore)}`;
    
    if (contextPackage.feasibilityAssessment) {
      section += `\n\n**可行性评估**:`;
      section += `\n${contextPackage.feasibilityAssessment}`;
    }

    if (contextPackage.optimizationSuggestions.length > 0) {
      section += `\n\n**优化建议**:`;
      contextPackage.optimizationSuggestions.slice(0, 3).forEach(suggestion => {
        section += `\n• ${suggestion}`;
      });
    }

    return section;
  }

  /**
   * 格式化用于外部工具的搜索查询
   */
  formatSearchQuery(taskType: TaskType, userInput: string, context: any): {
    webSearch: string;
    codeSearch: string;
    librarySearch: string[];
  } {
    return {
      webSearch: this.buildWebSearchQuery(taskType, userInput, context),
      codeSearch: this.buildCodeSearchQuery(taskType, userInput, context),
      librarySearch: this.extractLibrarySearchTerms(userInput, context)
    };
  }

  /**
   * 格式化外部工具结果
   */
  formatExternalResults(results: {
    webResults?: any[];
    codeResults?: any[];
    libraryResults?: any[];
  }): string {
    const sections: string[] = [];

    if (results.webResults && results.webResults.length > 0) {
      sections.push(this.formatWebResults(results.webResults));
    }

    if (results.codeResults && results.codeResults.length > 0) {
      sections.push(this.formatCodeResults(results.codeResults));
    }

    if (results.libraryResults && results.libraryResults.length > 0) {
      sections.push(this.formatLibraryResults(results.libraryResults));
    }

    return sections.join('\n\n');
  }

  // 辅助方法

  private translateTaskType(taskType: TaskType): string {
    const translations: Record<TaskType, string> = {
      architecture: '架构设计',
      feature: '功能开发',
      bugfix: '问题修复',
      refactor: '代码重构',
      decision: '决策支持',
      progress: '进度管理',
      general: '通用任务'
    };
    return translations[taskType] || taskType;
  }

  private formatPriority(priority: string): string {
    const colors: Record<string, string> = {
      high: '🔴 高',
      medium: '🟡 中',
      low: '🟢 低'
    };
    return colors[priority] || priority;
  }

  private formatScoreWithColor(score: number): string {
    if (score >= 90) return `🟢 ${score}/100 (优秀)`;
    if (score >= 80) return `🟡 ${score}/100 (良好)`;
    if (score >= 70) return `🟠 ${score}/100 (一般)`;
    return `🔴 ${score}/100 (需改进)`;
  }

  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  }

  private formatUserInput(input: string): string {
    if (input.length <= 200) {
      return `"${input}"`;
    }
    return `"${input.substring(0, 200)}..."`;
  }

  private summarizeArchitecture(architecture: string): string {
    if (architecture.length <= 150) {
      return architecture;
    }
    return `${architecture.substring(0, 150)}...`;
  }

  private groupKnowledgeByType(knowledge: KnowledgeItem[]): Record<string, KnowledgeItem[]> {
    return knowledge.reduce((groups, item) => {
      const type = item.type || 'general';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
      return groups;
    }, {} as Record<string, KnowledgeItem[]>);
  }

  private formatKnowledgeType(type: string): string {
    const typeMap: Record<string, string> = {
      pattern: '🔄 模式与实践',
      solution: '💡 解决方案',
      'best-practice': '⭐ 最佳实践',
      example: '📝 示例代码'
    };
    return typeMap[type] || `📄 ${type}`;
  }

  private summarizeContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }
    return `${content.substring(0, maxLength)}...`;
  }

  private formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${diffDays}天前`;
  }

  private formatOutcome(outcome: string): string {
    const outcomeMap: Record<string, string> = {
      success: '✅ 成功',
      partial_success: '🟡 部分成功',
      failure: '❌ 失败',
      unknown: '❓ 未知'
    };
    return outcomeMap[outcome] || outcome;
  }

  private buildWebSearchQuery(taskType: TaskType, userInput: string, context: any): string {
    const taskKeywords: Record<TaskType, string> = {
      architecture: 'software architecture design patterns',
      feature: 'implementation tutorial example',
      bugfix: 'fix solution debugging',
      refactor: 'refactoring best practices',
      decision: 'comparison pros cons',
      progress: 'project management tracking',
      general: 'programming development'
    };

    return `${userInput} ${taskKeywords[taskType]} 2024`;
  }

  private buildCodeSearchQuery(taskType: TaskType, userInput: string, context: any): string {
    // 提取关键技术词汇
    const techKeywords = this.extractTechKeywords(userInput);
    return techKeywords.length > 0 ? techKeywords.join(' ') : userInput;
  }

  private extractLibrarySearchTerms(userInput: string, context: any): string[] {
    const commonLibs = [
      'react', 'vue', 'angular', 'express', 'nestjs',
      'typescript', 'javascript', 'python', 'node.js',
      'mongodb', 'postgresql', 'redis', 'docker'
    ];

    return commonLibs.filter(lib => 
      userInput.toLowerCase().includes(lib.toLowerCase())
    );
  }

  private extractTechKeywords(input: string): string[] {
    const techPattern = /\b(class|function|component|service|controller|model|interface|type|async|await|promise|api|http|get|post|put|delete)\b/gi;
    const matches = input.match(techPattern);
    return matches ? [...new Set(matches.map(m => m.toLowerCase()))] : [];
  }

  private formatWebResults(results: any[]): string {
    let section = `## 🌐 网络搜索结果`;
    
    results.slice(0, 3).forEach((result, index) => {
      section += `\n\n**${index + 1}. ${result.title}**`;
      section += `\n• 来源: ${result.url}`;
      section += `\n• 摘要: ${this.summarizeContent(result.snippet, 120)}`;
      section += `\n• 相关度: ${Math.round((result.relevanceScore || 0.5) * 100)}%`;
    });

    return section;
  }

  private formatCodeResults(results: any[]): string {
    let section = `## 💻 代码搜索结果`;
    
    results.slice(0, 3).forEach((result, index) => {
      section += `\n\n**${index + 1}. ${result.filePath}:${result.lineNumber}**`;
      section += `\n• 语言: ${result.language}`;
      section += `\n• 代码片段: \`${this.summarizeContent(result.code, 80)}\``;
      section += `\n• 上下文: ${this.summarizeContent(result.context, 60)}`;
    });

    return section;
  }

  private formatLibraryResults(results: any[]): string {
    let section = `## 📚 库文档结果`;
    
    results.slice(0, 3).forEach((result, index) => {
      section += `\n\n**${index + 1}. ${result.library} - ${result.section}**`;
      section += `\n• 内容: ${this.summarizeContent(result.content, 120)}`;
      if (result.examples && result.examples.length > 0) {
        section += `\n• 示例: ${result.examples.length} 个代码示例`;
      }
    });

    return section;
  }
}