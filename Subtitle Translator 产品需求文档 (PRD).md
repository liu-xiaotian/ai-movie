------

## 一、产品概述

### 1.1 产品名称

Subtitle Translator（在线字幕翻译）

### 1.2 产品定位

一个基于 AI 的 **在线字幕翻译工具**，支持用户上传 `.srt` 文件并自动翻译为多语言字幕。

该产品通过结合 **AI 大模型翻译能力（GPT-4o / Claude / Qwen）** 与 **高性能字幕解析技术**，为用户提供 **快速、准确、低成本的字幕翻译解决方案**。

用户只需要上传 `.srt` 文件，系统自动：

```
解析字幕
↓
AI翻译
↓
生成新字幕
```

极大减少人工翻译成本。

产品核心定位：

> **你的 AI 字幕翻译助手**

### 1.3 产品目标

| 目标                 | 描述             |
| -------------------- | ---------------- |
| 提供简单字幕翻译工具 | 上传字幕即可翻译 |
| 提高字幕翻译效率     | AI自动翻译       |
| 支持视频创作者       | 多语言字幕生成   |

------

# 二、用户流程（User Flow）

完整流程：

```
用户进入首页
   ↓
上传 SRT 文件
   ↓
系统解析字幕
   ↓
用户选择目标语言
   ↓
调用 AI 翻译
   ↓
生成翻译字幕
   ↓
下载字幕
```

------

# 三、系统架构

整体架构：

```
Browser
   │
   │
Next.js Frontend
   │
   │
Next.js API Route
   │
   │
AI Translation Service
   │
   │
Storage (optional)
```

核心模块：

```
Auth Service
Subtitle Service
AI Translation Service
File Storage Service
```

部署：

| 服务 | 推荐                  |
| ---- | --------------------- |
| 前端 | Next.js               |
| API  | Next.js Route Handler |
| AI   | OpenAI                |
| 存储 | S3 / Cloudflare R2    |
| CDN  | Vercel                |

------

# 四、技术选型

## 4.1 前端

| 技术           | 用途     |
| -------------- | -------- |
| Next.js 14     | Web框架  |
| TypeScript     | 类型安全 |
| TailwindCSS    | UI       |
| React Dropzone | 拖拽上传 |
| Zustand        | 状态管理 |

------

## 4.2 后端

| 技术        | 用途     |
| ----------- | -------- |
| Next.js API | API服务  |
| Node.js     | 运行环境 |
| OpenAI API  | 翻译     |
| Zod         | 参数校验 |

------

## 4.3 第三方服务

| 服务          | 用途     |
| ------------- | -------- |
| OpenAI        | AI翻译   |
| Vercel        | 部署     |
| Cloudflare R2 | 文件存储 |

------

# 五、核心功能模块

------

# 5.1 字幕上传模块

### 功能

用户上传 `.srt` 字幕文件。

支持：

- 拖拽上传
- 点击上传

### **布局与交互设计**

上传界面采用 **拖拽上传设计**。

| **元素** | **描述**         | **交互细节**      |
| -------- | ---------------- | ----------------- |
| 上传区域 | 拖拽上传字幕文件 | 支持 drag & drop  |
| 文件选择 | 点击上传         | 选择本地文件      |
| 提示信息 | 上传限制提示     | 显示支持格式      |
| 状态提示 | 上传状态         | loading + success |

```
┌──────────────────────────────┐
│                              │
│      拖拽字幕到这里上传       │
│      或点击选择文件          │
│                              │
│      仅支持 .srt 最大 5MB     │
│                              │
└──────────────────────────────┘
```

### 文件校验

| 校验 | 规则   |
| ---- | ------ |
| 类型 | `.srt` |
| 大小 | ≤ 5MB  |
| 数量 | 1      |

### 错误提示

| **场景** | **提示**         |
| -------- | ---------------- |
| 格式错误 | 仅支持 SRT 文件  |
| 文件过大 | 文件不能超过5MB  |
| 上传失败 | 上传失败，请重试 |

------

# 5.2 SRT 解析模块

系统自动解析 `.srt` 文件。

### SRT 示例

```
1
00:00:01,000 --> 00:00:03,000
Hello world

2
00:00:04,000 --> 00:00:05,000
How are you
```

### 数据结构

```tsx
type Subtitle = {
  id: number
  start: string
  end: string
  text: string
}
```

### 解析算法

步骤：

```
读取文件
↓
按空行分块
↓
解析 id
↓
解析时间轴
↓
解析文本
```

### 解析函数

```tsx
export function parseSrt(content: string) {
  const blocks = content.split("\\n\\n")

  return blocks.map(block => {
    const lines = block.split("\\n")

    return {
      id: Number(lines[0]),
      time: lines[1],
      text: lines.slice(2).join(" ")
    }
  })
}
```

------

# 5.3 翻译模块

### 翻译流程

```
字幕数组
   ↓
拼接文本
   ↓
调用 AI 翻译
   ↓
返回翻译文本
   ↓
重新生成字幕
```

### AI Prompt

示例：

```
You are a professional subtitle translator.

Translate the following subtitles into Chinese.

Rules:
- Keep meaning accurate
- Do not change order
- Do not add extra text

Subtitles:
```

