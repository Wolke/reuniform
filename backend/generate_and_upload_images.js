const fs = require('fs');
const path = require('path');
const https = require('https');

// Cloudinary configuration - you'll need to set these
const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET';

// Type mapping for Chinese display
const typeMapping = {
    sport_top_short: '運動服上衣(短袖)',
    uniform_bottom_long: '制服褲(長)',
    dress: '洋裝',
    sport_bottom_short: '運動褲(短)',
    uniform_top_short: '制服上衣(短袖)',
    jacket: '外套'
};

// Parse CSV
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        const values = line.split(',');
        const item = {};
        headers.forEach((header, index) => {
            item[header] = values[index];
        });
        return item;
    }).filter(item => item.id); // Filter out empty lines
}

// Upload image to Cloudinary
async function uploadToCloudinary(imageBuffer, fileName) {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
        const formData = [];

        // Add file
        formData.push(Buffer.from(`--${boundary}\r\n`));
        formData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`));
        formData.push(Buffer.from('Content-Type: image/png\r\n\r\n'));
        formData.push(imageBuffer);
        formData.push(Buffer.from('\r\n'));

        // Add upload_preset
        formData.push(Buffer.from(`--${boundary}\r\n`));
        formData.push(Buffer.from(`Content-Disposition: form-data; name="upload_preset"\r\n\r\n`));
        formData.push(Buffer.from(`${CLOUDINARY_UPLOAD_PRESET}\r\n`));

        formData.push(Buffer.from(`--${boundary}--\r\n`));

        const body = Buffer.concat(formData);

        const options = {
            hostname: 'api.cloudinary.com',
            path: `/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(data);
                    resolve(response.secure_url);
                } else {
                    reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(body);
        req.end();
    });
}

// Main function
async function main() {
    const csvPath = path.join(__dirname, 'mock_data_items.csv');
    const items = parseCSV(csvPath);

    console.log(`Found ${items.length} items to process`);

    // Note: You'll need to generate images first using the generate_image tool
    // Then manually upload them using this script

    for (const item of items) {
        console.log(`\nItem ID: ${item.id}`);
        console.log(`School: ${item.school}`);
        console.log(`Type: ${typeMapping[item.type] || item.type}`);
        console.log(`Gender: ${item.gender}`);
        console.log(`Size: ${item.size}`);
    }
}

main().catch(console.error);
