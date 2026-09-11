#!/usr/bin/env python3
"""Regenerates public/assets/qr.svg (only needed if the URL ever changes).
   pip install qrcode   →   python3 scripts/make-qr.py"""
import qrcode, qrcode.image.svg, re
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=2)
qr.add_data("https://kanep.es/apmeklejums"); qr.make(fit=True)
qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).save("public/assets/qr.svg")
s = open("public/assets/qr.svg").read()
s = re.sub(r'<\?xml[^>]*>\s*', '', s).replace('<svg ', '<svg role="img" aria-label="QR kods: kanep.es/apmeklejums" ', 1)
open("public/assets/qr.svg", "w").write(s)
print("public/assets/qr.svg atjaunots")
