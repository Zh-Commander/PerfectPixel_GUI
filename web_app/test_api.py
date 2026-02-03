import requests
import json
import sys

BASE_URL = 'http://127.0.0.1:5000'

def test_upload():
    """Upload sample image."""
    with open('test_image.jpg', 'rb') as f:
        files = {'file': f}
        resp = requests.post(f'{BASE_URL}/upload', files=files)
        if resp.status_code != 200:
            print('Upload failed:', resp.text)
            sys.exit(1)
        data = resp.json()
        print('Upload success, image_id:', data['image_id'])
        return data['image_id']

def test_process(image_id, debug=False):
    """Process image with default parameters."""
    params = {
        'image_id': image_id,
        'sample_method': 'center',
        'min_size': 4.0,
        'peak_width': 6,
        'refine_intensity': 0.25,
        'fix_square': True,
        'debug': debug
    }
    resp = requests.post(f'{BASE_URL}/process', json=params)
    if resp.status_code != 200:
        print('Process failed:', resp.text)
        sys.exit(1)
    data = resp.json()
    print('Process success, grid_size:', data['grid_size'])
    if debug and 'debug_image' in data:
        print('Debug image received (length):', len(data['debug_image']))
    else:
        print('No debug image')
    return data

if __name__ == '__main__':
    print('Testing PerfectPixel Web API...')
    img_id = test_upload()
    print('\n--- Processing without debug ---')
    test_process(img_id, debug=False)
    print('\n--- Processing with debug ---')
    test_process(img_id, debug=True)
    print('\nAll tests passed!')