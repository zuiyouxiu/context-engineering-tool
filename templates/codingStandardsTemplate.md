# 编码规范模板

本文件为AI提供项目的编码规范、设计模式和最佳实践，适用于各种编程语言和技术栈。
{GENERATION_DATE} - 更新日志。

## 通用编码原则

### 代码质量原则
1. **可读性优先**: {READABILITY_PRINCIPLE}
2. **一致性**: {CONSISTENCY_PRINCIPLE}
3. **简洁性**: {SIMPLICITY_PRINCIPLE}
4. **可维护性**: {MAINTAINABILITY_PRINCIPLE}
5. **性能考虑**: {PERFORMANCE_PRINCIPLE}

### 设计原则
1. **{DESIGN_PRINCIPLE_1}**: {DESIGN_PRINCIPLE_1_DESC}
2. **{DESIGN_PRINCIPLE_2}**: {DESIGN_PRINCIPLE_2_DESC}
3. **{DESIGN_PRINCIPLE_3}**: {DESIGN_PRINCIPLE_3_DESC}
4. **{DESIGN_PRINCIPLE_4}**: {DESIGN_PRINCIPLE_4_DESC}

## 命名规范

### 通用命名原则
- **清晰明确**: 名称应该准确反映用途和含义
- **避免缩写**: 除非是领域内公认的缩写
- **一致性**: 同类型的对象使用一致的命名模式
- **语言习惯**: 遵循目标语言的命名约定

### 项目特定命名规范
#### 文件和目录
- **文件命名**: {FILE_NAMING_CONVENTION}
- **目录命名**: {DIRECTORY_NAMING_CONVENTION}
- **配置文件**: {CONFIG_FILE_NAMING}

#### 代码元素
- **类/组件**: {CLASS_NAMING_CONVENTION}
- **函数/方法**: {FUNCTION_NAMING_CONVENTION}
- **变量**: {VARIABLE_NAMING_CONVENTION}
- **常量**: {CONSTANT_NAMING_CONVENTION}
- **接口/协议**: {INTERFACE_NAMING_CONVENTION}

#### 特殊命名规则
- **私有成员**: {PRIVATE_NAMING_CONVENTION}
- **测试文件**: {TEST_FILE_NAMING}
- **工具函数**: {UTILITY_NAMING_CONVENTION}

## 代码组织

### 文件结构
**标准文件结构**:
1. {FILE_HEADER_SECTION}: {HEADER_CONTENT}
2. {IMPORT_SECTION}: {IMPORT_ORGANIZATION}
3. {CONSTANTS_SECTION}: {CONSTANTS_ORGANIZATION}
4. {MAIN_CODE_SECTION}: {MAIN_CODE_ORGANIZATION}
5. {HELPER_SECTION}: {HELPER_ORGANIZATION}

### 模块/包组织
**组织原则**:
- **功能分组**: {FUNCTIONAL_GROUPING_RULE}
- **依赖管理**: {DEPENDENCY_ORGANIZATION}
- **接口隔离**: {INTERFACE_SEPARATION}

### 代码分层
**架构层次** (从上到下):
1. **{LAYER_1}**: {LAYER_1_RESPONSIBILITY}
2. **{LAYER_2}**: {LAYER_2_RESPONSIBILITY}
3. **{LAYER_3}**: {LAYER_3_RESPONSIBILITY}
4. **{LAYER_4}**: {LAYER_4_RESPONSIBILITY}

## 编码风格

### 格式化规范
**缩进和空格**:
- 缩进方式: {INDENTATION_STYLE}
- 行长度限制: {LINE_LENGTH_LIMIT}
- 空行使用: {BLANK_LINE_RULES}

**括号和标点**:
- 括号风格: {BRACE_STYLE}
- 分号使用: {SEMICOLON_RULES}
- 逗号规则: {COMMA_RULES}

### 注释规范
**注释类型**:
- **文档注释**: {DOCUMENTATION_COMMENT_FORMAT}
- **行内注释**: {INLINE_COMMENT_RULES}
- **块注释**: {BLOCK_COMMENT_USAGE}

**注释内容要求**:
- **函数注释**: 必须包含 {FUNCTION_COMMENT_REQUIREMENTS}
- **类注释**: 必须包含 {CLASS_COMMENT_REQUIREMENTS}
- **复杂逻辑**: {COMPLEX_LOGIC_COMMENT_RULES}

