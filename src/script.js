/////////////////////////////////////////////////////////////////////////
///// 導入模組
import './main.css'
// 導入 Three.js 核心模組
import { Clock, Scene, LoadingManager, WebGLRenderer, sRGBEncoding, Group, PerspectiveCamera, DirectionalLight, PointLight, MeshPhongMaterial, AnimationMixer, LoopRepeat, NumberKeyframeTrack, AnimationClip } from 'three'
// 導入 TWEEN.js 用於動畫
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
// 導入 DRACO 解碼器用於載入壓縮的 3D 模型
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
// 導入 GLTF 載入器用於載入 3D 模型
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// 導入嘴巴動畫系統
import { MouthAnimationSystem } from './mouthAnimation.js'

// --- 粒子波浪網格背景 ---
import { BufferGeometry, BufferAttribute, Points, PointsMaterial, Color, CanvasTexture } from 'three'

// 粒子波浪參數
const GRID_WIDTH = 60
const GRID_HEIGHT = 30
const GRID_SEG_X = 160
const GRID_SEG_Y = 60
const GRID_AMPLITUDE = 1.5
const GRID_SPEED = 1.1
const GRID_BG_Z = -6 // 女神後方

let gridPoints, gridPositions

function createCircleTexture() {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, size, size)
    ctx.beginPath()
    ctx.arc(size/2, size/2, size/2-2, 0, Math.PI*2)
    ctx.closePath()
    ctx.fillStyle = 'white'
    ctx.shadowColor = 'white'
    ctx.shadowBlur = 8
    ctx.fill()
    return new CanvasTexture(canvas)
}

// --- 修改 createGridParticles 與 updateGridParticles 讓顏色更科技感 ---
function createGridParticles() {
    const geometry = new BufferGeometry()
    const positions = []
    const colors = []
    for (let y = 0; y < GRID_SEG_Y; y++) {
        for (let x = 0; x < GRID_SEG_X; x++) {
            const px = (x / (GRID_SEG_X-1) - 0.5) * GRID_WIDTH
            const py = (y / (GRID_SEG_Y-1) - 0.5) * GRID_HEIGHT
            const pz = 0
            positions.push(px, py, pz)
            // x/y 雙軸漸層 + 初始色彩
            const tX = x / (GRID_SEG_X-1)
            const tY = y / (GRID_SEG_Y-1)
            // HSL: 0.58~0.75 (藍~紫~青)
            const h = 0.58 + 0.17 * tX - 0.08 * tY
            const s = 1.0
            // --- 亮度調高 ---
            const l = 0.7 + 0.22 * tY
            const color = new Color().setHSL(h, s, l)
            colors.push(color.r, color.g, color.b)
        }
    }
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
    gridPositions = geometry.attributes.position
    // --- 粒子更小、更亮、更科技感 ---
    // 在 createGridParticles 內 PointsMaterial size 改為 0.12
    const material = new PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        alphaTest: 0.18,
        map: createCircleTexture()
    })
    material.map.needsUpdate = true
    const points = new Points(geometry, material)
    points.position.z = GRID_BG_Z
    points.renderOrder = -1 // 確保在背景
    return points
}

function updateGridParticles(time) {
    const colors = gridPoints.geometry.attributes.color
    for (let y = 0; y < GRID_SEG_Y; y++) {
        for (let x = 0; x < GRID_SEG_X; x++) {
            const i = y * GRID_SEG_X + x
            // 疊加正弦波，讓波浪有層次
            const wave = Math.sin(time * GRID_SPEED + x * 0.22 + y * 0.5) * GRID_AMPLITUDE
            gridPositions.setZ(i, wave)
            // 動態色彩：根據 z 高度調整色相與亮度
            const tX = x / (GRID_SEG_X-1)
            const tY = y / (GRID_SEG_Y-1)
            // 在 updateGridParticles 內 l = 0.8 + 0.18 * tY + 0.18 * Math.sin(wave + time)
            const l = 0.8 + 0.18 * tY + 0.18 * Math.sin(wave + time)
            // h = 0.58 + 0.20 * tX - 0.08 * tY ...
            const h = 0.58 + 0.20 * tX - 0.08 * tY + 0.10 * Math.sin(wave + time)
            const s = 1.0
            // --- 亮度調高 ---
            const color = new Color().setHSL(h, s, l)
            colors.setX(i, color.r)
            colors.setY(i, color.g)
            colors.setZ(i, color.b)
        }
    }
    gridPositions.needsUpdate = true
    colors.needsUpdate = true
}

