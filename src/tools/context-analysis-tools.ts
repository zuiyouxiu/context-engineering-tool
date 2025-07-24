// MCP可行的上下文工程工具实现
// 基于文件系统操作，不依赖外部API或网络访问

import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * 项目上下文分析器 - 构建智能搜索提示词
 * 分析项目基础信息，生成引导AI使用内置搜索能力的提示词
 */
export class ProjectContextAnalyzer {
  private projectRoot: string;
  
  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * 分析项目技术栈
   */
  async analyzeTechStack(): Promise<{
    languages: string[];
    frameworks: string[];
    tools: string[];
    dependencies: { [key: string]: string };
    architecture: string;
  }> {
    const result = {
      languages: [] as string[],
      frameworks: [] as string[],
      tools: [] as string[],
      dependencies: {} as { [key: string]: string },
      architecture: 'unknown'
    };

    try {
      // 分析 package.json (Node.js项目)
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      if (await this.fileExists(packageJsonPath)) {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        
        result.languages.push('javascript');
        if (packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript) {
          result.languages.push('typescript');
        }

        // 检测框架
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (deps.react) result.frameworks.push('react');
        if (deps.vue) result.frameworks.push('vue');
        if (deps.angular) result.frameworks.push('angular');
        if (deps.express) result.frameworks.push('express');
        if (deps.fastify) result.frameworks.push('fastify');
        if (deps.next) result.frameworks.push('nextjs');

        result.dependencies = deps;
      }

      // 分析 requirements.txt (Python项目)
      const requirementsPath = path.join(this.projectRoot, 'requirements.txt');
      if (await this.fileExists(requirementsPath)) {
        result.languages.push('python');
        const requirements = await fs.readFile(requirementsPath, 'utf-8');
        
        if (requirements.includes('django')) result.frameworks.push('django');
        if (requirements.includes('flask')) result.frameworks.push('flask');
        if (requirements.includes('fastapi')) result.frameworks.push('fastapi');
      }

      // 分析 Cargo.toml (Rust项目)
      const cargoPath = path.join(this.projectRoot, 'Cargo.toml');
      if (await this.fileExists(cargoPath)) {
        result.languages.push('rust');
      }

      // 分析 go.mod (Go项目) 
      const goModPath = path.join(this.projectRoot, 'go.mod');
      if (await this.fileExists(goModPath)) {
        result.languages.push('go');
      }

      // 分析配置文件确定架构
      if (await this.fileExists(path.join(this.projectRoot, 'docker-compose.yml'))) {
        result.architecture = 'microservices';
        result.tools.push('docker');
      }
      
      if (await this.fileExists(path.join(this.projectRoot, 'Dockerfile'))) {
        result.tools.push('docker');
      }

      if (await this.fileExists(path.join(this.projectRoot, 'kubernetes'))) {
        result.tools.push('kubernetes');
      }

    } catch (error) {
      console.error('分析技术栈失败:', error);
    }

    return result;
  }

  /**
   * 分析项目结构模式
   */
  async analyzeProjectStructure(): Promise<{
    pattern: string;
    confidence: number;
    features: string[];
  }> {
    try {
      const files = await this.getAllFiles(this.projectRoot, 2); // 只扫描2层深度
      
      // 检测MVC模式
      const hasMVC = files.some(f => f.includes('/models/')) && 
                   files.some(f => f.includes('/views/')) && 
                   files.some(f => f.includes('/controllers/'));

      // 检测组件化架构
      const hasComponents = files.some(f => f.includes('/components/')) ||
                           files.some(f => f.includes('/src/components/'));

      // 检测微服务架构  
      const hasMicroservices = files.some(f => f.includes('docker-compose')) ||
                              files.filter(f => f.includes('package.json')).length > 1;

      if (hasMicroservices) {
        return {
          pattern: 'microservices',
          confidence: 0.8,
          features: ['分布式架构', '服务独立部署', '松耦合']
        };
      }

      if (hasComponents) {
        return {
          pattern: 'component-based',
          confidence: 0.9,
          features: ['组件化开发', '可复用性', '模块化']
        };
      }

      if (hasMVC) {
        return {
          pattern: 'mvc',
          confidence: 0.85,
          features: ['模型-视图-控制器', '关注点分离', '分层架构']
        };
      }

      return {
        pattern: 'monolithic',
        confidence: 0.6,
        features: ['单体架构', '集中部署']
      };

    } catch (error) {
      return {
        pattern: 'unknown',
        confidence: 0,
        features: []
      };
    }
  }