### 语言特定规范
**{PRIMARY_LANGUAGE}特定规范**:
- {LANGUAGE_SPECIFIC_RULE_1}
- {LANGUAGE_SPECIFIC_RULE_2}
- {LANGUAGE_SPECIFIC_RULE_3}

**其他语言规范** (如适用):
- **{SECONDARY_LANGUAGE_1}**: {SECONDARY_RULES_1}
- **{SECONDARY_LANGUAGE_2}**: {SECONDARY_RULES_2}

## 设计模式和架构

### 推荐设计模式
#### {PATTERN_1_NAME}
- **使用场景**: {PATTERN_1_SCENARIO}
- **实现要点**: {PATTERN_1_IMPLEMENTATION_NOTES}
- **注意事项**: {PATTERN_1_CONSIDERATIONS}

#### {PATTERN_2_NAME}
- **使用场景**: {PATTERN_2_SCENARIO}
- **实现要点**: {PATTERN_2_IMPLEMENTATION_NOTES}
- **注意事项**: {PATTERN_2_CONSIDERATIONS}

#### {PATTERN_3_NAME}
- **使用场景**: {PATTERN_3_SCENARIO}
- **实现要点**: {PATTERN_3_IMPLEMENTATION_NOTES}
- **注意事项**: {PATTERN_3_CONSIDERATIONS}

### 架构约定
**模块间通信**:
- **同步通信**: {SYNC_COMMUNICATION_PATTERN}
- **异步通信**: {ASYNC_COMMUNICATION_PATTERN}
- **事件处理**: {EVENT_HANDLING_PATTERN}

**数据流管理**:
- **状态管理**: {STATE_MANAGEMENT_PATTERN}
- **数据绑定**: {DATA_BINDING_APPROACH}
- **缓存策略**: {CACHING_STRATEGY}

## 错误处理

### 错误处理策略
**错误分类**:
- **可恢复错误**: {RECOVERABLE_ERROR_HANDLING}
- **不可恢复错误**: {FATAL_ERROR_HANDLING}
- **用户错误**: {USER_ERROR_HANDLING}
- **系统错误**: {SYSTEM_ERROR_HANDLING}

**错误处理模式**:
- **错误传播**: {ERROR_PROPAGATION_STRATEGY}
- **错误记录**: {ERROR_LOGGING_REQUIREMENTS}
- **用户反馈**: {USER_FEEDBACK_STRATEGY}

### 异常处理
**异常使用原则**:
- {EXCEPTION_USAGE_PRINCIPLE_1}
- {EXCEPTION_USAGE_PRINCIPLE_2}
- {EXCEPTION_USAGE_PRINCIPLE_3}

## 性能和资源管理

### 性能考虑
**优化原则**:
- **优化时机**: {OPTIMIZATION_TIMING}
- **性能测量**: {PERFORMANCE_MEASUREMENT}
- **瓶颈识别**: {BOTTLENECK_IDENTIFICATION}

**具体优化点**:
- {PERFORMANCE_OPTIMIZATION_1}
- {PERFORMANCE_OPTIMIZATION_2}
- {PERFORMANCE_OPTIMIZATION_3}

### 资源管理
**内存管理**:
- **分配策略**: {MEMORY_ALLOCATION_STRATEGY}
- **释放原则**: {MEMORY_DEALLOCATION_RULES}
- **泄漏防护**: {MEMORY_LEAK_PREVENTION}

**其他资源**:
- **文件句柄**: {FILE_HANDLE_MANAGEMENT}
- **网络连接**: {NETWORK_CONNECTION_MANAGEMENT}
- **数据库连接**: {DATABASE_CONNECTION_MANAGEMENT}

## 安全考虑

### 安全编码实践
**输入验证**:
- {INPUT_VALIDATION_RULES}
- {SANITIZATION_REQUIREMENTS}
- {INJECTION_PREVENTION}

**数据保护**:
- **敏感数据**: {SENSITIVE_DATA_HANDLING}
- **加密要求**: {ENCRYPTION_REQUIREMENTS}
- **访问控制**: {ACCESS_CONTROL_IMPLEMENTATION}

**安全审计**:
- **日志记录**: {SECURITY_LOGGING_REQUIREMENTS}
- **监控要求**: {SECURITY_MONITORING}
- **事件响应**: {SECURITY_INCIDENT_RESPONSE}

