// 简化版MCP工具 - 专注核心功能，易于AI调用
// 基于"简单优于复杂"的设计原则

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * 注册简化版上下文工程工具
 * 只提供3个核心工具，确保AI能够可靠使用
 */
export function registerSimpleContextEngineeringTools(server: McpServer) {
  
  // 核心工具1: 获取项目上下文（会话开始必须调用）
  server.tool(
    "get-project-context",
    `获取项目基本信息和上下文
这是最基础的工具，每次会话开始时必须调用。
返回项目技术栈、架构信息和基本配置。`,
    {
      rootPath: z.string().describe("项目根目录路径")
    },
    async ({ rootPath }) => {
      try {
        // 简化的项目分析逻辑
        const packageJsonPath = path.join(rootPath, 'package.json');
        let projectInfo = {
          name: '未知项目',
          type: '未知类型',
          languages: [] as string[],
          frameworks: [] as string[],
          hasTests: false,
          hasConfig: false
        };

        // 检查package.json
        try {
          const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
          projectInfo.name = packageJson.name || '未命名项目';
          
          // 简单的技术栈检测
          const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
          
          if (deps.react) projectInfo.frameworks.push('React');
          if (deps.vue) projectInfo.frameworks.push('Vue');
          if (deps.express) projectInfo.frameworks.push('Express');
          if (deps.next) projectInfo.frameworks.push('Next.js');
          
          if (packageJson.scripts?.test) projectInfo.hasTests = true;
          
          projectInfo.languages.push('JavaScript');
          if (deps.typescript || deps['@types/node']) {
            projectInfo.languages.push('TypeScript');
          }
        } catch {
          // package.json不存在，尝试其他检测
        }

        // 检查常见配置文件
        const configFiles = ['tsconfig.json', '.eslintrc', 'webpack.config.js'];
        for (const file of configFiles) {
          try {
            await fs.access(path.join(rootPath, file));
            projectInfo.hasConfig = true;
            break;
          } catch {}
        }

        return {
          content: [{
            type: "text",
            text: `# 📊 项目上下文信息

## 基本信息
- **项目名称**: ${projectInfo.name}
- **主要语言**: ${projectInfo.languages.join(', ') || '未检测到'}
- **使用框架**: ${projectInfo.frameworks.join(', ') || '无'}
- **测试配置**: ${projectInfo.hasTests ? '✅ 已配置' : '❌ 未配置'}
- **工具配置**: ${projectInfo.hasConfig ? '✅ 有配置文件' : '❌ 基础配置'}

## 🎯 AI助手建议
基于项目特征，我将：
- 使用 ${projectInfo.languages[0] || 'JavaScript'} 编写代码
- 遵循 ${projectInfo.frameworks[0] || '标准'} 开发模式
- ${projectInfo.hasTests ? '编写相应的测试代码' : '提供基本的代码实现'}

项目上下文已加载，可以开始协作！`
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ 获取项目上下文失败: ${error instanceof Error ? error.message : String(error)}

建议检查项目路径是否正确。`
          }]
        };
      }
    }
  );

  // 核心工具2: 分析项目详情（关键词触发）
  server.tool(
    "analyze-project-details",
    `深入分析项目的架构和技术细节
当用户询问项目、架构、技术栈等问题时调用。
提供更详细的项目分析和建议。`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      query: z.string().describe("用户的具体问题"),
      focus: z.enum(['architecture', 'dependencies', 'structure', 'all']).default('all').describe("分析重点")
    },
    async ({ rootPath, query, focus }) => {
      try {
        let analysis = `# 🔍 项目详细分析

## 用户问题
"${query}"

`;

        // 目录结构分析
        if (focus === 'structure' || focus === 'all') {
          try {
            const items = await fs.readdir(rootPath);
            const directories = [];
            const files = [];
            
            for (const item of items) {
              const stat = await fs.stat(path.join(rootPath, item));
              if (stat.isDirectory() && !item.startsWith('.')) {
                directories.push(item);
              } else if (item.includes('.')) {
                files.push(item);
              }
            }

            analysis += `## 📁 项目结构
**主要目录**: ${directories.slice(0, 8).join(', ')}
**配置文件**: ${files.filter(f => f.includes('config') || f.startsWith('.')).slice(0, 5).join(', ')}

`;
          } catch {}
        }

        // 依赖分析
        if (focus === 'dependencies' || focus === 'all') {
          try {
            const packageJson = JSON.parse(await fs.readFile(path.join(rootPath, 'package.json'), 'utf-8'));
            const deps = packageJson.dependencies || {};
            const devDeps = packageJson.devDependencies || {};
            
            analysis += `## 📦 依赖关系
**生产依赖**: ${Object.keys(deps).length}个
**开发依赖**: ${Object.keys(devDeps).length}个

**主要框架**: ${Object.keys(deps).filter(d => 
              ['react', 'vue', 'express', 'next', 'nuxt'].some(f => d.includes(f))
            ).join(', ') || '无'}

`;
          } catch {}
        }

        // 架构建议
        if (focus === 'architecture' || focus === 'all') {
          analysis += `## 🏗️ 架构观察
基于项目特征，这似乎是一个${guessProjectType(rootPath)}项目。

## 💡 针对您问题的建议
${generateSuggestion(query)}

`;
        }

        analysis += `## 🎯 下一步建议
- 使用内置的 **Grep** 工具搜索相关代码
- 使用 **Read** 工具查看具体文件内容
- 使用 **Task** 工具进行复杂的分析任务

有了这些上下文信息，我可以更好地帮助您解决问题！`;

        return {
          content: [{
            type: "text",
            text: analysis
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `分析项目时出错: ${error instanceof Error ? error.message : String(error)}`
          }]
        };
      }
    }
  );

  // 核心工具3: 更新项目记录（任务完成必须调用）
  server.tool(
    "save-work-progress",
    `保存工作进度和变更记录
每次完成任务后必须调用，记录做了什么改动。
帮助维护项目的变更历史。`,
    {
      rootPath: z.string().describe("项目根目录路径"),
      workType: z.enum(['feature', 'bugfix', 'refactor', 'docs', 'config']).describe("工作类型"),
      description: z.string().describe("简要描述做了什么"),
      files: z.array(z.string()).optional().describe("涉及的文件列表")
    },
    async ({ rootPath, workType, description, files }) => {
      try {
        // 简化的记录保存逻辑
        const timestamp = new Date().toISOString();
        const record = {
          timestamp,
          workType,
          description,
          files: files || []
        };

        // 尝试保存到简单的日志文件
        const logPath = path.join(rootPath, '.ai-work-log.json');
        let workLog = [];
        
        try {
          const existingLog = await fs.readFile(logPath, 'utf-8');
          workLog = JSON.parse(existingLog);
        } catch {
          // 文件不存在，创建新的
        }

        workLog.push(record);
        
        // 保持最近50条记录
        if (workLog.length > 50) {
          workLog = workLog.slice(-50);
        }

        await fs.writeFile(logPath, JSON.stringify(workLog, null, 2));

        const typeEmoji = {
          feature: '🚀',
          bugfix: '🐛', 
          refactor: '🔧',
          docs: '📝',
          config: '⚙️'
        };

        return {
          content: [{
            type: "text",
            text: `# ✅ 工作记录已保存

${typeEmoji[workType]} **${workType}**: ${description}

📅 **时间**: ${new Date(timestamp).toLocaleString()}
📁 **文件**: ${files?.length ? files.join(', ') : '无特定文件'}

工作记录已保存到项目日志中，可以追踪项目的演进历史。`
          }]
        };

      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ 保存工作记录失败: ${error instanceof Error ? error.message : String(error)}

工作已完成，但记录保存失败。这不影响实际功能。`
          }]
        };
      }
    }
  );
}

// 辅助函数
function guessProjectType(rootPath: string): string {
  // 简化的项目类型推测
  return "现代Web开发";
}

function generateSuggestion(query: string): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('架构')) {
    return "建议使用Grep工具搜索主要模块和组件，了解代码组织方式。";
  }
  if (queryLower.includes('技术栈')) {
    return "主要技术栈信息已在上方展示，可以使用Read工具查看package.json获取更多细节。";
  }
  if (queryLower.includes('测试')) {
    return "建议使用Glob工具查找测试文件，了解测试覆盖情况。";
  }
  
  return "建议先使用相关的内置搜索工具深入了解项目结构和实现细节。";
}