  /**
   * 生成智能搜索指导提示词
   * 基于项目上下文生成引导AI使用内置搜索工具的提示
   */
  async generateSearchGuidance(query: string, techStack?: any): Promise<{
    searchPrompt: string;
    suggestedTools: string[];
    searchKeywords: string[];
    contextualHints: string[];
  }> {
    const searchKeywords = this.extractSearchKeywords(query);
    const projectContext = techStack || await this.analyzeTechStack();
    
    const searchPrompt = this.buildIntelligentSearchPrompt(query, projectContext, searchKeywords);
    
    return {
      searchPrompt,
      suggestedTools: this.recommendBuiltinTools(query, projectContext),
      searchKeywords,
      contextualHints: this.generateContextualHints(query, projectContext)
    };
  }

  /**
   * 构建智能搜索提示词
   */
  private buildIntelligentSearchPrompt(query: string, projectContext: any, keywords: string[]): string {
    const { languages, frameworks, architecture } = projectContext;
    
    return `基于以下项目上下文，请使用你的内置搜索工具来帮助用户解决问题：

**用户问题**: ${query}

**项目技术栈**:
- 语言: ${languages.join(', ') || '未知'}
- 框架: ${frameworks.join(', ') || '无'}
- 架构: ${architecture || '未知'}

**建议搜索策略**:
1. 使用代码索引搜索相关的类、函数、组件: ${keywords.slice(0, 3).join(', ')}
2. 在项目文件中搜索相关配置和实现模式
3. 查找与 ${frameworks.join('、')} 相关的最佳实践
4. 检索项目中的测试文件和文档来理解现有实现

**重点关注**:
- 项目现有的代码模式和约定
- 与当前技术栈匹配的解决方案
- 已有的相似功能实现作为参考

请使用你的搜索工具来查找相关信息，然后基于实际的项目代码给出建议。`;
  }

  /**
   * 推荐AI编程工具的内置工具
   */
  private recommendBuiltinTools(query: string, projectContext: any): string[] {
    const tools = [];
    
    if (query.includes('搜索') || query.includes('查找') || query.includes('寻找')) {
      tools.push('Grep', 'Glob', 'Task');
    }
    
    if (query.includes('文件') || query.includes('代码')) {
      tools.push('Read', 'Glob');
    }
    
    if (query.includes('实现') || query.includes('功能')) {
      tools.push('Grep', 'Task');
    }
    
    if (query.includes('配置') || query.includes('设置')) {
      tools.push('Read', 'Grep');
    }
    
    return tools.length > 0 ? tools : ['Grep', 'Read', 'Task'];
  }

  /**
   * 提取搜索关键词
   */
  private extractSearchKeywords(query: string): string[] {
    // 移除常见的停用词，提取核心概念
    const stopWords = ['如何', '怎么', '什么', '哪里', '为什么', '是否', '可以', '能够', '的', '在', '用', '和', '或者'];
    const words = query.split(/\s+/).filter(word => 
      word.length > 1 && !stopWords.includes(word)
    );
    return words.slice(0, 5); // 返回最多5个关键词
  }