/////////////////////////////////////////////////////////////////////////
//// 載入管理器設置
// 獲取載入動畫元素
const ftsLoader = document.querySelector(".lds-roller")
// 獲取載入文字覆蓋層
const looadingCover = document.getElementById("loading-text-intro")
// 創建載入管理器來處理資源載入
const loadingManager = new LoadingManager()

// 當所有資源載入完成時的回調函數
loadingManager.onLoad = function() {
    // 顯示主容器
    document.querySelector(".main-container").style.visibility = 'visible'
    // 恢復頁面滾動
    document.querySelector("body").style.overflow = 'auto'

    // 創建載入覆蓋層的淡出動畫
    const yPosition = {y: 0}
    
    // 使用 TWEEN 創建向上移動的動畫，持續 900ms
    new TWEEN.Tween(yPosition).to({y: 100}, 900).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onUpdate(function(){ 
        // 更新覆蓋層位置
        looadingCover.style.setProperty('transform', `translate( 0, ${yPosition.y}%)`)
    })
    .onComplete(function () {
        // 動畫完成後移除覆蓋層並清理 TWEEN
        looadingCover.parentNode.removeChild(document.getElementById("loading-text-intro")); 
        TWEEN.remove(this)
    })

    // 開始介紹動畫
    introAnimation()
    // 移除載入動畫元素
    ftsLoader.parentNode.removeChild(ftsLoader)

    // 滾動到頁面頂部
    window.scroll(0, 0)
}

/////////////////////////////////////////////////////////////////////////
//// DRACO 載入器設置 - 用於載入從 Blender 壓縮的模型
const dracoLoader = new DRACOLoader()
// 設置 DRACO 解碼器路徑
dracoLoader.setDecoderPath('/draco/')
// 設置解碼器配置為 JavaScript 模式
dracoLoader.setDecoderConfig({ type: 'js' })
// 創建 GLTF 載入器並設置 DRACO 載入器
const loader = new GLTFLoader(loadingManager)
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// 創建容器來容納 Three.js 體驗
// 主畫布容器
const container = document.getElementById('canvas-container')

/////////////////////////////////////////////////////////////////////////
///// 全局變數
let oldMaterial // 儲存原始材質
let width = container.clientWidth // 容器寬度
let height = container.clientHeight // 容器高度

// 動畫相關變數
let mouthAnimationSystem // 嘴巴動畫系統
let currentGoddess = 'aglaea' // 當前選中的女神

/////////////////////////////////////////////////////////////////////////
///// 場景創建
const scene = new Scene()

gridPoints = createGridParticles()
scene.add(gridPoints)

/////////////////////////////////////////////////////////////////////////
///// 渲染器配置
// 主渲染器 - 用於背景 3D 場景
const renderer = new WebGLRenderer({ 
    antialias: true, // 抗鋸齒
    alpha: true, // 透明背景
    powerPreference: "high-performance" // 高性能模式
})
renderer.autoClear = true // 自動清除
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)) // 設置像素比
renderer.setSize( width, height) // 設置尺寸
renderer.outputEncoding = sRGBEncoding // 設置輸出編碼
container.appendChild(renderer.domElement) // 添加到容器



/////////////////////////////////////////////////////////////////////////
///// 相機配置
// 相機群組 - 用於視差效果
const cameraGroup = new Group()
scene.add(cameraGroup)

// 主相機 - 用於背景場景
const camera = new PerspectiveCamera(35, width / height, 1, 100)
camera.position.set(19,1.54,-0.1)
cameraGroup.add(camera)



/////////////////////////////////////////////////////////////////////////
///// 響應式設計 - 處理視窗大小變化
window.addEventListener('resize', () => {
    // 更新主相機寬高比
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()

    // 更新渲染器尺寸
    renderer.setSize(container.clientWidth, container.clientHeight)

    // 更新像素比
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
})

