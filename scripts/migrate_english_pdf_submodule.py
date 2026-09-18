#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
扇贝考研英语一精读带标注 PDF 资产迁移与子模块初始化脚本
1. 遍历 D:\\tj\\822\\英一\\ 下 4 个目录 (05-17, 16, 17, 18)；
2. 利用 PyMuPDF 智能识别 考点标注版 (48份)、个人精读版 (48份) 与 词汇汇总 (1份)；
3. 规范重命名并复制至 题库/英语精读PDF/；
4. 初始化独立 Git 仓库并在 GitHub 创建 Eternity-burial/kaoyan-tiku-assets-english-pdf；
5. 推送并在主仓库注册挂载为第 13 个 Git 子模块。
"""

import os
import sys
import re
import time
import shutil
import hashlib
import subprocess
import pymupdf

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT_DIR)

SRC_DIRS = [
    r'D:\tj\822\英一\05-17',
    r'D:\tj\822\英一\16',
    r'D:\tj\822\英一\17',
    r'D:\tj\822\英一\18',
]

TARGET_REL_DIR = "题库/英语精读PDF"
TARGET_DIR = os.path.join(ROOT_DIR, "题库", "英语精读PDF")
REPO_NAME = "kaoyan-tiku-assets-english-pdf"
REPO_DESC = "考研题库 - 扇贝考研英语一真题精读与考点标注PDF资产 (2007-2018)"
GITHUB_USER = "Eternity-burial"

def get_file_md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

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

def scan_and_classify():
    print("\n--- 步骤 1: 扫描并分类源 PDF 资产 ---")
    tasks = []
    for sdir in SRC_DIRS:
        if not os.path.exists(sdir):
            raise FileNotFoundError(f"Source directory not found: {sdir}")
        for fname in os.listdir(sdir):
            if not fname.lower().endswith('.pdf'):
                continue
            fpath = os.path.join(sdir, fname)
            
            # Vocab summary check
            if '生词下载' in fname or '生词' in fname:
                rel_dest = os.path.join("词汇汇总", "扇贝考研英语一_2005-2017考纲生词与真题例句汇总.pdf")
                tasks.append({
                    "src": fpath,
                    "kind": "词汇汇总",
                    "year": "2005-2017",
                    "text": "Vocab",
                    "rel_dest": rel_dest
                })
                continue
            
            m = re.search(r'(\d{4}).*?Text\s*(\d)', fname, re.IGNORECASE)
            if not m:
                raise ValueError(f"Cannot parse year and text index from filename: {fname}")
            year, text_num = m.group(1), m.group(2)
            
            doc = pymupdf.open(fpath)
            first_text = doc[0].get_text() if len(doc) > 0 else ''
            doc.close()
            
            if '【考点标注版】' in first_text or '考纲词' in first_text or '长难句' in first_text:
                kind = "考点标注版"
                dest_name = f"英语一_{year}_阅读Text{text_num}_考点标注版.pdf"
                rel_dest = os.path.join("考点标注版", dest_name)
            elif '收藏句' in first_text or ('单词' in first_text and '考纲词' not in first_text):
                kind = "个人精读版"
                dest_name = f"英语一_{year}_阅读Text{text_num}_个人精读版.pdf"
                rel_dest = os.path.join("个人精读版", dest_name)
            else:
                raise ValueError(f"Cannot determine edition for file: {fname}")
            
            tasks.append({
                "src": fpath,
                "kind": kind,
                "year": year,
                "text": f"Text{text_num}",
                "rel_dest": rel_dest
            })
    
    print(f"  已扫描到全部 {len(tasks)} 份 PDF 资产。")
    counts = {}
    for t in tasks:
        counts[t['kind']] = counts.get(t['kind'], 0) + 1
    print(f"  分类统计: {counts}")
    assert counts.get('考点标注版') == 48, f"Expected 48 exam editions, got {counts.get('考点标注版')}"
    assert counts.get('个人精读版') == 48, f"Expected 48 personal editions, got {counts.get('个人精读版')}"
    assert counts.get('词汇汇总') == 1, f"Expected 1 vocab edition, got {counts.get('词汇汇总')}"
    return tasks

def copy_and_verify(tasks):
    print("\n--- 步骤 2: 复制并按规范重命名至目标目录 ---")
    os.makedirs(os.path.join(TARGET_DIR, "考点标注版"), exist_ok=True)
    os.makedirs(os.path.join(TARGET_DIR, "个人精读版"), exist_ok=True)
    os.makedirs(os.path.join(TARGET_DIR, "词汇汇总"), exist_ok=True)
    
    for i, t in enumerate(tasks, 1):
        dest_path = os.path.join(TARGET_DIR, t["rel_dest"])
        shutil.copy2(t["src"], dest_path)
        # Verify integrity
        src_md5 = get_file_md5(t["src"])
        dest_md5 = get_file_md5(dest_path)
        if src_md5 != dest_md5:
            raise RuntimeError(f"MD5 mismatch after copying: {t['src']} -> {dest_path}")
    
    print(f"  全部 {len(tasks)} 份文件已复制并完成 MD5 逐字节校验！")

def create_submodule_metadata():
    print("\n--- 步骤 3: 写入子模块 README 与 .gitignore ---")
    readme_content = """# 考研英语一真题阅读精读与考点标注 PDF 资产库

