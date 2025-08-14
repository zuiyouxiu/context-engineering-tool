# 存量项目AI接管完整指南

*版本: 1.0 | 最后更新: 2025-01-13*

## 指南概述

本指南专门针对**无文档、无测试或文档测试不完整的存量项目**，提供AI安全接管和渐进式现代化的完整方法论。

### 核心理念

**"先理解，再重建，后改进"** - 通过上下文工程方法，让AI在信息不完整的情况下安全协作。

### 适用场景

- ✅ 缺少文档的遗留系统
- ✅ 测试覆盖率<30%的项目  
- ✅ 原开发团队离职的系统
- ✅ 技术栈老旧但业务关键的应用
- ✅ 需要现代化改造的单体应用

## 第一部分：项目健康度评估框架

### 快速评估清单 (15分钟评估)

```bash
# AI自动执行的标准化评估脚本
#!/bin/bash

echo "=== 存量项目健康度评估 ==="

# 1. 项目规模评估
echo "项目规模:"
find . -name "node_modules" -prune -o -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.java" -print | wc -l

# 2. 文档完整度
echo "文档情况:"
find . -name "README*" -o -name "*.md" -o -name "doc*" -type f | wc -l
find . -name "*.md" -exec wc -w {} + | tail -1

# 3. 测试覆盖评估  
echo "测试情况:"
find . -name "*test*" -o -name "*spec*" -type f | wc -l
grep -r "describe\|it\|test\|assert" --include="*.js" --include="*.py" --include="*.java" | wc -l

# 4. 代码质量指标
echo "代码质量:"
grep -r "TODO\|FIXME\|XXX\|HACK" --include="*.js" --include="*.py" --include="*.java" | wc -l
grep -r "console.log\|print\|System.out" --include="*.js" --include="*.py" --include="*.java" | wc -l

# 5. 配置和依赖
echo "配置文件:"
find . -name "package.json" -o -name "requirements.txt" -o -name "pom.xml" -o -name "*.config.*" | head -10
```

### 健康度评分系统

```typescript
interface ProjectHealthScore {
  overallScore: number;  // 0-100的综合评分
  
  dimensions: {
    documentation: {
      score: number;      // 0-100
      indicators: {
        hasReadme: boolean;
        hasApiDocs: boolean;  
        hasArchitectureDocs: boolean;
        inlineComments: 'none' | 'sparse' | 'adequate' | 'comprehensive';
      };
    };
    
    testing: {
      score: number;      // 0-100
      indicators: {
        unitTestCoverage: number;    // 0-100%
        integrationTests: boolean;
        e2eTests: boolean;
        testFramework: string | null;
      };
    };
    
    codeQuality: {
      score: number;      // 0-100  
      indicators: {
        averageFileSize: number;     // 行数
        complexityLevel: 'low' | 'medium' | 'high' | 'extreme';
        technicalDebtMarkers: number; // TODO/FIXME数量
        debugStatements: number;     // console.log等数量
      };
    };
    
    architecture: {
      score: number;      // 0-100
      indicators: {
        patternRecognition: 'clear' | 'mixed' | 'chaotic';
        modularity: 'high' | 'medium' | 'low';
        coupling: 'loose' | 'moderate' | 'tight';
        layering: 'well-defined' | 'mixed' | 'monolithic';
      };
    };
  };
  
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    specificRisks: {
      dataCorruption: 'low' | 'medium' | 'high';
      securityVulnerabilities: 'low' | 'medium' | 'high';  
      performanceBottlenecks: 'low' | 'medium' | 'high';
      maintenanceComplexity: 'low' | 'medium' | 'high';
    };
  };
  
  recommendedStrategy: 'conservative' | 'balanced' | 'aggressive' | 'rewrite';
}
```

### 风险分级和策略选择

```yaml
评分0-30 (Critical Risk):
  策略: "超保守模式"
  时间分配: 观察期6-8周，改进期6个月+
  限制: 前8周禁止任何代码修改
  重点: 完整的系统理解和文档重建
  
评分31-50 (High Risk):
  策略: "保守模式" 
  时间分配: 观察期4-6周，改进期3-4个月
  限制: 前6周只允许非侵入性改进
  重点: 核心业务逻辑理解和测试补全
  
评分51-70 (Medium Risk):
  策略: "平衡模式"
  时间分配: 观察期2-4周，改进期2-3个月  
  限制: 高风险模块需要特殊保护
  重点: 渐进式重构和现代化
  
评分71-100 (Low Risk):
  策略: "正常协作模式"
  时间分配: 观察期1-2周，正常开发节奏
  限制: 标准的代码审查和测试要求
  重点: 功能增强和性能优化
```

