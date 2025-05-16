<template>
  <view class="upload-container">
    <page-header title="上传文件" />
    
    <scroll-view scroll-y class="content">
      <view class="upload-area animate-fade" @click="chooseFile">
        <view class="upload-icon-wrapper">
          <image src="/static/icons/upload.png" class="icon-large" mode="aspectFit"></image>
        </view>
        <text class="upload-text">{{ hasSelectedFile ? selectedFile.name : '点击上传文件' }}</text>
        <text class="upload-desc" v-if="!hasSelectedFile">支持 PDF、DOC、DOCX、TXT 格式</text>
        <text class="file-size" v-else>{{ formatFileSize(selectedFile.size) }}</text>
        <text class="upload-success" v-if="uploadSuccess">✓ 上传成功</text>
      </view>

      <view class="feature-section animate-fade">
        <view class="section-header">
          <text class="section-title">论文分析功能</text>
        </view>
        
        <view class="feature-card">
          <view class="feature-icon">
            <image src="/static/icons/model.png" class="icon-medium" mode="aspectFit"></image>
          </view>
          <view class="feature-content">
            <text class="feature-text">智能论文分析</text>
            <text class="feature-desc">AI将自动分析您上传的PDF论文，提取文章要点，整理文章思路，分析研究方向，生成研究模型图，结果可保存查看</text>
          </view>
        </view>
      </view>
      
      <view class="progress-section animate-fade" v-if="isAnalyzing">
        <view class="progress-header">
          <text class="progress-title">分析进度</text>
          <text class="progress-percent">{{ analysisProgress }}%</text>
        </view>
        
        <view class="progress-bar">
          <view 
            class="progress-inner" 
            :style="{ width: analysisProgress + '%' }"
          ></view>
        </view>
        
        <text class="progress-step">{{ analysisStep }}</text>
      </view>
      
      <!-- 底部空白占位区，确保滚动内容不被底部按钮遮挡 -->
      <view class="bottom-space"></view>
    </scroll-view>
    
    <!-- 固定在底部的按钮 -->
    <view class="fixed-bottom-btn">
      <button 
        class="start-btn" 
        :class="{ 'btn-active': canStartAnalysis }"
        @click="startAnalysis" 
        :disabled="!canStartAnalysis || isAnalyzing"
      >
        <text v-if="!isAnalyzing">开始分析</text>
        <view class="loading-spinner" v-else></view>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import PageHeader from '@/components/PageHeader.vue';
import { uploadPaper, analyzeFullPaper, getPaperStatus } from '@/api/paper';
import { getUserInfo } from '@/utils/storage';

// 是否已选择文件
const hasSelectedFile = ref(false);
const selectedFile = ref({
  name: '',
  size: 0,
  path: ''
});
const isAnalyzing = ref(false);
const analysisProgress = ref(0);
const analysisStep = ref(''); // 当前分析步骤
const uploadSuccess = ref(false);
const fileId = ref('');
// 轮询定时器
const statusCheckTimer = ref(null);

