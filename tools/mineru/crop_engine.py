import sys
import os
import json
from PIL import Image

def perform_crop(page_dir, b, save_path):
    """
    Helper function to crop question image based on boundary b specs.
    Handles single-page and multi-page questions with exact pageStart/pageEnd boundaries.
    """
    page_start = b["pageStart"]
    page_end = b["pageEnd"]
    top_y_ratio = b["topYRatio"]
    bottom_y_ratio = b["bottomYRatio"]
    page_start_bottom_ratio = b.get("pageStartBottomYRatio", 1.0)
    page_end_top_ratio = b.get("pageEndTopYRatio", 0.0)

    if page_start == page_end:
        page_path = os.path.join(page_dir, f"pdf_page_{page_start}.png")
        if not os.path.exists(page_path):
            page_path = os.path.join(page_dir, f"page_{page_start}.png")

        if os.path.exists(page_path):
            img = Image.open(page_path)
            w, h = img.size
            top_px = int(top_y_ratio * h)
            bottom_px = int(bottom_y_ratio * h)

            if bottom_px <= top_px + 20:
                bottom_px = min(h, top_px + 100)

            crop_img = img.crop((0, top_px, w, bottom_px))
            crop_img.save(save_path)
            return True
        else:
            img = Image.new("RGB", (800, 200), color=(240, 240, 245))
            img.save(save_path)
            return False
    else:
        # Multi-page spanning question (pageStart !== pageEnd)
        p1_path = os.path.join(page_dir, f"pdf_page_{page_start}.png")
        p2_path = os.path.join(page_dir, f"pdf_page_{page_end}.png")

        crops = []
        if os.path.exists(p1_path):
            img1 = Image.open(p1_path)
            w1, h1 = img1.size
            top_px1 = int(top_y_ratio * h1)
            bottom_px1 = int(page_start_bottom_ratio * h1)
            c1 = img1.crop((0, top_px1, w1, bottom_px1))
            
            # Trim bottom white space to make stitching compact
            try:
                from PIL import ImageChops
                if c1.mode != 'RGB':
                    c1 = c1.convert('RGB')
                bg1 = Image.new('RGB', c1.size, (255, 255, 255))
                diff1 = ImageChops.difference(c1, bg1)
                bbox1 = diff1.getbbox()
                if bbox1:
                    c1 = c1.crop((0, 0, w1, min(c1.size[1], bbox1[3] + 10)))
            except Exception as e:
                print(f"Trim first half warning: {e}")
                
            crops.append(c1)

        if os.path.exists(p2_path):
            img2 = Image.open(p2_path)
            w2, h2 = img2.size
            top_px2 = int(page_end_top_ratio * h2)
            bottom_px2 = int(bottom_y_ratio * h2)
            c2 = img2.crop((0, top_px2, w2, bottom_px2))
            
            # Trim top white space to make stitching compact
            try:
                from PIL import ImageChops
                if c2.mode != 'RGB':
                    c2 = c2.convert('RGB')
                bg2 = Image.new('RGB', c2.size, (255, 255, 255))
                diff2 = ImageChops.difference(c2, bg2)
                bbox2 = diff2.getbbox()
                if bbox2:
                    c2 = c2.crop((0, max(0, bbox2[1] - 10), w2, c2.size[1]))
            except Exception as e:
                print(f"Trim second half warning: {e}")
                
            crops.append(c2)

        if crops:
            total_w = max(c.size[0] for c in crops)
            total_h = sum(c.size[1] for c in crops)

            stitched = Image.new("RGB", (total_w, total_h), color=(255, 255, 255))
            y_offset = 0
            for c in crops:
                stitched.paste(c, (0, y_offset))
                y_offset += c.size[1]

            stitched.save(save_path)
            return True
        else:
            img = Image.new("RGB", (800, 200), color=(240, 240, 245))
            img.save(save_path)
            return False

def crop_questions(page_dir, boundaries_file, output_dir):
    """
    Crops question images from page PNGs based on QuestionBoundary specs.
    Crops both question content and answer explanation sections separately when available.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    with open(boundaries_file, "r", encoding="utf-8") as f:
        boundaries = json.load(f)

    cropped_manifest = []

    for b in boundaries:
        idx = b["questionIndex"]

        crop_filename = f"q_{idx}.png"
        crop_path = os.path.join(output_dir, crop_filename)

        # Crop Question Content
        perform_crop(page_dir, b, crop_path)

        # Crop Answer Explanation Section if present
        ans_filename = None
        ans_path = None
        if b.get("hasAnswerSection") and b.get("answerPageStart"):
            ans_filename = f"ans_q_{idx}.png"
            ans_path = os.path.join(output_dir, ans_filename)
            ans_b = {
                "pageStart": b["answerPageStart"],
                "pageEnd": b["answerPageEnd"],
                "topYRatio": b["answerTopYRatio"],
                "bottomYRatio": b["answerBottomYRatio"],
                "pageStartBottomYRatio": 1.0,
                "pageEndTopYRatio": 0.0
            }
            perform_crop(page_dir, ans_b, ans_path)

        cropped_manifest.append({
            "questionIndex": idx,
            "cropPath": crop_path,
            "cropFilename": crop_filename,
            "pageStart": b["pageStart"],
            "pageEnd": b["pageEnd"],
            "hasAnswerSection": bool(ans_filename),
            "answerCropFilename": ans_filename,
            "answerCropPath": ans_path
        })

    manifest_path = os.path.join(output_dir, "crops_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(cropped_manifest, f, indent=2, ensure_ascii=False)

    print(f"[CropEngine] Successfully cropped {len(cropped_manifest)} question content & answer images into {output_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python crop_engine.py <page_dir> <boundaries_file> <output_dir>")
        sys.exit(1)

    crop_questions(sys.argv[1], sys.argv[2], sys.argv[3])
