# -*- coding: utf-8 -*-
"""
Generates continuous literature reader datasets for Paper 1, Paper 2, and Paper 3
Without arbitrary "Text 1, Text 2" splits, without questions, pure immersive literature reading!
"""
import json
import os
import re

from build_vocab_reader import VOCAB_DB, annotate_words

OUT_DIR = r"d:\tj\822\考研题库\题库\毕设"
os.makedirs(OUT_DIR, exist_ok=True)

# =========================================================================
# PAPER 1: Quadrotor Agile Flight: NMPC vs DFBC (IEEE T-RO 2022)
# =========================================================================
paper1_full = {
    "id": "paper1",
    "subject": "毕设",
    "title": "A Comparative Study of Nonlinear MPC and Differential-Flatness-Based Control for Quadrotor Agile Flight",
    "chineseTitle": "四旋翼敏捷飞行的非线性模型预测控制（NMPC）与微分平坦控制（DFBC）对比研究",
    "meta": {
        "authors": "Sihao Sun (孙思豪), Angel Romero, Philipp Foehn, Elia Kaufmann, Davide Scaramuzza",
        "institution": "苏黎世大学机器人与感知实验室（Robotics and Perception Group, University of Zurich, Switzerland）",
        "journal": "IEEE Transactions on Robotics (T-RO), Vol. 38, No. 6, 2022",
        "links": [
            {"label": "视频演示 (YouTube)", "url": "https://youtu.be/XpuRpKHp_Bk"}
        ]
    },
    "sections": [
        {
            "id": "sec-abstract",
            "sectionNumber": "摘要",
            "title": "Abstract",
            "chineseTitle": "论文摘要",
            "figure": {
                "image": "题库/毕设/images/paper1_fig1_quadrotor_tracking.png",
                "caption": "Fig. 1: 苏黎世大学定制竞速四旋翼无人机在 Vicon 动作捕捉大厅以 20 m/s 极速跟踪复杂赛道轨迹 (IEEE T-RO 2022)",
                "alt": "Fig. 1: Quadrotor tracking race trajectory"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "研究背景与核心挑战",
                    "mainIdea": "四旋翼无人机在极限敏捷飞行中，高精度轨迹跟踪面临强非线性、复杂空气动力学与执行器硬饱和的三重物理约束。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "Autonomous high-precision trajectory tracking for quadrotors is crucial for agile navigation in complex and constrained environments.",
                            "translation": "在复杂受限环境中实现安全敏捷导航，四旋翼无人机的高精度轨迹跟踪控制至关重要。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "However, in extreme agile flight, tracking is challenging due to highly nonlinear dynamics, complex aerodynamic effects, and strict actuator constraints.",
                            "translation": "然而，在极限敏捷飞行中，由于高度非线性动力学、复杂的空气动力学效应以及执行机构物理约束的共同耦合作用，高精度轨迹跟踪面临极大挑战。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P1-S3",
                            "text": "In this paper, we systematically and empirically compare two state-of-the-art control frameworks: Nonlinear Model Predictive Control (NMPC) and Differential-Flatness-Based Control (DFBC).",
                            "translation": "在本文中，我们通过在高达 20 m/s（即 72 km/h）的飞行速度和高达 5g 的加速度下跟踪各种极限敏捷轨迹，经验性地系统对比了当今两大主流前沿控制框架：非线性模型预测控制器（NMPC）与基于微分平坦的控制器（DFBC）。"
                        },
                        {
                            "sIndex": 4,
                            "id": "P1-S4",
                            "text": "The evaluation covers high-fidelity physical simulation and real-world experiments across tracking accuracy, robustness, computational cost, and constraint handling.",
                            "translation": "对比涵盖了高保真物理仿真与真实世界大型动作捕捉系统飞行实验，从跟踪精度、鲁棒性、计算开销与执行器约束处理等多个维度展开了全方位定量评估。"
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "核心研究发现与定量结论",
                    "mainIdea": "在不可行激进轨迹下 NMPC 误差降低 48%~62%；引入底层 INDI 内环与气动阻力模型使两者跟踪误差降低 78% 以上。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "When tracking dynamically infeasible trajectories where actuators saturate, NMPC shows significant advantages, reducing position tracking error by 48% and heading error by 62%.",
                            "translation": "研究表明：在跟踪动态不可行轨迹（即超出单电机最大推力限制的激进轨迹）时，NMPC 展现出显著优势，其位置跟踪误差降低 48%，航向角误差降低 62%，但代价是更高的计算耗时以及潜在的数值求解收敛风险。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "For both methods, introducing an Incremental Nonlinear Dynamic Inversion (INDI) inner-loop controller and explicit aerodynamic drag modeling reduces trajectory tracking error by over 78%.",
                            "translation": "对于两种控制方法，引入基于增量非线性动态逆（INDI）的角速度内环控制器以及显式建模空气动力学阻力均至关重要。实飞实验表明，加入 INDI 内环可使 NMPC 与 DFBC 的轨迹跟踪误差降低 78% 以上。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-intro",
            "sectionNumber": "一",
            "title": "I. INTRODUCTION",
            "chineseTitle": "一、引言与学术背景",
            "paragraphs": [
                {
                    "pIndex": 3,
                    "logicRole": "敏捷飞行应用与三大技术瓶颈",
                    "mainIdea": "四旋翼极限机动面临强耦合动力学、高速转子挥舞与机身阻力外滑、以及电机转速硬饱和三大瓶颈。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P3-S1",
                            "text": "Quadrotors possess exceptional agile mobility, making them indispensable for time-critical missions such as search and rescue, autonomous exploration, and drone racing.",
                            "translation": "四旋翼飞行器具有极高的机动敏捷性。充分发挥其敏捷性能对于时间敏感型任务至关重要，例如水下/空中搜救、自主探索、无人机竞速（Drone Racing）以及空中物流运输。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P3-S2",
                            "text": "In extreme agile flight, quadrotor control faces three core bottlenecks: strong nonlinear coupled dynamics, complex aerodynamic drag causing centrifugal drift in sharp corners, and strict actuator saturation limits.",
                            "translation": "在敏捷极限机动中，控制系统面临三大核心瓶颈：1. 大角度机动时姿态与平移完全耦合的强非线性动力学；2. 高速转弯时显著增大的转子挥舞阻力与机身阻力引发的严重离心外滑；3. 电机转速与推力上限极其严格的饱和硬约束。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P3-S3",
                            "text": "To solve these challenges, NMPC optimizes trajectories over a finite prediction horizon with explicit constraints, while DFBC utilizes differential flatness to map flat outputs to algebraic feedforward commands.",
                            "translation": "为了解决上述难题，学术界形成了两大代表性流派：NMPC 在有限时域内滚动求解最优控制，天然支持多输入多输出（MIMO）显式硬约束；DFBC 则利用微分平坦特性将高维微分方程代数映射为平坦输出及其高阶导数，实现超低延迟的解析前馈控制。"
                        }
                    ]
                },
                {
                    "pIndex": 4,
                    "logicRole": "本文主要学术贡献总结",
                    "mainIdea": "首次在 20 m/s 极速下进行同台基准实测，提出统一级联 INDI 内环与阻力补偿架构，揭示性能演化规律。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P4-S1",
                            "text": "This work presents the first systematic benchmark between NMPC and an improved DFBC at flight speeds up to 20 m/s (72 km/h).",
                            "translation": "本文的主要学术贡献包括：1. 首次在高达 20 m/s 的极限实飞速度下，对 NMPC 与改进型 DFBC 进行全方位同台基准测试；"
                        },
                        {
                            "sIndex": 2,
                            "id": "P4-S2",
                            "text": "We propose unifying the cascaded INDI inner-loop and aerodynamic drag compensation into both control architectures.",
                            "translation": "2. 提出将增量非线性动态逆（INDI）与空气动力学阻力模型统一融入 NMPC 和 DFBC 控制架构；"
                        },
                        {
                            "sIndex": 3,
                            "id": "P4-S3",
                            "text": "We comprehensively reveal the performance evolution under feasible versus infeasible trajectories, computational delay, and model uncertainties.",
                            "translation": "3. 系统揭示了动态可行与动态不可行轨迹、单拍计算延迟、模型不确定性及执行器饱和下的性能演化规律。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-dynamics",
            "sectionNumber": "二",
            "title": "II. SYSTEM DYNAMICS & AERODYNAMIC DRAG MODELING",
            "chineseTitle": "二、系统动力学与气动阻力建模",
            "figure": {
                "image": "题库/毕设/images/paper1_fig2_quadrotor_frame.png",
                "caption": "Fig. 2: 惯性系 W 与机体系 B 坐标系定义、电机转子编号与推力合成力矩示意图 (IEEE T-RO 2022)",
                "alt": "Fig. 2: Coordinate definitions"
            },
            "paragraphs": [
                {
                    "pIndex": 5,
                    "logicRole": "四旋翼刚体与四元数旋转运动学推导",
                    "mainIdea": "建立由世界系线速度、四元数姿态与欧拉转动方程构成的 6 自由度刚体动力学微分方程组。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P5-S1",
                            "text": "Let $\\mathcal{W} = \{x_W, y_W, z_W\}$ denote the world inertial frame and $\\mathcal{B} = \{x_B, y_B, z_B\}$ denote the body-fixed frame.",
                            "translation": "定义惯性坐标系为 $\\mathcal{W} = \\{x_W, y_W, z_W\\}$，机体坐标系为 $\\mathcal{B} = \\{x_B, y_B, z_B\\}$。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P5-S2",
                            "text": "The rigid-body quadrotor dynamics are formulated as: $\\dot{\\boldsymbol{\\xi}} = \\boldsymbol{v}$, $m \\dot{\\boldsymbol{v}} = m \\boldsymbol{g}_W + \\boldsymbol{R} \\boldsymbol{f}_B + \\boldsymbol{f}_a$, $\\dot{\\boldsymbol{q}} = \\frac{1}{2} \\boldsymbol{q} \\otimes [0, \\boldsymbol{\\Omega}_B^T]^T$, and $\\boldsymbol{J} \\dot{\\boldsymbol{\\Omega}}_B = \\boldsymbol{\\tau}_B - \\boldsymbol{\\Omega}_B \\times (\\boldsymbol{J} \\boldsymbol{\\Omega}_B)$.",
                            "translation": "四旋翼刚体动力学模型由下式描述：$\\dot{\\boldsymbol{\\xi}} = \\boldsymbol{v}$；$m \\dot{\\boldsymbol{v}} = m \\boldsymbol{g}_W + \\boldsymbol{R} \\boldsymbol{f}_B + \\boldsymbol{f}_a$；$\\dot{\\boldsymbol{q}} = \\frac{1}{2} \\boldsymbol{q} \\otimes [0, \\boldsymbol{\\Omega}_B^T]^T$；$\\boldsymbol{J} \\dot{\\boldsymbol{\\Omega}}_B = \\boldsymbol{\\tau}_B - \\boldsymbol{\\Omega}_B \\times (\\boldsymbol{J} \\boldsymbol{\\Omega}_B)$。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P5-S3",
                            "text": "Here, $\\boldsymbol{\\xi}$ is position, $\\boldsymbol{v}$ is linear velocity, $\\boldsymbol{R} \\in SO(3)$ is rotation parameterized by quaternion $\\boldsymbol{q}$, $\\boldsymbol{J}$ is inertia matrix, $\\boldsymbol{\\Omega}_B$ is body angular velocity, $\\boldsymbol{f}_B = [0, 0, T]^T$ is total thrust, and $\\boldsymbol{\\tau}_B$ is three-axis moment.",
                            "translation": "其中：$\\boldsymbol{\\xi}$ 为世界系位置，$\\boldsymbol{v}$ 为线速度；$m$ 为总质量，$\\boldsymbol{g}_W = [0,0,-g]^T$ 为重力加速度；$\\boldsymbol{R} \\in SO(3)$ 为旋转矩阵，$\\boldsymbol{q}$ 为四元数；$\\boldsymbol{J}$ 为转动惯量矩阵，$\\boldsymbol{\\Omega}_B$ 为角速度；$\\boldsymbol{f}_B = [0, 0, T]^T$ 为总推力，$T = \\sum f_i$；$\\boldsymbol{\\tau}_B$ 为合成控制力矩。"
                        }
                    ]
                },
                {
                    "pIndex": 6,
                    "logicRole": "风洞验证的高速复合对角空气阻力模型",
                    "mainIdea": "采用经风洞实验标定的复合对角阻力矩阵 Dv，显式包含桨叶挥舞阻力与机身阻力。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P6-S1",
                            "text": "At high flight speeds, aerodynamic drag $\\boldsymbol{f}_a$ cannot be neglected and causes severe lateral sliding in high-speed turns.",
                            "translation": "在高速飞行时，空气阻力 $\\boldsymbol{f}_a$ 不可忽略。若忽略阻力会导致飞行器在急弯处因向心力不足产生严重的侧向漂移。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P6-S2",
                            "text": "We adopt a wind-tunnel validated composite drag model: $\\boldsymbol{f}_a = - \\boldsymbol{R} \\boldsymbol{D}_v \\boldsymbol{R}^T \\boldsymbol{v}$, where $\\boldsymbol{D}_v = \\text{diag}(d_x, d_y, d_z)$ denotes the diagonal drag coefficients.",
                            "translation": "本文采用经过风洞实验验证的复合阻力模型：$\\boldsymbol{f}_a = - \\boldsymbol{R} \\boldsymbol{D}_v \\boldsymbol{R}^T \\boldsymbol{v}$，其中 $\\boldsymbol{D}_v = \\text{diag}(d_x, d_y, d_z)$ 为对角空气阻力系数矩阵，显式包含了转子诱导阻力与机身迎风阻力。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-methodology",
            "sectionNumber": "三",
            "title": "III. CONTROL METHODOLOGIES: NMPC, DFBC & CASCADED INDI",
            "chineseTitle": "三、控制算法实现：NMPC、DFBC与级联INDI内环",
            "figures": [
                {
                    "image": "题库/毕设/images/paper1_fig3_nmpc_diagram.png",
                    "caption": "Fig. 3: NMPC 与底层级联 INDI 角速度内环控制架构框图 (IEEE T-RO 2022)"
                },
                {
                    "image": "题库/毕设/images/paper1_fig4_dfbc_diagram.png",
                    "caption": "Fig. 4: 基于微分平坦的前馈控制器 (DFBC) 与单拍 QP 推力分配器控制架构框图 (IEEE T-RO 2022)"
                }
            ],
            "paragraphs": [
                {
                    "pIndex": 7,
                    "logicRole": "NMPC 滚动时域受约束优化命题构建与 Acados 求解",
                    "mainIdea": "NMPC 在预测时域内离散化求解受约束非线性二次规划，利用 acados SQP-RTI 实现毫秒级求解。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P7-S1",
                            "text": "NMPC discretizes the dynamics into $N$ intervals $dt = h/N$ over horizon $[t, t+h]$ and solves a constrained quadratic cost optimization $\\min_{\\boldsymbol{u}} \\sum (\|\\boldsymbol{x}_k - \\boldsymbol{x}_{k,r}\|_{\\boldsymbol{Q}}^2 + \|\\boldsymbol{u}_k - \\boldsymbol{u}_{k,r}\|_{\\boldsymbol{Q}_u}^2)$.",
                            "translation": "NMPC 在有限时域 $[t, t+h]$ 内将系统离散化为 $N$ 个等长步长区间 $dt = h/N$，构建如下受约束的非线性优化命题：$\\min_{\\boldsymbol{u}} \\sum_{k=0}^{N-1} (\\|\\boldsymbol{x}_k - \\boldsymbol{x}_{k,r}\\|_{\\boldsymbol{Q}}^2 + \\|\\boldsymbol{u}_k - \\boldsymbol{u}_{k,r}\\|_{\\boldsymbol{Q}_u}^2) + \\|\\boldsymbol{x}_N - \\boldsymbol{x}_{N,r}\\|_{\\boldsymbol{Q}_N}^2$。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P7-S2",
                            "text": "Constraints explicitly enforce actuator thrust bounds $u_i \\in [u_{\\min}, u_{\\max}]$ and angular velocity bounds $\\boldsymbol{\\Omega}_B \\in [\\boldsymbol{\\Omega}_{\\min}, \\boldsymbol{\\Omega}_{\\max}]$.",
                            "translation": "约束条件显式包含了系统动力学状态转移 $\\boldsymbol{x}_{k+1} = f(\\boldsymbol{x}_k, \\boldsymbol{u}_k)$、机体角速度限制 $\\boldsymbol{\\Omega}_B \\in [\\boldsymbol{\\Omega}_{\\min}, \\boldsymbol{\\Omega}_{\\max}]$ 以及各电机推力指令硬约束 $u_i \\in [u_{\\min}, u_{\\max}]$。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P7-S3",
                            "text": "The solver employs the acados C++ code generation framework with sequential quadratic programming real-time iterations (SQP-RTI) to solve within 2-4 ms.",
                            "translation": "求解器采用高效 C++ 代码生成框架 **acados**，结合序列二次规划实时迭代（SQP-RTI）算法在 2~4 毫秒内实时完成数值求解。"
                        }
                    ]
                },
                {
                    "pIndex": 8,
                    "logicRole": "改进型微分平坦控制器 DFBC 与 QP 分配器",
                    "mainIdea": "DFBC 通过高阶求导解析前馈计算期望姿态与角加速度，配合单拍 QP 分配器处理推力饱和。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P8-S1",
                            "text": "DFBC selects position and yaw $\\boldsymbol{\\sigma} = [x, y, z, \\psi]^T$ as flat outputs, deriving the desired body z-axis from desired acceleration $\\boldsymbol{a}_{\\text{des}}$ accounting for aerodynamic drag.",
                            "translation": "四旋翼的平坦输出选取为位置与偏航角 $\\boldsymbol{\\sigma} = [x, y, z, \\psi]^T$。考虑气动阻力后的期望合力加速度为 $\\boldsymbol{a}_{\\text{des}} = \\ddot{\\boldsymbol{\\xi}}_{ref} + \\boldsymbol{K}_p(\\boldsymbol{\\xi}_{ref} - \\boldsymbol{\\xi}) + \\boldsymbol{K}_d(\\dot{\\boldsymbol{\\xi}}_{ref} - \\dot{\\boldsymbol{\\xi}}) - \\boldsymbol{g}_W - \\frac{1}{m}\\boldsymbol{f}_a$，由此解得期望机体 $z_B$ 轴方向 $\\boldsymbol{z}_{B,\\text{des}} = \\boldsymbol{a}_{\\text{des}} / \\|\\boldsymbol{a}_{\\text{des}}\\|$。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P8-S2",
                            "text": "By taking higher-order derivatives involving trajectory jerk and snap, DFBC algebraically computes feedforward angular velocity $\\boldsymbol{\\Omega}_{B,\\text{des}}$ and acceleration $\\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}}$.",
                            "translation": "通过对 $\\boldsymbol{a}_{\\text{des}}$ 进行二阶求导（涉及轨迹加加速度 Jerk 与加加加速度 Snap），可纯解析代数求出期望角速度 $\\boldsymbol{\\Omega}_{B,\\text{des}}$ 与期望角加速度 $\\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}}$。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P8-S3",
                            "text": "A constrained QP allocator scales down collective thrust while strictly prioritizing attitude control torque when required thrust exceeds single motor limits.",
                            "translation": "当合力需求超出单电机推力极限时，采用小型单拍 QP 求解器在优先保证姿态控制力矩的前提下等比例缩减总推力，防止无人机发生翻滚失控。"
                        }
                    ]
                },
                {
                    "pIndex": 9,
                    "logicRole": "级联 500 Hz 增量非线性动态逆 (INDI) 内环设计",
                    "mainIdea": "底层级联高频角加速度反馈 INDI 内环，利用传感器实测抵消转动惯量不确定性与未建模力矩扰动。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P9-S1",
                            "text": "To isolate inertia uncertainties and external wind disturbances, both NMPC and DFBC are cascaded with a 500 Hz INDI inner-loop.",
                            "translation": "为隔绝转动惯量不确定性、未建模力矩与外部阵风扰动，NMPC 与 DFBC 的底层均级联了高频（500 Hz）INDI 姿态内环。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P9-S2",
                            "text": "Virtual angular acceleration command is $\\boldsymbol{\\nu} = \\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}} + \\boldsymbol{K}_p(\\boldsymbol{q}_{\\text{ref}} \\ominus \\boldsymbol{q}) + \\boldsymbol{K}_d(\\boldsymbol{\\Omega}_{B,\\text{des}} - \\boldsymbol{\\Omega}_B)$, computing torque increment $\\Delta \\boldsymbol{\\tau}_B = \\boldsymbol{J}(\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_{B,f})$.",
                            "translation": "虚拟角加速度指令为 $\\boldsymbol{\\nu} = \\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}} + \\boldsymbol{K}_p (\\boldsymbol{q}_{ref} \\ominus \\boldsymbol{q}) + \\boldsymbol{K}_d (\\boldsymbol{\\Omega}_{B,\\text{des}} - \\boldsymbol{\\Omega}_B)$。根据角加速度反馈 $\\dot{\\boldsymbol{\\Omega}}_{B,f}$ 计算机体控制力矩增量 $\\Delta \\boldsymbol{\\tau}_B = \\boldsymbol{J} (\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_{B,f})$，合成 $\\boldsymbol{\\tau}_B = \\boldsymbol{\\tau}_{B,f} + \\Delta \\boldsymbol{\\tau}_B$ 并直接驱动电调。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-simulation",
            "sectionNumber": "四",
            "title": "IV. SIMULATION BENCHMARKS & ABLATION STUDIES",
            "chineseTitle": "四、物理仿真实验与核心消融对比",
            "figures": [
                {
                    "image": "题库/毕设/images/paper1_fig5_rmse_boxplot.png",
                    "caption": "Fig. 5: NMPC 与 DFBC 在不同极限赛道及速度下的位置跟踪均方根误差 (RMSE) 箱线图消融对比 (IEEE T-RO 2022)"
                },
                {
                    "image": "题库/毕设/images/paper1_fig6_heading_boxplot.png",
                    "caption": "Fig. 6: 航向角姿态跟踪误差 (Heading RMSE) 箱线图对比"
                },
                {
                    "image": "题库/毕设/images/paper1_fig7_crash_rates.png",
                    "caption": "Fig. 7: 动态不可行激进赛道下 NMPC 与 DFBC 的坠机率对比"
                }
            ],
            "paragraphs": [
                {
                    "pIndex": 10,
                    "logicRole": "动态可行 vs 动态不可行航迹全方位定量测试",
                    "mainIdea": "在可行轨迹下两者精度几乎一致 (0.14m vs 0.15m)；在不可行推力饱和轨迹下 NMPC 位置误差低 48%，航向误差低 62%。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P10-S1",
                            "text": "For dynamically feasible trajectories, NMPC+INDI achieved an RMSE of 0.14 +/- 0.05 m, while DFBC+INDI achieved 0.15 +/- 0.06 m, showing virtually identical accuracy.",
                            "translation": "在动态可行轨迹下：NMPC+INDI 位置跟踪 RMSE 为 $0.14 \\pm 0.05\\text{ m}$；DFBC+INDI 为 $0.15 \\pm 0.06\\text{ m}$。结论：在轨迹物理可行时，DFBC 与 NMPC 精度几乎完全一致。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P10-S2",
                            "text": "For dynamically infeasible trajectories exceeding motor thrust limits, NMPC+INDI reduced position RMSE to 0.38 m (heading error 3.2 deg) compared to DFBC+INDI at 0.73 m (heading error 8.5 deg).",
                            "translation": "在动态不可行轨迹（电机推力饱和）下：NMPC+INDI 位置 RMSE 为 **0.38 m**，航向误差 **3.2°**；DFBC+INDI 位置 RMSE 为 **0.73 m**，航向误差 **8.5°**。结论：**NMPC 位置误差比 DFBC 低 48%，航向误差低 62%**。因为 NMPC 具有未来多步预测能力，能提前减速过弯避免剧烈饱和崩溃。"
                        }
                    ]
                },
                {
                    "pIndex": 11,
                    "logicRole": "INDI 内环与空气动力学阻力模型的决定性消融实验",
                    "mainIdea": "引入 INDI 内环使误差直接降低 78% 并消除低频抖动；引入阻力补偿使弯道侧向漂移从 1.2m 收敛至 0.2m 以内。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P11-S1",
                            "text": "Replacing the INDI inner-loop with a classical PID inner-loop increased tracking RMSE from 0.18 m to 0.82 m, confirming that INDI reduces error by 78% and eliminates low-frequency attitude oscillation.",
                            "translation": "消融实验表明：采用经典 PID 内环时，轨迹跟踪 RMSE 为 $0.82\\text{ m}$；引入 INDI 内环后，跟踪误差直接降至 $0.18\\text{ m}$（**误差降低 78%**），且完全消除了高速转弯时的姿态低频抖动。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P11-S2",
                            "text": "At speeds exceeding 12 m/s, disabling aerodynamic drag feedforward caused severe centrifugal drift over 1.2 m, whereas drag compensation reduced drift to under 0.2 m.",
                            "translation": "在速度 $> 12\\text{ m/s}$ 时，关闭阻力前馈会导致向心力不足，弯道最大侧向漂移超 $1.2\\text{ m}$；引入阻力模型后漂移收敛至 $< 0.2\\text{ m}$。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-experiments",
            "sectionNumber": "五",
            "title": "V. REAL-WORLD EXPERIMENTS & 72 KM/H BENCHMARK",
            "chineseTitle": "五、大型动捕实机 72 km/h 极限飞行实验",
            "figures": [
                {
                    "image": "题库/毕设/images/paper1_fig12_test_trajectories.png",
                    "caption": "Fig. 12: 动捕大厅实飞测试航迹（Race Track A / B / C 与 3D 环形航迹） (IEEE T-RO 2022)"
                },
                {
                    "image": "题库/毕设/images/paper1_fig13_racetrack_tracking.png",
                    "caption": "Fig. 13: 真实四旋翼无人机在 20 m/s (72 km/h) 极速下跟踪 Race Track C 赛道的实测飞行轨迹与跟踪误差"
                },
                {
                    "image": "题库/毕设/images/paper1_fig16_nmpc_cpu.png",
                    "caption": "Fig. 16: NMPC 与 DFBC 单步 CPU 计算耗时对比 (DFBC 0.05ms vs NMPC 2.5~4.5ms)"
                }
            ],
            "paragraphs": [
                {
                    "pIndex": 12,
                    "logicRole": "实机实验平台与 72 km/h 极速刷圈实测",
                    "mainIdea": "在苏黎世大学 30m×30m×8m Vicon 动捕大厅，定制推重比 4.5:1 竞速机以 72 km/h 成功刷圈，验证单步耗时差距 50~100 倍。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P12-S1",
                            "text": "Flight experiments were conducted in the University of Zurich 30m x 30m x 8m Vicon arena using a custom racing quadrotor (0.75 kg, 4.5:1 thrust-to-weight ratio) at speeds up to 20 m/s (72 km/h) and 5g acceleration.",
                            "translation": "实验在苏黎世大学 $30\\text{ m} \\times 30\\text{ m} \\times 8\\text{ m}$ 大型高精度 Vicon 动捕大厅开展；测试无人机为定制竞速四旋翼（重 0.75 kg，推重比高达 **4.5:1**，机载 Jetson / STM32 平台），实飞最高速度 **20 m/s (72 km/h)**，向心加速度达 **5g (49 m/s²)**。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P12-S2",
                            "text": "DFBC required only 0.05 ms per step, running 50 to 100 times faster than NMPC (2.5 - 4.5 ms), while achieving near-identical tracking on feasible trajectories.",
                            "translation": "实飞数据完美印证了仿真结论：NMPC+INDI 与 DFBC+INDI 均成功以 72 km/h 极速刷圈；DFBC 单步耗时仅 **0.05 ms**，而 NMPC 单步耗时 **2.5 ~ 4.5 ms**（DFBC 快 50~100 倍）。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-discussion",
            "sectionNumber": "六",
            "title": "VI. DISCUSSION & ENGINEERING SELECTION GUIDELINES",
            "chineseTitle": "六、综合对比与工程选型指南",
            "paragraphs": [
                {
                    "pIndex": 13,
                    "logicRole": "全维度综合对比矩阵与工程选型准则",
                    "mainIdea": "可行轨迹首选 DFBC+INDI 黄金性价比组合；规划激进与极限饱和场景选 NMPC；INDI+阻力补偿为敏捷控制必备基石。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P13-S1",
                            "text": "For scenarios with kinodynamic-feasible trajectories, DFBC+INDI is the most cost-effective golden combination, matching NMPC performance at a fraction of computational power.",
                            "translation": "最终工程选型建议：1. 对于具备高质量规划器、轨迹满足动力学可行性的场景，**DFBC+INDI 是性价比最高的黄金组合**，以极低算力实现媲美 NMPC 的顶级跟踪精度；"
                        },
                        {
                            "sIndex": 2,
                            "id": "P13-S2",
                            "text": "For highly dynamic environments with frequent trajectory revisions near actuator saturation limits, NMPC is indispensable for proactive constraint avoidance.",
                            "translation": "2. 对于环境高度动态未知、轨迹频繁突变或执行器工作在饱和边缘的极限机动，**NMPC 是唯一能够前瞻性规避饱和崩溃的控制方案**；"
                        },
                        {
                            "sIndex": 3,
                            "id": "P13-S3",
                            "text": "Cascaded INDI inner-loop combined with aerodynamic drag feedforward is the foundational cornerstone for all high-speed quadrotor controllers.",
                            "translation": "3. **“INDI 姿态内环 + 空气动力学阻力补偿” 是所有高速敏捷飞行控制器的必备核心基石**。"
                        }
                    ]
                }
            ]
        }
    ]
}

