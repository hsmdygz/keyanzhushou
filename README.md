# 科研助手前端项目

基于大模型的科研助手前端项目，提供智能化的科研辅助功能，帮助研究人员提高工作效率。

## 功能特点

- 📝 智能论文分析
- 🔄 多语言翻译
- 💡 智能问答
- 📊 数据分析
- 📚 文献管理
- ✍️ 智能写作辅助

## 技术栈

- 框架：Vue 3 + uni-app
- UI组件：uni-ui
- 构建工具：Vite
- 样式处理：SASS
- 国际化：vue-i18n
- Markdown渲染：marked

## 项目结构

```
├── src/                # 源代码目录
│   ├── api/           # API 接口
│   ├── components/    # 公共组件
│   ├── pages/         # 页面文件
│   ├── static/        # 静态资源
│   └── utils/         # 工具函数
├── docs/              # 文档
└── static/            # 全局静态资源
```

## 安装说明

1. 克隆项目
```bash
git clone https://github.com/hsmdygz/keyanzhushou.git
cd keyanzhushou
```

2. 安装依赖
```bash
npm install
```

3. 运行开发服务器
```bash
# H5
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# 其他平台请参考 package.json 中的脚本命令
```

## 使用说明

1. 开发环境
   - 确保已安装 Node.js (推荐 v16 或更高版本)
   - 使用 HBuilderX 或 VS Code 进行开发
   - 建议使用 npm 或 yarn 作为包管理器

2. 构建部署
```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin
```

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目维护者：[hsmdygz](https://github.com/hsmdygz)
- 邮箱：2023242380@qq.com 