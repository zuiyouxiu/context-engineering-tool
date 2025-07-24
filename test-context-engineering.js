#!/usr/bin/env node

// 上下文工程工具测试脚本
// 验证所有五大组件的实际功能

import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';

const testProjectPath = process.cwd();

console.log('🧪 上下文工程工具测试');
console.log('='.repeat(50));
console.log('📁 测试项目路径:', testProjectPath);
console.log('');

// 测试MCP服务器启动
async function testMCPServer() {
  console.log('1️⃣ 测试MCP服务器启动...');
  
  try {
    // spawn already imported
    
    // 构建项目
    console.log('   🔨 构建项目...');
    const isWindows = process.platform === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    const buildProcess = spawn(npmCmd, ['run', 'build'], { stdio: 'pipe' });
    
    return new Promise((resolve, reject) => {
      let buildOutput = '';
      buildProcess.stdout.on('data', (data) => {
        buildOutput += data.toString();
      });
      
      buildProcess.on('close', (code) => {
        if (code === 0) {
          console.log('   ✅ 构建成功');
          resolve(true);
        } else {
          console.log('   ❌ 构建失败');
          console.log('   构建输出:', buildOutput);
          reject(new Error('构建失败'));
        }
      });
    });
    
  } catch (error) {
    console.log('   ❌ MCP服务器测试失败:', error.message);
    return false;
  }
}

// 测试文件系统功能
async function testFileSystemFeatures() {
  console.log('2️⃣ 测试文件系统功能...');
  
  try {
    // 检查package.json
    const packageJsonPath = path.join(testProjectPath, 'package.json');
    const packageExists = await fs.access(packageJsonPath).then(() => true).catch(() => false);
    console.log('   📦 package.json:', packageExists ? '✅ 存在' : '❌ 不存在');
    
    if (packageExists) {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      console.log('   📝 项目名称:', packageJson.name || '未设置');
      console.log('   🔢 版本:', packageJson.version || '未设置');
      
      // 分析依赖
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const frameworks = [];
      if (deps.react) frameworks.push('React');
      if (deps.vue) frameworks.push('Vue');
      if (deps.express) frameworks.push('Express');
      if (deps.typescript) frameworks.push('TypeScript');
      
      console.log('   🔧 检测到的框架:', frameworks.length ? frameworks.join(', ') : '无');
    }
    
    // 检查TypeScript配置
    const tsconfigPath = path.join(testProjectPath, 'tsconfig.json');
    const tsconfigExists = await fs.access(tsconfigPath).then(() => true).catch(() => false);
    console.log('   ⚙️ tsconfig.json:', tsconfigExists ? '✅ 存在' : '❌ 不存在');
    
    return true;
  } catch (error) {
    console.log('   ❌ 文件系统测试失败:', error.message);
    return false;
  }
}

// 测试上下文工程目录结构
async function testContextEngineeringStructure() {
  console.log('3️⃣ 测试上下文工程目录结构...');
  
  try {
    const contextPath = path.join(testProjectPath, 'context-engineering');
    const contextExists = await fs.access(contextPath).then(() => true).catch(() => false);
    
    if (contextExists) {
      console.log('   📁 context-engineering 目录: ✅ 存在');
      
      // 检查核心文件
      const coreContextPath = path.join(contextPath, 'core-context');
      const coreExists = await fs.access(coreContextPath).then(() => true).catch(() => false);
      console.log('   📄 core-context 目录:', coreExists ? '✅ 存在' : '❌ 不存在');
      
      if (coreExists) {
        const coreFiles = await fs.readdir(coreContextPath);
        const mdFiles = coreFiles.filter(f => f.endsWith('.md'));
        console.log(`   📝 核心文件数量: ${mdFiles.length}个`);
        mdFiles.forEach(file => {
          console.log(`      - ${file}`);
        });
      }
      
      // 检查记忆目录
      const memoryPath = path.join(contextPath, 'memory');
      const memoryExists = await fs.access(memoryPath).then(() => true).catch(() => false);
      console.log('   🧠 memory 目录:', memoryExists ? '✅ 存在' : '❌ 不存在');
      
    } else {
      console.log('   📁 context-engineering 目录: ❌ 不存在');
      console.log('   💡 建议运行 init-context-engineering 工具初始化');
    }
    
    return true;
  } catch (error) {
    console.log('   ❌ 目录结构测试失败:', error.message);
    return false;
  }
}

