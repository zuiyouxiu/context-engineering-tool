#!/usr/bin/env node

/**
 * 测试init功能是否使用了更新后的存量项目模板
 */

import { getContextEngineeringTemplates } from './build/legacy/context-templates.js';
import fs from 'fs';
import path from 'path';

console.log('🧪 测试init功能模板内容');
console.log('=====================================\n');

// 获取当前的模板内容
const templates = getContextEngineeringTemplates();

console.log('📋 验证模板内容是否包含存量项目功能');

// 检查productContext.md
const productContext = templates['productContext.md'];
console.log('\n🔍 检查 productContext.md:');
console.log('- 技术栈识别:', productContext.includes('技术栈识别') ? '✅ 包含' : '❌ 缺失');
console.log('- 项目健康度评估:', productContext.includes('项目健康度评估') ? '✅ 包含' : '❌ 缺失'); 
console.log('- 风险评估:', productContext.includes('风险评估') ? '✅ 包含' : '❌ 缺失');
console.log('- 接管策略:', productContext.includes('接管策略') ? '✅ 包含' : '❌ 缺失');

// 检查activeContext.md
const activeContext = templates['activeContext.md'];
console.log('\n🔍 检查 activeContext.md:');
console.log('- 工具使用状态:', activeContext.includes('CURRENT_TOOL_WORKFLOW') ? '✅ 包含' : '❌ 缺失');
console.log('- 理解进度:', activeContext.includes('KNOWLEDGE_RECONSTRUCTION') ? '✅ 包含' : '❌ 缺失');
console.log('- 已理解模块:', activeContext.includes('已理解模块') ? '✅ 包含' : '❌ 缺失');
console.log('- 假设验证:', activeContext.includes('假设验证记录') ? '✅ 包含' : '❌ 缺失');

// 检查progress.md
const progress = templates['progress.md'];
console.log('\n🔍 检查 progress.md:');
console.log('- 时间管理:', progress.includes('TIME_MANAGEMENT') ? '✅ 包含' : '❌ 缺失');
console.log('- 分析进度:', progress.includes('PROGRESSIVE_UNDERSTANDING') ? '✅ 包含' : '❌ 缺失');
console.log('- 侦察阶段:', progress.includes('侦察阶段') ? '✅ 包含' : '❌ 缺失');
console.log('- 里程碑检查:', progress.includes('里程碑检查点') ? '✅ 包含' : '❌ 缺失');

// 检查systemPatterns.md
const systemPatterns = templates['systemPatterns.md'];
console.log('\n🔍 检查 systemPatterns.md:');
console.log('- AI工具模式:', systemPatterns.includes('AI_TOOL_PATTERNS') ? '✅ 包含' : '❌ 缺失');
console.log('- 考古发现:', systemPatterns.includes('ARCHAEOLOGICAL_FINDINGS') ? '✅ 包含' : '❌ 缺失');
console.log('- 分层搜索:', systemPatterns.includes('分层搜索模式') ? '✅ 包含' : '❌ 缺失');
console.log('- 工具组合策略:', systemPatterns.includes('工具组合策略') ? '✅ 包含' : '❌ 缺失');

// 检查decisionLog.md
const decisionLog = templates['decisionLog.md'];
console.log('\n🔍 检查 decisionLog.md:');
console.log('- 考古决策:', decisionLog.includes('ARCHAEOLOGICAL_DECISIONS') ? '✅ 包含' : '❌ 缺失');
console.log('- 风险管控决策:', decisionLog.includes('风险管控决策') ? '✅ 包含' : '❌ 缺失');
console.log('- 接管策略选择:', decisionLog.includes('接管策略选择') ? '✅ 包含' : '❌ 缺失');

console.log('\n=====================================');

// 模拟创建文件测试
console.log('📄 模拟文件创建测试:');

const testDir = './test-context-creation';
try {
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });
  
  // 写入productContext.md测试
  const testFile = path.join(testDir, 'productContext.md');
  fs.writeFileSync(testFile, productContext);
  
  const createdContent = fs.readFileSync(testFile, 'utf8');
  console.log('✅ 文件创建测试通过');
  console.log(`📏 创建的文件长度: ${createdContent.length} 字符`);
  console.log('🔍 关键section检查:');
  console.log('  - 存量项目分析section:', createdContent.includes('存量项目分析') ? '✅' : '❌');
  console.log('  - 技术栈识别section:', createdContent.includes('技术栈识别') ? '✅' : '❌');
  console.log('  - 项目健康度评估section:', createdContent.includes('项目健康度评估') ? '✅' : '❌');
  
  // 清理测试文件
  fs.rmSync(testDir, { recursive: true });
  
} catch (error) {
  console.log('❌ 文件创建测试失败:', error.message);
}

console.log('\n🎯 结论:');
console.log('如果上述检查都显示✅，说明模板更新成功');
console.log('如果显示❌，说明需要检查模板更新是否正确应用');