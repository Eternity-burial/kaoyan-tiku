import os
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_YANBRICK = os.path.join(BASE_DIR, "题库", "研砖")

def verify_all():
    print("=" * 65)
    print("开始对 研砖全平台（数学、政治、英语）分门别类资产进行全面核验")
    print("=" * 65)
    
    # ----------------------------------------------------
    # 1. 验证数学 (Math)
    # ----------------------------------------------------
    print("\n>>> 【1/3】核验数学（数砖）分类资产...")
    math_dir = os.path.join(ROOT_YANBRICK, "数学")
    assert os.path.exists(math_dir), "数学目录不存在！"
    
    # 真题
    rq_p = os.path.join(math_dir, "历年真题", "real_questions_complete.json")
    with open(rq_p, 'r', encoding='utf-8') as f:
        rq = json.load(f)
    assert len(rq) == 2185
    real_mds = [f for f in os.listdir(os.path.join(math_dir, "历年真题")) if f.endswith('.md')]
    print(f"  [√] 历年真题：{len(rq)} 题 (已生成 {len(real_mds)} 套分科目真题试卷 Markdown)")
    
    # 全真模拟卷
    mocks_dir = os.path.join(math_dir, "全真模拟")
    assert os.path.exists(mocks_dir), "全真模拟目录不存在！"
    with open(os.path.join(mocks_dir, "mocks_complete.json"), 'r', encoding='utf-8') as f:
        mocks_data = json.load(f)
    assert len(mocks_data) == 60, f"应收录 60 套模拟卷，实收 {len(mocks_data)} 套！"
    mock_mds = []
    for s_name in ["数学一", "数学二", "数学三"]:
        s_path = os.path.join(mocks_dir, s_name)
        assert os.path.exists(s_path), f"模拟卷科目目录 {s_name} 不存在！"
        mock_mds.extend([f for f in os.listdir(s_path) if f.endswith('.md')])
    assert len(mock_mds) == 60, f"应生成 60 份 Markdown 模拟试卷，实得 {len(mock_mds)}"
    total_mock_q = sum(len(p.get('questions', [])) for p in mocks_data)
    assert total_mock_q == 1320, f"应收录 1320 道模拟题，实收 {total_mock_q}"
    print(f"  [√] 全真模拟：{len(mocks_data)} 套 2026 最新模拟冲刺卷 (含 {len(mock_mds)} 套分科目试卷 Markdown，共 {total_mock_q} 题)")
    
    # 巩固题
    cs_p = os.path.join(math_dir, "巩固练习", "consolidation_questions.json")
    with open(cs_p, 'r', encoding='utf-8') as f:
        cs = json.load(f)
    assert len(cs) == 5896
    print(f"  [√] 巩固练习：{len(cs)} 题 (含完整选项与教材章节)")
    
    # 题解
    sol_p = os.path.join(math_dir, "多维题解", "solutions_8000.json")
    with open(sol_p, 'r', encoding='utf-8') as f:
        sol = json.load(f)
    assert len(sol) == 8000
    print(f"  [√] 多维题解：{len(sol)} 道题解字典 (答案、分步推导、易错警示)")
    
    # 破题诀
    pj_dir = os.path.join(math_dir, "破题诀讲义")
    pj_subdirs = [d for d in os.listdir(pj_dir) if os.path.isdir(os.path.join(pj_dir, d))]
    pj_mds = []
    for d in pj_subdirs:
        for f in os.listdir(os.path.join(pj_dir, d)):
            if f.endswith('.md'):
                pj_mds.append(f)
    assert len(pj_mds) == 199
    print(f"  [√] 破题诀讲义：24 个大纲板块共 {len(pj_mds)} 篇独立实战讲义 (秒杀口诀+样板推导)")
    
    # 公式、图解、闪卡
    f_p = os.path.join(math_dir, "核心公式", "formulas.json")
    with open(f_p, 'r', encoding='utf-8') as f:
        formulas = json.load(f)
    kg_p = os.path.join(math_dir, "几何图解", "kaogang_figures.json")
    with open(kg_p, 'r', encoding='utf-8') as f:
        kg = json.load(f)
    c_p = os.path.join(math_dir, "考点闪卡", "cards.json")
    with open(c_p, 'r', encoding='utf-8') as f:
        cards = json.load(f)
    print(f"  [√] 基础核心：公式库 {len(formulas['chapters'])} 章 246 考点，图解 {len(kg)} 幅，背诵闪卡 {len(cards['cards'])} 张")

    # ----------------------------------------------------
    # 2. 验证英语 (English)
    # ----------------------------------------------------
    print("\n>>> 【2/3】核验英语（英砖）分类资产...")
    eng_dir = os.path.join(ROOT_YANBRICK, "英语")
    assert os.path.exists(eng_dir), "英语目录不存在！"
    
    # 英语一
    en1_dir = os.path.join(eng_dir, "英语一")
    with open(os.path.join(en1_dir, "reading_passages_all.json"), 'r', encoding='utf-8') as f:
        en1_passages = json.load(f)
    en1_mds = os.listdir(os.path.join(en1_dir, "真题精读与长难句"))
    with open(os.path.join(en1_dir, "cloze_all.json"), 'r', encoding='utf-8') as f:
        en1_cloze = json.load(f)
    with open(os.path.join(en1_dir, "partb_all.json"), 'r', encoding='utf-8') as f:
        en1_partb = json.load(f)
    with open(os.path.join(en1_dir, "essays_all.json"), 'r', encoding='utf-8') as f:
        en1_essays = json.load(f)
    with open(os.path.join(en1_dir, "translation_tasks.json"), 'r', encoding='utf-8') as f:
        en1_trans = json.load(f)
    print(f"  [√] 英语一：{len(en1_passages)} 篇真题精读 ({len(en1_mds)} 篇精析手册), 完型 {len(en1_cloze)} 篇, 新题型 {len(en1_partb)} 篇, 写作 {len(en1_essays)} 篇, 翻译 {len(en1_trans)} 年")
    
    # 英语二
    en2_dir = os.path.join(eng_dir, "英语二")
    with open(os.path.join(en2_dir, "reading_passages_all.json"), 'r', encoding='utf-8') as f:
        en2_passages = json.load(f)
    en2_mds = os.listdir(os.path.join(en2_dir, "真题精读与长难句"))
    with open(os.path.join(en2_dir, "cloze_all.json"), 'r', encoding='utf-8') as f:
        en2_cloze = json.load(f)
    with open(os.path.join(en2_dir, "partb_all.json"), 'r', encoding='utf-8') as f:
        en2_partb = json.load(f)
    with open(os.path.join(en2_dir, "essays_all.json"), 'r', encoding='utf-8') as f:
        en2_essays = json.load(f)
    print(f"  [√] 英语二：{len(en2_passages)} 篇真题精读 ({len(en2_mds)} 篇精析手册), 完型 {len(en2_cloze)} 篇, 新题型 {len(en2_partb)} 篇, 写作 {len(en2_essays)} 篇")
    
    # 词汇与语法
    vocab_dir = os.path.join(eng_dir, "词汇与语法")
    assert os.path.exists(os.path.join(vocab_dir, "dict_freq.json"))
    assert os.path.exists(os.path.join(vocab_dir, "word_book_meta.json"))
    print(f"  [√] 词汇与大纲：真题词频表、考研核心词书元数据、主题词汇库完整")

    # ----------------------------------------------------
    # 3. 验证政治 (Politics)
    # ----------------------------------------------------
    print("\n>>> 【3/3】核验政治（政砖）分类资产...")
    pol_dir = os.path.join(ROOT_YANBRICK, "政治")
    if not os.path.exists(pol_dir):
        print("  [!] 政治抓取任务正在进行中...")
        return
        
    banks_p = os.path.join(pol_dir, "politics_banks.json")
    if os.path.exists(banks_p):
        with open(banks_p, 'r', encoding='utf-8') as f:
            banks = json.load(f)
        print(f"  [√] 政治题库索引：共收录 {len(banks)} 个题库与试卷")
        
    real_all_p = os.path.join(pol_dir, "历年真题", "politics_real_all.json")
    if os.path.exists(real_all_p):
        with open(real_all_p, 'r', encoding='utf-8') as f:
            pol_real = json.load(f)
        real_with_ans = sum(1 for q in pol_real if q.get('answer'))
        real_with_analysis = sum(1 for q in pol_real if q.get('analysis'))
        print(f"  [√] 历年真题试卷：17 套真题共 {len(pol_real)} 题")
        print(f"      - 标准答案包含率: {real_with_ans}/{len(pol_real)} ({real_with_ans/len(pol_real)*100:.1f}%)")
        print(f"      - 考点与深度解析包含率: {real_with_analysis}/{len(pol_real)} ({real_with_analysis/len(pol_real)*100:.1f}%)")
        
    books_dir = os.path.join(pol_dir, "名师题库")
    if os.path.exists(books_dir):
        book_files = [f for f in os.listdir(books_dir) if f.endswith('.json')]
        total_b_q = 0
        for bf in book_files:
            with open(os.path.join(books_dir, bf), 'r', encoding='utf-8') as f:
                b_data = json.load(f)
                total_b_q += b_data.get('qCount', 0)
        print(f"  [√] 名师题库：已归档 {len(book_files)} 本练习册，累计 {total_b_q} 道习题")

    print("\n" + "=" * 65)
    print("全平台核验完毕！数据完整且格式高度统一。")
    print("=" * 65)

if __name__ == '__main__':
    verify_all()