  /**
   * 生成上下文提示
   */
  private generateContextualHints(query: string, projectContext: any): string[] {
    const hints = [];
    const { languages, frameworks } = projectContext;
    
    if (frameworks.includes('react')) {
      hints.push('注意React组件的生命周期和Hooks使用模式');
      hints.push('查看现有组件的props和state管理方式');
    }
    
    if (frameworks.includes('express') || frameworks.includes('fastify')) {
      hints.push('检查现有的路由定义和中间件配置');
      hints.push('查看API端点的错误处理模式');
    }
    
    if (languages.includes('typescript')) {
      hints.push('注意TypeScript类型定义和接口设计');
      hints.push('查看现有的类型文件(.d.ts)和泛型使用');
    }
    
    if (query.includes('测试')) {
      hints.push('搜索现有的测试文件了解测试模式');
      hints.push('查看package.json中的测试脚本配置');
    }
    
    return hints.slice(0, 3);
  }

  /**
   * 搜索项目文件
   */
  async searchProjectFiles(query: string, extensions: string[] = []): Promise<Array<{file: string, matches?: string[]}>> {
    const files = await this.getAllFiles(this.projectRoot, 3);
    const filteredFiles = extensions.length > 0 
      ? files.filter(file => extensions.some(ext => file.endsWith(ext)))
      : files;
    
    return filteredFiles.slice(0, 20).map(file => ({
      file: path.relative(this.projectRoot, file)
    }));
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

  private async getAllFiles(dir: string, maxDepth: number, currentDepth: number = 0): Promise<string[]> {
    if (currentDepth >= maxDepth) return [];
    
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // 跳过常见的忽略目录
        if (entry.name.startsWith('.') || 
            ['node_modules', 'venv', '__pycache__', 'target', 'build', 'dist'].includes(entry.name)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllFiles(fullPath, maxDepth, currentDepth + 1);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // 跳过无法访问的目录
    }
    
    return files;
  }
}

/**
 * 用户偏好学习器 - 基于代码分析
 */
export class PreferenceLearner {
  private projectRoot: string;
  private preferencesPath: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.preferencesPath = path.join(projectRoot, 'context-engineering', 'memory', 'long-term', 'user-profile.json');
  }

