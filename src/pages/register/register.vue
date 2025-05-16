<template>
  <view class="register-page">
    <view class="register-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="app-title">科研助手</text>
      <text class="app-subtitle">创建您的账号</text>
    </view>
    
    <view class="register-form">
      <view class="form-item">
        <text class="form-label">用户名</text>
        <view class="input-container">
          <view class="input-icon">
            <icon-image type="person" :size="20"></icon-image>
          </view>
          <input class="form-input" type="text" v-model="registerForm.username" placeholder="设置您的用户名 (3-20个字符)" />
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">邮箱</text>
        <view class="input-container">
          <view class="input-icon">
            <icon-image type="email" :size="20"></icon-image>
          </view>
          <input class="form-input" type="text" v-model="registerForm.email" placeholder="您的邮箱将用于账号验证" />
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">密码</text>
        <view class="input-container">
          <view class="input-icon">
            <icon-image type="locked" :size="20"></icon-image>
          </view>
          <input class="form-input" type="password" v-model="registerForm.password" placeholder="设置安全密码 (至少6位)" />
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">确认密码</text>
        <view class="input-container">
          <view class="input-icon">
            <icon-image type="locked" :size="20"></icon-image>
          </view>
          <input class="form-input" type="password" v-model="registerForm.confirmPassword" placeholder="再次输入密码以确认" />
        </view>
      </view>

      <text class="error-message" v-if="errorMsg">{{ errorMsg }}</text>
      
      <button class="register-btn" @click="handleRegister" :disabled="isLoading">
        <icon-image v-if="!isLoading" type="auth" :size="18"></icon-image>
        <text v-if="!isLoading">注册账号</text>
        <view class="loading-spinner" v-else></view>
      </button>
      
      <view class="login-link">
        <text>已有账号？</text>
        <button 
          class="link-text" 
          @click="goToLogin"
        >
          <icon-image type="back" :size="14"></icon-image>
          返回登录
        </button>
      </view>
    </view>
    
    <view class="register-footer">
      <text class="copyright">© 2023 论文助手 - 科研好帮手</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { register } from '@/api/user';
import { setToken, setUserInfo } from '@/utils/storage';
import IconImage from '@/components/IconImage.vue';

// 定义注册表单数据
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

// 加载状态
const isLoading = ref(false);
// 错误信息
const errorMsg = ref('');

// 邮箱验证
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 注册处理函数
const handleRegister = () => {
  // 表单验证
  if (!registerForm.value.username || !registerForm.value.email || 
      !registerForm.value.password || !registerForm.value.confirmPassword) {
    errorMsg.value = '请填写完整信息';
    uni.showToast({
      title: errorMsg.value,
      icon: 'none'
    });
    return;
  }

  if (!validateEmail(registerForm.value.email)) {
    errorMsg.value = '请输入有效的邮箱地址';
    uni.showToast({
      title: errorMsg.value,
      icon: 'none'
    });
    return;
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errorMsg.value = '两次密码输入不一致';
    uni.showToast({
      title: errorMsg.value,
      icon: 'none'
    });
    return;
  }

  if (registerForm.value.password.length < 6) {
    errorMsg.value = '密码长度不能少于6位';
    uni.showToast({
      title: errorMsg.value,
      icon: 'none'
    });
    return;
  }

  // 重置错误消息
  errorMsg.value = '';
  // 设置加载状态
  isLoading.value = true;

  // 调用注册API
  register(registerForm.value.username, registerForm.value.email, registerForm.value.password)
    .then(res => {
      // API响应格式: { code: 200, message: "注册成功", data: { userId, username } }
      const { userId, username } = res.data;
      
      // 保存用户信息和token
      setToken(res.data.token);
      setUserInfo(res.data);
      
      // 显示注册成功
      uni.showToast({
        title: '注册成功',
        icon: 'success',
        duration: 1500
      });
      
      // 跳转到登录页面
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    })
    .catch(err => {
      // 显示错误信息
      errorMsg.value = err.message || '注册失败，请重试';
      uni.showToast({
        title: errorMsg.value,
        icon: 'none'
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// 添加更可靠的返回登录方法
const goToLogin = () => {
  console.log('返回登录页面');
  
  try {
    // 尝试多种方法确保导航成功
    uni.navigateBack({
      delta: 1,
      fail: () => {
        // 回退失败则尝试重定向
        uni.redirectTo({
          url: '/pages/login/login',
          fail: (err) => {
            console.error('返回登录页面失败:', err);
            uni.showToast({
              title: '导航失败，请重试',
              icon: 'none'
            });
          }
        });
      }
    });
  } catch (e) {
    console.error('返回登录页面异常:', e);
  }
};

onLoad(() => {
  console.log('注册页面加载完成');
});
</script>

<style>
.register-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e1e1e;
  padding: 0;
  width: 100%;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow-y: auto; /* 允许垂直滚动 */
}

.register-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0 30px 0;
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.app-title {
  font-size: 32px;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.app-subtitle {
  font-size: 18px;
  color: #8a8a8a;
}

.register-form {
  width: 480px;
  padding: 40px;
  margin: 0 auto;
  background-color: #252526;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: 1px solid #3c3c3c;
}

.form-item {
  margin-bottom: 24px;
}

.form-label {
  font-size: 16px;
  margin-bottom: 10px;
  display: block;
  color: #8a8a8a;
  font-weight: 500;
}

.input-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 52px;
  border: 1px solid #3c3c3c;
  border-radius: 8px;
  padding: 0 16px;
  background-color: #2d2d30;
  transition: all 0.3s;
}

.input-container:focus-within {
  border-color: #0e639c;
  box-shadow: 0 0 0 2px rgba(14, 99, 156, 0.2);
}

.input-icon {
  margin-right: 16px;
  opacity: 0.8;
}

.form-input {
  flex: 1;
  height: 100%;
  font-size: 16px;
  background-color: transparent;
  border: none;
  color: #e0e0e0;
  outline: none;
}

.form-input:focus {
  background-color: transparent;
}

.error-message {
  color: #ff4d4f;
  font-size: 15px;
  margin-bottom: 20px;
  display: block;
  text-align: center;
}

.register-btn {
  width: 100%;
  height: 52px;
  background-color: #0e639c;
  color: white;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: background-color 0.2s, transform 0.1s;
  border: none;
  cursor: pointer;
}

.register-btn:hover {
  background-color: #1177bb;
}

.register-btn:active {
  transform: translateY(1px);
}

.register-btn:disabled {
  background-color: #3c3c3c;
  color: #8a8a8a;
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

.login-link {
  margin-top: 24px;
  text-align: center;
  font-size: 16px;
  color: #8a8a8a;
  display: flex;
  justify-content: center;
  align-items: center;
}

.link-text {
  color: #5677fc;
  margin-left: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s;
  background-color: transparent;
  height: auto;
  line-height: 1.5;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  cursor: pointer;
}

.link-text:hover {
  color: #3d5ce3;
  text-decoration: underline;
}

.register-footer {
  margin-top: auto;
  padding: 24px 0;
  text-align: center;
}

.copyright {
  font-size: 14px;
  color: #8a8a8a;
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