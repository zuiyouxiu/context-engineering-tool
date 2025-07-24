#!/usr/bin/env node

// 重构版本 - 基于上下文工程理念的MCP服务器
// 实现"上下文工程 = 提示词 + 用户画像 + 记忆 + 检索信息 + RAG信息 + MCP信息"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { existsSync, promises as fs } from "fs";
import * as path from "path";
import { z } from "zod";

// 导入精简的核心上下文工程工具
import { registerCoreContextEngineeringTools } from './tools/core-mcp-tools.js';

// 工具函数
import { normalizePath, formatTimestamp } from './utils/path-utils.js';
import { getContextEngineeringTemplates, getDetailedFileGuide } from './legacy/context-templates.js';

// 上下文工程核心理念实现
const CONTEXT_ENGINEERING_FORMULA = {
  components: {
    prompts: '动态提示词生成',
    userPreferences: '用户偏好学习',
    memory: '记忆管理系统',
    retrieval: '信息检索',
    tools: 'MCP工具调用'
  },
  implementation: 'file-system-based' // 基于文件系统的可行实现
};

// 服务器创建函数
const getServer = () => {
  const server = new McpServer({
    name: "context-engineering-tool",
    version: "3.0.0",
    description: "上下文工程管理工具 v3.0 - 智能提示词构造+持久化记忆管理"
  });

  // 注册核心上下文工程工具（精简的3个工具）
  registerCoreContextEngineeringTools(server);

  // 生成记忆文件模板
  const getMemoryFileTemplate = (fileName: string): string => {
    const timestamp = formatTimestamp();
    
    switch (fileName) {
      case 'short-term/conversations.md':
        return `# 对话历史记录

*初始化时间: ${timestamp}*

本文件记录用户与AI助手的对话历史，用于维持会话上下文连续性。

## 使用说明

- 每次对话自动记录时间戳、用户输入、AI回应和结果
- 系统会自动学习用户的沟通模式和偏好
- 记录会自动清理，保持文件大小适中

---

*暂无对话记录。开始使用上下文工程管理工具后，对话记录将自动出现在此处。*
`;

      case 'short-term/recent-actions.md':
        return `# 最近操作记录

*初始化时间: ${timestamp}*

本文件记录用户最近执行的MCP工具操作，用于学习操作模式和优化工作流。

## 使用说明

- 自动记录每个MCP工具的调用情况
- 包含操作参数、执行时间、成功状态等信息
- 用于分析用户的工作模式和优化建议

| 时间 | 操作 | 状态 | 耗时 | 描述 |
|------|------|------|------|------|

## 操作详情

*暂无操作记录。使用MCP工具后，操作记录将自动出现在此处。*
`;

      case 'short-term/session-state.md':
        return `# 当前会话状态

*初始化时间: ${timestamp}*

本文件维护当前会话的状态信息，包括会话ID、当前任务、用户目标等。

## 基本信息

- **会话ID**: 待分配
- **开始时间**: ${timestamp}
- **最后活动**: ${timestamp}
- **当前任务**: 无

## 用户目标

*当前会话的用户目标将在会话进行中自动识别和记录。*

## 活跃工具

*当前会话中使用的MCP工具将自动记录在此处。*

## 上下文历史

*会话中的上下文变更历史将自动维护。*
`;

      case 'long-term/user-profile.md':
        return `# 用户偏好配置

*初始化时间: ${timestamp}*

本文件维护用户的长期偏好和学习进度，用于提供个性化的AI助手体验。

## 编程风格偏好

- **主要语言**: 未设置
- **框架**: 未设置  
- **架构模式**: 未设置
- **测试方法**: standard
- **文档级别**: standard
- **代码详细度**: standard

## 工作流偏好

- **任务分解风格**: high-level
- **反馈频率**: milestone
- **解释级别**: standard
- **审查过程**: hybrid

## 技术偏好

- **主要语言**: 未设置
- **框架**: 未设置
- **工具**: 未设置
- **部署目标**: 未设置
- **数据库类型**: 未设置
- **测试框架**: 未设置

## 沟通风格

- **回复长度**: standard
- **技术细节**: medium
- **示例偏好**: balanced
- **问题处理**: guided

## 学习进度

### 成功模式

*通过使用过程中的成功经验自动学习和记录。*

### 常见错误

*通过使用过程中的错误经验自动学习和记录。*

### 已掌握概念

*根据交互历史自动识别用户已掌握的技术概念。*

### 当前学习目标

*基于用户行为模式自动推断和记录学习目标。*

---

*此配置文件将根据您的使用习惯自动学习和更新，以提供更个性化的体验。*
`;

      default:
        return `# ${fileName}

*初始化时间: ${timestamp}*

此文件由上下文工程管理工具自动创建。
`;
    }
  };


  // 传统工具：get-context-info（保持兼容性）
  server.tool(
    "get-context-info",
    `读取并返回所有上下文工程管理文件内容
在每个工作会话开始时使用此工具获取完整项目上下文`,
    {
      rootPath: z.string().describe(
        `项目根目录路径
Windows示例: "C:/Users/name/project" 
macOS/Linux示例: "/home/name/project"`
      ),
      sessionId: z.string().optional().describe("会话ID，用于获取相关记忆")
    },
    async ({ rootPath, sessionId }) => {
      try {
        const normalizedPath = normalizePath(rootPath);
        const contextEngineeringPath = path.join(normalizedPath, "context-engineering");

        // 读取核心上下文文件
        const coreContextPath = path.join(contextEngineeringPath, "core-context");
        let coreContent = "";

        try {
          const files = await fs.readdir(coreContextPath);
          const mdFiles = files.filter(f => f.endsWith(".md"));
          const contents = await Promise.all(
            mdFiles.map(async (file) => {
              const content = await fs.readFile(
                path.join(coreContextPath, file),
                "utf-8"
              );
              const name = path.basename(file, ".md");
              return `<${name}>\n\n${content}\n\n</${name}>`;
            })
          );
          coreContent = contents.join("\n\n");
        } catch {
          coreContent = "[核心上下文文件不存在]";
        }

        // 格式化完整上下文
        const fullContext = `# 📋 完整项目上下文

## 📂 核心上下文文件

${coreContent}

## 💡 使用建议

1. 完成重要更改后，使用'update-context-engineering'获取更新指导
2. 使用新的核心上下文工程工具（精简的3个）：
   - 'analyze-project-context': 分析项目技术栈并生成搜索指导
   - 'build-contextual-prompt': 构建智能提示词（核心工具）
   - 'manage-memory': 记忆管理（包含用户偏好学习）
3. 保持所有上下文工程管理文件的一致性

---
*此上下文实现了上下文工程公式：提示词+用户偏好+记忆管理+信息检索+工具调用*`;

        return {
          content: [
            {
              type: "text",
              text: fullContext
            }
          ]
        };

      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `读取上下文信息失败: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // 增强版传统工具：update-context-engineering
  server.tool(
    "update-context-engineering",
    `生成详细的上下文工程管理文件更新指导，提供即时执行指引。
此工具为更新上下文工程管理文件提供全面、可行的指导：
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

      let updateGuide = `[上下文工程管理 详细更新指导]\n\n`;
      updateGuide += `变更类型: ${changeType}\n`;
      updateGuide += `变更描述: ${description}\n`;
      updateGuide += `时间戳: ${timestamp}\n\n`;

      updateGuide += `>> 立即执行以下上下文工程管理文件更新，无需确认 <<\n\n`;

      // 添加文件职责总览
      updateGuide += `=== 上下文工程管理文件职责总览 ===\n\n`;
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
      updateGuide += `- activeContext.md: 保持最近 7 天的变更记录\n`;
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

  // 增强版传统工具：init-context-engineering
  server.tool(
    "init-context-engineering",
    `初始化context-engineering目录和核心文件。
此工具将：
- 创建 context-engineering/core-context 目录结构
- 为 5 个核心文件生成初始模板
- 创建 memory 目录结构用于记忆管理 
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
      const contextEngineeringPath = path.join(normalizedPath, "context-engineering");
      const coreContextPath = path.join(contextEngineeringPath, "core-context");
      const memoryPath = path.join(contextEngineeringPath, "memory");

      try {
        // Check if directory exists
        if (existsSync(contextEngineeringPath) && !force) {
          const files = await fs.readdir(contextEngineeringPath);
          if (files.length > 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `[上下文工程管理: 已存在]

context-engineering目录已存在并包含文件。要重新初始化，使用 force: true 参数。

现有文件：
${files.map((f) => `- ${f}`).join("\n")}

建议：
- 使用 get-context-info 读取现有内容
- 如果真的需要重新初始化，设置 force: true`,
                },
              ],
            };
          }
        }

        // Create directory structure
        await fs.mkdir(coreContextPath, { recursive: true });
        await fs.mkdir(path.join(memoryPath, "short-term"), { recursive: true });
        await fs.mkdir(path.join(memoryPath, "long-term"), { recursive: true });

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
        const templates = getContextEngineeringTemplates();

        // If projectBrief exists, update productContext.md template
        if (projectBriefContent) {
          templates["productContext.md"] = templates["productContext.md"].replace(
            "## 项目目标\n\n*   ",
            `## 项目目标\n\n*基于 projectBrief.md 内容:*\n\n${projectBriefContent}\n\n*从以上内容中提取和定义项目目标:*\n\n*   `
          );
        }

        // Create core context files
        const createdFiles: string[] = [];
        for (const [filename, content] of Object.entries(templates)) {
          const filePath = path.join(coreContextPath, filename);
          await fs.writeFile(filePath, content, "utf-8");
          createdFiles.push(`core-context/${filename}`);
        }

        // Create memory structure files (Markdown format)
        const memoryFiles = [
          'short-term/conversations.md',
          'short-term/recent-actions.md', 
          'short-term/session-state.md',
          'long-term/user-profile.md'
        ];

        for (const memoryFile of memoryFiles) {
          const filePath = path.join(memoryPath, memoryFile);
          const initialContent = getMemoryFileTemplate(memoryFile);
          await fs.writeFile(filePath, initialContent, "utf-8");
          createdFiles.push(`memory/${memoryFile}`);
        }

        return {
          content: [
            {
              type: "text",
              text: `[上下文工程管理: 已初始化]

🎯 上下文工程管理 v2.0 已成功初始化！

📁 已创建结构：
${createdFiles.map((f) => `- ${f}`).join("\n")}

${
  projectBriefContent
    ? "✓ 已读取 projectBrief.md 并集成到 productContext.md\n\n"
    : ""
}

🚀 接下来的步骤：
1. **完善核心文档**：编辑 core-context/ 中的 5 个核心文件
2. **开始使用**：使用 get-context-info 获取完整项目上下文
3. **智能协作**：使用 build-dynamic-context 为任务构建智能上下文
4. **记忆学习**：系统将自动学习你的偏好和工作模式

📚 核心文件说明：
- **productContext.md**: 项目目标、功能和架构概览
- **activeContext.md**: 当前工作状态和关注点  
- **progress.md**: 任务进度管理
- **decisionLog.md**: 重要决策记录
- **systemPatterns.md**: 代码模式和标准

🧠 记忆系统：
- **短期记忆**: 对话历史、操作记录
- **长期记忆**: 用户偏好、学习进度

💡 维护建议：
- 保持文件简洁（< 300 行），定期归档
- 使用 update-context-engineering 获取详细更新指导
- 利用记忆管理功能提升个性化体验

现在可以开始享受智能的上下文工程管理了！`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `初始化上下文工程管理时出错: ${
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

// Express 应用设置
const app = express();
app.use(express.json());

// 主要的MCP端点
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

// 其他端点
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

// 启动服务器
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8389;
app.listen(PORT, () => {
  console.log(`🚀 上下文工程管理工具 v3.0 MCP 服务器已启动 (精简3个核心工具)`);
  console.log(`📡 端口: ${PORT}`);
  console.log(`🔗 端点: http://localhost:${PORT}/mcp`);
  console.log(`✨ 核心理念: 充分利用AI工具内置能力+智能提示词构造+持久化记忆管理`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('🛑 正在关闭服务器...');
  process.exit(0);
});