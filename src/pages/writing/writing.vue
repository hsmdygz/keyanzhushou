<template>
  <view class="model-page">
    <ChatLayout
      ref="chatLayout"
      appTitle="科研助手"
      :functionItems="functionItems"
      :activeFunctionIndex="activeFunctionIndex"
      @function-selected="handleFunctionSelected"
      @send-message="handleSendMessage"
      @settings-click="handleSettingsClick"
    >
      <template #header-actions>
        <button class="action-button" @click="handleClearChat">
          <text class="action-icon">🗑️</text>
        </button>
        <button class="action-button" @click="handleExportChat">
          <text class="action-icon">💾</text>
        </button>
      </template>
      
      <div class="chat-messages-container">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-title">科研写作助手</div>
          <div class="empty-text">
            欢迎使用科研助手，我可以帮助您进行论文写作、语法修改、结构优化以及学术表达润色等工作。
          </div>
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">论文写作辅助</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">语法润色修改</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">结构优化建议</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">学术表达改进</div>
            </div>
          </div>
          <div class="quick-prompts">
            <button 
              v-for="(prompt, index) in quickPrompts" 
              :key="index" 
              class="quick-prompt-btn"
              @click="handleQuickPrompt(prompt)"
            >
              {{ prompt.title }}
            </button>
          </div>
        </div>
        
        <template v-else>
          <ChatMessage 
            v-for="(message, index) in messages" 
              :key="index" 
            :content="message.content"
            :isUser="message.isUser"
            :userName="userName"
            :systemName="activeFunction ? activeFunction.name : '科研助手'"
            :timestamp="message.timestamp"
            :isMarkdown="message.isMarkdown"
          />
        </template>
      </div>
      
      <template #input-actions-left>
        <button class="input-action-button">
          <text class="input-action-icon">📎</text>
        </button>
      </template>
      
      <template #input-actions-right>
        <button class="send-button" @click="$refs.chatLayout.sendMessage()">
          发送
        </button>
      </template>
    </ChatLayout>
  </view>
</template>

<script>
import ChatLayout from '@/components/ChatLayout.vue';
import ChatMessage from '@/components/ChatMessage.vue';
import { http } from '@/utils/request.js';

