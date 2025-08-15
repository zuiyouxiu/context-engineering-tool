import { z } from "zod";
import { promises as fs } from 'fs';
import * as path from 'path';
import { formatTimestamp } from '../utils/path-utils.js';
// Inline templates since legacy templates are removed
const getContextEngineeringTemplates = () => ({
    'PROJECT_CONTEXT.md': `# 项目上下文

## 项目概览
- 项目名称：
- 项目描述：
- 技术栈：

## 架构信息
- 核心模块：
- 依赖关系：

## 关键特性
- 主要功能：
- 技术亮点：
`,
    'DEVELOPMENT_MEMORY.md': `# 开发记忆

## 技术决策记录
### 记录技术选型和架构决策

## 重要变更
### 记录重大代码变更和重构

## 经验总结
### 记录开发过程中的经验和教训
`,
    'WORK_SESSION.md': `# 工作会话

## 当前任务
- 待完成任务列表

## 进展状态
- 已完成任务
- 遇到的问题
- 下一步计划

## 会话记录
- 工作日志和讨论记录
`
});
const getDetailedFileGuide = () => ({
    'PROJECT_CONTEXT.md': { role: '项目基础信息和架构描述', priority: '高' },
    'DEVELOPMENT_MEMORY.md': { role: '技术决策和变更记录', priority: '中' },
    'WORK_SESSION.md': { role: '当前工作状态和任务', priority: '高' }
});
/**
 * 注册上下文管理MCP工具
 */
