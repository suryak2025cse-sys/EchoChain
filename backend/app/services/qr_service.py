import io
import base64
import qrcode
from qrcode.image.svg import SvgImage
from typing import Dict, Any


from app.core.config import settings


class QRService:
    @classmethod
    def get_frontend_base_url(cls) -> str:
        return (settings.FRONTEND_URL or "http://localhost:5173").rstrip("/")

    DEFAULT_FRONTEND_BASE_URL = property(lambda self: self.get_frontend_base_url())

    @classmethod
    def generate_product_id(cls, product_type: str, count: int) -> str:
        """
        Generates unique EchoChain Product ID.
        Format: ECH-[TYPE]-2026-[SEQ:0001] (e.g. ECH-COFFEE-2026-0001)
        """
        clean_type = "".join(c for c in str(product_type).upper() if c.isalnum()) or "GENERIC"
        return f"ECH-{clean_type}-2026-{count:04d}"

    @classmethod
    def generate_qr_b64(cls, verification_url: str) -> str:
        """
        Generates a Base64 encoded PNG QR code pointing to public verification URL.
        """
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=2,
        )
        qr.add_data(verification_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64_str}"

    @classmethod
    def generate_qr_svg(cls, verification_url: str) -> str:
        """
        Generates an SVG XML string of the QR code.
        """
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=2,
            image_factory=SvgImage
        )
        qr.add_data(verification_url)
        qr.make(fit=True)
        img = qr.make_image()
        buf = io.BytesIO()
        img.save(buf)
        return buf.getvalue().decode("utf-8")