export default {
  components: {
    ChatLayout,
    ChatMessage
  },
  data() {
    return {
      userName: '用户',
      functionItems: [
        { name: '科研助手', icon: '📝', starred: true },
        { name: '论文分析', icon: '📊' },
        { name: '智能翻译', icon: '🌐' },
        { name: '文献检索', icon: '📚' }
      ],
      activeFunctionIndex: 0,
      messages: [],
      sessionId: null,
      isLoading: false,
      quickPrompts: [
        { title: '润色论文摘要', content: '请帮我润色以下论文摘要，使其更加学术化和专业化：' },
        { title: '检查语法错误', content: '请检查以下文本中的语法错误和表达不当之处：' },
        { title: '生成论文大纲', content: '我正在写一篇关于人工智能的论文，请帮我生成一个详细的论文大纲。' },
        { title: '改进参考文献格式', content: '请将以下参考文献转换为APA格式：' }
      ]
    }
  },
  mounted() {
    // 尝试从本地存储加载会话ID
    this.sessionId = uni.getStorageSync('writing_session_id') || null;
    if (this.sessionId) {
      this.loadChatHistory();
    }
  },
  computed: {
    activeFunction() {
      return this.functionItems[this.activeFunctionIndex] || null;
    }
  },
  methods: {
    handleFunctionSelected(index) {
      this.activeFunctionIndex = index;
      
      // 导航到相应页面
      if (this.functionItems[index]) {
        const functionName = this.functionItems[index].name;
        
        if (functionName === '论文分析') {
          uni.navigateTo({ url: '/pages/analysis/analysis' });
        } else if (functionName === '智能翻译') {
          uni.navigateTo({ url: '/pages/translate/translate' });
        } else if (functionName === '文献检索') {
          // 可以根据需要添加这些功能的导航
          uni.showToast({
            title: '即将上线，敬请期待',
            icon: 'none'
          });
        }
      }
    },
    async loadChatHistory() {
      try {
        // 从API加载聊天历史
        const response = await http.get('/writing/history/' + this.sessionId);
        
        if (response.data && response.data.messages) {
          this.messages = response.data.messages;
        }
      } catch (error) {
        console.error('加载聊天历史失败:', error);
        // 如果加载失败，清除可能已损坏的会话ID
        uni.removeStorageSync('writing_session_id');
        this.sessionId = null;
      }
    },
    handleSendMessage(message) {
      if (!message || !message.trim() || this.isLoading) return;
      
      // 添加用户消息
      this.messages.push({
        content: message,
        isUser: true,
        timestamp: new Date()
      });
      
      // 设置加载状态
      this.isLoading = true;
      
      // 尝试发送API请求，如果失败则使用本地响应
      this.sendChatRequest(message);
    },
    async sendChatRequest(message) {
      try {
        // 发送API请求
        const response = await http.post('/writing/chat', {
          message: message,
          sessionId: this.sessionId
        });
        
        // 保存返回的会话ID
        if (response.data && response.data.sessionId) {
          this.sessionId = response.data.sessionId;
          uni.setStorageSync('writing_session_id', this.sessionId);
        }
        
        // 添加AI回复
        if (response.data && response.data.reply) {
          this.messages.push({
            content: response.data.reply,
            isUser: false,
            timestamp: new Date(),
            isMarkdown: true // 启用Markdown渲染
          });
        }
      } catch (error) {
        console.error('请求失败:', error);
        
        // 如果API请求失败，则使用本地响应
        this.useLocalResponse(message);
        
        // 显示错误提示
        uni.showToast({
          title: '网络请求失败，使用本地响应',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.isLoading = false;
      }
    },
    useLocalResponse(message) {
      // 本地响应逻辑
      let responseContent;
      let isMarkdown = true;
      
      // 基于用户消息简单匹配回复内容
      if (message.includes('润色') || message.includes('修改')) {
        responseContent = `## 论文润色

我很乐意帮您润色论文。要获得最佳效果，请提供原文，我将从以下几个方面进行改进：

1. **学术表达**：使用更专业、更准确的学术用语
2. **语法修正**：修正语法错误和不规范表达
3. **逻辑连贯**：改善句子间的逻辑连接
4. **精简表达**：去除冗余内容，使表述更加简洁有力

请提供您需要润色的文本，我会尽快为您处理。`;
      } else if (message.includes('大纲') || message.includes('结构')) {
        responseContent = `## 论文大纲建议

以下是关于人工智能的论文大纲框架：

### 1. 引言
- 研究背景与意义
- 研究问题和目标
- 论文结构概述

### 2. 文献综述
- 人工智能发展历史
- 关键技术和方法论
- 当前研究趋势和挑战

### 3. 理论框架
- 基本概念和定义
- 算法和模型介绍
- 评估指标和方法

### 4. 应用领域分析
- 医疗健康
- 金融服务
- 智能制造
- 社会服务

### 5. 案例研究
- 研究方法
- 数据收集与分析
- 结果呈现与讨论

### 6. 未来展望
- 技术发展趋势
- 潜在挑战与机遇
- 研究局限性

### 7. 结论
- 研究总结
- 主要贡献
- 进一步研究方向

您可以根据具体研究方向和研究问题调整此大纲，进一步细化每个部分的内容。`;
      } else if (message.includes('语法') || message.includes('错误')) {
        responseContent = `## 语法检查服务

要进行语法检查，请提供您需要检查的文本。我会帮您：

1. 标识并修正语法错误
2. 改进句子结构
3. 优化表达方式
4. 提供修改建议和解释

请注意，为了获得最佳效果，建议提供完整段落或章节，这样我可以结合上下文进行更准确的检查和建议。`;
      } else if (message.includes('参考文献') || message.includes('引用')) {
        responseContent = `## APA格式参考文献示例

APA格式(第7版)的参考文献格式如下：

### 期刊文章
作者, A. A., 作者, B. B., & 作者, C. C. (年份). 文章标题. *期刊名称*, *卷号*(期号), 页码范围. DOI或URL

例如：
Smith, J. D., & Johnson, K. L. (2020). Machine learning applications in healthcare. *Journal of Artificial Intelligence in Medicine*, 15(2), 125-137. https://doi.org/10.xxxx/xxxxx

### 书籍
作者, A. A. (年份). *书名*. 出版商名称. DOI或URL

例如：
Williams, R. T. (2019). *Advanced neural networks: Theory and application*. Academic Press.

### 编辑书籍中的章节
作者, A. A., & 作者, B. B. (年份). 章节标题. 在 A. 编辑 & B. 编辑 (编), *书名* (页码范围). 出版商名称. DOI或URL

### 网页
作者, A. A. (年份, 月 日). 文章或页面标题. 网站名称. URL

请提供您需要转换的参考文献，我会将其转换为标准APA格式。`;
      } else {
        responseContent = `# 科研写作助手

欢迎使用科研写作助手！我可以帮助您：

- **论文写作**：摘要、引言、方法、讨论、结论等各部分写作建议
- **语法检查**：识别并修正语法错误，改进表达
- **学术润色**：提升文章的学术性和专业性
- **结构优化**：改进论文结构，增强逻辑连贯性
- **参考文献格式化**：按照不同引用格式规范参考文献

请告诉我您需要什么方面的帮助，或直接提交需要处理的文本。`;
      }
      
      // 添加系统回复
      this.messages.push({
        content: responseContent,
        isUser: false,
        timestamp: new Date(),
        isMarkdown: isMarkdown
      });
    },
    handleQuickPrompt(prompt) {
      this.handleSendMessage(prompt.content);
    },
    handleClearChat() {
      this.messages = [];
      // 清除会话ID，开始新对话
      this.sessionId = null;
      uni.removeStorageSync('writing_session_id');
    },
    handleExportChat() {
      // 导出聊天记录的逻辑
      const exportData = {
        title: "科研助手对话记录",
        timestamp: new Date().toISOString(),
        messages: this.messages.map(msg => ({
          role: msg.isUser ? "用户" : "助手",
          content: msg.content,
          time: msg.timestamp
        }))
      };
      
      // 将数据转换为文本
      const exportText = JSON.stringify(exportData, null, 2);
      
      // 在实际应用中，这里可以添加保存文件的逻辑
      // 例如，使用uni.saveFile或其他方法
      console.log("导出数据", exportText);
      
      // 显示成功提示
      uni.showToast({
        title: '对话记录已导出',
        icon: 'success'
      });
    },
    handleSettingsClick() {
      uni.navigateTo({
        url: '/pages/account/account'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.model-page {
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  height: 100vh;
  
  .chat-container {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .input-panel {
    width: 100%;
    box-sizing: border-box;
  }

  .message-list {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

.chat-messages-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.empty-text {
  color: #8a8a8a;
  margin-bottom: 24px;
  max-width: 600px;
  line-height: 1.5;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  max-width: 600px;
}

.feature-item {
  display: flex;
  align-items: center;
  background-color: rgba(45, 45, 48, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
}

.feature-icon {
  margin-right: 8px;
  color: #4caf50;
}

.feature-text {
  font-size: 14px;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  max-width: 600px;
}

.quick-prompt-btn {
  background-color: #2d2d30;
  border: 1px solid #3c3c3c;
  color: #e0e0e0;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  transition: background-color 0.2s;
  text-align: center;
}

.quick-prompt-btn:hover {
  background-color: #3c3c3c;
}

.action-button {
  background: none;
  border: none;
  padding: 8px;
  margin-left: 4px;
  cursor: pointer;
}

.action-icon {
  font-size: 20px;
}

.input-action-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.input-action-icon {
  font-size: 18px;
}

.send-button {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
}

.send-button:hover {
  background-color: #45a049;
}

.send-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style> 