const fs = require('fs');
const path = require('path');

// 需要修改的HTML文件目录
const directoryPath = path.join(__dirname, 'prototype', 'pages');
console.log(`扫描目录: ${directoryPath}`);

// 要添加的CSS样式
const cssToAdd = `
<style>
/* 隐藏所有滚动条 */
::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
}

* {
    scrollbar-width: none !important; /* Firefox */
    -ms-overflow-style: none !important; /* IE and Edge */
}

html, body {
    overflow-y: auto;
    overflow-x: hidden;
}

/* 针对常见容器元素隐藏滚动条 */
div, section, main, article, aside, nav, 
.container, .content, .wrapper, .section, 
.content-container, .achievements-list,
.history-list, .moments-container, .chat-container,
.profile-container, .comments-section {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
}

/* 允许滚动但隐藏滚动条的元素 */
.scrollable {
    overflow-y: auto !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
}

.scrollable::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
    display: none !important;
}
</style>
`;

try {
    // 同步读取目录
    const files = fs.readdirSync(directoryPath);
    console.log(`找到 ${files.length} 个文件`);
    
    // 记录统计信息
    let processed = 0;
    let skipped = 0;
    let modified = 0;
    let errors = 0;
    
    // 处理每个HTML文件
    files.forEach(function (file) {
        if (path.extname(file) === '.html') {
            console.log(`处理文件: ${file}`);
            const filePath = path.join(directoryPath, file);
            
            try {
                // 同步读取文件内容
                const data = fs.readFileSync(filePath, 'utf8');
                processed++;
                
                // 检查文件是否已包含隐藏滚动条的样式
                if (data.includes('scrollbar-width: none') && 
                    data.includes('-ms-overflow-style: none')) {
                    console.log(`文件 ${file} 已包含隐藏滚动条样式，跳过`);
                    skipped++;
                    return;
                }
                
                let modifiedContent;
                
                // 在</head>标签之前插入样式
                if (data.includes('</head>')) {
                    modifiedContent = data.replace('</head>', cssToAdd + '</head>');
                    console.log(`在 ${file} 的</head>之前插入样式`);
                } 
                // 如果没有</head>标签，在<body>标签之后插入
                else if (data.includes('<body>')) {
                    modifiedContent = data.replace('<body>', '<body>' + cssToAdd);
                    console.log(`在 ${file} 的<body>之后插入样式`);
                }
                // 如果都没有，插入到文件开头
                else {
                    modifiedContent = cssToAdd + data;
                    console.log(`在 ${file} 的开头插入样式`);
                }
                
                // 写入修改后的内容
                fs.writeFileSync(filePath, modifiedContent, 'utf8');
                console.log(`成功修改文件 ${file}`);
                modified++;
            } catch (err) {
                console.error(`处理文件 ${file} 时出错:`, err);
                errors++;
            }
        }
    });
    
    console.log('\n===== 处理结果统计 =====');
    console.log(`处理的HTML文件总数: ${processed}`);
    console.log(`跳过的文件数(已有样式): ${skipped}`);
    console.log(`成功修改的文件数: ${modified}`);
    console.log(`出错的文件数: ${errors}`);
    
} catch (err) {
    console.error('读取目录时出错:', err);
} 