#!/usr/bin/env python3
"""Validate static asset references for the Magflow website."""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
MANIFEST = ROOT / "site.webmanifest"


class AssetParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.assets: set[str] = set()
        self.images: list[tuple[str, str | None]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = dict(attrs)
        if tag == "img":
            self.images.append((attr.get("src") or "", attr.get("alt")))
        for key in ("src", "href", "content"):
            value = attr.get(key)
            if not value:
                continue
            if value.startswith("https://www.magflowelektrindopersada.com/assets/"):
                value = value.replace("https://www.magflowelektrindopersada.com", "", 1)
            if value.startswith("/assets/"):
                self.assets.add(value)


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    parser = AssetParser()
    parser.feed(INDEX.read_text(encoding="utf-8"))

    missing = []
    for asset in sorted(parser.assets):
        path = ROOT / asset.lstrip("/")
        if not path.is_file():
            missing.append(asset)
    if missing:
        fail("Missing asset files:\n" + "\n".join(missing))

    bad_alt = [src for src, alt in parser.images if alt is None or not alt.strip()]
    if bad_alt:
        fail("Images missing alt text:\n" + "\n".join(bad_alt))

    json.loads(MANIFEST.read_text(encoding="utf-8"))

    print(f"OK: {len(parser.assets)} asset references exist; {len(parser.images)} images have alt text; manifest JSON parses.")


if __name__ == "__main__":
    main()
