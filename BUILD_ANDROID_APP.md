# 构建Android应用指南

## 📱 将您的AI图片生成器转换为Android APK

按照以下步骤将您的Web应用转换为原生Android应用：

## 前置要求

1. **安装Android Studio**
   - 下载地址: https://developer.android.com/studio
   - 安装完成后，打开Android Studio并安装Android SDK

2. **安装Java JDK**
   - 推荐使用JDK 17或更高版本
   - 下载地址: https://www.oracle.com/java/technologies/downloads/

3. **安装Node.js和npm**
   - 确保已安装Node.js（建议使用nvm管理版本）

## 构建步骤

### 1. 导出项目到GitHub

在Lovable界面中：
- 点击右上角的"Export to GitHub"按钮
- 将项目推送到您的GitHub仓库

### 2. 克隆项目到本地

```bash
# 克隆您的GitHub仓库
git clone <您的仓库URL>
cd <项目文件夹>
```

### 3. 安装依赖

```bash
npm install
```

### 4. 初始化Capacitor

```bash
npx cap init
```

如果提示输入信息，使用以下值：
- App name: **AI图片生成器**
- App ID: **app.lovable.1ed35ccdb61d4065bea4a099230473ed**

### 5. 添加Android平台

```bash
npx cap add android
```

### 6. 更新Android平台

```bash
npx cap update android
```

### 7. 构建Web应用

```bash
npm run build
```

### 8. 同步资源到Android

```bash
npx cap sync android
```

### 9. 在Android Studio中打开项目

```bash
npx cap open android
```

这将自动打开Android Studio并加载您的Android项目。

### 10. 构建APK

在Android Studio中：

1. **连接设备或启动模拟器**
   - 真机：通过USB连接手机，并启用"开发者选项"和"USB调试"
   - 模拟器：在Android Studio中创建虚拟设备

2. **运行应用（测试）**
   - 点击顶部的绿色播放按钮（Run）
   - 或使用命令行：`npx cap run android`

3. **构建发布版APK**
   - 点击 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - 等待构建完成
   - APK文件将保存在：`android/app/build/outputs/apk/debug/app-debug.apk`

4. **构建签名的发布版（用于发布到Google Play）**
   - 点击 `Build` → `Generate Signed Bundle / APK`
   - 选择APK
   - 创建或选择密钥库
   - 按照向导完成签名
   - 签名的APK将保存在：`android/app/release/`

## 🔄 开发模式（热重载）

当前配置已启用热重载功能，这意味着：
- 应用将直接从Lovable的预览URL加载内容
- 您在Lovable中所做的更改会实时反映到手机应用中
- 无需重新构建即可测试新功能

如果要切换到生产模式（将代码打包到APK中）：

1. 编辑 `capacitor.config.ts`，删除或注释掉 `server` 部分：
```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.1ed35ccdb61d4065bea4a099230473ed',
  appName: 'AI图片生成器',
  webDir: 'dist',
  // 注释掉以下部分用于生产构建
  // server: {
  //   url: 'https://1ed35ccd-b61d-4065-bea4a099230473ed.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // }
};
```

2. 重新构建并同步：
```bash
npm run build
npx cap sync android
```

## 📦 安装APK到手机

### 方法1：通过USB连接
1. 在Android Studio中点击Run按钮
2. 应用将自动安装到连接的设备

### 方法2：直接安装APK文件
1. 将生成的APK文件传输到手机
2. 在手机上找到APK文件
3. 点击安装（需要允许"未知来源"的应用安装）

## ⚡ 快速测试命令

```bash
# 快速运行到连接的Android设备
npx cap run android

# 如果遇到问题，清理并重新构建
npm run build
npx cap sync android
npx cap open android
```

## 🔧 常见问题

### 1. "SDK location not found"错误
在 `android/local.properties` 文件中添加：
```
sdk.dir=/path/to/Android/Sdk
```

### 2. Gradle构建失败
- 检查网络连接
- 清理Gradle缓存：删除 `~/.gradle/caches` 文件夹

### 3. 应用白屏或无法加载
- 确保Supabase URL和密钥正确配置
- 检查网络权限（应该已自动添加）

### 4. 每次代码修改后需要做什么？
- 如果使用热重载模式：在Lovable中修改即可，无需重新构建
- 如果使用生产模式：运行 `npm run build && npx cap sync android`

## 📱 应用权限

应用需要以下权限（已在配置中包含）：
- 网络访问：用于AI图片生成和显示
- 存储访问：用于保存下载的图片

## 🚀 发布到Google Play

1. 在Google Play Console创建应用
2. 构建签名的发布版APK或AAB
3. 上传到Google Play Console
4. 完成商店列表信息
5. 提交审核

## 📚 更多资源

- [Capacitor官方文档](https://capacitorjs.com/docs)
- [Android开发文档](https://developer.android.com/docs)
- [Lovable移动应用文档](https://docs.lovable.dev/)

祝您构建顺利！🎉