/////////////////////////////////////////////////////////////////////////
///// 場景燈光設置
// 太陽光 - 方向光，提供主要照明
const sunLight = new DirectionalLight(0x435c72, 0.08)
sunLight.position.set(-100,0,-100)
scene.add(sunLight)

// 填充光 - 點光源，提供局部照明
const fillLight = new PointLight(0x88b2d9, 2.7, 4, 3)
fillLight.position.set(30,3,1.8)
scene.add(fillLight)

/////////////////////////////////////////////////////////////////////////
///// 載入 GLB/GLTF 模型
loader.load('models/gltf/graces-draco2.glb', function (gltf) {
    // 遍歷模型中的所有網格
    gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
            // 儲存原始材質
            oldMaterial = obj.material
            // 替換為新的 Phong 材質，增加光澤度
            obj.material = new MeshPhongMaterial({
                shininess: 45 
            })
        }
    })
    
    // 將模型添加到場景
    scene.add(gltf.scene)
    
    // 初始化嘴巴動畫系統
    mouthAnimationSystem = new MouthAnimationSystem()
    mouthAnimationSystem.initAnimationSystem(gltf)
    
    // 清理場景
    clearScene()
})

// 清理函數 - 釋放記憶體
function clearScene(){
    oldMaterial.dispose() // 釋放原始材質
    renderer.renderLists.dispose() // 釋放渲染列表
}



/////////////////////////////////////////////////////////////////////////
//// 介紹動畫 - 使用 TWEEN 實現相機動畫
function introAnimation() {
    // 創建相機從初始位置到目標位置的動畫
    new TWEEN.Tween(camera.position.set(0,4,2.7)).to({ x: 0, y: 2.4, z: 8.8}, 3500).easing(TWEEN.Easing.Quadratic.InOut).start()
    .onComplete(function () {
        // 動畫完成後清理 TWEEN 並添加 CSS 類
        TWEEN.remove(this)
        document.querySelector('.header').classList.add('ended')
        
        // 開始嘴巴動畫
        if (mouthAnimationSystem) {
            mouthAnimationSystem.controlMouthAnimation('start')
        }
    })
}



/////////////////////////////////////////////////////////////////////////
//// 視差效果配置
const cursor = {x:0, y:0} // 滑鼠位置
const clock = new Clock() // 時鐘用於計算時間差
let previousTime = 0 // 前一幀時間

/////////////////////////////////////////////////////////////////////////
//// 渲染循環函數 - 主要的動畫循環
function rendeLoop() {
    // 更新 TWEEN 動畫
    TWEEN.update()
    
    // 更新動畫混合器
    if (mouthAnimationSystem) {
        const deltaTime = clock.getDelta()
        mouthAnimationSystem.update(deltaTime)
    }

    // 渲染場景
    renderer.render(scene, camera)

    // 計算時間差
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // 視差效果 - 燈光位置跟隨滑鼠移動
    const parallaxY = cursor.y
    fillLight.position.y -= ( parallaxY *9 + fillLight.position.y -2) * deltaTime

    const parallaxX = cursor.x
    fillLight.position.x += (parallaxX *8 - fillLight.position.x) * 2 * deltaTime

    // 視差效果 - 相機群組位置跟隨滑鼠移動
    cameraGroup.position.z -= (parallaxY/3 + cameraGroup.position.z) * 2 * deltaTime
    cameraGroup.position.x += (parallaxX/3 - cameraGroup.position.x) * 2 * deltaTime

    // 更新粒子網格
    updateGridParticles(elapsedTime)

    // 請求下一幀
    requestAnimationFrame(rendeLoop)
}

// 開始渲染循環
rendeLoop()

//////////////////////////////////////////////////
//// 滑鼠移動事件 - 獲取滑鼠位置用於視差效果
document.addEventListener('mousemove', (event) => {
    event.preventDefault()

    // 計算標準化的滑鼠位置 (-0.5 到 0.5)
    cursor.x = event.clientX / window.innerWidth -0.5
    cursor.y = event.clientY / window.innerHeight -0.5

    // 處理自定義游標
    handleCursor(event)
}, false)



