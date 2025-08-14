#!/usr/bin/env node

/**
 * 测试更新后的存量项目上下文模板
 * 验证实际生效的TypeScript文件中的模板更新
 */

import { getContextEngineeringTemplates, getDetailedFileGuide } from './build/legacy/context-templates.js';

console.log('🧪 存量项目模板更新验证');
console.log('=====================================\n');

// 测试1: 验证模板是否包含存量项目内容
console.log('📋 测试1: 验证md模板是否包含存量项目内容');

const templates = getContextEngineeringTemplates();
const legacyKeywords = [
  'LEGACY_PROJECT_ANALYSIS',
  'KNOWLEDGE_RECONSTRUCTION', 
  'PROGRESSIVE_UNDERSTANDING',
  'ARCHAEOLOGICAL_FINDINGS',
  'ARCHAEOLOGICAL_DECISIONS',
  'CURRENT_TOOL_WORKFLOW',
  'TIME_MANAGEMENT',
  'AI_TOOL_PATTERNS'
];

let foundKeywords = 0;
const templateFiles = Object.keys(templates);

for (const keyword of legacyKeywords) {
  let keywordFound = false;
  
  for (const [filename, content] of Object.entries(templates)) {
    if (content.includes(keyword)) {
      console.log(`  ✅ 发现关键词 "${keyword}" 在 ${filename}`);
      keywordFound = true;
      foundKeywords++;
      break;
    }
  }
  
  if (!keywordFound) {
    console.log(`  ❌ 未找到关键词 "${keyword}"`);
  }
}

console.log(`  📊 存量项目关键词覆盖度: ${foundKeywords}/${legacyKeywords.length}\n`);

// 测试2: 验证具体模板内容
console.log('📋 测试2: 验证具体模板内容');

// 检查productContext.md
const productContext = templates['productContext.md'];
if (productContext.includes('项目健康度评估') && productContext.includes('风险评估')) {
  console.log('  ✅ productContext.md 包含存量项目分析section');
} else {
  console.log('  ❌ productContext.md 缺少存量项目分析内容');
}

// 检查activeContext.md
const activeContext = templates['activeContext.md'];
if (activeContext.includes('已理解模块') && activeContext.includes('假设验证记录')) {
  console.log('  ✅ activeContext.md 包含知识重建section');
} else {
  console.log('  ❌ activeContext.md 缺少知识重建内容');
}

// 检查progress.md
const progress = templates['progress.md'];
if (progress.includes('侦察阶段') && progress.includes('挖掘阶段')) {
  console.log('  ✅ progress.md 包含渐进式理解section');
} else {
  console.log('  ❌ progress.md 缺少渐进式理解内容');
}

// 检查systemPatterns.md
const systemPatterns = templates['systemPatterns.md'];
if (systemPatterns.includes('发现的代码模式') && systemPatterns.includes('业务逻辑发现')) {
  console.log('  ✅ systemPatterns.md 包含考古发现section');
} else {
  console.log('  ❌ systemPatterns.md 缺少考古发现内容');
}

// 检查decisionLog.md  
const decisionLog = templates['decisionLog.md'];
if (decisionLog.includes('风险管控决策') && decisionLog.includes('接管策略选择')) {
  console.log('  ✅ decisionLog.md 包含考古决策section\n');
} else {
  console.log('  ❌ decisionLog.md 缺少考古决策内容\n');
}

// 测试3: 验证文件指导信息
console.log('📋 测试3: 验证文件指导信息更新');

const guide = getDetailedFileGuide();

// 检查是否有legacyProjectEnhancements
let guidesWithLegacySupport = 0;
for (const [filename, info] of Object.entries(guide)) {
  if (info.legacyProjectEnhancements) {
    console.log(`  ✅ ${filename} 包含存量项目增强指导`);
    guidesWithLegacySupport++;
  }
}

console.log(`  📊 支持存量项目的文件指导: ${guidesWithLegacySupport}个\n`);

// 测试4: 模板完整性检查
console.log('📋 测试4: 模板完整性检查');

const requiredFiles = ['productContext.md', 'activeContext.md', 'progress.md', 'decisionLog.md', 'systemPatterns.md'];
let completeTemplates = 0;

for (const filename of requiredFiles) {
  if (templates[filename] && templates[filename].length > 100) {
    completeTemplates++;
    console.log(`  ✅ ${filename} 模板完整`);
  } else {
    console.log(`  ❌ ${filename} 模板缺失或内容过少`);
  }
}

console.log(`  📊 模板完整度: ${completeTemplates}/${requiredFiles.length}\n`);

// 测试5: 字符统计
console.log('📋 测试5: 模板内容统计');

let totalChars = 0;
let legacyContentChars = 0;

for (const [filename, content] of Object.entries(templates)) {
  totalChars += content.length;
  
  // 估算存量项目相关内容
  const legacyMatches = content.match(/(存量项目|LEGACY|ARCHAEOLOGICAL|KNOWLEDGE_RECONSTRUCTION)/g);
  if (legacyMatches) {
    legacyContentChars += legacyMatches.length * 20; // 粗略估算
  }
  
  console.log(`  📄 ${filename}: ${content.length} 字符`);
}

console.log(`  📊 总内容长度: ${totalChars} 字符`);
console.log(`  📊 存量项目内容估算: ${legacyContentChars} 字符\n`);

// 总结
console.log('=====================================');
console.log('🏁 存量项目模板验证完成');

const overallScore = (foundKeywords / legacyKeywords.length + 
                     completeTemplates / requiredFiles.length + 
                     guidesWithLegacySupport / 2) / 3 * 100;

console.log(`\n📊 整体评分: ${Math.round(overallScore)}%`);

if (overallScore >= 90) {
  console.log('🎉 存量项目模板更新成功！');
} else if (overallScore >= 70) {
  console.log('⚠️  存量项目模板基本完成，有改进空间');
} else {
  console.log('❌ 存量项目模板更新不充分');
}

console.log('\n💡 使用说明:');
console.log('现在AI在调用MCP工具时可以使用以下新的变更类型：');
console.log('- legacy-analysis: 更新项目健康度评估');
console.log('- legacy-understanding: 更新理解进度记录');
console.log('- legacy-discovery: 更新考古发现记录');