/**
 * 路径规范化函数 - 处理跨平台路径问题
 */
export declare function normalizePath(inputPath: string): string;
/**
 * 格式化时间戳
 */
export declare function formatTimestamp(): string;
/**
 * 检查路径是否为绝对路径
 */
export declare function isAbsolutePath(inputPath: string): boolean;
/**
 * 安全地连接路径
 */
export declare function safeJoinPath(...paths: string[]): string;
/**
 * 获取相对路径
 */
export declare function getRelativePath(from: string, to: string): string;
//# sourceMappingURL=path-utils.d.ts.map