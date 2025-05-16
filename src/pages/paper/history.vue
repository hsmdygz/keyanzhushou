<template>
  <view class="history-container">
    <page-header title="论文分析历史" />
    
    <!-- 加载中状态 -->
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
      <text class="empty-title">暂无分析记录</text>
      <text class="empty-subtitle">上传论文开始分析</text>
      <button class="upload-btn" @click="navigateToUpload">开始分析</button>
    </view>
    
    <!-- 历史列表 -->
    <scroll-view v-else scroll-y class="history-content">
      <view 
        v-for="item in historyList" 
        :key="item.id" 
        class="history-item"
        @click="viewAnalysisResult(item.paperId)"
      >
        <view class="history-icon">
          <image src="/static/icons/analysis.png" class="icon-medium" mode="aspectFit"></image>
        </view>
        
        <view class="history-detail">
          <view class="history-header">
            <text class="history-title">{{ item.fileName || '论文分析' }}</text>
            <text class="history-time">{{ formatDate(item.analysisTime) }}</text>
          </view>
          
          <view class="history-info">
            <view class="info-row">
              <text class="info-label">关键点</text>
              <text class="info-value">{{ item.keypointsCount || 0 }}个</text>
            </view>
            <view class="info-row">
              <text class="info-label">思路分析</text>
              <text class="info-value">{{ item.thinkingCount || 0 }}个</text>
            </view>
            <view class="info-row">
              <text class="info-label">研究方向</text>
              <text class="info-value">{{ item.directionsCount || 0 }}个</text>
            </view>
            <view class="info-row" v-if="item.hasModelImage">
              <text class="info-label">模型图</text>
              <text class="info-value model-status">有</text>
            </view>
          </view>
          
          <view class="history-tags" v-if="item.tags && item.tags.length">
            <text 
              v-for="(tag, tagIndex) in item.tags" 
              :key="tagIndex" 
              class="history-tag"
            >{{ tag }}</text>
          </view>
        </view>
        
        <view class="history-action">
          <image src="/static/icons/right.png" class="icon-small" mode="aspectFit"></image>
        </view>
      </view>
      
      <!-- 底部空白，确保内容可以完全滚动 -->
      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import PageHeader from '@/components/PageHeader.vue';
import { getPaperAnalysisHistory } from '@/api/paper';

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

// 处理页面加载
onLoad(() => {
  loadHistory();
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 加载历史记录
const loadHistory = (isRefresh = true) => {
  if (isRefresh) {
    currentPage.value = 1;
    hasMore.value = true;
  }
  
  if (!hasMore.value && !isRefresh) return;
  
  isLoading.value = true;
  hasError.value = false;
  
  getPaperAnalysisHistory(currentPage.value, pageSize.value, 'completed')
    .then(res => {
      const { papers, total } = res.data;
      
      const formattedList = (papers || []).map(paper => ({
        id: paper.id,
        paperId: paper.id, // 确保paperId字段存在
        fileName: paper.title || '未命名论文',
        fileSize: paper.fileSize || '未知大小',
        analysisTime: paper.uploadTime || '',
        keypointsCount: paper.keypointsCount || 0,
        thinkingCount: paper.thinkingCount || 0,
        directionsCount: paper.directionsCount || 0,
        hasModelImage: paper.hasModelImage || false,
        tags: paper.tags || []
      }));
      
      if (isRefresh) {
        historyList.value = formattedList;
      } else {
        historyList.value = [...historyList.value, ...formattedList];
      }
      
      // 判断是否还有更多数据
      hasMore.value = historyList.value.length < total;
      
      // 更新页码
      if (hasMore.value) {
        currentPage.value++;
      }
      
      isLoading.value = false;
      
      // 停止下拉刷新
      uni.stopPullDownRefresh();
    })
    .catch(err => {
      console.error('获取历史记录失败:', err);
      hasError.value = true;
      errorMsg.value = err.message || '加载失败，请重试';
      isLoading.value = false;
      
      // 停止下拉刷新
      uni.stopPullDownRefresh();
      
      // 如果是网络错误，提供更明确的提示
      if (err.isNetworkError) {
        errorMsg.value = '网络连接失败，请检查网络设置';
      }
    });
};

// 查看分析结果
const viewAnalysisResult = (paperId) => {
  if (!paperId) {
    uni.showToast({
      title: '无效的文件ID',
      icon: 'none'
    });
    return;
  }
  
  uni.navigateTo({
    url: `/pages/analysis/analysis?fileId=${paperId}`
  });
};

// 导航到上传页面
const navigateToUpload = () => {
  uni.navigateTo({
    url: '/pages/upload/upload'
  });
};

// 下拉刷新
onPullDownRefresh(() => {
  loadHistory(true);
});

// 上拉加载更多
onReachBottom(() => {
  if (hasMore.value && !isLoading.value) {
    loadHistory(false);
  }
});
</script>

<style lang="scss">
.history-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.loading-container, .error-container, .empty-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6c5ce7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text, .error-title, .empty-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
}

.error-subtitle, .empty-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
}

.retry-btn, .upload-btn {
  background-color: #6c5ce7;
  color: white;
  border-radius: 25px;
  font-size: 16px;
  margin-top: 15px;
  padding: 8px 25px;
}

.icon-large {
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
}

.icon-medium {
  width: 24px;
  height: 24px;
}

.icon-small {
  width: 16px;
  height: 16px;
}

.history-content {
  flex: 1;
  padding: 15px;
}

.history-item {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
}

.history-icon {
  background-color: #f0f4ff;
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.history-detail {
  flex: 1;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.history-time {
  font-size: 12px;
  color: #999;
}

.history-info {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-right: 15px;
  margin-bottom: 5px;
}

.info-label {
  font-size: 13px;
  color: #666;
  margin-right: 5px;
}

.info-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.model-status {
  color: #6c5ce7;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
}

.history-tag {
  font-size: 12px;
  color: #6c5ce7;
  background-color: #f0f4ff;
  padding: 2px 8px;
  border-radius: 12px;
  margin-right: 8px;
  margin-bottom: 5px;
}

.history-action {
  opacity: 0.5;
}

.bottom-space {
  height: 30px;
}
</style> 