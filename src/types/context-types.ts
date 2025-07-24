// 上下文工程核心类型定义

export type TaskType = 'architecture' | 'feature' | 'bugfix' | 'refactor' | 'decision' | 'progress' | 'general';
export type Priority = 'high' | 'medium' | 'low';
export type MemoryType = 'short-term' | 'long-term';

// 动态上下文包 - 上下文工程的核心数据结构
export interface ContextPackage {
  taskType: TaskType;
  priority: Priority;
  
  // 核心上下文组件
  systemInstructions: string[];
  userInput: string;
  projectContext: ProjectContext;
  
  // 记忆组件（上下文工程的记忆维度）
  shortTermMemory: ConversationHistory[];
  longTermMemory: UserPreferences;
  
  // 检索组件（上下文工程的RAG维度）
  relevantKnowledge: KnowledgeItem[];
  relatedPatterns: CodePattern[];
  
  // 工具和能力（上下文工程的MCP信息维度）
  availableTools: ToolDescriptor[];
  actionHistory: ActionRecord[];
  
  // 质量评估（确保LLM能在当前上下文下完成任务）
  completenessScore: number;
  feasibilityAssessment: string;
  optimizationSuggestions: string[];
  
  timestamp: string;
  sessionId: string;
}

// 项目上下文信息
export interface ProjectContext {
  goals: string[];
  keyFeatures: string[];
  architecture: string;
  currentFocus: string[];
  recentChanges: string[];
  openIssues: string[];
  completedTasks: string[];
  pendingTasks: string[];
  decisions: DecisionRecord[];
  patterns: PatternRecord[];
}

// 对话历史（短期记忆）
export interface ConversationHistory {
  id: string;
  timestamp: string;
  userInput: string;
  aiResponse: string;
  context: any;
  actions: ActionRecord[];
  outcome: string;
}

// 用户偏好（长期记忆）
export interface UserPreferences {
  codingStyle: CodingStyle;
  preferredPatterns: string[];
  workflowPreferences: WorkflowPreferences;
  technicalPreferences: TechnicalPreferences;
  communicationStyle: CommunicationStyle;
  learningProgress: LearningMetrics;
}

// 编程风格偏好
export interface CodingStyle {
  language: string[];
  frameworks: string[];
  architecturePatterns: string[];
  testingApproach: string;
  documentationLevel: 'minimal' | 'standard' | 'comprehensive';
  codeVerbosity: 'concise' | 'standard' | 'verbose';
}

// 工作流偏好
export interface WorkflowPreferences {
  taskBreakdownStyle: 'fine-grained' | 'high-level';
  feedbackFrequency: 'immediate' | 'milestone' | 'completion';
  explanationLevel: 'minimal' | 'standard' | 'detailed';
  reviewProcess: 'automatic' | 'manual' | 'hybrid';
}

// 技术偏好
export interface TechnicalPreferences {
  primaryLanguages: string[];
  frameworks: string[];
  tools: string[];
  deploymentTargets: string[];
  databaseTypes: string[];
  testingFrameworks: string[];
}

// 沟通风格
export interface CommunicationStyle {
  responseLength: 'brief' | 'standard' | 'detailed';
  technicalDetail: 'high' | 'medium' | 'low';
  examplePreference: 'code-heavy' | 'balanced' | 'explanation-heavy';
  questionHandling: 'direct' | 'guided' | 'exploratory';
}

// 学习指标
export interface LearningMetrics {
  successPatterns: string[];
  commonMistakes: string[];
  improvementAreas: string[];
  masteredConcepts: string[];
  currentLearningGoals: string[];
}

// 知识项目
export interface KnowledgeItem {
  id: string;
  type: 'pattern' | 'solution' | 'best-practice' | 'example';
  title: string;
  description: string;
  content: string;
  tags: string[];
  relevanceScore: number;
  lastUsed: string;
  useCount: number;
}

// 代码模式
export interface CodePattern {
  id: string;
  name: string;
  description: string;
  category: 'architectural' | 'design' | 'coding' | 'testing';
  codeExample: string;
  useCase: string;
  benefits: string[];
  tradeoffs: string[];
  relatedPatterns: string[];
  applicationCount: number;
}

// 工具描述符
export interface ToolDescriptor {
  name: string;
  description: string;
  inputSchema: any;
  outputFormat: string;
  capabilities: string[];
  limitations: string[];
  recommendedUse: string[];
}

// 操作记录
export interface ActionRecord {
  id: string;
  timestamp: string;
  action: string;
  parameters: any;
  result: any;
  duration: number;
  success: boolean;
  errorMessage?: string;
  contextImpact: string;
}

// 决策记录
export interface DecisionRecord {
  id: string;
  timestamp: string;
  title: string;
  background: string;
  options: DecisionOption[];
  selectedOption: string;
  reasoning: string;
  implementation: string;
  risks: RiskAssessment[];
  impact: string;
}

// 决策选项
export interface DecisionOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  implementationEffort: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
}

// 风险评估
export interface RiskAssessment {
  risk: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

// 模式记录
export interface PatternRecord {
  id: string;
  category: 'coding' | 'architectural' | 'testing';
  name: string;
  description: string;
  examples: string[];
  applicability: string;
  benefits: string[];
}

// 上下文质量评估
export interface ContextQualityAssessment {
  completenessScore: number; // 0-100
  feasibilityScore: number; // 0-100
  clarityScore: number; // 0-100
  overallScore: number; // 0-100
  
  missingInformation: string[];
  potentialIssues: string[];
  optimizationSuggestions: string[];
  confidenceLevel: 'low' | 'medium' | 'high';
  
  canLLMCompleteTask: boolean;
  reasoning: string;
}

// 记忆存储结构
export interface MemoryStore {
  shortTerm: {
    conversations: ConversationHistory[];
    recentActions: ActionRecord[];
    sessionState: SessionState;
    workingContext: any;
  };
  longTerm: {
    userProfile: UserPreferences;
    projectPatterns: PatternRecord[];
    historicalDecisions: DecisionRecord[];
    knowledgeBase: KnowledgeItem[];
    learningProgress: LearningMetrics;
  };
}

// 会话状态
export interface SessionState {
  sessionId: string;
  startTime: string;
  lastActivity: string;
  currentTask: string;
  contextHistory: ContextPackage[];
  userGoals: string[];
  activeTools: string[];
}

// 多源信息配置
export interface MultiSourceConfig {
  sources: {
    projectFiles: boolean;
    conversationHistory: boolean;
    userProfile: boolean;
    knowledgeBase: boolean;
    externalAPIs: boolean;
  };
  weights: {
    recency: number;
    relevance: number;
    userPreference: number;
    projectImportance: number;
  };
  limits: {
    maxHistoryItems: number;
    maxKnowledgeItems: number;
    maxContextSize: number;
  };
}