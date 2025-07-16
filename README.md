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

- Next.js 15.3.5 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Google Gemini 2.5 Pro API
- 流式响应支持

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
# 编辑 .env.local 文件，添加你的 Google API Key
```

`.env.local` 文件示例：
```env
GOOGLE_API_KEY=your_google_api_key_here
API_PROVIDER=google
```

4. 运行开发服务器
```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 最新优化（2025年1月）

### 🚀 性能优化
- **API 预热机制**：应用启动时预热 API，减少首次调用延迟
- **智能缓存系统**：相同输入自动使用缓存结果，提升响应速度
- **防抖处理**：避免频繁 API 调用，优化用户体验
- **流式输出**：实时显示生成结果，提供更好的交互体验
- **Service Worker**：支持离线访问和资源缓存

### 🛡️ 安全性增强
- **输入验证**：全面的请求参数验证，防止恶意输入
- **环境变量验证**：启动时检查必需的环境变量
- **错误处理**：统一的错误响应格式，区分开发/生产环境
- **安全头配置**：添加 X-Frame-Options、CSP 等安全头
- **API 密钥保护**：服务端处理，前端不暴露密钥

### 🎨 用户体验改进
- **错误状态UI**：友好的错误提示和重试机制
- **进度保存**：自动保存优化进度，刷新不丢失
- **页面过渡效果**：平滑的动画过渡
- **响应式设计**：完美适配移动端和桌面端
- **快速优化模式**：跳过问答，直接生成结果

### 🔧 代码质量提升
- **TypeScript 严格模式**：更好的类型安全
- **模块化架构**：清晰的代码组织结构
- **统一验证层**：集中的输入验证逻辑
- **错误处理中间件**：一致的错误处理模式

### 📊 新增功能
- **分段显示**：长文本自动分段，支持折叠展开
- **六维度可视化**：直观展示优化维度分析
- **一键复制**：快速复制优化结果
- **设置面板**：自定义过渡效果、流式输出等

## API 配置

### Google Gemini API
```env
GOOGLE_API_KEY=your_google_api_key_here
API_PROVIDER=google
```

获取 API Key：
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的 API Key
3. 将 Key 添加到 `.env.local` 文件

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

### Netlify 部署（推荐）
1. 将项目推送到 GitHub
2. 在 Netlify 导入项目
3. 配置环境变量：
   - `GOOGLE_API_KEY`: 你的 Google API Key
   - `API_PROVIDER`: google
4. 部署设置：
   - Build command: `npm run build`
   - Publish directory: `.next`
5. 部署

### Vercel 部署
1. 将项目推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署

### 自托管
```bash
npm run build
npm start
```

## 故障排查

### 优化结果显示为空
1. 检查浏览器控制台是否有错误信息
2. 确认 API Key 配置正确
3. 查看网络请求是否成功返回数据

### API 调用失败
1. 验证 Google API Key 是否有效
2. 检查 API 配额是否用完
3. 确认网络连接正常

### 部署后样式丢失
1. 确保 Tailwind CSS 构建正确
2. 检查环境变量是否正确设置
3. 清除浏览器缓存后重试

## License

MIT