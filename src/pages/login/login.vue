<template>
  <view class="login-page">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="app-title">科研助手</text>
      <text class="app-subtitle">AI驱动的学术研究助手</text>
    </view>
    
    <view class="login-form">
      <view class="input-item">
        <text class="input-label">用户名/邮箱</text>
        <input 
          class="input-field" 
          type="text" 
          v-model="loginForm.username" 
          placeholder="请输入用户名或邮箱" 
        />
      </view>
      
      <view class="input-item">
        <text class="input-label">密码</text>
        <view class="password-input-wrapper">
          <input 
            class="input-field" 
            :type="passwordVisible ? 'text' : 'password'" 
            v-model="loginForm.password" 
            placeholder="请输入密码" 
          />
          <text class="eye-icon" @click="togglePasswordVisibility">
            {{ passwordVisible ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
      </view>
      
      <view class="error-message" v-if="errorMsg">{{ errorMsg }}</view>
      
      <button class="login-button" @click="handleLogin" :disabled="isLoading">
        <text v-if="!isLoading">登录</text>
        <view class="loading-spinner" v-else></view>
      </button>
      
      <view class="action-links">
        <text class="register-link" @click="goToRegister">注册新账号</text>
      </view>
    </view>
    
    <view class="login-footer">
      <text class="copyright">© 2023 论文助手 - 科研好帮手</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { login } from '@/api/user';
import { setToken, setUserInfo } from '@/utils/storage';

// 定义表单数据
const loginForm = ref({
  username: '',
  password: ''
});

// 密码可见性
const passwordVisible = ref(false);

// 加载状态
const isLoading = ref(false);
// 错误信息
const errorMsg = ref('');

// 切换密码可见性
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

// 计算表单是否禁用提交
const isFormDisabled = computed(() => {
  return !loginForm.value.username || !loginForm.value.password || isLoading.value;
});

// 登录处理函数
const handleLogin = () => {
  if (isFormDisabled.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    });
    return;
  }

  // 重置错误消息
  errorMsg.value = '';
  
  // 设置加载状态
  isLoading.value = true;

  // 调用登录API
  login(loginForm.value.username, loginForm.value.password)
    .then(res => {
      // API响应格式: { code: 200, message: "登录成功", data: { token, userId, username } }
      const { token, userId, username } = res.data;
      
      // 保存用户信息和token
      setToken(token);
      setUserInfo({ userId, username });
      
      // 显示登录成功
      uni.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });
      
      // 跳转到主页
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/home/home',
          fail: (err) => {
            console.error('跳转失败:', err);
            uni.redirectTo({
              url: '/pages/home/home'
            });
          }
        });
      }, 1500);
    })
    .catch(err => {
      // 显示错误信息
      errorMsg.value = err.message || '登录失败，请重试';
      uni.showToast({
        title: errorMsg.value,
        icon: 'none'
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// 跳转到注册页面
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register',
    fail: (err) => {
      console.error('navigateTo失败:', err);
      uni.redirectTo({
        url: '/pages/register/register'
      });
    }
  });
};

onLoad(() => {
  console.log('登录页面加载完成');
});

// 添加onShow生命周期，确保从其他页面返回时状态正确
onShow(() => {
  console.log('登录页面显示');
  // 重置表单状态
  errorMsg.value = '';
  isLoading.value = false;
});
</script>

<style>
@import '@/static/css/common.scss';

.login-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-dark, #1e1e1e);
  padding: 0;
  width: 100%;
  color: var(--text-primary, #e0e0e0);
  overflow-y: auto; /* 允许垂直滚动 */
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0 40px 0;
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.app-title {
  font-size: var(--font-size-xxlarge, 24px);
  font-weight: 600;
  color: var(--text-primary, #e0e0e0);
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.app-subtitle {
  font-size: var(--font-size-medium, 16px);
  color: var(--text-secondary, #8a8a8a);
}

.login-form {
  background-color: var(--bg-card, #252526);
  border-radius: var(--border-radius-lg, 12px);
  padding: 40px;
  width: 420px;
  margin: 0 auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color, #3c3c3c);
}

.input-item {
  margin-bottom: 28px;
}

.input-label {
  display: block;
  font-size: var(--font-size-medium, 16px);
  color: var(--text-secondary, #8a8a8a);
  margin-bottom: 10px;
  font-weight: 500;
}

.input-field {
  width: 100%;
  height: var(--input-height, 52px);
  background-color: #2d2d30;
  border: 1px solid var(--border-color, #3c3c3c);
  border-radius: var(--border-radius-md, 8px);
  padding: 0 16px;
  font-size: var(--font-size-medium, 16px);
  color: var(--text-primary, #e0e0e0);
  transition: all 0.3s;
  outline: none;
}

.input-field:focus {
  border-color: var(--primary-color, #0e639c);
  box-shadow: 0 0 0 2px rgba(14, 99, 156, 0.2);
}

.password-input-wrapper {
  position: relative;
}

.eye-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-large, 18px);
  color: var(--text-secondary, #8a8a8a);
  cursor: pointer;
  user-select: none;
}

.error-message {
  color: #ff4d4f;
  font-size: var(--font-size-base, 14px);
  margin: 8px 0 16px 0;
}

.login-button {
  width: 100%;
  height: var(--input-height, 52px);
  background-color: var(--primary-color, #0e639c);
  color: white;
  border-radius: var(--border-radius-md, 8px);
  font-size: var(--font-size-medium, 16px);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
  transition: background-color 0.2s, transform 0.1s;
  border: none;
}

.login-button:hover {
  background-color: #1177bb;
}

.login-button:active {
  transform: translateY(1px);
}

.login-button:disabled {
  background-color: #3c3c3c;
  color: var(--text-secondary, #8a8a8a);
  box-shadow: none;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.action-links {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.register-link {
  color: #5677fc;
  font-size: var(--font-size-medium, 16px);
  padding: 6px 12px;
  cursor: pointer;
  transition: color 0.2s;
  user-select: none;
}

.register-link:hover {
  color: #3d5ce3;
  text-decoration: underline;
}

.login-footer {
  margin-top: auto;
  padding: 24px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.copyright {
  font-size: var(--font-size-base, 14px);
  color: var(--text-secondary, #8a8a8a);
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