  /**
   * 从代码风格中学习偏好
   */
  async learnFromCodeStyle(): Promise<{
    codeStyle: {
      indentation: 'tabs' | 'spaces';
      indentSize: number;
      quotes: 'single' | 'double';
      semicolons: boolean;
      trailingCommas: boolean;
    };
    namingConventions: {
      variables: 'camelCase' | 'snake_case' | 'kebab-case';
      functions: 'camelCase' | 'snake_case';
      constants: 'UPPER_CASE' | 'camelCase';
    };
    confidence: number;
  }> {
    const analyzer = new ProjectContextAnalyzer(this.projectRoot);
    const codeFiles = await analyzer.searchProjectFiles('', ['.js', '.ts', '.py', '.jsx', '.tsx']);
    
    const styleAnalysis = {
      indentation: { tabs: 0, spaces: 0, size2: 0, size4: 0 },
      quotes: { single: 0, double: 0 },
      semicolons: { with: 0, without: 0 },
      naming: { camelCase: 0, snake_case: 0, kebab_case: 0, UPPER_CASE: 0 }
    };

    let totalLines = 0;

    for (const { file } of codeFiles.slice(0, 10)) {
      try {
        const content = await fs.readFile(path.join(this.projectRoot, file), 'utf-8');
        const lines = content.split('\n');
        totalLines += lines.length;

        lines.forEach(line => {
          // 分析缩进
          if (line.match(/^\t/)) styleAnalysis.indentation.tabs++;
          if (line.match(/^  /)) styleAnalysis.indentation.spaces++;
          if (line.match(/^  [^ ]/)) styleAnalysis.indentation.size2++;
          if (line.match(/^    [^ ]/)) styleAnalysis.indentation.size4++;

          // 分析引号
          const singleQuotes = (line.match(/'/g) || []).length;
          const doubleQuotes = (line.match(/"/g) || []).length;
          styleAnalysis.quotes.single += singleQuotes;
          styleAnalysis.quotes.double += doubleQuotes;

          // 分析分号
          if (line.includes(';')) styleAnalysis.semicolons.with++;
          if (line.trim().length > 0 && !line.includes(';') && !line.includes('{') && !line.includes('}')) {
            styleAnalysis.semicolons.without++;
          }

          // 分析命名风格
          const camelCaseMatches = line.match(/\b[a-z][a-zA-Z0-9]*\b/g) || [];
          const snakeCaseMatches = line.match(/\b[a-z][a-z0-9_]*\b/g) || [];
          const upperCaseMatches = line.match(/\b[A-Z][A-Z0-9_]*\b/g) || [];
          
          styleAnalysis.naming.camelCase += camelCaseMatches.length;
          styleAnalysis.naming.snake_case += snakeCaseMatches.length;
          styleAnalysis.naming.UPPER_CASE += upperCaseMatches.length;
        });
      } catch (error) {
        continue;
      }
    }

    const result = {
      codeStyle: {
        indentation: styleAnalysis.indentation.tabs > styleAnalysis.indentation.spaces ? 'tabs' as const : 'spaces' as const,
        indentSize: styleAnalysis.indentation.size4 > styleAnalysis.indentation.size2 ? 4 : 2,
        quotes: styleAnalysis.quotes.single > styleAnalysis.quotes.double ? 'single' as const : 'double' as const,
        semicolons: styleAnalysis.semicolons.with > styleAnalysis.semicolons.without,
        trailingCommas: false // 需要更复杂的分析
      },
      namingConventions: {
        variables: styleAnalysis.naming.camelCase > styleAnalysis.naming.snake_case ? 'camelCase' as const : 'snake_case' as const,
        functions: 'camelCase' as const, // 默认
        constants: styleAnalysis.naming.UPPER_CASE > 10 ? 'UPPER_CASE' as const : 'camelCase' as const
      },
      confidence: Math.min(totalLines / 1000, 1) // 基于分析的代码行数
    };

    // 保存学习结果
    await this.savePreferences(result);
    
    return result;
  }

  /**
   * 保存用户偏好
   */
  private async savePreferences(preferences: any): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.preferencesPath), { recursive: true });
      
      let existingPrefs = {};
      try {
        existingPrefs = JSON.parse(await fs.readFile(this.preferencesPath, 'utf-8'));
      } catch {
        // 文件不存在，使用空对象
      }

      const updatedPrefs = {
        ...existingPrefs,
        ...preferences,
        lastUpdated: new Date().toISOString()
      };

      await fs.writeFile(this.preferencesPath, JSON.stringify(updatedPrefs, null, 2));
    } catch (error) {
      console.error('保存偏好失败:', error);
    }
  }
}

/**
 * 专家提示词生成器
 */
export class ExpertPromptGenerator {
  private static EXPERT_ROLES = {
    'frontend-developer': {
      name: '前端开发专家',
      expertise: ['html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular'],
      systemPrompt: `你是资深前端开发专家，专注于现代Web开发技术。
你的专业领域包括：HTML5、CSS3、JavaScript/TypeScript、React/Vue/Angular、性能优化、用户体验设计。
你的工作风格是：注重用户体验、性能优先、跨平台兼容、代码可维护性。`
    },
    'backend-developer': {
      name: '后端开发专家',
      expertise: ['nodejs', 'python', 'java', 'go', 'databases', 'apis', 'microservices'],
      systemPrompt: `你是资深后端开发专家，专注于服务器端系统架构。
你的专业领域包括：API设计、数据库架构、微服务、性能优化、安全防护、系统监控。
你的工作风格是：稳定性优先、安全意识强、注重并发处理能力、重视系统可观察性。`
    },
    'fullstack-developer': {
      name: '全栈开发专家',
      expertise: ['frontend', 'backend', 'databases', 'devops'],
      systemPrompt: `你是资深全栈开发专家，熟悉前后端技术栈。
你的专业领域包括：前端框架、后端服务、数据库设计、系统集成、DevOps实践。
你的工作风格是：全面考虑、技术平衡、注重整体架构、重视开发效率。`
    },
    'data-analyst': {
      name: '数据分析专家',
      expertise: ['python', 'r', 'sql', 'pandas', 'numpy', 'visualization'],
      systemPrompt: `你是资深数据分析专家，专注于数据处理和可视化。
你的专业领域包括：数据清洗、统计分析、机器学习、数据可视化、业务洞察。
你的工作风格是：数据驱动、严谨分析、可视化呈现、注重业务价值。`
    }
  };

