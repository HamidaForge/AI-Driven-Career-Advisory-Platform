"""
Certificate PDF Generator
Run: pip install reportlab --break-system-packages
Usage: python certificate_generator.py
Or import generate_certificate() in your FastAPI route
"""
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
from datetime import datetime


def generate_certificate(
    output_path: str,
    student_name: str,
    course_title: str,
    cert_id: str,
    issue_date: str = None,
    instructor: str = "SkillPath AI Team",
):
    """
    Generates a professional PDF certificate.
    
    Args:
        output_path: Where to save the PDF (e.g. "certs/SKP-2025-ABC123.pdf")
        student_name: Full name of the student
        course_title: Name of the completed course
        cert_id: Unique certificate ID (e.g. SKP-2025-ABC123)
        issue_date: Date string (defaults to today)
        instructor: Instructor / platform name
    """
    if issue_date is None:
        issue_date = datetime.now().strftime("%B %d, %Y")

    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

    page_w, page_h = landscape(A4)
    c = canvas.Canvas(output_path, pagesize=landscape(A4))

    # ── Background ────────────────────────────────────────────────────────────
    c.setFillColorRGB(0.02, 0.04, 0.08)   # #050A14 dark
    c.rect(0, 0, page_w, page_h, fill=1, stroke=0)

    # ── Outer decorative border ───────────────────────────────────────────────
    c.setStrokeColorRGB(0.39, 0.40, 0.95)   # indigo
    c.setLineWidth(3)
    margin = 18
    c.rect(margin*mm, margin*mm, page_w - 2*margin*mm, page_h - 2*margin*mm, fill=0)

    c.setStrokeColorRGB(0.39, 0.40, 0.95, 0.3)
    c.setLineWidth(1)
    inner_m = 21
    c.rect(inner_m*mm, inner_m*mm, page_w - 2*inner_m*mm, page_h - 2*inner_m*mm, fill=0)

    # ── Corner accents ────────────────────────────────────────────────────────
    accent_size = 14 * mm
    c.setStrokeColorRGB(0.06, 0.73, 0.46)  # teal
    c.setLineWidth(2)
    for (cx, cy, sx, sy) in [
        (margin*mm, margin*mm, 1, 1),
        (page_w - margin*mm, margin*mm, -1, 1),
        (margin*mm, page_h - margin*mm, 1, -1),
        (page_w - margin*mm, page_h - margin*mm, -1, -1),
    ]:
        c.line(cx, cy, cx + sx*accent_size, cy)
        c.line(cx, cy, cx, cy + sy*accent_size)

    # ── Header: Logo + Platform name ──────────────────────────────────────────
    c.setFillColorRGB(0.39, 0.40, 0.95)
    c.roundRect(page_w/2 - 15*mm, page_h - 42*mm, 30*mm, 10*mm, 3*mm, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(page_w/2, page_h - 37*mm, "SkillPath AI")

    # ── "Certificate of Completion" title ────────────────────────────────────
    c.setFillColorRGB(0.65, 0.65, 0.95)
    c.setFont("Helvetica", 11)
    c.drawCentredString(page_w/2, page_h - 56*mm, "C E R T I F I C A T E   O F   C O M P L E T I O N")

    # Decorative line under title
    c.setStrokeColorRGB(0.39, 0.40, 0.95, 0.5)
    c.setLineWidth(0.5)
    line_w = 100 * mm
    c.line(page_w/2 - line_w/2, page_h - 59*mm, page_w/2 + line_w/2, page_h - 59*mm)

    # ── "This certifies that" ─────────────────────────────────────────────────
    c.setFillColorRGB(0.6, 0.6, 0.6)
    c.setFont("Helvetica", 10)
    c.drawCentredString(page_w/2, page_h - 70*mm, "This is to certify that")

    # ── Student name ──────────────────────────────────────────────────────────
    c.setFillColorRGB(1, 1, 1)
    name_font_size = min(36, max(22, 400 // len(student_name)))
    c.setFont("Helvetica-Bold", name_font_size)
    c.drawCentredString(page_w/2, page_h - 87*mm, student_name)

    # Name underline (gradient-style via multiple lines)
    c.setStrokeColorRGB(0.06, 0.73, 0.46)
    c.setLineWidth(2)
    name_w = c.stringWidth(student_name, "Helvetica-Bold", name_font_size)
    c.line(page_w/2 - name_w/2, page_h - 90.5*mm, page_w/2 + name_w/2, page_h - 90.5*mm)

    # ── "has successfully completed" ──────────────────────────────────────────
    c.setFillColorRGB(0.6, 0.6, 0.6)
    c.setFont("Helvetica", 10)
    c.drawCentredString(page_w/2, page_h - 100*mm, "has successfully completed the course")

    # ── Course title ──────────────────────────────────────────────────────────
    c.setFillColorRGB(0.65, 0.80, 1.0)
    course_font_size = min(22, max(14, 350 // len(course_title)))
    c.setFont("Helvetica-Bold", course_font_size)
    c.drawCentredString(page_w/2, page_h - 113*mm, course_title)

    # ── Divider ───────────────────────────────────────────────────────────────
    c.setStrokeColorRGB(0.2, 0.2, 0.35)
    c.setLineWidth(0.5)
    c.line(40*mm, page_h - 127*mm, page_w - 40*mm, page_h - 127*mm)

    # ── Footer: Date | Cert ID | Signature ───────────────────────────────────
    footer_y = page_h - 142*mm
    col1 = page_w * 0.22
    col2 = page_w * 0.50
    col3 = page_w * 0.78

    for (x, label, value) in [
        (col1, "ISSUED ON", issue_date),
        (col2, "CERTIFICATE ID", cert_id),
        (col3, "AUTHORIZED BY", instructor),
    ]:
        c.setFillColorRGB(0.45, 0.45, 0.55)
        c.setFont("Helvetica", 7.5)
        c.drawCentredString(x, footer_y + 8*mm, label)
        c.setFillColorRGB(0.85, 0.85, 0.95)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(x, footer_y, value)

    # Vertical separators
    c.setStrokeColorRGB(0.2, 0.2, 0.35)
    c.setLineWidth(0.5)
    for sx in [page_w*0.36, page_w*0.64]:
        c.line(sx, footer_y - 4*mm, sx, footer_y + 12*mm)

    # ── Verification URL ──────────────────────────────────────────────────────
    c.setFillColorRGB(0.35, 0.35, 0.45)
    c.setFont("Helvetica", 7)
    c.drawCentredString(page_w/2, page_h - 157*mm, f"Verify at: skillpath.ai/verify/{cert_id}")

    # ── Decorative stars / dots ───────────────────────────────────────────────
    c.setFillColorRGB(0.39, 0.40, 0.95, 0.4)
    for (dx, dy) in [(50,50),(page_w-50,50),(50,page_h-50),(page_w-50,page_h-50)]:
        c.circle(dx, dy, 3*mm, fill=1, stroke=0)

    c.save()
    print(f"Certificate saved: {output_path}")
    return output_path


# ── FastAPI integration helper ─────────────────────────────────────────────────
def generate_cert_bytes(student_name: str, course_title: str, cert_id: str, issue_date: str = None) -> bytes:
    """Returns PDF as bytes for FastAPI streaming response"""
    import io
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.pdfgen import canvas as pdf_canvas

    buf = io.BytesIO()
    # Re-use generate_certificate but write to buffer
    # (simplified version for API use)
    tmp_path = f"/tmp/{cert_id}.pdf"
    generate_certificate(tmp_path, student_name, course_title, cert_id, issue_date)
    with open(tmp_path, "rb") as f:
        data = f.read()
    os.remove(tmp_path)
    return data


# ── Standalone test ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    generate_certificate(
        output_path="certs/sample_certificate.pdf",
        student_name="Priya Sharma",
        course_title="Machine Learning with Python",
        cert_id="SKP-2025-AB12CD",
        issue_date="April 23, 2025",
    )
    print("Open certs/sample_certificate.pdf to preview!")
