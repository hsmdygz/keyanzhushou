<template>
  <view class="history-container">
    <page-header title="翻译历史" />
    
    <!-- 风格筛选 -->
    <view class="filter-bar">
      <view 
        class="filter-item" 
        :class="{'active': currentStyle === 'all'}" 
        @click="changeStyle('all')"
      >
        <text>全部</text>
      </view>
      <view 
        class="filter-item" 
        :class="{'active': currentStyle === 'academic'}" 
        @click="changeStyle('academic')"
      >
        <text>学术版</text>
      </view>
      <view 
        class="filter-item" 
        :class="{'active': currentStyle === 'casual'}" 
        @click="changeStyle('casual')"
      >
        <text>普通版</text>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载历史记录中...</text>
    </view>
    
    <!-- 错误状态 -->
    <view v-else-if="hasError" class="error-container" @click="loadHistory">
      <image src="/static/icons/error.png" class="icon-large" mode="aspectFit"></image>
      <text class="error-title">{{ errorMsg }}</text>
      <text class="error-subtitle">点击重试</text>
      <button class="retry-btn" @click.stop="loadHistory">重新加载</button>
    </view>
    
    <!-- 空记录 -->
    <view v-else-if="historyList.length === 0" class="empty-container">
      <image src="/static/icons/empty.png" class="icon-large" mode="aspectFit"></image>
      <text class="empty-title">暂无翻译记录</text>
      <text class="empty-subtitle">返回翻译页面开始使用</text>
      <button class="translate-btn" @click="navigateToTranslate">开始翻译</button>
    </view>
    
    <!-- 历史列表 -->
    <scroll-view v-else scroll-y class="history-content">
      <view 
        v-for="item in historyList" 
        :key="item.id" 
        class="history-item"
        @click="viewTranslationDetail(item.id)"
      >
        <view class="history-icon">
          <image src="/static/icons/translate.png" class="icon-medium" mode="aspectFit"></image>
        </view>
        
        <view class="history-detail">
          <view class="history-header">
            <text class="history-title">{{ getLanguagePair(item.sourceLanguage, item.targetLanguage) }}</text>
            <text class="history-time">{{ formatDate(item.timestamp) }}</text>
          </view>
          
          <view class="history-preview">
            <text class="preview-text" :class="{'long-text': item.sourceText && item.sourceText.length > 50}">
              {{ item.sourceText }}
            </text>
          </view>
          
          <view class="history-tags">
            <text class="history-tag">{{ item.style === 'academic' ? '学术版' : '普通版' }}</text>
          </view>
        </view>
        
        <view class="history-action">
          <image src="/static/icons/right.png" class="icon-small" mode="aspectFit"></image>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view v-if="hasMore" class="load-more" @click="loadMoreHistory">
        <text>加载更多</text>
      </view>
      <view v-else class="no-more">
        <text>没有更多记录了</text>
      </view>
      
      <!-- 底部空白，确保内容可以完全滚动 -->
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import PageHeader from '@/components/PageHeader.vue';
import { getTranslationHistory } from '@/api/translate';

// 历史记录列表
const historyList = ref([]);
// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const hasMore = ref(true);
// 加载状态
const isLoading = ref(true);
// 错误状态
const hasError = ref(false);
// 错误信息
const errorMsg = ref('加载失败，请重试');
// 当前筛选的翻译风格
const currentStyle = ref('all');