  /**
   * 基于项目上下文选择最适合的专家角色
   */
  static selectExpertRole(techStack: { languages: string[]; frameworks: string[] }): string {
    const { languages, frameworks } = techStack;
    
    // 前端框架检测
    if (frameworks.some(f => ['react', 'vue', 'angular', 'nextjs'].includes(f))) {
      return 'frontend-developer';
    }
    
    // 后端框架检测
    if (frameworks.some(f => ['express', 'fastify', 'django', 'flask', 'fastapi'].includes(f))) {
      return 'backend-developer';
    }
    
    // 数据分析检测
    if (languages.includes('python') && frameworks.some(f => f.includes('pandas'))) {
      return 'data-analyst';
    }
    
    // 多语言项目默认全栈
    if (languages.length > 1) {
      return 'fullstack-developer';
    }
    
    // 默认后端开发
    return 'backend-developer';
  }

  /**
   * 生成个性化的专家提示词
   */
  static generateExpertPrompt(
    expertRole: string,
    taskContext: string,
    userPreferences?: any,
    projectContext?: any
  ): string {
    const expert = this.EXPERT_ROLES[expertRole as keyof typeof this.EXPERT_ROLES];
    if (!expert) {
      return '你是一个专业的开发助手，请根据用户需求提供帮助。';
    }

    let prompt = expert.systemPrompt;

    // 添加任务上下文
    if (taskContext) {
      prompt += `\n\n当前任务：${taskContext}`;
    }

    // 添加项目上下文
    if (projectContext) {
      prompt += `\n\n项目背景：`;
      if (projectContext.languages) {
        prompt += `\n- 主要语言：${projectContext.languages.join(', ')}`;
      }
      if (projectContext.frameworks) {
        prompt += `\n- 使用框架：${projectContext.frameworks.join(', ')}`;
      }
      if (projectContext.architecture) {
        prompt += `\n- 架构模式：${projectContext.architecture}`;
      }
    }

    // 添加用户偏好
    if (userPreferences) {
      prompt += `\n\n用户偏好：`;
      if (userPreferences.codeStyle) {
        prompt += `\n- 代码风格：${userPreferences.codeStyle.indentation === 'tabs' ? 'Tab缩进' : '空格缩进'} (${userPreferences.codeStyle.indentSize}个空格)`;
        prompt += `\n- 引号偏好：${userPreferences.codeStyle.quotes === 'single' ? '单引号' : '双引号'}`;
        prompt += `\n- 分号使用：${userPreferences.codeStyle.semicolons ? '使用分号' : '不使用分号'}`;
      }
    }

    prompt += `\n\n请以${expert.name}的身份，提供专业、准确、实用的建议和解决方案。`;

    return prompt;
  }
}

/**
 * MCP工具推荐器
 */
