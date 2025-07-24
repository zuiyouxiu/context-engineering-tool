// 路径工具函数

import * as path from 'path';

/**
 * 路径规范化函数 - 处理跨平台路径问题
 */
export function normalizePath(inputPath: string): string {
  let processedPath = inputPath;

  // 检测是否包含URL编码模式
  if (/%[0-9A-Fa-f]{2}/.test(inputPath)) {
    try {
      processedPath = decodeURIComponent(inputPath);
    } catch (error) {
      console.warn(`Failed to decode URL path: ${inputPath}`, error);
      // 解码失败时使用原始路径
    }
  }

  // 处理Windows盘符路径：移除前导斜杠（如 /d: -> d:）
  if (/^\/[a-zA-Z]:/.test(processedPath)) {
    processedPath = processedPath.substring(1);
  }

  // 执行标准路径规范化
  let normalized = path.normalize(processedPath);

  // 移除尾部路径分隔符
  if (normalized.endsWith(path.sep)) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 检查路径是否为绝对路径
 */
export function isAbsolutePath(inputPath: string): boolean {
  return path.isAbsolute(normalizePath(inputPath));
}

/**
 * 安全地连接路径
 */
export function safeJoinPath(...paths: string[]): string {
  const normalizedPaths = paths.map(p => normalizePath(p));
  return path.join(...normalizedPaths);
}

/**
 * 获取相对路径
 */
export function getRelativePath(from: string, to: string): string {
  const normalizedFrom = normalizePath(from);
  const normalizedTo = normalizePath(to);
  return path.relative(normalizedFrom, normalizedTo);
}