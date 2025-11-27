const fs = require('fs');
const path = require('path');

// Configuration
const CLOUD_NAME = 'daq5iuktq'; // From user logs
const UPLOAD_PRESET = 'reuniform_preset'; // From code
const IMAGE_PATH = path.join(__dirname, 'images.jpeg');

async function testUpload() {
    try {
        console.log('Reading image file...');
        if (!fs.existsSync(IMAGE_PATH)) {
            throw new Error(`Image file not found at ${IMAGE_PATH}`);
        }

        const imageBuffer = fs.readFileSync(IMAGE_PATH);
        const base64Image = imageBuffer.toString('base64');
        const base64DataUri = `data:image/jpeg;base64,${base64Image}`;

        const itemId = `test_local_${Date.now()}`;
        // Sanitize itemId (same logic as CloudinaryHelper.gs)
        const safeId = itemId.replace(/[^a-zA-Z0-9_\-]/g, '_');

        console.log(`Uploading to Cloudinary...`);
        console.log(`Cloud Name: ${CLOUD_NAME}`);
        console.log(`Preset: ${UPLOAD_PRESET}`);
        console.log(`Public ID: ${safeId}`);

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

        const payload = {
            file: base64DataUri,
            upload_preset: UPLOAD_PRESET,
            folder: 'reuniform',
            public_id: safeId,
            filename_override: safeId
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Upload failed:', JSON.stringify(data, null, 2));
        } else {
            console.log('Upload successful!');
            console.log('URL:', data.secure_url);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testUpload();
