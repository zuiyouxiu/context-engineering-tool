# 系统模式

本文件记录项目中使用的重复模式和标准，为开发团队提供一致的编码和架构指导。

## 编码模式

### 🎯 TypeScript编码标准

#### 类型定义模式
```typescript
// 使用接口定义复杂对象类型
interface ContextInfo {
  readonly id: string;
  readonly type: ContextType;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Date;
}

// 使用联合类型定义枚举值
type TaskType = 'architecture' | 'feature' | 'bugfix' | 'refactor' | 'decision' | 'progress' | 'general';

// 使用泛型提高代码复用性
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<boolean>;
}
```

#### 错误处理模式
```typescript
// 使用Result模式处理可能失败的操作
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// 统一的错误处理函数
function handleError(error: unknown, context: string): never {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(`[${context}] ${message}`);
}

// 异步操作的错误处理
async function safeExecute<T>(
  operation: () => Promise<T>,
  context: string
): Promise<Result<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

#### 配置管理模式
```typescript
// 使用只读配置对象
const CONFIG = {
  memory: {
    maxHistoryItems: 20,
    maxKnowledgeItems: 10,
    maxContextSize: 50000,
  },
  paths: {
    contextDir: 'context-engineering',
    coreContextDir: 'core-context',
    memoryDir: 'memory',
  },
} as const;

// 环境变量处理
function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}
```

### 📝 文档注释模式

#### JSDoc标准
```typescript
/**
 * 构建动态上下文信息
 * @param rootPath - 项目根目录路径
 * @param taskType - 任务类型，用于优化上下文构建策略
 * @param userInput - 用户输入的具体需求或问题
 * @param priority - 任务优先级，影响资源分配
 * @returns 构建的上下文信息和质量评估结果
 * @throws {Error} 当路径无效或任务类型不支持时抛出错误
 * @example
 * ```typescript
 * const context = await buildDynamicContext(
 *   '/path/to/project',
 *   'feature',
 *   '添加用户认证功能',
 *   'high'
 * );
 * ```
 */
async function buildDynamicContext(
  rootPath: string,
  taskType: TaskType,
  userInput: string,
  priority: Priority = 'medium'
): Promise<ContextBuildResult> {
  // 实现...
}
```

## 架构模式

### 🏗️ 模块化架构

#### 依赖注入模式
```typescript
// 定义服务接口
interface MemoryService {
  getShortTermMemory(sessionId: string): Promise<ShortTermMemory>;
  updateUserProfile(profile: UserProfile): Promise<void>;
}

// 实现服务
class FileBasedMemoryService implements MemoryService {
  constructor(private readonly basePath: string) {}

  async getShortTermMemory(sessionId: string): Promise<ShortTermMemory> {
    // 实现...
  }
}

// 服务容器
class ServiceContainer {
  private services = new Map<string, unknown>();

  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) throw new Error(`Service ${name} not found`);
    return service as T;
  }
}
```

#### 策略模式
```typescript
// 上下文构建策略
interface ContextBuildStrategy {
  build(input: ContextBuildInput): Promise<ContextInfo>;
}

class ArchitectureContextStrategy implements ContextBuildStrategy {
  async build(input: ContextBuildInput): Promise<ContextInfo> {
    // 架构相关的上下文构建逻辑
  }
}

class FeatureContextStrategy implements ContextBuildStrategy {
  async build(input: ContextBuildInput): Promise<ContextInfo> {
    // 功能开发相关的上下文构建逻辑
  }
}

// 策略工厂
class ContextStrategyFactory {
  private strategies = new Map<TaskType, ContextBuildStrategy>();

  constructor() {
    this.strategies.set('architecture', new ArchitectureContextStrategy());
    this.strategies.set('feature', new FeatureContextStrategy());
  }

  getStrategy(taskType: TaskType): ContextBuildStrategy {
    const strategy = this.strategies.get(taskType);
    if (!strategy) throw new Error(`No strategy for task type: ${taskType}`);
    return strategy;
  }
}
```

#### 观察者模式
```typescript
// 事件系统
interface EventListener<T = unknown> {
  handle(event: T): Promise<void>;
}

class EventEmitter<T = unknown> {
  private listeners: EventListener<T>[] = [];

  subscribe(listener: EventListener<T>): void {
    this.listeners.push(listener);
  }

  async emit(event: T): Promise<void> {
    await Promise.all(this.listeners.map(l => l.handle(event)));
  }
}

// 记忆更新事件
interface MemoryUpdateEvent {
  type: 'short-term' | 'long-term';
  sessionId?: string;
  data: unknown;
}

class MemoryUpdateListener implements EventListener<MemoryUpdateEvent> {
  async handle(event: MemoryUpdateEvent): Promise<void> {
    // 处理记忆更新事件
  }
}
```

### 🔄 数据流模式

#### 管道模式
```typescript
// 处理管道
interface Processor<TInput, TOutput> {
  process(input: TInput): Promise<TOutput>;
}