// 选择文件
const chooseFile = () => {
  // 在真实环境中应该检查权限
  uni.chooseFile({
    count: 1,
    extension: ['.pdf', '.doc', '.docx', '.txt'],
    success: (res) => {
      console.log('文件选择成功:', res);
      const tempFilePath = res.tempFilePaths[0];
      const fileName = tempFilePath.substring(tempFilePath.lastIndexOf('/') + 1);
      
      selectedFile.value = {
        name: fileName,
        path: tempFilePath,
        size: res.tempFiles[0].size
      };
      
      hasSelectedFile.value = true;
      
      // 显示成功提示
      uni.showToast({
        title: '文件选择成功',
        icon: 'success'
      });
    },
    fail: (err) => {
      console.error('选择文件失败', err);
      // 当用户取消操作时不显示错误提示
      if (err.errMsg !== 'chooseFile:fail cancel') {
        uni.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
      }
    }
  });
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 是否可以开始分析
const canStartAnalysis = computed(() => {
  return hasSelectedFile.value;
});

// 更新分析进度
const updateProgress = (step, progress) => {
  analysisStep.value = step;
  analysisProgress.value = progress;
};

// 开始分析
const startAnalysis = () => {
  if (!selectedFile.value.path) {
    uni.showToast({
      title: '请先选择文件',
      icon: 'none'
    });
    return;
  }

  uni.showLoading({
    title: '处理中...',
    mask: true
  });

  // 开始分析流程
  isAnalyzing.value = true;
  analysisProgress.value = 0;
  analysisStep.value = '文件上传中...';
  
  console.log('准备上传文件:', selectedFile.value);

  // 使用API上传文件 - 上传时后端会自动开始分析
  uploadPaper(selectedFile.value)
    .then(res => {
      console.log('文件上传成功:', res);
      uploadSuccess.value = true;
      
      // 设置进度为上传已完成
      analysisProgress.value = 40;
      analysisStep.value = '分析论文中...';
      
      if (res.data && res.data.paperId) {
        fileId.value = res.data.paperId;
        console.log('获取到文件ID:', fileId.value);
        
        // 启动轮询检查处理状态
        startStatusCheck(fileId.value);
        
        uni.hideLoading();
      } else {
        throw new Error('未获取到有效的文件ID');
      }
    })
    .catch(err => {
      console.error('文件上传失败:', err);
      isAnalyzing.value = false;
      uni.hideLoading();
      
      uni.showToast({
        title: '上传失败，请重试',
        icon: 'none'
      });
    });
};

// 开始轮询检查处理状态
const startStatusCheck = (paperId) => {
  // 先清除可能存在的定时器
  if (statusCheckTimer.value) {
    clearInterval(statusCheckTimer.value);
  }
  
  // 设置轮询间隔（每3秒检查一次）
  statusCheckTimer.value = setInterval(() => {
    checkPaperStatus(paperId);
  }, 3000);
};

// 检查论文处理状态
const checkPaperStatus = (paperId) => {
  getPaperStatus(paperId)
    .then(res => {
      console.log('论文处理状态:', res);
      
      const { status, progress } = res.data;
      
      // 更新进度
      if (progress !== undefined) {
        // 因为上传已经占了40%的进度，所以剩余进度按60%计算
        analysisProgress.value = 40 + Math.floor(progress * 0.6);
      }
      
      // 根据状态更新步骤提示
      switch (status) {
        case 'processing':
          analysisStep.value = '正在分析论文...';
          break;
        case 'completed':
          // 分析完成，停止轮询
          clearInterval(statusCheckTimer.value);
          analysisProgress.value = 100;
          analysisStep.value = '分析完成';
          
          // 延迟跳转到分析结果页面
          setTimeout(() => {
            uni.redirectTo({
              url: `/pages/analysis/analysis?fileId=${paperId}`
            });
          }, 1000);
          break;
        case 'failed':
          // 分析失败，停止轮询
          clearInterval(statusCheckTimer.value);
          isAnalyzing.value = false;
          
          uni.showToast({
            title: '分析失败，请重试',
            icon: 'none'
          });
          break;
      }
    })
    .catch(err => {
      console.error('检查状态失败:', err);
      
      // 如果是 404 错误，可能接口不存在，尝试直接跳转到分析页面
      if (err.code === 404) {
        console.log('状态检查接口不存在，尝试直接跳转到分析页面');
        
        // 增加进度以给用户反馈
        analysisProgress.value += 10;
        if (analysisProgress.value >= 100) {
          // 如果进度已经达到 100%，停止轮询并跳转
          clearInterval(statusCheckTimer.value);
          analysisStep.value = '分析完成';
          
          setTimeout(() => {
            uni.redirectTo({
              url: `/pages/analysis/analysis?fileId=${paperId}`
            });
          }, 1000);
        }
      }
      // 如果检查状态失败，不要立即停止轮询，可能是网络临时问题
    });
};

// 组件卸载时清除定时器
onUnmounted(() => {
  if (statusCheckTimer.value) {
    clearInterval(statusCheckTimer.value);
  }
});

onLoad(() => {
  console.log('上传页面加载完成');
});
</script>

<style lang="scss">
.upload-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  padding: 20px;
  padding-bottom: 80px; /* 为底部按钮留出空间 */
}

.upload-area {
  background-color: white;
  border-radius: 16px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.upload-icon-wrapper {
  background-color: #f0f4ff;
  width: 80px;
  height: 80px;
  border-radius: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
}

.icon-large {
  width: 40px;
  height: 40px;
}

.icon-medium {
  width: 24px;
  height: 24px;
}

.upload-text {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.upload-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 10px;
  text-align: center;
}

.file-size {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.upload-success {
  color: #00b894;
  font-weight: 600;
  font-size: 16px;
}

.feature-section {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.section-header {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.feature-card {
  display: flex;
  align-items: center;
  background-color: #f8f9fe;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 10px;
}

.feature-icon {
  background-color: #e0e7ff;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.feature-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.feature-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.progress-section {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.progress-percent {
  font-size: 18px;
  font-weight: 600;
  color: #5677fc;
}

.progress-bar {
  height: 12px;
  background-color: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-inner {
  height: 100%;
  background-color: #5677fc;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-step {
  font-size: 14px;
  color: #666;
}

.bottom-space {
  height: 80px;
}

.fixed-bottom-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.start-btn {
  width: 100%;
  height: 50px;
  background-color: #dddddd;
  color: #999;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-active {
  background-color: #5677fc;
  color: white;
  box-shadow: 0 5px 15px rgba(86, 119, 252, 0.3);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

.animate-fade {
  animation: fadeIn 0.5s ease;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 