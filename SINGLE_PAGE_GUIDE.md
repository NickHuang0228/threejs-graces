# 單頁版 Three.js Graces 專案指南

## 專案概述

這個專案已經簡化為單頁版本，只保留第一段（首頁區塊），展示三位女神的介紹和 3D 場景，並包含完整的嘴巴動畫系統。

## 主要功能

### 🎨 視覺效果
- **3D 場景**: 使用 Three.js 渲染的三位女神雕像
- **視差效果**: 滑鼠移動時背景 3D 場景會產生視差效果
- **載入動畫**: 優雅的載入過渡效果
- **磁性選單**: 導航欄的磁性懸停效果
- **自定義游標**: 跟隨滑鼠的自定義游標

### 🗣️ 嘴巴動畫系統
- **自動動畫**: 載入完成後自動開始嘴巴動畫
- **女神個性化**: 每個女神都有獨特的動畫風格
- **音頻同步**: 可選的音頻分析器功能
- **鍵盤控制**: 使用鍵盤控制動畫參數

## 頁面結構

### 導航欄
- ART, ABOUT, VISIT, SHOP, SEARCH 選單
- 磁性懸停效果
- 自定義游標

### 主要內容區塊
- **標題**: "The THREE GRACES"
- **介紹文字**: Antonio Canova 雕像的詳細描述
- **3D 背景**: 三位女神的 3D 場景

### 頁腳
- 創作者資訊和致謝

## 嘴巴動畫控制

### 鍵盤快捷鍵
| 按鍵 | 功能 | 說明 |
|------|------|------|
| `1` | 開始動畫 | 開始嘴巴動畫 |
| `2` | 停止動畫 | 停止嘴巴動畫 |
| `3` | 暫停動畫 | 暫停當前動畫 |
| `4` | 恢復動畫 | 恢復暫停的動畫 |
| `5` | 慢速模式 | 設置動畫速度為 0.5x |
| `6` | 快速模式 | 設置動畫速度為 2.0x |
| `7` | 低強度 | 設置動畫強度為 0.5 |
| `8` | 高強度 | 設置動畫強度為 1.0 |

### 動畫特性
- **Aglaea (優雅女神)**: 較慢、較輕的動畫
- **Thalia (歡樂女神)**: 較快、較活潑的動畫  
- **Euphrosyne (歡欣女神)**: 中等速度、中等強度

## 技術架構

### 核心技術
- **Three.js v0.134.0**: 3D 圖形渲染
- **Webpack 5**: 模組打包
- **TWEEN.js**: 動畫引擎
- **DRACO**: 3D 模型壓縮

### 動畫系統
- **MouthAnimationSystem**: 專門的嘴巴動畫模組
- **變形目標支援**: 自動檢測和使用變形目標
- **縮放動畫**: 備用的縮放動畫方案
- **音頻分析**: 可選的音頻同步功能

## 使用方法

### 1. 啟動專案
```bash
npm run dev
```

### 2. 訪問網頁
打開瀏覽器訪問 `http://localhost:8080`

### 3. 體驗功能
- 觀察載入動畫
- 移動滑鼠體驗視差效果
- 使用鍵盤控制嘴巴動畫
- 懸停導航欄體驗磁性效果

## 檔案結構

```
threejs-graces/
├── src/
│   ├── script.js              # 主要 JavaScript 邏輯
│   ├── mouthAnimation.js      # 嘴巴動畫系統
│   ├── index.html             # HTML 結構（簡化版）
│   └── main.css               # 樣式文件（簡化版）
├── static/
│   ├── models/                # 3D 模型文件
│   ├── draco/                 # DRACO 解碼器
│   └── textures/              # 紋理和圖片
└── bundler/                   # Webpack 配置
```

## 開發說明

### 移除的功能
- 第二段：女神選擇和詳細資訊
- 第三段：製作說明
- 雙渲染器系統
- 女神切換功能
- 交叉觀察器

### 保留的功能
- 3D 場景渲染
- 視差效果
- 嘴巴動畫系統
- 載入動畫
- 導航欄效果
- 響應式設計

## 自定義選項

### 修改動畫參數
在 `src/mouthAnimation.js` 中可以調整：
- 動畫速度
- 動畫強度
- 女神個性化參數
- 音頻同步設定

### 調整視覺效果
在 `src/main.css` 中可以修改：
- 顏色主題
- 字體樣式
- 動畫時間
- 響應式斷點

## 故障排除

### 常見問題
1. **動畫不顯示**: 檢查瀏覽器控制台錯誤
2. **模型載入失敗**: 確認模型文件路徑正確
3. **性能問題**: 調整動畫參數或降低品質

### 調試技巧
- 使用瀏覽器開發者工具
- 查看控制台輸出
- 測試鍵盤控制功能

---

*這個簡化版本專注於核心的 3D 展示和嘴巴動畫功能，提供更簡潔的用戶體驗。* 