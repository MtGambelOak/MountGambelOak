import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
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
        BLOG_POSTS = json.load(f)
except FileNotFoundError:
    BLOG_POSTS = []

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
    return templates.TemplateResponse(
        "blog.html",
        {"request": request, "active_page": "blog", "posts": BLOG_POSTS},
    )


@router.get("/blog/", response_class=HTMLResponse, include_in_schema=False)
async def blog_slash(request: Request):
    return templates.TemplateResponse(
        "blog.html",
        {"request": request, "active_page": "blog", "posts": BLOG_POSTS},
    )


@router.get("/blog.html", response_class=HTMLResponse, include_in_schema=False)
async def blog_html(request: Request):
    return templates.TemplateResponse(
        "blog.html",
        {"request": request, "active_page": "blog", "posts": BLOG_POSTS},
    )


@router.get("/blog/{slug}", response_class=HTMLResponse)
async def blog_post(request: Request, slug: str):
    post = POSTS_BY_SLUG.get(slug)
    if not post:
        raise HTTPException(status_code=404)
    return templates.TemplateResponse(
        post["template"],
        {"request": request, "active_page": "blog", "post": post},
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
