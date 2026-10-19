#!/usr/bin/env python3
"""Extract the user-provided V11 release into a GitHub Pages site safely."""
from pathlib import Path
from zipfile import ZipFile
import shutil
import re
import hashlib

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "releases/Healthcare_Empire_V11_Mobile_Beta_Cloudflare.zip"
if not ARCHIVE.is_file():
    ARCHIVE = ROOT / "Healthcare_Empire_V11_Mobile_Beta_Cloudflare.zip"
SITE = ROOT / "site"
if not ARCHIVE.is_file():
    raise SystemExit(
        "Missing V11 archive. Upload Healthcare_Empire_V11_Mobile_Beta_Cloudflare.zip "
        "into releases/ on GitHub before running this workflow."
    )
if SITE.exists():
    shutil.rmtree(SITE)
SITE.mkdir()
with ZipFile(ARCHIVE) as z:
    for info in z.infolist():
        target = (SITE / info.filename).resolve()
        if not target.is_relative_to(SITE.resolve()):
            raise SystemExit("Unsafe ZIP path: " + info.filename)
        if info.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(z.read(info))
if not (SITE / "index.html").is_file():
    raise SystemExit("V11 archive missing index.html")
# V11 legacy auth-cloud.js expects a separate D1 Worker. This deployment uses
# Supabase Auth + game_saves directly instead, without a service-role key.
html = (SITE / "index.html").read_text(encoding="utf-8")
html = html.replace('<script defer src="auth-cloud.js"></script>', '')
html, engine_count = re.subn(
    r'<script>/\* Healthcare Empire V4-V10:.*?</script>',
    '<script src="healthcare-core.js"></script>', html, count=1, flags=re.S,
)
if engine_count != 1:
    raise SystemExit("V11 archive engine block not found; refusing to build with inconsistent game rules")
# Only the state bridge and public cloud configuration are retained from the archived UI.
html = re.sub(r"<script\b[^>]*\bsrc=[\"']([^\"']+)[\"'][^>]*></script>",
              lambda m: m.group(0) if m.group(1) in ("healthcare-core.js", "cloud-config.js") else "", html)
html = re.sub(r"<link\b[^>]*rel=[\"']stylesheet[\"'][^>]*>", "", html)

html = html.replace(
    "</body></html>",
    '<script defer src="v11-supabase-save.js"></script><link rel="stylesheet" href="v14-care-empire.css"><link rel="stylesheet" href="v16-animation.css"><script defer src="v16-animation.js"></script><link rel="stylesheet" href="v15-phases.css"><script defer src="v15-phases.js"></script><link rel="stylesheet" href="v17-campus.css"><script defer src="assets/v18/vendor/three.min.js"></script><script defer src="v18-models.js"></script><script defer src="v18-assets.js"></script><script defer src="v18-world.js"></script><link rel="stylesheet" href="v18-theme.css"><script defer src="v14-care-empire.js"></script><script defer src="v18-theme.js"></script></body></html>'
)
(SITE / "index.html").write_text(html, encoding="utf-8")
(SITE / "v11-supabase-save.js").write_bytes((ROOT / "v11-supabase-save.js").read_bytes())
for name in ("healthcare-core.js", "v12-ui.js", "v12-ui.css", "v12-rooms-integration.js", "v13-tycoon.js", "v13-tycoon.css", "v14-care-empire.css", "v14-assets.js", "v14-world.js", "v14-care-empire.js", "v15-phases.css", "v15-phases.js", "v16-animation.js", "v16-animation.css", "v17-campus.js", "v17-campus.css", "v18-models.js", "v18-assets.js", "v18-world.js", "v18-theme.js", "v18-theme.css"):
    (SITE / name).write_bytes((ROOT / name).read_bytes())
(SITE / "cloud-config.js").write_text(
    "window.HE_CLOUD_CONFIG = Object.freeze({"
    "supabaseUrl:'https://qrxfmymmsjsyzhvuudtj.supabase.co',"
    "supabasePublishableKey:'sb_publishable_2r38ph8nVKDipJLgkwp-AA_QgTP66Go'"
    "});\n",
    encoding="utf-8",
)
assets = ROOT / "assets"
if assets.is_dir():
    shutil.copytree(assets, SITE / "assets", dirs_exist_ok=True)
campus = ROOT / "campus"
if campus.is_dir():
    shutil.copytree(campus, SITE / "campus", dirs_exist_ok=True)
rooms = ROOT / "rooms"
if rooms.is_dir():
    shutil.copytree(rooms, SITE / "rooms", dirs_exist_ok=True)
# Version script/style URLs together so a refreshed page cannot mix cached revisions.
def version_local_asset(match):
    filename = match.group(2)
    file = SITE / filename
    if not file.is_file():
        return match.group(0)
    digest = hashlib.sha256(file.read_bytes()).hexdigest()[:12]
    return match.group(1) + filename + "?v=" + digest + match.group(3)

html = (SITE / "index.html").read_text(encoding="utf-8")
html = re.sub(r"((?:src|href)=[\"'])([^\"'?#]+\.(?:js|css))([\"'])", version_local_asset, html)
(SITE / "index.html").write_text(html, encoding="utf-8")
(SITE / ".nojekyll").write_text("", encoding="utf-8")
print("V11 ready:", len(list(SITE.rglob("*"))), "entries")