## 第二部分：分阶段接管方法论

### 阶段1：侦察阶段 (Reconnaissance Phase)

**目标**: 建立项目的基础认知，评估整体风险  
**时长**: 1-2小时到1-2天（取决于项目规模）  
**工具**: LS, Glob, 基础Grep

#### 具体执行步骤

```typescript
interface ReconnaissancePhase {
  step1_project_topology: {
    actions: [
      "使用LS工具探索目录结构",  
      "使用Glob查找关键配置文件",
      "识别主要的技术栈和框架",
      "定位入口文件和启动脚本"
    ];
    tools: ['LS', 'Glob'];
    timeLimit: '30分钟';
    deliverable: 'ProjectTopologyMap';
  };
  
  step2_quick_scanning: {
    actions: [
      "快速扫描主要代码文件",
      "统计项目规模和复杂度", 
      "识别明显的架构模式",
      "发现潜在的风险点"
    ];
    tools: ['Grep', 'basic pattern matching'];
    timeLimit: '1小时';  
    deliverable: 'QuickScanReport';
  };
  
  step3_health_assessment: {
    actions: [
      "执行标准化健康度评估",
      "生成风险评估报告",
      "确定后续策略和时间分配",
      "标识学习优先级"
    ];
    tools: ['综合分析'];
    timeLimit: '30分钟';
    deliverable: 'HealthAssessmentReport';
  };
}
```

#### 输出模板

```markdown
# 项目侦察报告

## 项目基础信息
- 项目类型: [Web应用/API服务/桌面应用/等]
- 技术栈: [主要语言、框架、数据库]
- 项目规模: [文件数量、代码行数]
- 推测年龄: [基于依赖版本和代码风格]

## 架构初印象
- 架构模式: [单体/分层/微服务/未知]
- 模块组织: [清晰/混乱/中等]  
- 依赖管理: [规范/混乱/缺失]

## 风险初评
- 整体风险级别: [低/中/高/极高]
- 主要风险点: [列出3-5个最明显的风险]
- 安全区域: [相对安全可以先分析的模块]

## 后续策略建议
- 推荐模式: [保守/平衡/正常]
- 观察期建议: [时间长度]
- 学习优先级: [按重要性排序的模块列表]
```

### 阶段2：挖掘阶段 (Excavation Phase)

**目标**: 深入理解系统架构和核心业务逻辑  
**时长**: 4小时到2周（取决于复杂度和风险级别）  
**工具**: 智能Grep, Read, Task

#### 分层挖掘策略

```yaml
第一层_架构挖掘:
  重点: 理解整体系统设计
  方法:
    - 追踪数据流从入口到存储
    - 映射主要模块间的依赖关系
    - 识别设计模式和架构原则
    - 分析配置管理和环境设置
  预期产出: 系统架构图和模块依赖图
  
第二层_业务逻辑挖掘:
  重点: 理解核心业务规则和流程
  方法:
    - 从API端点推断业务功能
    - 分析数据模型揭示业务概念
    - 追踪关键业务流程的实现
    - 识别业务规则和验证逻辑
  预期产出: 业务流程文档和规则清单
  
第三层_技术实现挖掘:
  重点: 理解技术选择和实现细节
  方法:
    - 分析错误处理和异常管理策略
    - 理解性能优化和缓存使用
    - 评估安全措施和权限控制
    - 识别集成点和外部依赖
  预期产出: 技术实现报告和风险清单
```

#### 智能搜索模式

