<template>
  <ChatLayout :app-title="'论文助手'" :function-items="functionItems" :active-function-index="0" :show-input-bar="false">
    <template #header-actions>
      <button class="action-button" @click="onExportClick">
        <i class="icon">📤</i>
        <span>导出翻译</span>
      </button>
      <button class="action-button" @click="onHistoryClick">
        <i class="icon">📜</i>
        <span>翻译历史</span>
      </button>
      <button class="action-button primary" @click="onNewTranslateClick">
        <i class="icon">📝</i>
        <span>新翻译</span>
      </button>
    </template>
    
    <div class="translation-result-container">
      <!-- 原文 -->
      <div class="translation-card">
        <div class="card-header">
          <div class="card-title">原文</div>
          <button class="copy-button" @click="copyText(originalText)">
            <i class="icon">📋</i>
            <span>复制</span>
          </button>
        </div>
        <div class="card-content">
          <p>{{ originalText }}</p>
        </div>
      </div>
      
      <!-- 标准翻译 -->
      <div class="translation-card">
        <div class="card-header">
          <div class="card-title">标准翻译</div>
          <button class="copy-button" @click="copyText(standardTranslation)">
            <i class="icon">📋</i>
            <span>复制</span>
          </button>
        </div>
        <div class="card-content">
          <p>{{ standardTranslation }}</p>
        </div>
      </div>
      
      <!-- 学术翻译 -->
      <div class="translation-card">
        <div class="card-header">
          <div class="card-title">学术翻译</div>
          <button class="copy-button" @click="copyText(academicTranslation)">
            <i class="icon">📋</i>
            <span>复制</span>
          </button>
        </div>
        <div class="card-content">
          <p>{{ academicTranslation }}</p>
        </div>
      </div>
      
      <!-- 反馈部分 -->
      <div class="feedback-section">
        <div class="feedback-header">翻译质量反馈</div>
        <div class="rating-container">
          <div class="rating-label">您对翻译结果的评价:</div>
          <div class="rating-stars">
            <span 
              v-for="star in 5" 
              :key="star" 
              class="star" 
              :class="{ 'active': star <= rating }"
              @click="setRating(star)"
            >★</span>
          </div>
        </div>
        <textarea 
          v-model="feedbackText" 
          class="feedback-textarea" 
          placeholder="请输入您的反馈或建议..."
        ></textarea>
        <button class="submit-button" @click="submitFeedback">提交反馈</button>
      </div>
    </div>
  </ChatLayout>
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
        { name: '翻译结果', icon: '🔄' }
      ],
      originalText: '研究表明，长期使用数字设备可能导致眼睛疲劳和睡眠质量下降。特别是在使用手机和电脑屏幕的前两个小时内使用这些设备会影响褪黑激素的产生，这是一种控制我们睡眠-觉醒周期的荷尔蒙。然而，简单的措施如遵循20-20-20规则（每20分钟看20英尺外的物体20秒）和减少睡前屏幕时间可以减轻这些影响。',
      standardTranslation: 'Research shows that long-term use of digital devices may lead to eye fatigue and decreased sleep quality. Particularly, using these devices within two hours before bedtime may affect the production of melatonin, a hormone that controls our sleep-wake cycle. However, simple measures such as following the 20-20-20 rule (looking at an object 20 feet away for 20 seconds every 20 minutes) and reducing screen time before bed can mitigate these effects.',
      academicTranslation: 'Empirical evidence suggests that prolonged utilization of digital devices may result in ocular fatigue and deterioration of sleep quality. Specifically, the exposure to these devices within the two-hour period preceding sleep has been observed to inhibit melatonin secretion, a hormone responsible for regulating circadian rhythms. Nevertheless, implementation of straightforward interventions, such as adherence to the 20-20-20 principle (directing gaze at an object situated 20 feet away for a duration of 20 seconds at 20-minute intervals) and curtailing pre-somnolent screen exposure, can significantly attenuate these adverse effects.',
      rating: 0,
      feedbackText: ''
    };
  },
  methods: {
    copyText(text) {
      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          });
        }
      });
    },
    setRating(rating) {
      this.rating = rating;
    },
    submitFeedback() {
      if (this.rating === 0) {
        uni.showToast({
          title: '请选择评分',
          icon: 'none'
        });
        return;
      }
      
      // 在这里提交反馈到服务器
      uni.showLoading({ title: '提交中...' });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '感谢您的反馈！',
          icon: 'success'
        });
        
        // 重置反馈表单
        this.rating = 0;
        this.feedbackText = '';
      }, 1000);
    },
    onExportClick() {
      // 导出翻译逻辑
      uni.showToast({
        title: '导出功能开发中',
        icon: 'none'
      });
    },
    onHistoryClick() {
      // 跳转到历史记录页面
      uni.navigateTo({
        url: '/pages/history/history'
      });
    },
    onNewTranslateClick() {
      // 跳转到新翻译页面
      uni.navigateTo({
        url: '/pages/translate/translate'
      });
    }
  }
};
</script>

<style scoped>
.translation-result-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.translation-card {
  background-color: #252526;
  border-radius: 8px;
  border: 1px solid #3c3c3c;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #3c3c3c;
  background-color: #2d2d30;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: #3c3c3c;
  border: none;
  border-radius: 4px;
  color: #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-button:hover {
  background-color: #4c4c4c;
}

.card-content {
  padding: 20px;
  line-height: 1.6;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #2d2d30;
  border: 1px solid #3c3c3c;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #3c3c3c;
}

.action-button.primary {
  background-color: #0e639c;
  border-color: #0e639c;
}

.action-button.primary:hover {
  background-color: #1177bb;
}

.icon {
  font-size: 16px;
}

.feedback-section {
  background-color: #252526;
  border-radius: 8px;
  border: 1px solid #3c3c3c;
  padding: 20px;
  margin-top: 24px;
}

.feedback-header {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
}

.rating-container {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.rating-label {
  margin-right: 12px;
}

.rating-stars {
  display: flex;
  gap: 8px;
}

.star {
  font-size: 24px;
  color: #565656;
  cursor: pointer;
  transition: color 0.2s;
}

.star:hover,
.star.active {
  color: #f1c40f;
}

.feedback-textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  border-radius: 6px;
  background-color: #2d2d30;
  border: 1px solid #3c3c3c;
  color: #e0e0e0;
  resize: vertical;
  margin-bottom: 16px;
  font-family: inherit;
}

.submit-button {
  padding: 10px 24px;
  background-color: #0e639c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;
}

.submit-button:hover {
  background-color: #1177bb;
}
</style> 