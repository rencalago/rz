#!/usr/bin/env python3
"""Makes the smaller copies of story photos used on cards and tiles.

Run from the repo root after adding a post (needs Python 3 with Pillow):

    python3 _tools/resize-images.py

For each featured image named in allPost.js (and each destination tile photo)
it writes a 400 px and a 720 px wide copy next to it, when the copy is
clearly smaller than the original:

    Images/featured-images/w400/<name>.jpg
    Images/featured-images/w720/<name>.jpg

Copies that already exist are left alone. A width is skipped when the
original is not much wider than it. Then run node _tools/build-site.mjs: it
lists the photos that have their copies in image-variants.js, and the cards
offer those copies to the browser (srcset), so phones and laptops download a
photo close to the size they show. A photo without copies still works; it is
just served at full size, and the build prints a reminder.

Keep WIDTHS in step with VARIANT_WIDTHS in _tools/build-site.mjs.
"""
import os
import re
import sys

from PIL import Image

WIDTHS = (400, 720)
MARGIN = 40  # skip a copy when the original is less than this much wider
QUALITY = 70
KEEP_BELOW = 0.75  # keep a copy only when it is under 75% of the original's bytes

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Photos checked that got no useful copy (already small files). The build reads
# this list so it does not keep asking for copies of them.
SKIPPED_LIST = os.path.join(root, "_tools", "image-copies-skipped.txt")


def sources():
    with open(os.path.join(root, "allPost.js"), encoding="utf-8") as fh:
        text = fh.read()
    found = []
    for src in re.findall(r'imagesrc:\s*"\./(Images/[^"]+)"', text):
        if src not in found:
            found.append(src)
    dest_dir = os.path.join(root, "Images", "destinations")
    for name in sorted(os.listdir(dest_dir)):
        if name.lower().endswith((".jpg", ".jpeg")):
            found.append("Images/destinations/" + name)
    return found


def main():
    made = 0
    skipped = []
    for rel in sources():
        if not rel.lower().endswith((".jpg", ".jpeg")):
            continue
        path = os.path.join(root, rel)
        if not os.path.exists(path):
            print("Missing image (skipped):", rel)
            continue
        folder, name = os.path.split(path)
        with Image.open(path) as im:
            width, height = im.size
            has_copy = False
            for w in WIDTHS:
                if width < w + MARGIN:
                    continue
                out = os.path.join(folder, "w%d" % w, name)
                if os.path.exists(out):
                    has_copy = True
                    continue
                os.makedirs(os.path.dirname(out), exist_ok=True)
                h = round(height * w / width)
                copy = im.convert("RGB").resize((w, h), Image.LANCZOS)
                copy.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
                # Some originals are already small files; a copy that saves
                # little is not worth an extra file.
                if os.path.getsize(out) > KEEP_BELOW * os.path.getsize(path):
                    os.remove(out)
                    continue
                has_copy = True
                made += 1
            if not has_copy:
                skipped.append(rel)
    with open(SKIPPED_LIST, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("# Written by _tools/resize-images.py: photos with no useful smaller copy.\n")
        for rel in sorted(skipped):
            fh.write(rel + "\n")
    print("Made %d image copies (%d photos need none)." % (made, len(skipped)))


if __name__ == "__main__":
    sys.exit(main())
