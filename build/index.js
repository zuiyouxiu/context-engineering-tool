#!/usr/bin/env node
// 重构版本 - 基于上下文工程理念的MCP服务器 (stdio版本)
// 实现"上下文工程 = 提示词 + 用户画像 + 记忆 + 检索信息 + RAG信息 + MCP信息"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// 导入核心MCP工具
import { registerCoreTools } from './tools/core-tools.js';
// 创建MCP服务器
const server = new McpServer({
    name: "context-engineering-tool",
    version: "4.0.0",
    description: "项目上下文管理工具：维护项目信息、技术决策记录和工作进展。当需要了解项目状态、记录重要信息或管理项目文档时使用"
});
// 注册上下文管理工具
registerCoreTools(server);
// 主启动函数
async function main() {
    try {
        // 创建stdio传输
        const transport = new StdioServerTransport();
        // 连接服务器到传输
        await server.connect(transport);
        // 在stderr输出启动信息，避免干扰stdio通信
        console.error('');
        console.error('📁 ========== 项目上下文管理 MCP 服务器 (stdio) ========== 📁');
        console.error('');
        console.error('🔧 AI可调用的工具：');
        console.error('   📖  get-context-info    - 获取项目完整上下文信息');
        console.error('   ✏️   update-context-info - 记录项目信息/决策/进展');
        console.error('   🆕  init-context-info   - 初始化项目上下文文件结构');
        console.error('');
        console.error('📡 传输方式: stdio');
        console.error('📦 版本: v4.0.0');
        console.error('');
        console.error('🎯 自动识别时机：了解项目、记录信息、管理文档');
        console.error('================================================== 🚀');
        console.error('');
    }
    catch (error) {
        console.error('MCP服务器启动失败:', error);
        process.exit(1);
    }
}
// 优雅关闭
process.on('SIGINT', async () => {
    console.error('🛑 正在关闭MCP服务器...');
    process.exit(0);
});
// 启动服务器
main().catch((error) => {
    console.error('服务器错误:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map