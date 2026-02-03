# PerfectPixel GUI

基于 Web 的 [Perfect Pixel](https://github.com/theamusing/perfectPixel) 库图形用户界面，通过直观的浏览器界面提供自动网格检测和像素画优化功能。

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)
![许可证](https://img.shields.io/badge/license-MIT-green.svg)

## 概述

本项目为优秀的 Perfect Pixel 库（由 [theamusing](https://github.com/theamusing) 开发）提供了一个用户友好的 Web 界面。Perfect Pixel 能够自动检测像素风格图像中的最优网格，并提供完美对齐的像素级优化结果。本 GUI 通过可视化界面让用户无需编写 Python 代码即可使用该库。

**Perfect Pixel 原版仓库**：https://github.com/theamusing/perfectPixel

## 功能特性

### Perfect Pixel 核心功能

- 自动从像素风格图像中检测网格尺寸
- 优化 AI 生成的像素画至完美对齐的网格
- 多种采样方法（中心点、中位数、众数）
- 手动网格尺寸覆盖选项
- 可调强度的网格线优化

### Web GUI 增强功能

- **直观界面**：拖放图像上传与实时预览
- **参数控制**：所有算法参数的交互式滑块
- **视觉反馈**：原始图与处理结果的并排对比
- **缩放控制**：交互式缩放（1-16倍）和平移功能，便于详细检查
- **调试模式**：可视化显示检测到的网格，便于故障排查
- **多语言支持**：英文和中文界面
- **响应式设计**：适用于桌面和移动设备
- **直接下载**：一键下载处理后的图像

## 项目结构

```
PerfectPixel_GUI/
├── perfectPixel/           # 原版 Perfect Pixel 库（从 GitHub 克隆）
│   ├── src/               # 库源代码
│   ├── example.py         # 使用示例
│   └── README.md          # 原版文档
└── web_app/               # Flask Web 应用程序
    ├── app.py            # 主 Flask 应用程序
    ├── requirements.txt  # Python 依赖包
    ├── templates/
    │   └── index.html    # 主 HTML 界面
    ├── static/
    │   ├── css/          # 自定义样式
    │   └── js/           # 前端 JavaScript
    ├── locales/          # 翻译文件
    ├── uploads/          # 临时图像存储
    └── run.bat/run.sh    # 平台特定启动脚本
```

## 安装

### 前提条件

- Python 3.8 或更高版本
- Git（用于克隆仓库）

### 逐步设置

1. **克隆或下载本仓库**
   
   ```bash
   git clone <仓库地址>
   cd PerfectPixel_GUI
   ```

2. **设置 Web 应用程序**
   
   ```bash
   cd web_app
   ```

3. **安装依赖包**
   
   ```bash
   pip install -r requirements.txt
   ```
   
   这将安装：
   
   - Flask Web 框架
   - Pillow 图像处理库
   - NumPy 数值运算库
   - Matplotlib 调试可视化库
   - OpenCV-Python 图像操作库
   - 本地 Perfect Pixel 库（可编辑模式）

4. **验证安装**
   
   ```bash
   python app.py
   ```
   
   您应该看到输出表明 Flask 服务器正在 `http://127.0.0.1:5000` 运行

## 使用方法

### 启动应用程序

**选项 1：直接使用 Python**

```bash
cd web_app
python app.py
```

**选项 2：使用平台特定脚本**

- Windows：双击 `run.bat` 或在命令行中运行
- Linux/Mac：运行 `./run.sh` 或 `bash run.sh`

**选项 3：手动启动服务器**

```bash
cd web_app
python app.py
```

### 使用 Web 界面

1. **打开浏览器**访问 `http://127.0.0.1:5000`
2. **上传图像**：通过拖放或点击浏览选择文件
3. **调整参数**（可选）：
   - **采样方法**：选择从每个网格单元采样颜色的方式
   - **最小像素尺寸**：最小有效像素尺寸（4-20）
   - **峰值宽度**：检测的最小峰值宽度（1-20）
   - **优化强度**：网格线优化强度（0-0.5）
   - **正方形修正**：强制接近正方形的图像输出为正方形
   - **调试模式**：显示网格可视化叠加层
4. **点击"处理图像"**运行算法
5. **检查结果**：使用缩放和平移控制
6. **下载**处理后的图像

### 支持的图像格式

- PNG、JPG/JPEG、BMP、GIF、TIFF
- 最大文件大小：16MB
- 推荐：像素画图像（512-1024 像素）

## API 参考（Web 界面）

Web 应用程序提供以下 REST 端点：

| 端点                | 方法   | 描述                           |
| ----------------- | ---- | ---------------------------- |
| `/`               | GET  | 主 Web 界面                     |
| `/upload`         | POST | 上传图像（multipart/form-data 格式） |
| `/process`        | POST | 使用参数处理图像（JSON 格式）            |
| `/download/<文件名>` | GET  | 下载处理后的图像                     |
| `/cleanup`        | POST | 清理上传的图像（可选）                  |
| `/set_language`   | POST | 设置界面语言                       |

## 开发说明

### 与 Perfect Pixel 的集成

Web 应用程序使用可编辑安装方式导入本地 `perfect-pixel` 库（`-e ../perfectPixel`）。这允许：

- 直接访问库的 `get_perfect_pixel` 函数
- 通过猴子补丁修改内部函数以实现调试可视化
- 原版库更新时轻松更新

### 图像处理流程

1. **上传**：图像转换为 OpenCV 格式并按 MD5 哈希文件名存储
2. **处理**：Perfect Pixel 算法检测网格并优化图像
3. **调试捕获**：如果启用调试模式，通过猴子补丁函数捕获网格可视化
4. **输出**：处理后的图像保存并可供下载

### 本地化

界面通过 `web_app/locales/` 中的 JSON 翻译文件支持多语言：

- `en.json`：英文翻译
- `zh.json`：中文翻译

用户可以通过界面切换语言；偏好设置保存在 Cookie 中。

## 故障排除

### 常见问题

**ImportError: 无法导入名称 'get_perfect_pixel'**

- 确保您在 `web_app` 目录中
- 验证父目录中存在 `perfectPixel` 文件夹
- 检查 `pip install -r requirements.txt` 是否成功完成

**服务器无法在端口 5000 启动**

- 可能有其他应用程序正在使用该端口
- 尝试在 `app.py` 中更改端口：`app.run(port=5001)`

**图像上传失败**

- 检查文件大小（最大 16MB）
- 验证图像格式受支持
- 确保 uploads 文件夹存在且可写

## 📄许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

Perfect Pixel 库（位于 `perfectPixel/` 目录）同样采用 MIT 许可证，由原作者 [theamusing](https://github.com/theamusing) 授权。

## 🙏致谢

- **theamusing** 创建了优秀的 [Perfect Pixel](https://github.com/theamusing/perfectPixel) 库
- Flask 社区提供 Web 框架
- Bootstrap 提供响应式 UI 组件
- 本项目使用的所有开源库

## 🤝贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建功能分支
3. 进行更改
4. 彻底测试
5. 提交 pull request

## 📧 提交Issues

此项目部分代码使用AI Coder辅助开发，问题仍然存在。

如有问题，请在GitHub Issues中提交。

---

**注意**：这是 Perfect Pixel 库的第三方 GUI 界面。核心算法和库由 [theamusing](https://github.com/theamusing/perfectPixel) 开发维护。