本仓库为 [考研题库 (kaoyan-tiku)](https://github.com/Eternity-burial/kaoyan-tiku) 的独立资源子模块（Git Submodule），专用于存储 2007 ~ 2018 年考研英语一真题阅读在扇贝精读导出的高清带标注 PDF 资产。

---

## 资产概览

- **年份跨度**：2007 年 ~ 2018 年（共 12 个年份，每年 4 篇 Text，共 48 篇阅读文本）
- **双轨版本**：每篇阅读文本均包含两个深度标注版本（48 + 48 = 96 份），外加 1 份全期词汇汇总（共 97 份 PDF，约 69.5 MB）

---

## 目录结构

```text
├── 考点标注版/                          # 官方/名师考点精解与重点高亮
│   ├── 英语一_2007_阅读Text1_考点标注版.pdf
│   ├── ...
│   └── 英语一_2018_阅读Text4_考点标注版.pdf  (48 篇)
├── 个人精读版/                          # 个人研读生词、暗记与收藏难句
│   ├── 英语一_2007_阅读Text1_个人精读版.pdf
│   ├── ...
│   └── 英语一_2018_阅读Text4_个人精读版.pdf  (48 篇)
└── 词汇汇总/
    └── 扇贝考研英语一_2005-2017考纲生词与真题例句汇总.pdf (143页完整生词库)
```

---

## 版本对比与特征说明

| 维度 | 考点标注版 (Exam Points Edition) | 个人精读版 (Personal Reading Edition) |
| :--- | :--- | :--- |
| **顶部徽章** | 带有实体大标 `【考点标注版】` | 无顶部大标 |
| **生词标签** | 标明 `考纲词`、`长难句`、`短语`（黄/蓝/紫色） | 标明 `单词`、`收藏句`（绿色） |
| **批注重点** | 侧重命题人思维、考纲核心考点与句法解构 | 侧重个人生词盲区与重点研读书签 |

---

## 在主仓库中按需使用

```bash
# 克隆主仓库后按需拉取本子模块
python scripts/sync_submodules.py init 英语精读PDF

# 或直接使用标准 git 命令
git submodule update --init "题库/英语精读PDF"
```
"""
    with open(os.path.join(TARGET_DIR, "README.md"), "w", encoding="utf-8") as f:
        f.write(readme_content)

    gitignore_content = "Thumbs.db\n.DS_Store\ndesktop.ini\n*.tmp\n"
    with open(os.path.join(TARGET_DIR, ".gitignore"), "w", encoding="utf-8") as f:
        f.write(gitignore_content)
    print("  README.md 与 .gitignore 创建完成。")

def setup_git_and_push():
    print("\n--- 步骤 4: 初始化子模块独立 Git 仓库并推送到 GitHub ---")
    dot_git = os.path.join(TARGET_DIR, ".git")
    if os.path.exists(dot_git):
        if os.path.isfile(dot_git):
            os.remove(dot_git)
        else:
            shutil.rmtree(dot_git, ignore_errors=True)

    run_cmd('git init', cwd=TARGET_DIR)
    run_cmd('git config core.quotepath false', cwd=TARGET_DIR)
    run_cmd('git config user.name "Wanyin"', cwd=TARGET_DIR)
    run_cmd('git config user.email "3114751386@qq.com"', cwd=TARGET_DIR)
    run_cmd('git config http.postBuffer 1048576000', cwd=TARGET_DIR)
    run_cmd('git branch -M main', cwd=TARGET_DIR)
    run_cmd('git add .', cwd=TARGET_DIR)
    run_cmd('git commit -m "feat(assets): initialize 考研英语一扇贝精读与考点标注PDF资产 (2007-2018)"', cwd=TARGET_DIR)

    # Check / create gh repo
    gh_full = f"{GITHUB_USER}/{REPO_NAME}"
    check_repo = run_cmd(f'gh repo view {gh_full}', check=False)
    if check_repo.returncode != 0:
        print(f"  在 GitHub 创建仓库: {gh_full} ...")
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
    print("\n--- 步骤 5: 在主仓库注册挂载子模块 ---")
    submodule_path = "题库/英语精读PDF"
    
    # Check if submodule already in .gitmodules
    gm_path = os.path.join(ROOT_DIR, ".gitmodules")
    with open(gm_path, "r", encoding="utf-8") as f:
        gm_content = f.read()
    
    if submodule_path not in gm_content:
        # Use git submodule add
        add_res = run_cmd(f'git submodule add -f -b main {remote_url} "{submodule_path}"', check=False)
        if add_res.returncode != 0:
            print("  [WARN] git submodule add -f returned non-zero, fallback to manual registration...")
            with open(gm_path, "a", encoding="utf-8") as f:
                f.write(f'\n[submodule "{submodule_path}"]\n\tpath = {submodule_path}\n\turl = {remote_url}\n\tbranch = main\n')
            # Get child commit hash
            c_res = run_cmd("git rev-parse HEAD", cwd=TARGET_DIR)
            child_sha = c_res.stdout.strip()
            run_cmd(f'git update-index --add --cacheinfo 160000 {child_sha} "{submodule_path}"')
            run_cmd('git add .gitmodules')
    else:
        print(f"  {submodule_path} 已在 .gitmodules 中注册。")
    
    print("  子模块注册完成！")

def main():
    print("==================================================")
    print("  开始执行: 扇贝英语一精读 PDF 资产归整与子模块解耦")
    print("==================================================")
    tasks = scan_and_classify()
    copy_and_verify(tasks)
    create_submodule_metadata()
    remote_url = setup_git_and_push()
    register_submodule_in_parent(remote_url)
    print("\n==================================================")
    print("  迁移与子模块初始化全部顺利完成！")
    print("==================================================")

if __name__ == '__main__':
    main()
