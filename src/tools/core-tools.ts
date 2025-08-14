// 上下文管理MCP工具 - 专注于上下文工程文件管理
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { promises as fs } from 'fs';
import * as path from 'path';
import { normalizePath, formatTimestamp } from '../utils/path-utils.js';
import { getContextEngineeringTemplates, getDetailedFileGuide } from '../legacy/context-templates.js';

/**
 * 注册上下文管理MCP工具
 */
export function registerCoreTools(server: McpServer) {
  
  // 工具1: 获取完整项目上下文信息
  server.tool(
    "get-context-info",
    `读取并返回所有上下文工程管理文件内容
提供项目完整上下文信息用于AI理解项目状态`,
    {
      rootPath: z.string().describe("项目根目录路径")
    },
    async ({ rootPath }) => {
      try {
        const contextDir = path.join(rootPath, 'context-docs');
        const files = ['productContext.md', 'activeContext.md', 'progress.md', 'decisionLog.md', 'systemPatterns.md'];
        
        let contextInfo = `# 项目上下文信息\n\n`;
        
        for (const file of files) {
          const filePath = path.join(contextDir, file);
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            contextInfo += `## ${file}\n\n${content}\n\n---\n\n`;
          } catch {
            contextInfo += `## ${file}\n\n*文件不存在或无法读取*\n\n---\n\n`;
          }
        }

        return {
          content: [{
            type: "text",
            text: contextInfo
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `获取上下文信息失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具2: 更新上下文工程管理文件
  server.tool(
    "update-context-engineering",
    `更新指定的上下文工程管理文件
根据变更类型和描述更新相应的上下文文件`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      changeType: z.enum(['architecture', 'feature', 'bugfix', 'refactor', 'decision', 'progress', 'legacy-analysis', 'legacy-understanding', 'legacy-discovery']).describe("变更类型"),
      description: z.string().describe("变更描述"),
      targetFile: z.enum(['productContext.md', 'activeContext.md', 'progress.md', 'decisionLog.md', 'systemPatterns.md']).optional().describe("目标文件（可选，将根据changeType自动选择）")
    },
    async ({ rootPath, changeType, description, targetFile }) => {
      try {
        const contextDir = path.join(rootPath, 'context-docs');
        await fs.mkdir(contextDir, { recursive: true });

        // 根据变更类型确定目标文件
        let fileToUpdate = targetFile;
        if (!fileToUpdate) {
          switch (changeType) {
            case 'architecture':
              fileToUpdate = 'productContext.md';
              break;
            case 'feature':
              fileToUpdate = 'activeContext.md';
              break;
            case 'bugfix':
              fileToUpdate = 'activeContext.md';
              break;
            case 'refactor':
              fileToUpdate = 'systemPatterns.md';
              break;
            case 'decision':
              fileToUpdate = 'decisionLog.md';
              break;
            case 'progress':
              fileToUpdate = 'progress.md';
              break;
            case 'legacy-analysis':
              fileToUpdate = 'productContext.md';
              break;
            case 'legacy-understanding':
              fileToUpdate = 'activeContext.md';
              break;
            case 'legacy-discovery':
              fileToUpdate = 'systemPatterns.md';
              break;
          }
        }

        const filePath = path.join(contextDir, fileToUpdate);
        const timestamp = formatTimestamp();
        
        // 读取现有内容
        let existingContent = '';
        try {
          existingContent = await fs.readFile(filePath, 'utf-8');
        } catch {
          // 文件不存在，使用模板
          const templates = getContextEngineeringTemplates();
          existingContent = templates[fileToUpdate] || '';
        }

        // 智能插入内容
        const { section, insertStyle } = getTargetSectionForChange(changeType, fileToUpdate);
        const formattedContent = formatContentForSection(description, changeType, fileToUpdate);
        
        let updatedContent: string;
        if (section && existingContent.includes(section)) {
          // 插入到指定section
          updatedContent = insertContentIntoSection(existingContent, section, formattedContent, insertStyle);
        } else {
          // 如果没有找到section，追加到末尾（向后兼容）
          updatedContent = existingContent + '\n\n' + formattedContent;
        }

        await fs.writeFile(filePath, updatedContent);

        return {
          content: [{
            type: "text",
            text: `✅ 已更新 ${fileToUpdate}${section ? ` (${section})` : ''}：\n\n${formattedContent.substring(0, 200)}${formattedContent.length > 200 ? '...' : ''}`
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `更新上下文文件失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 工具3: 初始化上下文工程管理结构
  server.tool(
    "init-context-engineering",
    `初始化context-docs目录和核心文件
创建完整的上下文工程管理文件结构`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      force: z.boolean().default(false).describe("是否强制重新初始化（覆盖现有文件）")
    },
    async ({ rootPath, force }) => {
      try {
        const contextDir = path.join(rootPath, 'context-docs');
        await fs.mkdir(contextDir, { recursive: true });

        const templates = getContextEngineeringTemplates();
        const guide = getDetailedFileGuide();
        let createdFiles = [];
        let existingFiles = [];

        for (const [filename, content] of Object.entries(templates)) {
          const filePath = path.join(contextDir, filename);
          
          // 检查文件是否存在
          try {
            await fs.access(filePath);
            if (!force) {
              existingFiles.push(filename);
              continue;
            }
          } catch {
            // 文件不存在，可以创建
          }

          await fs.writeFile(filePath, content);
          createdFiles.push(filename);
        }

        let result = `# 上下文工程管理初始化完成\n\n`;
        
        if (createdFiles.length > 0) {
          result += `## ✅ 已创建文件\n${createdFiles.map(f => `- ${f}`).join('\n')}\n\n`;
        }

        if (existingFiles.length > 0) {
          result += `## ℹ️ 已存在文件（未覆盖）\n${existingFiles.map(f => `- ${f}`).join('\n')}\n\n`;
          result += `使用 force: true 参数可强制覆盖现有文件。\n\n`;
        }

        result += `## 📋 文件说明\n`;
        for (const [filename, info] of Object.entries(guide)) {
          result += `### ${filename}\n**作用**: ${info.role}\n**优先级**: ${info.priority}\n\n`;
        }

        return {
          content: [{
            type: "text",
            text: result
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `初始化上下文工程失败: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );
}

// 辅助函数：智能section定位和内容插入
function getTargetSectionForChange(changeType: string, targetFile: string): { section: string; insertStyle: 'append' | 'prepend' } {
  const sectionMap: Record<string, Record<string, { section: string; insertStyle: 'append' | 'prepend' }>> = {
    'productContext.md': {
      'architecture': { section: '## 整体架构', insertStyle: 'append' },
      'feature': { section: '## 关键功能', insertStyle: 'append' },
      'legacy-analysis': { section: '## 存量项目分析 (LEGACY_PROJECT_ANALYSIS)', insertStyle: 'append' },
      'default': { section: '## 项目目标', insertStyle: 'append' }
    },
    'activeContext.md': {
      'feature': { section: '## 当前关注点', insertStyle: 'prepend' },
      'bugfix': { section: '## 最近变更', insertStyle: 'prepend' },
      'progress': { section: '## 最近变更', insertStyle: 'prepend' },
      'legacy-understanding': { section: '## 存量项目理解进度 (KNOWLEDGE_RECONSTRUCTION)', insertStyle: 'append' },
      'default': { section: '## 当前关注点', insertStyle: 'prepend' }
    },
    'progress.md': {
      'progress': { section: '## 当前任务', insertStyle: 'append' },
      'feature': { section: '## 当前任务', insertStyle: 'append' },
      'default': { section: '## 当前任务', insertStyle: 'append' }
    },
    'decisionLog.md': {
      'decision': { section: '## 决策', insertStyle: 'append' },
      'architecture': { section: '## 决策', insertStyle: 'append' },
      'default': { section: '## 决策', insertStyle: 'append' }
    },
    'systemPatterns.md': {
      'refactor': { section: '## 编码模式', insertStyle: 'append' },
      'architecture': { section: '## 架构模式', insertStyle: 'append' },
      'legacy-discovery': { section: '## 存量项目考古发现 (ARCHAEOLOGICAL_FINDINGS)', insertStyle: 'append' },
      'default': { section: '## 编码模式', insertStyle: 'append' }
    }
  };

  const fileMap = sectionMap[targetFile];
  if (!fileMap) return { section: '', insertStyle: 'append' };
  
  return fileMap[changeType] || fileMap['default'];
}

function formatContentForSection(content: string, changeType: string, targetFile: string): string {
  const timestamp = formatTimestamp();
  
  // 根据文件类型格式化内容
  switch (targetFile) {
    case 'decisionLog.md':
      // 决策日志需要结构化格式
      return `### ${timestamp} - ${changeType}

**决策内容**：
${content}

**时间**：${timestamp}
`;

    case 'progress.md':
      // 进度文件使用任务列表格式
      const lines = content.split('\n').filter(line => line.trim());
      const taskItems = lines.map(line => line.startsWith('- ') ? line : `- ${line}`).join('\n');
      return `${taskItems}

*更新时间：${timestamp}*
`;

    default:
      // 其他文件使用通用格式
      return `### ${timestamp} - ${changeType}

${content}
`;
  }
}

function insertContentIntoSection(existingContent: string, targetSection: string, newContent: string, insertStyle: 'append' | 'prepend'): string {
  const lines = existingContent.split('\n');
  let sectionIndex = -1;
  let nextSectionIndex = lines.length;
  
  // 找到目标section
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === targetSection.trim()) {
      sectionIndex = i;
      break;
    }
  }
  
  // 如果没找到section，追加到末尾
  if (sectionIndex === -1) {
    return existingContent + '\n\n' + targetSection + '\n\n' + newContent;
  }
  
  // 找到下一个section的开始位置
  for (let i = sectionIndex + 1; i < lines.length; i++) {
    if (lines[i].match(/^#{1,6}\s/)) {
      nextSectionIndex = i;
      break;
    }
  }
  
  // 在section内插入内容
  const beforeSection = lines.slice(0, sectionIndex + 1);
  const sectionContent = lines.slice(sectionIndex + 1, nextSectionIndex);
  const afterSection = lines.slice(nextSectionIndex);
  
  // 移除section末尾的空行
  while (sectionContent.length > 0 && sectionContent[sectionContent.length - 1].trim() === '') {
    sectionContent.pop();
  }
  
  let updatedSection: string[];
  if (insertStyle === 'prepend') {
    updatedSection = ['', newContent, ''].concat(sectionContent);
  } else {
    updatedSection = sectionContent.concat(['', newContent]);
  }
  
  return beforeSection.concat(updatedSection).concat([''], afterSection).join('\n');
}