```typescript
interface IntelligentSearchPatterns {
  // 架构模式搜索
  architecturalPatterns: {
    mvc: ['controller', 'model', 'view', 'router'];
    layered: ['service', 'repository', 'dao', 'entity'];  
    microservices: ['service', 'api', 'gateway', 'discovery'];
    eventDriven: ['event', 'listener', 'handler', 'subscriber'];
  };
  
  // 业务概念搜索
  businessConcepts: {
    userManagement: ['user', 'account', 'profile', 'auth', 'login'];
    ecommerce: ['product', 'order', 'cart', 'payment', 'inventory'];
    content: ['post', 'article', 'comment', 'tag', 'category'];
    workflow: ['task', 'process', 'step', 'state', 'transition'];
  };
  
  // 技术实现搜索  
  technicalImplementation: {
    dataAccess: ['query', 'transaction', 'connection', 'migrate'];
    security: ['encrypt', 'hash', 'token', 'permission', 'validate'];
    performance: ['cache', 'index', 'optimize', 'async', 'queue'];
    integration: ['api', 'webhook', 'client', 'proxy', 'adapter'];
  };
}
```

### 阶段3：解释阶段 (Interpretation Phase)

**目标**: 将发现转化为可靠的知识，建立假设验证机制  
**时长**: 1-4周  
**工具**: 综合使用所有工具，包括运行时观察

#### 假设验证框架

```typescript
interface HypothesisValidationFramework {
  hypothesisTypes: {
    architectural: {
      example: "系统使用分层架构，service层处理业务逻辑";
      validationMethods: ['代码结构分析', '依赖关系追踪', '调用链分析'];
      confidenceThreshold: 80;
    };
    
    business: {
      example: "订单支付成功后才扣减库存";
      validationMethods: ['业务流程追踪', '事务边界分析', '错误处理检查'];  
      confidenceThreshold: 90;
    };
    
    technical: {
      example: "使用Redis做会话存储";
      validationMethods: ['配置文件检查', '依赖项分析', '连接代码确认'];
      confidenceThreshold: 95;
    };
  };
  
  validationProcess: {
    step1: "基于观察生成假设";
    step2: "收集支持和反驳的证据"; 
    step3: "使用多种方法交叉验证";
    step4: "评估置信度和更新假设";
    step5: "将高置信度假设转为确定知识";
  };
  
  evidenceTypes: {
    codeEvidence: "直接的代码实现";
    configEvidence: "配置文件和环境设置";
    behaviorEvidence: "运行时行为观察";  
    documentEvidence: "任何可用的文档资料";
    patternEvidence: "重复出现的代码模式";
  };
}
```

#### 知识确信度管理

```yaml
确信度等级:
  95-100% (确定知识):
    - 有直接代码证据
    - 多种验证方法一致  
    - 可以基于此知识做决策
    
  80-94% (高度可信):
    - 有较强的证据支持
    - 少量不一致或疑问
    - 可以谨慎地基于此做决策
    
  60-79% (中度可信):  
    - 有一定证据但不完整
    - 存在相互矛盾的信息
    - 需要更多验证才能做决策
    
  40-59% (低度可信):
    - 主要基于推测和间接证据  
    - 有较大不确定性
    - 不能基于此做重要决策
    
  0-39% (高度不确定):
    - 缺乏足够证据
    - 可能存在根本性误解
    - 需要重新分析
```

### 阶段4：保护阶段 (Preservation Phase)

**目标**: 持续记录和更新项目理解，建立知识资产  
**时长**: 持续进行  
**工具**: 记忆系统，文档生成

#### 知识资产类型

```typescript
interface KnowledgeAssets {
  // 架构知识资产
  architecturalAssets: {
    systemDiagram: "整体架构图和组件关系";
    moduleMap: "模块职责和依赖关系图";  
    dataFlowDiagram: "数据流向和处理过程";
    integrationMap: "外部系统集成点";
  };
  
  // 业务知识资产
  businessAssets: {
    processFlows: "核心业务流程文档";
    businessRules: "业务规则和约束清单";
    domainModel: "业务领域模型和概念";
    userJourneys: "用户交互流程";
  };
  
  // 技术知识资产  
  technicalAssets: {
    apiDocumentation: "API接口规范文档";
    databaseSchema: "数据模型和关系文档";
    configurationGuide: "配置和部署指南";
    troubleshootingGuide: "常见问题和解决方案";
  };
  
  // 风险知识资产
  riskAssets: {
    riskRegister: "已识别风险清单";
    safeModificationZones: "安全修改区域标识";  
    dangerousAreas: "高风险区域警告";
    changeImpactMap: "变更影响分析";
  };
}
```

## 第三部分：协作模式和安全机制

