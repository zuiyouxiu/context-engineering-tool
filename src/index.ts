#!/usr/bin/env node

// 重构版本 - 基于上下文工程理念的MCP服务器
// 实现"上下文工程 = 提示词 + 用户画像 + 记忆 + 检索信息 + RAG信息 + MCP信息"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import { existsSync, promises as fs } from "fs";
import * as path from "path";
import { z } from "zod";

// 导入核心MCP工具
import { registerCoreTools } from './tools/core-tools.js';

// 工具函数
import { formatTimestamp } from './utils/path-utils.js';


// 服务器创建函数
const getServer = () => {
  const server = new McpServer({
    name: "context-engineering-tool", 
    version: "3.0.0",
    description: "上下文工程管理MCP服务器 - 专注于context-docs文件管理：读取上下文、更新文件、初始化结构"
  });

  // 注册上下文管理工具
  registerCoreTools(server);






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
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 9001;
app.listen(PORT, () => {
  console.log('');
  console.log('📁 ========== 上下文工程管理 MCP 服务器 ========== 📁');
  console.log('');
  console.log('🔧 上下文管理工具：');
  console.log('   📖  get-context-info - 读取项目上下文信息');
  console.log('   ✏️   update-context-engineering - 更新上下文文件');
  console.log('   🆕  init-context-engineering - 初始化结构');
  console.log('');
  console.log(`📡 服务器信息:`);
  console.log(`   端口: ${PORT}`);
  console.log(`   端点: http://localhost:${PORT}/mcp`);
  console.log(`   版本: v3.0.0`);
  console.log('');
  console.log('🎯 专注于：context-docs 目录文件管理');
  console.log('================================================== 🚀');
  console.log('');
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('🛑 正在关闭服务器...');
  process.exit(0);
});