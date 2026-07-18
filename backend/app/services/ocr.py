import re
from io import BytesIO

import pytesseract
from PIL import Image

_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
_PHONE_RE = re.compile(r"(\+?\d[\d\-\s()]{7,}\d)")
_WEBSITE_RE = re.compile(r"(?:https?://)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/\S*)?")
_TITLE_KEYWORDS = (
    "founder", "ceo", "cto", "coo", "manager", "director", "engineer", "designer",
    "consultant", "president", "head", "lead", "vp", "specialist", "executive",
    "developer", "analyst", "architect", "officer",
)


class ExtractedCard:
    def __init__(self) -> None:
        self.full_name: str | None = None
        self.title: str | None = None
        self.company: str | None = None
        self.email: str | None = None
        self.phone: str | None = None
        self.website: str | None = None
        self.raw_text: str = ""


def extract_card_fields(image_bytes: bytes) -> ExtractedCard:
    """
    Runs OCR over a photographed business card and applies light heuristics
    to split the raw text into structured fields. This is intentionally
    conservative: it never guesses fields it isn't reasonably confident
    about, and the frontend always shows a review/edit step before saving,
    so false negatives are far cheaper than false positives here.
    """
    result = ExtractedCard()

    image = Image.open(BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")

    raw_text = pytesseract.image_to_string(image)
    result.raw_text = raw_text

    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    remaining_lines: list[str] = []

    for line in lines:
        if result.email is None:
            match = _EMAIL_RE.search(line)
            if match:
                result.email = match.group(0)
                continue
        if result.phone is None:
            match = _PHONE_RE.search(line)
            if match and len(re.sub(r"\D", "", match.group(0))) >= 8:
                result.phone = match.group(0).strip()
                continue
        if result.website is None:
            match = _WEBSITE_RE.search(line)
            if match and "@" not in line:
                result.website = match.group(0)
                continue
        remaining_lines.append(line)

    # Heuristic: a line containing a role keyword is the title.
    for line in remaining_lines:
        if any(keyword in line.lower() for keyword in _TITLE_KEYWORDS):
            result.title = line
            remaining_lines.remove(line)
            break

    # Heuristic: the first remaining line (usually largest/topmost text) is the name,
    # the next remaining line is the company.
    if remaining_lines:
        result.full_name = remaining_lines[0]
    if len(remaining_lines) > 1:
        result.company = remaining_lines[1]

    return result
