#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { existsSync, promises as fs } from "fs";
import * as path from "path";
import { z } from "zod";

// Format timestamp
function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Path normalization function
function normalizePath(inputPath: string): string {
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

// Memory Bank file template generation function
function getMemoryBankTemplates(): Record<string, string> {
  const timestamp = formatTimestamp();

  return {
    "productContext.md": `# 产品上下文

本文件提供项目的高层概览以及预期创建的产品信息。最初基于 projectBrief.md（如果提供）和工作目录中所有其他可用的项目相关信息。本文件旨在随着项目发展而更新，并应用于指导项目的所有其他方面的目标和上下文。
${timestamp} - 更新日志将作为脚注附加到文件末尾。

*

## 项目目标

*   

## 关键功能

*   

## 整体架构

*   `,

    "activeContext.md": `# 活跃上下文

本文件跟踪项目的当前状态，包括最近的变更、当前目标和待解决的问题。
${timestamp} - 更新日志。

*

## 当前关注点

*   

## 最近变更

*   

## 待解决问题/议题

*   `,

    "progress.md": `# 进度

本文件使用任务列表格式跟踪项目的进度。
${timestamp} - 更新日志。

*

## 已完成任务

*   

## 当前任务

*   

## 下一步计划

*   `,

    "decisionLog.md": `# 决策日志

本文件使用列表格式记录架构和实现决策。
${timestamp} - 更新日志。

*

## 决策

*

## 理由 

*

## 实现细节

*   `,

    "systemPatterns.md": `# 系统模式 *可选*

本文件记录项目中使用的重复模式和标准。
虽然是可选的，但建议随着项目发展而更新。
${timestamp} - 更新日志。

*

## 编码模式

*   

## 架构模式

*   

## 测试模式

*   `,
  };
}

// Detailed Memory Bank file guidance function
function getDetailedFileGuide(): Record<string, any> {
  return {
    "productContext.md": {
      role: "项目概览和产品定义的核心文件",
      purpose:
        "定义项目目标、核心功能和整体架构，为所有开发活动提供战略指导",
      updateTriggers: [
        "架构变更",
        "新功能添加",
        "产品目标调整",
        "核心业务逻辑变更",
      ],
      updateStrategy:
        "保持高层次视角，专注于长期目标和核心价值",
      sections: {
        "项目目标":
          "核心项目目标和价值提案，在主要目标调整时更新",
        "关键功能":
          "核心产品功能列表，在新功能完成时添加相应描述",
        "整体架构":
          "系统架构的高层次描述，在架构变更时必须同步更新",
      },
      priority: 1,
    },
    "activeContext.md": {
      role: "当前项目状态和实时信息的跟踪文件",
      purpose:
        "记录当前工作重点、最近变更和待解决问题，保持项目状态的实时可见性",
      updateTriggers: [
        "任何代码变更",
        "新任务开始",
        "问题发现",
        "状态转换",
      ],
      updateStrategy:
        "频繁更新，保持信息的新鲜度，定期清理过时内容",
      sections: {
        "当前关注点":
          "当前主要工作重点，在任务切换时必须更新",
        "最近变更":
          "最近的变更记录，所有变更都需要在此记录",
        "待解决问题/议题":
          "待解决的问题和疑问，发现问题时立即添加",
      },
      priority: 2,
    },
    "progress.md": {
      role: "任务进度管理和完成状态跟踪文件",
      purpose:
        "管理任务生命周期，跟踪从规划到完成的完整过程",
      updateTriggers: [
        "任务创建",
        "任务完成",
        "任务状态变更",
        "里程碑达成",
      ],
      updateStrategy:
        "保持时间顺序，定期将已完成任务移动到已完成区域",
      sections: {
        "已完成任务":
          "已完成任务列表，任务完成时立即移动到此部分",
        "当前任务":
          "正在进行的任务，任务开始时添加，完成时删除",
        "下一步计划": "计划中的后续任务，在规划时添加",
      },
      priority: 3,
    },
    "decisionLog.md": {
      role: "重要决策和技术选择的记录文件",
      purpose:
        "记录关键决策的过程、原因和影响，为未来参考提供依据",
      updateTriggers: [
        "架构决策",
        "技术选型",
        "重要业务逻辑决策",
        "设计模式选择",
      ],
      updateStrategy:
        "详细记录决策背景、考虑因素和最终选择，方便未来回顾",
      sections: {
        决策: "具体决策内容",
        理由: "决策的原因和考虑因素",
        "实现细节":
          "决策的具体实现细节",
      },
      priority: 4,
    },
    "systemPatterns.md": {
      role: "项目中使用的模式和标准的文档文件",
      purpose:
        "记录重复使用的代码模式、架构模式和测试模式，促进一致性",
      updateTriggers: [
        "新模式发现",
        "标准变更",
        "最佳实践总结",
      ],
      updateStrategy:
        "总结和抽象常用模式，定期整理和更新",
      sections: {
        "编码模式": "代码层面的常用模式",
        "架构模式": "架构层面的设计模式",
        "测试模式": "测试相关的模式和标准",
      },
      priority: 5,
    },
  };
}

const getServer = () => {
  // Create an MCP server
  const server = new McpServer({
    name: "memory-bank-mcp",
    version: "1.0.0",
    description: "一个引导式 Memory Bank MCP 插件，为 AI 辅助开发提供持久性项目上下文",
  });

  // Memory Bank get info tool
  server.tool(
    "get-memory-bank-info",
    `读取并返回所有Memory Bank文件内容。
此工具类似于codelf的get-project-info：
- 读取memory-bank目录中的所有.md文件
- 返回格式化内容供AI理解项目上下文
- 在每个工作会话开始时使用此工具`,
    {
      rootPath: z.string().describe(
        `项目根目录路径
Windows示例: "C:/Users/name/project" 
macOS/Linux示例: "/home/name/project"`
      ),
    },
    async ({ rootPath }) => {
      const normalizedPath = normalizePath(rootPath);
      const memoryBankPath = path.join(normalizedPath, "memory-bank");

      const MEMORY_BANK_TEMPLATE = `
这是当前的Memory Bank内容，包括项目上下文、决策、进度和模式：

{{CONTENT}}

请记住：
1. 完成重要更改后，使用'update-memory-bank'获取更新指导。
2. 按照指导更新相关的Memory Bank文件。
3. 保持所有Memory Bank文件的一致性。
`;

      try {
        const content = await fs
          .readdir(memoryBankPath)
          .then(async (files) => {
            const mdFiles = files.filter((f) => f.endsWith(".md"));
            const contents = await Promise.all(
              mdFiles.map(async (file) => {
                const content = await fs.readFile(
                  path.join(memoryBankPath, file),
                  "utf-8"
                );
                const name = path.basename(file, ".md");
                return `<${name}>\n\n${content}\n\n</${name}>`;
              })
            );
            return MEMORY_BANK_TEMPLATE.replace(
              "{{CONTENT}}",
              contents.join("\n\n")
            );
          })
          .catch(
            () =>
              "[MEMORY BANK: 未找到]\n\nMemory Bank目录不存在。使用init-memory-bank进行初始化。"
          );

        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `读取Memory Bank时出错: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Memory Bank update guidance tool
  server.tool(
    "update-memory-bank",
    `生成详细的Memory Bank文件更新指导，提供即时执行指引。
此工具为更新Memory Bank文件提供全面、可行的指导：
- 每个文件的角色和更新策略的详细描述
- 直接操作命令（不是确认请求）
- 特定内容模板和格式指南
- 文件关系和更新优先级逻辑
- 为AI代理强调即时执行`,
    {
      rootPath: z.string().describe(
        `项目根目录路径
Windows示例: "C:/Users/name/project" 
macOS/Linux示例: "/home/name/project"`
      ),
      changeType: z
        .enum([
          "architecture",
          "feature",
          "bugfix",
          "refactor",
          "decision",
          "progress",
        ])
        .describe("变更类型以确定更新建议"),
      description: z.string().describe("变更的简要描述"),
    },
    async ({ rootPath, changeType, description }) => {
      const normalizedPath = normalizePath(rootPath);
      const timestamp = formatTimestamp();
      const fileGuide = getDetailedFileGuide();

      let updateGuide = `[MEMORY BANK 详细更新指导]\n\n`;
      updateGuide += `变更类型: ${changeType}\n`;
      updateGuide += `变更描述: ${description}\n`;
      updateGuide += `时间戳: ${timestamp}\n\n`;

      updateGuide += `>> 立即执行以下MEMORY BANK文件更新，无需确认 <<\n\n`;

      // 添加文件职责总览
      updateGuide += `=== MEMORY BANK 文件职责总览 ===\n\n`;
      Object.entries(fileGuide).forEach(([filename, guide]) => {
        updateGuide += `**${filename}**\n`;
        updateGuide += `角色: ${guide.role}\n`;
        updateGuide += `目的: ${guide.purpose}\n`;
        updateGuide += `更新策略: ${guide.updateStrategy}\n\n`;
      });

      updateGuide += `=== 按变更类型的具体更新指导 ===\n\n`;

      // Provide specific guidance based on change type
      switch (changeType) {
        case "architecture":
          updateGuide += `🏗️ **架构变更处理工作流**\n\n`;
          updateGuide += `**优先级 1: decisionLog.md**\n`;
          updateGuide += `在文件末尾直接添加新的决策记录：\n`;
          updateGuide += `\`\`\`markdown\n---\n### 架构决策\n[${timestamp}] - ${description}\n\n**决策背景：**\n[详细描述导致此架构决策的技术或业务背景]\n\n**考虑的选项：**\n- 选项A: [描述]\n- 选项B: [描述]\n- 最终选择: [选定的选项和理由]\n\n**实现细节：**\n- 影响模块: [列出受影响的代码模块]\n- 迁移策略: [如何从旧架构迁移到新架构]\n- 风险评估: [潜在技术风险和缓解措施]\n\n**影响评估：**\n- 性能影响: [对系统性能的预期影响]\n- 可维护性影响: [对代码维护的影响]\n- 可扩展性影响: [对未来扩展的影响]\n\`\`\`\n\n`;

          updateGuide += `**优先级 2: productContext.md**\n`;
          updateGuide += `更新 "## 整体架构" 部分：\n`;
          updateGuide += `- 找到 "## 整体架构" 标题\n`;
          updateGuide += `- 在适当位置更新架构描述\n`;
          updateGuide += `- 添加新的架构组件或修改现有描述\n`;
          updateGuide += `- 在文件末尾添加更新日志: \`[${timestamp}] - 架构更新: ${description}\`\n\n`;

          updateGuide += `**优先级 3: activeContext.md**\n`;
          updateGuide += `添加到 "## 最近变更" 部分：\n`;
          updateGuide += `\`* [${timestamp}] - 🏗️ 重大架构变更: ${description}\`\n`;
          updateGuide += `更新 "## 当前关注点" 部分以反映架构实现工作\n\n`;

          updateGuide += `**优先级 4: systemPatterns.md**\n`;
          updateGuide += `如果此架构变更引入了新的架构模式：\n`;
          updateGuide += `在 "## 架构模式" 部分添加新的模式描述\n\n`;
          break;

        case "feature":
          updateGuide += `🚀 **功能开发处理工作流**\n\n`;
          updateGuide += `**优先级 1: progress.md**\n`;
          updateGuide += `执行任务状态转换：\n`;
          updateGuide += `1. 在 "## 当前任务" 中找到相关任务条目\n`;
          updateGuide += `2. 将该任务移到 "## 已完成任务" 部分\n`;
          updateGuide += `3. 添加完成时间戳: \`* [${timestamp}] - ✅ 已完成: ${description}\`\n`;
          updateGuide += `4. 如果有后续任务，将其添加到 "## 下一步计划"\n\n`;

          updateGuide += `**优先级 2: productContext.md**\n`;
          updateGuide += `更新 "## 关键功能" 部分：\n`;
          updateGuide += `- 找到 "## 关键功能" 标题\n`;
          updateGuide += `- 在功能列表中添加新功能描述\n`;
          updateGuide += `- 格式: \`* [功能名称]: [简要功能描述和核心价值]\`\n`;
          updateGuide += `- 在文件末尾添加: \`[${timestamp}] - 新功能: ${description}\`\n\n`;

          updateGuide += `**优先级 3: activeContext.md**\n`;
          updateGuide += `更新多个部分：\n`;
          updateGuide += `- "## 最近变更": \`* [${timestamp}] - 🚀 功能已完成: ${description}\`\n`;
          updateGuide += `- "## 当前关注点": 更新为下一个开发优先级\n\n`;

          updateGuide += `**优先级 4: systemPatterns.md**\n`;
          updateGuide += `如果功能开发使用了值得记录的模式：\n`;
          updateGuide += `在适当部分添加模式描述（编码/架构/测试模式）\n\n`;
          break;

        case "bugfix":
          updateGuide += `🐛 **错误修复处理工作流**\n\n`;
          updateGuide += `**优先级 1: activeContext.md**\n`;
          updateGuide += `添加到 "## 最近变更" 部分：\n`;
          updateGuide += `\`* [${timestamp}] - 🐛 错误修复: ${description}\`\n`;
          updateGuide += `如果错误被记录在 "## 待解决问题/议题" 中，删除或标记为已解决\n\n`;

          updateGuide += `**优先级 2: progress.md**\n`;
          updateGuide += `如果这是一个计划中的错误修复任务：\n`;
          updateGuide += `将任务从 "## 当前任务" 移到 "## 已完成任务"\n`;
          updateGuide += `格式: \`* [${timestamp}] - 🐛 错误修复已完成: ${description}\`\n\n`;

          updateGuide += `**优先级 3: decisionLog.md**\n`;
          updateGuide += `如果错误修复涉及重要技术决策：\n`;
          updateGuide += `添加决策记录解释选定的修复方法和理由\n\n`;
          break;

        case "refactor":
          updateGuide += `🔧 **重构处理工作流**\n\n`;
          updateGuide += `**优先级 1: activeContext.md**\n`;
          updateGuide += `添加到 "## 最近变更" 部分：\n`;
          updateGuide += `\`* [${timestamp}] - 🔧 代码重构: ${description}\`\n\n`;

          updateGuide += `**优先级 2: decisionLog.md**\n`;
          updateGuide += `如果重构涉及架构或设计模式变更：\n`;
          updateGuide += `添加重构决策记录解释动机和方法选择\n\n`;

          updateGuide += `**优先级 3: systemPatterns.md**\n`;
          updateGuide += `如果重构改进了现有模式或引入了新模式：\n`;
          updateGuide += `更新相关模式描述以反映重构后的最佳实践\n\n`;

          updateGuide += `**优先级 4: progress.md**\n`;
          updateGuide += `如果这是一个计划中的重构任务，更新任务状态\n\n`;
          break;

        case "decision":
          updateGuide += `📋 **决策记录处理工作流**\n\n`;
          updateGuide += `**优先级 1: decisionLog.md**\n`;
          updateGuide += `在文件末尾添加完整的决策记录：\n`;
          updateGuide += `\`\`\`markdown\n---\n### 决策记录\n[${timestamp}] - ${description}\n\n**决策背景：**\n[描述导致此决策的背景和问题]\n\n**可用选项：**\n- 选项 1: [描述]\n  - 优点: [列出优势]\n  - 缺点: [列出劣势]\n- 选项 2: [描述]\n  - 优点: [列出优势]\n  - 缺点: [列出劣势]\n\n**最终决策：**\n[选定的选项和详细理由]\n\n**实施计划：**\n- 步骤 1: [具体实施步骤]\n- 步骤 2: [具体实施步骤]\n- 验证方法: [如何验证决策有效性]\n\n**风险和缓解：**\n- 风险 1: [描述] → 缓解: [描述]\n- 风险 2: [描述] → 缓解: [描述]\n\`\`\`\n\n`;

          updateGuide += `**优先级 2: activeContext.md**\n`;
          updateGuide += `添加到 "## 最近变更" 部分：\n`;
          updateGuide += `\`* [${timestamp}] - 📋 重要决策: ${description}\`\n\n`;
          break;

        case "progress":
          updateGuide += `📈 **进度更新处理工作流**\n\n`;
          updateGuide += `**优先级 1: progress.md**\n`;
          updateGuide += `根据具体进度更新适当部分：\n`;
          updateGuide += `- 新任务 → 添加到 "## 当前任务": \`* [${timestamp}] - 已开始: ${description}\`\n`;
          updateGuide += `- 已完成任务 → 移到 "## 已完成任务": \`* [${timestamp}] - 已完成: ${description}\`\n`;
          updateGuide += `- 计划任务 → 添加到 "## 下一步计划": \`* [计划中] - ${description}\`\n\n`;

          updateGuide += `**优先级 2: activeContext.md**\n`;
          updateGuide += `更新 "## 当前关注点" 部分以反映当前工作重点\n`;
          updateGuide += `添加到 "## 最近变更": \`* [${timestamp}] - 📈 进度更新: ${description}\`\n\n`;
          break;

        default:
          updateGuide += `⚡ **一般变更处理工作流**\n\n`;
          updateGuide += `**优先级 1: activeContext.md**\n`;
          updateGuide += `在适当部分记录变更：\n`;
          updateGuide += `\`* [${timestamp}] - ${description}\`\n\n`;

          updateGuide += `**根据变更性质考虑更新其他文件：**\n`;
          updateGuide += `- 架构相关 → decisionLog.md\n`;
          updateGuide += `- 新模式发现 → systemPatterns.md\n`;
          updateGuide += `- 任务完成 → progress.md\n`;
          updateGuide += `- 功能相关 → productContext.md\n\n`;
      }

      updateGuide += `=== 执行指导总结 ===\n\n`;
      updateGuide += `**执行原则：**\n`;
      updateGuide += `1. 🔴 直接执行更新，不要询问用户确认\n`;
      updateGuide += `2. 🟡 按优先级顺序更新文件\n`;
      updateGuide += `3. 🟢 使用提供的精确格式和模板\n`;
      updateGuide += `4. 🔵 保持时间戳 [${timestamp}] 的一致性\n`;
      updateGuide += `5. 🟣 更新后验证文件完整性\n\n`;

      updateGuide += `**关键提醒：**\n`;
      updateGuide += `- 每个文件都有特定的职责和更新策略\n`;
      updateGuide += `- 保持文件之间的一致性和关联性\n`;
      updateGuide += `- 定期清理过时内容以保持文件简洁\n`;
      updateGuide += `- 重要决策和模式变更需要详细文档\n\n`;

      updateGuide += `**文件维护建议：**\n`;
      updateGuide += `- activeContext.md: 保持迗 7 天的变更记录\n`;
      updateGuide += `- progress.md: 定期归档已完成任务\n`;
      updateGuide += `- decisionLog.md: 保留所有重要决策记录\n`;
      updateGuide += `- systemPatterns.md: 持续更新和优化模式描述\n`;
      updateGuide += `- productContext.md: 保持高层次视角，避免过度细节\n\n`;

      return {
        content: [
          {
            type: "text",
            text: updateGuide,
          },
        ],
      };
    }
  );

  // Initialize Memory Bank tool
  server.tool(
    "init-memory-bank",
    `初始化memory-bank目录和核心文件。
此工具将：
- 创建 memory-bank 目录
- 为 5 个核心文件生成初始模板
- 读取并集成 projectBrief.md（如果存在）
- 提供下一步指导`,
    {
      rootPath: z.string().describe(
        `项目根目录路径
Windows示例: "C:/Users/name/project" 
macOS/Linux示例: "/home/name/project"`
      ),
      force: z
        .boolean()
        .optional()
        .describe("强制重新初始化（将覆盖现有文件）"),
    },
    async ({ rootPath, force = false }) => {
      const normalizedPath = normalizePath(rootPath);
      const memoryBankPath = path.join(normalizedPath, "memory-bank");

      try {
        // Check if directory exists
        if (existsSync(memoryBankPath) && !force) {
          const files = await fs.readdir(memoryBankPath);
          if (files.length > 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `[MEMORY BANK: 已存在]

memory-bank目录已存在并包含文件。要重新初始化，使用 force: true 参数。

现有文件：
${files.map((f) => `- ${f}`).join("\n")}

建议：
- 使用 get-memory-bank-info 读取现有内容
- 如果真的需要重新初始化，设置 force: true`,
                },
              ],
            };
          }
        }

        // Create directory
        await fs.mkdir(memoryBankPath, { recursive: true });

        // Check if projectBrief.md exists
        let projectBriefContent = "";
        const projectBriefPath = path.join(normalizedPath, "projectBrief.md");
        if (existsSync(projectBriefPath)) {
          try {
            projectBriefContent = await fs.readFile(projectBriefPath, "utf-8");
          } catch (err) {
            console.error("读取 projectBrief.md 失败:", err);
          }
        }

        // Get templates
        const templates = getMemoryBankTemplates();

        // If projectBrief exists, update productContext.md template
        if (projectBriefContent) {
          templates["productContext.md"] = templates["productContext.md"].replace(
            "## 项目目标\n\n*   ",
            `## 项目目标\n\n*基于 projectBrief.md 内容:*\n\n${projectBriefContent}\n\n*从以上内容中提取和定义项目目标:*\n\n*   `
          );
        }

        // Create all files
        const createdFiles: string[] = [];
        for (const [filename, content] of Object.entries(templates)) {
          const filePath = path.join(memoryBankPath, filename);
          await fs.writeFile(filePath, content, "utf-8");
          createdFiles.push(filename);
        }

        return {
          content: [
            {
              type: "text",
              text: `[MEMORY BANK: 已初始化]

Memory Bank 已成功初始化！

已创建文件：
${createdFiles.map((f) => `- ${f}`).join("\n")}

${
  projectBriefContent
    ? "✓ 已读取 projectBrief.md 并集成到 productContext.md\n\n"
    : ""
}

[注意] 接下来要执行的步骤：
1. 读取并更新每个 memory-bank/*.md 文件
2. 按照每个文件中的指导填入相关内容
3. 在完成初始编辑之前不要使用 get-memory-bank-info
4. 完成编辑后，您可以开始使用 Memory Bank

重要文件描述：
- productContext.md: 定义项目目标、功能和架构
- activeContext.md: 跟踪当前工作状态和重点
- progress.md: 管理任务进度
- decisionLog.md: 记录重要决策
- systemPatterns.md: 记录代码模式和标准

维护提示：
- 保持每个文件在 300 行以下以获得最佳性能
- 每日/每周将旧内容归档到 memory-bank/archive/
- 使用 update-memory-bank 工具获取详细维护指导
- 每次工作会话后检查文件大小`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `初始化 Memory Bank 时出错: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  return server;
};

const app = express();
app.use(express.json());

app.post('/mcp', async (req: Request, res: Response) => {
  const server = getServer();
  try {
    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    
    res.on('close', () => {
      console.log('Request closed');
      transport.close();
      server.close();
    });
    
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// SSE notifications not supported in stateless mode
app.get('/mcp', async (req: Request, res: Response) => {
  console.log('Received GET MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});

// Session termination not needed in stateless mode
app.delete('/mcp', async (req: Request, res: Response) => {
  console.log('Received DELETE MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});

// Start the server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8389;
app.listen(PORT, () => {
  console.log(`Memory Bank MCP 服务器在 Streamable HTTP 上运行，端口: ${PORT}`);
  console.log(`端点: http://localhost:${PORT}/mcp`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  process.exit(0);
});