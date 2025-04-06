document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const textInput = document.getElementById('textInput');
    const fontSizeInput = document.getElementById('fontSize');
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    const fontFamilySelect = document.getElementById('fontFamily');
    const textColorInput = document.getElementById('textColor');
    const bgColorInput = document.getElementById('bgColor');
    const generateBtn = document.getElementById('generateBtn');
    
    // 先不获取downloadBtn，因为我们会在后面重新创建它
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设备像素比
    const dpr = window.devicePixelRatio || 1;
    
    // 分辨率调整
    let resolutionMultiplier = 2; // 默认2倍分辨率
    
    // 添加自定义宽度和高度的控件
    const controlsDiv = document.querySelector('.controls');
    
    // 添加宽度输入
    const widthDiv = document.createElement('div');
    widthDiv.className = 'control-group';
    widthDiv.innerHTML = `
        <label for="canvasWidth">图片宽度 (px):</label>
        <input type="number" id="canvasWidth" min="100" max="2000" value="600">
        <span id="widthAutoCheckbox">
            <input type="checkbox" id="autoWidth" checked>
            <label for="autoWidth">自动</label>
        </span>
    `;
    controlsDiv.appendChild(widthDiv);
    
    // 添加高度输入
    const heightDiv = document.createElement('div');
    heightDiv.className = 'control-group';
    heightDiv.innerHTML = `
        <label for="canvasHeight">图片高度 (px):</label>
        <input type="number" id="canvasHeight" min="100" max="2000" value="300">
        <span id="heightAutoCheckbox">
            <input type="checkbox" id="autoHeight" checked>
            <label for="autoHeight">自动</label>
        </span>
    `;
    controlsDiv.appendChild(heightDiv);
    
    // 获取自定义尺寸控件
    const canvasWidthInput = document.getElementById('canvasWidth');
    const canvasHeightInput = document.getElementById('canvasHeight');
    const autoWidthCheckbox = document.getElementById('autoWidth');
    const autoHeightCheckbox = document.getElementById('autoHeight');
    
    // 当选中自动宽度时禁用宽度输入
    autoWidthCheckbox.addEventListener('change', function() {
        canvasWidthInput.disabled = this.checked;
    });
    
    // 当选中自动高度时禁用高度输入
    autoHeightCheckbox.addEventListener('change', function() {
        canvasHeightInput.disabled = this.checked;
    });
    
    // 初始状态下禁用宽度和高度输入框
    canvasWidthInput.disabled = autoWidthCheckbox.checked;
    canvasHeightInput.disabled = autoHeightCheckbox.checked;

    // 更新字体大小显示
    fontSizeInput.addEventListener('input', function() {
        fontSizeDisplay.textContent = `${this.value}px`;
    });

    // 添加分辨率选择控件到DOM
    const resolutionDiv = document.createElement('div');
    resolutionDiv.className = 'control-group';
    resolutionDiv.innerHTML = `
        <label for="resolution">图片分辨率:</label>
        <select id="resolution">
            <option value="1">标准 (1x)</option>
            <option value="2" selected>高清 (2x)</option>
            <option value="4">超高清 (4x)</option>
        </select>
    `;
    controlsDiv.appendChild(resolutionDiv);

    // 获取分辨率选择器
    const resolutionSelect = document.getElementById('resolution');
    
    // 分辨率变化监听
    resolutionSelect.addEventListener('change', function() {
        resolutionMultiplier = parseFloat(this.value);
    });

    // 添加文件名输入框到下载控件
    const downloadControls = document.querySelector('.download-controls');
    
    // 清除现有内容并添加新的结构
    downloadControls.innerHTML = `
        <div class="filename-input">
            <input type="text" id="filenameInput" placeholder="请输入文件名" value="">
            <span class="file-extension">.png</span>
        </div>
        <button id="downloadBtn" disabled>下载图片</button>
    `;
    
    // 在界面构建完成后获取下载按钮
    const downloadBtn = document.getElementById('downloadBtn');
    const filenameInput = document.getElementById('filenameInput');

    // 生成图片按钮点击事件
    generateBtn.addEventListener('click', function() {
        const text = textInput.value.trim();
        if (!text) {
            alert('请输入要转换的文字');
            return;
        }
        
        generateImage(text);
        
        // 确保下载按钮可用
        downloadBtn.disabled = false;
    });

    // 下载图片按钮点击事件
    downloadBtn.addEventListener('click', function() {
        // 检查按钮是否已启用
        if (this.disabled) {
            console.log('下载按钮被禁用，无法点击');
            return;
        }
        
        // 获取用户输入的文件名
        let filename = filenameInput.value.trim();
        
        // 如果用户没有输入文件名，使用默认名称
        if (!filename) {
            filename = "图片";
            filenameInput.value = filename;
        }
        
        // 创建临时高分辨率画布用于导出
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        
        // 获取当前画布尺寸
        const width = canvas.width / dpr; // 移除dpr因子获取逻辑宽度
        const height = canvas.height / dpr; // 移除dpr因子获取逻辑高度
        
        // 设置导出画布尺寸为当前画布的分辨率倍数
        exportCanvas.width = width * resolutionMultiplier;
        exportCanvas.height = height * resolutionMultiplier;
        
        // 复制当前画布内容到导出画布，放大到指定分辨率
        // 获取用户选择的样式
        const fontSize = parseInt(fontSizeInput.value) * resolutionMultiplier;
        const fontFamily = fontFamilySelect.value;
        const textColor = textColorInput.value;
        const bgColor = bgColorInput.value;
        const padding = 20 * resolutionMultiplier;
        const lineHeight = fontSize * 1.5;
        
        // 绘制背景
        exportCtx.fillStyle = bgColor;
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        
        // 设置字体
        exportCtx.font = `${fontSize}px ${fontFamily}`;
        exportCtx.textBaseline = 'middle';
        exportCtx.fillStyle = textColor;
        
        // 获取并重新绘制文本 - 以更高分辨率
        const text = textInput.value.trim();
        const lines = getTextLines(text, ctx, width - 40);
        
        lines.forEach((line, index) => {
            const y = padding + index * lineHeight + lineHeight / 2;
            exportCtx.fillText(line, padding, y);
        });
        
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        
        // 使用高质量导出选项
        link.href = exportCanvas.toDataURL('image/png', 1.0);
        link.click();
    });

    // 生成图片函数
    function generateImage(text) {
        // 获取用户选择的样式
        const fontSize = parseInt(fontSizeInput.value);
        const fontFamily = fontFamilySelect.value;
        const textColor = textColorInput.value;
        const bgColor = bgColorInput.value;

        // 设置字体样式以便测量文本
        ctx.font = `${fontSize}px ${fontFamily}`;
        
        // 分割文本为多行
        const lines = getTextLines(text, ctx, parseInt(canvasWidthInput.value) - 40);
        
        // 计算画布高度
        const lineHeight = fontSize * 1.5;
        const padding = 20;
        
        // 根据用户选择确定画布宽度和高度
        let canvasWidth, canvasHeight;
        
        if (autoWidthCheckbox.checked) {
            // 自动宽度 - 根据文本计算
            canvasWidth = Math.min(2000, Math.max(100, getMaxLineWidth(lines, ctx) + padding * 2));
        } else {
            // 用户自定义宽度
            canvasWidth = parseInt(canvasWidthInput.value);
        }
        
        if (autoHeightCheckbox.checked) {
            // 自动高度 - 根据文本行数计算
            canvasHeight = lines.length * lineHeight + padding * 2;
        } else {
            // 用户自定义高度
            canvasHeight = parseInt(canvasHeightInput.value);
        }
        
        // 更新自定义宽度和高度输入框的值
        canvasWidthInput.value = canvasWidth;
        canvasHeightInput.value = canvasHeight;
        
        // 应用设备像素比以提高显示清晰度
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        
        // 根据设备像素比缩放上下文
        ctx.scale(dpr, dpr);
        
        // 重新设置字体，因为画布尺寸改变后字体设置会被重置
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'middle';
        
        // 绘制背景
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight); // 使用逻辑尺寸绘制
        
        // 绘制文本
        ctx.fillStyle = textColor;
        lines.forEach((line, index) => {
            const y = padding + index * lineHeight + lineHeight / 2;
            ctx.fillText(line, padding, y);
        });
    }

    // 计算文本行
    function getTextLines(text, ctx, maxWidth) {
        const words = text.split('');
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            const char = words[i];
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }

            // 如果是换行符，则强制换行
            if (char === '\n') {
                lines.push(currentLine.substring(0, currentLine.length - 1));
                currentLine = '';
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    // 获取最长行的宽度
    function getMaxLineWidth(lines, ctx) {
        let maxWidth = 0;
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            const lineWidth = metrics.width;
            maxWidth = Math.max(maxWidth, lineWidth);
        });
        return maxWidth;
    }

    // 初始预览
    const initialWidth = 600;
    const initialHeight = 300;
    
    // 设置初始画布尺寸，考虑设备像素比
    canvas.style.width = initialWidth + 'px';
    canvas.style.height = initialHeight + 'px';
    canvas.width = initialWidth * dpr;
    canvas.height = initialHeight * dpr;
    
    // 缩放上下文以适应设备像素比
    ctx.scale(dpr, dpr);
    
    ctx.fillStyle = bgColorInput.value;
    ctx.fillRect(0, 0, initialWidth, initialHeight);
    ctx.fillStyle = '#888';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('点击「生成图片」按钮预览效果', initialWidth / 2, initialHeight / 2);
});