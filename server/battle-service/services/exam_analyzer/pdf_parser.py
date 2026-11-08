"""
PDF Document Processing Service.
Uses PyMuPDF (fitz) with graceful fallback to pypdf.
Extracts clean page-by-page text, character metrics, and structural metadata.
"""

import io
import re
from typing import Dict, Any, List, Tuple


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts text from PDF byte content.
    Returns: {
        'text': str,
        'pageCount': int,
        'charCount': int,
        'pages': List[Dict[str, Any]],
        'isLowDensity': bool
    }
    """
    pages_data: List[Dict[str, Any]] = []
    full_text_parts: List[str] = []

    # 1. Try PyMuPDF (fitz)
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page_count = len(doc)
        
        for idx in range(page_count):
            page = doc[idx]
            page_text = page.get_text("text") or ""
            clean_page = clean_extracted_text(page_text)
            pages_data.append({
                "pageNumber": idx + 1,
                "text": clean_page,
                "charCount": len(clean_page)
            })
            if clean_page:
                full_text_parts.append(f"--- [Page {idx + 1}] ---\n" + clean_page)
        
        doc.close()
        full_text = "\n\n".join(full_text_parts).strip()
        char_count = len(full_text)
        avg_density = char_count / max(1, page_count)
        
        return {
            "text": full_text,
            "pageCount": page_count,
            "charCount": char_count,
            "pages": pages_data,
            "isLowDensity": avg_density < 100,
            "engine": "pymupdf"
        }
    except Exception as e:
        # 2. Fallback to pypdf
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(pdf_bytes))
            page_count = len(reader.pages)
            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                clean_page = clean_extracted_text(page_text)
                pages_data.append({
                    "pageNumber": idx + 1,
                    "text": clean_page,
                    "charCount": len(clean_page)
                })
                if clean_page:
                    full_text_parts.append(f"--- [Page {idx + 1}] ---\n" + clean_page)
            
            full_text = "\n\n".join(full_text_parts).strip()
            char_count = len(full_text)
            avg_density = char_count / max(1, page_count)
            return {
                "text": full_text,
                "pageCount": page_count,
                "charCount": char_count,
                "pages": pages_data,
                "isLowDensity": avg_density < 100,
                "engine": "pypdf"
            }
        except Exception as e2:
            raise RuntimeError(f"PDF extraction failed across all engines: {e}; {e2}")


def clean_extracted_text(raw_text: str) -> str:
    """Sanitizes extracted PDF text removing erratic artifacts and carriage returns."""
    if not raw_text:
        return ""
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse multiple blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove control characters except tab and newline
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    return text.strip()
