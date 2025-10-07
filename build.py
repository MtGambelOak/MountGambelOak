import json
import os
import shutil
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
import markdown

SRC_DIR = "app"
TEMPLATES = os.path.join(SRC_DIR, "templates")
STATIC = os.path.join(SRC_DIR, "static")
DIST = "dist"
BLOG_POSTS_FILE = os.path.join(SRC_DIR, "blog", "blog_posts.json")
WORDS_PER_MINUTE = 200
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
