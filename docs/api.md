# 科研助手API接口文档

## 基础信息

- **本地开发基础URL**: `http://localhost:3001/api`
- **生产环境基础URL**: `https://clifikqzwwps.sealoshzh.site/api` (生产环境实际使用地址)
- **认证方式**: 所有需要认证的接口在请求头中添加 `Authorization: Bearer 您的令牌`
- **响应格式**: 所有接口返回JSON格式，包含 `code`、`data`、`message` 字段

## 目录
- [用户模块](#用户模块)
- [论文分析模块](#论文分析模块)
- [科研问答助手模块](#科研问答助手模块)
- [翻译模块](#翻译模块)
- [AI请求历史模块](#ai请求历史模块)
- [活动模块](#活动模块)
- [系统模块](#系统模块)

## 用户模块

### 用户登录
- **接口**：`POST /user/login`
- **参数**：
  ```json
  {
    "username": "用户名或邮箱",
    "password": "密码"
  }
  ```
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "token": "认证令牌",
      "userId": "用户ID",
      "username": "用户名"
    },
    "message": "登录成功"
  }
  ```

### 用户注册
- **接口**：`POST /user/register`
- **参数**：
  ```json
  {
    "username": "用户名",
    "email": "邮箱",
    "password": "密码"
  }
  ```
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "userId": "用户ID",
      "username": "用户名",
      "email": "邮箱"
    },
    "message": "注册成功"
  }
  ```

### 获取用户信息
- **接口**：`GET /user/info`
- **请求头**：需要认证令牌
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "userId": "用户ID",
      "username": "用户名",
      "email": "邮箱",
      "avatar": "头像URL",
      "createdAt": "创建时间"
    },
    "message": "获取成功"
  }
  ```

### 更新用户信息
- **接口**：`PUT /user/update`
- **请求头**：需要认证令牌
- **参数**：
  ```json
  {
    "username": "用户名（可选）",
    "email": "邮箱（可选）",
    "avatar": "头像URL（可选）"
  }
  ```
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "userId": "用户ID",
      "username": "用户名",
      "email": "邮箱",
      "avatar": "头像URL"
    },
    "message": "更新成功"
  }
  ```

### 修改密码
- **接口**：`PUT /user/password`
- **请求头**：需要认证令牌
- **参数**：
  ```json
  {
    "oldPassword": "旧密码",
    "newPassword": "新密码"
  }
  ```
- **返回**：
  ```json
  {
    "code": 200,
    "message": "密码修改成功"
  }
  ```

### 退出登录
- **接口**：`POST /user/logout`
- **请求头**：需要认证令牌
- **返回**：
  ```json
  {
    "code": 200,
    "message": "退出成功"
  }
  ```

## 论文分析模块

### 上传论文
- **接口**：`POST /paper/upload`
- **请求头**：需要认证令牌，Content-Type: multipart/form-data
- **参数**：
  - `file`: 论文文件（PDF格式）
  - `title`: 论文标题（可选）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "paperId": "论文ID",
      "title": "论文标题",
      "uploadTime": "上传时间",
      "fileSize": "文件大小"
    },
    "message": "上传成功"
  }
  ```

### 分析论文
- **接口**：`GET /paper/analyze/{paperId}`
- **请求头**：需要认证令牌
- **参数**：
  - `paperId`: 论文ID（路径参数）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "analysisId": "分析ID",
      "status": "分析状态（processing/completed/failed）",
      "estimatedTime": "预计完成时间（秒）"
    },
    "message": "分析请求已提交"
  }
  ```

### 获取论文列表
- **接口**：`GET /paper/list`
- **请求头**：需要认证令牌
- **参数**：
  - `page`: 页码（默认1）
  - `size`: 每页条数（默认10）
  - `status`: 分析状态（可选，all/processing/completed/failed）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "total": "总记录数",
      "list": [
        {
          "id": "论文ID",
          "title": "论文标题",
          "uploadTime": "上传时间",
          "status": "分析状态",
          "fileSize": "文件大小"
        }
      ],
      "page": "当前页码",
      "size": "每页条数"
    },
    "message": "获取成功"
  }
  ```

### 获取论文详情
- **接口**：`GET /paper/{id}`
- **修正**: 原接口为`GET /papers/{id}`，已修正为`GET /paper/{id}`
- **请求头**：需要认证令牌
- **参数**：
  - `id`: 论文ID（路径参数）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "id": "论文ID",
      "title": "论文标题",
      "fileName": "文件名",
      "fileSize": "文件大小",
      "uploadTime": "上传时间",
      "status": "分析状态",
      "tags": ["标签1", "标签2"],
      "abstract": "摘要",
      "totalPages": "总页数"
    },
    "message": "获取成功"
  }
  ```