### 超保守模式 (Ultra-Conservative Mode)

适用于：健康度评分 < 30分，关键业务系统，原团队完全离职

```typescript
interface UltraConservativeMode {
  duration: "6-8周观察期 + 6个月+渐进改进期";
  
  restrictions: {
    phase1_observation_only: {
      duration: "前6-8周";
      allowedActions: [
        "代码阅读和分析",
        "运行时行为观察", 
        "文档生成和记录",
        "假设验证和知识建设"
      ];
      forbiddenActions: [
        "任何代码修改",
        "配置文件更改",
        "数据库结构修改", 
        "部署流程变更"
      ];
    };
    
    phase2_monitoring_enhancement: {
      duration: "第7-10周";
      allowedActions: [
        "添加非侵入性日志",
        "插入监控代码",
        "建立性能基线",
        "创建健康检查端点"
      ];
      approvalRequired: "每个修改都需要人工审核";
    };
    
    phase3_documentation_and_testing: {
      duration: "第11-16周";
      allowedActions: [
        "生成完整API文档",
        "创建单元测试",
        "添加集成测试", 
        "建立自动化测试流程"
      ];
      coverage_target: "核心业务逻辑 > 80%测试覆盖率";
    };
    
    phase4_cautious_improvements: {
      duration: "第17周开始";
      allowedActions: [
        "小范围重构",
        "性能优化",
        "安全加固",
        "功能增强"
      ];
      requirements: [
        "每次修改必须有对应测试",
        "必须有回滚计划",
        "必须有影响分析",
        "必须通过代码审查"
      ];
    };
  };
  
  safetyMechanisms: {
    changeApproval: "所有修改需要多层验证";
    rollbackPlan: "每次部署必须有即时回滚能力";
    monitoring: "实时监控系统健康和性能指标";
    alerting: "异常情况立即告警和暂停";
  };
}
```

### 保守模式 (Conservative Mode)

适用于：健康度评分 31-50分，重要业务系统，部分文档或测试

```yaml
时间分配: 4-6周观察期 + 3-4个月改进期

阶段划分:
  观察理解期 (4-6周):
    - 深度系统分析和理解
    - 补全关键文档和测试
    - 建立监控和告警机制
    - 识别安全修改区域
    
  渐进改进期 (3-4个月):
    - 优先修复高风险问题
    - 重构复杂和危险的代码区域
    - 现代化技术栈和工具链
    - 建立标准开发流程

安全机制:
  - 高风险模块禁止修改直到有充分测试保护
  - 核心业务逻辑变更需要人工审核
  - 每次部署前必须通过完整回归测试
  - 保持系统行为的向后兼容性
```

### 平衡模式 (Balanced Mode)

适用于：健康度评分 51-70分，有基础文档和部分测试

```yaml
时间分配: 2-4周观察期 + 2-3个月改进期

特点:
  - 可以较快进入改进阶段
  - 重点关注技术债务清理
  - 平衡新功能开发和系统重构
  - 建立现代化开发工作流

风险控制:
  - 标准的代码审查流程  
  - 自动化测试和CI/CD
  - 重要更改的灰度发布
  - 定期的架构评估和优化
```

## 第四部分：实施工具和模板

### AI工具使用指导

#### 现有工具的存量项目优化使用

