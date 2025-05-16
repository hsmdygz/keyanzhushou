<template>
  <view class="account-container">
    <page-header title="账号设置" :textColor="'#e0e0e0'"></page-header>
    
    <view class="content">
      <view class="user-profile">
        <view class="avatar-wrapper">
          <view class="avatar">
            <icon-image type="person-filled" :size="60"></icon-image>
          </view>
          <view class="edit-avatar">
            <icon-image type="camera-filled" :size="22"></icon-image>
          </view>
        </view>
        <text class="username">学术用户</text>
        <text class="email">academic@example.com</text>
      </view>
      
      <view class="section-title">账户信息</view>
      
      <view class="menu-list">
        <view class="menu-item">
          <view class="menu-icon">
            <icon-image type="contact" :size="24"></icon-image>
          </view>
          <text class="menu-text">个人信息</text>
          <icon-image type="arrow-right" :size="18"></icon-image>
        </view>
        
        <view class="menu-item">
          <view class="menu-icon">
            <icon-image type="email" :size="24"></icon-image>
          </view>
          <text class="menu-text">绑定邮箱</text>
          <icon-image type="arrow-right" :size="18"></icon-image>
        </view>
        
        <view class="menu-item">
          <view class="menu-icon">
            <icon-image type="locked" :size="24"></icon-image>
          </view>
          <text class="menu-text">账户安全</text>
          <icon-image type="arrow-right" :size="18"></icon-image>
        </view>
      </view>
      
      <view class="section-title">偏好设置</view>
      
      <view class="menu-list">
        <view class="menu-item">
          <view class="menu-icon">
            <icon-image type="info" :size="24"></icon-image>
          </view>
          <text class="menu-text">通知与提醒</text>
          <switch color="#0e639c" checked />
        </view>
        
        <view class="menu-item">
          <view class="menu-icon">
            <icon-image type="cloud-upload" :size="24"></icon-image>
          </view>
          <text class="menu-text">自动同步</text>
          <switch color="#0e639c" checked />
        </view>

        <view class="menu-item">
          <view class="menu-icon">
            <icon-image type="paperplane" :size="24"></icon-image>
          </view>
          <text class="menu-text">语言偏好</text>
          <icon-image type="arrow-right" :size="18"></icon-image>
        </view>
      </view>
      
      <view class="section-title">支持与帮助</view>
      
      <view class="menu-list">
        <view class="menu-item">
          <view class="menu-icon">
            <icon-image type="help" :size="24"></icon-image>
          </view>
          <text class="menu-text">使用教程</text>
          <icon-image type="arrow-right" :size="18"></icon-image>
        </view>
        
        <view class="menu-item">
          <view class="menu-icon">
            <icon-image type="chat" :size="24"></icon-image>
          </view>
          <text class="menu-text">联系客服</text>
          <icon-image type="arrow-right" :size="18"></icon-image>
        </view>
        
        <view class="menu-item">
          <view class="menu-icon">
            <icon-image type="info" :size="24"></icon-image>
          </view>
          <text class="menu-text">关于我们</text>
          <icon-image type="arrow-right" :size="18"></icon-image>
        </view>
      </view>
      
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onShow } from '@dcloudio/uni-app';
import PageHeader from '@/components/PageHeader.vue';
import { clearUserData } from '@/utils/storage';
import IconImage from '@/components/IconImage.vue';

const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除用户数据
        clearUserData();
        
        // 显示退出提示
        uni.showToast({
          title: '已退出登录',
          icon: 'success',
          duration: 1500
        });
        
        // 返回登录页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/login',
            success: () => {
              console.log('退出登录跳转成功');
            },
            fail: (err) => {
              console.error('退出登录跳转失败:', err);
              // 尝试备用跳转方式
              uni.redirectTo({
                url: '/pages/login/login'
              });
            }
          });
        }, 1500);
      }
    }
  });
};

onLoad(() => {
  console.log('账号设置页面加载');
});

// 检查页面导航状态
onShow(() => {
  // 获取当前页面栈
  const pages = getCurrentPages();
  console.log('当前页面栈:', pages.length);
  
  // 如果页面栈异常（没有上一页），重定向到首页
  if (pages.length <= 1) {
    uni.reLaunch({
      url: '/pages/home/home'
    });
  }
});
</script>

<style>
.account-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow-y: auto;
}

.content {
  flex: 1;
  padding: 0 30px 40px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.user-profile {
  margin: 30px 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #2d2d30;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #3c3c3c;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.edit-avatar {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #0e639c;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #1e1e1e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-avatar:hover {
  background-color: #1177bb;
}

.username {
  font-size: 24px;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 8px;
}

.email {
  font-size: 16px;
  color: #8a8a8a;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 30px 0 15px 0;
}

.menu-list {
  background-color: #252526;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid #3c3c3c;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #3c3c3c;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #2d2d30;
}

.menu-icon {
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a8a8a;
}

.menu-text {
  flex: 1;
  font-size: 16px;
  color: #e0e0e0;
}

.logout-btn {
  margin-top: 50px;
  width: 100%;
  height: 52px;
  background-color: #252526;
  color: #ff4d4f;
  font-size: 18px;
  font-weight: 500;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #3c3c3c;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: rgba(255, 77, 79, 0.1);
}

.logout-btn:active {
  transform: translateY(1px);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: #1e1e1e;
}

::-webkit-scrollbar-thumb {
  background: #3c3c3c;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style> 