### 删除论文
- **接口**：`DELETE /paper/delete/{paperId}`
- **请求头**：需要认证令牌
- **参数**：
  - `paperId`: 论文ID（路径参数）
- **返回**：
  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

### 获取论文分析历史
- **接口**：`GET /paper/history`
- **请求头**：需要认证令牌
- **参数**：
  - `page`: 页码（默认1）
  - `size`: 每页条数（默认10）
  - `status`: 状态（默认completed，可选all/processing/completed/failed）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "total": "总记录数",
      "list": [
        {
          "id": "记录ID",
          "paperId": "论文ID",
          "title": "论文标题",
          "createdAt": "创建时间",
          "status": "状态",
          "resultType": "结果类型"
        }
      ],
      "page": "当前页码",
      "size": "每页条数"
    },
    "message": "获取成功"
  }
  ```

## 科研问答助手模块

### 科研问答
- **接口**：`POST /qa/chat`
- **请求头**：需要认证令牌
- **参数**：
  ```json
  {
    "question": "科研问题内容",
    "sessionId": "会话ID（可选，首次对话不需要）"
  }
  ```
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "answer": "AI回复内容",
      "sessionId": "会话ID",
      "references": [
        {
          "title": "参考文献标题",
          "authors": "作者",
          "year": "发表年份",
          "url": "链接（如有）"
        }
      ]
    },
    "message": "回复成功"
  }
  ```

### 获取对话历史
- **接口**：`GET /qa/history/{sessionId}`
- **请求头**：需要认证令牌
- **参数**：
  - `sessionId`: 会话ID（路径参数）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "sessionId": "会话ID",
      "messages": [
        {
          "content": "消息内容",
          "isUser": true/false,
          "timestamp": "时间戳",
          "isMarkdown": true/false,
          "references": []
        }
      ]
    },
    "message": "获取成功"
  }
  ```

### 获取对话列表
- **接口**：`GET /qa/sessions`
- **请求头**：需要认证令牌
- **参数**：
  - `page`: 页码（默认1）
  - `size`: 每页条数（默认10）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "total": "总记录数",
      "list": [
        {
          "sessionId": "会话ID",
          "title": "会话标题",
          "createdAt": "创建时间",
          "lastMessageAt": "最后消息时间",
          "messageCount": "消息数量"
        }
      ],
      "page": "当前页码",
      "size": "每页条数"
    },
    "message": "获取成功"
  }
  ```

### 删除对话
- **接口**：`DELETE /qa/sessions/{sessionId}`
- **请求头**：需要认证令牌
- **参数**：
  - `sessionId`: 会话ID（路径参数）
- **返回**：
  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

## 翻译模块

### 获取支持的语言列表
- **接口**：`GET /translate/languages`
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "languages": [
        {
          "code": "zh",
          "name": "中文"
        },
        {
          "code": "en",
          "name": "英文"
        }
      ]
    },
    "message": "获取成功"
  }
  ```

### 翻译文本
- **接口**：`POST /translate`
- **请求头**：需要认证令牌
- **参数**：
  ```json
  {
    "text": "要翻译的文本",
    "sourceLanguage": "源语言代码（zh或en）",
    "targetLanguage": "目标语言代码（zh或en）",
    "style": "翻译风格（academic或casual）"
  }
  ```
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "translatedText": "翻译后的文本",
      "translationId": "翻译记录ID",
      "sourceLanguage": "源语言代码",
      "targetLanguage": "目标语言代码"
    },
    "message": "翻译成功"
  }
  ```

### 获取翻译历史
- **接口**：`GET /translate/history`
- **请求头**：需要认证令牌
- **参数**：
  - `page`: 页码（默认1）
  - `size`: 每页条数（默认10）
  - `style`: 翻译风格（可选，academic/casual/all，默认all）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "total": "总记录数",
      "list": [
        {
          "id": "记录ID",
          "sourceText": "原文摘要",
          "translatedText": "译文摘要",
          "sourceLanguage": "源语言代码",
          "targetLanguage": "目标语言代码",
          "style": "翻译风格",
          "timestamp": "创建时间"
        }
      ],
      "page": "当前页码",
      "size": "每页条数"
    },
    "message": "获取成功"
  }
  ```

### 获取翻译详情
- **接口**：`GET /translate/history/{translationId}`
- **请求头**：需要认证令牌
- **参数**：
  - `translationId`: 翻译记录ID（路径参数）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "id": "记录ID",
      "sourceText": "原文",
      "translatedText": "译文",
      "sourceLanguage": "源语言代码",
      "targetLanguage": "目标语言代码",
      "style": "翻译风格",
      "timestamp": "创建时间"
    },
    "message": "获取成功"
  }
  ```