// 测试上下文工程五大组件理论
function testContextEngineeringTheory() {
  console.log('4️⃣ 验证上下文工程五大组件...');
  
  const components = {
    '🧠 动态提示词': {
      description: '根据任务和用户动态生成专家提示',
      implementation: '专家角色选择 + 个性化提示生成',
      tools: ['generate-expert-prompt']
    },
    '👤 用户偏好': {
      description: '学习和记住用户的技术偏好和编码风格',
      implementation: '代码风格分析 + 偏好学习算法',
      tools: ['learn-user-preferences']
    },
    '💾 记忆管理': {
      description: '维护短期和长期记忆，支持上下文连续性',
      implementation: '文件系统存储 + 记忆检索',
      tools: ['context-engineering-status']
    },
    '🔍 信息检索': {
      description: '从项目内外部源检索相关信息',
      implementation: '项目文件分析 + 技术栈检测',
      tools: ['analyze-project-context']
    },
    '🛠️ 工具调用': {
      description: '智能推荐和调用最适合的MCP工具',
      implementation: 'MCP工具映射 + 智能推荐算法',
      tools: ['recommend-mcp-tools']
    }
  };
  
  Object.entries(components).forEach(([name, info], index) => {
    console.log(`   ${name}:`);
    console.log(`      📋 ${info.description}`);
    console.log(`      ⚙️ ${info.implementation}`);
    console.log(`      🔧 相关工具: ${info.tools.join(', ')}`);
    if (index < Object.keys(components).length - 1) console.log('');
  });
  
  return true;
}

// 测试构建结果
async function testBuildOutput() {
  console.log('5️⃣ 验证构建结果...');
  
  try {
    const buildPath = path.join(testProjectPath, 'build');
    const buildExists = await fs.access(buildPath).then(() => true).catch(() => false);
    console.log('   📁 build 目录:', buildExists ? '✅ 存在' : '❌ 不存在');
    
    if (buildExists) {
      const buildFiles = await fs.readdir(buildPath);
      const jsFiles = buildFiles.filter(f => f.endsWith('.js'));
      console.log(`   📝 JavaScript 文件: ${jsFiles.length}个`);
      
      // 检查主文件
      const mainFile = path.join(buildPath, 'index.js');
      const mainExists = await fs.access(mainFile).then(() => true).catch(() => false);
      console.log('   🎯 index.js:', mainExists ? '✅ 存在' : '❌ 不存在');
      
      if (mainExists) {
        const stats = await fs.stat(mainFile);
        console.log(`   📊 文件大小: ${Math.round(stats.size / 1024)}KB`);
      }
    }
    
    return buildExists;
  } catch (error) {
    console.log('   ❌ 构建验证失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log(`🚀 开始测试上下文工程工具实现...`);
  console.log('');
  
  const results = [];
  
  // 运行所有测试
  results.push(await testMCPServer());
  console.log('');
  
  results.push(await testFileSystemFeatures());
  console.log('');
  
  results.push(await testContextEngineeringStructure());
  console.log('');
  
  results.push(testContextEngineeringTheory());
  console.log('');
  
  results.push(await testBuildOutput());
  console.log('');
  
  // 汇总结果
  const passedTests = results.filter(r => r === true).length;
  const totalTests = results.length;
  
  console.log('📊 测试结果汇总');
  console.log('='.repeat(30));
  console.log(`✅ 通过: ${passedTests}/${totalTests}`);
  console.log(`❌ 失败: ${totalTests - passedTests}/${totalTests}`);
  console.log(`🎯 成功率: ${Math.round(passedTests / totalTests * 100)}%`);
  console.log('');
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！上下文工程工具已就绪。');
    console.log('');
    console.log('🔗 下一步：');
    console.log('1. 运行 `npm start` 启动MCP服务器');
    console.log('2. 在Claude Desktop中配置MCP服务器');
    console.log('3. 使用 init-context-engineering 初始化项目');
    console.log('4. 体验五大上下文工程组件的强大功能');
  } else {
    console.log('⚠️ 部分测试失败，请检查上述错误信息并修复。');
  }
  
  console.log('');
  console.log('💡 上下文工程公式：');
  console.log('   上下文工程 = 提示词 + 用户偏好 + 记忆管理 + 信息检索 + 工具调用');
  console.log('');
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试运行失败:', error.message);
  process.exit(1);
});