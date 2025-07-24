/////////////////////////////////////////////////////////////////////////
//// 嘴巴動畫系統模組
/////////////////////////////////////////////////////////////////////////

import { AnimationMixer, LoopRepeat, NumberKeyframeTrack, AnimationClip } from 'three'

export class MouthAnimationSystem {
    constructor() {
        this.mixer = null
        this.mouthAnimation = null
        this.currentGoddess = 'aglaea'
        this.isPlaying = false
        this.audioContext = null
        this.analyser = null
        this.dataArray = null
        this.animationSpeed = 1.0
    }

    /////////////////////////////////////////////////////////////////////////
    //// 初始化動畫系統
    initAnimationSystem(gltf) {
        console.log('初始化嘴巴動畫系統...')
        
        // 檢查模型是否包含動畫
        if (gltf.animations && gltf.animations.length > 0) {
            console.log('發現動畫數據:', gltf.animations.length, '個動畫')
            this.setupExistingAnimations(gltf)
        } else {
            console.log('模型沒有動畫數據，創建自定義嘴巴動畫')
            this.createCustomMouthAnimation(gltf.scene)
        }
        
        // 初始化音頻分析器（可選）
        this.initAudioAnalyzer()
    }

    /////////////////////////////////////////////////////////////////////////
    //// 設置現有動畫
    setupExistingAnimations(gltf) {
        // 創建動畫混合器
        this.mixer = new AnimationMixer(gltf.scene)
        
        // 查找嘴巴相關的動畫
        const mouthAnim = gltf.animations.find(anim => 
            anim.name.toLowerCase().includes('mouth') || 
            anim.name.toLowerCase().includes('speak') ||
            anim.name.toLowerCase().includes('talk') ||
            anim.name.toLowerCase().includes('lip')
        )
        
        if (mouthAnim) {
            // 創建嘴巴動畫
            this.mouthAnimation = this.mixer.clipAction(mouthAnim)
            this.mouthAnimation.setLoop(LoopRepeat)
            this.mouthAnimation.clampWhenFinished = true
            console.log('找到嘴巴動畫:', mouthAnim.name)
        } else {
            // 如果沒有現成的嘴巴動畫，創建一個簡單的變形動畫
            this.createCustomMouthAnimation(gltf.scene)
        }
    }

    /////////////////////////////////////////////////////////////////////////
    //// 創建自定義嘴巴動畫
    createCustomMouthAnimation(scene) {
        // 查找包含變形目標的網格（通常是臉部網格）
        let faceMesh = this.findFaceMesh(scene)
        
        if (faceMesh && faceMesh.morphTargetDictionary) {
            this.createMorphTargetAnimation(faceMesh)
        } else {
            // 如果沒有變形目標，創建一個簡單的縮放動畫來模擬嘴巴開合
            console.log('未找到變形目標，創建簡單的縮放動畫')
            this.createScaleAnimation(scene)
        }
    }

    /////////////////////////////////////////////////////////////////////////
    //// 查找臉部網格
    findFaceMesh(scene) {
        let faceMesh = null
        
        scene.traverse((obj) => {
            if (obj.isMesh && obj.morphTargetDictionary) {
                // 查找包含嘴巴相關變形目標的網格
                const morphNames = Object.values(obj.morphTargetDictionary)
                const mouthMorphs = morphNames.filter(name => 
                    name.toLowerCase().includes('mouth') ||
                    name.toLowerCase().includes('lip') ||
                    name.toLowerCase().includes('speak')
                )
                
                if (mouthMorphs.length > 0) {
                    faceMesh = obj
                    console.log('找到臉部網格，變形目標:', morphNames)
                    console.log('嘴巴相關變形目標:', mouthMorphs)
                }
            }
        })
        
        return faceMesh
    }