------

### API 请求

POST

```
/api/translate
```

请求：

```
multipart/form-data
```

参数：

| 参数       | 类型   |
| ---------- | ------ |
| file       | SRT    |
| targetLang | string |

------

### 返回

```json
{
  "success": true,
  "downloadUrl": "/api/download/123"
}
```

------

# 5.4 字幕生成模块

翻译完成后重新生成 `.srt`

生成格式：

```
1
00:00:01,000 --> 00:00:03,000
你好世界

2
00:00:04,000 --> 00:00:05,000
你好吗
```

### 生成函数

```tsx
export function generateSrt(subtitles) {
  return subtitles.map((s, index) => {
    return `${index+1}
${s.time}
${s.text}
`
  }).join("\\n")
}
```

------

# 5.5 下载模块

翻译完成后：

用户可以下载：

```
translated.srt
```

下载方式：

```
/api/download/:id
```

# **5.6 用户系统**

基础用户体系。

| **功能** | **描述**     |
| -------- | ------------ |
| 注册     | 邮箱注册     |
| 登录     | JWT认证      |
| 用户信息 | 用户资料管理 |

------

# **5.7 配额系统**

控制 API 使用成本。

| **用户类型** | **限制**  |
| ------------ | --------- |
| 免费用户     | 每日3次   |
| Pro用户      | 每日100次 |

------

# 六、页面结构

## 首页

页面路径：

```
/
```

页面结构：

```
Header
   Logo
   登录注册

Main
   标题
   上传组件
   语言选择
   翻译按钮

Footer
```

------

# 七、组件设计

组件列表：

```
components/
   UploadBox.tsx
   LanguageSelect.tsx
   TranslateButton.tsx
   ProgressBar.tsx
```

------

### UploadBox

功能：

- 拖拽上传
- 文件预览

props：

```
onFileUpload(file)
```

------

### LanguageSelect

选择翻译语言

```
<select>
English
Chinese
Japanese
Korean
</select>
```

------

### ProgressBar

状态显示：

```
Uploading
Parsing
Translating
Generating
Done
```

------

# 八、状态管理

推荐 Zustand。

状态：

```
idle
uploading
parsing
translating
generating
done
error
```

------

# 九、**数据库设计**

------

## **users**

| **字段**   | **类型** |
| ---------- | -------- |
| id         | uuid     |
| email      | string   |
| password   | string   |
| plan       | string   |
| created_at | datetime |

------

## **translations**

| **字段**    | **类型** |
| ----------- | -------- |
| id          | uuid     |
| user_id     | uuid     |
| filename    | string   |
| source_lang | string   |
| target_lang | string   |
| status      | string   |
| created_at  | datetime |

------

## **files**

| **字段** | **类型** |
| -------- | -------- |
| id       | uuid     |
| path     | string   |
| size     | int      |

------

# 十、性能优化

### 批量翻译

避免逐句请求 AI：

```
每50条字幕
合并翻译
```

------

### 示例

```
1. Hello
2. How are you
3. I'm fine
```

一次翻译。

------

# 十一、安全设计

| 风险     | 解决         |
| -------- | ------------ |
| 恶意文件 | 校验格式     |
| 过大文件 | 限制大小     |
| API滥用  | rate limit   |
| 数据隐私 | 文件自动删除 |

------

# 十二、SEO

页面 meta：

```
Online Subtitle Translator
Free SRT Subtitle Translation Tool
```

关键词：

```
subtitle translator
srt translate
ai subtitle translate
```

------

# 十三、MVP版本

MVP 功能：

| 功能     | 是否 |
| -------- | ---- |
| 上传 SRT | ✔    |
| AI翻译   | ✔    |
| 下载字幕 | ✔    |

暂不支持：

- 用户系统
- 字幕编辑
- 视频字幕

------

# 十四、开发周期

| 阶段     | 时间 |
| -------- | ---- |
| UI开发   | 1天  |
| 上传模块 | 1天  |
| SRT解析  | 1天  |
| AI翻译   | 1天  |
| 下载模块 | 1天  |

总计：

```
5天 MVP
```

------

# 十五、未来版本

### V2

- 支持 `.vtt`
- 支持 `.ass`
- 字幕在线编辑

### V3

- 上传视频自动生成字幕
- AI字幕校对

------

# 十六、商业化

收费模式：

| 方案 | 价格    |
| ---- | ------- |
| Free | 每日3次 |
| Pro  | $9/月   |

------

# 十七、完整项目结构（Next.js）

```
subtitle-translator/

app
   page.tsx

components
   UploadBox.tsx
   ProgressBar.tsx
   LanguageSelect.tsx

lib
   parseSrt.ts
   generateSrt.ts
   translateAI.ts

app/api
   translate/route.ts
   download/[id]/route.ts
```

------

# 十八、**API 设计**

------

## **上传翻译**

```
POST /api/translate
```

参数：

```
file
targetLang
```

返回：

```
{
 success:true,
 taskId:"123"
}
```

------

## **查询任务**

```
GET /api/task/:id
```

返回：

```
{
 status:"processing"
}
```

------

## **下载字幕**

```
GET /api/download/:id
```

------