<script>
import { isLoggedIn } from './utils/storage.js';

export default {
  onLaunch: function () {
    // 获取系统状态栏高度
    const sysInfo = uni.getSystemInfoSync();
    uni.setStorageSync('statusBarHeight', sysInfo.statusBarHeight);
    // 设置CSS变量
    document.documentElement.style.setProperty('--status-bar-height', sysInfo.statusBarHeight + 'px');
    console.log('App Launch')
    
    // 检查登录状态，未登录时重定向到登录页
    const currentPage = this.$mp?.page?.route || '';
    if (!currentPage.includes('/pages/login/login') && !currentPage.includes('/pages/register/register')) {
      if (!isLoggedIn()) {
        console.log('用户未登录，重定向到登录页');
        uni.reLaunch({
          url: '/pages/login/login'
        });
        return;
      }
    }
    
    // 添加页面导航拦截器
    uni.addInterceptor('navigateTo', {
      invoke(e) {
        console.log('导航到:', e.url);
        
        // 检查是否需要登录验证的页面
        if (!isProtectedRoute(e.url)) {
          return e;
        }
        
        // 检查登录状态
        if (!isLoggedIn()) {
          // 未登录时拦截并跳转到登录页
          uni.redirectTo({
            url: '/pages/login/login'
          });
          console.log('拦截未登录用户访问需要权限的页面:', e.url);
          return false;
        }
        
        // 已登录，允许导航
        return e;
      },
      success(e) {
        console.log('导航成功:', e.url);
      },
      fail(err) {
        console.error('导航失败:', err);
        // 导航失败时，尝试重定向到首页
        if(err.errMsg && !err.errMsg.includes('cancel')) {
          uni.reLaunch({
            url: '/pages/home/home'
          });
        }
      }
    });
    
    // 添加导航返回拦截器
    uni.addInterceptor('navigateBack', {
      invoke(e) {
        console.log('返回操作', e);
        const pages = getCurrentPages();
        
        // 如果没有上一页，则返回主页
        if (pages.length <= 1) {
          uni.reLaunch({
            url: '/pages/home/home'
          });
          return false;
        }
        
        return e;
      }
    });
    
    // 同样为其他导航方法添加拦截
    uni.addInterceptor('switchTab', {
      invoke(e) {
        if (!isProtectedRoute(e.url)) {
          return e;
        }
        
        if (!isLoggedIn()) {
          uni.redirectTo({
            url: '/pages/login/login'
          });
          console.log('拦截未登录用户访问需要权限的页面:', e.url);
          return false;
        }
        
        return e;
      }
    });
    
    uni.addInterceptor('reLaunch', {
      invoke(e) {
        if (!isProtectedRoute(e.url)) {
          return e;
        }
        
        if (!isLoggedIn()) {
          uni.redirectTo({
            url: '/pages/login/login'
          });
          console.log('拦截未登录用户访问需要权限的页面:', e.url);
          return false;
        }
        
        return e;
      }
    });
    
    uni.addInterceptor('redirectTo', {
      invoke(e) {
        if (!isProtectedRoute(e.url)) {
          return e;
        }
        
        if (!isLoggedIn()) {
          if (!e.url.includes('/pages/login/login')) {
            uni.redirectTo({
              url: '/pages/login/login'
            });
            console.log('拦截未登录用户访问需要权限的页面:', e.url);
            return false;
          }
        }
        
        return e;
      }
    });
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
  // 全局页面导航守卫
  onPageNotFound() {
    uni.redirectTo({
      url: '/pages/login/login'
    });
  },
}

// 检查是否是需要登录的受保护路由
function isProtectedRoute(url) {
  // 不需要登录的页面
  const publicPages = [
    '/pages/login/login', 
    '/pages/register/register'
  ];
  
  // 检查URL是否在公共页面列表中
  for (const page of publicPages) {
    if (url.includes(page)) {
      return false;
    }
  }
  
  // 不在公共页面列表中的都需要登录
  return true;
}
</script>

<style>
/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-sizing: border-box;
  background-color: #1e1e1e;
  height: 100%;
  font-size: 14px;
  color: #e0e0e0;
  line-height: 1.5;
  width: 100%;
  overflow-x: hidden;
}

/* 移除button的默认样式 */
button {
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
  text-align: left;
  font-size: inherit;
  color: inherit;
  font-weight: normal;
  line-height: inherit;
  border-radius: 0;
  box-shadow: none;
}

button::after {
  border: none;
}

/* 通用卡片样式 */
.card {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 通用动画效果 */
.animate-fade {
  animation: fadein 0.3s ease-in-out;
}

@keyframes fadein {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 提供一致的按钮激活状态 */
.btn-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.btn-active:active {
  opacity: 0.8;
  transform: scale(0.98);
}

/* 适配刘海屏 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

/* 解决某些移动设备上的闪烁问题 */
* {
  -webkit-tap-highlight-color: transparent;
  outline: none;
  box-sizing: border-box;
}

/* 桌面应用样式设置 */
.result-page, .writing-page, .login-page, .register-page, .home-page, 
page.full-width, [class*="-page"] .chat-layout {
  max-width: 100% !important;
  margin: 0 !important;
  box-shadow: none !important;
  background-color: #1e1e1e !important;
}

/* 修复页面全宽显示后内容容器可能出现的问题 */
.dashboard-container, .translation-container, .chat-messages-container {
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
}

body {
  background-color: #1e1e1e;
}

/* 自定义滚动条样式 */
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

/* 页面导航过渡效果 */
.uni-page-head, page {
  will-change: transform;
}

.uni-navigate-enter {
  animation-timing-function: ease-in-out;
}

.uni-navigate-enter-active {
  animation-duration: 0.2s;
}

.uni-navigate-enter-active .uni-page-head {
  animation-duration: 0.3s;
}

/* 交互元素反馈 */
button, .tap-area {
  position: relative;
  overflow: hidden;
}

button:after, .tap-area:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.03);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

button:active:after, .tap-area:active:after {
  opacity: 1;
}

/* 统一表单元素样式 */
input, textarea {
  -webkit-appearance: none;
  appearance: none;
  background-color: #fff;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid #e0e0e0;
}

input:focus, textarea:focus {
  border-color: #5677fc;
}

/* 添加长按缩放反馈 */
.scale-on-press:active {
  transform: scale(0.97);
  transition: transform 0.2s;
}

/* 全局样式 */
@font-face {
  font-family: uniicons;
  font-weight: normal;
  font-style: normal;
  src: url('/static/uniicons.ttf') format('truetype');
}
</style>
