import sys
import os
import glob

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

try:
    import fitz
except ImportError:
    print("[render_pdf.py] fitz (PyMuPDF) not available")
    sys.exit(1)

def render_pdf_pages(pdf_path, output_dir):
    if not os.path.exists(pdf_path):
        print(f"[render_pdf.py] File not found: {pdf_path}")
        sys.exit(1)

    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    else:
        # Clear previous page PNGs to prevent old PDF pages from showing up
        old_pages = glob.glob(os.path.join(output_dir, "pdf_page_*.png"))
        for p in old_pages:
            try:
                os.remove(p)
            except Exception:
                pass

    try:
        doc = fitz.open(pdf_path)
        print(f"[render_pdf.py] Rendering {len(doc)} pages from {pdf_path} into {output_dir}...")
        for i, page in enumerate(doc):
            pix = page.get_pixmap(dpi=150)
            out_path = os.path.join(output_dir, f"pdf_page_{i+1}.png")
            pix.save(out_path)
        print(f"[render_pdf.py] Successfully rendered {len(doc)} pages to {output_dir}")
    except Exception as e:
        print(f"[render_pdf.py] Error rendering PDF: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python render_pdf.py <pdf_path> <output_dir>")
        sys.exit(1)
    render_pdf_pages(sys.argv[1], sys.argv[2])
