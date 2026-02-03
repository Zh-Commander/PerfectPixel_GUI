# PerfectPixel 网络图形用户界面

一个基于网络的 [Perfect Pixel](https://github.com/theamusing/perfectPixel) 库图形界面，通过直观的浏览器界面提供自动网格检测和像素画优化功能。

**PerfectPixel_GUI 项目的一部分** - 此 Web 应用程序是一个更大项目的一部分，该项目包含原版 Perfect Pixel 库。完整的项目详情请参阅 [根目录 README](../README_zh.md)。

## 功能特性

- 上传图片（支持 PNG、JPG、JPEG、BMP、GIF、TIFF 格式）
- 调整 `get_perfect_pixel` API 的所有参数：
  - 采样方法（中心点、中位数、众数）
  - 手动网格尺寸覆盖（可选）
  - 最小像素尺寸滑块（4-20）
  - 峰值宽度滑块（1-20）
  - 优化强度滑块（0-0.5）
  - 正方形修正开关
  - 调试模式开关（显示网格可视化）
- 原始图与处理结果的实时预览
- 下载处理后的图片
- 响应式 Bootstrap 5 界面

## 安装步骤

1. 确保已安装 Python 3.8 或更高版本
2. 克隆或下载本代码库
3. 进入 `web_app` 目录：
  
  ```bash
  cd PerfectPixel_GUI/web_app
  ```
  
4. 安装依赖包：
  
  ```bash
  pip install -r requirements.txt
  ```

## 使用方法

启动 Flask 开发服务器：

```bash
python app.py
```

然后在浏览器中访问 http://127.0.0.1:5000

也可以使用提供的脚本：

- Windows 系统：运行 `run.bat`
- Linux/Mac 系统：运行 `run.sh`

## 项目结构

```
web_app/
├── app.py                 # Flask 应用程序
├── requirements.txt       # Python 依赖包列表
├── templates/
│   └── index.html        # 主 HTML 界面
├── static/
│   ├── css/style.css     # 附加样式表
│   └── js/main.js        # 前端 JavaScript 代码
├── uploads/              # 临时图片存储目录
└── README.md
```

## API 接口端点

- `GET /` - 主界面
- `POST /upload` - 图片上传（multipart/form-data 格式）
- `POST /process` - 使用参数处理图片（JSON 格式）
- `GET /download/<文件名>` - 下载处理后的图片
- `POST /cleanup` - 清理上传的图片（可选）

## 开发说明

- 本网络应用导入了本地的 `perfect-pixel` 库（可编辑安装）
- 调试可视化通过修补的 `grid_layout` 函数捕获
- 图片按内容哈希值临时存储在 `uploads/` 目录
- 最大上传大小限制为 16MB

## 许可证

MIT 许可证

*[English version](README.md)*