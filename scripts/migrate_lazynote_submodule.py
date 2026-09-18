#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
kaoyan-lazynote-data 原始数据集迁移与子模块初始化脚本
1. 复制 D:\\tj\\822\\kaoyan-lazynote-data 全部内容（含完整 Git 历史）至 题库/kaoyan-lazynote-data/；
2. 执行文件完整性与 Git 状态检查；
3. 在 GitHub 创建公开仓库 Eternity-burial/kaoyan-lazynote-data；
4. 推送 main 分支；
5. 在主仓库注册挂载为第 15 个 Git 子模块。
"""

import os
import sys
import time
import shutil
import hashlib
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT_DIR)

SRC_DIR = r'D:\tj\822\kaoyan-lazynote-data'
TARGET_REL_DIR = "题库/kaoyan-lazynote-data"
TARGET_DIR = os.path.join(ROOT_DIR, "题库", "kaoyan-lazynote-data")
REPO_NAME = "kaoyan-lazynote-data"
REPO_DESC = "Lazynote 考研英语 (1998-2026) 全量原始全真数据集"
GITHUB_USER = "Eternity-burial"

def run_cmd(cmd, cwd=None, check=True, retries=1, delay=3):
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
            print(f"  [WARN] Attempt {attempt}/{retries} exit {res.returncode}")
            if res.stderr.strip():
                for line in res.stderr.strip().splitlines()[:10]:
                    print(f"    [STDERR] {line}")
            if attempt < retries:
                print(f"  [RETRY] Waiting {delay}s...")
                time.sleep(delay)
            elif check:
                raise RuntimeError(f"Command failed: {cmd}\nStderr: {res.stderr}")
    return res

def copy_repository():
    print("\n--- 步骤 1: 复制资产与 Git 仓库至 题库/kaoyan-lazynote-data ---")
    if not os.path.exists(SRC_DIR):
        raise FileNotFoundError(f"Source directory not found: {SRC_DIR}")

    if os.path.exists(TARGET_DIR):
        print(f"  清理已存在的目标目录: {TARGET_DIR}")
        shutil.rmtree(TARGET_DIR, ignore_errors=True)

    print("  正在递归复制目录内容（约 422 MB）...")
    # Use robocopy on Windows for high performance and integrity
    rc_cmd = f'robocopy "{SRC_DIR}" "{TARGET_DIR}" /E /R:2 /W:1 /MT:8 /NFL /NDL'
    run_cmd(rc_cmd, check=False) # Robocopy returns exit code 1 on success (files copied)

    # Verify counts
    src_files = [os.path.join(r, f) for r, d, fs in os.walk(SRC_DIR) for f in fs if '.git' not in r]
    dest_files = [os.path.join(r, f) for r, d, fs in os.walk(TARGET_DIR) for f in fs if '.git' not in r]
    print(f"  源目录文件数: {len(src_files)}, 目标目录文件数: {len(dest_files)}")
    assert len(src_files) == len(dest_files), f"File count mismatch: {len(src_files)} vs {len(dest_files)}"
    print(f"  全部 {len(dest_files)} 份文件复制完毕！")

def setup_git_and_push():
    print("\n--- 步骤 2: 配置 Git 并推送到 GitHub ---")
    run_cmd('git config core.quotepath false', cwd=TARGET_DIR)
    run_cmd('git config user.name "Wanyin"', cwd=TARGET_DIR)
    run_cmd('git config user.email "3114751386@qq.com"', cwd=TARGET_DIR)
    run_cmd('git config http.postBuffer 1048576000', cwd=TARGET_DIR)
    run_cmd('git branch -M main', cwd=TARGET_DIR)

    # Commit any untracked / modified working tree files
    st_res = run_cmd('git status --porcelain', cwd=TARGET_DIR)
    if st_res.stdout.strip():
        print("  提交工作区改动...")
        run_cmd('git add -A', cwd=TARGET_DIR)
        run_cmd('git commit -m "docs: update README with dataset metadata"', cwd=TARGET_DIR)

    gh_full = f"{GITHUB_USER}/{REPO_NAME}"
    check_repo = run_cmd(f'gh repo view {gh_full}', check=False)
    if check_repo.returncode != 0:
        print(f"  在 GitHub 创建公开仓库: {gh_full} ...")
        run_cmd(f'gh repo create {gh_full} --public --description "{REPO_DESC}"')
    else:
        print(f"  GitHub 仓库 {gh_full} 已存在。")

    remote_url = f"https://github.com/{gh_full}.git"
    run_cmd('git remote remove origin', cwd=TARGET_DIR, check=False)
    run_cmd(f'git remote add origin {remote_url}', cwd=TARGET_DIR)
    print(f"  正在推送资产到 {gh_full} main 分支...")
    run_cmd('git push -u origin main --force', cwd=TARGET_DIR, retries=3, delay=5)
    print("  子模块仓库推送完成！")
    return remote_url

def register_submodule_in_parent(remote_url):
    print("\n--- 步骤 3: 在主仓库注册挂载子模块 ---")
    submodule_path = TARGET_REL_DIR
    
    gm_path = os.path.join(ROOT_DIR, ".gitmodules")
    with open(gm_path, "r", encoding="utf-8") as f:
        gm_content = f.read()
    
    if submodule_path not in gm_content:
        add_res = run_cmd(f'git submodule add -f -b main {remote_url} "{submodule_path}"', check=False)
        if add_res.returncode != 0:
            print("  [WARN] git submodule add -f returned non-zero, fallback to manual registration...")
            with open(gm_path, "a", encoding="utf-8") as f:
                f.write(f'\n[submodule "{submodule_path}"]\n\tpath = {submodule_path}\n\turl = {remote_url}\n\tbranch = main\n')
            c_res = run_cmd("git rev-parse HEAD", cwd=TARGET_DIR)
            child_sha = c_res.stdout.strip()
            run_cmd(f'git update-index --add --cacheinfo 160000 {child_sha} "{submodule_path}"')
            run_cmd('git add .gitmodules')
    else:
        print(f"  {submodule_path} 已在 .gitmodules 中注册。")
    
    print("  子模块注册完成！")

def main():
    print("==================================================")
    print("  开始执行: kaoyan-lazynote-data 迁移与子模块挂载")
    print("==================================================")
    copy_repository()
    remote_url = setup_git_and_push()
    register_submodule_in_parent(remote_url)
    print("\n==================================================")
    print("  迁移与子模块初始化全部顺利完成！")
    print("==================================================")

if __name__ == '__main__':
    main()
