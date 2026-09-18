#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
考研题库静态图片资源子模块化（Git Submodules）迁移脚本
将题库 12 本书的切图大文件自动剥离并迁移为独立 GitHub 仓库，
并通过标准 Git Submodules 挂载于主仓库的 题库/<书名> 路径下。
"""

import os
import sys
import time
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT_DIR)

BOOKS = [
    {"dir": "真题分类", "repo": "kaoyan-tiku-assets-zhentifenlei", "desc": "考研题库 - 控制工程真题分类题图资源"},
    {"dir": "小题300", "repo": "kaoyan-tiku-assets-xiaoti300", "desc": "考研题库 - 822小题300题图资源"},
    {"dir": "强化240", "repo": "kaoyan-tiku-assets-qianghua240", "desc": "考研题库 - 822强化240题图资源"},
    {"dir": "老姚高数", "repo": "kaoyan-tiku-assets-laoyaogaoshu", "desc": "考研题库 - 老姚高数基础强化题图资源"},
    {"dir": "夜雨强化", "repo": "kaoyan-tiku-assets-yeyuqianghua", "desc": "考研题库 - 夜雨强化题图资源"},
    {"dir": "强化36讲", "repo": "kaoyan-tiku-assets-qianghua36jiang", "desc": "考研题库 - 强化36讲题图资源"},
    {"dir": "822教材", "repo": "kaoyan-tiku-assets-822jiaocai", "desc": "考研题库 - 822控制工程教材题图资源"},
    {"dir": "基础30讲", "repo": "kaoyan-tiku-assets-jichu30jiang", "desc": "考研题库 - 基础30讲题图资源"},
    {"dir": "1000题", "repo": "kaoyan-tiku-assets-1000ti", "desc": "考研题库 - 张宇1000题题图资源"},
    {"dir": "李范习题", "repo": "kaoyan-tiku-assets-lifanxiti", "desc": "考研题库 - 李范强化习题题图资源"},
    {"dir": "李范全书", "repo": "kaoyan-tiku-assets-lifanquanshu", "desc": "考研题库 - 李范复习全书题图资源"},
    {"dir": "880", "repo": "kaoyan-tiku-assets-880", "desc": "考研题库 - 李林880题图资源"},
]

def run_cmd(cmd, cwd=None, check=True, retries=1, delay=3):
    """Run shell command with UTF-8 codepage on Windows"""
    full_cmd = f'chcp 65001 >nul && {cmd}'
    for attempt in range(1, retries + 1):
        print(f"  [RUN] {cmd} (cwd={cwd or '.'})")
        res = subprocess.run(
            full_cmd,
            cwd=cwd or ROOT_DIR,
            shell=True,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        if res.returncode == 0:
            if res.stdout.strip():
                for line in res.stdout.strip().splitlines()[:10]:
                    print(f"    {line}")
            return res
        else:
            print(f"  [WARN] Attempt {attempt}/{retries} failed with exit code {res.returncode}")
            if res.stderr.strip():
                for line in res.stderr.strip().splitlines()[:10]:
                    print(f"    [STDERR] {line}")
            if attempt < retries:
                print(f"  [RETRY] Waiting {delay}s before retrying...")
                time.sleep(delay)
            elif check:
                raise RuntimeError(f"Command failed: {cmd}\nStderr: {res.stderr}")
    return res

def is_submodule_registered(book_dir):
    """Check if book_dir is already in .gitmodules"""
    gm_path = os.path.join(ROOT_DIR, '.gitmodules')
    if not os.path.exists(gm_path):
        return False
    try:
        with open(gm_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
            return f'题库/{book_dir}' in content
    except Exception:
        return False

def migrate_book(book_info):
    book_dir_name = book_info["dir"]
    repo_name = book_info["repo"]
    desc = book_info["desc"]
    book_path = os.path.join(ROOT_DIR, "题库", book_dir_name)
    submodule_rel_path = f"题库/{book_dir_name}"

    print(f"\n==================================================")
    print(f"  Processing Book: {book_dir_name} -> {repo_name}")
    print(f"==================================================")

    if is_submodule_registered(book_dir_name):
        print(f"  [SKIP] {submodule_rel_path} is already registered in .gitmodules.")
        return True

    # 1. Untrack from parent repo index if tracked
    print(f"  1. Removing {submodule_rel_path} from parent git index (leaving files on disk)...")
    run_cmd(f'git rm -r --cached --ignore-unmatch "{submodule_rel_path}"')

    # 2. Initialize standalone git repo inside book_path if not yet initialized
    dot_git = os.path.join(book_path, ".git")
    if not os.path.exists(dot_git) or os.path.isfile(dot_git):
        if os.path.isfile(dot_git):
            # If it's an old gitdir pointer file without valid config, remove it to fresh init
            os.remove(dot_git)
        print(f"  2. Initializing git repository in {submodule_rel_path}...")
        run_cmd('git init', cwd=book_path)
        run_cmd('git config core.quotepath false', cwd=book_path)
        run_cmd('git config user.name "Wanyin"', cwd=book_path)
        run_cmd('git config user.email "3114751386@qq.com"', cwd=book_path)
        run_cmd('git config http.postBuffer 1048576000', cwd=book_path)
        run_cmd('git branch -M main', cwd=book_path)

        # Write child .gitignore
        child_ignore = os.path.join(book_path, ".gitignore")
        if not os.path.exists(child_ignore):
            with open(child_ignore, 'w', encoding='utf-8') as f:
                f.write("Thumbs.db\n.DS_Store\ndesktop.ini\n*.tmp\n")

        run_cmd('git add .', cwd=book_path)
        run_cmd(f'git commit -m "feat(assets): initialize {book_dir_name} image assets repository"', cwd=book_path)

    # 3. Check/Create GitHub remote repository via gh
    gh_repo_full = f"Eternity-burial/{repo_name}"
    print(f"  3. Checking if GitHub repository {gh_repo_full} exists...")
    check_repo = run_cmd(f'gh repo view {gh_repo_full}', check=False)
    if check_repo.returncode != 0:
        print(f"     Creating public repository {gh_repo_full} on GitHub...")
        run_cmd(f'gh repo create {gh_repo_full} --public --description "{desc}"')
    else:
        print(f"     GitHub repository {gh_repo_full} already exists.")

    # 4. Push book repo to GitHub
    print(f"  4. Configuring remote and pushing {book_dir_name} to GitHub...")
    remote_url = f"https://github.com/{gh_repo_full}.git"
    run_cmd('git remote remove origin', cwd=book_path, check=False)
    run_cmd(f'git remote add origin {remote_url}', cwd=book_path)
    run_cmd('git push -u origin main --force', cwd=book_path, retries=3, delay=5)

    # 5. Add submodule in parent repo
    print(f"  5. Adding submodule {submodule_rel_path} to parent repo...")
    run_cmd(f'git submodule add -b main {remote_url} "{submodule_rel_path}"')
    print(f"  [OK] Successfully migrated and registered {book_dir_name}!")
    return True

def main():
    target_books = BOOKS
    if len(sys.argv) > 1:
        selected_dirs = sys.argv[1:]
        target_books = [b for b in BOOKS if b["dir"] in selected_dirs or b["repo"] in selected_dirs]
        print(f"Filtering migration to {len(target_books)} specified books: {[b['dir'] for b in target_books]}")

    print("==================================================")
    print("  Starting Git Submodules Migration for 考研题库")
    print("==================================================")
    
    # Pre-check: Ensure git repo root
    run_cmd('git config core.quotepath false')
    
    success_count = 0
    for idx, b in enumerate(target_books, 1):
        print(f"\n[{idx}/{len(target_books)}] Processing: {b['dir']}")
        try:
            if migrate_book(b):
                success_count += 1
        except Exception as e:
            print(f"\n  [ERROR] Failed migrating {b['dir']}: {e}")
            print("  Halting migration so you can inspect or resume.")
            sys.exit(1)

    print("\n==================================================")
    print(f"  Migration Summary: {success_count}/{len(target_books)} books completed successfully!")
    print("==================================================")
    
    # Print status
    run_cmd('git submodule status')
    run_cmd('git status -s')

if __name__ == '__main__':
    main()
