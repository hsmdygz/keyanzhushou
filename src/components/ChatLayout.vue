<template>
  <div class="chat-layout">
    <!-- 左侧功能列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2 class="app-title">{{ appTitle }}</h2>
      </div>
      
      <div class="sidebar-content">
        <div class="section-title">对话</div>
        <div 
          v-for="(item, index) in functionItems" 
          :key="index" 
          class="sidebar-item"
          :class="{ active: activeFunctionIndex === index }"
          @click="selectFunction(index)"
        >
          <div class="sidebar-item-icon">
            <slot :name="`icon-${index}`">
              <i class="icon">{{ item.icon || '📄' }}</i>
            </slot>
          </div>
          <div class="sidebar-item-text">{{ item.name }}</div>
          <div class="sidebar-item-star" v-if="item.starred">★</div>
        </div>
      </div>
      
      <div class="sidebar-footer">
        <div class="sidebar-item" @click="onSettingsClick">
          <div class="sidebar-item-icon">⚙️</div>
          <div class="sidebar-item-text">设置</div>
        </div>
      </div>
    </div>
    
    <!-- 右侧内容区域 -->
    <div class="content">
      <!-- 顶部标题栏 -->
      <div class="page-header">
        <div class="header-title">
          {{ activeFunction ? activeFunction.name : appTitle }}
          <span class="header-subtitle" v-if="activeFunction && activeFunction.subtitle">
            {{ activeFunction.subtitle }}
          </span>
        </div>
        
        <div class="header-actions">
          <slot name="header-actions"></slot>
        </div>
      </div>
      
      <!-- 主要内容区域 -->
      <div class="page-content" ref="contentMain">
        <slot></slot>
      </div>
      
      <!-- 底部输入框 -->
      <div class="page-footer" v-if="showInputBar">
        <div class="input-container">
          <div class="input-actions">
            <slot name="input-actions-left"></slot>
          </div>
          
          <div class="input-wrapper">
            <textarea 
              v-model="inputText" 
              class="input-textarea" 
              :placeholder="inputPlaceholder"
              @keydown.enter.ctrl.prevent="sendMessage"
            ></textarea>
          </div>
          
          <div class="input-actions">
            <slot name="input-actions-right">
              <button class="send-button" @click="sendMessage">发送</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatLayout',
  props: {
    appTitle: {
      type: String,
      default: '科研助手'
    },
    functionItems: {
      type: Array,
      default: () => []
    },
    activeFunctionIndex: {
      type: Number,
      default: 0
    },
    showInputBar: {
      type: Boolean,
      default: true
    },
    inputPlaceholder: {
      type: String,
      default: '在这里输入你的问题...'
    }
  },
  data() {
    return {
      inputText: '',
      windowWidth: window.innerWidth
    }
  },
  computed: {
    activeFunction() {
      return this.functionItems[this.activeFunctionIndex] || null;
    }
  },
  methods: {
    selectFunction(index) {
      this.$emit('function-selected', index);
    },
    sendMessage() {
      if (!this.inputText.trim()) return;
      this.$emit('send-message', this.inputText);
      this.inputText = '';
    },
    onSettingsClick() {
      this.$emit('settings-click');
    }
  }
}
</script>

<style>
@import '@/static/css/common.scss';

.chat-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: var(--bg-dark, #1e1e1e);
  color: var(--text-primary, #e0e0e0);
  overflow: hidden;
  min-width: 0;
}

/* 左侧边栏自定义样式 */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.section-title {
  padding: 10px 20px;
  font-size: var(--font-size-small, 13px);
  text-transform: uppercase;
  color: var(--text-secondary, #8a8a8a);
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-item:hover {
  background-color: #37373d;
}

.sidebar-item.active {
  background-color: var(--primary-color, #094771);
}

.sidebar-item-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.sidebar-item-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--font-size-base, 15px);
}

.sidebar-item-star {
  margin-left: 10px;
  color: #e4c07a;
  font-size: 16px;
}

.sidebar-footer {
  padding: 12px 0;
  border-top: 1px solid var(--border-color, #3c3c3c);
}

/* 右侧内容区域自定义样式 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-dark, #1e1e1e);
  overflow: hidden;
  width: calc(100% - var(--sidebar-width, 280px));
  min-width: 0;
}
</style> 