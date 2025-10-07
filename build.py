import json
import os
import shutil
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import re

SRC_DIR = "app"
TEMPLATES = os.path.join(SRC_DIR, "templates")
STATIC = os.path.join(SRC_DIR, "static")
DIST = "dist"
BLOG_POSTS_FILE = os.path.join(SRC_DIR, "blog_posts.json")
WORDS_PER_MINUTE = 200
BLOG_POSTS = []
if os.path.exists(BLOG_POSTS_FILE):
    with open(BLOG_POSTS_FILE, "r", encoding="utf-8") as f:
        raw_posts = json.load(f)
        BLOG_POSTS = []
        heading_pattern = re.compile(r'<h2>(.*?)</h2>', re.DOTALL)

        for post in raw_posts:
            post = dict(post)
            template = post.get("template")
            if template:
                path = Path(TEMPLATES) / template
                try:
                    content = path.read_text(encoding="utf-8")
                    word_count = len(content.split())
                    post["reading_time_minutes"] = max(1, round(word_count / WORDS_PER_MINUTE))
                    headings = []
                    for match in heading_pattern.finditer(content):
                        text = match.group(1).strip()
                        slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
                        headings.append({"id": slug, "title": text})
                    post["headings"] = headings
                except FileNotFoundError:
                    pass
            BLOG_POSTS.append(post)
        BLOG_POSTS.sort(key=lambda post: post.get("date", ""), reverse=True)

# Clean output dir
if os.path.exists(DIST):
    shutil.rmtree(DIST)
os.makedirs(DIST)

# Copy static assets
shutil.copytree(STATIC, os.path.join(DIST, "static"))

# Setup Jinja
env = Environment(loader=FileSystemLoader(TEMPLATES))

# Render each template
# (template name, output path)
pages = [
    ("footer.html", "footer.html"),
    ("header.html", "header.html"),
    ("index.html", "index.html"),
    ("404.html", "404.html"),
    ("blog.html", os.path.join("blog", "index.html")),
    ("projects.html", os.path.join("projects", "index.html")),
    ("resume.html", os.path.join("resume", "index.html")),
]

for template_name, output_path in pages:
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

# Render blog posts
if BLOG_POSTS:
    for index, post in enumerate(BLOG_POSTS):
        template_name = post.get("template")
        slug = post.get("slug")
        if not template_name or not slug:
            continue

        tpl = env.get_template(template_name)
        prev_post = BLOG_POSTS[index - 1] if index > 0 else None
        next_post = BLOG_POSTS[index + 1] if index + 1 < len(BLOG_POSTS) else None
        html = tpl.render(post=post, prev_post=prev_post, next_post=next_post)

        dest = os.path.join(DIST, "blog", slug, "index.html")
        dest_dir = os.path.dirname(dest)
        if dest_dir and not os.path.exists(dest_dir):
            os.makedirs(dest_dir, exist_ok=True)

        with open(dest, "w", encoding="utf-8") as f:
            f.write(html)
