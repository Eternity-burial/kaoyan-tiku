#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
考研题库子模块管理与同步工具 (Submodule Sync Utility)
用于一键按需拉取、全量同步或查看题库 12 本书籍切图资源的本地状态。
"""

import os
import sys
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT_DIR)

BOOKS = [
    "真题分类", "小题300", "强化240", "老姚高数", "夜雨强化",
    "强化36讲", "822教材", "基础30讲", "1000题", "李范习题", "李范全书", "880"
]

def run_cmd(cmd):
    full_cmd = f'chcp 65001 >nul && {cmd}'
    res = subprocess.run(full_cmd, shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res

def get_dir_size(path):
    if not os.path.exists(path):
        return 0
    total = 0
    for root, dirs, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            if not os.path.islink(fp):
                try:
                    total += os.path.getsize(fp)
                except Exception:
                    pass
    return total

def print_status():
    print("==================================================")
    print("  考研题库书籍图片子模块状态概览")
    print("==================================================")
    print(f"{'书籍目录':<12} | {'本地状态':<10} | {'文件数':<8} | {'占用空间':<10}")
    print("-" * 50)
    
    total_size = 0
    total_files = 0
    
    for book in BOOKS:
        bp = os.path.join(ROOT_DIR, "题库", book)
        if os.path.exists(bp):
            files = [os.path.join(r, f) for r, d, fs in os.walk(bp) for f in fs if not f.startswith('.git')]
            f_count = len(files)
            size_mb = get_dir_size(bp) / (1024 * 1024)
            status = "已下载" if f_count > 0 else "未拉取"
            total_size += size_mb
            total_files += f_count
            print(f"{book:<12} | {status:<10} | {f_count:<8} | {size_mb:6.1f} MB")
        else:
            print(f"{book:<12} | {'未初始化':<10} | {'0':<8} | {'0.0 MB':<10}")
            
    print("-" * 50)
    print(f"{'总计':<12} | {'-':<10} | {total_files:<8} | {total_size:6.1f} MB\n")

def pull_all():
    print("正在拉取/更新全部 12 本书的图片子模块...")
    res = run_cmd('git submodule update --init --recursive')
    if res.returncode == 0:
        print("[OK] 全部书籍子模块同步成功！")
    else:
        print(f"[WARN] 同步过程中出现提示：\n{res.stderr or res.stdout}")
    print_status()

def init_selective(books):
    paths = []
    for b in books:
        matched = [k for k in BOOKS if b in k]
        if matched:
            paths.append(f'"题库/{matched[0]}"')
        else:
            paths.append(f'"题库/{b}"')
    cmd = f'git submodule update --init {" ".join(paths)}'
    print(f"执行按需拉取: {cmd}")
    res = run_cmd(cmd)
    if res.returncode == 0:
        print("[OK] 指定书籍子模块拉取完成！")
    else:
        print(f"[WARN] {res.stderr or res.stdout}")
    print_status()

def main():
    if len(sys.argv) < 2 or sys.argv[1] == 'status':
        print_status()
        print("可用命令:")
        print("  python scripts/sync_submodules.py status           # 查看本地书籍下载状态")
        print("  python scripts/sync_submodules.py pull             # 一键拉取/更新全部 12 本书")
        print("  python scripts/sync_submodules.py init 880 1000题   # 按需仅拉取指定书籍")
    elif sys.argv[1] == 'pull':
        pull_all()
    elif sys.argv[1] == 'init':
        init_selective(sys.argv[2:])
    else:
        print(f"未知参数: {sys.argv[1]}")

if __name__ == '__main__':
    main()
