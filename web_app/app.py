import os
import io
import base64
import json
import tempfile
from pathlib import Path

import numpy as np
import cv2
from flask import Flask, request, render_template, jsonify, send_file
from PIL import Image
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt

# Import perfect-pixel library
try:
    from perfect_pixel import get_perfect_pixel
except ImportError:
    # Fallback: add parent directory to path
    import sys
    sys.path.insert(0, os.path.abspath('../perfectPixel/src'))
    from perfect_pixel import get_perfect_pixel

# Monkey-patch grid_layout to capture plot as image
import threading
from perfect_pixel import perfect_pixel as pp_module

# Thread-local storage for debug image
_thread_local = threading.local()

def capture_grid_layout(image, x_coords, y_coords, scale_x, scale_y):
    """Replacement for grid_layout that stores base64 PNG in thread-local."""
    fig, ax = plt.subplots()
    ax.imshow(image)
    ax.set_title(f"Scaled Image by Grid Sampling({scale_x}x{scale_y})")
    for x in x_coords:
        ax.axvline(x=x, linewidth=0.6)
    for y in y_coords:
        ax.axhline(y=y, linewidth=0.6)
    ax.axis('off')

    # Save to bytes buffer
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    buf.seek(0)
    # Convert to base64
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    # Store in thread-local
    _thread_local.debug_image = img_base64
    return None  # original returns None

# Replace the original grid_layout with our capture version
pp_module.grid_layout = capture_grid_layout

def get_debug_image():
    """Retrieve debug image captured in current thread, if any."""
    return getattr(_thread_local, 'debug_image', None)

def clear_debug_image():
    """Clear stored debug image for current thread."""
    if hasattr(_thread_local, 'debug_image'):
        del _thread_local.debug_image

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['SECRET_KEY'] = 'dev-secret-key'  # Change in production

# Load language files
LANGUAGES = {}
LOCALES_DIR = os.path.join(os.path.dirname(__file__), 'locales')
for lang_file in os.listdir(LOCALES_DIR):
    if lang_file.endswith('.json'):
        lang_code = lang_file.split('.')[0]
        with open(os.path.join(LOCALES_DIR, lang_file), 'r', encoding='utf-8') as f:
            LANGUAGES[lang_code] = json.load(f)

# Default language
DEFAULT_LANGUAGE = 'en'

def get_user_language():
    """Get user's preferred language from cookie or accept-language header."""
    # Check cookie first
    lang = request.cookies.get('language')
    if lang in LANGUAGES:
        return lang

    # Fallback to browser accept-language header
    accept_language = request.headers.get('Accept-Language', '')
    if accept_language:
        # Parse accept-language header (simplified)
        languages = accept_language.split(',')
        for lang_item in languages:
            lang_code = lang_item.split(';')[0].strip().split('-')[0].lower()
            if lang_code in ['zh', 'en']:
                # Map zh to zh (Chinese), en to en (English)
                if lang_code == 'zh':
                    return 'zh'
                else:
                    return 'en'

    return DEFAULT_LANGUAGE

def get_translations(lang_code=None):
    """Get translation dictionary for specified language or user's language."""
    if lang_code is None:
        lang_code = get_user_language()
    return LANGUAGES.get(lang_code, LANGUAGES[DEFAULT_LANGUAGE])

# Ensure upload folder exists
Path(app.config['UPLOAD_FOLDER']).mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'gif', 'tiff'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def pil_to_cv2(pil_image):
    """Convert PIL Image to OpenCV format (RGB -> BGR)."""
    rgb_array = np.array(pil_image)
    if rgb_array.ndim == 2:
        rgb_array = cv2.cvtColor(rgb_array, cv2.COLOR_GRAY2RGB)
    else:
        rgb_array = cv2.cvtColor(rgb_array, cv2.COLOR_RGB2BGR)
    return rgb_array

def cv2_to_pil(cv2_image):
    """Convert OpenCV BGR image to PIL RGB."""
    rgb = cv2.cvtColor(cv2_image, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)

@app.route('/')
def index():
    lang = get_user_language()
    translations = get_translations(lang)
    return render_template('index.html', lang=lang, t=translations)

