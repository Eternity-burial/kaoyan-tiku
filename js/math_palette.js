/**
 * 考研题库 · 数学符号盘与 LaTeX 自动补全词典 (MathPalette)
 * 
 * 职责：
 *   1. 管理全部考研数学/工程常用 LaTeX 符号与希腊字母、微积分、线代、概率论词库 (MATH_PALETTE_DATA)。
 *   2. 管理常用 LaTeX 缩写自动补全词典 (AUTOCOMPLETE_DICT)。
 *   3. 提供符号快捷插入 (insertSnippetIntoNotes) 与智能括号/符号成对包裹 (wrapOrInsertPair)。
 *   4. 控制右侧常用数学符号盘的折叠、Tab 切换与网格渲染 (toggle/initMathSymbolPalette)。
 *   5. 初始化快速操作工具栏 (initNotesQuickToolbar)。
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────────
  // 考研数学常用 LaTeX 符号盘数据集
  // ─────────────────────────────────────────────────────────────────────────────
  var MATH_PALETTE_DATA = {
    calc: [
      { label: "一阶导 f'(x)", code: "f'(x)", render: "f'(x)" },
      { label: "二阶导 f''(x)", code: "f''(x)", render: "f''(x)" },
      { label: "n阶导 fⁿ(x)", code: "f^{(n)}(x)", render: "fⁿ(x)" },
      { label: "导数值 f'(x₀)", code: "f'(x_0)", render: "f'(x₀)" },
      { label: "导数 dy/dx", code: "\\frac{\\mathrm{d}y}{\\mathrm{d}x}", render: "dy/dx" },
      { label: "二阶导 d²y/dx²", code: "\\frac{\\mathrm{d}^2y}{\\mathrm{d}x^2}", render: "d²y/dx²" },
      { label: "偏导 ∂f/∂x", code: "\\frac{\\partial f}{\\partial x}", render: "∂f/∂x" },
      { label: "偏导 ∂f/∂y", code: "\\frac{\\partial f}{\\partial y}", render: "∂f/∂y" },
      { label: "二阶偏导 ∂²f/∂x²", code: "\\frac{\\partial^2 f}{\\partial x^2}", render: "∂²f/∂x²" },
      { label: "混合偏导 ∂²f/∂x∂y", code: "\\frac{\\partial^2 f}{\\partial x\\partial y}", render: "∂²f/∂x∂y" },
      { label: "方向导数 ∂u/∂l", code: "\\frac{\\partial u}{\\partial \\boldsymbol{l}}", render: "∂u/∂l" },
      { label: "梯度 grad f", code: "\\nabla f", render: "∇f" },
      { label: "散度 div F", code: "\\operatorname{div} \\boldsymbol{F}", render: "div F" },
      { label: "旋度 rot F", code: "\\operatorname{rot} \\boldsymbol{F}", render: "rot F" },
      { label: "lim(x→0)", code: "\\lim_{x \\to 0} |", render: "lim_{x→0}" },
      { label: "lim(x→∞)", code: "\\lim_{x \\to \\infty} |", render: "lim_{x→∞}" },
      { label: "lim(x→+∞)", code: "\\lim_{x \\to +\\infty} |", render: "lim_{x→+∞}" },
      { label: "lim(x→-∞)", code: "\\lim_{x \\to -\\infty} |", render: "lim_{x→-∞}" },
      { label: "右极限 lim(x→0⁺)", code: "\\lim_{x \\to 0^+} |", render: "lim_{x→0⁺}" },
      { label: "左极限 lim(x→0⁻)", code: "\\lim_{x \\to 0^-} |", render: "lim_{x→0⁻}" },
      { label: "数列极限 lim(n→∞)", code: "\\lim_{n \\to \\infty} |", render: "lim_{n→∞}" },
      { label: "趋于 lim(x→x₀)", code: "\\lim_{x \\to x_0} |", render: "lim_{x→x₀}" },
      { label: "中值定理 ξ∈(a,b)", code: "\\xi \\in (a, b)", render: "ξ∈(a,b)" },
      { label: "分式 a/b", code: "\\frac{|}{}", render: "a/b" },
      { label: "不定积分", code: "\\int | \\,\\mathrm{d}x", render: "∫f(x)dx" },
      { label: "定积分 ∫_a^b", code: "\\int_{a}^{b} | \\,\\mathrm{d}x", render: "∫_a^b" },
      { label: "二重积分 ∬_D", code: "\\iint_{D} | \\,\\mathrm{d}x\\mathrm{d}y", render: "∬_D" },
      { label: "三重积分 ∭_Ω", code: "\\iiint_{\\Omega} | \\,\\mathrm{d}x\\mathrm{d}y\\mathrm{d}z", render: "∭_Ω" },
      { label: "第一类曲线积分", code: "\\int_{L} | \\,\\mathrm{d}s", render: "∫_L ds" },
      { label: "第二类曲线积分", code: "\\oint_{L} P\\,\\mathrm{d}x + Q\\,\\mathrm{d}y", render: "∮_L Pdx+Qdy" },
      { label: "第一类曲面积分", code: "\\iint_{\\Sigma} | \\,\\mathrm{d}S", render: "∬_Σ dS" },
      { label: "第二类曲面积分", code: "\\iint_{\\Sigma} R\\,\\mathrm{d}x\\mathrm{d}y", render: "∬_Σ Rdxdy" },
      { label: "弧长微元 ds", code: "\\mathrm{d}s = \\sqrt{1 + (y')^2}\\,\\mathrm{d}x", render: "ds" },
      { label: "面积微元 dσ", code: "\\mathrm{d}\\sigma = \\sqrt{1 + z_x^2 + z_y^2}\\,\\mathrm{d}x\\mathrm{d}y", render: "dσ" },
      { label: "极坐标面积微元", code: "r\\,\\mathrm{d}r\\mathrm{d}\\theta", render: "r dr dθ" },
      { label: "柱坐标微元", code: "r\\,\\mathrm{d}r\\mathrm{d}\\theta\\mathrm{d}z", render: "r dr dθ dz" },
      { label: "球坐标微元", code: "r^2\\sin\\varphi\\,\\mathrm{d}r\\mathrm{d}\\varphi\\mathrm{d}\\theta", render: "r²sinφ dr" },
      { label: "求和 ∑", code: "\\sum_{n=1}^{\\infty} |", render: "∑" },
      { label: "幂级数 ∑ a_n x^n", code: "\\sum_{n=0}^{\\infty} a_n x^n", render: "∑a_n xⁿ" },
      { label: "收敛半径 R", code: "R = \\lim_{n \\to \\infty} \\left|\\frac{a_n}{a_{n+1}}\\right|", render: "R=|a_n/a_{n+1}|" },
      { label: "收敛区间 (-R, R)", code: "(-R, R)", render: "(-R, R)" },
      { label: "微分方程 y'+P(x)y=Q(x)", code: "y' + P(x)y = Q(x)", render: "y'+Py=Q" },
      { label: "齐次特征方程", code: "r^2 + p r + q = 0", render: "r²+pr+q=0" },
      { label: "根号 √", code: "\\sqrt{|}", render: "√" },
      { label: "n次方根", code: "\\sqrt[n]{|}", render: "ⁿ√" },
      { label: "绝对值 |x|", code: "|⦙|", render: "|x|" },
      { label: "范数 ‖x‖", code: "\\|\\boldsymbol{x}\\|", render: "‖x‖" },
      { label: "无穷大 ∞", code: "\\infty", render: "∞" },
      { label: "正无穷 +∞", code: "+\\infty", render: "+∞" },
      { label: "负无穷 -∞", code: "-\\infty", render: "-∞" },
      { label: "面积微元 dσ", code: "\\mathrm{d}\\sigma", render: "dσ" },
      { label: "微分 dy", code: "\\mathrm{d}y", render: "dy" },
      { label: "微分 dx", code: "\\mathrm{d}x", render: "dx" },
      { label: "二阶常系数齐次", code: "y'' + py' + qy = 0", render: "y''+py'+qy=0" }
    ],
    algebra: [
      { label: "根号 √x", code: "\\sqrt{|}", render: "√x" },
      { label: "立方根 ∛x", code: "\\sqrt[3]{|}", render: "∛x" },
      { label: "n次根号 ⁿ√x", code: "\\sqrt[n]{|}", render: "ⁿ√x" },
      { label: "组合数 C(n,k)", code: "\\binom{n}{k}", render: "C_n^k" },
      { label: "排列数 A(n,k)", code: "\\mathrm{A}_n^k", render: "A_n^k" },
      { label: "阶乘 n!", code: "n!", render: "n!" },
      { label: "双阶乘 (2n)!!", code: "(2n)!!", render: "(2n)!!" },
      { label: "绝对值 |x|", code: "|⦙|", render: "|x|" },
      { label: "范数 ‖x‖", code: "\\|\\boldsymbol{x}\\|", render: "‖x‖" },
      { label: "分式 a/b", code: "\\frac{|}{}", render: "a/b" },
      { label: "自然指数 e^x", code: "\\mathrm{e}^{|}", render: "e^x" },
      { label: "自然对数 ln", code: "\\ln(|)", render: "ln(x)" },
      { label: "常用对数 lg", code: "\\lg(|)", render: "lg(x)" },
      { label: "对数 log_a", code: "\\log_{a}(|)", render: "log_a(x)" },
      { label: "正弦 sin", code: "\\sin(⦙)", render: "sin" },
      { label: "余弦 cos", code: "\\cos(⦙)", render: "cos" },
      { label: "正切 tan", code: "\\tan(⦙)", render: "tan" },
      { label: "余切 cot", code: "\\cot(⦙)", render: "cot" },
      { label: "正割 sec", code: "\\sec(⦙)", render: "sec" },
      { label: "余割 csc", code: "\\csc(⦙)", render: "csc" },
      { label: "反正弦 arcsin", code: "\\arcsin(⦙)", render: "arcsin" },
      { label: "反余弦 arccos", code: "\\arccos(⦙)", render: "arccos" },
      { label: "反正切 arctan", code: "\\arctan(⦙)", render: "arctan" },
      { label: "趋于 →", code: "\\to ", render: "→" },
      { label: "推出 ⇒", code: "\\implies ", render: "⇒" },
      { label: "等价 ⇔", code: "\\iff ", render: "⇔" },
      { label: "任意 ∀", code: "\\forall ", render: "∀" },
      { label: "存在 ∃", code: "\\exists ", render: "∃" },
      { label: "因为 ∵", code: "\\because ", render: "∵" },
      { label: "所以 ∴", code: "\\therefore ", render: "∴" },
      { label: "属于 ∈", code: "\\in ", render: "∈" },
      { label: "不属于 ∉", code: "\\notin ", render: "∉" },
      { label: "真子集 ⊂", code: "\\subset ", render: "⊂" },
      { label: "子集包含 ⊆", code: "\\subseteq ", render: "⊆" },
      { label: "并集 ∪", code: "\\cup ", render: "∪" },
      { label: "交集 ∩", code: "\\cap ", render: "∩" },
      { label: "空集 ∅", code: "\\emptyset", render: "∅" },
      { label: "实数集 ℝ", code: "\\mathbb{R}", render: "ℝ" },
      { label: "自然数集 ℕ", code: "\\mathbb{N}", render: "ℕ" },
      { label: "整数集 ℤ", code: "\\mathbb{Z}", render: "ℤ" },
      { label: "复数集 ℂ", code: "\\mathbb{C}", render: "ℂ" },
      { label: "正负号 ±", code: "\\pm ", render: "±" },
      { label: "负正号 ∓", code: "\\mp ", render: "∓" },
      { label: "约等于 ≈", code: "\\approx ", render: "≈" },
      { label: "不等于 ≠", code: "\\ne ", render: "≠" },
      { label: "恒等于 ≡", code: "\\equiv ", render: "≡" },
      { label: "小于等于 ≤", code: "\\le ", render: "≤" },
      { label: "大于等于 ≥", code: "\\ge ", render: "≥" },
      { label: "远小于 ≪", code: "\\ll ", render: "≪" },
      { label: "远大于 ≫", code: "\\gg ", render: "≫" },
      { label: "等价/相似 ~", code: "\\sim ", render: "~" },
      { label: "正比于 ∝", code: "\\propto ", render: "∝" },
      { label: "无穷大 ∞", code: "\\infty", render: "∞" },
      { label: "乘号 ×", code: "\\times ", render: "×" },
      { label: "点乘 ·", code: "\\cdot ", render: "·" },
      { label: "除号 ÷", code: "\\div ", render: "÷" },
      { label: "连乘积 ∏", code: "\\prod_{i=1}^{n} |", render: "∏" },
      { label: "求和号 ∑", code: "\\sum_{i=1}^{n} |", render: "∑" },
      { label: "省略号 ...", code: "\\dots", render: "..." },
      { label: "居中省略号 ⋯", code: "\\cdots", render: "⋯" },
      { label: "竖直省略号 ⋮", code: "\\vdots", render: "⋮" },
      { label: "对角省略号 ⋱", code: "\\ddots", render: "⋱" },
      { label: "平行 ∥", code: "\\parallel", render: "∥" },
      { label: "垂直 ⊥", code: "\\perp", render: "⊥" },
      { label: "角 ∠", code: "\\angle", render: "∠" },
      { label: "度数 °", code: "^\\circ", render: "°" }
    ],
    greek: [
      { label: "α (alpha)", code: "\\alpha", render: "α" },
      { label: "β (beta)", code: "\\beta", render: "β" },
      { label: "γ (gamma)", code: "\\gamma", render: "γ" },
      { label: "δ (delta)", code: "\\delta", render: "δ" },
      { label: "ε (epsilon)", code: "\\epsilon", render: "ε" },
      { label: "ε (varepsilon/极限)", code: "\\varepsilon", render: "ε" },
      { label: "ζ (zeta)", code: "\\zeta", render: "ζ" },
      { label: "η (eta/中值点)", code: "\\eta", render: "η" },
      { label: "θ (theta/极坐标角)", code: "\\theta", render: "θ" },
      { label: "ϑ (vartheta)", code: "\\vartheta", render: "ϑ" },
      { label: "ι (iota)", code: "\\iota", render: "ι" },
      { label: "κ (kappa/曲率)", code: "\\kappa", render: "κ" },
      { label: "λ (lambda/特征值)", code: "\\lambda", render: "λ" },
      { label: "μ (mu/期望/微)", code: "\\mu", render: "μ" },
      { label: "ν (nu/自由度)", code: "\\nu", render: "ν" },
      { label: "ξ (xi/拉氏中值点)", code: "\\xi", render: "ξ" },
      { label: "π (pi/圆周率)", code: "\\pi", render: "π" },
      { label: "ϖ (varpi)", code: "\\varpi", render: "ϖ" },
      { label: "ρ (rho/极径/相关系数)", code: "\\rho", render: "ρ" },
      { label: "ϱ (varrho)", code: "\\varrho", render: "ϱ" },
      { label: "σ (sigma/方差/正应力)", code: "\\sigma", render: "σ" },
      { label: "ς (varsigma)", code: "\\varsigma", render: "ς" },
      { label: "τ (tau/参量/切应力)", code: "\\tau", render: "τ" },
      { label: "υ (upsilon)", code: "\\upsilon", render: "υ" },
      { label: "ϕ (phi)", code: "\\phi", render: "ϕ" },
      { label: "φ (varphi/方位角/高数)", code: "\\varphi", render: "φ" },
      { label: "χ (chi/卡方)", code: "\\chi", render: "χ" },
      { label: "ψ (psi)", code: "\\psi", render: "ψ" },
      { label: "ω (omega/角速度)", code: "\\omega", render: "ω" },
      { label: "Γ (Gamma/伽马函数)", code: "\\Gamma", render: "Γ" },
      { label: "Δ (Delta/增量/判别式)", code: "\\Delta", render: "Δ" },
      { label: "Θ (Theta)", code: "\\Theta", render: "Θ" },
      { label: "Λ (Lambda/对角阵)", code: "\\Lambda", render: "Λ" },
      { label: "Ξ (Xi)", code: "\\Xi", render: "Ξ" },
      { label: "Π (Pi/连乘积)", code: "\\Pi", render: "Π" },
      { label: "Σ (Sigma/求和/协方差)", code: "\\Sigma", render: "Σ" },
      { label: "Υ (Upsilon)", code: "\\Upsilon", render: "Υ" },
      { label: "Φ (Phi/正态分布函数)", code: "\\Phi", render: "Φ" },
      { label: "Ψ (Psi)", code: "\\Psi", render: "Ψ" },
      { label: "Ω (Omega/三重积分域)", code: "\\Omega", render: "Ω" }
    ],
    linalg: [
      { label: "圆括号矩阵 pmatrix", code: "\\begin{pmatrix} | & \\\\ & \\end{pmatrix}", render: "(矩阵)" },
      { label: "方括号矩阵 bmatrix", code: "\\begin{bmatrix} | & \\\\ & \\end{bmatrix}", render: "[矩阵]" },
      { label: "行列式 vmatrix", code: "\\begin{vmatrix} | & \\\\ & \\end{vmatrix}", render: "|行列式|" },
      { label: "3x3 行列式", code: "\\begin{vmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{vmatrix}", render: "|3x3|" },
      { label: "分块矩阵", code: "\\begin{pmatrix} A & B \\\\ C & D \\end{pmatrix}", render: "(分块)" },
      { label: "增广矩阵", code: "\\left( \\begin{array}{cc|c} a_{11} & a_{12} & b_1 \\\\ a_{21} & a_{22} & b_2 \\end{array} \\right)", render: "(A|b)" },
      { label: "对角矩阵 diag", code: "\\operatorname{diag}(\\lambda_1, \\lambda_2, \\dots, \\lambda_n)", render: "diag(λ)" },
      { label: "单位矩阵 E", code: "E", render: "E" },
      { label: "零矩阵 O", code: "O", render: "O" },
      { label: "转置 Aᵀ", code: "A^T", render: "Aᵀ" },
      { label: "逆矩阵 A⁻¹", code: "A^{-1}", render: "A⁻¹" },
      { label: "伴随矩阵 A*", code: "A^*", render: "A*" },
      { label: "共轭转置 A^H", code: "A^{\\mathrm{H}}", render: "A^H" },
      { label: "矩阵行列式 |A|", code: "|A|", render: "|A|" },
      { label: "矩阵的秩 r(A)", code: "r(A)", render: "r(A)" },
      { label: "矩阵的迹 tr(A)", code: "\\operatorname{tr}(A)", render: "tr(A)" },
      { label: "向量 α", code: "\\boldsymbol{\\alpha}", render: "α" },
      { label: "向量 β", code: "\\boldsymbol{\\beta}", render: "β" },
      { label: "向量 γ", code: "\\boldsymbol{\\gamma}", render: "γ" },
      { label: "向量 ξ", code: "\\boldsymbol{\\xi}", render: "ξ" },
      { label: "向量 x", code: "\\boldsymbol{x}", render: "x" },
      { label: "向量 b", code: "\\boldsymbol{b}", render: "b" },
      { label: "零向量 0", code: "\\boldsymbol{0}", render: "0" },
      { label: "内积 (α, β)", code: "(\\boldsymbol{\\alpha}, \\boldsymbol{\\beta})", render: "(α,β)" },
      { label: "向量长度 ‖α‖", code: "\\|\\boldsymbol{\\alpha}\\|", render: "‖α‖" },
      { label: "正交 α ⊥ β", code: "\\boldsymbol{\\alpha} \\perp \\boldsymbol{\\beta}", render: "α ⊥ β" },
      { label: "向量组线性无关", code: "k_1\\boldsymbol{\\alpha}_1 + \\dots + k_s\\boldsymbol{\\alpha}_s = \\boldsymbol{0}", render: "线性无关" },
      { label: "施密特正交化 β₂", code: "\\boldsymbol{\\beta}_2 = \\boldsymbol{\\alpha}_2 - \\frac{(\\boldsymbol{\\alpha}_2, \\boldsymbol{\\beta}_1)}{(\\boldsymbol{\\beta}_1, \\boldsymbol{\\beta}_1)}\\boldsymbol{\\beta}_1", render: "Schmidt" },
      { label: "齐次方程 Ax=0", code: "A\\boldsymbol{x} = \\boldsymbol{0}", render: "Ax=0" },
      { label: "非齐次 Ax=b", code: "A\\boldsymbol{x} = \\boldsymbol{b}", render: "Ax=b" },
      { label: "特征方程 |λE - A| = 0", code: "|\\lambda E - A| = 0", render: "|λE-A|=0" },
      { label: "特征多项式 f(λ)", code: "f(\\lambda) = |\\lambda E - A|", render: "f(λ)" },
      { label: "特征值与特征向量", code: "A\\boldsymbol{\\alpha} = \\lambda\\boldsymbol{\\alpha}", render: "Aα=λα" },
      { label: "相似对角化 P⁻¹AP=Λ", code: "P^{-1}AP = \\Lambda", render: "P⁻¹AP=Λ" },
      { label: "正交相似 QᵀAQ=Λ", code: "Q^{\\mathrm{T}}AQ = \\Lambda", render: "QᵀAQ=Λ" },
      { label: "相似 A ~ B", code: "A \\sim B", render: "A ~ B" },
      { label: "合同 A ≃ B", code: "A \\simeq B", render: "A ≃ B" },
      { label: "等价 A ≅ B", code: "A \\cong B", render: "A ≅ B" },
      { label: "二次型矩阵表示", code: "f(\\boldsymbol{x}) = \\boldsymbol{x}^T A \\boldsymbol{x}", render: "xᵀAx" },
      { label: "标准型 ∑ d_i y_i²", code: "\\sum_{i=1}^{r} d_i y_i^2", render: "∑d_i y_i²" },
      { label: "正定矩阵 A > 0", code: "A > 0", render: "A > 0" },
      { label: "半正定 A ≥ 0", code: "A \\ge 0", render: "A ≥ 0" }
    ],
    prob: [
      { label: "事件概率 P(A)", code: "P(A)", render: "P(A)" },
      { label: "条件概率 P(A|B)", code: "P(A \\mid B)", render: "P(A|B)" },
      { label: "积事件 P(AB)", code: "P(AB)", render: "P(AB)" },
      { label: "对立事件 A^c", code: "A^c", render: "Aᶜ" },
      { label: "和事件 A∪B", code: "A \\cup B", render: "A∪B" },
      { label: "全概率公式", code: "P(A) = \\sum_{i=1}^{n} P(B_i)P(A \\mid B_i)", render: "全概率" },
      { label: "贝叶斯公式", code: "P(B_k \\mid A) = \\frac{P(B_k)P(A \\mid B_k)}{\\sum_{i=1}^{n} P(B_i)P(A \\mid B_i)}", render: "贝叶斯" },
      { label: "数学期望 E(X)", code: "E(X)", render: "E(X)" },
      { label: "方差 D(X)", code: "D(X)", render: "D(X)" },
      { label: "协方差 Cov(X,Y)", code: "\\operatorname{Cov}(X, Y)", render: "Cov(X,Y)" },
      { label: "相关系数 ρ_xy", code: "\\rho_{XY} = \\frac{\\operatorname{Cov}(X, Y)}{\\sqrt{D(X)D(Y)}}", render: "ρ_XY" },
      { label: "分布律 P(X=x_k)", code: "P(X = x_k) = p_k", render: "P(X=x_k)" },
      { label: "概率密度 f(x)", code: "f(x)", render: "f(x)" },
      { label: "分布函数 F(x)", code: "F(x) = P(X \\le x)", render: "F(x)" },
      { label: "二项分布 B(n,p)", code: "X \\sim B(n, p)", render: "B(n,p)" },
      { label: "泊松分布 P(λ)", code: "X \\sim P(\\lambda)", render: "P(λ)" },
      { label: "均匀分布 U(a,b)", code: "X \\sim U(a, b)", render: "U(a,b)" },
      { label: "指数分布 E(λ)", code: "X \\sim E(\\lambda)", render: "E(λ)" },
      { label: "正态分布 N(μ,σ²)", code: "X \\sim N(\\mu, \\sigma^2)", render: "N(μ,σ²)" },
      { label: "标准正态 N(0,1)", code: "X \\sim N(0, 1)", render: "N(0,1)" },
      { label: "正态分布函数 Φ(x)", code: "\\Phi(x)", render: "Φ(x)" },
      { label: "卡方分布 χ²(n)", code: "\\chi^2(n)", render: "χ²(n)" },
      { label: "t 分布 t(n)", code: "t(n)", render: "t(n)" },
      { label: "F 分布 F(n₁,n₂)", code: "F(n_1, n_2)", render: "F(n₁,n₂)" },
      { label: "样本均值 X̄", code: "\\bar{X} = \\frac{1}{n}\\sum_{i=1}^{n} X_i", render: "X̄" },
      { label: "样本方差 S²", code: "S^2 = \\frac{1}{n-1}\\sum_{i=1}^{n} (X_i - \\bar{X})^2", render: "S²" },
      { label: "最大似然函数 L(θ)", code: "L(\\theta) = \\prod_{i=1}^{n} f(x_i; \\theta)", render: "L(θ)" },
      { label: "对数似然 ln L(θ)", code: "\\ln L(\\theta)", render: "ln L(θ)" },
      { label: "组合数 C_n^k", code: "\\binom{n}{k}", render: "C_n^k" },
      { label: "排列数 A_n^k", code: "A_n^k", render: "A_n^k" },
      { label: "和事件 P(A∪B)", code: "P(A \\cup B)", render: "P(A∪B)" },
      { label: "条件概率 P(A|B)", code: "P(A|B)", render: "P(A|B)" },
      { label: "全概率公式", code: "P(A) = \\sum_{i=1}^{n} P(B_i)P(A|B_i)", render: "全概率" },
      { label: "贝叶斯公式", code: "P(B_i|A) = \\frac{P(B_i)P(A|B_i)}{\\sum_{j=1}^n P(B_j)P(A|B_j)}", render: "贝叶斯" },
      { label: "标准差 σ(X)", code: "\\sqrt{D(X)}", render: "σ(X)" },
      { label: "相关系数 ρ_XY", code: "\\rho_{XY} = \\frac{\\operatorname{Cov}(X,Y)}{\\sqrt{D(X)}\\sqrt{D(Y)}}", render: "ρ_XY" },
      { label: "独立性 E(XY)=E(X)E(Y)", code: "E(XY) = E(X)E(Y)", render: "独立性" },
      { label: "方差和公式", code: "D(X \\pm Y) = D(X) + D(Y) \\pm 2\\operatorname{Cov}(X, Y)", render: "D(X±Y)" }
    ],
    templates: [
      { label: "1^∞ 型极限速算", code: "1^\\infty \\text{型: } \\lim_{x \\to |} [1+f(x)]^{\\frac{1}{f(x)} \\cdot f(x)g(x)} = \\mathrm{e}^{\\lim f(x)g(x)}", render: "1^∞极限" },
      { label: "常用等价无穷小(8大)", code: "\\sin x \\sim x, \\; \\tan x \\sim x, \\; \\arcsin x \\sim x, \\; \\arctan x \\sim x, \\; \\ln(1+x) \\sim x, \\; \\mathrm{e}^x-1 \\sim x, \\; (1+x)^\\alpha-1 \\sim \\alpha x, \\; 1-\\cos x \\sim \\frac{1}{2}x^2", render: "8大等价" },
      { label: "e^x 麦克劳林展开", code: "\\mathrm{e}^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + o(x^3)", render: "e^x展开" },
      { label: "sin x 麦克劳林展开", code: "\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} + o(x^5)", render: "sin展开" },
      { label: "cos x 麦克劳林展开", code: "\\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} + o(x^4)", render: "cos展开" },
      { label: "ln(1+x) 展开", code: "\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\frac{x^4}{4} + o(x^4)", render: "ln(1+x)" },
      { label: "1/(1-x) 展开", code: "\\frac{1}{1-x} = 1 + x + x^2 + x^3 + o(x^3)", render: "1/(1-x)" },
      { label: "(1+x)^α 二项展开", code: "(1+x)^\\alpha = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2!}x^2 + o(x^2)", render: "(1+x)^α" },
      { label: "arctan x 展开", code: "\\arctan x = x - \\frac{x^3}{3} + \\frac{x^5}{5} + o(x^5)", render: "arctan" },
      { label: "tan x 展开", code: "\\tan x = x + \\frac{1}{3}x^3 + \\frac{2}{15}x^5 + o(x^5)", render: "tan展开" },
      { label: "华里士/点火公式 (Wallis)", code: "I_n = \\int_0^{\\frac{\\pi}{2}} \\sin^n x \\,\\mathrm{d}x = \\begin{cases} \\frac{n-1}{n}\\frac{n-3}{n-2}\\cdots\\frac{1}{2}\\frac{\\pi}{2}, & n \\text{ 为偶数} \\\\ \\frac{n-1}{n}\\frac{n-3}{n-2}\\cdots\\frac{2}{3}\\cdot 1, & n \\text{ 为奇数} \\end{cases}", render: "点火公式" },
      { label: "高阶导莱布尼茨公式", code: "(uv)^{(n)} = \\sum_{k=0}^n \\binom{n}{k} u^{(n-k)} v^{(k)}", render: "莱布尼茨" },
      { label: "柯西-施瓦茨不等式", code: "\\left( \\int_a^b f(x)g(x)\\,\\mathrm{d}x \\right)^2 \\le \\left( \\int_a^b f^2(x)\\,\\mathrm{d}x \\right) \\left( \\int_a^b g^2(x)\\,\\mathrm{d}x \\right)", render: "柯西不等式" },
      { label: "格林公式 (平面)", code: "\\oint_L P\\,\\mathrm{d}x + Q\\,\\mathrm{d}y = \\iint_D \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) \\mathrm{d}x\\mathrm{d}y", render: "格林公式" },
      { label: "高斯公式 (空间)", code: "\\oiint_\\Sigma P\\,\\mathrm{d}y\\mathrm{d}z + Q\\,\\mathrm{d}z\\mathrm{d}x + R\\,\\mathrm{d}x\\mathrm{d}y = \\iiint_\\Omega \\left( \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y} + \\frac{\\partial R}{\\partial z} \\right) \\mathrm{d}V", render: "高斯公式" },
      { label: "施密特正交化步骤", code: "\\boldsymbol{\\beta}_1 = \\boldsymbol{\\alpha}_1, \\quad \\boldsymbol{\\beta}_2 = \\boldsymbol{\\alpha}_2 - \\frac{(\\boldsymbol{\\alpha}_2, \\boldsymbol{\\beta}_1)}{(\\boldsymbol{\\beta}_1, \\boldsymbol{\\beta}_1)}\\boldsymbol{\\beta}_1", render: "正交化" },
      { label: "重点解析引用块", code: "> **重点解析**：|", render: "重点解析" },
      { label: "易错警示引用块", code: "> **易错警示**：|", render: "易错警示" }
    ]
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // LaTeX 自动补全词典
  // ─────────────────────────────────────────────────────────────────────────────
  var AUTOCOMPLETE_DICT = [
    { key: 'fx', insert: "f(x)", desc: "函数 f(x)", preview: "f(x)" },
    { key: 'gx', insert: "g(x)", desc: "函数 g(x)", preview: "g(x)" },
    { key: 'df', insert: "\\frac{\\mathrm{d}f}{\\mathrm{d}x}", desc: "全导数 df/dx", preview: "df/dx" },
    { key: 'dydx', insert: "\\frac{\\mathrm{d}y}{\\mathrm{d}x}", desc: "导数 dy/dx", preview: "dy/dx" },
    { key: 'fp', insert: "f'(x)", desc: "一阶导数 f'(x)", preview: "f'(x)" },
    { key: 'fprime', insert: "f'(x)", desc: "一阶导数 f'(x)", preview: "f'(x)" },
    { key: 'fpp', insert: "f''(x)", desc: "二阶导数 f''(x)", preview: "f''(x)" },
    { key: 'fn', insert: "f^{(n)}(x)", desc: "n阶导数 fⁿ(x)", preview: "fⁿ(x)" },
    { key: 'f0', insert: "f'(x_0)", desc: "导数值 f'(x₀)", preview: "f'(x₀)" },
    { key: 'lim', insert: '\\lim_{x \\to \\infty} |', desc: '极限(趋于无穷)', preview: 'lim_{x→∞}' },
    { key: 'lim0', insert: '\\lim_{x \\to 0} |', desc: '极限(趋于0)', preview: 'lim_{x→0}' },
    { key: 'liminf', insert: '\\lim_{x \\to \\infty} |', desc: '极限(趋于无穷)', preview: 'lim_{x→∞}' },
    { key: 'limp', insert: '\\lim_{x \\to 0^+} |', desc: '右极限(趋于0+)', preview: 'lim_{x→0⁺}' },
    { key: 'limm', insert: '\\lim_{x \\to 0^-} |', desc: '左极限(趋于0-)', preview: 'lim_{x→0⁻}' },
    { key: 'frac', insert: '\\frac{|}{}', desc: '分式', preview: 'a/b' },
    { key: 'sqrt', insert: '\\sqrt{|}', desc: '平方根', preview: '√' },
    { key: 'cbrt', insert: '\\sqrt[3]{|}', desc: '立方根', preview: '∛' },
    { key: 'uint', insert: '\\int | \\,\\mathrm{d}x', desc: '不定积分 ∫f(x)dx', preview: '∫' },
    { key: 'int', insert: '\\int | \\,\\mathrm{d}x', desc: '不定积分 ∫f(x)dx', preview: '∫' },
    { key: 'dint', insert: '\\int_{|}^{} \\,\\mathrm{d}x', desc: '定积分 ∫_a^b', preview: '∫_a^b' },
    { key: 'iint', insert: '\\iint_{D} | \\,\\mathrm{d}x\\mathrm{d}y', desc: '二重积分', preview: '∬' },
    { key: 'iiint', insert: '\\iiint_{\\Omega} | \\,\\mathrm{d}x\\mathrm{d}y\\mathrm{d}z', desc: '三重积分', preview: '∭' },
    { key: 'oint', insert: '\\oint_{L} P\\,\\mathrm{d}x + Q\\,\\mathrm{d}y', desc: '闭合曲线积分', preview: '∮' },
    { key: 'sum', insert: '\\sum_{i=1}^{n} |', desc: '求和 ∑', preview: '∑' },
    { key: 'infsum', insert: '\\sum_{n=1}^{\\infty} |', desc: '无穷级数求和', preview: '∑_{n=1}^∞' },
    { key: 'prod', insert: '\\prod_{i=1}^{n} |', desc: '连乘 ∏', preview: '∏' },
    { key: 'partial', insert: '\\frac{\\partial |}{\\partial x}', desc: '偏导数 ∂/∂x', preview: '∂/∂x' },
    { key: 'grad', insert: '\\nabla f', desc: '梯度 ∇f', preview: '∇f' },
    { key: 'matrix', insert: '\\begin{pmatrix} | & \\\\ & \\end{pmatrix}', desc: '常用矩阵', preview: '(矩阵)' },
    { key: 'pmatrix', insert: '\\begin{pmatrix} | & \\\\ & \\end{pmatrix}', desc: '圆括号矩阵', preview: '(矩阵)' },
    { key: 'bmatrix', insert: '\\begin{bmatrix} | & \\\\ & \\end{bmatrix}', desc: '方括号矩阵', preview: '[矩阵]' },
    { key: 'vmatrix', insert: '\\begin{vmatrix} | & \\\\ & \\end{vmatrix}', desc: '行列式', preview: '|行列式|' },
    { key: 'det', insert: '|A|', desc: '行列式 |A|', preview: '|A|' },
    { key: 'diag', insert: '\\operatorname{diag}(\\lambda_1, \\lambda_2, \\dots, \\lambda_n)', desc: '对角矩阵', preview: 'diag(λ)' },
    { key: 'alpha', insert: '\\alpha', desc: '阿尔法', preview: 'α' },
    { key: 'beta', insert: '\\beta', desc: '贝塔', preview: 'β' },
    { key: 'gamma', insert: '\\gamma', desc: '伽马', preview: 'γ' },
    { key: 'delta', insert: '\\delta', desc: '德尔塔', preview: 'δ' },
    { key: 'eps', insert: '\\varepsilon', desc: '艾普西隆/极限', preview: 'ε' },
    { key: 'epsilon', insert: '\\epsilon', desc: '艾普西隆', preview: 'ε' },
    { key: 'varepsilon', insert: '\\varepsilon', desc: '变体艾普西隆', preview: 'ε' },
    { key: 'zeta', insert: '\\zeta', desc: '泽塔', preview: 'ζ' },
    { key: 'eta', insert: '\\eta', desc: '艾塔/中值点', preview: 'η' },
    { key: 'theta', insert: '\\theta', desc: '西塔/极坐标角', preview: 'θ' },
    { key: 'vartheta', insert: '\\vartheta', desc: '变体西塔', preview: 'ϑ' },
    { key: 'iota', insert: '\\iota', desc: '约塔', preview: 'ι' },
    { key: 'kappa', insert: '\\kappa', desc: '卡帕/曲率', preview: 'κ' },
    { key: 'lambda', insert: '\\lambda', desc: '兰姆达/特征值', preview: 'λ' },
    { key: 'mu', insert: '\\mu', desc: '缪/期望/微', preview: 'μ' },
    { key: 'nu', insert: '\\nu', desc: '纽/自由度', preview: 'ν' },
    { key: 'xi', insert: '\\xi', desc: '克西/中值点', preview: 'ξ' },
    { key: 'pi', insert: '\\pi', desc: '圆周率', preview: 'π' },
    { key: 'rho', insert: '\\rho', desc: '柔/极径/相关系数', preview: 'ρ' },
    { key: 'sigma', insert: '\\sigma', desc: '西格玛/标准差', preview: 'σ' },
    { key: 'tau', insert: '\\tau', desc: '陶/参量/切应力', preview: 'τ' },
    { key: 'upsilon', insert: '\\upsilon', desc: '宇普西隆', preview: 'υ' },
    { key: 'phi', insert: '\\phi', desc: '斐', preview: 'ϕ' },
    { key: 'varphi', insert: '\\varphi', desc: '方位角/密度 φ', preview: 'φ' },
    { key: 'chi', insert: '\\chi', desc: '卡方 χ', preview: 'χ' },
    { key: 'psi', insert: '\\psi', desc: '普西', preview: 'ψ' },
    { key: 'omega', insert: '\\omega', desc: '欧米伽/角速度', preview: 'ω' },
    { key: 'Gamma', insert: '\\Gamma', desc: '大写伽马/伽马函数', preview: 'Γ' },
    { key: 'Delta', insert: '\\Delta', desc: '大写德尔塔/判别式', preview: 'Δ' },
    { key: 'Theta', insert: '\\Theta', desc: '大写西塔', preview: 'Θ' },
    { key: 'Lambda', insert: '\\Lambda', desc: '对角矩阵/大写兰姆达', preview: 'Λ' },
    { key: 'Xi', insert: '\\Xi', desc: '大写克西', preview: 'Ξ' },
    { key: 'Pi', insert: '\\Pi', desc: '连乘积', preview: 'Π' },
    { key: 'Sigma', insert: '\\Sigma', desc: '求和/协方差矩阵', preview: 'Σ' },
    { key: 'Phi', insert: '\\Phi', desc: '正态分布函数', preview: 'Φ' },
    { key: 'Psi', insert: '\\Psi', desc: '大写普西', preview: 'Ψ' },
    { key: 'Omega', insert: '\\Omega', desc: '样本空间/积分域', preview: 'Ω' },
    { key: 'prob', insert: 'P(|)', desc: '概率 P(A)', preview: 'P(A)' },
    { key: 'expect', insert: 'E(|)', desc: '数学期望 E(X)', preview: 'E(X)' },
    { key: 'var', insert: 'D(|)', desc: '方差 D(X)', preview: 'D(X)' },
    { key: 'cov', insert: '\\operatorname{Cov}(|, )', desc: '协方差 Cov(X,Y)', preview: 'Cov' },
    { key: 'binom', insert: '\\binom{n}{k}', desc: '组合数 C(n,k)', preview: 'C_n^k' },
    { key: 'infty', insert: '\\infty', desc: '无穷大', preview: '∞' },
    { key: 'to', insert: '\\to ', desc: '趋近于', preview: '→' },
    { key: 'ne', insert: '\\ne ', desc: '不等于', preview: '≠' },
    { key: 'le', insert: '\\le ', desc: '小于等于', preview: '≤' },
    { key: 'ge', insert: '\\ge ', desc: '大于等于', preview: '≥' },
    { key: 'approx', insert: '\\approx ', desc: '约等于', preview: '≈' },
    { key: 'equiv', insert: '\\equiv ', desc: '恒等于', preview: '≡' },
    { key: 'sim', insert: '\\sim ', desc: '等价无穷小/分布', preview: '~' },
    { key: 'pm', insert: '\\pm ', desc: '正负号', preview: '±' },
    { key: 'mp', insert: '\\mp ', desc: '负正号', preview: '∓' },
    { key: 'cdot', insert: '\\cdot ', desc: '点乘 ·', preview: '·' },
    { key: 'times', insert: '\\times ', desc: '乘号 ×', preview: '×' },
    { key: 'div', insert: '\\div ', desc: '除号 ÷', preview: '÷' },
    { key: 'in', insert: '\\in ', desc: '属于', preview: '∈' },
    { key: 'notin', insert: '\\notin ', desc: '不属于', preview: '∉' },
    { key: 'subset', insert: '\\subset ', desc: '真子集', preview: '⊂' },
    { key: 'subseteq', insert: '\\subseteq ', desc: '子集包含', preview: '⊆' },
    { key: 'cup', insert: '\\cup ', desc: '并集', preview: '∪' },
    { key: 'cap', insert: '\\cap ', desc: '交集', preview: '∩' },
    { key: 'emptyset', insert: '\\emptyset', desc: '空集', preview: '∅' },
    { key: 'forall', insert: '\\forall ', desc: '任意', preview: '∀' },
    { key: 'exists', insert: '\\exists ', desc: '存在', preview: '∃' },
    { key: 'because', insert: '\\because ', desc: '因为', preview: '∵' },
    { key: 'therefore', insert: '\\therefore ', desc: '所以', preview: '∴' },
    { key: 'implies', insert: '\\implies ', desc: '推出 ⇒', preview: '⇒' },
    { key: 'iff', insert: '\\iff ', desc: '当且仅当 ⇔', preview: '⇔' },
    { key: 'ln', insert: '\\ln(|)', desc: '自然对数', preview: 'ln' },
    { key: 'lg', insert: '\\lg(|)', desc: '常用对数', preview: 'lg' },
    { key: 'log', insert: '\\log_{a}(|)', desc: '对数', preview: 'log' },
    { key: 'exp', insert: '\\mathrm{e}^{|}', desc: '自然指数', preview: 'e^x' },
    { key: 'sin', insert: '\\sin(|)', desc: '正弦', preview: 'sin' },
    { key: 'cos', insert: '\\cos(|)', desc: '余弦', preview: 'cos' },
    { key: 'tan', insert: '\\tan(|)', desc: '正切', preview: 'tan' },
    { key: 'arctan', insert: '\\arctan(|)', desc: '反正切', preview: 'arctan' },
    { key: 'arcsin', insert: '\\arcsin(|)', desc: '反正弦', preview: 'arcsin' },
    { key: 'arccos', insert: '\\arccos(|)', desc: '反余弦', preview: 'arccos' }
    ];

  // ─────────────────────────────────────────────────────────────────────────────
  // 工具函数：向笔记框插入 LaTeX 片段
  // ─────────────────────────────────────────────────────────────────────────────
  // 判断 snippet 是否含有专用占位符 ⦙ 或作为占位符的竖线 |
  function hasCursorPlaceholder(snippet) {
    if (!snippet || typeof snippet !== 'string') return false;
    if (snippet.indexOf('⦙') !== -1) return true;
    if (snippet.indexOf('|') === -1) return false;
    var isNorm = /\\\|/.test(snippet);
    var isArraySpec = /\{cc\|c\}/.test(snippet);
    var isLiteralBar = /(^\|[A-Za-z0-9\\]|f\(\\lambda\) = \||\left\||P\([^)]*\|)/.test(snippet) && !/(\{\|\|\}|\|\s*&|\{\|\})/.test(snippet);
    return !isNorm && !isArraySpec && !isLiteralBar;
  }

  function getActiveTargetInput() {
    if (typeof document === 'undefined') return null;
    // 检查考点重命名弹窗
    var renameModal = document.getElementById('topicRenameModal');
    if (renameModal && renameModal.style.display !== 'none') {
      var renameInput = document.getElementById('inputRenameTopicName');
      if (renameInput) return renameInput;
    }
    // 检查快速考点浮层
    var quickPop = document.getElementById('quickTopicPopover');
    if (quickPop && quickPop.style.display !== 'none') {
      var quickInput = document.getElementById('inputQuickTopicSearch');
      if (quickInput) return quickInput;
    }
    // 检查当前具有焦点的输入框
    var active = document.activeElement;
    if (active && (active.id === 'inputNewTopicName' || active.id === 'inputRenameTopicName' || active.id === 'inputQuickTopicSearch')) {
      return active;
    }
    return document.getElementById('notesTextarea');
  }

  function insertSnippetIntoNotes(snippet, callbacks) {
    var cb = callbacks || {};
    var target = getActiveTargetInput();

    // 如果靶向的是笔记输入框，确保双栏编辑态已展开
    if (!target || target.id === 'notesTextarea') {
      var duo = typeof document !== 'undefined' ? document.getElementById('notesDuo') : null;
      if (!duo || duo.style.display === 'none') {
        if (typeof cb.enterEditMode === 'function') cb.enterEditMode();
      }
      if (!target && typeof document !== 'undefined') target = document.getElementById('notesTextarea');
    }

    if (!target) return;

    var engine = (typeof MarkdownLatexEngine !== 'undefined' ? MarkdownLatexEngine :
                 ((typeof window !== 'undefined' && window.MarkdownLatexEngine) ? window.MarkdownLatexEngine : null));

    if (engine && typeof engine.insertSnippet === 'function') {
      engine.insertSnippet(target, snippet, function () {
        if (target.id === 'notesTextarea') {
          if (typeof cb.onDirty === 'function') cb.onDirty();
          if (typeof cb.updateNotesPreview === 'function') cb.updateNotesPreview();
        } else {
          try { target.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
        }
      });
      return;
    }

    var start = target.selectionStart !== undefined ? target.selectionStart : target.value.length;
    var end = target.selectionEnd !== undefined ? target.selectionEnd : start;
    var val = target.value;
    var selected = val.substring(start, end);

    var insertText = snippet;
    var targetCursor = start + snippet.length;

    var placeholder = null;
    if (snippet.indexOf('⦙') !== -1) {
      placeholder = '⦙';
    } else if (hasCursorPlaceholder(snippet)) {
      placeholder = '|';
    }

    if (placeholder) {
      if (selected) {
        insertText = snippet.replace(placeholder, selected);
        targetCursor = start + insertText.length;
      } else {
        var pIdx = snippet.indexOf(placeholder);
        insertText = snippet.replace(placeholder, '');
        targetCursor = start + pIdx;
      }
    }

    target.value = val.substring(0, start) + insertText + val.substring(end);
    target.selectionStart = targetCursor;
    target.selectionEnd = targetCursor;
    if (typeof target.focus === 'function') target.focus();

    if (target.id === 'notesTextarea') {
      if (typeof cb.onDirty === 'function') cb.onDirty();
      if (typeof cb.updateNotesPreview === 'function') cb.updateNotesPreview();
    } else {
      try { target.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    }
  }

  // 智能括号与美元符号成对闭合或包裹选区
  function wrapOrInsertPair(textarea, openChar, closeChar, callbacks) {
    var cb = callbacks || {};
    var engine = (typeof MarkdownLatexEngine !== 'undefined' ? MarkdownLatexEngine :
                 ((typeof window !== 'undefined' && window.MarkdownLatexEngine) ? window.MarkdownLatexEngine : null));

    if (engine && typeof engine.wrapSelection === 'function') {
      engine.wrapSelection(textarea, openChar, closeChar, function () {
        if (typeof cb.onDirty === 'function') cb.onDirty();
        if (typeof cb.updateNotesPreview === 'function') cb.updateNotesPreview();
      });
      return;
    }

    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var val = textarea.value;
    if (start !== end) {
      var sel = val.substring(start, end);
      textarea.value = val.substring(0, start) + openChar + sel + closeChar + val.substring(end);
      textarea.selectionStart = start + openChar.length;
      textarea.selectionEnd = end + openChar.length;
    } else {
      textarea.value = val.substring(0, start) + openChar + closeChar + val.substring(end);
      textarea.selectionStart = start + openChar.length;
      textarea.selectionEnd = start + openChar.length;
    }
    if (typeof cb.onDirty === 'function') cb.onDirty();
    if (typeof cb.updateNotesPreview === 'function') cb.updateNotesPreview();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 符号盘折叠与初始化
  // ─────────────────────────────────────────────────────────────────────────────
  function toggleMathSymbolPalette(forceOpen, isSidebarCollapsed) {
    var panel = document.getElementById('mathSymbolPalette');
    if (!panel) return;
    if (forceOpen === true) {
      panel.classList.remove('collapsed');
    } else if (forceOpen === false) {
      panel.classList.add('collapsed');
    } else {
      panel.classList.toggle('collapsed');
    }
    if (!panel.classList.contains('collapsed') && !isSidebarCollapsed) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function initNotesQuickToolbar(callbacks) {
    var bar = document.getElementById('notesQuickToolbar');
    if (!bar) return;
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.nqt-btn');
      if (!btn) return;
      var snippet = btn.dataset.insert;
      if (snippet) {
        e.preventDefault();
        insertSnippetIntoNotes(snippet, callbacks);
      }
    });
  }

  function initMathSymbolPalette(callbacks, isSidebarCollapsedFn) {
    var grid = document.getElementById('paletteGrid');
    var tabs = document.querySelectorAll('.palette-tab');
    var header = document.getElementById('paletteHeader');
    var panel = document.getElementById('mathSymbolPalette');
    var currentTab = 'calc';

    if (panel) {
      panel.classList.add('collapsed');
    }

    function renderGrid(tabKey) {
      if (!grid) return;
      grid.innerHTML = '';
      if (tabKey === 'templates') {
        grid.classList.add('template-mode');
      } else {
        grid.classList.remove('template-mode');
      }
      var list = MATH_PALETTE_DATA[tabKey] || [];
      list.forEach(function (item) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'palette-item' + (tabKey === 'templates' ? ' palette-item-template' : '');
        btn.title = (item.code || '').replace(/⦙/g, ''); if (hasCursorPlaceholder(item.code)) { btn.title = btn.title.replace(/\|/g, ''); }
        btn.innerHTML = '<span class="palette-item-render">' + item.render + '</span>' +
                        '<span class="palette-item-code">' + item.label + '</span>';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          insertSnippetIntoNotes(item.code, callbacks);
        });
        grid.appendChild(btn);
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        renderGrid(currentTab);
      });
    });

    if (header && panel) {
      header.addEventListener('click', function () {
        var isCollapsed = (typeof isSidebarCollapsedFn === 'function') ? isSidebarCollapsedFn() : false;
        toggleMathSymbolPalette(undefined, isCollapsed);
      });
    }

    renderGrid(currentTab);
  }

  // 暴露全局命名空间
  window.MathPalette = {
    DATA: MATH_PALETTE_DATA,
    AUTOCOMPLETE_DICT: AUTOCOMPLETE_DICT,
    insertSnippetIntoNotes: insertSnippetIntoNotes,
    wrapOrInsertPair: wrapOrInsertPair,
    toggleMathSymbolPalette: toggleMathSymbolPalette,
    initNotesQuickToolbar: initNotesQuickToolbar,
    initMathSymbolPalette: initMathSymbolPalette
  };

})();
