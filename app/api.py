import json
from pathlib import Path
import markdown

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.status import HTTP_404_NOT_FOUND

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")
templates.env.auto_reload = True
templates.env.cache = {}

_BASE_DIR = Path(__file__).resolve().parent
_BLOG_POSTS_FILE = _BASE_DIR / "blog_posts.json"
try:
    with _BLOG_POSTS_FILE.open("r", encoding="utf-8") as f:
        raw_posts = json.load(f)
        BLOG_POSTS = sorted(
            (dict(post) for post in raw_posts),
            key=lambda post: post.get("date", ""),
            reverse=True,
        )
except FileNotFoundError:
    BLOG_POSTS = []

WORDS_PER_MINUTE = 200

def add_derived_metadata(post):
    post = dict(post)
    content_path = _BASE_DIR / post.get("content", "")
    try:
        markdown_text = content_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        markdown_text = ""

    if markdown_text:
        md = markdown.Markdown(extensions=["fenced_code", "tables", "toc"])
        html = md.convert(markdown_text)
        toc_tokens = md.toc_tokens or []
        headings = []
        for token in toc_tokens:
            if token.get("level") == 2:
                headings.append({"id": token.get("id"), "title": token.get("name")})
        md.reset()

        post["content_html"] = html
        post["headings"] = headings
        word_count = len(markdown_text.split())
        post["reading_time_minutes"] = max(1, round(word_count / WORDS_PER_MINUTE))
    else:
        post["content_html"] = ""
        post["headings"] = []

    return post

BLOG_POSTS = [add_derived_metadata(post) for post in BLOG_POSTS]

POSTS_BY_SLUG = {post.get("slug"): post for post in BLOG_POSTS if post.get("slug")}

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    latest_post = BLOG_POSTS[0] if BLOG_POSTS else None
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "latest_post": latest_post}
    )


@router.get("/resume", response_class=HTMLResponse)
async def resume(request: Request):
    return templates.TemplateResponse("resume.html", {"request": request, "active_page": "resume"})


@router.get("/resume/", response_class=HTMLResponse, include_in_schema=False)
async def resume_slash(request: Request):
    return templates.TemplateResponse("resume.html", {"request": request, "active_page": "resume"})


@router.get("/resume.html", response_class=HTMLResponse, include_in_schema=False)
async def resume_html(request: Request):
    return templates.TemplateResponse("resume.html", {"request": request, "active_page": "resume"})


@router.get("/projects", response_class=HTMLResponse)
async def projects(request: Request):
    return templates.TemplateResponse("projects.html", {"request": request, "active_page": "projects"})


@router.get("/projects/", response_class=HTMLResponse, include_in_schema=False)
async def projects_slash(request: Request):
    return templates.TemplateResponse("projects.html", {"request": request, "active_page": "projects"})


@router.get("/projects.html", response_class=HTMLResponse, include_in_schema=False)
async def projects_html(request: Request):
    return templates.TemplateResponse("projects.html", {"request": request, "active_page": "projects"})


@router.get("/blog", response_class=HTMLResponse)
async def blog(request: Request):
    all_tags = sorted({tag for post in BLOG_POSTS for tag in post.get("tags", [])})
    return templates.TemplateResponse(
        "blog.html",
        {
            "request": request,
            "active_page": "blog",
            "posts": BLOG_POSTS,
            "all_tags": all_tags,
        },
    )


@router.get("/blog/", response_class=HTMLResponse, include_in_schema=False)
async def blog_slash(request: Request):
    all_tags = sorted({tag for post in BLOG_POSTS for tag in post.get("tags", [])})
    return templates.TemplateResponse(
        "blog.html",
        {
            "request": request,
            "active_page": "blog",
            "posts": BLOG_POSTS,
            "all_tags": all_tags,
        },
    )


@router.get("/blog.html", response_class=HTMLResponse, include_in_schema=False)
async def blog_html(request: Request):
    all_tags = sorted({tag for post in BLOG_POSTS for tag in post.get("tags", [])})
    return templates.TemplateResponse(
        "blog.html",
        {
            "request": request,
            "active_page": "blog",
            "posts": BLOG_POSTS,
            "all_tags": all_tags,
        },
    )


@router.get("/blog/{slug}", response_class=HTMLResponse)
async def blog_post(request: Request, slug: str):
    try:
        index = next(i for i, p in enumerate(BLOG_POSTS) if p.get("slug") == slug)
    except StopIteration:
        return templates.TemplateResponse(
            "404.html",
            {"request": request, "page_type": "404"},
            status_code=HTTP_404_NOT_FOUND,
        )

    post = BLOG_POSTS[index]
    prev_post = BLOG_POSTS[index - 1] if index > 0 else None
    next_post = BLOG_POSTS[index + 1] if index + 1 < len(BLOG_POSTS) else None

    return templates.TemplateResponse(
        "blog/post.html",
        {
            "request": request,
            "active_page": "blog",
            "post": post,
            "prev_post": prev_post,
            "next_post": next_post,
        },
    )


@router.get("/holiday-trivia", response_class=HTMLResponse, include_in_schema=False)
async def holiday_trivia(request: Request):
    return templates.TemplateResponse("404.html", {"request": request, "page_type": "trivia"})


@router.get("/404", response_class=HTMLResponse, include_in_schema=False)
async def preview_404(request: Request):
    return templates.TemplateResponse("404.html", {"request": request, "page_type": "404"}, status_code=HTTP_404_NOT_FOUND)


@router.get("/{remaining_path:path}", response_class=HTMLResponse, include_in_schema=False)
async def catch_all(request: Request, remaining_path: str):
    return templates.TemplateResponse("404.html", {"request": request, "page_type": "404"}, status_code=HTTP_404_NOT_FOUND)
