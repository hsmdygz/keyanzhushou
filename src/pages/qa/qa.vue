<template>
  <view class="page-container">
    <ChatLayout
      ref="chatLayout"
      appTitle="科研助手"
      :functionItems="functionItems"
      :activeFunctionIndex="activeFunctionIndex"
      @function-selected="handleFunctionSelected"
      @send-message="handleSendMessage"
      @settings-click="handleSettingsClick"
      :loading="isLoading"
      :messages="messages"
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
          <div class="empty-icon">🔍</div>
          <div class="empty-title">科研问答助手</div>
          <div class="empty-text">
            欢迎使用科研问答助手，我可以帮助您解答科研相关问题，提供文献参考和专业知识支持。
          </div>
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">科研问题解答</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">文献参考推荐</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">研究方法建议</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">✓</div>
              <div class="feature-text">学术知识普及</div>
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
            :references="message.references"
          />
        </template>
      </div>
      
      <template #input-actions-left>
        <button class="action-button input-action-button">
          <text class="input-action-icon">📎</text>
        </button>
      </template>
      
      <template #input-actions-right>
        <button class="send-button" @click="$refs.chatLayout.sendMessage()">
          发送
        </button>
      </template>
      
      <!-- 添加本地模式切换开关 -->
      <view class="mode-switch">
        <text class="mode-text">本地响应模式</text>
        <switch :checked="useLocalMode" @change="toggleLocalMode" />
      </view>
    </ChatLayout>
  </view>
</template>

<script>
import ChatLayout from '@/components/ChatLayout.vue';
import ChatMessage from '@/components/ChatMessage.vue';
import { qaChat, getChatHistory } from '@/api/qa.js';

