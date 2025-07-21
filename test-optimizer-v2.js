// Test the new optimizer V2 functionality

const testCases = [
  {
    name: "工具类测试 - 整理周报",
    input: "整理周报",
    expectedTaskType: "tool"
  },
  {
    name: "创作类测试 - 写文章",
    input: "写一篇关于人工智能的文章",
    expectedTaskType: "creative"
  },
  {
    name: "分析类测试 - 市场分析",
    input: "分析最近的电商市场趋势",
    expectedTaskType: "analytical"
  },
  {
    name: "生成类测试 - 代码生成",
    input: "生成一个React组件",
    expectedTaskType: "generative"
  }
];

async function waitForServer(maxRetries = 10) {
  console.log('⏳ 等待服务器启动...');
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('http://localhost:3000');
      if (response.ok || response.status) {
        console.log('✅ 服务器已就绪！\n');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('服务器启动超时');
}

async function testOptimizer() {
  await waitForServer();
  
  console.log('🧪 开始测试新的优化器 V2...\n');

  for (const testCase of testCases) {
    console.log(`📝 测试案例: ${testCase.name}`);
    console.log(`   输入: ${testCase.input}`);
    console.log(`   期望任务类型: ${testCase.expectedTaskType}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/optimize/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'optimize',
          prompt: testCase.input,
          answers: {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log(`   ✅ 成功！`);
      console.log(`   检测到的任务类型: ${result.taskType}`);
      console.log(`   优化结果预览: ${result.optimizedPrompt.substring(0, 100)}...`);
      console.log('   ---\n');
    } catch (error) {
      console.log(`   ❌ 失败: ${error.message}`);
      console.log('   ---\n');
    }
  }

  console.log('🎉 测试完成！');
}

// Run the test
testOptimizer().catch(console.error);