export function registerCoreTools(server) {
    // 工具1: 获取完整项目上下文信息
    server.tool("get-context-info", `获取项目的完整上下文信息，包括项目概览、技术决策记录和当前工作状态。
适用场景：了解项目、分析代码、制定计划、回答项目相关问题时调用`, {
        rootPath: z.string().describe("项目的根目录绝对路径，例如：/Users/name/my-project 或 C:\\projects\\my-app")
    }, async ({ rootPath }) => {
        try {
            const contextDir = path.join(rootPath, 'context-docs');
            const files = ['PROJECT_CONTEXT.md', 'DEVELOPMENT_MEMORY.md', 'WORK_SESSION.md'];
            let contextInfo = `# 项目上下文信息\n\n`;
            for (const file of files) {
                const filePath = path.join(contextDir, file);
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    contextInfo += `## ${file}\n\n${content}\n\n---\n\n`;
                }
                catch {
                    contextInfo += `## ${file}\n\n*文件不存在或无法读取*\n\n---\n\n`;
                }
            }
            return {
                content: [{
                        type: "text",
                        text: contextInfo
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: `获取上下文信息失败: ${error instanceof Error ? error.message : String(error)}`
                    }]
            };
        }
    });
    // 工具2: 更新上下文工程管理文件
    server.tool("update-context-info", `记录项目相关信息到对应文档中。当有新的项目信息、技术决策或工作进展需要保存时使用。
适用场景：实现新功能后记录、做出技术决策后记录、完成任务后更新进展、发现重要信息时记录`, {
        rootPath: z.string().describe("项目的根目录绝对路径，例如：/Users/name/my-project 或 C:\\projects\\my-app"),
        changeType: z.enum(['context', 'memory', 'session']).describe("信息类型 - context：项目基本信息/架构/功能描述；memory：技术决策/解决方案/经验教训；session：当前任务/进展状态/工作计划"),
        content: z.string().describe("要记录的具体内容，应该详细且有价值，例如：'实现了用户认证模块，使用JWT token，支持邮箱和手机号登录'")
    }, async ({ rootPath, changeType, content }) => {
        try {
            const contextDir = path.join(rootPath, 'context-docs');
            await fs.mkdir(contextDir, { recursive: true });
            // 根据changeType选择目标文件
            const targetFile = getTargetFileByChangeType(changeType);
            const filePath = path.join(contextDir, targetFile);
            const timestamp = formatTimestamp();
            // 读取现有内容
            let existingContent = '';
            try {
                existingContent = await fs.readFile(filePath, 'utf-8');
            }
            catch {
                // 文件不存在，使用模板
                const templates = getContextEngineeringTemplates();
                existingContent = templates[targetFile] || '';
            }
            // 格式化内容
            const formattedContent = formatContentForSection(content, changeType, targetFile);
            // 简单追加到文件末尾
            const updatedContent = existingContent + '\n\n' + formattedContent;
            await fs.writeFile(filePath, updatedContent);
            return {
                content: [{
                        type: "text",
                        text: `✅ 已更新 ${targetFile}：\n\n${formattedContent.substring(0, 200)}${formattedContent.length > 200 ? '...' : ''}`
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: `更新上下文文件失败: ${error instanceof Error ? error.message : String(error)}`
                    }]
            };
        }
    });
    // 工具3: 初始化上下文工程管理结构
    server.tool("init-context-info", `为项目创建上下文管理文件结构。仅在项目缺少上下文文档时使用，会创建项目信息、技术记录和工作进展文件。
适用场景：新项目开始时、发现项目没有上下文文档时、需要规范项目信息管理时调用`, {
        rootPath: z.string().describe("项目的根目录绝对路径，将在此目录下创建 context-docs 文件夹")
    }, async ({ rootPath }) => {
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
                    // 文件已存在，跳过创建
                    existingFiles.push(filename);
                    continue;
                }
                catch {
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
            }
            result += `## 📋 文件说明\n`;
            for (const [filename, info] of Object.entries(guide)) {
                const fileInfo = info;
                result += `### ${filename}\n**作用**: ${fileInfo.role}\n**优先级**: ${fileInfo.priority}\n\n`;
            }
            return {
                content: [{
                        type: "text",
                        text: result
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: `初始化上下文工程失败: ${error instanceof Error ? error.message : String(error)}`
                    }]
            };
        }
    });
}
// 辅助函数：智能section定位和内容插入
function getTargetSectionForChange(changeType, targetFile) {
    const sectionMap = {
        'PROJECT_CONTEXT.md': {
            'context': { section: '## 项目概览', insertStyle: 'append' },
            'default': { section: '## 项目概览', insertStyle: 'append' }
        },
        'DEVELOPMENT_MEMORY.md': {
            'memory': { section: '## 技术决策记录', insertStyle: 'append' },
            'decision': { section: '## 技术决策记录', insertStyle: 'append' },
            'default': { section: '## 技术决策记录', insertStyle: 'append' }
        },
        'WORK_SESSION.md': {
            'session': { section: '## 当前任务', insertStyle: 'prepend' },
            'progress': { section: '## 进展状态', insertStyle: 'append' },
            'default': { section: '## 当前任务', insertStyle: 'prepend' }
        }
    };
    const fileMap = sectionMap[targetFile];
    if (!fileMap)
        return { section: '', insertStyle: 'append' };
    return fileMap[changeType] || fileMap['default'];
}
function formatContentForSection(content, changeType, targetFile) {
    const timestamp = formatTimestamp();
    // 根据文件类型格式化内容
    switch (targetFile) {
        case 'DEVELOPMENT_MEMORY.md':
            // 开发记忆文件需要结构化格式
            return `### ${timestamp} - ${changeType}

**内容**：
${content}

**记录时间**：${timestamp}
`;
        case 'WORK_SESSION.md':
            // 工作会话文件使用任务列表格式
            if (changeType === 'progress') {
                const lines = content.split('\n').filter(line => line.trim());
                const taskItems = lines.map(line => line.startsWith('- ') ? line : `- ${line}`).join('\n');
                return `${taskItems}

*更新时间：${timestamp}*
`;
            }
            return `### ${timestamp} - ${changeType}

${content}
`;
        default:
            // 其他文件使用通用格式
            return `### ${timestamp} - ${changeType}

${content}
`;
    }
}
function insertContentIntoSection(existingContent, targetSection, newContent, insertStyle) {
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
    let updatedSection;
    if (insertStyle === 'prepend') {
        updatedSection = ['', newContent, ''].concat(sectionContent);
    }
    else {
        updatedSection = sectionContent.concat(['', newContent]);
    }
    return beforeSection.concat(updatedSection).concat([''], afterSection).join('\n');
}
// 根据changeType选择目标文件
function getTargetFileByChangeType(changeType) {
    switch (changeType) {
        case 'context':
            return 'PROJECT_CONTEXT.md';
        case 'memory':
            return 'DEVELOPMENT_MEMORY.md';
        case 'session':
            return 'WORK_SESSION.md';
        default:
            return 'PROJECT_CONTEXT.md';
    }
}
//# sourceMappingURL=core-tools.js.map