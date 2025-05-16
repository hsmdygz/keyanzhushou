<template>
  <view class="page-container">
    <ChatLayout
      ref="chatLayout"
      appTitle="科研助手"
      :functionItems="functionItems"
      :activeFunctionIndex="activeFunctionIndex"
      @function-selected="handleFunctionSelected"
      @send-message="handleTranslateText"
      @settings-click="handleSettingsClick"
      :inputPlaceholder="inputPlaceholder"
    >
      <template #header-actions>
        <button class="action-button" @click="navigateToHistory" title="翻译历史">
          <text class="action-icon">📋</text>
        </button>
      </template>
      
      <div class="translate-container">
        <div class="card main-card">
          <div class="card-title">学术文本翻译</div>
          
          <div class="language-selector">
            <div class="language-group">
              <div class="language-label">源语言</div>
              <div class="select-wrapper">
                <select class="language-select" v-model="sourceLanguage">
                  <option value="zh">中文</option>
                  <option value="en">英文</option>
                </select>
              </div>
            </div>
            
            <button class="swap-button" @click="swapLanguages" title="交换语言">
              <text class="swap-icon">🔄</text>
            </button>
            
            <div class="language-group">
              <div class="language-label">目标语言</div>
              <div class="select-wrapper">
                <select class="language-select" v-model="targetLanguage">
                  <option value="zh">中文</option>
                  <option value="en">英文</option>
                </select>
              </div>
            </div>
            
            <div class="style-selector">
              <div class="language-label">翻译风格</div>
              <div class="select-wrapper">
                <select class="language-select" v-model="translationStyle">
                  <option value="academic">学术风格</option>
                  <option value="casual">日常风格</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="description">
            我们的翻译系统专为科研工作者设计，可准确翻译中英文学术文献、论文摘要和专业术语，保留专业性和学术风格。
          </div>
          
          <div class="features">
            <div class="feature-tag">✓ 保留专业术语</div>
            <div class="feature-tag">✓ 准确语义转换</div>
            <div class="feature-tag">✓ 学术文体转换</div>
            <div class="feature-tag">✓ 中英文互译</div>
          </div>
        </div>
        
        <div class="card result-card" v-if="translatedText">
          <div class="card-title">翻译结果</div>
          
          <div class="result-content">
            {{ translatedText }}
          </div>
          
          <div class="result-actions">
            <button class="action-btn" @click="copyTranslatedText">
              <text class="btn-icon">📋</text> 复制
            </button>
            <button class="action-btn" @click="saveToHistory">
              <text class="btn-icon">💾</text> 保存
            </button>
          </div>
          
          <div class="translation-info" v-if="translationComplete">
            <div class="info-item">{{ getLanguageName(sourceLanguage) }} → {{ getLanguageName(targetLanguage) }}</div>
            <div class="info-item">{{ translationStyle === 'academic' ? '学术风格' : '日常风格' }}</div>
          </div>
        </div>
      </div>
      
      <template #input-actions-left>
        <button class="action-button input-action-button" @click="clearText" title="清空文本">
          <text class="input-action-icon">🗑️</text>
        </button>
        <button class="action-button input-action-button" @click="pasteFromClipboard" title="从剪贴板粘贴">
          <text class="input-action-icon">📋</text>
        </button>
      </template>
      
      <template #input-actions-right>
        <button class="send-button" @click="handleTranslateText($refs.chatLayout.inputText)" :disabled="isTranslating">
          {{ isTranslating ? '翻译中...' : '翻译' }}
        </button>
      </template>
    </ChatLayout>
  </view>
</template>

<script>
import ChatLayout from '@/components/ChatLayout.vue';
import { http } from '@/utils/request.js';