```typescript
interface LegacyProjectToolUsage {
  // Grep工具优化使用
  grepStrategies: {
    structuralAnalysis: {
      patterns: [
        'class\\s+\\w+',           // 类定义搜索
        'function\\s+\\w+',        // 函数定义搜索  
        'import.*from|require',    // 依赖关系搜索
        'export\\s+(default\\s+)?\\w+' // 导出搜索
      ];
      purpose: "理解代码结构和模块关系";
    };
    
    businessLogicMining: {
      patterns: [
        'validate|check|verify',   // 验证逻辑
        'process|handle|manage',   // 处理逻辑
        'calculate|compute',       // 计算逻辑
        'auth|permission|role'     // 权限逻辑
      ];
      purpose: "挖掘业务规则和流程";
    };
    
    riskAssessment: {
      patterns: [
        'TODO|FIXME|XXX|HACK',     // 技术债务
        'console\\.log|print',      // 调试代码
        'eval|exec',               // 危险操作
        'delete|drop|truncate'     // 危险的数据操作
      ];
      purpose: "识别风险点和技术债务";
    };
  };
  
  // Read工具策略化使用
  readStrategies: {
    prioritizedReading: {
      priority1: ['package.json', 'requirements.txt', 'pom.xml'];  // 项目配置
      priority2: ['README.md', 'index.js', 'main.py', 'App.java']; // 入口文件
      priority3: ['config/*', 'settings.py', 'application.yml'];   // 配置文件
      priority4: ['routes/*', 'controllers/*', 'views/*'];         // 业务逻辑
    };
    
    contextualReading: {
      strategy: "基于Grep发现的关键文件进行深度阅读";
      focus: "理解文件的职责、依赖关系和业务逻辑";
      documentation: "为每个重要文件生成理解记录";
    };
  };
  
  // Task工具专项使用
  taskDelegation: {
    complexAnalysisTasks: [
      "分析用户认证模块的完整实现和安全机制",
      "追踪订单处理流程的端到端实现", 
      "理解数据库访问层的设计模式和事务处理",
      "分析错误处理策略和异常传播机制"
    ];
    
    specializeddAnalysis: [
      "使用专业Agent分析特定技术栈的最佳实践符合度",
      "安全专家Agent评估系统的安全风险和漏洞",
      "性能专家Agent识别性能瓶颈和优化机会"
    ];
  };
}
```

### 文档模板库

#### 项目理解文档模板

```markdown
# [项目名称] - 系统理解文档

## 文档信息
- 创建时间: [日期]
- AI分析师: [AI身份]  
- 理解置信度: [0-100%]
- 最后更新: [日期]

## 执行摘要
- **项目性质**: [简述项目是什么]
- **核心价值**: [项目解决什么问题]
- **技术特征**: [主要技术栈和架构特点]
- **风险评级**: [整体风险等级]

## 架构理解
### 整体架构
- **架构模式**: [单体/分层/微服务/等]
- **主要组件**: [列出核心模块]
- **数据流**: [描述数据如何流动]
- **集成点**: [外部系统集成]

### 技术栈分析
- **后端技术**: [语言、框架、版本]
- **数据存储**: [数据库、缓存、文件系统]
- **前端技术**: [如果适用]
- **基础设施**: [部署、监控、日志]

## 业务逻辑理解
### 核心功能模块
[对每个主要功能模块的理解]

#### [模块名称]
- **职责**: [模块做什么]
- **输入输出**: [数据输入和输出]
- **业务规则**: [关键业务规则]
- **风险点**: [潜在的问题]
- **置信度**: [对此模块理解的确信程度]

## 风险评估
### 高风险区域
- [列出高风险的代码区域]
- [说明为什么高风险]
- [建议的处理策略]

### 中等风险区域
- [列出中等风险的区域]

### 安全区域
- [可以安全修改的区域]

## 改进建议
### 立即可以改进的项目
- [零风险的改进项]

### 需要准备后改进的项目  
- [需要先建立测试等保护措施]

### 长期重构目标
- [架构级别的改进方向]

## 知识空白
### 仍需理解的区域
- [列出还不理解的部分]
- [计划如何继续分析]

### 待验证的假设
- [列出需要验证的假设]
- [验证方法和时间表]

## 附录
### 关键文件清单
- [重要的文件列表及其作用]

### 搜索关键词清单
- [用于后续分析的有效搜索关键词]
```

#### 风险评估文档模板

```markdown
# [项目名称] - 风险评估报告

## 风险评估概览
- **评估日期**: [日期]
- **评估范围**: [评估的系统范围] 
- **整体风险等级**: [Critical/High/Medium/Low]
- **建议策略**: [超保守/保守/平衡/正常]

## 风险分类明细

### 架构风险
| 风险项 | 风险等级 | 影响范围 | 可能后果 | 缓解措施 |
|--------|----------|----------|----------|----------|
| [具体风险] | High | [影响的模块] | [可能的问题] | [如何缓解] |

### 业务逻辑风险
| 风险项 | 风险等级 | 业务影响 | 数据风险 | 缓解措施 |
|--------|----------|----------|----------|----------|
| [具体风险] | Medium | [对业务的影响] | [数据风险] | [如何缓解] |

### 技术实现风险
| 风险项 | 风险等级 | 技术债务 | 维护成本 | 缓解措施 |
|--------|----------|----------|----------|----------|
| [具体风险] | High | [技术债务类型] | [维护难度] | [如何缓解] |

### 数据安全风险
| 风险项 | 风险等级 | 敏感性 | 合规要求 | 缓解措施 |
|--------|----------|---------|----------|----------|
| [具体风险] | Critical | [数据敏感程度] | [法规要求] | [如何缓解] |

## 风险热力图
```
高影响/高概率    | 🔴 立即处理    | 🔴 立即处理
高影响/低概率    | 🟡 制定计划    | 🔴 重点关注  
低影响/高概率    | 🟢 接受风险    | 🟡 制定计划
低影响/低概率    | 🟢 接受风险    | 🟢 接受风险
               低概率 ←→ 高概率
