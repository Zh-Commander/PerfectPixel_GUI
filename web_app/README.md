# PerfectPixel Web GUI

A web-based graphical interface for the [Perfect Pixel](https://github.com/theamusing/perfectPixel) library, providing auto grid detection and pixel art refinement through an intuitive browser interface.

**Part of the PerfectPixel_GUI project** - This web application is part of a larger project that includes the original Perfect Pixel library. See the [root README](../README.md) for complete project details.

## Features

- Upload images (PNG, JPG, JPEG, BMP, GIF, TIFF)
- Adjust all parameters of the `get_perfect_pixel` API:
  - Sample method (center, median, majority)
  - Manual grid size override (optional)
  - Min pixel size slider (4-20)
  - Peak width slider (1-20)
  - Refine intensity slider (0-0.5)
  - Fix square toggle
  - Debug mode toggle (shows grid visualization)
- Real-time preview of original and processed images
- Download processed results
- Responsive Bootstrap 5 interface

## Installation

1. Ensure Python 3.8+ is installed
2. Clone or download this repository
3. Navigate to the `web_app` directory:
   ```bash
   cd PerfectPixel_GUI/web_app
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Start the Flask development server:

```bash
python app.py
```

Then open your browser to http://127.0.0.1:5000

Alternatively, use the provided scripts:
- Windows: `run.bat`
- Linux/Mac: `run.sh`

## Project Structure

```
web_app/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML interface
├── static/
│   ├── css/style.css     # Additional styles
│   └── js/main.js        # Frontend JavaScript
├── uploads/              # Temporary image storage
└── README.md
```

## API Endpoints

- `GET /` - Main interface
- `POST /upload` - Image upload (multipart/form-data)
- `POST /process` - Process image with parameters (JSON)
- `GET /download/<filename>` - Download processed image
- `POST /cleanup` - Clean up uploaded images (optional)

## Development Notes

- The web app imports the local `perfect-pixel` library (editable install)
- Debug visualization is captured via monkey-patched `grid_layout` function
- Images are temporarily stored in `uploads/` (hashed by content)
- Maximum upload size: 16MB

## License

MIT

*[中文版本](README_zh.md)*