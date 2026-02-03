*[中文版本可在此处查看](README_zh.md)*
# PerfectPixel GUI

A web-based graphical user interface for the [Perfect Pixel](https://github.com/theamusing/perfectPixel) library, providing automatic grid detection and pixel art optimization through an intuitive browser interface.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview

This project provides a user-friendly web interface for the excellent Perfect Pixel library (developed by [theamusing](https://github.com/theamusing)). Perfect Pixel can automatically detect the optimal grid in pixel-style images and provide perfectly aligned pixel-level optimization results. This GUI allows users to utilize the library without writing Python code through a visual interface.

**Original Perfect Pixel Repository**: https://github.com/theamusing/perfectPixel

## Features

### Perfect Pixel Core Features

- Automatic detection of grid dimensions from pixel-style images
- Optimization of AI-generated pixel art to perfectly aligned grids
- Multiple sampling methods (center point, median, mode)
- Manual grid size override options
- Adjustable intensity for grid line optimization

### Web GUI Enhanced Features

- **Intuitive Interface**: Drag-and-drop image upload with real-time preview
- **Parameter Controls**: Interactive sliders for all algorithm parameters
- **Visual Feedback**: Side-by-side comparison of original and processed results
- **Zoom Controls**: Interactive zoom (1-16x) and pan for detailed inspection
- **Debug Mode**: Visual display of detected grids for troubleshooting
- **Multilingual Support**: English and Chinese interfaces
- **Responsive Design**: Works on both desktop and mobile devices
- **Direct Download**: One-click download of processed images

## Project Structure

```
PerfectPixel_GUI/
├── perfectPixel/           # Original Perfect Pixel library (cloned from GitHub)
│   ├── src/               # Library source code
│   ├── example.py         # Usage examples
│   └── README.md          # Original documentation
└── web_app/               # Flask web application
    ├── app.py            # Main Flask application
    ├── requirements.txt  # Python dependencies
    ├── templates/
    │   └── index.html    # Main HTML interface
    ├── static/
    │   ├── css/          # Custom styles
    │   └── js/           # Frontend JavaScript
    ├── locales/          # Translation files
    ├── uploads/          # Temporary image storage
    └── run.bat/run.sh    # Platform-specific startup scripts
```

## Installation

### Prerequisites

- Python 3.8 or higher
- Git (for cloning repositories)

### Step-by-Step Setup

1. **Clone or download this repository**
   
   ```bash
   git clone <repository URL>
   cd PerfectPixel_GUI
   ```

2. **Set up the web application**
   
   ```bash
   cd web_app
   ```

3. **Install dependencies**
   
   ```bash
   pip install -r requirements.txt
   ```
   
   This will install:
   
   - Flask web framework
   - Pillow image processing library
   - NumPy numerical computation library
   - Matplotlib debugging visualization library
   - OpenCV-Python image manipulation library
   - Local Perfect Pixel library (editable mode)

4. **Verify installation**
   
   ```bash
   python app.py
   ```
   
   You should see output indicating the Flask server is running at `http://127.0.0.1:5000`

## Usage

### Starting the Application

**Option 1: Using Python directly**

```bash
cd web_app
python app.py
```

**Option 2: Using platform-specific scripts**

- Windows: Double-click `run.bat` or run from command line
- Linux/Mac: Run `./run.sh` or `bash run.sh`

**Option 3: Manually starting the server**

```bash
cd web_app
python app.py
```

### Using the Web Interface

1. **Open your browser** and navigate to `http://127.0.0.1:5000`
2. **Upload an image**: Use drag-and-drop or click to browse
3. **Adjust parameters** (optional):
   - **Sampling method**: Choose how to sample colors from each grid cell
   - **Minimum pixel size**: Minimum valid pixel size (4-20)
   - **Peak width**: Minimum peak width for detection (1-20)
   - **Optimization intensity**: Grid line optimization strength (0-0.5)
   - **Square correction**: Force near-square images to output as squares
   - **Debug mode**: Display grid visualization overlay
4. **Click "Process Image"** to run the algorithm
5. **Inspect results**: Use zoom and pan controls
6. **Download** the processed image

### Supported Image Formats

- PNG, JPG/JPEG, BMP, GIF, TIFF
- Maximum file size: 16MB
- Recommended: Pixel art images (512-1024 pixels)

## API Reference (Web Interface)

The web application provides the following REST endpoints:

| Endpoint               | Method | Description                                 |
| ---------------------- | ------ | ------------------------------------------- |
| `/`                    | GET    | Main web interface                          |
| `/upload`              | POST   | Upload image (multipart/form-data)          |
| `/process`             | POST   | Process image with parameters (JSON format) |
| `/download/<filename>` | GET    | Download processed image                    |
| `/cleanup`             | POST   | Clean up uploaded images (optional)         |
| `/set_language`        | POST   | Set interface language                      |

## Development Notes

### Integration with Perfect Pixel

The web application imports the local `perfect-pixel` library using an editable installation (`-e ../perfectPixel`). This allows:

- Direct access to the library's `get_perfect_pixel` function
- Monkey-patching internal functions for debugging visualization
- Easy updates when the original library is updated

### Image Processing Pipeline

1. **Upload**: Image is converted to OpenCV format and stored with MD5 hash filename
2. **Processing**: Perfect Pixel algorithm detects grid and optimizes image
3. **Debug capture**: If debug mode is enabled, grid visualization is captured via monkey-patched functions
4. **Output**: Processed image is saved and made available for download

### Localization

The interface supports multiple languages through JSON translation files in `web_app/locales/`:

- `en.json`: English translations
- `zh.json`: Chinese translations

Users can switch languages through the interface; preferences are saved in cookies.

## Troubleshooting

### Common Issues

**ImportError: cannot import name 'get_perfect_pixel'**

- Ensure you're in the `web_app` directory
- Verify the `perfectPixel` folder exists in the parent directory
- Check that `pip install -r requirements.txt` completed successfully

**Server cannot start on port 5000**

- Another application may be using the port
- Try changing the port in `app.py`: `app.run(port=5001)`

**Image upload fails**

- Check file size (maximum 16MB)
- Verify image format is supported
- Ensure the uploads folder exists and is writable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The Perfect Pixel library (located in the `perfectPixel/` directory) is also licensed under the MIT License, courtesy of the original author [theamusing](https://github.com/theamusing).

## 🙏 Acknowledgments

- **theamusing** for creating the excellent [Perfect Pixel](https://github.com/theamusing/perfectPixel) library
- The Flask community for the web framework
- Bootstrap for responsive UI components
- All open-source libraries used in this project

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📧 Reporting Issues

Parts of this project were developed with the assistance of AI Coder, and issues may still exist.

If you encounter any problems, please submit them in the GitHub Issues.

---

**Note**: This is a third-party GUI interface for the Perfect Pixel library. The core algorithm and library are developed and maintained by [theamusing](https://github.com/theamusing/perfectPixel).
