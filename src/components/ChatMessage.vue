<template>
  <div class="message-container" :class="{ 'user-message': isUser, 'system-message': !isUser }">
    <div class="avatar">
      <div class="avatar-circle" :class="{ 'user-avatar': isUser, 'system-avatar': !isUser }">
        {{ isUser ? userInitial : 'AI' }}
      </div>
    </div>
    <div class="message-content">
      <div class="message-header">
        <div class="sender-name">{{ isUser ? userName : systemName }}</div>
        <div class="message-time">{{ formatTime }}</div>
      </div>
      <div class="message-body" v-if="!isMarkdown" v-html="formattedContent"></div>
      <div class="message-body markdown-content" v-else v-html="renderedMarkdown"></div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';

export default {
  name: 'ChatMessage',
  props: {
    content: {
      type: String,
      required: true
    },
    isUser: {
      type: Boolean,
      default: false
    },
    userName: {
      type: String,
      default: '用户'
    },
    systemName: {
      type: String,
      default: '助手'
    },
    timestamp: {
      type: [Date, Number, String],
      default: () => new Date()
    },
    isMarkdown: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    userInitial() {
      return this.userName.charAt(0).toUpperCase();
    },
    formatTime() {
      const date = new Date(this.timestamp);
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    },
    formattedContent() {
      // 简单的纯文本格式化，支持换行
      return this.content
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    },
    renderedMarkdown() {
      try {
        // 渲染Markdown内容
        return marked(this.content, { breaks: true });
      } catch (e) {
        console.error('Markdown渲染失败', e);
        return this.formattedContent;
      }
    }
  }
}
</script>

<style scoped>
.message-container {
  display: flex;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
}

.user-avatar {
  background-color: #2b5278;
  color: white;
}

.system-avatar {
  background-color: #4d4d4d;
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.sender-name {
  font-weight: 500;
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  color: #8a8a8a;
  margin-left: 8px;
}

.message-body {
  background-color: #2d2d30;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  overflow-x: auto;
}

.user-message .message-body {
  background-color: #2b5278;
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(pre) {
  background-color: #1e1e1e;
  border-radius: 4px;
  padding: 8px 12px;
  overflow-x: auto;
}

.markdown-content :deep(code) {
  font-family: 'Courier New', Courier, monospace;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #3c3c3c;
  padding: 6px 8px;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #2d2d30;
}

.markdown-content :deep(a) {
  color: #4da6ff;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #3c3c3c;
  margin: 8px 0;
  padding: 0 12px;
  color: #c0c0c0;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid #3c3c3c;
  margin: 16px 0;
}
</style> 