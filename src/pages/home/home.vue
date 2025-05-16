<template>
  <view class="home-page">
    <ChatLayout
      appTitle="科研助手"
      :functionItems="functionItems"
      :activeFunctionIndex="activeFunctionIndex"
      @function-selected="handleFunctionSelected"
      @send-message="handleSendMessage"
      @settings-click="handleSettingsClick"
    >
      <template #header-actions>
        <button class="action-button" @click="navigateToAccount">
          <text class="action-icon">👤</text>
        </button>
      </template>
      
      <div class="dashboard-container">
        <div class="welcome-section">
          <h2 class="welcome-title">欢迎使用科研助手</h2>
          <p class="welcome-text">您的论文分析、文本翻译和科研问答一站式解决方案</p>
        </div>
        
        <div class="features-grid">
          <div 
            v-for="(feature, index) in features" 
            :key="index"
            class="feature-card"
            @click="navigateToFeature(feature)"
            :style="{'--feature-color': feature.color}"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <div class="feature-title">{{ feature.title }}</div>
            <div class="feature-description">{{ feature.description }}</div>
          </div>
        </div>
        
        <div class="recent-activity" v-if="recentActivities.length > 0">
          <h3 class="section-title">最近活动</h3>
          <div class="activity-list">
            <div 
              v-for="(activity, index) in recentActivities" 
              :key="index"
              class="activity-item"
              @click="navigateToActivity(activity)"
            >
              <div class="activity-icon">{{ activity.icon }}</div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
              <div class="activity-type-badge">{{ activity.type }}</div>
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  </view>
</template>

<script>
import ChatLayout from '@/components/ChatLayout.vue';

export default {
  components: {
    ChatLayout
  },
  data() {
    return {
      functionItems: [
        { name: '首页', icon: '🏠', starred: true },
        { name: '论文分析助手', icon: '📊' },
        { name: '文本翻译助手', icon: '🌐' },
        { name: '科研问答助手', icon: '🔍' }
      ],
      activeFunctionIndex: 0,
      features: [
        { 
          icon: '📊', 
          title: '论文分析助手', 
          description: '提取文章要点、整理文章思路、分析研究方向、生成文章模型图',
          path: '/pages/analysis/analysis',
          color: '#2c8073'
        },
        { 
          icon: '🌐', 
          title: '文本翻译助手', 
          description: '多语言学术文本翻译、保留专业术语、支持学术风格转换',
          path: '/pages/translate/translate',
          color: '#8f4e7e'
        },
        { 
          icon: '🔍', 
          title: '科研问答助手', 
          description: '解答研究问题、提供研究方法建议、辅助文献综述撰写',
          path: '/pages/qa/qa',
          color: '#4b6584'
        }
      ],
      recentActivities: [
        {
          icon: '📊',
          title: '论文分析：人工智能在医疗领域的应用',
          time: '今天 14:30',
          type: '分析',
          path: '/pages/analysis/analysis'
        },
        {
          icon: '🌐',
          title: '翻译：机器学习综述',
          time: '昨天 09:15',
          type: '翻译',
          path: '/pages/translate/translate'
        },
        {
          icon: '🔍',
          title: '问答：深度学习研究方法探讨',
          time: '2天前',
          type: '问答',
          path: '/pages/qa/qa'
        }
      ]
    }
  },
  methods: {
    handleFunctionSelected(index) {
      this.activeFunctionIndex = index;
      
      // 根据选择的功能导航到相应页面
      if (index > 0 && this.functionItems[index]) {
        const path = this.getFunctionPath(this.functionItems[index].name);
        if (path) {
          const functionName = this.functionItems[index].name;
          if (functionName === '科研问答助手') {
            uni.redirectTo({ url: path });
          } else {
            uni.navigateTo({ url: path });
          }
        }
      }
    },
    getFunctionPath(functionName) {
      switch (functionName) {
        case '论文分析助手': return '/pages/analysis/analysis';
        case '文本翻译助手': return '/pages/translate/translate';
        case '科研问答助手': return '/pages/qa/qa';
        default: return '';
      }
    },
    handleSendMessage(message) {
      // 简单的消息处理，在实际应用中可以扩展
      uni.redirectTo({
        url: '/pages/qa/qa'
      });
    },
    navigateToFeature(feature) {
      if (feature.path === '/pages/qa/qa') {
        uni.redirectTo({
          url: feature.path
        });
      } else {
        uni.navigateTo({
          url: feature.path
        });
      }
    },
    navigateToActivity(activity) {
      if (activity.path === '/pages/qa/qa') {
        uni.redirectTo({
          url: activity.path
        });
      } else {
        uni.navigateTo({
          url: activity.path
        });
      }
    },
    navigateToAccount() {
      uni.navigateTo({
        url: '/pages/account/account'
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
.home-page {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dashboard-container {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  width: 100%;
}

.welcome-section {
  margin-bottom: 32px;
  text-align: center;
  background-color: #2a2a2a;
  border-radius: 12px;
  padding: 32px 20px;
  border: 1px solid #3c3c3c;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.welcome-title {
  margin: 0;
  margin-bottom: 12px;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #2c8073, #8f4e7e, #4b6584);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text {
  font-size: 16px;
  color: #a0a0a0;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.feature-card {
  background-color: #2d2d30;
  border: 1px solid #3c3c3c;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.feature-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--feature-color, #0e639c);
}

.feature-icon {
  font-size: 36px;
  margin-bottom: 16px;
  color: var(--feature-color, #0e639c);
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #e0e0e0;
}

.feature-description {
  font-size: 14px;
  color: #a0a0a0;
  line-height: 1.5;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  background-color: #2d2d30;
  border: 1px solid #3c3c3c;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.activity-item:hover {
  background-color: #3c3c3c;
}

.activity-icon {
  font-size: 24px;
  margin-right: 16px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 15px;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 13px;
  color: #8a8a8a;
}

.activity-type-badge {
  font-size: 12px;
  color: #e0e0e0;
  background-color: #0e639c;
  padding: 4px 8px;
  border-radius: 12px;
}

.action-button {
  background: transparent;
  border: none;
  color: #c0c0c0;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #3c3c3c;
}

.action-icon {
  font-size: 16px;
}
</style> 