## 测试规范

### 测试策略
**测试层次**:
- **单元测试**: {UNIT_TEST_REQUIREMENTS}
- **集成测试**: {INTEGRATION_TEST_REQUIREMENTS}
- **端到端测试**: {E2E_TEST_REQUIREMENTS}

**测试覆盖率**:
- **代码覆盖率**: {CODE_COVERAGE_TARGET}
- **分支覆盖率**: {BRANCH_COVERAGE_TARGET}
- **功能覆盖率**: {FUNCTIONAL_COVERAGE_TARGET}

### 测试实践
**测试组织**:
- **测试文件组织**: {TEST_FILE_ORGANIZATION}
- **测试数据管理**: {TEST_DATA_MANAGEMENT}
- **模拟和桩**: {MOCKING_STRATEGY}

**测试质量**:
- **测试命名**: {TEST_NAMING_CONVENTION}
- **断言策略**: {ASSERTION_STRATEGY}
- **测试维护**: {TEST_MAINTENANCE_RULES}

## 代码审查

### 审查要点
**功能性检查**:
- {FUNCTIONAL_REVIEW_CHECKLIST_1}
- {FUNCTIONAL_REVIEW_CHECKLIST_2}
- {FUNCTIONAL_REVIEW_CHECKLIST_3}

**质量检查**:
- {QUALITY_REVIEW_CHECKLIST_1}
- {QUALITY_REVIEW_CHECKLIST_2}
- {QUALITY_REVIEW_CHECKLIST_3}

**安全检查**:
- {SECURITY_REVIEW_CHECKLIST_1}
- {SECURITY_REVIEW_CHECKLIST_2}
- {SECURITY_REVIEW_CHECKLIST_3}

### 审查流程
**审查流程**:
1. {REVIEW_STEP_1}
2. {REVIEW_STEP_2}
3. {REVIEW_STEP_3}
4. {REVIEW_STEP_4}

## 工具和自动化

### 开发工具
**代码质量工具**:
- **格式化**: {FORMATTING_TOOL_CONFIG}
- **静态分析**: {STATIC_ANALYSIS_TOOL_CONFIG}
- **类型检查**: {TYPE_CHECKING_TOOL_CONFIG}

**测试工具**:
- **测试运行器**: {TEST_RUNNER_CONFIG}
- **覆盖率工具**: {COVERAGE_TOOL_CONFIG}
- **性能测试**: {PERFORMANCE_TEST_TOOL_CONFIG}

### 自动化流程
**持续集成**:
- **构建流程**: {BUILD_AUTOMATION}
- **测试自动化**: {TEST_AUTOMATION}
- **部署流程**: {DEPLOYMENT_AUTOMATION}

---

## 模板使用说明

### 编码原则占位符
- **{READABILITY_PRINCIPLE}**: 可读性原则描述
- **{CONSISTENCY_PRINCIPLE}**: 一致性原则描述
- **{DESIGN_PRINCIPLE_N}**: 设计原则描述

### 命名规范占位符
- **{FILE_NAMING_CONVENTION}**: 文件命名约定
- **{CLASS_NAMING_CONVENTION}**: 类命名约定
- **{FUNCTION_NAMING_CONVENTION}**: 函数命名约定

### 代码组织占位符
- **{FILE_HEADER_SECTION}**: 文件头部章节
- **{LAYER_N}**: 架构层次名称
- **{LAYER_N_RESPONSIBILITY}**: 层次职责

### 设计模式占位符
- **{PATTERN_N_NAME}**: 设计模式名称
- **{PATTERN_N_SCENARIO}**: 使用场景
- **{PATTERN_N_IMPLEMENTATION_NOTES}**: 实现要点

### 语言特定占位符
- **{PRIMARY_LANGUAGE}**: 主要编程语言
- **{LANGUAGE_SPECIFIC_RULE_N}**: 语言特定规则

### 使用建议
1. **多语言适配**: 模板设计为语言无关，可适配各种技术栈
2. **项目定制**: 根据项目特点填入具体规范和约定
3. **团队共识**: 确保团队成员理解和遵守编码规范
4. **工具集成**: 配合自动化工具确保规范执行
5. **持续改进**: 根据项目发展调整和完善规范