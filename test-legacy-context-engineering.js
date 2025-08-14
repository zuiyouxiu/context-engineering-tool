#!/usr/bin/env node

/**
 * 存量项目上下文工程增强功能测试脚本
 * 验证新增的项目考古维度和相关功能
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 存量项目上下文工程功能验证');
console.log('=====================================\n');

// 测试1: 验证核心公式更新
console.log('📋 测试1: 验证上下文工程核心公式是否包含项目考古维度');
try {
  const manifestPath = path.join(__dirname, 'templates', 'context-engineering-manifest.md');
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  
  if (manifestContent.includes('项目考古')) {
    console.log('✅ 核心公式已成功扩展，包含项目考古维度');
    
    // 检查具体的项目考古内容
    const archaeologyFeatures = [
      '代码模式识别',
      '行为推断分析', 
      '知识重建策略',
      '渐进式理解'
    ];
    
    let foundFeatures = 0;
    archaeologyFeatures.forEach(feature => {
      if (manifestContent.includes(feature)) {
        foundFeatures++;
        console.log(`  ✓ 发现${feature}功能描述`);
      }
    });
    
    console.log(`  📊 项目考古功能完整度: ${foundFeatures}/${archaeologyFeatures.length}\n`);
  } else {
    console.log('❌ 核心公式未包含项目考古维度\n');
  }
} catch (error) {
  console.log('❌ 无法读取manifest文件:', error.message);
}

// 测试2: 验证存量项目分析模式
console.log('📋 测试2: 验证存量项目分析模式是否已添加');
try {
  const codingAssistantPath = path.join(__dirname, 'templates', 'applications', 'coding-assistant.md');
  const codingAssistantContent = fs.readFileSync(codingAssistantPath, 'utf8');
  
  const legacyFeatures = [
    'LEGACY_PROJECT_ANALYSIS',
    '项目健康度快速评估',
    '存量项目上下文构建策略',
    '渐进式理解工作流',
    '超保守模式操作原则'
  ];
  
  let foundLegacyFeatures = 0;
  legacyFeatures.forEach(feature => {
    if (codingAssistantContent.includes(feature)) {
      foundLegacyFeatures++;
      console.log(`  ✓ 发现${feature}功能`);
    }
  });
  
  console.log(`  📊 存量项目功能完整度: ${foundLegacyFeatures}/${legacyFeatures.length}\n`);
} catch (error) {
  console.log('❌ 无法读取coding-assistant文件:', error.message);
}

// 测试3: 验证知识重建功能
console.log('📋 测试3: 验证存量项目知识重建功能');
try {
  const codingAssistantPath = path.join(__dirname, 'templates', 'applications', 'coding-assistant.md');
  const codingAssistantContent = fs.readFileSync(codingAssistantPath, 'utf8');
  
  const knowledgeFeatures = [
    'KNOWLEDGE_RECONSTRUCTION',
    'LegacyProjectMemory',
    '渐进式学习记录',
    '假设验证系统',
    'archaeologicalFindings'
  ];
  
  let foundKnowledgeFeatures = 0;
  knowledgeFeatures.forEach(feature => {
    if (codingAssistantContent.includes(feature)) {
      foundKnowledgeFeatures++;
      console.log(`  ✓ 发现${feature}功能`);
    }
  });
  
  console.log(`  📊 知识重建功能完整度: ${foundKnowledgeFeatures}/${knowledgeFeatures.length}\n`);
} catch (error) {
  console.log('❌ 知识重建功能验证失败:', error.message);
}

// 测试4: 验证搜索策略功能
console.log('📋 测试4: 验证存量项目搜索策略功能');
try {
  const codingAssistantPath = path.join(__dirname, 'templates', 'applications', 'coding-assistant.md');
  const codingAssistantContent = fs.readFileSync(codingAssistantPath, 'utf8');
  
  const searchFeatures = [
    'PROGRESSIVE_SEARCH_STRATEGY', 
    '分层搜索工作流',
    '第一层_结构性搜索',
    '第二层_模式搜索',
    '第三层_业务逻辑搜索',
    '第四层_深度分析'
  ];
  
  let foundSearchFeatures = 0;
  searchFeatures.forEach(feature => {
    if (codingAssistantContent.includes(feature)) {
      foundSearchFeatures++;
      console.log(`  ✓ 发现${feature}功能`);
    }
  });
  
  console.log(`  📊 搜索策略功能完整度: ${foundSearchFeatures}/${searchFeatures.length}\n`);
} catch (error) {
  console.log('❌ 搜索策略功能验证失败:', error.message);
}

// 测试5: 验证考古工作流功能
console.log('📋 测试5: 验证存量项目考古工作流功能');
try {
  const codingAssistantPath = path.join(__dirname, 'templates', 'applications', 'coding-assistant.md');
  const codingAssistantContent = fs.readFileSync(codingAssistantPath, 'utf8');
  
  const workflowFeatures = [
    'ARCHAEOLOGICAL_WORKFLOW',
    'ArchaeologicalWorkflow',
    'reconnaissance',
    'excavation', 
    'interpretation',
    'preservation'
  ];
  
  let foundWorkflowFeatures = 0;
  workflowFeatures.forEach(feature => {
    if (codingAssistantContent.includes(feature)) {
      foundWorkflowFeatures++;
      console.log(`  ✓ 发现${feature}功能`);
    }
  });
  
  console.log(`  📊 考古工作流功能完整度: ${foundWorkflowFeatures}/${workflowFeatures.length}\n`);
} catch (error) {
  console.log('❌ 考古工作流功能验证失败:', error.message);
}

// 测试6: 验证示例和指南文档
console.log('📋 测试6: 验证存量项目示例和指南文档');
try {
  const examplePath = path.join(__dirname, 'templates', 'applications', 'legacy-project-example.md');
  const guidePath = path.join(__dirname, 'templates', 'applications', 'legacy-project-guide.md');
  
  const exampleExists = fs.existsSync(examplePath);
  const guideExists = fs.existsSync(guidePath);
  
  if (exampleExists) {
    console.log('  ✅ 存量项目示例文档已创建');
    const exampleContent = fs.readFileSync(examplePath, 'utf8');
    const exampleWordCount = exampleContent.split(/\\s+/).length;
    console.log(`    📄 示例文档字数: ${exampleWordCount}词`);
  } else {
    console.log('  ❌ 存量项目示例文档缺失');
  }
  
  if (guideExists) {
    console.log('  ✅ 存量项目完整指南已创建');
    const guideContent = fs.readFileSync(guidePath, 'utf8');
    const guideWordCount = guideContent.split(/\\s+/).length;
    console.log(`    📄 指南文档字数: ${guideWordCount}词`);
  } else {
    console.log('  ❌ 存量项目完整指南缺失');
  }
  
  console.log();
} catch (error) {
  console.log('❌ 示例和指南文档验证失败:', error.message);
}

// 测试7: 功能完整性总评
console.log('📋 测试7: 功能完整性总评');
try {
  const requiredFiles = [
    'templates/context-engineering-manifest.md',
    'templates/applications/coding-assistant.md', 
    'templates/applications/legacy-project-example.md',
    'templates/applications/legacy-project-guide.md'
  ];
  
  let filesExist = 0;
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      filesExist++;
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} 缺失`);
    }
  });
  
  const completeness = Math.round((filesExist / requiredFiles.length) * 100);
  console.log(`\\n  📊 整体完整度: ${completeness}%`);
  
  if (completeness >= 100) {
    console.log('  🎉 存量项目上下文工程功能已完整实施!');
  } else if (completeness >= 75) {
    console.log('  ⚠️  存量项目功能基本完成，有少量缺失');
  } else {
    console.log('  ❌ 存量项目功能实施不完整，需要补充');
  }
  
} catch (error) {
  console.log('❌ 功能完整性评估失败:', error.message);
}

console.log('\\n=====================================');
console.log('🏁 存量项目上下文工程功能验证完成');

// 提供使用建议
console.log('\\n💡 使用建议:');
console.log('1. 对于无文档无测试的存量项目，优先使用超保守模式');
console.log('2. 按照4个阶段（侦察→挖掘→解释→保护）进行系统分析');
console.log('3. 重点关注风险评估和假设验证，确保理解的准确性');
console.log('4. 利用分层搜索策略，从结构到业务逐步深入理解');
console.log('5. 建立完整的知识重建记录，为后续协作奠定基础');
console.log('\\n📚 详细指导请参考: templates/applications/legacy-project-guide.md');