<template>
  <view class="content">
    <page-header title="论文写作助手" :showBack="false" />
    
    <view class="main-content">
      <image class="logo" src="/static/logo.png"></image>
      <view class="text-area">
        <text class="title">欢迎使用</text>
      </view>
      
      <button class="start-btn" @click="goToHome">开始使用</button>

      <view class="menu-item" @click="navigateToAccount">
        <image src="/static/icons/person.png" class="icon-medium" mode="aspectFit"></image>
        <text class="menu-text">账号设置</text>
      </view>

      <view class="menu-item" @click="navigateToActivity">
        <image src="/static/icons/history.png" class="icon-medium" mode="aspectFit"></image>
        <text class="menu-text">最近活动</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import PageHeader from '@/components/PageHeader.vue';

// 添加通用导航方法
const navigateTo = (url) => {
  uni.navigateTo({ url });
};

// 前往主页
const goToHome = () => {
  // 直接使用reLaunch而不是redirectTo，确保清空导航栈
  uni.reLaunch({
    url: '/pages/home/home'
  });
};

// 添加账号设置和活动导航方法
const navigateToAccount = () => {
  uni.navigateTo({
    url: '/pages/account/account'
  });
};

const navigateToActivity = () => {
  uni.navigateTo({
    url: '/pages/activity/activity'
  });
};

// 在移动端检查界面并优化
onLoad(() => {
  console.log('索引页面加载，设备信息：', uni.getSystemInfoSync());
  
  // 监测是否在移动设备上
  const systemInfo = uni.getSystemInfoSync();
  if (systemInfo.platform === 'android' || systemInfo.platform === 'ios') {
    console.log('当前在移动设备上运行');
  }
});
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px 40px;
}

.logo {
  height: 220rpx;
  width: 220rpx;
  margin-bottom: 60rpx;
  margin-top: -60rpx;
}

.text-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.title {
  font-size: 46rpx;
  font-weight: bold;
  color: #333;
}

.start-btn {
  width: 80%;
  height: 90rpx;
  background-color: #5677fc;
  color: #fff;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-top: 20rpx;
  box-shadow: 0 10rpx 20rpx rgba(86, 119, 252, 0.3);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.icon-medium {
  width: 24px;
  height: 24px;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 32rpx;
  color: #333;
}

/* 适配不同屏幕尺寸 */
@media screen and (max-width: 320px) {
  .title {
    font-size: 32rpx;
  }
  
  .start-btn {
    font-size: 30rpx;
    height: 80rpx;
  }
}

/* 确保安全区域 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .content {
    padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  }
}
</style>
