# API接口参考模板

本文件为AI提供项目的API接口定义和使用说明，适用于各种技术栈和接口类型。
{GENERATION_DATE} - 更新日志。

## 接口概览

### API类型
**接口类型**: {API_TYPE} (REST API/GraphQL/gRPC/SDK/Library API/等)
**版本管理**: {API_VERSIONING_STRATEGY}
**认证方式**: {AUTHENTICATION_METHOD}
**数据格式**: {DATA_FORMAT}

### 基础信息
**Base URL**: {BASE_URL}
**API版本**: {API_VERSION}
**文档版本**: {DOCUMENTATION_VERSION}
**更新频率**: {UPDATE_FREQUENCY}

## 核心接口

### {MODULE_1}相关接口

#### {INTERFACE_1_1}
**功能描述**: {INTERFACE_1_1_DESCRIPTION}
**接口路径/方法**: {INTERFACE_1_1_ENDPOINT}
**HTTP方法**: {INTERFACE_1_1_METHOD} (GET/POST/PUT/DELETE/等)
**权限要求**: {INTERFACE_1_1_PERMISSIONS}

**请求参数**:
- **{PARAM_1_1}**: {PARAM_1_1_TYPE} - {PARAM_1_1_DESCRIPTION}
  - 必需性: {PARAM_1_1_REQUIRED}
  - 默认值: {PARAM_1_1_DEFAULT}
  - 取值范围: {PARAM_1_1_RANGE}

- **{PARAM_1_2}**: {PARAM_1_2_TYPE} - {PARAM_1_2_DESCRIPTION}
  - 必需性: {PARAM_1_2_REQUIRED}
  - 格式要求: {PARAM_1_2_FORMAT}

**响应数据**:
- **{RESPONSE_FIELD_1_1}**: {RESPONSE_FIELD_1_1_TYPE} - {RESPONSE_FIELD_1_1_DESCRIPTION}
- **{RESPONSE_FIELD_1_2}**: {RESPONSE_FIELD_1_2_TYPE} - {RESPONSE_FIELD_1_2_DESCRIPTION}

**状态码/错误码**:
- **{SUCCESS_CODE_1}**: {SUCCESS_DESCRIPTION_1}
- **{ERROR_CODE_1_1}**: {ERROR_DESCRIPTION_1_1}
- **{ERROR_CODE_1_2}**: {ERROR_DESCRIPTION_1_2}

#### {INTERFACE_1_2}
**功能描述**: {INTERFACE_1_2_DESCRIPTION}
**接口路径/方法**: {INTERFACE_1_2_ENDPOINT}
**HTTP方法**: {INTERFACE_1_2_METHOD}
**权限要求**: {INTERFACE_1_2_PERMISSIONS}

**请求参数**:
- **{PARAM_2_1}**: {PARAM_2_1_TYPE} - {PARAM_2_1_DESCRIPTION}
- **{PARAM_2_2}**: {PARAM_2_2_TYPE} - {PARAM_2_2_DESCRIPTION}

**响应数据**:
- **{RESPONSE_FIELD_2_1}**: {RESPONSE_FIELD_2_1_TYPE} - {RESPONSE_FIELD_2_1_DESCRIPTION}
- **{RESPONSE_FIELD_2_2}**: {RESPONSE_FIELD_2_2_TYPE} - {RESPONSE_FIELD_2_2_DESCRIPTION}

### {MODULE_2}相关接口

#### {INTERFACE_2_1}
**功能描述**: {INTERFACE_2_1_DESCRIPTION}
**接口路径/方法**: {INTERFACE_2_1_ENDPOINT}
**特殊说明**: {INTERFACE_2_1_NOTES}

**请求格式**: {INTERFACE_2_1_REQUEST_FORMAT}
**响应格式**: {INTERFACE_2_1_RESPONSE_FORMAT}
**异步处理**: {INTERFACE_2_1_ASYNC_INFO}

#### {INTERFACE_2_2}
**功能描述**: {INTERFACE_2_2_DESCRIPTION}
**接口路径/方法**: {INTERFACE_2_2_ENDPOINT}
**批处理支持**: {INTERFACE_2_2_BATCH_SUPPORT}

## 数据模型

### 请求数据模型

#### {REQUEST_MODEL_1}
**用途**: {REQUEST_MODEL_1_PURPOSE}
**字段定义**:
```
{
  "{FIELD_1_1}": {FIELD_1_1_TYPE},     // {FIELD_1_1_DESCRIPTION}
  "{FIELD_1_2}": {FIELD_1_2_TYPE},     // {FIELD_1_2_DESCRIPTION}
  "{FIELD_1_3}": {FIELD_1_3_TYPE}      // {FIELD_1_3_DESCRIPTION}
}
```

**验证规则**:
- **{FIELD_1_1}**: {FIELD_1_1_VALIDATION}
- **{FIELD_1_2}**: {FIELD_1_2_VALIDATION}