```

## 缓解策略路线图

### 第一优先级 (立即处理)
- [ ] [具体的风险缓解行动]
- [ ] [预期完成时间]
- [ ] [负责人/AI Agent]

### 第二优先级 (3个月内)
- [ ] [具体的风险缓解行动]

### 第三优先级 (6个月内)  
- [ ] [具体的风险缓解行动]

## 监控和报警机制
### 关键指标监控
- [需要监控的关键指标]
- [告警阈值设置]
- [响应流程]

### 定期风险评估  
- **评估频率**: [每月/每季度]
- **评估范围**: [更新的评估重点]
- **报告对象**: [谁需要知道风险状况]
```

## 第五部分：成功案例和经验总结

### 典型成功模式

#### 模式1：电商后端系统重建
- **挑战**: 3年老项目，零文档，<10%测试覆盖率
- **策略**: 超保守模式，8周观察期
- **关键成功因素**:
  - 完整的业务流程重建文档
  - 渐进式测试覆盖率提升到80%
  - 分模块的重构和现代化
- **成果**: 6个月内安全过渡到AI协作开发

#### 模式2：企业内部工具现代化
- **挑战**: Java单体应用，技术栈老旧，部分文档
- **策略**: 平衡模式，3周观察期
- **关键成功因素**:
  - 重点关注API边界重构
  - 保持向后兼容性
  - 分阶段引入现代化工具链
- **成果**: 3个月内完成技术栈升级

#### 模式3：金融系统安全加固
- **挑战**: 高安全要求，合规复杂，不能有downtime
- **策略**: 超保守模式，专注安全分析
- **关键成功因素**:
  - 详细的安全风险评估
  - 渐进式安全加固
  - 完整的合规性验证
- **成果**: 安全评分从C级提升到A级

### 失败案例分析

#### 反面教材1：急于求成的重构
- **问题**: 健康度评分30分但采用激进策略
- **后果**: 2周内引入3个严重bug，系统不稳定
- **教训**: 必须根据项目健康度选择合适的策略

#### 反面教材2：忽视业务逻辑理解
- **问题**: 过度关注技术重构，忽视业务规则验证  
- **后果**: 重构后业务逻辑错误，用户投诉增加
- **教训**: 技术理解和业务理解同等重要

### 最佳实践总结

#### 成功的关键原则
1. **耐心第一**: 给AI足够时间理解项目，不要急于求成
2. **风险驱动**: 始终以风险评估指导决策和优先级
3. **渐进验证**: 每个假设都要通过多种方式验证
4. **文档驱动**: 将所有理解转化为文档，不依赖AI记忆
5. **团队协作**: AI理解 + 人类业务知识 = 最佳效果

#### 避免的常见陷阱
1. **过度自信**: 低估存量项目的复杂性和风险
2. **忽视业务**: 只关注技术问题，不理解业务价值
3. **急于修改**: 理解不充分就开始大规模重构
4. **缺乏验证**: 基于假设做决策而不验证
5. **单点依赖**: 过度依赖AI而不建立人类可理解的文档

## 结语

存量项目的AI接管是一个复杂的系统工程，需要**策略、耐心和方法论**的结合。通过本指南提供的分阶段方法和风险控制机制，AI可以安全地接管并逐步改进缺少文档和测试的遗留系统。

关键是要认识到这不是一个快速的过程，而是一个**专业的、系统化的项目现代化过程**。成功的标志不是改进的速度，而是改进的质量和系统的长期健康发展。

---

*本指南将根据实际应用中的反馈和经验持续更新完善。*