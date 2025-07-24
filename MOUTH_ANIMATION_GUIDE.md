# 女神嘴巴動畫系統使用指南

## 功能概述

這個專案現在包含了先進的嘴巴動畫系統，可以讓三位女神（Aglaea、Thalia、Euphrosyne）的嘴巴動起來，創造更生動的互動體驗。

## 技術特性

### 1. 多種動畫實現方式
- **變形目標動畫**: 如果模型包含嘴巴相關的變形目標（morph targets），系統會自動使用這些變形目標創建自然的嘴巴開合動畫
- **縮放動畫**: 如果沒有變形目標，系統會創建基於縮放的動畫來模擬嘴巴開合效果
- **現有動畫**: 如果模型已經包含嘴巴動畫，系統會直接使用這些動畫

### 2. 女神個性化動畫
每個女神都有獨特的動畫風格：
- **Aglaea (優雅女神)**: 較慢、較輕的動畫，體現優雅氣質
- **Thalia (歡樂女神)**: 較快、較活潑的動畫，展現歡樂性格
- **Euphrosyne (歡欣女神)**: 中等速度、中等強度，平衡的動畫效果

### 3. 音頻同步功能
系統包含音頻分析器，可以根據音頻強度自動調整動畫速度，創造更自然的說話效果。

## 使用方法

### 自動觸發
1. **載入完成後**: 模型載入完成後，嘴巴動畫會自動開始
2. **女神切換**: 點擊不同的女神時，會自動切換到對應的動畫風格
3. **介紹動畫結束**: 當介紹動畫完成後，嘴巴動畫會自動開始

### 鍵盤控制
使用鍵盤可以手動控制動畫：

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

### 程式化控制
開發者可以使用以下方法控制動畫：

```javascript
// 開始動畫
mouthAnimationSystem.controlMouthAnimation('start')

// 停止動畫
mouthAnimationSystem.controlMouthAnimation('stop')

// 設置動畫速度
mouthAnimationSystem.controlMouthAnimation('setSpeed', { speed: 1.5 })

// 設置動畫強度
mouthAnimationSystem.controlMouthAnimation('setIntensity', { intensity: 0.8 })

// 設置特定女神的動畫參數
mouthAnimationSystem.setGoddessAnimation('thalia')
```

## 技術實現

### 動畫系統架構
```javascript
class MouthAnimationSystem {
    constructor() {
        this.mixer = null              // 動畫混合器
        this.mouthAnimation = null     // 嘴巴動畫
        this.currentGoddess = 'aglaea' // 當前女神
        this.isPlaying = false         // 播放狀態
        this.audioContext = null       // 音頻上下文
        this.analyser = null           // 音頻分析器
        this.animationSpeed = 1.0      // 動畫速度
    }
}
```

### 動畫創建流程
1. **檢查現有動畫**: 首先檢查模型是否包含現有的嘴巴動畫
2. **查找變形目標**: 如果沒有現有動畫，查找包含嘴巴相關變形目標的網格
3. **創建變形動畫**: 使用變形目標創建自然的嘴巴開合動畫
4. **創建縮放動畫**: 如果沒有變形目標，創建基於縮放的動畫
5. **設置動畫參數**: 根據不同女神設置不同的動畫參數

### 音頻同步實現
```javascript
updateAudioBasedAnimation() {
    this.analyser.getByteFrequencyData(this.dataArray)
    
    // 計算音頻強度
    let sum = 0
    for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i]
    }
    const average = sum / this.dataArray.length
    
    // 根據音頻強度調整動畫速度
    const speedMultiplier = 1 + (average / 255) * 0.5
    if (this.mouthAnimation) {
        this.mouthAnimation.timeScale = this.animationSpeed * speedMultiplier
    }
}
```

## 性能優化

### 記憶體管理
- 動畫混合器會自動管理動畫資源
- 切換女神時會重用現有的動畫系統
- 提供 `dispose()` 方法清理資源

### 渲染優化
- 動畫更新與渲染循環同步
- 只在需要時更新動畫
- 音頻分析器使用較小的 FFT 大小以節省性能

## 故障排除

### 常見問題

1. **動畫不顯示**
   - 檢查瀏覽器控制台是否有錯誤訊息
   - 確認模型是否正確載入
   - 檢查是否有合適的網格用於動畫

2. **動畫效果不明顯**
   - 嘗試調整動畫強度（按鍵 7 和 8）
   - 檢查模型是否包含合適的變形目標
   - 確認網格選擇是否正確

3. **音頻同步不工作**
   - 確認瀏覽器支援 Web Audio API
   - 檢查是否有音頻權限
   - 確認音頻上下文是否正確初始化

### 調試技巧

1. **查看控制台輸出**
   ```javascript
   // 在瀏覽器控制台中查看動畫系統狀態
   console.log(mouthAnimationSystem)
   ```

2. **檢查模型結構**
   ```javascript
   // 遍歷模型查看網格結構
   scene.traverse((obj) => {
       if (obj.isMesh) {
           console.log('Mesh:', obj.name, obj.morphTargetDictionary)
       }
   })
   ```

3. **測試動畫參數**
   ```javascript
   // 測試不同的動畫參數
   mouthAnimationSystem.controlMouthAnimation('setSpeed', { speed: 0.1 })
   mouthAnimationSystem.controlMouthAnimation('setIntensity', { intensity: 0.1 })
   ```

## 未來改進

### 計劃中的功能
- [ ] 更精確的臉部識別算法
- [ ] 支援多個變形目標的組合動畫
- [ ] 實時音頻輸入支援
- [ ] 表情動畫系統
- [ ] 語音同步功能

### 技術改進
- [ ] 更高效的動畫插值算法
- [ ] GPU 加速的變形計算
- [ ] 更智能的網格選擇算法
- [ ] 動畫預載入和快取系統

## 結語

這個嘴巴動畫系統為三位女神注入了新的生命力，讓她們能夠以更生動的方式與觀眾互動。通過結合變形目標、縮放動畫和音頻同步，創造出了自然且富有表現力的動畫效果。

系統的模組化設計使得它易於擴展和維護，為未來的功能增強奠定了良好的基礎。

---

*最後更新: 2024年*
*版本: 1.0* 