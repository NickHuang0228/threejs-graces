// 導入必要的 Webpack 插件
const CopyWebpackPlugin = require('copy-webpack-plugin') // 複製靜態資源
const HtmlWebpackPlugin = require('html-webpack-plugin') // 生成 HTML 文件
const MiniCSSExtractPlugin = require('mini-css-extract-plugin') // 提取 CSS 到單獨文件
const path = require('path') // Node.js 路徑模組

module.exports = {
    // 入口文件配置
    entry: path.resolve(__dirname, '../src/script.js'),
    
    // 輸出配置
    output: {
        hashFunction: 'xxhash64', // 使用 xxhash64 作為哈希函數，提高性能
        filename: 'bundle.[contenthash].js', // 輸出文件名，包含內容哈希
        path: path.resolve(__dirname, '../dist') // 輸出目錄
    },
    
    // 開發工具配置
    devtool: 'source-map', // 生成源碼映射，便於調試
    
    // 插件配置
    plugins: [
        // 複製靜態資源插件
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static') } // 複製 static 目錄到輸出目錄
            ]
        }),
        
        // HTML 生成插件
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'), // HTML 模板
            minify: true // 壓縮 HTML
        }),
        
        // CSS 提取插件
        new MiniCSSExtractPlugin()
    ],
    
    // 模組規則配置
    module: {
        rules: [
            // HTML 文件處理規則
            {
                test: /\.(html)$/, // 匹配 .html 文件
                use: [
                    'html-loader' // 使用 html-loader 處理 HTML 文件
                ]
            },

            // JavaScript 文件處理規則
            {
                test: /\.js$/, // 匹配 .js 文件
                exclude: /node_modules/, // 排除 node_modules 目錄
                use: [
                    'babel-loader' // 使用 babel-loader 轉換 ES6+ 語法
                ]
            },

            // CSS 文件處理規則
            {
                test: /\.css$/, // 匹配 .css 文件
                use: [
                    MiniCSSExtractPlugin.loader, // 提取 CSS 到單獨文件
                    'css-loader' // 處理 CSS 文件
                ]
            },

            // 圖片文件處理規則
            {
                test: /\.(jpg|png|gif|svg)$/, // 匹配圖片文件
                type: 'asset/resource', // 作為資源處理
                generator: {
                    filename: 'assets/images/[hash][ext]' // 輸出到 assets/images 目錄
                }
            },

            // 字體文件處理規則
            {
                test: /\.(ttf|eot|woff|woff2)$/, // 匹配字體文件
                type: 'asset/resource', // 作為資源處理
                generator: {
                    filename: 'assets/fonts/[hash][ext]' // 輸出到 assets/fonts 目錄
                }
            },

            // 著色器文件處理規則
            {
                test: /\.(glsl|vs|fs|vert|frag)$/, // 匹配著色器文件
                type: 'asset/source', // 作為源碼處理
                generator: {
                    filename: 'assets/images/[hash][ext]' // 輸出到 assets/images 目錄
                }
            }
        ]
    }
}
