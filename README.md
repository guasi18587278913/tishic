# 提示词优化助手

一个基于六维度优化框架的智能提示词优化工具，帮助用户将模糊的想法转化为精准的AI提示词。

## 功能特点

- **智能分析**：自动识别提示词类型（创作类、分析类、任务类、生成类）
- **交互式优化**：通过3个关键问题深入了解用户需求
- **六维度框架**：
  1. 反模式设定 - 明确避免什么
  2. 场景与氛围 - 创造具体情境
  3. 风格与深度 - 定义表达方式
  4. 核心聚焦 - 收窄到具体角度
  5. 形式约束 - 创造性限制
  6. 质量标准 - 定义成功标准

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Claude API

## 快速开始

1. 克隆项目
```bash
git clone [your-repo-url]
cd prompt-optimizer
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.local.example .env.local
# 编辑 .env.local 文件，添加你的 Claude API Key
```

4. 运行开发服务器
```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## API 配置

### 直连方式（需要海外网络）
```env
CLAUDE_API_KEY=your_claude_api_key_here
```

### 代理方式（国内访问）
```env
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_API_PROXY=https://your-proxy.workers.dev
```

## 项目结构

```
prompt-optimizer/
├── app/
│   ├── api/
│   │   └── optimize/     # API路由
│   ├── components/       # React组件
│   ├── lib/             # 工具函数
│   ├── types/           # TypeScript类型定义
│   ├── globals.css      # 全局样式
│   ├── layout.tsx       # 根布局
│   └── page.tsx         # 主页面
├── public/              # 静态资源
└── package.json
```

## 部署

### Vercel 部署（推荐）
1. 将项目推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

### 自托管
```bash
npm run build
npm start
```

## License

MIT