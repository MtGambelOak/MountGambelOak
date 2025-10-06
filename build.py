import json
import os
import shutil
from jinja2 import Environment, FileSystemLoader

SRC_DIR = "app"
TEMPLATES = os.path.join(SRC_DIR, "templates")
STATIC = os.path.join(SRC_DIR, "static")
DIST = "dist"
BLOG_POSTS_FILE = os.path.join(SRC_DIR, "blog_posts.json")
BLOG_POSTS = []
if os.path.exists(BLOG_POSTS_FILE):
    with open(BLOG_POSTS_FILE, "r", encoding="utf-8") as f:
        BLOG_POSTS = json.load(f)

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
    for post in BLOG_POSTS:
        template_name = post.get("template")
        slug = post.get("slug")
        if not template_name or not slug:
            continue

        tpl = env.get_template(template_name)
        html = tpl.render(post=post)

        dest = os.path.join(DIST, "blog", slug, "index.html")
        dest_dir = os.path.dirname(dest)
        if dest_dir and not os.path.exists(dest_dir):
            os.makedirs(dest_dir, exist_ok=True)

        with open(dest, "w", encoding="utf-8") as f:
            f.write(html)