#### {REQUEST_MODEL_2}
**用途**: {REQUEST_MODEL_2_PURPOSE}
**字段定义**:
```
{
  "{FIELD_2_1}": {FIELD_2_1_TYPE},     // {FIELD_2_1_DESCRIPTION}
  "{FIELD_2_2}": {FIELD_2_2_TYPE},     // {FIELD_2_2_DESCRIPTION}
  "{FIELD_2_3}": [{                    // {FIELD_2_3_DESCRIPTION}
    "{NESTED_FIELD_1}": {NESTED_TYPE_1},
    "{NESTED_FIELD_2}": {NESTED_TYPE_2}
  }]
}
```

### 响应数据模型

#### {RESPONSE_MODEL_1}
**用途**: {RESPONSE_MODEL_1_PURPOSE}
**字段定义**:
```
{
  "{RESPONSE_FIELD_1}": {RESPONSE_TYPE_1},     // {RESPONSE_DESC_1}
  "{RESPONSE_FIELD_2}": {RESPONSE_TYPE_2},     // {RESPONSE_DESC_2}
  "{RESPONSE_FIELD_3}": {RESPONSE_TYPE_3}      // {RESPONSE_DESC_3}
}
```

#### 统一响应格式
```
{
  "success": boolean,                    // 操作是否成功
  "code": {STATUS_CODE_TYPE},           // 状态码/错误码
  "message": string,                     // 状态消息
  "data": {DATA_TYPE},                  // 具体数据
  "timestamp": {TIMESTAMP_TYPE}         // 响应时间戳
}
```

### 枚举类型

#### {ENUM_TYPE_1}
**用途**: {ENUM_1_PURPOSE}
**可选值**:
- **{ENUM_VALUE_1_1}**: {ENUM_DESC_1_1}
- **{ENUM_VALUE_1_2}**: {ENUM_DESC_1_2}
- **{ENUM_VALUE_1_3}**: {ENUM_DESC_1_3}

#### {ENUM_TYPE_2}
**用途**: {ENUM_2_PURPOSE}
**可选值**:
- **{ENUM_VALUE_2_1}**: {ENUM_DESC_2_1}
- **{ENUM_VALUE_2_2}**: {ENUM_DESC_2_2}

## 错误处理

### 错误响应格式
```
{
  "success": false,
  "code": {ERROR_CODE},
  "message": "{ERROR_MESSAGE}",
  "details": {ERROR_DETAILS},           // 详细错误信息(可选)
  "timestamp": "{TIMESTAMP}"
}
```

### 错误码定义

#### 通用错误码
- **{COMMON_ERROR_1}**: {COMMON_ERROR_DESC_1}
- **{COMMON_ERROR_2}**: {COMMON_ERROR_DESC_2}
- **{COMMON_ERROR_3}**: {COMMON_ERROR_DESC_3}

#### 业务错误码

##### {MODULE_1}相关错误
- **{MODULE_1_ERROR_1}**: {MODULE_1_ERROR_DESC_1}
- **{MODULE_1_ERROR_2}**: {MODULE_1_ERROR_DESC_2}

##### {MODULE_2}相关错误
- **{MODULE_2_ERROR_1}**: {MODULE_2_ERROR_DESC_1}
- **{MODULE_2_ERROR_2}**: {MODULE_2_ERROR_DESC_2}

### 错误处理策略
**客户端处理建议**:
- **重试机制**: {RETRY_STRATEGY}
- **错误展示**: {ERROR_DISPLAY_STRATEGY}
- **降级处理**: {FALLBACK_STRATEGY}

## 认证和授权

### 认证方式
**认证类型**: {AUTH_TYPE} (Token/OAuth/API Key/等)
**Token格式**: {TOKEN_FORMAT}
**Token有效期**: {TOKEN_EXPIRY}
**刷新机制**: {TOKEN_REFRESH_MECHANISM}

### 权限等级
- **{PERMISSION_LEVEL_1}**: {PERMISSION_DESC_1}
- **{PERMISSION_LEVEL_2}**: {PERMISSION_DESC_2}
- **{PERMISSION_LEVEL_3}**: {PERMISSION_DESC_3}

### 请求头要求
```
{
  "Authorization": "{AUTH_HEADER_FORMAT}",
  "Content-Type": "{CONTENT_TYPE}",
  "Accept": "{ACCEPT_TYPE}",
  "{CUSTOM_HEADER}": "{CUSTOM_HEADER_VALUE}"
}
```

## 使用示例

### 基本使用流程

#### 1. 认证获取Token
```
{AUTHENTICATION_EXAMPLE}
```

#### 2. 调用核心接口
```
{CORE_API_EXAMPLE}
```

#### 3. 处理响应
```
{RESPONSE_HANDLING_EXAMPLE}
```