export default {
  components: {
    ChatLayout,
    ChatMessage
  },
  data() {
    return {
      userName: '用户',
      functionItems: [
        { name: '首页', icon: '🏠' },
        { name: '论文分析助手', icon: '📊' },
        { name: '文本翻译助手', icon: '🌐' },
        { name: '科研问答助手', icon: '🔍', starred: true }
      ],
      activeFunctionIndex: 3,
      messages: [],
      sessionId: null,
      isLoading: false,
      quickPrompts: [
        { title: '科研方法推荐', content: '对于研究机器学习在医疗图像分析中的应用，有哪些推荐的研究方法？' },
        { title: '研究趋势分析', content: '请分析近五年在可再生能源领域的研究热点和发展趋势。' },
        { title: '实验设计建议', content: '我正在设计一个关于人工智能辅助诊断的实验，请给出实验设计建议。' },
        { title: '文献综述指导', content: '如何有效撰写一篇关于量子计算的文献综述？' }
      ],
      useLocalMode: true
    }
  },
  mounted() {
    // 尝试从本地存储加载会话ID
    this.sessionId = uni.getStorageSync('qa_session_id') || null;
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
        
        if (functionName === '首页') {
          uni.navigateTo({ url: '/pages/home/home' });
        } else if (functionName === '论文分析助手') {
          uni.navigateTo({ url: '/pages/analysis/analysis' });
        } else if (functionName === '文本翻译助手') {
          uni.navigateTo({ url: '/pages/translate/translate' });
        }
      }
    },
    async loadChatHistory() {
      try {
        // 从API加载聊天历史
        const response = await getChatHistory(this.sessionId);
        
        if (response.data && response.data.messages) {
          this.messages = response.data.messages;
        }
      } catch (error) {
        console.error('加载聊天历史失败:', error);
        // 如果加载失败，清除可能已损坏的会话ID
        uni.removeStorageSync('qa_session_id');
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
      
      // 根据模式选择使用本地响应还是API请求
      if (this.useLocalMode) {
        // 使用本地响应
        this.useLocalResponse(message);
        this.isLoading = false;
      } else {
        // 尝试发送API请求，如果失败则使用本地响应
        this.sendChatRequest(message);
      }
    },
    async sendChatRequest(message) {
      try {
        // 发送API请求
        const response = await qaChat(message, this.sessionId);
        
        // 保存返回的会话ID
        if (response && response.sessionId) {
          this.sessionId = response.sessionId;
          uni.setStorageSync('qa_session_id', this.sessionId);
        }
        
        // 添加AI回复
        if (response && response.answer) {
          this.messages.push({
            content: response.answer,
            isUser: false,
            timestamp: new Date(),
            isMarkdown: true, // 启用Markdown渲染
            references: response.references || [] // 添加参考文献
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
      let references = [];
      
      // 基于用户消息简单匹配回复内容
      if (message.includes('方法') || message.includes('推荐')) {
        responseContent = `## 机器学习在医疗图像分析中的研究方法

在医疗图像分析中应用机器学习，以下方法较为推荐：

1. **深度学习方法**
   - 卷积神经网络(CNN)：特别适合医学图像分类和分割
   - U-Net架构：在医学图像分割任务中表现卓越
   - 残差网络(ResNet)：解决梯度消失问题，适合复杂特征提取

2. **迁移学习**
   - 利用预训练模型解决医学数据稀缺问题
   - 特别适合小样本医学数据集

3. **生成对抗网络(GAN)**
   - 用于医学图像增强和合成
   - 可解决数据不平衡问题

4. **注意力机制**
   - 改进模型对关键区域的关注能力
   - 提高诊断准确率`;
        
        references = [
          {
            title: "Deep learning in medical image analysis",
            authors: "Litjens G, et al.",
            year: "2017",
            url: "https://doi.org/10.1016/j.media.2017.07.005"
          },
          {
            title: "U-Net: Convolutional Networks for Biomedical Image Segmentation",
            authors: "Ronneberger O, Fischer P, Brox T",
            year: "2015",
            url: "https://doi.org/10.1007/978-3-319-24574-4_28"
          }
        ];
      } else if (message.includes('趋势') || message.includes('发展')) {
        responseContent = `## 可再生能源领域研究趋势分析

近五年可再生能源领域的主要研究热点和趋势包括：

### 1. 储能技术突破
- 新型电池技术研发（固态电池、钠离子电池）
- 长时储能解决方案
- 分布式储能系统集成

### 2. 氢能源发展
- 绿氢生产效率提升
- 氢能基础设施建设
- 燃料电池技术优化

### 3. 智能电网与数字化
- 人工智能在电网管理中的应用
- 区块链在能源交易中的应用
- 需求侧响应优化

### 4. 太阳能技术创新
- 钙钛矿太阳能电池商业化
- 双面光伏组件普及
- 光伏建筑一体化(BIPV)`;
        
        references = [
          {
            title: "Renewable energy technology innovation in the 21st century",
            authors: "Hansen K, Mathiesen BV, Skov IR",
            year: "2019",
            url: "https://doi.org/10.1016/j.rser.2019.03.079"
          },
          {
            title: "The future of hydrogen: Opportunities and challenges",
            authors: "International Energy Agency",
            year: "2021",
            url: "https://www.iea.org/reports/the-future-of-hydrogen"
          }
        ];
      } else {
        responseContent = `## 科研问答

很高兴收到您的问题。为了提供更准确的回答，我需要了解更多关于您的研究领域和具体问题。请提供更多细节，例如：

1. 您的研究领域是什么？
2. 您目前遇到的具体科研问题或挑战是什么？
3. 您已经尝试过哪些方法或思路？
4. 您希望我从哪些方面为您提供帮助？

提供更具体的信息将帮助我给出更有针对性的建议和参考资料。`;
      }
      
      // 添加本地响应
      this.messages.push({
        content: responseContent,
        isUser: false,
        timestamp: new Date(),
        isMarkdown: isMarkdown,
        references: references
      });
    },
    handleQuickPrompt(prompt) {
      if (this.$refs.chatLayout) {
        this.$refs.chatLayout.setInputText(prompt.content);
      }
    },
    handleClearChat() {
      uni.showModal({
        title: '清空对话',
        content: '确定要清空当前对话吗？此操作不可撤销。',
        confirmText: '清空',
        confirmColor: '#FF3B30',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.messages = [];
            this.sessionId = null;
            uni.removeStorageSync('qa_session_id');
          }
        }
      });
    },
    handleExportChat() {
      // 将聊天记录转换为文本
      let exportText = '# 科研问答记录\n\n';
      
      this.messages.forEach((msg) => {
        const speaker = msg.isUser ? '用户' : '科研助手';
        const time = new Date(msg.timestamp).toLocaleString();
        exportText += `## ${speaker} (${time})\n\n${msg.content}\n\n`;
        
        // 添加参考文献
        if (!msg.isUser && msg.references && msg.references.length > 0) {
          exportText += '### 参考文献\n\n';
          msg.references.forEach((ref, index) => {
            exportText += `${index + 1}. ${ref.authors} (${ref.year}). ${ref.title}`;
            if (ref.url) {
              exportText += ` [链接](${ref.url})`;
            }
            exportText += '\n';
          });
          exportText += '\n';
        }
      });
      
      // 在移动应用中，可以使用剪贴板功能
      uni.setClipboardData({
        data: exportText,
        success: () => {
          uni.showToast({
            title: '对话已复制到剪贴板',
            icon: 'success'
          });
        }
      });
    },
    handleSettingsClick() {
      uni.navigateTo({
        url: '/pages/account/account'
      });
    },
    toggleLocalMode(e) {
      this.useLocalMode = e.detail.value;
    }
  }
}
</script>

<style>
@import '@/static/css/common.scss';

.chat-messages-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  border-radius: var(--border-radius-lg, 12px);
  background-color: var(--bg-card, #252526);
  border: 1px solid var(--border-color, #3c3c3c);
  max-width: 800px;
  margin: 40px auto;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-title {
  font-size: var(--font-size-xxlarge, 24px);
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary, #e0e0e0);
}

.empty-text {
  font-size: var(--font-size-medium, 16px);
  color: var(--text-secondary, #8a8a8a);
  margin-bottom: 30px;
  max-width: 600px;
  line-height: 1.6;
}

.features-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-sm, 6px);
}

.feature-icon {
  margin-right: 12px;
  color: #4caf50;
  font-weight: bold;
}

.feature-text {
  font-size: var(--font-size-base, 15px);
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  width: 100%;
  max-width: 700px;
}

.quick-prompt-btn {
  padding: 10px 16px;
  background-color: rgba(14, 99, 156, 0.2);
  border: 1px solid var(--primary-color, #0e639c);
  border-radius: var(--border-radius-sm, 6px);
  color: var(--text-primary, #e0e0e0);
  font-size: var(--font-size-base, 15px);
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: center;
}

.quick-prompt-btn:hover {
  background-color: rgba(14, 99, 156, 0.4);
}

.input-action-button {
  background-color: transparent;
  border: none;
  padding: 8px;
  color: var(--text-secondary, #8a8a8a);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-action-icon {
  font-size: var(--font-size-large, 18px);
}

.mode-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.mode-text {
  margin-right: 10px;
  color: var(--text-primary, #e0e0e0);
}
</style> 