# =========================================================================
# PAPER 2: Adaptive INDI for Micro Air Vehicles (AIAA JGCD 2016)
# =========================================================================
paper2_full = {
    "id": "paper2",
    "subject": "毕设",
    "title": "Adaptive Incremental Nonlinear Dynamic Inversion for Attitude Control of Micro Air Vehicles",
    "chineseTitle": "微型飞行器姿态控制的自适应增量非线性动态逆（A-INDI）",
    "meta": {
        "authors": "Ewoud J. J. Smeur, Qiping Chu (楚启平), Guido C. H. E. de Croon",
        "institution": "荷兰代尔夫特理工大学航空航天工程学院控制与仿真系 / MAVLab（Delft University of Technology）",
        "journal": "AIAA Journal of Guidance, Control, and Dynamics (JGCD), Vol. 39, No. 3, 2016",
        "links": [
            {"label": "DOI: 10.2514/1.G001490", "url": "https://doi.org/10.2514/1.G001490"}
        ]
    },
    "sections": [
        {
            "id": "sec-abstract",
            "sectionNumber": "摘要",
            "title": "Abstract",
            "chineseTitle": "论文摘要",
            "figure": {
                "image": "题库/毕设/images/paper2_fig6_bebop_drone.png",
                "caption": "Fig. 6: 荷兰代尔夫特理工大学 MAVLab 实验飞行器 Parrot Bebop 四旋翼无人机与突加悬挂载荷装置 (AIAA JGCD 2016)",
                "alt": "Fig. 6: Bebop drone with payload"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "研究背景与 INDI 核心理念",
                    "mainIdea": "增量非线性动态逆（INDI）利用传感器角加速度实测替代复杂物理模型项，摆脱对被控对象精确建模的依赖。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "Incremental Nonlinear Dynamic Inversion (INDI) is a sensor-based nonlinear control approach that promises high performance without requiring an accurate physical model.",
                            "translation": "增量非线性动态逆（Incremental Nonlinear Dynamic Inversion, INDI）是一种基于传感器的非线性控制方法，它有望在不需要被控对象精确数学模型的前提下实现高性能非线性控制。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "In MAV attitude control, INDI relies only on the control effectiveness model, replacing the remaining physical terms with real-time sensor measurements of angular acceleration.",
                            "translation": "在微型飞行器（MAV）姿态控制领域，INDI 仅依赖控制效能模型，而利用角加速度的实时传感器测量值来替代传统模型中的其余物理项。"
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "两大核心工程难题与解决方案",
                    "mainIdea": "提出时序同步控制律补偿滤波滞后振荡，提出机载 NLMS 自适应算法在线估计时变控制效能矩阵 G1。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "This paper resolves two fundamental challenges: handling clock delays and phase lag from sensor and actuator filtering, and adapting to time-varying control effectiveness.",
                            "translation": "本文针对 INDI 控制在实际工程应用中的两大核心挑战给出了完备的解决方案：1. 如何处理传感器测量与执行器动力学引入的时钟延迟与滤波相位滞后；2. 如何应对飞行过程中控制效能矩阵的时变不确定性。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "Contributions include a synchronized virtual control law for delay compensation, an online Normalized Least-Mean-Squares (NLMS) adaptive parameter estimator, and accounting for rotor angular momentum.",
                            "translation": "主要贡献包括：1. 提出了能够精确补偿角加速度低通滤波延迟的时序同步虚拟控制律；2. 提出了自适应增量非线性动态逆（A-INDI）架构，利用机载 NLMS 滤波器在线实时辨识控制效能参数；3. 显式计入螺旋桨旋转角动量与加减速自旋力矩；4. 通过 Parrot Bebop 实飞实验充分验证了卓越的抗扰自适应能力。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-intro",
            "sectionNumber": "一",
            "title": "I. INTRODUCTION",
            "chineseTitle": "一、引言与研究动机",
            "paragraphs": [
                {
                    "pIndex": 3,
                    "logicRole": "MAV 抗扰瓶颈与传统方法局限",
                    "mainIdea": "微型飞行器极易受突发阵风扰动，线性 PID 难以全包线保持性能，传统 NDI 则严重依赖难以测定的气动阻尼模型。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P3-S1",
                            "text": "Micro Air Vehicles (MAVs), due to small size and low inertia, are highly vulnerable to wind gusts, turbulence, and ground effects.",
                            "translation": "微型飞行器（MAV）由于尺寸小、重量轻、惯量极低，在飞行过程中极其容易受到风切变、阵风紊流以及地面效应等剧烈扰动的影响。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P3-S2",
                            "text": "Traditional PID controllers require tedious gain tuning around operating points, while traditional NDI relies heavily on accurate aerodynamic and damping models.",
                            "translation": "传统的线性 PID 控制器需要在线性工作点附近精细整定增益，难以在全飞行包线和未知扰动下保持一致的高性能；传统的非线性动态逆（NDI）虽然能理论解耦，但严重依赖极难精确测定的气动阻尼和旋翼干扰模型。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P3-S3",
                            "text": "INDI breaks this bottleneck by utilizing IMU measured angular acceleration $\\dot{\\boldsymbol{\\Omega}}_0$ as the baseline point, simplifying dynamic inversion into control input increments $\\Delta \\dot{\\boldsymbol{\\Omega}} = \\boldsymbol{G}_1 \\Delta \\boldsymbol{u}$.",
                            "translation": "增量非线性动态逆（INDI）的破局理念：不依赖对未知非线性函数的离线预先计算，而是直接利用 IMU 传感器测得的角加速度 $\\dot{\\boldsymbol{\\Omega}}_0$ 作为基准点，通过泰勒级数展开将动力学逆解简化为控制输入的增量映射 $\\Delta \\dot{\\boldsymbol{\\Omega}} = \\boldsymbol{G}_1 \\Delta \\boldsymbol{u}$。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-dynamics",
            "sectionNumber": "二",
            "title": "II. QUADROTOR DYNAMICS & INCREMENTAL FORMULATION",
            "chineseTitle": "二、四旋翼动力学模型与增量形式展开",
            "figure": {
                "image": "题库/毕设/images/paper2_fig2_indi_diagram.png",
                "caption": "Fig. 2: 基于角加速度传感器反馈与电机转速状态反馈的标准 INDI 控制回路框图 (AIAA JGCD 2016)",
                "alt": "Fig. 2: Block diagram of INDI"
            },
            "paragraphs": [
                {
                    "pIndex": 4,
                    "logicRole": "欧拉转动方程与力矩分解",
                    "mainIdea": "四旋翼转动动力学包含电机控制力矩 Mc、气动力矩 Ma 与螺旋桨自旋加减速反作用陀螺力矩 Mr。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P4-S1",
                            "text": "Quadrotor rotational dynamics are described by Euler\'s equation: $\\boldsymbol{I}_v \\dot{\\boldsymbol{\\Omega}} + \\boldsymbol{\\Omega} \\times (\\boldsymbol{I}_v \\boldsymbol{\\Omega}) = \\boldsymbol{M}_a(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\boldsymbol{M}_c - \\boldsymbol{M}_r$.",
                            "translation": "四旋翼飞行器的转动动力学由欧拉方程给出：$\\boldsymbol{I}_v \\dot{\\boldsymbol{\\Omega}} + \\boldsymbol{\\Omega} \\times (\\boldsymbol{I}_v \\boldsymbol{\\Omega}) = \\boldsymbol{M}_a(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\boldsymbol{M}_c - \\boldsymbol{M}_r$。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P4-S2",
                            "text": "Here, control moment is $\\boldsymbol{M}_c = \\boldsymbol{M}_{c,\\text{matrix}} \\boldsymbol{\\omega}^2$, and propeller gyroscopic and acceleration torque is $\\boldsymbol{M}_r = \\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}} + \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_r \\boldsymbol{\\omega}$.",
                            "translation": "其中控制力矩为 $\\boldsymbol{M}_c = \\boldsymbol{M}_{c,\\text{matrix}} \\boldsymbol{\\omega}^2$，螺旋桨自旋与加减速反扭矩为 $\\boldsymbol{M}_r = \\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}} + \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_r \\boldsymbol{\\omega}$。"
                        }
                    ]
                },
                {
                    "pIndex": 5,
                    "logicRole": "泰勒展开推导 INDI 核心增量方程",
                    "mainIdea": "在上一时刻采样点展开，用传感器实测角加速度替换物理模型项，得出增量控制方程。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P5-S1",
                            "text": "Applying a first-order Taylor expansion around previous step $(\\boldsymbol{\\Omega}_0, \\boldsymbol{\\omega}_0)$ and replacing physical model terms with measured $\\dot{\\boldsymbol{\\Omega}}_0$ yields: $\\dot{\\boldsymbol{\\Omega}} \\approx \\dot{\\boldsymbol{\\Omega}}_0 + \\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_0)(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0) + \\boldsymbol{G}_2(\\dot{\\boldsymbol{\\omega}} - \\dot{\\boldsymbol{\\omega}}_0)$.",
                            "translation": "在上一时刻采样点 $(\\boldsymbol{\\Omega}_0, \\boldsymbol{\\omega}_0)$ 附近进行一阶泰勒展开，并利用传感器测量的实际角加速度 $\\dot{\\boldsymbol{\\Omega}}_0$ 替代非线性物理模型项，得到 **INDI 核心增量方程**：$\\dot{\\boldsymbol{\\Omega}} \\approx \\dot{\\boldsymbol{\\Omega}}_0 + \\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_0)(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0) + \\boldsymbol{G}_2(\\dot{\\boldsymbol{\\omega}} - \\dot{\\boldsymbol{\\omega}}_0)$。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-delay",
            "sectionNumber": "三",
            "title": "III. SENSOR DELAY & FILTER COMPENSATION",
            "chineseTitle": "三、时序滤波延迟分析与同步补偿设计",
            "figure": {
                "image": "题库/毕设/images/paper2_fig5_filter_compensation.png",
                "caption": "Fig. 5: 消除相位滞后与极限环振荡的时序对称低通滤波补偿结构控制框图 (AIAA JGCD 2016)",
                "alt": "Fig. 5: Filter delay compensation block diagram"
            },
            "paragraphs": [
                {
                    "pIndex": 6,
                    "logicRole": "滤波相位滞后机理与对称同步控制律",
                    "mainIdea": "角加速度低通滤波引入严重相位滞后导致极限环振荡；提出将执行机构指令输入对称滤波通道以消除相位失配。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P6-S1",
                            "text": "Gyro differentiation followed by a second-order Butterworth low-pass filter $H(z)$ creates phase lag, causing $\\dot{\\boldsymbol{\\Omega}}_f$ to reflect past motor inputs and inducing severe limit-cycle oscillations.",
                            "translation": "陀螺仪差分信号经过二阶巴特沃斯低通滤波器 $H(z)$ 以滤除电机高频震动，这引入了不可忽视的时间滞后；传感器测得的角加速度 $\\dot{\\boldsymbol{\\Omega}}_f$ 实际反映的是过去时刻的电机转速，直接控制会导致回路自激剧烈震荡。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P6-S2",
                            "text": "To eliminate phase mismatch, we route the actuator command through a matched filter channel $\\boldsymbol{\\omega}_f$, formulating the synchronized virtual control law: $\\boldsymbol{\\omega}_c = \\boldsymbol{\\omega}_f + [\\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_f)]^\\dagger (\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_f)$.",
                            "translation": "为了消除相位失配引起的自激振荡，论文提出将执行机构控制量引入对称滤波通道：$\\boldsymbol{\\omega}_c = \\boldsymbol{\\omega}_f + [\\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_f)]^\\dagger (\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_f)$。该结构在数学上保证了穿越频率处的相位裕度，彻底根除了未补偿 INDI 的极限环振荡。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-adaptation",
            "sectionNumber": "四",
            "title": "IV. ADAPTIVE ONLINE PARAMETER ESTIMATION (A-INDI)",
            "chineseTitle": "四、自适应参数在线辨识算法 (A-INDI)",
            "figure": {
                "image": "题库/毕设/images/paper2_fig18_19_adaptation_curves.png",
                "caption": "Fig. 18 & 19: 自适应 A-INDI 算法在飞行中实时追踪控制效能参数 G1 变化的收敛曲线 (AIAA JGCD 2016)",
                "alt": "Fig. 18-19: Parameter adaptation curves"
            },
            "paragraphs": [
                {
                    "pIndex": 7,
                    "logicRole": "NLMS 在线自适应递推更新律",
                    "mainIdea": "基于归一化最小均方误差（NLMS）在线更新控制效能矩阵 G1，仅几条向量点乘即可在机载 512 Hz 实时运行。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P7-S1",
                            "text": "To adapt to battery voltage drop and payload variations without manual tuning, an online Normalized Least-Mean-Squares (NLMS) algorithm estimates control effectiveness $\\boldsymbol{G}_1$.",
                            "translation": "为了使控制器摆脱对离线参数测定的依赖并自适应电池电压下降与挂载变化，论文引入了基于归一化最小均方误差（NLMS）的在线自适应辨识算法。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P7-S2",
                            "text": "The update law is: $\\hat{\\boldsymbol{G}}_1(k+1) = \\hat{\\boldsymbol{G}}_1(k) + \\boldsymbol{\\mu}_1 \\boldsymbol{e}(k) [\\text{diag}(\\boldsymbol{\\omega}_f) \\Delta \\boldsymbol{\\omega}_f]^T / (\\epsilon + \|\\text{diag}(\\boldsymbol{\\omega}_f) \\Delta \\boldsymbol{\\omega}_f\|^2)$, requiring minimal computation at 512 Hz.",
                            "translation": "控制效能矩阵更新律为：$\\hat{\\boldsymbol{G}}_1(k+1) = \\hat{\\boldsymbol{G}}_1(k) + \\boldsymbol{\\mu}_1 \\frac{\\boldsymbol{e}(k) [\\text{diag}(\\boldsymbol{\\omega}_f) \\Delta \\boldsymbol{\\omega}_f]^T}{\\epsilon + \\|\\text{diag}(\\boldsymbol{\\omega}_f) \\Delta \\boldsymbol{\\omega}_f\\|^2}$。该算法计算量极小（仅几条向量点乘），可在机载单片机上以 512 Hz 实时无延迟运行。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-experiments",
            "sectionNumber": "五",
            "title": "V. REAL FLIGHT EXPERIMENTS & STEP DISTURBANCE REJECTION",
            "chineseTitle": "五、实机飞行实验：阶跃扰动抑制与防撞圈自适应",
            "figures": [
                {
                    "image": "题库/毕设/images/paper2_fig8_9_step_response.png",
                    "caption": "Fig. 8 & 9: 50g 突加重物瞬间断线释放时的俯仰角阶跃扰动响应曲线对比（A-INDI 恢复时间比经典 PID 快 5 倍） (AIAA JGCD 2016)"
                },
                {
                    "image": "题库/毕设/images/paper2_fig15_pid_step_response.png",
                    "caption": "Fig. 15: 经典 PID 在阶跃扰动下的姿态超调与振荡衰减过程"
                },
                {
                    "image": "题库/毕设/images/paper2_fig26_yaw_doublet.png",
                    "caption": "Fig. 26: 显式计入转子角动量力矩后，四旋翼偏航 (Yaw) Doublet 响应上升时间缩短 40%"
                }
            ],
            "paragraphs": [
                {
                    "pIndex": 8,
                    "logicRole": "飞行试验与阶跃扰动定量对比",
                    "mainIdea": "Parrot Bebop 实飞证明：50g 突加负载断线释放时 A-INDI 恢复仅需 0.3s (快 5 倍)；防撞圈拆装 2~3s 内自适应收敛；偏航响应提速 40%。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P8-S1",
                            "text": "In a sudden 50g attached weight release test during hover, classical PID exhibited a 15-degree pitch jump taking 1.5 s to recover, while A-INDI limited deviation to under 4 degrees and recovered in 0.3 s (5 times faster).",
                            "translation": "在 50g 额外重物突然释放（瞬间阶跃卸载）试验中：经典 PID 俯仰角出现高达 15° 的剧烈突跳，耗时 **1.5 秒** 才恢复平衡；A-INDI 姿态波动峰值小于 4°，仅耗时 **0.3 秒** 即完全重置回水平（**抗扰恢复速度比 PID 快 5 倍**）。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P8-S2",
                            "text": "During in-flight propeller bumper mounting/dismounting, G_1 estimates converged to true physical values within 2-3 seconds without pilot notice.",
                            "translation": "在飞行过程中加装/拆卸防撞保护圈试验中，自适应 A-INDI 在 **2~3 秒内** 参数迅速从初始值自适应收敛至真实物理效能值，飞行手感保持完全一致。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P8-S3",
                            "text": "Compensating for rotor angular momentum $\\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}}$ reduced yaw doublet rise time by 40%, resolving sluggish yaw response.",
                            "translation": "显式补偿转子加速惯量力矩 $\\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}}$ 后，偏航 Doublet 指令的跟踪上升时间缩短了 **40%**，彻底解决了四旋翼“偏航软绵”的固有缺陷。"
                        }
                    ]
                }
            ]
        }
    ]
}

# =========================================================================
# PAPER 3: Attitude Control of Hydrobatic Intervention AUV Cuttlefish using INDI (IEEE/DFKI 2022)
# =========================================================================
paper3_full = {
    "id": "paper3",
    "subject": "毕设",
    "title": "Attitude Control of the Hydrobatic Intervention AUV Cuttlefish using Incremental Nonlinear Dynamic Inversion",
    "chineseTitle": "基于增量非线性动态逆的水下特技作业AUV Cuttlefish姿态控制",
    "meta": {
        "authors": "Tom Slawik, Shubham Vyas, Leif Christensen, Frank Kirchner",
        "institution": "德国人工智能研究中心（DFKI GmbH）机器人创新中心（RIC），德国不来梅",
        "journal": "IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS) / DFKI Underactuated Lab, 2022",
        "links": [
            {"label": "开源代码库 (GitHub)", "url": "https://github.com/dfki-ric-underactuated-lab/auv_control_indi"},
            {"label": "实验视频 (YouTube)", "url": "https://youtu.be/8u8k607lpn4"}
        ]
    },
    "sections": [
        {
            "id": "sec-abstract",
            "sectionNumber": "摘要",
            "title": "Abstract",
            "chineseTitle": "论文摘要",
            "figure": {
                "image": "题库/毕设/images/paper3_fig1_cuttlefish_auv.png",
                "caption": "Fig. 1: DFKI 大型海洋试验水池中处于垂直干预作业姿态的双臂特技 AUV Cuttlefish 实机照片 (IEEE IROS 2022)",
                "alt": "Fig. 1: AUV Cuttlefish in intervention pose"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "海洋机器人背景与 INDI 拓展",
                    "mainIdea": "首次将增量非线性动态逆（INDI）拓展至 6 自由度水下特技作业潜水器，解决流体水动力学建模黑盒难题。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "We present an attitude control scheme based on Incremental Nonlinear Dynamic Inversion (INDI) for Autonomous Underwater Vehicles (AUVs).",
                            "translation": "在本文中，我们提出了一种基于增量非线性动态逆（Incremental Nonlinear Dynamic Inversion, INDI）的自主水下航行器（AUV）姿态控制方案。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "Traditional model-based controllers rely on accurate hydrodynamic models, which are notoriously difficult to obtain under strong nonlinear fluid effects; INDI achieves high performance by trading model accuracy for high-frequency sensor feedback.",
                            "translation": "传统的基于模型的控制器严重依赖于受控系统的精确数学模型，然而对于受到高度非线性水动力学效应影响的水下航行器而言，建立精确模型极其困难。INDI 通过引入高频加速度反馈与执行器输出反馈，对非线性系统进行逐拍增量局部线性化，从而实现了**“用传感器测量精度换取动力学模型精度”**。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P1-S3",
                            "text": "Tested in the DFKI RIC large ocean basin on a challenging 90-degree pitch-up maneuver (horizontal cruise to vertical intervention pose), INDI significantly outperformed model-based feedback linearization in stability and drift reduction.",
                            "translation": "本文针对具有极高挑战性的 **90° 俯仰特技过渡机动（Pitch-up Maneuver）**开展研究——双臂水下干预潜水器“Cuttlefish”从水平巡航快速翻转到垂直作业姿态。水池对比试验表明，无论在过渡阶段还是 300 秒定点悬停阶段，INDI 都能保持显著更优的平稳性，空间漂移远小于模型依赖型控制器。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-intro",
            "sectionNumber": "一",
            "title": "I. INTRODUCTION",
            "chineseTitle": "一、引言与水下特技干预背景",
            "paragraphs": [
                {
                    "pIndex": 2,
                    "logicRole": "海底基础设施运维需求与 Cuttlefish 特技能力",
                    "mainIdea": "海上风电与水下变电站需求催生干预型 AUV；Cuttlefish 具备 8 推进器与双机械臂，可实现 360° 全维空间特技翻转。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "Subsea infrastructure maintenance (such as offshore wind farms and subsea substations) urgently requires autonomous intervention AUVs to replace risky manual divers and heavy ROVs.",
                            "translation": "随着海洋经济发展，海底基础设施（如海上风电场导管架及水下变电站）对无人自主运维的需求日益迫切。传统人工潜水员风险高、深度受限，遥控潜水器（ROV）则高度依赖大型母船支持。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "AUV Cuttlefish is equipped with 8 thrusters and dual manipulators, possessing hydrobatic capability for 360-degree spatial attitude transitions and CoM/CoB adjustments.",
                            "translation": "配备双机械臂的新型干预潜水器 AUV Cuttlefish 配备 8 个推进器，具备水下特技机动能力（Hydrobatics），能够在水体中实现任意 360° 空间姿态变换以深入狭窄钢结构作业，并能主动调节质心与浮心位置。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P2-S3",
                            "text": "Large-angle transitions induce complex added mass variations, quadratic damping, and hydrodynamic body-arm cross-coupling, turning traditional model-based FBL into an inaccurate and destabilizing approach.",
                            "translation": "当 AUV 进行大角度变姿态翻转时，产生极强的非线性耦合效应（时变附加质量、速度平方非线性阻尼与机械臂干扰）。传统基于模型的方法（如反馈线性化 FBL）若参数辨识稍有偏差，模型补偿项就会反向施加错误推力引发严重振荡或持续漂移。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-dynamics",
            "sectionNumber": "二",
            "title": "II. 6-DOF UNDERWATER VEHICLE DYNAMICS & FBL BASELINE",
            "chineseTitle": "二、水下6自由度动力学与反馈线性化基准",
            "figure": {
                "image": "题库/毕设/images/paper3_fig2_fbl_diagram.png",
                "caption": "Fig. 2: 经典基于精确水动力模型的反馈线性化 (FBL) 速度控制回路框图 (IEEE IROS 2022)",
                "alt": "Fig. 2: FBL velocity controller diagram"
            },
            "paragraphs": [
                {
                    "pIndex": 3,
                    "logicRole": "Fossen 水动力学方程与 FBL 控制律推导",
                    "mainIdea": "建立包含刚体水动力质量 M、科氏力 C、阻尼 D 与恢复力 g 的微分方程，推导对比基准 FBL 控制律。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P3-S1",
                            "text": "Following Fossen\'s standard equations, the 6-DOF underwater dynamics are: $\\boldsymbol{M} \\dot{\\boldsymbol{\\nu}} + \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta}) = \\boldsymbol{\\tau}$, and $\\dot{\\boldsymbol{\\eta}} = \\boldsymbol{J}(\\boldsymbol{\\eta})\\boldsymbol{\\nu}$.",
                            "translation": "根据 Fossen 海洋航行器动力学标准理论，6 自由度 AUV 动力学方程表示为：$\\boldsymbol{M}\\dot{\\boldsymbol{\\nu}} + \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta}) = \\boldsymbol{\\tau}$；$\\dot{\\boldsymbol{\\eta}} = \\boldsymbol{J}(\\boldsymbol{\\eta})\\boldsymbol{\\nu}$。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P3-S2",
                            "text": "Here, $\\boldsymbol{M} = \\boldsymbol{M}_{RB} + \\boldsymbol{M}_A$ combines rigid-body and hydrodynamic added mass, $\\boldsymbol{D}(\\boldsymbol{\\nu}) = \\boldsymbol{D}_{lin} + \\boldsymbol{D}_{quad}(\\boldsymbol{\\nu})$ includes quadratic damping, and $\\boldsymbol{g}(\\boldsymbol{\\eta})$ represents gravity/buoyancy restoring forces.",
                            "translation": "其中 $\\boldsymbol{M} = \\boldsymbol{M}_{RB} + \\boldsymbol{M}_A$ 为刚体质量与水动力附加质量之和，$\\boldsymbol{D}(\\boldsymbol{\\nu})$ 包含线性与二次阻尼对角矩阵，$\\boldsymbol{g}(\\boldsymbol{\\eta})$ 为重力与浮力恢复力矩矢量。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P3-S3",
                            "text": "Model-based Feedback Linearization defines $\\boldsymbol{\\tau}_{ref} = \\boldsymbol{M} \\boldsymbol{a}_{ref} + \\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta})$, where $\\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta}) = \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta})$; any identification error in $\\boldsymbol{f}$ directly corrupts decoupling.",
                            "translation": "经典基于模型的反馈线性化（FBL）控制律为：$\\boldsymbol{\\tau}_{ref} = \\boldsymbol{M} \\boldsymbol{a}_{ref} + \\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta})$，其中 $\\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta}) = \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta})$。其本质缺陷在于一旦阻尼或恢复力矩存在微小辨识误差，就会施加错误推力引发持续漂移。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-indi",
            "sectionNumber": "三",
            "title": "III. 6-DOF INCREMENTAL NDI & THRUSTER ALLOCATION",
            "chineseTitle": "三、水下6自由度增量动态逆控制律与推力分配",
            "figure": {
                "image": "题库/毕设/images/paper3_fig3_indi_diagram.png",
                "caption": "Fig. 3: 仅依赖惯性矩阵 M 与高频加速度反馈的水下 6-DOF INDI 速度控制器框图 (IEEE IROS 2022)",
                "alt": "Fig. 3: INDI velocity controller diagram"
            },
            "paragraphs": [
                {
                    "pIndex": 4,
                    "logicRole": "水下 6-DOF INDI 控制律推导与参数极简化优势",
                    "mainIdea": "在相邻采样间隔内水动力变化可忽略，得出完全不含阻尼与科氏力的极简 INDI 控制律。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P4-S1",
                            "text": "At high sampling frequencies (50-100 Hz), hydrodynamic changes between consecutive steps are negligible compared to thruster force increments: $\\boldsymbol{M} \\dot{\\boldsymbol{\\nu}} \\approx \\boldsymbol{M} \\dot{\\boldsymbol{\\nu}}_0 + (\\boldsymbol{\\tau} - \\boldsymbol{\\tau}_0)$.",
                            "translation": "由于控制回路采样频率高（50~100 Hz），在相邻采样间隔内航行器水动力变化相比执行机构推力增量是极小量：$\\boldsymbol{M}\\dot{\\boldsymbol{\\nu}} \\approx \\boldsymbol{M}\\dot{\\boldsymbol{\\nu}}_0 + (\\boldsymbol{\\tau} - \\boldsymbol{\\tau}_0)$。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P4-S2",
                            "text": "Replacing with filtered acceleration $\\dot{\\boldsymbol{\\nu}}_f$ and thruster force $\\boldsymbol{\\tau}_f$ yields the core INDI law: $\\boldsymbol{\\tau}_{ref} = \\boldsymbol{\\tau}_f + \\boldsymbol{M}(\\boldsymbol{a}_{ref} - \\dot{\\boldsymbol{\\nu}}_f)$.",
                            "translation": "用滤波传感器实测加速度 $\\dot{\\boldsymbol{\\nu}}_f$ 和推进器推力 $\\boldsymbol{\\tau}_f$ 替代，推导得出 **水下 INDI 控制律**：$\\boldsymbol{\\tau}_{ref} = \\boldsymbol{\\tau}_f + \\boldsymbol{M} (\\boldsymbol{a}_{ref} - \\dot{\\boldsymbol{\\nu}}_f)$。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P4-S3",
                            "text": "Crucially, this equation contains zero terms of damping $\\boldsymbol{D}(\\boldsymbol{\\nu})$, Coriolis $\\boldsymbol{C}(\\boldsymbol{\\nu})$, or restoring $\\boldsymbol{g}(\\boldsymbol{\\eta})$, reducing the entire parameter tuning burden to merely the inertia matrix $\\boldsymbol{M}$.",
                            "translation": "核心优势：整个公式中**完全不包含阻尼 $\\boldsymbol{D}(\\boldsymbol{\\nu})$、科氏力 $\\boldsymbol{C}(\\boldsymbol{\\nu})$ 和恢复力 $\\boldsymbol{g}(\\boldsymbol{\\eta})$！** 将水下建模负担缩减至仅需一个惯性矩阵 $\\boldsymbol{M}$。"
                        }
                    ]
                },
                {
                    "pIndex": 5,
                    "logicRole": "8 推进器伪逆控制分配与 SO(3) 姿态外环",
                    "mainIdea": "通过加权 Moore-Penrose 伪逆求解 8 推进器推力分配，外环基于李群 SO(3) 规避 90 度俯仰奇异性。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P5-S1",
                            "text": "Thruster allocation maps 6-DOF wrench $\\boldsymbol{\\tau}_{ref}$ to 8 thruster commands $\\boldsymbol{u}$ via weighted Moore-Penrose pseudoinverse: $\\boldsymbol{u} = \\boldsymbol{B}^T (\\boldsymbol{B} \\boldsymbol{B}^T)^{-1} \\boldsymbol{\\tau}_{ref}$.",
                            "translation": "推进器控制分配通过加权 Moore-Penrose 伪逆将 6 自由度力矩指令分配给 8 个推进器：$\\boldsymbol{u} = \\boldsymbol{B}^T (\\boldsymbol{B} \\boldsymbol{B}^T)^{-1} \\boldsymbol{\\tau}_{ref}$。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P5-S2",
                            "text": "To prevent Gimbal Lock singularity at 90-degree pitch, the outer attitude loop uses an SO(3) Lie Group error formulation: $\\boldsymbol{\\omega}_{ref} = \\boldsymbol{K}_\\Omega \\sum \\boldsymbol{e}_i \\times (\\boldsymbol{R}_d^T \\boldsymbol{R} \\boldsymbol{e}_i)$.",
                            "translation": "为了消除 90° 俯仰翻转中的万向节死锁奇异性，姿态外环采用基于李群 $SO(3)$ 旋转矩阵的姿态误差控制律：$\\boldsymbol{\\omega}_{ref}(\\boldsymbol{R}, \\boldsymbol{R}_d) = \\boldsymbol{K}_\\Omega \\sum_{i=1}^3 \\boldsymbol{e}_i \\times (\\boldsymbol{R}_d^T \\boldsymbol{R} \\boldsymbol{e}_i)$。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-experiments",
            "sectionNumber": "四",
            "title": "IV. WATER BASIN 90-DEGREE PITCH-UP EXPERIMENTS",
            "chineseTitle": "四、大型试验水池 90° 俯仰特技机动对比实验",
            "figures": [
                {
                    "image": "题库/毕设/images/paper3_fig4_identification.png",
                    "caption": "Fig. 4: 实测水动力数据参数辨识拟合曲线 (IEEE IROS 2022)"
                },
                {
                    "image": "题库/毕设/images/paper3_fig5_pitch_up_maneuvers.png",
                    "caption": "Fig. 5: AUV Cuttlefish 在水池中执行 3 轮 90° 俯仰特技过渡机动实测姿态与角速度曲线对比"
                }
            ],
            "paragraphs": [
                {
                    "pIndex": 6,
                    "logicRole": "90° 俯仰特技水池实测与稳态误差对比",
                    "mainIdea": "在 5 秒内快速翻转 90° 中，INDI 稳态角度误差仅 0.0829°，远优于线性 FBL (1.35°) 与二次 FBL (1.69°)。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P6-S1",
                            "text": "In the DFKI 24m x 18m x 8m ocean basin, Cuttlefish executed a 90-degree pitch-up maneuver (horizontal cruise to vertical pose in 5 s, holding for 300 s).",
                            "translation": "在德国 DFKI RIC 大型海洋试验水池（$24\\text{ m} \\times 18\\text{ m} \\times 8\\text{ m}$）中，Cuttlefish 在 5 秒内从水平巡航姿态快速翻转 90° 进入垂直直立姿态，并稳定保持 300 秒。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P6-S2",
                            "text": "INDI achieved a steady-state attitude angle error of only 0.0829 degrees, compared to 1.3459 degrees for linear-drag FBL and 1.6897 degrees for quadratic-drag FBL.",
                            "translation": "实机水池试验表明：**INDI 控制器的稳态姿态角度误差仅为 0.0829°**；而线性阻尼 FBL 稳态误差为 1.3459°，二次非线性阻尼 FBL 为 1.6897°。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P6-S3",
                            "text": "Quadratic FBL performed worse because quadratic drag parameters were slightly overestimated in the low-speed transitional regime, injecting counterproductive compensation forces.",
                            "translation": "关键物理反思：二次非线性阻尼 FBL 的表现反而劣于线性 FBL，这是因为在低速与变姿态翻转过渡流区中二次阻尼极难测准，模型高估了阻尼后施加了过量的反向抵消力，反而放大了误差；而 INDI 完全规避了这一建模风险。"
                        }
                    ]
                }
            ]
        },
        {
            "id": "sec-station-keeping",
            "sectionNumber": "五",
            "title": "V. 300-SECOND STATION KEEPING & FAULT TOLERANCE OUTLOOK",
            "chineseTitle": "五、300秒定点悬停漂移评估与容错控制展望",
            "figure": {
                "image": "题库/毕设/images/paper3_fig6_station_keeping_drift.png",
                "caption": "Fig. 6: 垂直直立姿态下定点悬停 300 秒实测水平面 (x, y) 空间位置漂移对比（INDI 几乎锁定在原点，FBL 漂移超 1.5~2.5 米） (IEEE IROS 2022)",
                "alt": "Fig. 6: Drift after 300s"
            },
            "paragraphs": [
                {
                    "pIndex": 7,
                    "logicRole": "300 秒垂直直立悬停空间漂移与容错展望",
                    "mainIdea": "INDI 300秒水平漂移严格小于 0.1 m（FBL 漂移超 1.5~2.5m）；且天然具备推进器损坏无需诊断的自容错潜力。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P7-S1",
                            "text": "During 300-second vertical station keeping, INDI kept horizontal spatial drift under 0.1 m in both x and y axes (nearly locked in place), whereas linear FBL drifted 1.5 m and quadratic FBL drifted over 2.5 m.",
                            "translation": "在水下保持 90° 垂直直立状态 300 秒的定点悬停测试中，**INDI 在 $x$ 轴与 $y$ 轴的空间位置累计漂移均严格小于 0.1 m**（几乎完全锁定在原地）；而线性 FBL 累计漂移达 **1.5 m**，二次 FBL 漂移超过 **2.5 m**。"
                        },
                        {
                            "sIndex": 2,
                            "id": "P7-S2",
                            "text": "Continuous power consumption was comparable (2231 W for INDI vs 2274 W for quadratic FBL), demonstrating drift elimination without added oscillation.",
                            "translation": "连续功耗对比相当（INDI 连续功耗 2231 W，二次 FBL 为 2274 W），证明 INDI 在消除漂移的同时并未引入高频抖动或额外能耗。"
                        },
                        {
                            "sIndex": 3,
                            "id": "P7-S3",
                            "text": "Furthermore, INDI inherently exhibits fault-tolerant control potential: when a thruster degrades or entangles with seaweed, the resulting acceleration loss is instantly compensated in the next step without explicit fault diagnosis.",
                            "translation": "前瞻展望：INDI 天然具备推力故障容错潜力（Fault-Tolerant Control）。当推进器发生局部失效或水草缠绕衰减时，由此引起的加速度损失会被 IMU 在下一拍立即捕捉并自动增量抵消，在无需显式故障诊断模块的情况下直接实现闭环重构控制。"
                        }
                    ]
                }
            ]
        }
    ]
}

# =========================================================================
# AUTO-ANNOTATE ALL SENTENCES WITH EXTENSIVE VOCABULARY & BUILD MASTER CACHE
# =========================================================================

master_vocab = {}

for paper_dataset, pkey in [(paper1_full, "paper1"), (paper2_full, "paper2"), (paper3_full, "paper3")]:
    for sec in paper_dataset["sections"]:
        for p in sec["paragraphs"]:
            for s in p["sentences"]:
                vocabs = annotate_words(s["text"])
                s["vocab"] = vocabs
                for v in vocabs:
                    master_vocab[v["word"].lower()] = {
                        "word": v["word"],
                        "ipa": v["ipa"],
                        "meaning": v["meaning"],
                        "level": v["level"]
                    }

# Write data_paper1.js
with open(os.path.join(OUT_DIR, "data_paper1.js"), "w", encoding="utf-8") as f:
    f.write("/**\n * 毕设文献阅读器 · 文献1：四旋翼敏捷飞行的NMPC与微分平坦控制对比研究 (IEEE T-RO 2022)\n */\n\n")
    f.write("window.BISHE_DATA = window.BISHE_DATA || {};\n")
    f.write("window.BISHE_DATA['paper1'] = " + json.dumps(paper1_full, ensure_ascii=False, indent=2) + ";\n")

# Write data_paper2.js
with open(os.path.join(OUT_DIR, "data_paper2.js"), "w", encoding="utf-8") as f:
    f.write("/**\n * 毕设文献阅读器 · 文献2：微型飞行器姿态控制的自适应增量非线性动态逆 (AIAA JGCD 2016)\n */\n\n")
    f.write("window.BISHE_DATA = window.BISHE_DATA || {};\n")
    f.write("window.BISHE_DATA['paper2'] = " + json.dumps(paper2_full, ensure_ascii=False, indent=2) + ";\n")

# Write data_paper3.js
with open(os.path.join(OUT_DIR, "data_paper3.js"), "w", encoding="utf-8") as f:
    f.write("/**\n * 毕设文献阅读器 · 文献3：基于增量非线性动态逆的水下特技作业AUV姿态控制 (IEEE/DFKI 2022)\n */\n\n")
    f.write("window.BISHE_DATA = window.BISHE_DATA || {};\n")
    f.write("window.BISHE_DATA['paper3'] = " + json.dumps(paper3_full, ensure_ascii=False, indent=2) + ";\n")

# Write master_vocab_cache.json
with open(os.path.join(OUT_DIR, "master_vocab_cache.json"), "w", encoding="utf-8") as f:
    json.dump(master_vocab, f, ensure_ascii=False, indent=2)

print(f"Successfully generated pure literature reader data in {OUT_DIR}")
print(f"Total vocabulary terms in master vocab: {len(master_vocab)}")