### 常见使用场景

#### 场景1: {SCENARIO_1_NAME}
**业务描述**: {SCENARIO_1_DESCRIPTION}
**调用序列**:
1. {SCENARIO_1_STEP_1}
2. {SCENARIO_1_STEP_2}
3. {SCENARIO_1_STEP_3}

#### 场景2: {SCENARIO_2_NAME}
**业务描述**: {SCENARIO_2_DESCRIPTION}
**调用序列**:
1. {SCENARIO_2_STEP_1}
2. {SCENARIO_2_STEP_2}
3. {SCENARIO_2_STEP_3}

### 错误处理示例
```
{ERROR_HANDLING_EXAMPLE}
```

## 性能和限制

### 接口限制
**请求频率限制**: {RATE_LIMIT}
**并发连接限制**: {CONCURRENT_LIMIT}
**数据大小限制**: {DATA_SIZE_LIMIT}
**超时设置**: {TIMEOUT_CONFIG}

### 性能优化建议
- **缓存策略**: {CACHING_RECOMMENDATIONS}
- **批量操作**: {BATCH_OPERATION_TIPS}
- **数据压缩**: {COMPRESSION_SUPPORT}
- **CDN使用**: {CDN_RECOMMENDATIONS}

### 监控和日志
**请求日志**: {REQUEST_LOGGING_INFO}
**性能监控**: {PERFORMANCE_MONITORING}
**错误追踪**: {ERROR_TRACKING}

## 版本兼容性

### 版本策略
**版本控制策略**: {VERSIONING_POLICY}
**向后兼容**: {BACKWARD_COMPATIBILITY}
**废弃通知**: {DEPRECATION_POLICY}

### 版本差异
**当前版本({CURRENT_VERSION})特性**:
- {CURRENT_VERSION_FEATURE_1}
- {CURRENT_VERSION_FEATURE_2}

**下一版本({NEXT_VERSION})计划**:
- {NEXT_VERSION_FEATURE_1}
- {NEXT_VERSION_FEATURE_2}

### 迁移指南
**从{OLD_VERSION}到{NEW_VERSION}**:
1. {MIGRATION_STEP_1}
2. {MIGRATION_STEP_2}
3. {MIGRATION_STEP_3}

## 开发工具和SDK

### 官方SDK
- **{LANGUAGE_1} SDK**: {SDK_1_INFO}
- **{LANGUAGE_2} SDK**: {SDK_2_INFO}
- **{LANGUAGE_3} SDK**: {SDK_3_INFO}

### 测试工具
**API测试**: {API_TESTING_TOOLS}
**Mock服务**: {MOCK_SERVICE_INFO}
**调试工具**: {DEBUG_TOOLS}

### 开发环境
**测试环境**: {TEST_ENVIRONMENT_URL}
**沙箱环境**: {SANDBOX_ENVIRONMENT_URL}
**文档工具**: {DOCUMENTATION_TOOLS}

---

## 模板使用说明

### API信息占位符
- **{API_TYPE}**: API类型（REST/GraphQL等）
- **{BASE_URL}**: API基础URL
- **{API_VERSION}**: API版本号
- **{AUTHENTICATION_METHOD}**: 认证方式

### 接口定义占位符
- **{MODULE_N}**: 模块名称
- **{INTERFACE_N_M}**: 接口名称
- **{INTERFACE_N_M_DESCRIPTION}**: 接口功能描述
- **{INTERFACE_N_M_ENDPOINT}**: 接口路径

### 参数和响应占位符
- **{PARAM_N_M}**: 参数名称
- **{PARAM_N_M_TYPE}**: 参数类型
- **{PARAM_N_M_DESCRIPTION}**: 参数描述
- **{RESPONSE_FIELD_N_M}**: 响应字段名称

### 数据模型占位符
- **{REQUEST_MODEL_N}**: 请求数据模型名称
- **{RESPONSE_MODEL_N}**: 响应数据模型名称
- **{FIELD_N_M}**: 字段名称
- **{FIELD_N_M_TYPE}**: 字段类型

### 错误处理占位符
- **{ERROR_CODE_N}**: 错误码
- **{ERROR_DESCRIPTION_N}**: 错误描述
- **{MODULE_N_ERROR_N}**: 模块特定错误码

### 使用场景占位符
- **{SCENARIO_N_NAME}**: 使用场景名称
- **{SCENARIO_N_DESCRIPTION}**: 场景描述
- **{SCENARIO_N_STEP_N}**: 场景步骤

### 使用建议
1. **技术栈适配**: 模板适用于各种API类型和技术栈
2. **完整性**: 确保API文档的完整性和准确性
3. **示例丰富**: 提供充分的使用示例和错误处理示例
4. **版本管理**: 及时更新版本信息和兼容性说明
5. **开发者友好**: 提供必要的工具和SDK信息