//////////////////////////////////////////////////
//// 自定義游標跟隨 - 簡化版（無按鈕）
const customCursor = document.querySelector('.cursor')

// 處理自定義游標位置
const handleCursor = (e) => {
    const x = e.clientX
    const y =  e.clientY
    customCursor.style.cssText =`left: ${x}px; top: ${y}px;`
}

document.addEventListener('mousemove', handleCursor)

/////////////////////////////////////////////////////////////////////////
//// 禁止滾輪事件
document.addEventListener('wheel', (event) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
}, { passive: false });

document.addEventListener('touchmove', (event) => {
    event.preventDefault();
    event.stopPropagation();
    return false;
}, { passive: false });

document.addEventListener('keydown', (event) => {
    // 禁止方向鍵和 Page Up/Down 滾動
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', 'Space'].includes(event.key)) {
        event.preventDefault();
        return false;
    }
});

/////////////////////////////////////////////////////////////////////////
//// 信箱驗證和提交功能
const emailForm = document.getElementById('email-form')
const emailInput = document.getElementById('email-input')
const emailMessage = document.getElementById('email-message')

// 驗證信箱格式
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@ilitek\.com$/
    return emailRegex.test(email)
}

// 顯示訊息
function showMessage(message, type = 'info') {
    emailMessage.textContent = message
    emailMessage.className = `email-message ${type}`
    
    // 3秒後自動清除訊息
    setTimeout(() => {
        emailMessage.textContent = ''
        emailMessage.className = 'email-message'
    }, 3000)
}

// 處理表單提交
emailForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    const email = emailInput.value.trim()
    
    if (!email) {
        showMessage('請輸入信箱地址', 'error')
        return
    }
    
    if (!validateEmail(email)) {
        showMessage('請輸入有效的 @ilitek.com 信箱', 'error')
        return
    }
    
    // 模擬提交過程
    showMessage('正在處理...', 'info')
    
    // 模擬 API 調用
    setTimeout(() => {
        showMessage('訂閱成功！感謝您的加入', 'success')
        emailInput.value = ''
    }, 1500)
})

// 即時驗證
emailInput.addEventListener('input', (e) => {
    const email = e.target.value.trim()
    
    if (email && !validateEmail(email)) {
        emailInput.style.borderColor = 'rgba(244, 67, 54, 0.5)'
    } else {
        emailInput.style.borderColor = 'rgba(255, 255, 255, 0.2)'
    }
})

/////////////////////////////////////////////////////////////////////////
//// 鍵盤控制 - 用於測試嘴巴動畫
document.addEventListener('keydown', (event) => {
    if (!mouthAnimationSystem) return
    
    switch(event.key) {
        case '1':
            mouthAnimationSystem.controlMouthAnimation('start')
            console.log('按鍵 1: 開始嘴巴動畫')
            break
        case '2':
            mouthAnimationSystem.controlMouthAnimation('stop')
            console.log('按鍵 2: 停止嘴巴動畫')
            break
        case '3':
            mouthAnimationSystem.controlMouthAnimation('pause')
            console.log('按鍵 3: 暫停嘴巴動畫')
            break
        case '4':
            mouthAnimationSystem.controlMouthAnimation('resume')
            console.log('按鍵 4: 恢復嘴巴動畫')
            break
        case '5':
            mouthAnimationSystem.controlMouthAnimation('setSpeed', { speed: 0.5 })
            console.log('按鍵 5: 設置慢速動畫')
            break
        case '6':
            mouthAnimationSystem.controlMouthAnimation('setSpeed', { speed: 2.0 })
            console.log('按鍵 6: 設置快速動畫')
            break
        case '7':
            mouthAnimationSystem.controlMouthAnimation('setIntensity', { intensity: 0.5 })
            console.log('按鍵 7: 設置低強度動畫')
            break
        case '8':
            mouthAnimationSystem.controlMouthAnimation('setIntensity', { intensity: 1.0 })
            console.log('按鍵 8: 設置高強度動畫')
            break
    }
})