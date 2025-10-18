import json
import os
import shutil
import subprocess
from datetime import UTC, datetime
from pathlib import Path
from xml.etree.ElementTree import Element, ElementTree, SubElement
from typing import Optional
from jinja2 import Environment, FileSystemLoader
import markdown

SRC_DIR = "app"
TEMPLATES = os.path.join(SRC_DIR, "templates")
STATIC = os.path.join(SRC_DIR, "static")
DIST = "dist"
BLOG_POSTS_FILE = os.path.join(SRC_DIR, "blog", "blog_posts.json")
HOLIDAY_DETAILS_FILE = os.path.join(STATIC, "data", "holiday-details.json")
THEME_CSS_SCRIPT = Path(SRC_DIR) / "static" / "js" / "generate-theme-css.js"
WORDS_PER_MINUTE = 200
DEFAULT_SITE_BASE_URL = "https://mountgambeloak.dev"
SITE_BASE_URL = os.environ.get("SITE_BASE_URL", DEFAULT_SITE_BASE_URL).rstrip("/") or DEFAULT_SITE_BASE_URL
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
REPO_ROOT = Path(__file__).resolve().parent
BLOG_POSTS = []
if os.path.exists(BLOG_POSTS_FILE):
    with open(BLOG_POSTS_FILE, "r", encoding="utf-8") as f:
        raw_posts = json.load(f)
        BLOG_POSTS = []
        for post in raw_posts:
            post = dict(post)
            content_path = Path(SRC_DIR) / post.get("content", "")
            try:
                markdown_text = content_path.read_text(encoding="utf-8")
            except FileNotFoundError:
                markdown_text = ""

            if markdown_text:
                md = markdown.Markdown(extensions=["fenced_code", "tables", "toc"])
                html = md.convert(markdown_text)
                headings = []
                for token in md.toc_tokens or []:
                    if token.get("level") == 2:
                        headings.append({"id": token.get("id"), "title": token.get("name")})
                post["headings"] = headings
                post["content_html"] = html
                md.reset()
                word_count = len(markdown_text.split())
                post["reading_time_minutes"] = max(1, round(word_count / WORDS_PER_MINUTE))
            else:
                post["headings"] = []
                post["content_html"] = ""
            BLOG_POSTS.append(post)
        BLOG_POSTS.sort(key=lambda post: post.get("date", ""), reverse=True)

# Holiday details
DEFAULT_HOLIDAY_DETAILS = {
    "emoji": "🗻",
    "accent": "sage",
    "title": "Seasonal Snapshot",
    "fact": "Something went horribly wrong!",
}


