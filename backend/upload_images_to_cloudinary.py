#!/usr/bin/env python3
"""
Script to upload generated uniform images to Cloudinary and update the CSV file
"""

import os
import csv
import sys
from pathlib import Path

try:
    import cloudinary
    import cloudinary.uploader
    from cloudinary.utils import cloudinary_url
except ImportError:
    print("Error: cloudinary package not found.")
    print("Please install it with: pip install cloudinary")
    sys.exit(1)

# Cloudinary configuration
# You need to set these environment variables or edit them here
CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', 'YOUR_CLOUD_NAME')
API_KEY = os.getenv('CLOUDINARY_API_KEY', 'YOUR_API_KEY')
API_SECRET = os.getenv('CLOUDINARY_API_SECRET', 'YOUR_API_SECRET')

cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=API_KEY,
    api_secret=API_SECRET
)

# Image mapping: item_id -> local image path
IMAGE_MAPPING = {
    'ITEM001': 'haishan_sport_top.png',
    'ITEM002': 'guangfu_uniform_pants.png',
    'ITEM003': 'mandarin_school_dress.png',
    'ITEM004': '../.gemini/antigravity/brain/dacd34d6-cfcd-4177-bc30-297a6b99e69f/haishan_sport_shorts_1764150612021.png',
    'ITEM005': 'xingan_uniform_top.png',
    'ITEM006': '../.gemini/antigravity/brain/dacd34d6-cfcd-4177-bc30-297a6b99e69f/zhonghe_jacket_1764151417165.png',
}

def upload_image_to_cloudinary(image_path, public_id):
    """
    Upload an image to Cloudinary
    
    Args:
        image_path: Path to the local image file
        public_id: Public ID for the image in Cloudinary
        
    Returns:
        Cloudinary secure URL or None if upload fails
    """
    try:
        # Check if file exists
        if not os.path.exists(image_path):
            print(f"  ❌ Image file not found: {image_path}")
            return None
            
        # Upload to Cloudinary
        print(f"  ⬆️  Uploading {os.path.basename(image_path)}...")
        result = cloudinary.uploader.upload(
            image_path,
            folder="reuniform/items",
            public_id=public_id,
            overwrite=True,
            resource_type="image"
        )
        
        print(f"  ✅ Uploaded successfully: {result['secure_url']}")
        return result['secure_url']
        
    except Exception as e:
        print(f"  ❌ Error uploading {image_path}: {str(e)}")
        return None

def update_csv_with_urls(csv_path, url_mapping):
    """
    Update the CSV file with new Cloudinary URLs
    
    Args:
        csv_path: Path to the CSV file
        url_mapping: Dictionary mapping item_id to cloudinary URL
    """
    # Read the CSV
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            if row['id'] in url_mapping and url_mapping[row['id']]:
                old_url = row['image_url']
                new_url = url_mapping[row['id']]
                row['image_url'] = new_url
                print(f"  📝 Updated {row['id']}: {row['school']} - {row['type']}")
            rows.append(row)
    
    # Write the updated CSV
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✅ CSV file updated: {csv_path}")

def main():
    print("=" * 60)
    print("Cloudinary Image Upload Script")
    print("=" * 60)
    print(f"Cloud Name: {CLOUD_NAME}\n")
    
    if CLOUD_NAME == 'YOUR_CLOUD_NAME':
        print("⚠️  Warning: Cloudinary credentials not configured!")
        print("Please set environment variables or edit the script:")
        print("  - CLOUDINARY_CLOUD_NAME")
        print("  - CLOUDINARY_API_KEY")
        print("  - CLOUDINARY_API_SECRET")
        print("\nYou can find these in your Cloudinary dashboard.")
        sys.exit(1)
    
    # Get script directory
    script_dir = Path(__file__).parent
    csv_path = script_dir / 'mock_data_items.csv'
    
    if not csv_path.exists():
        print(f"❌ CSV file not found: {csv_path}")
        sys.exit(1)
    
    print(f"CSV File: {csv_path}\n")
    print("Starting upload process...\n")
    
    # Upload images and collect URLs
    url_mapping = {}
    
    for item_id, image_filename in IMAGE_MAPPING.items():
        print(f"Processing {item_id}:")
        
        # Resolve image path
        image_path = script_dir / image_filename
        
        # Create public_id from item_id
        public_id = item_id.lower()
        
        # Upload and get URL
        url = upload_image_to_cloudinary(str(image_path), public_id)
        if url:
            url_mapping[item_id] = url
        
        print()
    
    # Update CSV if any uploads succeeded
    if url_mapping:
        print("\nUpdating CSV file...")
        update_csv_with_urls(csv_path, url_mapping)
        print(f"\n✅ Successfully uploaded {len(url_mapping)} images!")
    else:
        print("\n❌ No images were uploaded successfully.")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("Upload complete!")
    print("=" * 60)

if __name__ == '__main__':
    main()