### 删除翻译记录
- **接口**：`DELETE /translate/delete/{translationId}`
- **请求头**：需要认证令牌
- **参数**：
  - `translationId`: 翻译记录ID（路径参数）
- **返回**：
  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

## AI请求历史模块

### 获取AI请求历史记录
- **接口**：`GET /ai/history`
- **请求头**：需要认证令牌
- **参数**：
  - `page`: 页码（默认1）
  - `size`: 每页条数（默认10）
  - `appType`: 应用类型（可选，paper/translation/qa）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "total": "总记录数",
      "list": [
        {
          "id": "请求ID",
          "appType": "应用类型",
          "operation": "操作类型",
          "timestamp": "时间戳",
          "status": "状态",
          "input": "输入摘要",
          "output": "输出摘要"
        }
      ],
      "page": "当前页码",
      "size": "每页条数"
    },
    "message": "获取成功"
  }
  ```

### 获取AI请求详情
- **接口**：`GET /ai/history/{requestId}`
- **请求头**：需要认证令牌
- **参数**：
  - `requestId`: 请求ID（路径参数）
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "id": "请求ID",
      "appType": "应用类型",
      "operation": "操作类型",
      "timestamp": "时间戳",
      "status": "状态",
      "input": "完整输入",
      "output": "完整输出",
      "processingTime": "处理时间（毫秒）",
      "tokenCount": "Token数量"
    },
    "message": "获取成功"
  }
  ```

## 活动模块

### 获取最近活动
- **接口**：`GET /activity/recent`
- **请求头**：需要认证令牌
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "activities": [
        {
          "id": "活动ID",
          "type": "活动类型（paper/translation/qa）",
          "action": "活动动作（upload/analyze/translate等）",
          "timestamp": "时间戳",
          "title": "活动标题",
          "details": "活动详情"
        }
      ]
    },
    "message": "获取成功"
  }
  ```

### 删除活动记录
- **接口**：`DELETE /activity/delete/{activityId}`
- **请求头**：需要认证令牌
- **参数**：
  - `activityId`: 活动ID（路径参数）
- **返回**：
  ```json
  {
    "code": 200,
    "message": "删除成功"
  }
  ```

## 系统模块

### 获取支持的语言列表
- **接口**：`GET /system/languages`
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "languages": [
        {
          "code": "zh",
          "name": "中文"
        },
        {
          "code": "en",
          "name": "英文"
        }
      ]
    },
    "message": "获取成功"
  }
  ```

### 检查服务状态
- **接口**：`GET /system/status`
- **返回**：
  ```json
  {
    "code": 200,
    "data": {
      "status": "状态（online/partial/maintenance）",
      "message": "状态说明",
      "services": {
        "paper": "论文服务状态（active/inactive）",
        "translation": "翻译服务状态（active/inactive）",
        "qa": "问答服务状态（active/inactive）"
      },
      "serverTime": "服务器时间"
    },
    "message": "获取成功"
  }
  ```

## 前端连接说明

### 配置API基础URL
在前端项目中，建议统一配置API基础URL：

```javascript
// 开发环境
const API_BASE_URL = 'http://localhost:3001/api';

// 生产环境（根据实际部署情况修改）
// const API_BASE_URL = 'https://您的服务器域名/api';
```

### 认证Token处理
```javascript
// 设置请求头
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

// 发送请求示例
fetch(`${API_BASE_URL}/qa/chat`, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify({
    question: '您的问题',
    sessionId: sessionId // 可选
  })
})
.then(response => response.json())
.then(data => {
  // 处理响应数据
})
.catch(error => {
  // 处理错误
});
```

### 错误处理
处理常见错误状态码：
- 401: 未授权，需要重新登录
- 404: 资源不存在，检查API路径是否正确
- 500: 服务器内部错误

```javascript
// 错误处理示例
fetch(`${API_BASE_URL}/qa/chat`, {...})
.then(response => {
  if (!response.ok) {
    if (response.status === 401) {
      // 跳转到登录页
      window.location.href = '/login';
      throw new Error('未授权，请重新登录');
    } else if (response.status === 404) {
      throw new Error('API端点不存在，请检查接口路径');
    }
    throw new Error('请求失败：' + response.status);
  }
  return response.json();
})
.then(data => {...})
.catch(error => {
  console.error('错误:', error);
  // 显示错误提示
});
```