// 获取语言对显示文本
const getLanguagePair = (source, target) => {
  const languages = {
    'zh': '中文',
    'en': '英文'
  };
  
  const sourceName = languages[source] || source;
  const targetName = languages[target] || target;
  
  return `${sourceName} → ${targetName}`;
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // 一小时内显示"刚刚"或"xx分钟前"
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return minutes <= 5 ? '刚刚' : `${minutes}分钟前`;
  }
  
  // 24小时内显示"xx小时前"
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }
  
  // 30天内显示"xx天前"
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}天前`;
  }
  
  // 其他情况显示具体日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 切换翻译风格
const changeStyle = (style) => {
  if (currentStyle.value === style) return;
  
  currentStyle.value = style;
  currentPage.value = 1;
  loadHistory();
};

// 加载历史记录
const loadHistory = () => {
  isLoading.value = true;
  hasError.value = false;
  currentPage.value = 1;
  
  getTranslationHistory(currentPage.value, pageSize.value, currentStyle.value)
    .then(res => {
      if (res.data && res.data.translations) {
        historyList.value = res.data.translations;
        hasMore.value = historyList.value.length < res.data.total;
      } else {
        historyList.value = [];
        hasMore.value = false;
      }
    })
    .catch(err => {
      console.error('获取翻译历史失败:', err);
      hasError.value = true;
      errorMsg.value = '获取历史记录失败，请重试';
    })
    .finally(() => {
      isLoading.value = false;
      // 停止下拉刷新
      uni.stopPullDownRefresh();
    });
};

// 加载更多历史记录
const loadMoreHistory = () => {
  if (!hasMore.value || isLoading.value) return;
  
  isLoading.value = true;
  currentPage.value += 1;
  
  getTranslationHistory(currentPage.value, pageSize.value, currentStyle.value)
    .then(res => {
      if (res.data && res.data.translations && res.data.translations.length > 0) {
        historyList.value = [...historyList.value, ...res.data.translations];
        hasMore.value = historyList.value.length < res.data.total;
      } else {
        hasMore.value = false;
      }
    })
    .catch(err => {
      console.error('加载更多历史记录失败:', err);
      currentPage.value -= 1; // 恢复页码
      uni.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// 查看翻译详情
const viewTranslationDetail = (id) => {
  uni.navigateTo({
    url: `/pages/translate-result/translate-result?id=${id}`
  });
};

// 跳转到翻译页面
const navigateToTranslate = () => {
  uni.navigateTo({
    url: '/pages/translate/translate'
  });
};

// 下拉刷新
onPullDownRefresh(() => {
  loadHistory();
});

// 页面加载时获取历史记录
onMounted(() => {
  loadHistory();
});

// 触底加载更多
onReachBottom(() => {
  if (hasMore.value) {
    loadMoreHistory();
  }
});
</script>

<style lang="scss" scoped>
.history-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.filter-bar {
  display: flex;
  padding: 10px 16px;
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
}

.filter-item {
  padding: 6px 12px;
  margin-right: 10px;
  border-radius: 16px;
  background-color: #f0f0f0;
  
  &.active {
    background-color: #6c5ce7;
    
    text {
      color: #fff;
    }
  }
  
  text {
    font-size: 14px;
    color: #666;
  }
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #5677fc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  .loading-text {
    font-size: 14px;
    color: #666;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  .error-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 16px 0 8px;
  }
  
  .error-subtitle {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
  }
  
  .retry-btn {
    background-color: #5677fc;
    color: #fff;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
  }
}

.empty-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 16px 0 8px;
  }
  
  .empty-subtitle {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
  }
  
  .translate-btn {
    background-color: #5677fc;
    color: #fff;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
  }
}

.history-content {
  flex: 1;
  padding: 16px;
}

.history-item {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.history-icon {
  margin-right: 12px;
  width: 40px;
  height: 40px;
  background-color: #ebf2ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-detail {
  flex: 1;
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  .history-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .history-time {
    font-size: 12px;
    color: #999;
  }
}

.history-preview {
  margin-bottom: 8px;
  
  .preview-text {
    font-size: 14px;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .long-text {
    -webkit-line-clamp: 1;
  }
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  
  .history-tag {
    font-size: 12px;
    color: #5677fc;
    background-color: #ebf2ff;
    padding: 4px 8px;
    border-radius: 4px;
    margin-right: 8px;
    margin-bottom: 4px;
  }
}

.history-action {
  display: flex;
  align-items: center;
}

.load-more, .no-more {
  text-align: center;
  padding: 16px 0;
  color: #999;
  font-size: 14px;
}

.bottom-space {
  height: 20px;
}
</style> 