export class MCPToolRecommender {
  private static TOOL_CAPABILITIES = {
    // MCP工具
    'analyze-project-context': {
      description: '分析项目技术栈并生成智能搜索指导',
      bestFor: ['项目分析', '搜索引导', '技术栈识别'],
      parameters: ['rootPath', 'query?', 'analysisType?'],
      confidence: (query: string) => {
        if (/分析|项目|技术栈|搜索|查找/.test(query)) return 0.95;
        return 0.4;
      }
    },
    'learn-user-preferences': {
      description: '从代码风格学习用户编程偏好',
      bestFor: ['代码风格学习', '个性化配置', '偏好设置'],
      parameters: ['rootPath', 'saveToMemory?', 'analysisScope?'],
      confidence: (query: string) => {
        if (/学习|偏好|风格|个性化/.test(query)) return 0.9;
        return 0.2;
      }
    },
    'generate-expert-prompt': {
      description: '生成个性化专家提示词',
      bestFor: ['专家角色', '提示词生成', '个性化AI'],
      parameters: ['rootPath', 'taskDescription', 'forceRole?', 'includePreferences?'],
      confidence: (query: string) => {
        if (/专家|提示|角色|生成/.test(query)) return 0.9;
        return 0.3;
      }
    },
    
    // AI编程工具内置工具
    'Grep': {
      description: '强大的代码搜索工具，支持正则表达式',
      bestFor: ['代码搜索', '函数查找', '关键词匹配'],
      parameters: ['pattern', 'path?', 'type?', 'glob?'],
      confidence: (query: string) => {
        if (/搜索|查找|grep|函数|方法|类/.test(query)) return 0.95;
        return 0.6;
      }
    },
    'Read': {
      description: '读取文件内容，支持偏移量和限制',
      bestFor: ['文件读取', '代码查看', '配置文件检查'],
      parameters: ['file_path', 'offset?', 'limit?'],
      confidence: (query: string) => {
        if (/读取|查看|文件|内容/.test(query)) return 0.9;
        return 0.4;
      }
    },
    'Task': {
      description: '启动智能代理执行复杂搜索任务',
      bestFor: ['复杂搜索', '多文件分析', '开放性查询'],
      parameters: ['description', 'prompt'],
      confidence: (query: string) => {
        if (/复杂|多个|分析|不确定|探索/.test(query)) return 0.8;
        return 0.3;
      }
    },
    'Glob': {
      description: '快速文件模式匹配工具',
      bestFor: ['文件查找', '批量操作', '模式匹配'],
      parameters: ['pattern', 'path?'],
      confidence: (query: string) => {
        if (/文件|匹配|批量|\*/.test(query)) return 0.8;
        return 0.3;
      }
    }
  };

  /**
   * 推荐最适合的MCP工具
   */
  static recommendTools(query: string, taskType?: string): {
    toolName: string;
    description: string;
    confidence: number;
    suggestedParameters: { [key: string]: any };
    reason: string;
  }[] {
    const recommendations: any[] = [];

    for (const [toolName, tool] of Object.entries(this.TOOL_CAPABILITIES)) {
      const confidence = tool.confidence(query);
      
      if (confidence > 0.5) {
        recommendations.push({
          toolName,
          description: tool.description,
          confidence,
          suggestedParameters: this.generateParameters(toolName, query, taskType),
          reason: this.generateReason(toolName, tool.bestFor, confidence)
        });
      }
    }

    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // 返回前3个推荐
  }

  private static generateParameters(toolName: string, query: string, taskType?: string): { [key: string]: any } {
    const baseParams: { [key: string]: any } = {
      rootPath: '${PROJECT_ROOT}' // 占位符，用户需要替换
    };

    switch (toolName) {
      case 'build-dynamic-context':
        return {
          ...baseParams,
          taskType: taskType || 'general',
          userInput: query,
          priority: 'medium'
        };
      
      case 'update-context-engineering':
        return {
          ...baseParams,
          changeType: this.inferChangeType(query),
          description: query
        };
      
      default:
        return baseParams;
    }
  }

  private static generateReason(toolName: string, bestFor: string[], confidence: number): string {
    const confidenceLevel = confidence > 0.8 ? '强烈' : confidence > 0.6 ? '推荐' : '建议';
    return `${confidenceLevel}推荐，因为此工具擅长：${bestFor.join('、')}`;
  }

  private static inferChangeType(query: string): string {
    if (/架构|设计|重构/.test(query)) return 'architecture';
    if (/功能|特性|新增/.test(query)) return 'feature';
    if (/错误|修复|bug/.test(query)) return 'bugfix';
    if (/重构|优化/.test(query)) return 'refactor';
    if (/决策|选择/.test(query)) return 'decision';
    if (/进度|完成|状态/.test(query)) return 'progress';
    return 'general';
  }
}