def load_holiday_details():
    if os.path.exists(HOLIDAY_DETAILS_FILE):
        try:
            with open(HOLIDAY_DETAILS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                merged = DEFAULT_HOLIDAY_DETAILS.copy()
                merged.update({k: v for k, v in data.items() if v is not None})
                return merged
        except (json.JSONDecodeError, OSError):
            pass
    return DEFAULT_HOLIDAY_DETAILS.copy()


HOLIDAY_DETAILS = load_holiday_details()


# Derived metadata for templates
BUILD_TIME = datetime.now(UTC)


def resolve_favicon_version(details):
    stamp = details.get("generatedAt")
    if isinstance(stamp, str) and stamp:
        date_part = stamp.split("T", 1)[0]
        return date_part.replace("-", "")
    return BUILD_TIME.strftime("%Y%m%d")


FAVICON_VERSION = resolve_favicon_version(HOLIDAY_DETAILS)
STATIC_VERSION = BUILD_TIME.strftime("%Y%m%d%H%M%S")
CURRENT_YEAR = BUILD_TIME.year
BUILD_DATE = BUILD_TIME.date().isoformat()


def get_git_last_modified_timestamp(paths) -> Optional[str]:
    if isinstance(paths, (str, Path)):
        candidates = [paths]
    else:
        candidates = [*paths]
    normalized = []
    for candidate in candidates:
        if not candidate:
            continue
        candidate_path = Path(candidate)
        if not candidate_path.is_absolute():
            candidate_path = REPO_ROOT / candidate_path
        if not candidate_path.exists():
            continue
        try:
            relative_path = candidate_path.relative_to(REPO_ROOT)
            normalized.append(str(relative_path))
        except ValueError:
            normalized.append(str(candidate_path))
    if not normalized:
        return None
    try:
        result = subprocess.run(
            ["git", "-C", str(REPO_ROOT), "log", "-1", "--format=%cI", "--", *normalized],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    timestamp = result.stdout.strip()
    return timestamp or None


def normalize_lastmod(value) -> Optional[str]:
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    if hasattr(value, "isoformat"):
        try:
            return value.isoformat()
        except TypeError:
            pass
    if isinstance(value, str):
        sanitized = value.replace("Z", "+00:00")
        try:
            parsed = datetime.fromisoformat(sanitized)
        except ValueError:
            return value
        return parsed.date().isoformat()
    return value


# Generate accent CSS before copying assets
def generate_theme_css():
    script_path = THEME_CSS_SCRIPT
    if not script_path.exists():
        return
    try:
        subprocess.run(["node", str(script_path)], check=True)
    except FileNotFoundError:
        print("Warning: Node.js not found; skipping accent CSS generation.")
    except subprocess.CalledProcessError as exc:
        print(f"Warning: Failed to generate theme accent CSS ({exc}).")


generate_theme_css()


def remove_directory(path: str) -> None:
    if not os.path.exists(path):
        return

    shutil.rmtree(path, ignore_errors=True)
    if not os.path.exists(path):
        return

    for root, dirs, files in os.walk(path, topdown=False):
        for name in files:
            try:
                os.unlink(os.path.join(root, name))
            except FileNotFoundError:
                continue
        for name in dirs:
            dir_path = os.path.join(root, name)
            try:
                os.rmdir(dir_path)
            except OSError:
                continue
    try:
        os.rmdir(path)
    except OSError as err:
        raise RuntimeError(f"Failed to remove existing '{path}' directory") from err


# Clean output dir
remove_directory(DIST)
os.makedirs(DIST, exist_ok=True)

# Copy static assets
shutil.copytree(STATIC, os.path.join(DIST, "static"))

# Setup Jinja
env = Environment(loader=FileSystemLoader(TEMPLATES))
env.globals["holiday_details"] = HOLIDAY_DETAILS
env.globals["favicon_version"] = FAVICON_VERSION
env.globals["current_year"] = CURRENT_YEAR
env.globals["static_version"] = STATIC_VERSION
env.globals["site_base_url"] = SITE_BASE_URL

# Render each template
# (template name, output path, include in sitemap)
pages = [
    ("index.html", "index.html", True),
    ("404.html", "404.html", False),
    ("blog.html", os.path.join("blog", "index.html"), True),
    ("projects.html", os.path.join("projects", "index.html"), True),
    ("resume.html", os.path.join("resume", "index.html"), True),
]


def normalize_output_path(output_path: str) -> str:
    return output_path.replace(os.sep, "/")


def output_path_to_url(output_path: str) -> str:
    normalized = normalize_output_path(output_path)
    if normalized == "index.html":
        return "/"
    if normalized.endswith("index.html"):
        return "/" + normalized[: -len("index.html")]
    return "/" + normalized


def add_sitemap_entry(entries, output_path: str, lastmod: Optional[str] = None) -> None:
    url_path = output_path_to_url(output_path)
    loc = f"{SITE_BASE_URL}{url_path}"
    entry = {"loc": loc}
    if lastmod:
        entry["lastmod"] = lastmod
    entries.append(entry)


def write_sitemap(entries) -> None:
    if not entries:
        return
    urlset = Element("urlset", attrib={"xmlns": SITEMAP_NS})
    for entry in entries:
        url_el = SubElement(urlset, "url")
        SubElement(url_el, "loc").text = entry["loc"]
        lastmod = entry.get("lastmod")
        if lastmod:
            SubElement(url_el, "lastmod").text = lastmod
    tree = ElementTree(urlset)
    tree.write(os.path.join(DIST, "sitemap.xml"), encoding="utf-8", xml_declaration=True)


def write_robots_txt() -> None:
    robots_path = os.path.join(DIST, "robots.txt")
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /404.html",
        f"Sitemap: {SITE_BASE_URL}/sitemap.xml",
        "",
    ]
    with open(robots_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


sitemap_entries = []

for template_name, output_path, include_in_sitemap in pages:
    tpl = env.get_template(template_name)
    context = {}
    if template_name == "blog.html":
        context["posts"] = BLOG_POSTS
        context["all_tags"] = sorted({tag for post in BLOG_POSTS for tag in post.get("tags", [])})
    elif template_name == "index.html":
        context["latest_post"] = BLOG_POSTS[0] if BLOG_POSTS else None
    html = tpl.render(**context)

    dest = os.path.join(DIST, output_path)
    dest_dir = os.path.dirname(dest)
    if dest_dir and not os.path.exists(dest_dir):
        os.makedirs(dest_dir, exist_ok=True)

    with open(dest, "w", encoding="utf-8") as f:
        f.write(html)
    if include_in_sitemap:
        page_sources = [Path(TEMPLATES) / template_name]
        if template_name in {"index.html", "blog.html"}:
            page_sources.append(BLOG_POSTS_FILE)
        raw_page_lastmod = get_git_last_modified_timestamp(page_sources) or BUILD_DATE
        page_lastmod = normalize_lastmod(raw_page_lastmod)
        add_sitemap_entry(sitemap_entries, output_path, page_lastmod)

# Render blog posts
post_template = env.get_template("blog/post.html")

if BLOG_POSTS:
    for index, post in enumerate(BLOG_POSTS):
        slug = post.get("slug")
        if not slug:
            continue

        prev_post = BLOG_POSTS[index - 1] if index > 0 else None
        next_post = BLOG_POSTS[index + 1] if index + 1 < len(BLOG_POSTS) else None
        html = post_template.render(post=post, prev_post=prev_post, next_post=next_post)

        dest = os.path.join(DIST, "blog", slug, "index.html")
        dest_dir = os.path.dirname(dest)
        if dest_dir and not os.path.exists(dest_dir):
            os.makedirs(dest_dir, exist_ok=True)

        with open(dest, "w", encoding="utf-8") as f:
            f.write(html)
        post_output_path = os.path.join("blog", slug, "index.html")
        post_sources = []
        content_path = post.get("content")
        if content_path:
            post_sources.append(Path(SRC_DIR) / content_path)
        raw_post_lastmod = (
            post.get("updated")
            or get_git_last_modified_timestamp(post_sources)
            or post.get("date")
            or BUILD_DATE
        )
        post_lastmod = normalize_lastmod(raw_post_lastmod)
        add_sitemap_entry(sitemap_entries, post_output_path, post_lastmod)

write_sitemap(sitemap_entries)
write_robots_txt()