@app.route('/upload', methods=['POST'])
def upload_image():
    """Handle image upload, return preview URL."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    # Read image with PIL
    pil_img = Image.open(file.stream)
    # Convert to OpenCV format
    cv2_img = pil_to_cv2(pil_img)

    # Generate a temporary ID (use hash of image data)
    import hashlib
    img_hash = hashlib.md5(cv2_img.tobytes()).hexdigest()
    temp_filename = f"{img_hash}.png"
    temp_path = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
    cv2.imwrite(temp_path, cv2_img)

    # Create a preview thumbnail (max 300px)
    preview_pil = pil_img.copy()
    preview_pil.thumbnail((300, 300))
    preview_buffer = io.BytesIO()
    preview_pil.save(preview_buffer, format='PNG')
    preview_base64 = base64.b64encode(preview_buffer.getvalue()).decode('utf-8')

    return jsonify({
        'success': True,
        'image_id': img_hash,
        'preview': f'data:image/png;base64,{preview_base64}',
        'filename': temp_filename
    })

@app.route('/process', methods=['POST'])
def process_image():
    """Process image with perfect-pixel parameters."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data'}), 400

    image_id = data.get('image_id')
    if not image_id:
        return jsonify({'error': 'Missing image_id'}), 400

    # Load image from uploads
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{image_id}.png")
    if not os.path.exists(image_path):
        return jsonify({'error': 'Image not found'}), 404

    # Read image
    cv2_img = cv2.imread(image_path, cv2.IMREAD_COLOR)
    if cv2_img is None:
        return jsonify({'error': 'Failed to load image'}), 500

    # Convert to RGB (as expected by perfect_pixel)
    rgb_img = cv2.cvtColor(cv2_img, cv2.COLOR_BGR2RGB)

    # Parse parameters
    sample_method = data.get('sample_method', 'center')
    grid_size = data.get('grid_size', None)
    if grid_size:
        try:
            grid_w = int(grid_size[0])
            grid_h = int(grid_size[1])
            grid_size = (grid_w, grid_h)
        except (ValueError, TypeError):
            grid_size = None
    min_size = float(data.get('min_size', 4.0))
    peak_width = int(data.get('peak_width', 6))
    refine_intensity = float(data.get('refine_intensity', 0.25))
    fix_square = bool(data.get('fix_square', True))
    debug = bool(data.get('debug', False))

    # Clear previous debug image
    clear_debug_image()

    # Call perfect_pixel
    try:
        refined_w, refined_h, scaled_image = get_perfect_pixel(
            rgb_img,
            sample_method=sample_method,
            grid_size=grid_size,
            min_size=min_size,
            peak_width=peak_width,
            refine_intensity=refine_intensity,
            fix_square=fix_square,
            debug=debug
        )
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

    if refined_w is None or refined_h is None:
        return jsonify({'error': 'Failed to process image'}), 500

    # Convert scaled image back to BGR for OpenCV save
    if scaled_image.shape[2] == 3:  # RGB
        scaled_bgr = cv2.cvtColor(scaled_image, cv2.COLOR_RGB2BGR)
    else:
        scaled_bgr = scaled_image

    # Save processed image
    processed_filename = f"{image_id}_processed.png"
    processed_path = os.path.join(app.config['UPLOAD_FOLDER'], processed_filename)
    cv2.imwrite(processed_path, scaled_bgr)

    # Create base64 preview of processed image
    processed_pil = cv2_to_pil(scaled_bgr)
    processed_pil.thumbnail((300, 300))
    processed_buffer = io.BytesIO()
    processed_pil.save(processed_buffer, format='PNG')
    processed_base64 = base64.b64encode(processed_buffer.getvalue()).decode('utf-8')

    # Prepare response
    response = {
        'success': True,
        'grid_size': (refined_w, refined_h),
        'processed_url': f'/download/{processed_filename}',
        'processed_preview': f'data:image/png;base64,{processed_base64}',
    }

    # If debug mode, retrieve captured debug plot
    if debug:
        debug_img = get_debug_image()
        if debug_img:
            response['debug_image'] = f'data:image/png;base64,{debug_img}'

    return jsonify(response)

@app.route('/download/<filename>')
def download_file(filename):
    """Serve processed image file."""
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename),
                     as_attachment=True)

@app.route('/cleanup', methods=['POST'])
def cleanup():
    """Clean up uploaded images (optional)."""
    data = request.get_json()
    image_id = data.get('image_id')
    if image_id:
        for ext in ['', '_processed.png', '_debug.png']:
            path = os.path.join(app.config['UPLOAD_FOLDER'], f"{image_id}{ext}")
            try:
                os.remove(path)
            except OSError:
                pass
    return jsonify({'success': True})

@app.route('/set_language', methods=['POST'])
def set_language():
    """Set user's preferred language."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data'}), 400

    lang_code = data.get('language')
    if lang_code not in LANGUAGES:
        return jsonify({'error': 'Unsupported language'}), 400

    resp = jsonify({'success': True, 'language': lang_code})
    # Set cookie for 1 year
    resp.set_cookie('language', lang_code, max_age=365*24*60*60)
    return resp

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)