<template>
  <view class="activity-container">
    <page-header title="最近活动" />
    
    <view class="content">
      <view class="filter-bar">
        <view class="filter-item" 
          v-for="(filter, index) in filterOptions" 
          :key="index"
          :class="{ 'active': activeFilter === filter.value }"
          @click="activeFilter = filter.value"
        >
          <text class="filter-text">{{ filter.label }}</text>
        </view>
      </view>
      
      <view class="activities-list">
        <block v-if="filteredActivities.length > 0">
          <view v-for="(group, date) in groupedActivities" :key="date" class="activity-group">
            <view class="date-header">
              <text class="date-text">{{ formatDateHeader(date) }}</text>
            </view>
            
            <view 
              v-for="(activity, index) in group" 
              :key="index"
              class="activity-item"
              @click="navigateToActivity(activity)"
            >
              <view class="activity-icon" :class="[`icon-${activity.type}`]">
                <text class="icon-text">{{ getActivityIcon(activity.type) }}</text>
              </view>
              
              <view class="activity-content">
                <view class="activity-header">
                  <text class="activity-title">{{ activity.title }}</text>
                  <text class="activity-time">{{ formatTime(activity.time) }}</text>
                </view>
                
                <text class="activity-desc">{{ activity.description }}</text>
                
                <view class="activity-tags" v-if="activity.tags && activity.tags.length">
                  <text 
                    v-for="(tag, tagIndex) in activity.tags" 
                    :key="tagIndex" 
                    class="activity-tag"
                  >{{ tag }}</text>
                </view>
              </view>
            </view>
          </view>
        </block>
        
        <view v-else class="empty-state">
          <text class="empty-text">暂无活动记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import PageHeader from '@/components/PageHeader.vue';

// 筛选选项
const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '翻译', value: 'translate' },
  { label: '论文', value: 'writing' },
  { label: '模型', value: 'model' }
];

// 当前筛选
const activeFilter = ref('all');

// 示例活动数据（实际应从后端获取）
const activities = ref([
  {
    id: 1,
    type: 'translate',
    title: '完成英译中翻译',
    description: '"Climate change impacts on agriculture and food security..."',
    time: new Date(2023, 11, 8, 15, 30),
    tags: ['英译中', '学术版'],
    route: '/pages/translate/translate'
  },
  {
    id: 2,
    type: 'writing',
    title: '编辑论文',
    description: '智能农业技术在气候变化背景下的应用',
    time: new Date(2023, 11, 8, 10, 15),
    tags: ['农业科技', '草稿'],
    route: '/pages/writing/writing'
  },
  {
    id: 3,
    type: 'model',
    title: '查看模型',
    description: '农业气候适应性预测模型',
    time: new Date(2023, 11, 7, 16, 45),
    tags: ['预测模型', '已收藏'],
    route: '/pages/model/model'
  },
  {
    id: 4,
    type: 'translate',
    title: '完成中译英翻译',
    description: '"智能农业结合了传感器和AI技术，可以让农业更精准高效..."',
    time: new Date(2023, 11, 7, 9, 20),
    tags: ['中译英', '专业版'],
    route: '/pages/translate/translate'
  },
  {
    id: 5,
    type: 'writing',
    title: '创建新论文',
    description: '气候变化对农业生产的影响及应对策略',
    time: new Date(2023, 11, 6, 14, 0),
    tags: ['气候变化', '农业'],
    route: '/pages/writing/writing'
  },
  {
    id: 6,
    type: 'model',
    title: '生成模型',
    description: '农业产量预测模型',
    time: new Date(2023, 11, 5, 11, 30),
    tags: ['产量预测', '自定义'],
    route: '/pages/model/model'
  },
]);

// 根据筛选获取活动
const filteredActivities = computed(() => {
  if (activeFilter.value === 'all') {
    return activities.value;
  }
  
  return activities.value.filter(activity => activity.type === activeFilter.value);
});

// 按日期分组活动
const groupedActivities = computed(() => {
  const groups = {};
  
  filteredActivities.value.forEach(activity => {
    const date = new Date(activity.time).toDateString();
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(activity);
  });
  
  return groups;
});

// 获取活动对应的图标
const getActivityIcon = (type) => {
  switch (type) {
    case 'translate':
      return '译';
    case 'writing':
      return '文';
    case 'model':
      return '模';
    default:
      return '活';
  }
};

// 格式化日期头部
const formatDateHeader = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  if (date.toDateString() === now.toDateString()) {
    return '今天';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

// 格式化时间
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 跳转到活动对应的页面
const navigateToActivity = (activity) => {
  if (activity.route === '/pages/qa/qa') {
    uni.redirectTo({
      url: activity.route
    });
  } else {
    uni.navigateTo({
      url: activity.route
    });
  }
};
</script>

<style lang="scss">
.activity-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.filter-bar {
  display: flex;
  padding: 15px 20px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.filter-item {
  padding: 8px 16px;
  margin-right: 10px;
  border-radius: 20px;
  background-color: #f0f4ff;
  
  &.active {
    background-color: #5677fc;
    
    .filter-text {
      color: #fff;
    }
  }
}

.filter-text {
  font-size: 14px;
  color: #5677fc;
}

.activities-list {
  flex: 1;
  padding: 15px 20px;
}

.activity-group {
  margin-bottom: 25px;
}

.date-header {
  margin-bottom: 10px;
}

.date-text {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.activity-item {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.icon-translate {
  background-color: #e3f2fd;
  .icon-text {
    color: #2196f3;
  }
}

.icon-writing {
  background-color: #e8f5e9;
  .icon-text {
    color: #4caf50;
  }
}

.icon-model {
  background-color: #fff3e0;
  .icon-text {
    color: #ff9800;
  }
}

.icon-text {
  font-size: 16px;
  font-weight: bold;
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.activity-time {
  font-size: 14px;
  color: #999;
}

.activity-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.activity-tag {
  font-size: 12px;
  padding: 2px 8px;
  background-color: #f5f7fa;
  color: #666;
  border-radius: 10px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.empty-text {
  font-size: 16px;
  color: #999;
  margin-top: 15px;
}
</style> 