    /////////////////////////////////////////////////////////////////////////
    //// 創建變形目標動畫
    createMorphTargetAnimation(faceMesh) {
        // 創建動畫混合器
        this.mixer = new AnimationMixer(faceMesh)
        
        // 查找嘴巴開合的變形目標
        const mouthOpenMorph = faceMesh.morphTargetDictionary['mouthOpen'] || 
                              faceMesh.morphTargetDictionary['mouth_open'] ||
                              faceMesh.morphTargetDictionary['speak'] ||
                              faceMesh.morphTargetDictionary['mouth']
        
        if (mouthOpenMorph !== undefined) {
            // 創建更自然的嘴巴開合動畫
            const times = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0]
            const values = [0, 0.3, 0.8, 1.0, 0.7, 0.2, 0.6, 0.9, 0.4, 0.1, 0] // 更自然的嘴巴開合序列
            
            const track = new NumberKeyframeTrack(
                `.morphTargetInfluences[${mouthOpenMorph}]`,
                times,
                values
            )
            
            const clip = new AnimationClip('naturalMouthAnimation', 2, [track])
            this.mouthAnimation = this.mixer.clipAction(clip)
            this.mouthAnimation.setLoop(LoopRepeat)
            this.mouthAnimation.clampWhenFinished = true
            
            console.log('創建變形目標嘴巴動畫成功')
        } else {
            console.log('未找到嘴巴變形目標，嘗試創建縮放動畫')
            this.createScaleAnimation(faceMesh.parent)
        }
    }

    /////////////////////////////////////////////////////////////////////////
    //// 創建縮放動畫
    createScaleAnimation(scene) {
        // 查找可能的臉部或頭部網格
        let headMesh = this.findHeadMesh(scene)
        
        if (headMesh) {
            // 創建動畫混合器
            this.mixer = new AnimationMixer(headMesh)
            
            // 創建更自然的縮放動畫來模擬嘴巴開合
            const times = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0]
            const scaleX = [1, 1.005, 1.01, 1.015, 1.01, 1.005, 1.01, 1.015, 1.01, 1.005, 1]
            const scaleY = [1, 1.02, 1.04, 1.06, 1.04, 1.02, 1.04, 1.06, 1.04, 1.02, 1] // Y軸較明顯縮放
            const scaleZ = [1, 1.005, 1.01, 1.015, 1.01, 1.005, 1.01, 1.015, 1.01, 1.005, 1]
            
            const scaleXTrack = new NumberKeyframeTrack('.scale.x', times, scaleX)
            const scaleYTrack = new NumberKeyframeTrack('.scale.y', times, scaleY)
            const scaleZTrack = new NumberKeyframeTrack('.scale.z', times, scaleZ)
            
            const clip = new AnimationClip('scaleMouthAnimation', 2, [scaleXTrack, scaleYTrack, scaleZTrack])
            this.mouthAnimation = this.mixer.clipAction(clip)
            this.mouthAnimation.setLoop(LoopRepeat)
            this.mouthAnimation.clampWhenFinished = true
            
            console.log('創建縮放嘴巴動畫成功')
        } else {
            console.log('未找到合適的頭部網格，無法創建嘴巴動畫')
        }
    }

    /////////////////////////////////////////////////////////////////////////
    //// 查找頭部網格
    findHeadMesh(scene) {
        let headMesh = null
        
        scene.traverse((obj) => {
            if (obj.isMesh) {
                // 根據網格名稱或位置來識別頭部
                if (obj.name.toLowerCase().includes('head') || 
                    obj.name.toLowerCase().includes('face') ||
                    obj.name.toLowerCase().includes('skull') ||
                    obj.position.y > 1.5) { // 假設頭部在較高位置
                    headMesh = obj
                    console.log('找到頭部網格:', obj.name)
                }
            }
        })
        
        return headMesh
    }

    /////////////////////////////////////////////////////////////////////////
    //// 初始化音頻分析器
    initAudioAnalyzer() {
        try {
            // 創建音頻上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
            this.analyser = this.audioContext.createAnalyser()
            this.analyser.fftSize = 256
            const bufferLength = this.analyser.frequencyBinCount
            this.dataArray = new Uint8Array(bufferLength)
            
            console.log('音頻分析器初始化成功')
        } catch (error) {
            console.log('音頻分析器初始化失敗:', error)
        }
    }

    /////////////////////////////////////////////////////////////////////////
    //// 控制嘴巴動畫
    controlMouthAnimation(action, options = {}) {
        if (this.mouthAnimation) {
            switch(action) {
                case 'start':
                    this.mouthAnimation.play()
                    this.isPlaying = true
                    console.log('開始嘴巴動畫')
                    break
                case 'stop':
                    this.mouthAnimation.stop()
                    this.isPlaying = false
                    console.log('停止嘴巴動畫')
                    break
                case 'pause':
                    this.mouthAnimation.paused = true
                    console.log('暫停嘴巴動畫')
                    break
                case 'resume':
                    this.mouthAnimation.paused = false
                    console.log('恢復嘴巴動畫')
                    break
                case 'setSpeed':
                    if (options.speed) {
                        this.animationSpeed = options.speed
                        this.mouthAnimation.timeScale = this.animationSpeed
                        console.log('設置動畫速度:', this.animationSpeed)
                    }
                    break
                case 'setIntensity':
                    if (options.intensity && this.mixer) {
                        // 調整動畫強度
                        this.mouthAnimation.weight = options.intensity
                        console.log('設置動畫強度:', options.intensity)
                    }
                    break
            }
        }
    }

    /////////////////////////////////////////////////////////////////////////
    //// 更新動畫
    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime)
        }
        
        // 如果有音頻分析器，可以根據音頻數據調整動畫
        if (this.analyser && this.dataArray) {
            this.updateAudioBasedAnimation()
        }
    }

    /////////////////////////////////////////////////////////////////////////
    //// 基於音頻的動畫更新
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

    /////////////////////////////////////////////////////////////////////////
    //// 設置女神特定的動畫參數
    setGoddessAnimation(goddessName) {
        this.currentGoddess = goddessName
        
        // 根據不同女神設置不同的動畫參數
        switch(goddessName) {
            case 'aglaea':
                // 優雅女神 - 較慢、較輕的動畫
                this.controlMouthAnimation('setSpeed', { speed: 0.8 })
                this.controlMouthAnimation('setIntensity', { intensity: 0.7 })
                break
            case 'thalia':
                // 歡樂女神 - 較快、較活潑的動畫
                this.controlMouthAnimation('setSpeed', { speed: 1.2 })
                this.controlMouthAnimation('setIntensity', { intensity: 1.0 })
                break
            case 'euphrosyne':
                // 歡欣女神 - 中等速度、中等強度
                this.controlMouthAnimation('setSpeed', { speed: 1.0 })
                this.controlMouthAnimation('setIntensity', { intensity: 0.8 })
                break
        }
        
        console.log('設置女神動畫參數:', goddessName)
    }

    /////////////////////////////////////////////////////////////////////////
    //// 清理資源
    dispose() {
        if (this.mixer) {
            this.mixer.stopAllAction()
            this.mixer.uncacheRoot(this.mixer.getRoot())
        }
        
        if (this.audioContext) {
            this.audioContext.close()
        }
        
        console.log('嘴巴動畫系統已清理')
    }
} 