class ProcessingPipeline<T> {
  private processors: Processor<T, T>[] = [];

  addProcessor(processor: Processor<T, T>): this {
    this.processors.push(processor);
    return this;
  }

  async execute(input: T): Promise<T> {
    let result = input;
    for (const processor of this.processors) {
      result = await processor.process(result);
    }
    return result;
  }
}

// 上下文处理管道
const contextPipeline = new ProcessingPipeline<ContextInfo>()
  .addProcessor(new ValidationProcessor())
  .addProcessor(new EnrichmentProcessor())
  .addProcessor(new QualityCheckProcessor())
  .addProcessor(new FormattingProcessor());
```

## 测试模式

### 🧪 单元测试模式

#### 测试结构模式
```typescript
// 使用describe/it结构组织测试
describe('ContextBuilder', () => {
  let contextBuilder: ContextBuilder;
  let mockMemoryService: jest.Mocked<MemoryService>;

  beforeEach(() => {
    mockMemoryService = createMockMemoryService();
    contextBuilder = new ContextBuilder(mockMemoryService);
  });

  describe('buildContext', () => {
    it('should build context for architecture tasks', async () => {
      // Arrange
      const input = createTestInput('architecture');

      // Act
      const result = await contextBuilder.buildContext(input);

      // Assert
      expect(result.type).toBe('architecture');
      expect(result.quality.score).toBeGreaterThan(0.8);
    });

    it('should handle invalid input gracefully', async () => {
      // Arrange
      const invalidInput = createInvalidInput();

      // Act & Assert
      await expect(contextBuilder.buildContext(invalidInput))
        .rejects.toThrow('Invalid input');
    });
  });
});
```

#### Mock模式
```typescript
// 创建测试辅助函数
function createMockMemoryService(): jest.Mocked<MemoryService> {
  return {
    getShortTermMemory: jest.fn(),
    updateUserProfile: jest.fn(),
  };
}

function createTestInput(taskType: TaskType): ContextBuildInput {
  return {
    rootPath: '/test/project',
    taskType,
    userInput: 'Test input',
    priority: 'medium',
  };
}

// 使用工厂函数创建测试数据
class TestDataFactory {
  static createContextInfo(overrides: Partial<ContextInfo> = {}): ContextInfo {
    return {
      id: 'test-id',
      type: 'feature',
      metadata: {},
      createdAt: new Date(),
      ...overrides,
    };
  }
}
```

### 🔍 集成测试模式

#### 测试环境设置
```typescript
// 测试环境配置
class TestEnvironment {
  private tempDir: string;

  async setup(): Promise<void> {
    this.tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'context-test-'));
    await this.createTestProject();
  }

  async teardown(): Promise<void> {
    await fs.rm(this.tempDir, { recursive: true, force: true });
  }

  private async createTestProject(): Promise<void> {
    // 创建测试项目结构
  }

  getProjectPath(): string {
    return this.tempDir;
  }
}
```

## 文件组织模式

### 📁 目录结构标准
```
src/
├── core/                    # 核心业务逻辑
│   ├── __tests__/          # 核心模块测试
│   ├── context-builder.ts
│   ├── memory-manager.ts
│   └── index.ts            # 导出核心接口
├── services/               # 服务层
│   ├── __tests__/
│   └── intelligent-formatter.ts
├── types/                  # 类型定义
│   ├── context-types.ts
│   └── index.ts
├── utils/                  # 工具函数
│   ├── __tests__/
│   ├── path-utils.ts
│   └── index.ts
└── index.ts               # 主入口文件
```

### 📄 文件命名规范
- **模块文件**: kebab-case (context-builder.ts)
- **类型文件**: kebab-case + types后缀 (context-types.ts)
- **测试文件**: 与源文件同名 + .test.ts后缀
- **配置文件**: 全小写 (tsconfig.json, package.json)

### 📦 导出模式
```typescript
// 模块内部导出
export { ContextBuilder } from './context-builder';
export { MemoryManager } from './memory-manager';
export type { ContextInfo, TaskType } from './types';

// 主入口文件导出
export * from './core';
export * from './services';
export * from './types';
export * from './utils';
```

## 性能优化模式

### ⚡ 缓存模式
```typescript
// LRU缓存实现
class LRUCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private maxSize: number) {}

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移到最前面
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

### 🔄 懒加载模式
```typescript
// 懒加载装饰器
function lazy<T>(factory: () => T): () => T {
  let instance: T;
  let initialized = false;

  return () => {
    if (!initialized) {
      instance = factory();
      initialized = true;
    }
    return instance;
  };
}

// 使用示例
const getExpensiveService = lazy(() => new ExpensiveService());
```

---
**更新日志**:
- 2025-07-24 15:24:16 - 初始化文件结构
- 2025-07-24 15:42:00 - 完善编码模式、架构模式、测试模式和性能优化模式