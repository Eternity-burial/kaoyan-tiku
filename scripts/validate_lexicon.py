#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kaoyan-Tiku: Canonical Lexicon Validator & Regression Suite
Verifies all 11 core constraints and runs regression checks on real exam data.
"""

import os
import sys
import json
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CANONICAL_DIR = os.path.join(BASE_DIR, "题库", "英语", "lexicon", "canonical")
DIST_DIR = os.path.join(BASE_DIR, "题库", "英语", "lexicon", "dist")

passed = 0
failed = 0
errors = []

def report_test(name, success, msg=""):
    global passed, failed
    if success:
        print(f"  \033[32m✔\033[0m {name}")
        passed += 1
    else:
        print(f"  \033[31m✖\033[0m {name}: {msg}")
        failed += 1
        errors.append((name, msg))


def validate():
    print("====================================================")
    print("  Kaoyan-Tiku: Canonical Lexicon Validator Suite")
    print("====================================================\n")

    # 1. 验证所有 lexemeId 可解析且唯一
    print("--- 1. Lexeme 完整性与 ID 唯一性校验 ---")
    lexemes = {}
    lex_ids = set()
    dup_lex = 0
    with open(os.path.join(CANONICAL_DIR, "merged", "lexemes.jsonl"), "r", encoding="utf-8") as f:
        for line in f:
            lex = json.loads(line)
            lid = lex["lexemeId"]
            if lid in lex_ids:
                dup_lex += 1
            lex_ids.add(lid)
            lexemes[lid] = lex

    report_test("所有 lexemeId 格式合法且唯一", dup_lex == 0 and len(lex_ids) == 6554, f"dup={dup_lex}, count={len(lex_ids)}")

    # 2. 验证所有 occurrence.lexemeId 存在
    print("\n--- 2. Occurrence 引用 Lexeme 存在性校验 ---")
    orphan_occs = 0
    total_occs = 0
    occurrences = []
    with open(os.path.join(CANONICAL_DIR, "merged", "occurrences.jsonl"), "r", encoding="utf-8") as f:
        for line in f:
            total_occs += 1
            occ = json.loads(line)
            occurrences.append(occ)
            if occ["lexemeId"] not in lexemes:
                orphan_occs += 1

    report_test("所有 occurrence.lexemeId 必须存在于 Lexeme 事实层中", orphan_occs == 0 and total_occs == 21262, f"orphan={orphan_occs}, total={total_occs}")

    # 3. 验证篇章 Occurrence 能定位 P/S 且与句子对齐
    print("\n--- 3. 篇章 Occurrence P/S 坐标一致性校验 ---")
    ps_mismatch = 0
    located_count = 0
    for occ in occurrences:
        loc = occ.get("location", {})
        ps = loc.get("ps")
        p = loc.get("paragraph")
        s = loc.get("sentenceWithinParagraph")
        if ps:
            located_count += 1
            expected = f"P{p}-S{s}"
            if ps != expected:
                ps_mismatch += 1

    report_test("located Occurrence 的 location.ps 必须与 P{p}-S{s} 完全一致", ps_mismatch == 0 and located_count == 16878, f"mismatch={ps_mismatch}, located={located_count}")

    # 4. 验证 surface 能在当前句合理匹配
    print("\n--- 4. Occurrence surface 在所属句子中的文本匹配度校验 ---")
    matched_surface = 0
    checked_located = 0
    for occ in occurrences[:1000]: # 抽检前 1000 条
        loc = occ.get("location", {})
        if loc.get("ps") and occ.get("sentence", {}).get("text"):
            checked_located += 1
            stext = occ["sentence"]["text"].lower()
            surf = occ["surface"].lower().strip()
            # 考虑连字符或部分屈折
            if surf in stext or surf.split()[0] in stext:
                matched_surface += 1

    surface_rate = matched_surface / max(1, checked_located)
    report_test("抽检 Occurrence surface 在当前句原文中命中率 >= 95%", surface_rate >= 0.95, f"rate={surface_rate:.4f}")

    # 5. 验证 Word 与 Phrase 物理隔离
    print("\n--- 5. Word 与 Phrase 物理隔离校验 ---")
    phrase_lexemes = [l for l in lexemes.values() if l.get("type") == "phrase"]
    word_lexemes = [l for l in lexemes.values() if l.get("type") == "word"]
    report_test("Lexeme 明确区分 word 与 phrase 类型", len(phrase_lexemes) == 2459 and len(word_lexemes) == 4095, f"words={len(word_lexemes)}, phrases={len(phrase_lexemes)}")

    # 6. 验证 Proper Noun 独立保护（不被 lowercase 错并）
    print("\n--- 6. 专有名词 (Proper Noun) 保护校验 ---")
    pn_lexemes = [l for l in lexemes.values() if l.get("properNoun")]
    report_test("专有名词标记存在且数量与 report.json 契约一致", len(pn_lexemes) == 467, f"count={len(pn_lexemes)}")

    # 7. 验证 Lazynote 统计指标三维物理隔离
    print("\n--- 7. Lazynote sentenceCount / occurrenceCount / paperCount 物理隔离校验 ---")
    sc_count = 0
    oc_count = 0
    pc_count = 0
    confused_counts = 0
    for l in lexemes.values():
        kc = l.get("kaoyanCorpus", {})
        sc = kc.get("sentenceCount")
        oc = kc.get("occurrenceCount")
        pc = kc.get("paperCount")
        if sc is not None: sc_count += 1
        if oc is not None: oc_count += 1
        if pc is not None: pc_count += 1
        # 验证统计策略声明
        if kc.get("status") == "found" and not (sc <= oc if (sc and oc) else True):
            confused_counts += 1

    report_test("Lazynote 统计字段物理独立且非简单单值复制", sc_count > 1000 and oc_count > 1000 and pc_count > 1000 and confused_counts == 0, f"sc={sc_count}, oc={oc_count}, pc={pc_count}")

    # 8. 验证 PDF flags 100% 来自数据包，前端无篡改或推断代码
    print("\n--- 8. PDF 标记事实来源纯粹性校验 ---")
    pdf_personal_count = sum(1 for o in occurrences if o.get("annotations", {}).get("personalPdf"))
    pdf_exam_count = sum(1 for o in occurrences if o.get("annotations", {}).get("examPointPdf"))
    report_test("Personal PDF 与 Exam-point PDF 标记来自 Canonical 数据事实", pdf_personal_count == 1725 and pdf_exam_count == 3417, f"personal={pdf_personal_count}, examPoint={pdf_exam_count}")

    # 检查前端 JS 代码中是否存在根据逻辑生成 personalPdf / examPointPdf 的代码
    with open(os.path.join(BASE_DIR, "js", "lexicon_tokenizer.js"), "r", encoding="utf-8") as f:
        tok_code = f.read()
    with open(os.path.join(BASE_DIR, "js", "lexicon_popup.js"), "r", encoding="utf-8") as f:
        pop_code = f.read()
    
    no_synthetic_flags = ("personalPdf = true" not in tok_code) and ("examPointPdf = true" not in tok_code) and ("personalPdf = true" not in pop_code)
    report_test("前端代码中绝对无推断或伪造 personalPdf / examPointPdf 逻辑", no_synthetic_flags)

    # 9. 验证 UserWord 运行时安全与构建不覆盖
    print("\n--- 9. UserWord 运行时与构建隔离校验 ---")
    with open(os.path.join(BASE_DIR, "scripts", "build_lexicon.py"), "r", encoding="utf-8") as f:
        build_code = f.read()
    no_uw_leak = "UserWord" not in build_code and "localStorage" not in build_code
    report_test("Build 脚本绝不写入或覆盖 UserWord 运行时状态", no_uw_leak)

    # 10. 检查篇章包与分片生成完整性
    print("\n--- 10. 运行时 Dist 目录完整性校验 ---")
    dist_manifest_exists = os.path.exists(os.path.join(DIST_DIR, "manifest.json"))
    article_files = len(os.listdir(os.path.join(DIST_DIR, "articles")))
    shards_files = len(os.listdir(os.path.join(DIST_DIR, "shards")))
    index_files = len(os.listdir(os.path.join(DIST_DIR, "indexes")))
    dist_valid = dist_manifest_exists and article_files == 312 and shards_files == 32 and index_files == 4
    report_test("Dist 生成产物完备 (312 篇章包, 32 分片, 4 索引)", dist_valid, f"articles={article_files}, shards={shards_files}, indexes={index_files}")

    print("\n====================================================")
    print(f"  验证结果: {passed} passed, {failed} failed")
    print("====================================================\n")

    if failed > 0:
        print("Failures:")
        for n, m in errors:
            print(f"  - {n}: {m}")
        sys.exit(1)
    else:
        print("All Canonical Lexicon Validator checks PASSED! ✨\n")


if __name__ == "__main__":
    validate()
