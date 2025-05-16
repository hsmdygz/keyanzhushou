<template>
  <view class="page-header-wrapper" :style="bgStyle">
    <view class="page-header" :class="{ 'with-shadow': withShadow }">
      <view class="left-area" v-if="showBack" @click="handleBack">
        <icon-image type="back" :size="22" :color="iconColor"></icon-image>
      </view>
      <text class="title" :style="{ color: textColor }">{{ title }}</text>
      <view class="right-action">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import IconImage from '@/components/IconImage.vue';
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '页面标题'
  },
  showBack: {
    type: Boolean,
    default: true
  },
  withShadow: {
    type: Boolean,
    default: false
  },
  textColor: {
    type: String,
    default: '#fff'
  },
  useDefaultBg: {
    type: Boolean,
    default: true
  },
  bgColor: {
    type: String,
    default: ''
  }
});

const bgStyle = computed(() => {
  if (!props.useDefaultBg && props.bgColor) {
    return { background: props.bgColor };
  }
  return {};
});

const iconColor = computed(() => {
  return props.textColor === '#fff' ? '#fff' : props.textColor;
});

const handleBack = () => {
  // 获取当前页面路径
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const currentRoute = currentPage.route;
  
  // 如果是从主页进入的特定页面，返回到主页而不是index
  if (pages.length > 1) {
    // 正常返回上一页
    uni.navigateBack({
      delta: 1
    });
  } else {
    // 如果没有上一页或导航栈异常，则重定向到首页
    uni.reLaunch({
      url: '/pages/home/home'
    });
  }
};
</script>

<style lang="scss" scoped>
.page-header-wrapper {
  width: 100%;
  padding-top: var(--status-bar-height, 25px);
  background: linear-gradient(135deg, #252526, #1e1e1e);
  position: relative;
  z-index: 10;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  position: relative;
  
  &.with-shadow {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, rgba(60,60,60,0), rgba(60,60,60,0.5), rgba(60,60,60,0));
    transform: scaleY(0.5);
  }
}

.left-area {
  display: flex;
  align-items: center;
  height: 40px;
  width: 40px;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(60, 60, 60, 0.3);
  position: relative;
  z-index: 1;
  
  &:active {
    background-color: rgba(60, 60, 60, 0.5);
    transform: scale(0.95);
  }
}

.title {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.right-action {
  position: relative;
  z-index: 1;
}

/* 添加页面过渡动画 */
@keyframes headerFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  animation: headerFadeIn 0.3s ease-out;
}
</style> 