$(document).ready(function() {
    // Current image state
    let currentImageId = null;

    // Drag state for zoomed image
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let imageStartX = 0;
    let imageStartY = 0;
    let currentImageX = 0;
    let currentImageY = 0;

    // Language switcher
    $('.language-btn').click(function() {
        const lang = $(this).data('lang');
        if (!lang) return;

        // Send language preference to server
        $.ajax({
            url: '/set_language',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ language: lang }),
            success: function() {
                // Refresh page to apply new language
                window.location.reload();
            },
            error: function(xhr) {
                console.error('Failed to set language:', xhr.statusText);
            }
        });
    });

    // Update slider value displays
    $('#minSize').on('input', function() {
        $('#minSizeValue').text($(this).val());
    });
    $('#peakWidth').on('input', function() {
        $('#peakWidthValue').text($(this).val());
    });
    $('#refineIntensity').on('input', function() {
        $('#refineIntensityValue').text($(this).val());
    });

    // Zoom control
    $('#zoomLevel').on('input', function() {
        const zoom = parseInt($(this).val());
        $('#zoomValue').text(zoom + 'x');

        // Apply zoom to processed image
        const $img = $('#processedPreview');
        if ($img.length && $img[0]) {
            if ($img[0].complete && $img[0].naturalWidth) {
                $img.css('transform', `scale(${zoom})`);
            } else {
                // Image not loaded yet, attach load handler
                $img.off('load.zoom').on('load.zoom', function() {
                    $(this).css('transform', `scale(${zoom})`);
                });
            }
            // Update drag boundaries after zoom change
            updateImagePosition($img, zoom);
        }
    });

    // Drag functionality for zoomed image
    function initDragHandlers() {
        // Mouse events (delegated to handle dynamic elements)
        $(document).on('mousedown', '.zoom-image-container', function(e) {
            startDrag(e.clientX, e.clientY);
            e.preventDefault();
        });

        $(document).on('mousemove', function(e) {
            if (isDragging) {
                dragMove(e.clientX, e.clientY);
                e.preventDefault();
            }
        });

        $(document).on('mouseup', function() {
            if (isDragging) {
                endDrag();
            }
        });

        // Touch events for mobile (delegated)
        $(document).on('touchstart', '.zoom-image-container', function(e) {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                startDrag(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        });

        $(document).on('touchmove', function(e) {
            if (isDragging && e.touches.length === 1) {
                const touch = e.touches[0];
                dragMove(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        });

        $(document).on('touchend', function() {
            if (isDragging) {
                endDrag();
            }
        });
    }

    function startDrag(clientX, clientY) {
        const $container = $('.zoom-image-container');
        const $img = $('#processedPreview');

        console.log('startDrag called', $img.length, $img[0]?.complete);

        if (!$img.length || !$img[0].complete) {
            console.log('startDrag aborted: image not ready');
            return;
        }

        isDragging = true;
        dragStartX = clientX;
        dragStartY = clientY;
        imageStartX = currentImageX;
        imageStartY = currentImageY;

        console.log('Dragging started at', clientX, clientY, 'image pos', imageStartX, imageStartY);

        $container.addClass('dragging');
    }

    function dragMove(clientX, clientY) {
        if (!isDragging) return;

        const dx = clientX - dragStartX;
        const dy = clientY - dragStartY;

        const newX = imageStartX + dx;
        const newY = imageStartY + dy;

        console.log('dragMove', clientX, clientY, 'delta', dx, dy, 'new pos', newX, newY);

        setImagePosition(newX, newY);
    }

    function endDrag() {
        isDragging = false;
        $('.zoom-image-container').removeClass('dragging');
    }

    function setImagePosition(x, y) {
        const $container = $('.zoom-image-container');
        const $img = $('#processedPreview');

        if (!$img.length || !$container.length) {
            console.log('setImagePosition: container or image not found');
            return;
        }

        const zoom = parseInt($('#zoomLevel').val()) || 1;
        const containerWidth = $container.width();
        const containerHeight = $container.height();

        console.log('setImagePosition: container size', containerWidth, containerHeight, 'zoom', zoom);

        // Get image dimensions
        const imgWidth = $img[0].naturalWidth * zoom;
        const imgHeight = $img[0].naturalHeight * zoom;

        console.log('setImagePosition: image size', $img[0].naturalWidth, $img[0].naturalHeight, 'scaled', imgWidth, imgHeight);

        // Calculate boundaries
        const overflowX = imgWidth - containerWidth;
        const overflowY = imgHeight - containerHeight;

        const minX = Math.min(0, -overflowX);
        const maxX = Math.max(0, -overflowX);
        const minY = Math.min(0, -overflowY);
        const maxY = Math.max(0, -overflowY);

        console.log('setImagePosition: boundaries', minX, maxX, minY, maxY, 'input', x, y);

        // Clamp position
        currentImageX = Math.max(minX, Math.min(maxX, x));
        currentImageY = Math.max(minY, Math.min(maxY, y));

        console.log('setImagePosition: final position', currentImageX, currentImageY);

        // Apply position
        $img.css({
            left: currentImageX + 'px',
            top: currentImageY + 'px'
        });
    }

    function updateImagePosition($img, zoom) {
        if (!$img.length || !$img[0].complete) return;

        const containerWidth = $('.zoom-image-container').width();
        const containerHeight = $('.zoom-image-container').height();
        const imgWidth = $img[0].naturalWidth * zoom;
        const imgHeight = $img[0].naturalHeight * zoom;

        // Calculate desired position (center if smaller, otherwise top-left)
        let desiredX = 0;
        let desiredY = 0;

        if (imgWidth < containerWidth) {
            desiredX = (containerWidth - imgWidth) / 2;
        }
        if (imgHeight < containerHeight) {
            desiredY = (containerHeight - imgHeight) / 2;
        }

        // Use setImagePosition to apply with boundary checking
        setImagePosition(desiredX, desiredY);
    }

    // Initialize drag handlers when page loads
    initDragHandlers();

    // Upload area click
    $('#uploadArea').click(function(e) {
        if (!$(e.target).is('input')) {
            $('#fileInput').trigger('click');
        }
    });

    $('#fileInput').change(function() {
        if (this.files.length > 0) {
            uploadImage(this.files[0]);
        }
    });

    $('#btnUpload').click(function() {
        $('#fileInput').trigger('click');
    });

    // Drag and drop
    $('#uploadArea').on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('border-primary');
    }).on('dragleave', function() {
        $(this).removeClass('border-primary');
    }).on('drop', function(e) {
        e.preventDefault();
        $(this).removeClass('border-primary');
        if (e.originalEvent.dataTransfer.files.length) {
            uploadImage(e.originalEvent.dataTransfer.files[0]);
        }
    });

    // Process button
    $('#parameterForm').submit(function(e) {
        e.preventDefault();
        processImage();
    });

    // Reset button
    $('#btnReset').click(function() {
        resetUI();
    });

    // Upload image via AJAX
    function uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        showLoading(true);
        hideAlerts();

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    currentImageId = response.image_id;
                    $('#previewImage').attr('src', response.preview);
                    $('#previewContainer').show();
                    $('#imageInfo').text(`Uploaded: ${file.name}`);
                    $('#resultCard').hide();
                    $('#debugSection').hide();
                    showSuccess(window.translations.alerts.upload_success);
                } else {
                    showError(response.error || 'Upload failed');
                }
            },
            error: function(xhr) {
                try {
                    const err = JSON.parse(xhr.responseText);
                    showError(err.error || 'Upload error');
                } catch {
                    showError('Upload error: ' + xhr.statusText);
                }
            },
            complete: function() {
                showLoading(false);
            }
        });
    }

    // Process image with current parameters
    function processImage() {
        if (!currentImageId) {
            showError(window.translations?.alerts?.upload_first || 'Please upload an image first');
            return;
        }

        // Collect parameters
        const params = {
            image_id: currentImageId,
            sample_method: $('#sampleMethod').val(),
            min_size: parseFloat($('#minSize').val()),
            peak_width: parseInt($('#peakWidth').val()),
            refine_intensity: parseFloat($('#refineIntensity').val()),
            fix_square: $('#fixSquare').is(':checked'),
            debug: $('#debug').is(':checked')
        };

        // Optional grid size
        const gridWidth = $('#gridWidth').val();
        const gridHeight = $('#gridHeight').val();
        if (gridWidth && gridHeight) {
            params.grid_size = [parseInt(gridWidth), parseInt(gridHeight)];
        }

        showLoading(true);
        hideAlerts();

        $.ajax({
            url: '/process',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(params),
            success: function(response) {
                if (response.success) {
                    // Update result card
                    $('#processedPreview').attr('src', response.processed_preview);
                    // Apply current zoom level to the new image
                    const $img = $('#processedPreview');
                    const zoom = parseInt($('#zoomLevel').val());
                    $img.off('load.zoom').on('load.zoom', function() {
                        $(this).css('transform', `scale(${zoom})`);
                        updateImagePosition($(this), zoom);
                    });
                    // If already loaded, apply immediately
                    if ($img[0].complete && $img[0].naturalWidth) {
                        $img.css('transform', `scale(${zoom})`);
                        updateImagePosition($img, zoom);
                    }
                    $('#gridSizeBadge').text(response.grid_size[0] + '×' + response.grid_size[1]);
                    $('#downloadLink').attr('href', response.processed_url);
                    $('#resultCard').show();
                    showSuccess(window.translations.alerts.success);

                    // Ensure image position is updated after container becomes visible
                    setTimeout(() => {
                        const $img = $('#processedPreview');
                        const zoom = parseInt($('#zoomLevel').val());
                        if ($img.length && $img[0].complete) {
                            updateImagePosition($img, zoom);
                        }
                    }, 100);
                    // Debug image
                    if (response.debug_image) {
                        $('#debugImage').attr('src', response.debug_image);
                        $('#debugSection').show();
                    } else {
                        $('#debugSection').hide();
                    }
                } else {
                    showError(response.error || 'Processing failed');
                }
            },
            error: function(xhr) {
                try {
                    const err = JSON.parse(xhr.responseText);
                    showError(err.error || 'Processing error');
                } catch {
                    showError('Processing error: ' + xhr.statusText);
                }
            },
            complete: function() {
                showLoading(false);
            }
        });
    }

    // Reset UI to initial state
    function resetUI() {
        currentImageId = null;
        $('#previewContainer').hide();
        $('#resultCard').hide();
        $('#debugSection').hide();
        $('#debugImage').attr('src', '');
        $('#fileInput').val('');
        hideAlerts();
        // Reset zoom and position
        $('#zoomLevel').val(1);
        $('#zoomValue').text('1x');
        $('#processedPreview').css({
            'transform': 'scale(1)',
            'left': '0px',
            'top': '0px'
        });
        currentImageX = 0;
        currentImageY = 0;
    }

    // UI helper functions
    function showLoading(show) {
        if (show) {
            $('#loading').show();
            $('#btnProcess').prop('disabled', true);
        } else {
            $('#loading').hide();
            $('#btnProcess').prop('disabled', false);
        }
    }

    function showError(message) {
        $('#errorText').text(message);
        $('#errorAlert').show();
        $('#successAlert').hide();
    }

    function showSuccess(message) {
        $('#successAlert').show();
        $('#errorAlert').hide();
    }

    function hideAlerts() {
        $('#errorAlert').hide();
        $('#successAlert').hide();
    }

    // Initialize slider displays
    $('#minSizeValue').text($('#minSize').val());
    $('#peakWidthValue').text($('#peakWidth').val());
    $('#refineIntensityValue').text($('#refineIntensity').val());
});