export default {
  components: {
    ChatLayout
  },
  data() {
    return {
      functionItems: [
        { name: '首页', icon: '🏠' },
        { name: '论文分析助手', icon: '📊' },
        { name: '文本翻译助手', icon: '🌐', starred: true },
        { name: '科研问答助手', icon: '🔍' }
      ],
      activeFunctionIndex: 2, // 文本翻译助手激活
      sourceLanguage: 'zh',
      targetLanguage: 'en',
      translationStyle: 'academic',
      translatedText: '',
      isTranslating: false,
      translationComplete: false,
      translationId: null,
      errorMessage: '',
      inputPlaceholder: '输入需要翻译的文本...'
    };
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
        } else if (functionName === '科研问答助手') {
          uni.redirectTo({ url: '/pages/qa/qa' });
        }
      }
    },
    swapLanguages() {
      const temp = this.sourceLanguage;
      this.sourceLanguage = this.targetLanguage;
      this.targetLanguage = temp;
      
      // 如果已有翻译结果，清空它
      if (this.translatedText) {
        this.translatedText = '';
        this.translationComplete = false;
      }
    },
    async handleTranslateText(text) {
      if (!text || !text.trim() || this.isTranslating) return;
      
      this.isTranslating = true;
      this.errorMessage = '';
      this.translationComplete = false;
      
      try {
        // 显示翻译中提示
        uni.showLoading({
          title: '翻译中...',
          mask: true
        });
        
        // 调用翻译API
        const response = await http.post('/translate', {
          text: text,
          sourceLanguage: this.sourceLanguage,
          targetLanguage: this.targetLanguage,
          style: this.translationStyle
        });
        
        // 隐藏加载提示
        uni.hideLoading();
        
        if (response.data) {
          this.translatedText = response.data.translatedText;
          this.translationId = response.data.translationId;
          this.translationComplete = true;
          
          // 保存翻译历史记录
          this.saveTranslationHistory(text, this.translatedText);
        }
      } catch (error) {
        console.error('翻译请求失败:', error);
        this.errorMessage = error.message || '翻译失败，请稍后重试';
        
        // 隐藏加载提示
        uni.hideLoading();
        
        // 使用本地模拟翻译作为备用
        this.useLocalTranslation(text);
        
        // 显示错误提示
        uni.showToast({
          title: '网络请求失败，使用本地翻译',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.isTranslating = false;
      }
    },
    useLocalTranslation(text) {
      // 本地模拟翻译逻辑
      setTimeout(() => {
        // 模拟翻译结果
        if (this.sourceLanguage === 'zh' && this.targetLanguage === 'en') {
          this.translatedText = 'This is the translated text from Chinese to English. The translation maintains academic terminology and ensures accurate semantic conversion.';
        } else if (this.sourceLanguage === 'en' && this.targetLanguage === 'zh') {
          this.translatedText = '这是从英文翻译成中文的文本。翻译保留了学术术语并确保了准确的语义转换。';
        } else {
          this.translatedText = text + ' (翻译失败，当前只支持中英文互译)'; 
        }
        
        this.translationComplete = true;
      }, 800);
    },
    saveTranslationHistory(sourceText, translatedText) {
      try {
        // 保存翻译历史到本地存储
        const history = uni.getStorageSync('translation_history') || [];
        history.unshift({
          id: this.translationId || Date.now(),
          sourceText: sourceText,
          translatedText: translatedText,
          sourceLanguage: this.sourceLanguage,
          targetLanguage: this.targetLanguage,
          style: this.translationStyle,
          timestamp: new Date().toISOString()
        });
        
        // 限制历史记录数量
        const limitedHistory = history.slice(0, 50);
        uni.setStorageSync('translation_history', limitedHistory);
      } catch (error) {
        console.error('保存翻译历史失败:', error);
      }
    },
    saveToHistory() {
      if (!this.translatedText) return;
      
      const sourceText = this.$refs.chatLayout.inputText;
      this.saveTranslationHistory(sourceText, this.translatedText);
      
      uni.showToast({
        title: '已保存到历史记录',
        icon: 'success',
        duration: 1500
      });
    },
    copyTranslatedText() {
      uni.setClipboardData({
        data: this.translatedText,
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          });
        }
      });
    },
    clearText() {
      if (this.$refs.chatLayout) {
        this.$refs.chatLayout.inputText = '';
      }
    },
    pasteFromClipboard() {
      uni.getClipboardData({
        success: (res) => {
          if (this.$refs.chatLayout && res.data) {
            this.$refs.chatLayout.inputText = res.data;
          }
        }
      });
    },
    navigateToHistory() {
      uni.navigateTo({
        url: '/pages/translate/history'
      });
    },
    handleSettingsClick() {
      uni.navigateTo({
        url: '/pages/account/account'
      });
    },
    getLanguageName(code) {
      const languages = {
        'zh': '中文',
        'en': '英文'
      };
      return languages[code] || code;
    }
  }
}
</script>

<style>
@import '@/static/css/common.scss';

.translate-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background-color: var(--bg-card, #252526);
  border-radius: var(--border-radius-lg, 12px);
  border: 1px solid var(--border-color, #3c3c3c);
  padding: 24px;
}

.main-card {
  margin-bottom: 20px;
}

.card-title {
  font-size: var(--font-size-large, 18px);
  font-weight: 500;
  margin-bottom: 20px;
  color: var(--text-primary, #e0e0e0);
}

.language-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.language-group {
  flex: 1;
  min-width: 150px;
}

.language-label {
  font-size: var(--font-size-base, 15px);
  color: var(--text-secondary, #8a8a8a);
  margin-bottom: 8px;
}

.select-wrapper {
  position: relative;
}

.language-select {
  width: 100%;
  padding: 10px 12px;
  background-color: #2d2d30;
  border: 1px solid var(--border-color, #3c3c3c);
  border-radius: var(--border-radius-sm, 6px);
  color: var(--text-primary, #e0e0e0);
  font-size: var(--font-size-base, 15px);
  cursor: pointer;
  appearance: none;
}

.swap-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2d2d30;
  border: 1px solid var(--border-color, #3c3c3c);
  border-radius: var(--border-radius-sm, 6px);
  cursor: pointer;
  margin-top: 24px;
}

.swap-icon {
  font-size: var(--font-size-base, 15px);
}

.style-selector {
  flex-basis: 100%;
  max-width: 300px;
}

.description {
  font-size: var(--font-size-base, 15px);
  color: var(--text-secondary, #8a8a8a);
  line-height: 1.6;
  margin-bottom: 20px;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.feature-tag {
  background-color: rgba(14, 99, 156, 0.2);
  color: var(--text-primary, #e0e0e0);
  padding: 6px 12px;
  border-radius: var(--border-radius-sm, 6px);
  font-size: var(--font-size-small, 13px);
}

.result-card {
  margin-bottom: 30px;
}

.result-content {
  background-color: #2d2d30;
  border-radius: var(--border-radius-sm, 6px);
  padding: 16px;
  margin-bottom: 16px;
  line-height: 1.6;
  min-height: 120px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: var(--font-size-base, 15px);
}

.result-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.action-btn {
  background-color: #333;
  color: var(--text-primary, #e0e0e0);
  border: 1px solid var(--border-color, #3c3c3c);
  padding: 8px 16px;
  border-radius: var(--border-radius-sm, 6px);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-base, 15px);
  cursor: pointer;
}

.btn-icon {
  font-size: var(--font-size-base, 15px);
}

.translation-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.info-item {
  font-size: var(--font-size-small, 13px);
  color: var(--text-secondary, #8a8a8a);
  background-color: #333;
  padding: 4px 10px;
  border-radius: var(--border-radius-sm, 6px);
}

.input-action-icon {
  font-size: var(--font-size-base, 15px);
}
</style> 