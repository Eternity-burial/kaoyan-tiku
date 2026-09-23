#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
题库新资源 (大观园, 研砖) Git 子模块初始化与推送脚本
1. 在 题库/大观园 和 题库/研砖 初始化 Git 仓库，设置分支为 main；
2. 提交初始版本文件；
3. 在 GitHub 创建公开仓库:
   - Eternity-burial/kaoyan-tiku-assets-daguanyuan
   - Eternity-burial/kaoyan-tiku-assets-yanzhuan
4. 推送 main 分支至 GitHub 远程；
5. 在主仓库注册挂载为 Git 子模块；
6. 提交主仓库改动并推送到远程 main 分支。
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

GITHUB_USER = "Eternity-burial"

MODULES = [
    {
        "name": "大观园",
        "repo_name": "kaoyan-tiku-assets-daguanyuan",
        "desc": "大观园 (cxyonly.fans) 考研全量题库与题目来源深度分析数据集",
        "rel_dir": "题库/大观园"
    },
    {
        "name": "研砖",
        "repo_name": "kaoyan-tiku-assets-yanzhuan",
        "desc": "研砖 (yanbrick.com) 考研数学/政治/英语全量题库、破题诀讲义、长难句与试卷资产",
        "rel_dir": "题库/研砖"
    }
]

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

def init_and_push_module(m):
    mod_name = m["name"]
    repo_name = m["repo_name"]
    desc = m["desc"]
    rel_dir = m["rel_dir"]
    full_dir = os.path.join(ROOT_DIR, rel_dir.replace('/', os.sep))
    
    print(f"\n==================================================")
    print(f"  初始化子模块: {mod_name} -> {repo_name}")
    print(f"==================================================")
    
    # 1. Git init
    run_cmd('git init -b main', cwd=full_dir)
    run_cmd('git config core.quotepath false', cwd=full_dir)
    run_cmd('git config user.name "Wanyin"', cwd=full_dir)
    run_cmd('git config user.email "3114751386@qq.com"', cwd=full_dir)
    run_cmd('git config http.postBuffer 1048576000', cwd=full_dir)
    
    # 2. Git add and commit
    run_cmd('git add -A', cwd=full_dir)
    run_cmd(f'git commit -m "feat(assets): initial commit of {mod_name} dataset"', cwd=full_dir)
    
    # 3. Create GitHub repo if not exists
    gh_full = f"{GITHUB_USER}/{repo_name}"
    check_repo = run_cmd(f'gh repo view {gh_full}', check=False)
    if check_repo.returncode != 0:
        print(f"  在 GitHub 创建公开仓库: {gh_full} ...")
        run_cmd(f'gh repo create {gh_full} --public --description "{desc}"')
    else:
        print(f"  GitHub 仓库 {gh_full} 已存在。")
        
    # 4. Push to remote
    remote_url = f"https://github.com/{gh_full}.git"
    run_cmd('git remote remove origin', cwd=full_dir, check=False)
    run_cmd(f'git remote add origin {remote_url}', cwd=full_dir)
    
    print(f"  正在推送资产到 {gh_full} main 分支...")
    run_cmd('git push -u origin main --force', cwd=full_dir, retries=3, delay=5)
    print(f"  子模块仓库 {repo_name} 推送完成！")
    return remote_url

def register_submodules(results):
    print(f"\n==================================================")
    print(f"  在主仓库注册挂载子模块")
    print(f"==================================================")
    
    gm_path = os.path.join(ROOT_DIR, ".gitmodules")
    with open(gm_path, "r", encoding="utf-8") as f:
        gm_content = f.read()
        
    for m, remote_url in results:
        submodule_path = m["rel_dir"]
        if submodule_path not in gm_content:
            add_res = run_cmd(f'git submodule add -f -b main {remote_url} "{submodule_path}"', check=False)
            if add_res.returncode != 0:
                print(f"  [WARN] git submodule add returned non-zero for {submodule_path}, fallback to manual...")
                with open(gm_path, "a", encoding="utf-8") as f:
                    f.write(f'\n[submodule "{submodule_path}"]\n\tpath = {submodule_path}\n\turl = {remote_url}\n\tbranch = main\n')
                c_res = run_cmd("git rev-parse HEAD", cwd=os.path.join(ROOT_DIR, submodule_path.replace('/', os.sep)))
                child_sha = c_res.stdout.strip()
                run_cmd(f'git update-index --add --cacheinfo 160000 {child_sha} "{submodule_path}"')
                run_cmd('git add .gitmodules')
        else:
            print(f"  {submodule_path} 已在 .gitmodules 中注册。")
            
        run_cmd(f'git submodule init "{submodule_path}"', check=False)
        run_cmd(f'git add .gitmodules "{submodule_path}"')

    # Commit and push in parent repo
    st = run_cmd('git status -s')
    if st.stdout.strip():
        print("  提交主仓库更改...")
        run_cmd('git commit -m "feat(submodule): register 大观园 and 研砖 dataset submodules"')
        
    current_branch = run_cmd('git branch --show-current').stdout.strip()
    print(f"  推送到主仓库 origin/{current_branch} ...")
    run_cmd(f'git push origin {current_branch}', retries=3, delay=5)
    print("  主仓库推送完成！")

def main():
    print("==================================================")
    print("  开始执行: 题库新资源子模块初始化与推送")
    print("==================================================")
    results = []
    for m in MODULES:
        remote_url = init_and_push_module(m)
        results.append((m, remote_url))
        
    register_submodules(results)
    
    print("\n==================================================")
    print("  全部任务圆满完成！")
    print("==================================================")

if __name__ == '__main__':
    main()
