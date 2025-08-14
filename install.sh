#!/bin/bash
# Context Engineering Tool 安装脚本

echo "🚀 安装 Context Engineering Tool..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 需要安装 Node.js (>=16.0.0)"
    exit 1
fi

# 检查Claude Code
if ! command -v claude &> /dev/null; then
    echo "❌ 需要安装 Claude Code CLI"
    exit 1
fi

# 安装包
echo "📦 安装依赖..."
npm install -g context-engineering-tool

# 配置到Claude Code
echo "⚙️  配置到Claude Code..."
claude mcp add context-engineering-tool context-engineering-tool

echo "✅ 安装完成！"
echo ""
echo "🔧 可用工具："
echo "   📖 get-context-info - 读取项目上下文信息"
echo "   ✏️  update-context-engineering - 更新上下文文件"
echo "   🆕 init-context-engineering - 初始化结构"
echo ""
echo "使用: 在Claude Code中直接调用这些工具"