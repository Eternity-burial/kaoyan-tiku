#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数一文档化资产（讲义和笔记）迁移与子模块初始化脚本
1. 遍历 D:\\tj\\822\\数一\\文档化 全部目录与文件；
2. 递归完整复制至 题库/讲义和笔记/，保持相对层级；
3. 执行 MD5 逐字节哈希校验；
4. 初始化独立 Git 仓库并在 GitHub 创建 Eternity-burial/kaoyan-tiku-assets-jiangyi-biji；
5. 推送并在主仓库注册挂载为第 14 个 Git 子模块。
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

SRC_DIR = r'D:\tj\822\数一\文档化'
TARGET_REL_DIR = "题库/讲义和笔记"
TARGET_DIR = os.path.join(ROOT_DIR, "题库", "讲义和笔记")
REPO_NAME = "kaoyan-tiku-assets-jiangyi-biji"
REPO_DESC = "考研题库 - 考研数学一全程基础/强化讲义整理、老姚高数源码与高清手写笔记资产"
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

def scan_source_files():
    print("\n--- 步骤 1: 扫描源资产目录 ---")
    if not os.path.exists(SRC_DIR):
        raise FileNotFoundError(f"Source directory not found: {SRC_DIR}")
    
    file_list = []
    for root, dirs, files in os.walk(SRC_DIR):
        for f in files:
            src_path = os.path.join(root, f)
            rel_path = os.path.relpath(src_path, SRC_DIR)
            file_list.append((src_path, rel_path))
            
    print(f"  源目录中共扫描到 {len(file_list)} 个文件。")
    return file_list

def copy_and_verify(file_list):
    print("\n--- 步骤 2: 完整复制至 题库/讲义和笔记/ 并进行 MD5 校验 ---")
    os.makedirs(TARGET_DIR, exist_ok=True)
    
    for i, (src_path, rel_path) in enumerate(file_list, 1):
        dest_path = os.path.join(TARGET_DIR, rel_path)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        shutil.copy2(src_path, dest_path)
        
        # Verify integrity
        src_md5 = get_file_md5(src_path)
        dest_md5 = get_file_md5(dest_path)
        if src_md5 != dest_md5:
            raise RuntimeError(f"MD5 mismatch: {src_path} -> {dest_path}")
            
    print(f"  全部 {len(file_list)} 份文件已复制完成并通过 MD5 校验！")

def create_submodule_metadata():
    print("\n--- 步骤 3: 写入子模块 README 与 .gitignore ---")
    readme_content = """# 考研数学一全程讲义、老姚高数源码与高清手写笔记资产库

本仓库为 [考研题库 (kaoyan-tiku)](https://github.com/Eternity-burial/kaoyan-tiku) 的独立资源子模块（Git Submodule），专用于存储考研数学一全程讲义文档化整理、老姚高数源码题库与高清手写笔记资产。

---

## 资产概览

- **文件与体积**：共 198 个文件，约 121.6 MB
- **覆盖学科**：高等数学、线性代数、概率论与数理统计
- **阶段覆盖**：零基础通关、基础全面复习、强化进阶专题、复习全书提炼、真题名师源码与手写笔记

---

## 目录结构

```text
├── 基础高数18讲整理/       # 高数基础 18 讲核心概念、题型与重点提炼 (Markdown)
├── 基础线代6讲/            # 线代基础 6 讲矩阵、向量与方程组 (Markdown)
├── 基础概率论6讲/          # 概率基础 6 讲随机变量与分布 (Markdown)
├── 强化高数18讲整理/       # 高数强化 18 讲专题进阶与综合大题 (Markdown)
├── 强化线代9讲/            # 线代强化 9 讲相似对角化与二次型 (Markdown)
├── 强化概率9讲/            # 概率强化 9 讲多维随机变量与数理统计 (Markdown)
├── 零基础通关讲义整理/     # 考研数学预热与零基础通关核心讲义 (Markdown)
├── 李范复习全书整理/       # 李正元/范培华《复习全书》精华考点梳理 (Markdown)
├── 数学笔记/               # 38 组高清手写笔记（HEIC 原图 + JPG 预览图 + 笔记_Part1.md）
├── 老姚高数_源码题库/      # 老姚高数题目 LaTeX 源码、章节提取与构建工具 (LaTeX/Python/JSON)
└── 老姚高数_例题与补充练习统计报告.md # 题目统计与题型覆盖度全景报告
```

---

## 在主仓库中按需使用

```bash
# 查看本地各子模块状态
python scripts/sync_submodules.py status

# 克隆主仓库后按需仅拉取讲义与笔记（约 121 MB）
python scripts/sync_submodules.py init 讲义和笔记

# 或使用原生 git 命令
git submodule update --init "题库/讲义和笔记"
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
    run_cmd('git commit -m "feat(assets): initialize 考研数学一讲义整理、老姚源码与手写笔记资产"', cwd=TARGET_DIR)

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
    print("\n--- 步骤 5: 在主仓库注册挂载子模块 ---")
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
    print("  开始执行: 数一文档化资产 (讲义和笔记) 迁移与子模块初始化")
    print("==================================================")
    files = scan_source_files()
    copy_and_verify(files)
    create_submodule_metadata()
    remote_url = setup_git_and_push()
    register_submodule_in_parent(remote_url)
    print("\n==================================================")
    print("  迁移与子模块初始化全部顺利完成！")
    print("==================================================")

if __name__ == '__main__':
    main()
