# -*- coding: utf-8 -*-
"""
Generates data_paper1.js, data_paper2.js, data_paper3.js, and master_vocab_cache.json
"""
import json
import os
import re

from build_all_papers import VOCAB_DB, annotate_words

OUT_DIR = r"d:\tj\822\考研题库\题库\毕设"
os.makedirs(OUT_DIR, exist_ok=True)

# =========================================================================
# PAPER 1 DATASET: Quadrotor Agile Flight: NMPC vs DFBC (IEEE T-RO 2022)
# =========================================================================
paper1_data = {
    "year": "paper1",
    "subject": "毕设",
    "title": "文献1: 四旋翼敏捷飞行的NMPC与微分平坦控制对比研究 (IEEE T-RO 2022)",
    "texts": [
        {
            "id": "text1",
            "number": 1,
            "title": "I. Abstract & Introduction: Agile Flight & Control Challenges",
            "chineseTitle": "第1章：摘要与引言 · 敏捷飞行控制瓶颈与两大主流流派",
            "topic": "无人机敏捷控制 / 最优控制与微分平坦",
            "overview": "选自苏黎世大学机器人与感知实验室发表于 IEEE Transactions on Robotics (T-RO 2022) 的经典顶刊论文。系统对比了在 20 m/s (72 km/h) 极速与 5g 极限加速度下，非线性模型预测控制（NMPC）与基于微分平坦控制（DFBC）的跟踪性能、计算开销与鲁棒性。",
            "figure": {
                "image": "题库/毕设/images/paper1_fig1_quadrotor_tracking.png",
                "caption": "Fig. 1: 苏黎世大学定制竞速四旋翼无人机在 Vicon 动作捕捉大厅以 20 m/s 极速跟踪复杂赛道轨迹 (IEEE T-RO 2022)",
                "alt": "Fig. 1: Real flight and hardware"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "篇章开篇 · 敏捷飞行场景与核心控制挑战提出",
                    "mainIdea": "四旋翼在极限敏捷飞行中面临高度非线性动力学、复杂空气动力学与执行器饱和约束的三重挑战。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "Autonomous high-precision trajectory tracking for quadrotors is crucial for agile navigation in complex and constrained environments.",
                            "translation": "四旋翼无人机的自主高精度轨迹跟踪对于在复杂受限环境中的敏捷导航至关重要。",
                            "isTopicSentence": True,
                            "isKeyEvidence": False
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "However, in extreme agile flight, tracking is challenging due to highly nonlinear dynamics, aerodynamic effects, and actuator constraints.",
                            "translation": "然而，在极限敏捷飞行中，由于高度非线性动力学、复杂的空气动力学效应以及执行机构约束的共同作用，高精度轨迹跟踪面临极大挑战。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 3,
                            "id": "P1-S3",
                            "text": "To address these issues, we empirically compare two state-of-the-art control frameworks: Nonlinear Model Predictive Control (NMPC) and Differential-Flatness-Based Control (DFBC).",
                            "translation": "为了解决上述难题，我们经验性地系统对比了当今两大主流前沿控制框架：非线性模型预测控制（NMPC）与基于微分平坦的控制器（DFBC）。",
                            "isTopicSentence": False,
                            "isKeyEvidence": False
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "学术论述 · 实验速度与核心对比发现",
                    "mainIdea": "在高达 20 m/s 速度与 5g 加速度下，NMPC 在不可行轨迹下优势显著，而底层 INDI 内环使两者误差下降 78%。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "The evaluation is carried out in both high-fidelity simulation and real-world experiments with flight speeds up to 20 m/s and accelerations up to 5g.",
                            "translation": "评估在高保真物理仿真与真实世界实机飞行实验中展开，飞行速度高达 20 m/s（即 72 km/h），加速度高达 5g（49 m/s²）。",
                            "isTopicSentence": False,
                            "isKeyEvidence": False
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "When tracking dynamically infeasible trajectories, NMPC shows significant advantages, reducing position tracking error by 48% and heading error by 62%.",
                            "translation": "在跟踪动态不可行轨迹（超出电机推力限制的激进轨迹）时，NMPC 展现出显著优势，其位置跟踪误差降低 48%，航向角误差降低 62%。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 3,
                            "id": "P2-S3",
                            "text": "For both methods, introducing an Incremental Nonlinear Dynamic Inversion (INDI) inner-loop controller and explicit aerodynamic drag modeling reduces trajectory error by over 78%.",
                            "translation": "对于这两种控制方法，引入基于增量非线性动态逆（INDI）的角速度内环控制器以及显式空气动力学阻力模型，可使轨迹跟踪误差降低 78% 以上。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 1,
                    "type": "细节题",
                    "tangchiModel": "控制理论与实验结论剖析",
                    "stem": "According to Paragraph 2, under what condition does NMPC exhibit the most prominent tracking advantage over DFBC?",
                    "stemKeywords": ["NMPC", "DFBC", "dynamically infeasible", "advantages"],
                    "targetSentences": ["P2-S2"],
                    "options": [
                        {
                            "key": "A",
                            "text": "When the quadrotor flies in low-speed hover mode with zero aerodynamic drag.",
                            "isCorrect": False,
                            "distractorType": "偷换概念",
                            "analysis": "A 选项偷换为低速悬停，原文明确指出优势出现在极限不可行轨迹（infeasible trajectories）下。",
                            "refSentences": ["P2-S2"]
                        },
                        {
                            "key": "B",
                            "text": "When tracking dynamically infeasible trajectories where actuators reach saturation.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 同义替换",
                            "analysis": "对应 P2-S2 原文：'When tracking dynamically infeasible trajectories, NMPC shows significant advantages... reducing error by 48%'。由于 NMPC 具有滚动时域前瞻预测与约束平滑能力，在电机饱和时优势最大。",
                            "refSentences": ["P2-S2"]
                        },
                        {
                            "key": "C",
                            "text": "When the computational power of the onboard processor is severely limited.",
                            "isCorrect": False,
                            "distractorType": "正反倒置",
                            "analysis": "C 选项颠倒因果，NMPC 算力开销显著大于 DFBC，在算力极其受限时 DFBC 更具优势。",
                            "refSentences": ["P2-S2"]
                        },
                        {
                            "key": "D",
                            "text": "When the INDI inner-loop is removed from the control architecture.",
                            "isCorrect": False,
                            "distractorType": "曲解文意",
                            "analysis": "撤除 INDI 会导致两者均发散或性能大幅衰减，而非 NMPC 展现优势的条件。",
                            "refSentences": ["P2-S3"]
                        }
                    ],
                    "officialAnswer": "B",
                    "presetReflection": {
                        "trapAnalysis": "注意'dynamically infeasible'的核心物理含义是期望加速度超出单电机最大推力上限，引发执行器硬饱和。",
                        "methodSummary": "细节题精准定位到 P2-S2，提炼核心论点：NMPC 滚动优化多步预测可前瞻规避单点推力饱和。"
                    }
                },
                {
                    "qIndex": 2,
                    "type": "推断题",
                    "tangchiModel": "控制架构创新点剖析",
                    "stem": "What is the crucial role of the INDI inner loop according to the paper?",
                    "stemKeywords": ["INDI", "inner-loop", "78%", "aerodynamic drag"],
                    "targetSentences": ["P2-S3"],
                    "options": [
                        {
                            "key": "A",
                            "text": "It completely eliminates the need for any position outer-loop controller.",
                            "isCorrect": False,
                            "distractorType": "过度推理",
                            "analysis": "INDI 仅充当底层角速度内环，外环仍需 NMPC 或 DFBC 计算期望加速度与姿态。",
                            "refSentences": ["P2-S3"]
                        },
                        {
                            "key": "B",
                            "text": "It cancels model uncertainties and external disturbances using sensor feedback, reducing error by over 78%.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 同义替换",
                            "analysis": "对应 P2-S3：INDI 内环利用高频角加速度实测反馈抵消未建模力和气动力扰动，使跟踪误差降低超 78%。",
                            "refSentences": ["P2-S3"]
                        },
                        {
                            "key": "C",
                            "text": "It calculates the global differential flatness output of quadrotor translation.",
                            "isCorrect": False,
                            "distractorType": "概念混淆",
                            "analysis": "平坦输出属于 DFBC 外环前馈范畴，而非底层 INDI 内环。",
                            "refSentences": ["P2-S3"]
                        },
                        {
                            "key": "D",
                            "text": "It converts nonlinear optimization into an unconstrained linear equation.",
                            "isCorrect": False,
                            "distractorType": "偷换概念",
                            "analysis": "INDI 是逐拍传感器增量线性化，并非将非线性优化转化为无约束方程。",
                            "refSentences": ["P2-S3"]
                        }
                    ],
                    "officialAnswer": "B",
                    "presetReflection": {
                        "trapAnalysis": "分清串级控制系统中'外环（位置/轨迹）'与'内环（角速度/力矩）'的分工。",
                        "methodSummary": "INDI 核心优势在于'用传感器测量精度换取动力学模型精度'，隔绝上层外环的模型误差。"
                    }
                }
            ]
        },
        {
            "id": "text2",
            "number": 2,
            "title": "II. System Dynamics & Aerodynamic Drag Modeling",
            "chineseTitle": "第2章：系统动力学与气动阻力建模 · 刚体与对角阻力矩阵",
            "topic": "动力学建模 / 四元数与气动阻力",
            "overview": "详细建立四旋翼在惯性系与机体系下的刚体平移、四元数姿态旋转与转动惯量动力学模型，重点推导风洞实验验证的复合对角空气阻力系数矩阵 Dv。",
            "figure": {
                "image": "题库/毕设/images/paper1_fig2_quadrotor_frame.png",
                "caption": "Fig. 2: 惯性系 W 与机体系 B 坐标系定义、电机转子编号与推力合成力矩示意图 (IEEE T-RO 2022)",
                "alt": "Fig. 2: Coordinate definitions"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "数学公式推导 · 四旋翼非线性动力学微分方程",
                    "mainIdea": "四旋翼 6 自由度刚体动力学由线速度微分方程、四元数姿态运动学与欧拉转动方程共同描述。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "Let W = {x_W, y_W, z_W} denote the world inertial frame and B = {x_B, y_B, z_B} denote the body-fixed frame.",
                            "translation": "定义惯性坐标系为 $\\mathcal{W} = \\{x_W, y_W, z_W\\}$，机体固定坐标系为 $\\mathcal{B} = \\{x_B, y_B, z_B\\}$。",
                            "isTopicSentence": False,
                            "isKeyEvidence": False
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "The translational and rotational dynamics of the rigid-body quadrotor are modeled as: m \\dot{v} = m g_W + R f_B + f_a, and J \\dot{\\Omega}_B = \\tau_B - \\Omega_B \\times (J \\Omega_B).",
                            "translation": "四旋翼刚体平移与旋转动力学由以下微分方程描述：$m \\dot{\\boldsymbol{v}} = m \\boldsymbol{g}_W + \\boldsymbol{R} \\boldsymbol{f}_B + \\boldsymbol{f}_a$，以及 $\\boldsymbol{J} \\dot{\\boldsymbol{\\Omega}}_B = \\boldsymbol{\\tau}_B - \\boldsymbol{\\Omega}_B \\times (\\boldsymbol{J} \\boldsymbol{\\Omega}_B)$。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 3,
                            "id": "P1-S3",
                            "text": "Here, R is the rotation matrix in SO(3) parameterized by unit quaternion q, J is the inertia matrix, and f_B = [0, 0, T]^T is the collective rotor thrust.",
                            "translation": "其中，$\\boldsymbol{R} \\in SO(3)$ 为由单位四元数 $\\boldsymbol{q}$ 参数化的旋转矩阵，$\\boldsymbol{J}$ 为转动惯量矩阵，$\\boldsymbol{f}_B = [0, 0, T]^T$ 为 4 个转子产生的机体总推力。",
                            "isTopicSentence": False,
                            "isKeyEvidence": False
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "机理建模 · 高速空气动力学阻力模型推导",
                    "mainIdea": "在速度大于 12 m/s 时，转子挥舞与机身阻力不可忽略，采用复合对角阻力矩阵进行前馈补偿。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "At high flight speeds exceeding 12 m/s, aerodynamic rotor drag and body fuselage drag become significant factors causing centrifugal drift in sharp turns.",
                            "translation": "当飞行速度超过 12 m/s 时，转子叶片挥舞阻力与机身迎风阻力显著增大，若忽略会导致飞行器在急转弯道产生严重的离心外洗漂移。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "We employ a wind-tunnel validated diagonal drag model: f_a = - R D_v R^T v, where D_v = diag(d_x, d_y, d_z) represents the translational drag coefficients.",
                            "translation": "本文采用经风洞实验标定的复合对角阻力模型：$\\boldsymbol{f}_a = - \\boldsymbol{R} \\boldsymbol{D}_v \\boldsymbol{R}^T \\boldsymbol{v}$，其中 $\\boldsymbol{D}_v = \\text{diag}(d_x, d_y, d_z)$ 为沿机体三轴的平移空气阻力系数矩阵。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 3,
                    "type": "细节题",
                    "tangchiModel": "动力学物理方程解析",
                    "stem": "In the translational dynamic equation m * \\dot{v} = m * g_W + R * f_B + f_a, what does the term f_a represent?",
                    "stemKeywords": ["f_a", "translational dynamics", "D_v", "aerodynamic drag"],
                    "targetSentences": ["P1-S2", "P2-S2"],
                    "options": [
                        {
                            "key": "A",
                            "text": "The collective vertical thrust generated by four brushless motors.",
                            "isCorrect": False,
                            "distractorType": "偷换概念",
                            "analysis": "A 是 R * f_B（电机总推力），而不是 f_a。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "B",
                            "text": "The Coriolis virtual force caused by frame rotation.",
                            "isCorrect": False,
                            "distractorType": "概念混淆",
                            "analysis": "科氏力存在于非惯性系旋转推导中，平移方程中世界惯性系下的 f_a 为气动阻力项。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "C",
                            "text": "The aerodynamic drag force explicitly modeled as - R * D_v * R^T * v.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 原文推导",
                            "analysis": "对应 P2-S2：f_a 为空气动力学阻力矢量，显式由 - R D_v R^T v 给出。",
                            "refSentences": ["P2-S2"]
                        },
                        {
                            "key": "D",
                            "text": "The external disturbance force from ground effect.",
                            "isCorrect": False,
                            "distractorType": "无中生有",
                            "analysis": "文中高速飞行阻力模型重点刻画的是迎风阻力与叶片挥舞阻力，非地面效应。",
                            "refSentences": ["P2-S1"]
                        }
                    ],
                    "officialAnswer": "C",
                    "presetReflection": {
                        "trapAnalysis": "区分刚体方程中各物理量的含义：R * f_B 是主动控制推力，f_a 是被动气动阻力，m * g_W 是重力。",
                        "methodSummary": "牢记公式中每个矢量所在的坐标系：f_B 定义在机体系，经 R 旋转转换至惯性系。"
                    }
                }
            ]
        },
        {
            "id": "text3",
            "number": 3,
            "title": "III. Control Methodologies: NMPC, DFBC & QP Allocation",
            "chineseTitle": "第3章：控制算法实现 · Acados NMPC 与微分平坦 DFBC",
            "topic": "控制算法 / 序列二次规划与微分平坦",
            "overview": "深入剖析 NMPC 滚动时域有限时域优化命题构建、SQP-RTI 快速求解，以及 DFBC 利用微分平坦代数求导实现毫秒级前馈与单拍 QP 控制分配器的核心机制。",
            "figure": {
                "image": "题库/毕设/images/paper1_fig3_nmpc_diagram.png",
                "caption": "Fig. 3: NMPC 与底层级联 INDI 内环控制架构框图 (IEEE T-RO 2022)",
                "alt": "Fig. 3: Control diagram of NMPC"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "算法详解 · NMPC 滚动时域最优控制设计",
                    "mainIdea": "NMPC 在预测时域内构建状态与输入偏差的二次型优化命题，利用 C++ 求解器 acados 在毫秒内完成 SQP 求解。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "NMPC discretizes the dynamics into N intervals over a prediction horizon and formulates a constrained non-linear optimization problem.",
                            "translation": "NMPC 在预测时域内将系统离散化为 $N$ 个等长区间，构建受状态方程与执行器上下限硬约束的非线性最优控制命题。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "The solver uses the acados C++ code generation framework with sequential quadratic programming real-time iteration (SQP-RTI) for fast computation.",
                            "translation": "求解器采用高效 C++ 代码生成框架 **acados**，结合序列二次规划实时迭代（SQP-RTI）算法在几毫秒内实现快速数值求解。",
                            "isTopicSentence": False,
                            "isKeyEvidence": False
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "算法详解 · 改进型微分平坦控制器 DFBC 与 QP 分配",
                    "mainIdea": "DFBC 选取位置与偏航为平坦输出，通过解析求导计算期望角速度与角加速度，配合 QP 分配器处理推力饱和。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "DFBC selects the quadrotor position and yaw angle as flat outputs \\sigma = [x, y, z, \\psi]^T.",
                            "translation": "DFBC 选取四旋翼的三维空间位置与偏航角作为平坦输出 $\\boldsymbol{\\sigma} = [x, y, z, \\psi]^T$。",
                            "isTopicSentence": True,
                            "isKeyEvidence": False
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "By taking higher-order analytical derivatives including trajectory jerk and snap, DFBC calculates feedforward body angular velocity and acceleration algebraically.",
                            "translation": "通过对期望轨迹进行高阶解析求导（包含加加速度 Jerk 与加加加速度 Snap），DFBC 能够以纯代数运算计算出前馈期望角速度与角加速度。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 3,
                            "id": "P2-S3",
                            "text": "When the required total thrust exceeds actuator limits, a constrained Quadratic Programming (QP) allocator scales down collective thrust while prioritizing attitude control torques.",
                            "translation": "当所需总推力超出电机极限时，单拍二次规划（QP）分配器在优先保证姿态控制力矩的前提下等比例缩减总推力。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 4,
                    "type": "方法对比",
                    "tangchiModel": "控制算法机理对比",
                    "stem": "How does DFBC handle actuator thrust saturation when the trajectory requires more thrust than single motor limits?",
                    "stemKeywords": ["DFBC", "thrust saturation", "QP allocator", "prioritizing attitude"],
                    "targetSentences": ["P2-S3"],
                    "options": [
                        {
                            "key": "A",
                            "text": "It solves a multi-step future predictive optimization over the entire trajectory.",
                            "isCorrect": False,
                            "distractorType": "概念混淆",
                            "analysis": "A 是 NMPC 的多步滚动预测机制，不是 DFBC。",
                            "refSentences": ["P1-S1"]
                        },
                        {
                            "key": "B",
                            "text": "It employs a constrained QP allocator that scales down collective thrust while prioritizing attitude control torque.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 原文同义表达",
                            "analysis": "对应 P2-S3：DFBC 采用单拍 QP 控制分配器，优先保证姿态控制力矩（防翻滚失控），等比例缩减总升力。",
                            "refSentences": ["P2-S3"]
                        },
                        {
                            "key": "C",
                            "text": "It cuts off the power to all motors immediately to prevent crashes.",
                            "isCorrect": False,
                            "distractorType": "无中生有",
                            "analysis": "直接断电属于严重错误描述。",
                            "refSentences": ["P2-S3"]
                        },
                        {
                            "key": "D",
                            "text": "It ignores the saturation and commands unbounded voltages to ESCs.",
                            "isCorrect": False,
                            "distractorType": "正反倒置",
                            "analysis": "DFBC 显式引入 QP 分配器就是为了合规处理电机推力硬约束。",
                            "refSentences": ["P2-S3"]
                        }
                    ],
                    "officialAnswer": "B",
                    "presetReflection": {
                        "trapAnalysis": "区分 NMPC 的'预测域内显式处理硬约束'与 DFBC 的'单拍 QP 控制分配处理约束'的不同实现层次。",
                        "methodSummary": "姿态力矩优先级高于总推力是无人机在饱和时保持稳定的第一黄金准则。"
                    }
                }
            ]
        },
        {
            "id": "text4",
            "number": 4,
            "title": "IV. Simulation Benchmarks & Ablation Studies",
            "chineseTitle": "第4章：物理仿真与消融实验 · 可行与不可行航迹全方位对比",
            "topic": "仿真实验 / 动态可行性与消融对比",
            "overview": "在穿越机专业竞速赛道（Race Track A/B/C）、立体 3D Figure-8 与 Loop 翻滚特技航迹下，对比 NMPC 与 DFBC 在可行/不可行轨迹下的 RMSE 误差与坠机率（Crash Rate）。",
            "figure": {
                "image": "题库/毕设/images/paper1_fig5_rmse_boxplot.png",
                "caption": "Fig. 5: NMPC 与 DFBC 在不同赛道及速度下的位置跟踪均方根误差 (RMSE) 箱线图消融对比 (IEEE T-RO 2022)",
                "alt": "Fig. 5: Boxplot of tracking error RMSE"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "实验数据 · 动态可行航迹下两者的精度一致性",
                    "mainIdea": "在轨迹满足动力学可行性时，DFBC 与 NMPC 的跟踪 RMSE 几乎完全一致（约 0.14~0.15 m）。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "For dynamically feasible trajectories, NMPC+INDI achieved an RMSE of 0.14 +/- 0.05 m, while DFBC+INDI achieved 0.15 +/- 0.06 m.",
                            "translation": "对于动态可行轨迹，NMPC+INDI 实现了 $0.14 \\pm 0.05\\text{ m}$ 的位置跟踪均方根误差（RMSE），而 DFBC+INDI 为 $0.15 \\pm 0.06\\text{ m}$。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "This confirms that when the reference trajectory respects physical actuation limits, DFBC achieves tracking performance on par with NMPC.",
                            "translation": "这证实了当参考轨迹符合物理执行器极限时，DFBC 的跟踪性能与 NMPC 完全媲美。",
                            "isTopicSentence": False,
                            "isKeyEvidence": False
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "实验数据 · 动态不可行激进航迹下的性能分化",
                    "mainIdea": "在不可行激进轨迹下，NMPC 凭借多步时域预测提前减速，位置误差低 48%，航向误差低 62%。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "In contrast, for dynamically infeasible trajectories with motor saturation, NMPC+INDI maintained an RMSE of 0.38 m (heading error 3.2 deg), whereas DFBC+INDI degraded to 0.73 m (heading error 8.5 deg).",
                            "translation": "相比之下，在电机推力饱和的动态不可行轨迹下，NMPC+INDI 的位置 RMSE 保持在 **0.38 m**（航向误差 3.2°），而 DFBC+INDI 恶化至 **0.73 m**（航向误差 8.5°）。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "NMPC effectively anticipates future actuator saturation and proactively decelerates before entering sharp corners.",
                            "translation": "NMPC 能够前瞻性地预判未来的执行器饱和，在进入急发卡弯之前主动提前减速过弯。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 5,
                    "type": "实验结论",
                    "tangchiModel": "定量实验数据评估",
                    "stem": "Why does NMPC achieve 48% lower position error than DFBC in dynamically infeasible trajectories?",
                    "stemKeywords": ["48% lower error", "NMPC", "anticipates saturation", "proactively decelerates"],
                    "targetSentences": ["P2-S1", "P2-S2"],
                    "options": [
                        {
                            "key": "A",
                            "text": "Because NMPC has zero computational latency.",
                            "isCorrect": False,
                            "distractorType": "正反倒置",
                            "analysis": "NMPC 的单步计算耗时远高于 DFBC（2~5ms vs 0.05ms），并非零延迟。",
                            "refSentences": ["P2-S2"]
                        },
                        {
                            "key": "B",
                            "text": "Because NMPC optimizes future trajectories across a horizon and proactively decelerates before saturation occurs.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 同义替换",
                            "analysis": "对应 P2-S2：NMPC 在预测时域内进行多步滚动优化，能预先感知急弯处的推力饱和并提前降速平滑过弯。",
                            "refSentences": ["P2-S2"]
                        },
                        {
                            "key": "C",
                            "text": "Because NMPC uses higher motor maximum thrust than DFBC in the simulation.",
                            "isCorrect": False,
                            "distractorType": "偷换概念",
                            "analysis": "两者测试基于完全相同的高保真物理硬件参数，推力上限一致。",
                            "refSentences": ["P2-S1"]
                        },
                        {
                            "key": "D",
                            "text": "Because DFBC does not include any feedback loop.",
                            "isCorrect": False,
                            "distractorType": "曲解文意",
                            "analysis": "DFBC 具备外环 PD 反馈与底层高频 INDI 闭环反馈。",
                            "refSentences": ["P2-S1"]
                        }
                    ],
                    "officialAnswer": "B",
                    "presetReflection": {
                        "trapAnalysis": "抓住'预测控制（Predictive Control）'的核心本质——时域前瞻与约束前馈。",
                        "methodSummary": "当规划器产生超出硬件能力的激进指令时，NMPC 具备自适应平滑与抗崩溃能力。"
                    }
                }
            ]
        },
        {
            "id": "text5",
            "number": 5,
            "title": "V. Real-World Flight & Engineering Selection Guidelines",
            "chineseTitle": "第5章：大型动捕实飞验证与工程选型指南",
            "topic": "实飞实验 / 算力开销与工程选型",
            "overview": "在苏黎世大学 30m×30m×8m 大型 Vicon 动捕大厅中，定制竞速机（推重比 4.5:1）以 72 km/h 实飞极速刷圈，单拍耗时对比（DFBC 0.05ms vs NMPC 2.5~4.5ms），给出明确工程选型准则。",
            "figure": {
                "image": "题库/毕设/images/paper1_fig13_racetrack_tracking.png",
                "caption": "Fig. 13: 真实四旋翼无人机在 20 m/s 极速下跟踪 Race Track C 赛道的实测飞行轨迹与跟踪误差 (IEEE T-RO 2022)",
                "alt": "Fig. 13: Real flight tracking performance"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "实飞数据 · 极速 72 km/h 真实飞行结果与单拍耗时",
                    "mainIdea": "实飞验证了仿真结论：DFBC 单拍计算仅需 0.05 ms（快 50~100 倍），NMPC 单拍耗时 2.5~4.5 ms。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "Real-world flight experiments in the 30m x 30m x 8m motion capture arena successfully demonstrated agile tracking up to 20 m/s (72 km/h) and 5g centripetal acceleration.",
                            "translation": "在苏黎世大学 $30\\text{ m} \\times 30\\text{ m} \\times 8\\text{ m}$ 大型动作捕捉飞行大厅的实飞实验中，无人机成功以 20 m/s（72 km/h）极速与 5g 向心加速度完成极限赛道刷圈。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "DFBC requires only 0.05 ms per step, making it 50 to 100 times faster than NMPC (2.5 - 4.5 ms).",
                            "translation": "DFBC 单步计算仅需 **0.05 ms**，比 NMPC（2.5 ~ 4.5 ms）快 **50 到 100 倍**，极其适合嵌入式飞控单片机部署。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "工程结论 · 黄金选型准则三原则",
                    "mainIdea": "可行轨迹首选 DFBC+INDI 黄金性价比组合；复杂动态环境选 NMPC；INDI+阻力补偿是敏捷控制必备基石。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "First, for scenarios with kinodynamic-feasible trajectories, DFBC+INDI is the most cost-effective solution, achieving NMPC-level accuracy with negligible computation.",
                            "translation": "第一，对于具备动力学可行轨迹的场景，**DFBC+INDI 是性价比最高的黄金组合**，以极微小的算力实现媲美 NMPC 的顶级精度。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "Second, for highly dynamic or adversarial environments near actuator saturation, NMPC is indispensable.",
                            "translation": "第二，对于环境高度动态未知或执行器工作在饱和边缘的极限机动，**NMPC 是不可或缺的防崩溃前瞻方案**。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 3,
                            "id": "P2-S3",
                            "text": "Finally, the combination of an INDI inner-loop with aerodynamic drag compensation is the foundational cornerstone for any high-speed quadrotor controller.",
                            "translation": "最终结论：**“INDI 姿态内环 + 空气动力学阻力补偿” 是所有高速敏捷飞行控制器的必备核心基石**。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 6,
                    "type": "工程选型",
                    "tangchiModel": "毕设与工程落地决策",
                    "stem": "According to the final guidelines, when should an engineer prefer DFBC+INDI over NMPC for quadrotor agile flight?",
                    "stemKeywords": ["DFBC+INDI", "engineering guidelines", "cost-effective", "feasible trajectory"],
                    "targetSentences": ["P2-S1", "P1-S2"],
                    "options": [
                        {
                            "key": "A",
                            "text": "When the trajectory planner guarantees dynamic feasibility and onboard computational resources are limited.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 提炼总结",
                            "analysis": "对应 P2-S1 与 P1-S2：在轨迹动力学可行时，DFBC 耗时仅 0.05ms（比 NMPC 快 50-100 倍），精度与 NMPC 几乎完全一致，是嵌入式算力受限平台的最高性价比首选。",
                            "refSentences": ["P2-S1", "P1-S2"]
                        },
                        {
                            "key": "B",
                            "text": "When the motors frequently operate under severe over-thrust saturation.",
                            "isCorrect": False,
                            "distractorType": "正反倒置",
                            "analysis": "频繁饱和场景应选 NMPC。",
                            "refSentences": ["P2-S2"]
                        },
                        {
                            "key": "C",
                            "text": "When aerodynamic drag can be completely ignored in indoor low speed.",
                            "isCorrect": False,
                            "distractorType": "偷换概念",
                            "analysis": "阻力补偿是两者高速飞行的共同基础，不是优先选 DFBC 的理由。",
                            "refSentences": ["P2-S3"]
                        },
                        {
                            "key": "D",
                            "text": "When the quadrotor does not possess any IMU sensor for feedback.",
                            "isCorrect": False,
                            "distractorType": "逻辑谬误",
                            "analysis": "INDI 强烈依赖 IMU 高频角加速度反馈，没有 IMU 则无法运行。",
                            "refSentences": ["P2-S3"]
                        }
                    ],
                    "officialAnswer": "A",
                    "presetReflection": {
                        "trapAnalysis": "工程选型需要在'算力消耗'与'饱和处理能力'之间权衡取舍。",
                        "methodSummary": "熟记结论：可行轨迹选 DFBC+INDI（快 50-100 倍）；激进超限轨迹选 NMPC。"
                    }
                }
            ]
        }
    ]
}

# =========================================================================
# PAPER 2 DATASET: Adaptive INDI for Micro Air Vehicles (AIAA JGCD 2016)
# =========================================================================
paper2_data = {
    "year": "paper2",
    "subject": "毕设",
    "title": "文献2: 微型飞行器姿态控制的自适应增量非线性动态逆 (AIAA JGCD 2016)",
    "texts": [
        {
            "id": "text1",
            "number": 1,
            "title": "I. Abstract & Introduction: Sensor-Based Control Paradigm",
            "chineseTitle": "第1章：摘要与引言 · 基于传感器的控制范式与两大工程难题",
            "topic": "自适应控制 / 传感器增量动态逆",
            "overview": "选自荷兰代尔夫特理工大学 MAVLab 发表在《AIAA Journal of Guidance, Control, and Dynamics (JGCD 2016)》的权威文献。针对微型飞行器（MAV）提出自适应增量非线性动态逆（A-INDI），彻底解决传感器滤波延迟自激振荡与控制效能时变漂移难题。",
            "figure": {
                "image": "题库/毕设/images/paper2_fig6_bebop_drone.png",
                "caption": "Fig. 6: 荷兰代尔夫特理工大学实验飞行器 Parrot Bebop 四旋翼无人机与突加悬挂载荷装置 (AIAA JGCD 2016)",
                "alt": "Fig. 6: Bebop drone with payload"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "核心思想 · INDI 无模型控制原理",
                    "mainIdea": "INDI 仅依赖控制效能模型，利用传感器角加速度测量值替代复杂的动力学物理模型项。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "Incremental Nonlinear Dynamic Inversion (INDI) is a sensor-based nonlinear control approach that achieves high performance without requiring an accurate physical model.",
                            "translation": "增量非线性动态逆（Incremental Nonlinear Dynamic Inversion, INDI）是一种基于传感器的非线性控制方法，它在不需要被控对象精确数学模型的前提下实现高性能非线性控制。",
                            "isTopicSentence": True,
                            "isKeyEvidence": False
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "In MAV attitude control, INDI relies only on the control effectiveness model, replacing the remaining physical terms with real-time sensor measurements of angular acceleration.",
                            "translation": "在微型飞行器（MAV）姿态控制中，INDI 仅依赖控制效能模型，而利用角加速度的实时传感器测量值来替代传统模型中的其余复杂物理项。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "工程瓶颈 · 滤波延迟失稳与参数时变挑战",
                    "mainIdea": "MAV 应用 INDI 面临两大瓶颈：滤波相位滞后引起的自激振荡，以及控制效能矩阵的时变不确定性。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "This paper addresses two fundamental challenges in applying INDI: sensor and actuator filtering delays leading to severe phase lag, and time-varying control effectiveness.",
                            "translation": "本文系统解决了 INDI 在实际应用中的两大核心挑战：传感器滤波与执行器响应引入的时钟延迟与滤波相位滞后，以及飞行过程中控制效能矩阵的时变不确定性。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "We propose a synchronized virtual control law to compensate for low-pass filter delays and an online Normalized Least-Mean-Squares (NLMS) algorithm for adaptive parameter estimation.",
                            "translation": "我们提出了能够精确补偿低通滤波延迟的**时序同步虚拟控制律**，并引入机载**归一化最小均方误差（NLMS）**自适应算法实时辨识控制效能参数。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 1,
                    "type": "核心概念",
                    "tangchiModel": "控制理论本质解构",
                    "stem": "What distinguishes INDI from traditional Model-Based Nonlinear Dynamic Inversion (NDI)?",
                    "stemKeywords": ["INDI", "NDI", "sensor-based", "angular acceleration measurement"],
                    "targetSentences": ["P1-S1", "P1-S2"],
                    "options": [
                        {
                            "key": "A",
                            "text": "INDI requires an extremely precise aerodynamic CFD model of rotor damping.",
                            "isCorrect": False,
                            "distractorType": "正反倒置",
                            "analysis": "INDI 的初衷正是摆脱对精确流体气动 CFD 模型的依赖。",
                            "refSentences": ["P1-S1"]
                        },
                        {
                            "key": "B",
                            "text": "INDI replaces complex physical model terms with IMU angular acceleration sensor measurements, needing only the control effectiveness model.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 核心提炼",
                            "analysis": "对应 P1-S2：INDI 仅需控制效能矩阵 G，其余未建模力和力矩均由当前拍传感器实测角加速度增量直接替代抵消。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "C",
                            "text": "INDI cannot be implemented on microprocessors due to high computation.",
                            "isCorrect": False,
                            "distractorType": "曲解文意",
                            "analysis": "INDI 仅为简单的矩阵解析乘加运算，能在单片机上以 500Hz 极速运行。",
                            "refSentences": ["P1-S1"]
                        },
                        {
                            "key": "D",
                            "text": "INDI operates exclusively in the frequency domain without time-domain state feedback.",
                            "isCorrect": False,
                            "distractorType": "偷换概念",
                            "analysis": "INDI 是经典的时域逐拍状态/传感器增量控制律。",
                            "refSentences": ["P1-S2"]
                        }
                    ],
                    "officialAnswer": "B",
                    "presetReflection": {
                        "trapAnalysis": "NDI（模型依赖）vs INDI（传感器反馈依赖）是现代非线性控制的最关键分水岭。",
                        "methodSummary": "牢记口诀：'用传感器测量精度换取物理建模精度'。"
                    }
                }
            ]
        },
        {
            "id": "text2",
            "number": 2,
            "title": "II. Quadrotor Dynamics & Incremental NDI Formulation",
            "chineseTitle": "第2章：四旋翼转动动力学与增量动态逆展开",
            "topic": "动力学方程 / 泰勒展开与增量形式",
            "overview": "从欧拉转动方程出发，显式计入电机控制力矩 Mc、旋翼加减速自旋力矩 Mr，在上一时刻采样点附近进行一阶泰勒展开，推导经典 INDI 增量核心控制方程。",
            "figure": {
                "image": "题库/毕设/images/paper2_fig2_indi_diagram.png",
                "caption": "Fig. 2: 基于角加速度反馈与执行器状态反馈的标准 INDI 控制回路框图 (AIAA JGCD 2016)",
                "alt": "Fig. 2: Block diagram of INDI"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "公式推导 · 刚体转动动力学与电机力矩展开",
                    "mainIdea": "四旋翼姿态动力学包含控制力矩、气动力矩与螺旋桨自旋加减速反作用陀螺力矩。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "The rotational dynamics of the quadrotor are given by Euler's equation: I_v \\dot{\\Omega} + \\Omega \\times (I_v \\Omega) = M_a + M_c - M_r.",
                            "translation": "四旋翼飞行器的转动动力学由欧拉方程给出：$\\boldsymbol{I}_v \\dot{\\boldsymbol{\\Omega}} + \\boldsymbol{\\Omega} \\times (\\boldsymbol{I}_v \\boldsymbol{\\Omega}) = \\boldsymbol{M}_a(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\boldsymbol{M}_c - \\boldsymbol{M}_r$。",
                            "isTopicSentence": True,
                            "isKeyEvidence": False
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "Here, M_c represents the control moments generated by rotor thrusts, and M_r = I_r \\dot{\\omega} + \\Omega \\times I_r \\omega denotes the propeller gyroscopic and acceleration torque.",
                            "translation": "其中 $\\boldsymbol{M}_c$ 为旋翼产生的控制力矩，$\\boldsymbol{M}_r = \\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}} + \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_r \\boldsymbol{\\omega}$ 为螺旋桨自旋与加减速反作用陀螺力矩。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "公式推导 · 泰勒展开推导 INDI 核心增量方程",
                    "mainIdea": "在上一采样点进行一阶泰勒展开，用实测角加速度替换非线性项，得到增量线性方程。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "Applying a first-order Taylor series expansion around the previous time step (\\Omega_0, \\omega_0) yields the fundamental INDI incremental equation: \\dot{\\Omega} \\approx \\dot{\\Omega}_0 + G_1 diag(\\omega_0)(\\omega - \\omega_0).",
                            "translation": "在上一时刻采样点 $(\\boldsymbol{\\Omega}_0, \\boldsymbol{\\omega}_0)$ 附近进行一阶泰勒展开，并利用实测角加速度 $\\dot{\\boldsymbol{\\Omega}}_0$ 替代非线性物理模型项，得到 **INDI 核心增量方程**：$\\dot{\\boldsymbol{\\Omega}} \\approx \\dot{\\boldsymbol{\\Omega}}_0 + \\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_0)(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0)$。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 2,
                    "type": "细节题",
                    "tangchiModel": "数学推导与物理项分析",
                    "stem": "In the derivation of INDI, what replaces the complex unknown nonlinear aerodynamic moments M_a?",
                    "stemKeywords": ["M_a", "Taylor expansion", "sensor angular acceleration", "dot_Omega_0"],
                    "targetSentences": ["P2-S1"],
                    "options": [
                        {
                            "key": "A",
                            "text": "An offline neural network trained on wind tunnel datasets.",
                            "isCorrect": False,
                            "distractorType": "无中生有",
                            "analysis": "文中未采用离线神经网络。",
                            "refSentences": ["P2-S1"]
                        },
                        {
                            "key": "B",
                            "text": "The real-time sensor measurement of angular acceleration dot_Omega_0 from the IMU.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 原文推导",
                            "analysis": "对应 P2-S1：泰勒展开基准点直接使用传感器上一时刻实测角加速度 dot_Omega_0，包含了所有作用在机体上的实际外力矩效果。",
                            "refSentences": ["P2-S1"]
                        },
                        {
                            "key": "C",
                            "text": "A linear damper model with constant damping coefficients.",
                            "isCorrect": False,
                            "distractorType": "偷换概念",
                            "analysis": "线性阻尼属于传统模型，INDI 并不需要设定常数阻尼项。",
                            "refSentences": ["P2-S1"]
                        },
                        {
                            "key": "D",
                            "text": "The collective vertical thrust command.",
                            "isCorrect": False,
                            "distractorType": "概念混淆",
                            "analysis": "总推力指令是控制输入的一部分，不能替代气动力矩。",
                            "refSentences": ["P2-S1"]
                        }
                    ],
                    "officialAnswer": "B",
                    "presetReflection": {
                        "trapAnalysis": "理解 INDI 的核心即：通过传感器实测上一拍的实际加速度输出，间接获知了所有外部未建模力矩的总和。",
                        "methodSummary": "泰勒级数增量化是化简强非线性系统的精妙数学工具。"
                    }
                }
            ]
        },
        {
            "id": "text3",
            "number": 3,
            "title": "III. Sensor/Actuator Delay & Synchronized Filter Compensation",
            "chineseTitle": "第3章：时序滤波延迟分析与同步补偿控制律设计",
            "topic": "延迟补偿 / 巴特沃斯滤波与时序对齐",
            "overview": "深入研究陀螺仪二阶巴特沃斯低通滤波器与电机电调惯性环节引入的时间滞后，提出对称滤波通道控制律，彻底根除未补偿 INDI 引起的自激极限环剧烈振荡。",
            "figure": {
                "image": "题库/毕设/images/paper2_fig5_filter_compensation.png",
                "caption": "Fig. 5: 消除相位滞后与极限环振荡的时序对称低通滤波补偿结构控制框图 (AIAA JGCD 2016)",
                "alt": "Fig. 5: Filter delay compensation"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "问题机理 · 滤波滞后引发的回路自激振荡",
                    "mainIdea": "陀螺仪信号滤波去噪引入了显著时间滞后，直接输入增量控制律会导致系统在穿越频率处失稳。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "Angular acceleration is obtained by differentiating gyro signals followed by a second-order Butterworth low-pass filter H(z) to suppress high-frequency motor vibrations.",
                            "translation": "角加速度通过对陀螺仪信号进行数值差分并经过二阶巴特沃斯低通滤波器 $H(z)$ 滤波以滤除电机高频震动。",
                            "isTopicSentence": True,
                            "isKeyEvidence": False
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "This filtering delay causes the measured angular acceleration \\dot{\\Omega}_f to reflect past actuator inputs, leading to severe limit-cycle oscillations if uncompensated.",
                            "translation": "然而，滤波延迟导致传感器测得的角加速度 $\\dot{\\boldsymbol{\\Omega}}_f$ 实际反映的是过去时刻的电机转速，若不加补偿会直接导致闭环回路发生严重的自激极限环振荡。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "解决方案 · 对称时钟同步虚拟控制律推导",
                    "mainIdea": "将电机控制量引入相同的滤波通道 omega_f，使控制输入与传感器测量在时序上完全对齐。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "To eliminate the phase mismatch, we introduce actuator command into a matching filter channel \\omega_f, deriving the synchronized control law.",
                            "translation": "为了消除相位失配，论文提出将执行机构控制量引入对称滤波通道 $\\boldsymbol{\\omega}_f$，推导出时序同步控制律。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "This structure mathematically preserves phase margin at crossover frequency, completely eradicating uncompensated oscillations.",
                            "translation": "该结构在数学上保证了开环传递函数在穿越频率处的相位裕度，彻底根除了未补偿 INDI 的极限环高频抖振。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 3,
                    "type": "推断题",
                    "tangchiModel": "频域与时序同步分析",
                    "stem": "Why does an uncompensated INDI controller cause limit-cycle oscillation on real MAV hardware?",
                    "stemKeywords": ["limit-cycle oscillation", "phase lag", "Butterworth filter", "uncompensated INDI"],
                    "targetSentences": ["P1-S2"],
                    "options": [
                        {
                            "key": "A",
                            "text": "Because the low-pass filter H(z) introduces phase lag, causing the measured angular acceleration to lag behind current actuator commands.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 机理解析",
                            "analysis": "对应 P1-S2：低通滤波器去噪的同时引入了相位滞后，传感器测量值反映的是历史过去的电机状态，若与当前拍指令直接相减会引发高频自激振荡。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "B",
                            "text": "Because the battery voltage is too high for the electronic speed controllers.",
                            "isCorrect": False,
                            "distractorType": "无中生有",
                            "analysis": "电池电压不是滤波延迟振荡的机理根源。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "C",
                            "text": "Because the quadrotor inertia matrix J is assumed to be zero.",
                            "isCorrect": False,
                            "distractorType": "荒谬项",
                            "analysis": "转动惯量 J 是非零正定矩阵。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "D",
                            "text": "Because INDI ignores propeller rotation direction.",
                            "isCorrect": False,
                            "distractorType": "偷换概念",
                            "analysis": "旋翼旋转方向已包含在控制矩阵符号中。",
                            "refSentences": ["P1-S2"]
                        }
                    ],
                    "officialAnswer": "A",
                    "presetReflection": {
                        "trapAnalysis": "控制理论中的经典法则：传感器端加了多大的滤波滞后，指令通道就必须对称补偿同等时序。",
                        "methodSummary": "对称时钟对齐（Symmetric Filter Compensation）是工程上解决滤波相位滞后的标杆技巧。"
                    }
                }
            ]
        },
        {
            "id": "text4",
            "number": 4,
            "title": "IV. Adaptive Online Parameter Estimation (A-INDI)",
            "chineseTitle": "第4章：自适应参数在线辨识算法 (A-INDI)",
            "topic": "自适应辨识 / 归一化最小均方误差 (NLMS)",
            "overview": "引入基于归一化最小均方误差（NLMS）的在线自适应辨识律，实时估计时变控制效能矩阵 G1，免除人工离线建模，适应电池降压与挂载突变。",
            "figure": {
                "image": "题库/毕设/images/paper2_fig18_19_adaptation_curves.png",
                "caption": "Fig. 18 & 19: 自适应 A-INDI 算法在飞行中实时追踪控制效能参数 G1 变化的收敛曲线 (AIAA JGCD 2016)",
                "alt": "Fig. 18-19: Parameter adaptation curves"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "算法推导 · NLMS 在线自适应递推公式",
                    "mainIdea": "根据角加速度预测误差，以极小的计算开销实时修正控制效能估计矩阵 G1。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "To eliminate the need for manual offline calibration, an online Normalized Least-Mean-Squares (NLMS) algorithm is implemented.",
                            "translation": "为了使控制器彻底摆脱对离线人工参数测定的依赖，论文引入了基于**归一化最小均方误差（NLMS）**的在线自适应辨识算法。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "The control effectiveness estimate G_1 is updated per step based on prediction error e(k) = \\dot{\\Omega}_f(k) - \\dot{\\Omega}_{f,pred}(k).",
                            "translation": "控制效能矩阵 $\\hat{\\boldsymbol{G}}_1$ 在每个控制周期根据滤波角加速度预测误差 $\\boldsymbol{e}(k) = \\dot{\\boldsymbol{\\Omega}}_f(k) - \\dot{\\boldsymbol{\\Omega}}_{f,\\text{pred}}(k)$ 进行在线递推更新。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 3,
                            "id": "P1-S3",
                            "text": "Because NLMS involves only simple vector dot products, it runs effortlessly at 512 Hz on low-cost onboard microcontrollers.",
                            "translation": "由于 NLMS 仅涉及简单的向量点乘与除法运算，它可以在低成本机载单片机上以 512 Hz 实时无延迟运行。",
                            "isTopicSentence": False,
                            "isKeyEvidence": False
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 4,
                    "type": "算法特性",
                    "tangchiModel": "机载算法算力开销剖析",
                    "stem": "What is the primary advantage of choosing NLMS over complex recursive least squares for onboard MAV parameter adaptation?",
                    "stemKeywords": ["NLMS", "onboard microcontrollers", "vector dot products", "512 Hz"],
                    "targetSentences": ["P1-S3"],
                    "options": [
                        {
                            "key": "A",
                            "text": "It requires only simple vector operations, running effortlessly at 512 Hz with minimal computational burden.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 同义提炼",
                            "analysis": "对应 P1-S3：NLMS 避免了高阶矩阵求逆，计算量仅几条点乘，极度适合资源受限的微型飞控单片机。",
                            "refSentences": ["P1-S3"]
                        },
                        {
                            "key": "B",
                            "text": "It guarantees zero tracking error even under total sensor blackout.",
                            "isCorrect": False,
                            "distractorType": "过度推理",
                            "analysis": "传感器断电时任何自适应算法均无法工作。",
                            "refSentences": ["P1-S3"]
                        },
                        {
                            "key": "C",
                            "text": "It transforms the nonlinear Euler equations into linear time-invariant forms.",
                            "isCorrect": False,
                            "distractorType": "概念混淆",
                            "analysis": "NLMS 是参数估计器，不改变被控对象的非线性物理本质。",
                            "refSentences": ["P1-S1"]
                        },
                        {
                            "key": "D",
                            "text": "It eliminates the need for gyro differentiation entirely.",
                            "isCorrect": False,
                            "distractorType": "无中生有",
                            "analysis": "预测误差仍然需要与陀螺仪差分加速度做对比更新。",
                            "refSentences": ["P1-S2"]
                        }
                    ],
                    "officialAnswer": "A",
                    "presetReflection": {
                        "trapAnalysis": "自适应算法的工程选型关键看算力性价比：NLMS（复杂度 O(N)）vs RLS（复杂度 O(N^2)）。",
                        "methodSummary": "微型嵌入式飞控（512 Hz）首选极简稳定的 NLMS 归一化自适应律。"
                    }
                }
            ]
        },
        {
            "id": "text5",
            "number": 5,
            "title": "V. Real Flight Experiments: Step Disturbance & Bumpers Adaptation",
            "chineseTitle": "第5章：实机飞行实验 · 突加负载抗扰与防撞圈拆装自适应",
            "topic": "飞行实验 / 阶跃卸载抗扰与转子动量补偿",
            "overview": "在开源 Paparazzi 飞控的 Parrot Bebop 四旋翼上进行 50g 突加挂载阶跃释放、机身防撞圈拆装参数自适应收敛，以及计入转子自旋动量力矩的偏航性能大幅提升验证。",
            "figure": {
                "image": "题库/毕设/images/paper2_fig8_9_step_response.png",
                "caption": "Fig. 8 & 9: 50g 突加重物瞬间断线释放时的俯仰角阶跃扰动响应曲线对比（A-INDI 恢复时间比经典 PID 快 5 倍） (AIAA JGCD 2016)",
                "alt": "Fig. 8-9: Step disturbance response"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "实验对比 · 突加 50g 负载断线阶跃扰动抑制",
                    "mainIdea": "在空中突然释放 50g 负载时，A-INDI 恢复时间仅 0.3 秒，抗扰恢复速度比经典 PID 快 5 倍。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "In a step disturbance test where a 50g attached weight was suddenly dropped during hover, classical PID exhibited a 15-degree pitch jump taking 1.5 s to recover.",
                            "translation": "在阶跃扰动试验中，悬停时通过细线悬挂的 50g 额外重物在空中被突然释放（相当于瞬间阶跃卸载），经典 PID 出现了高达 15° 的俯仰角剧烈突跳，耗时 **1.5 秒** 才恢复平衡。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "In contrast, A-INDI limited the attitude deviation to under 4 degrees and stabilized within 0.3 s (5 times faster than PID).",
                            "translation": "相比之下，A-INDI 将姿态波动峰值限制在 **4° 以内**，仅耗时 **0.3 秒** 即完全重置回水平（**抗扰恢复速度比 PID 快 5 倍**）。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "实验对比 · 防撞圈自适应收敛与偏航角动量补偿",
                    "mainIdea": "加装防撞保护圈后参数在 2~3 秒内自适应收敛；显式补偿转子惯量力矩使偏航上升时间缩短 40%。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "When mounting or removing propeller protective bumpers in flight, the online adaptation converged to true control effectiveness within 2 to 3 seconds.",
                            "translation": "在飞行过程中为机身加装或拆卸螺旋桨防撞保护圈时，在线自适应算法在 **2 到 3 秒内** 迅速从初始默认值收敛至真实物理效能值。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "Furthermore, accounting for rotor angular momentum I_r \\dot{\\omega} shortened yaw doublet rise time by 40%, overcoming traditional sluggish quadrotor yaw response.",
                            "translation": "此外，显式计入并补偿转子自旋角动量力矩 $\\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}}$ 使偏航 Doublet 指令的跟踪上升时间缩短了 **40%**，彻底解决了四旋翼偏航响应迟缓的固有缺陷。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 5,
                    "type": "实验数据",
                    "tangchiModel": "抗扰能力定量评估",
                    "stem": "How much faster did A-INDI recover from the 50g sudden payload drop compared to classical PID?",
                    "stemKeywords": ["50g payload drop", "recover faster", "0.3s vs 1.5s", "5 times faster"],
                    "targetSentences": ["P1-S1", "P1-S2"],
                    "options": [
                        {
                            "key": "A",
                            "text": "2 times faster.",
                            "isCorrect": False,
                            "distractorType": "数值偏差",
                            "analysis": "数值错误，文中实测为 0.3s vs 1.5s（5倍）。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "B",
                            "text": "5 times faster (0.3 s vs 1.5 s).",
                            "isCorrect": True,
                            "distractorType": "正确项 · 数据精准匹配",
                            "analysis": "对应 P1-S1 与 P1-S2：PID 耗时 1.5s 且超调 15°，A-INDI 耗时 0.3s 且超调 <4°，抗扰恢复速度快 5 倍。",
                            "refSentences": ["P1-S1", "P1-S2"]
                        },
                        {
                            "key": "C",
                            "text": "10 times faster.",
                            "isCorrect": False,
                            "distractorType": "数值夸大",
                            "analysis": "夸大实验数据。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "D",
                            "text": "Both controllers had identical recovery times.",
                            "isCorrect": False,
                            "distractorType": "事实相反",
                            "analysis": "两者表现具有决定性差异。",
                            "refSentences": ["P1-S1", "P1-S2"]
                        }
                    ],
                    "officialAnswer": "B",
                    "presetReflection": {
                        "trapAnalysis": "精准提取实验数据对比：PID（15° / 1.5s）vs A-INDI（4° / 0.3s）。",
                        "methodSummary": "INDI 针对突发外力扰动具有单拍增量抵消特性，因此阶跃抗扰性能极度优越。"
                    }
                }
            ]
        }
    ]
}

# =========================================================================
# PAPER 3 DATASET: Attitude Control of Hydrobatic Intervention AUV Cuttlefish using INDI (IEEE/DFKI 2022)
# =========================================================================
paper3_data = {
    "year": "paper3",
    "subject": "毕设",
    "title": "文献3: 基于增量非线性动态逆的水下特技作业AUV姿态控制 (IEEE/DFKI 2022)",
    "texts": [
        {
            "id": "text1",
            "number": 1,
            "title": "I. Abstract & Introduction: Underwater Intervention Robotics",
            "chineseTitle": "第1章：摘要与引言 · 水下特技作业与流体建模黑盒难题",
            "topic": "水下机器人 / 特技机动与流体非线性",
            "overview": "选自德国人工智能研究中心（DFKI GmbH）机器人创新中心发表于 IEEE IROS 的前沿海洋机器人论文。首次将增量非线性动态逆（INDI）拓展至具备双机械臂的水下特技作业潜水器 AUV Cuttlefish，挑战 90° 俯仰特技过渡机动。",
            "figure": {
                "image": "题库/毕设/images/paper3_fig1_cuttlefish_auv.png",
                "caption": "Fig. 1: DFKI 大型海洋试验水池中处于垂直干预作业姿态的双臂特技 AUV Cuttlefish 实机照片 (IEEE IROS 2022)",
                "alt": "Fig. 1: AUV Cuttlefish in test basin"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "应用背景 · 水下自主运维与特技潜水器 Cuttlefish",
                    "mainIdea": "为解决海上风电与水下变电站运维难题，具备 360° 特技翻转与双机械臂的干预型 AUV 应运而生。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "Intervention Autonomous Underwater Vehicles (I-AUVs), such as the dual-arm hydrobatic vehicle Cuttlefish, require agile attitude control to operate in confined subsea structures.",
                            "translation": "干预型自主水下航行器（I-AUV），例如配备双作业机械臂的特技潜水器 **Cuttlefish**，需要高敏捷姿态控制能力以深入狭窄的海底钢结构空间作业。",
                            "isTopicSentence": True,
                            "isKeyEvidence": False
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "Equipped with 8 thrusters, Cuttlefish can perform 360-degree hydrobatic maneuvers and transition from horizontal cruise to vertical intervention poses.",
                            "translation": "Cuttlefish 配备 8 个无刷推进器，具备 360° 水下特技机动能力（Hydrobatics），能够在水体中从水平巡航姿态快速切换到垂直作业姿态。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "核心瓶颈 · 水动力学黑盒与建模辨识困难",
                    "mainIdea": "大角度机动时附加质量与二次阻尼极难精确建模，INDI 用传感器测量精度换取动力学模型精度。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "Hydrodynamic parameters, such as added mass and quadratic drag, vary dramatically during large-angle maneuvers and are notoriously difficult to identify accurately.",
                            "translation": "当 AUV 进行大角度变姿态机动时，水动力附加质量（Added Mass）与非线性二次速度阻尼（Quadratic Drag）急剧变化，在物理上极难精确测定辨识。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "INDI overcomes this modeling bottleneck by trading hydrodynamic model accuracy for high-frequency sensor measurement accuracy.",
                            "translation": "INDI 通过引入高频加速度传感器反馈与执行器推力反馈，对非线性系统进行逐拍增量局部线性化，从而实现了**“用传感器测量精度换取动力学模型精度”**。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 1,
                    "type": "概念理解",
                    "tangchiModel": "海洋机器人控制瓶颈分析",
                    "stem": "Why is traditional model-based control (such as Feedback Linearization) particularly challenging for hydrobatic underwater vehicles?",
                    "stemKeywords": ["hydrobatic", "added mass", "quadratic drag", "difficult to identify"],
                    "targetSentences": ["P2-S1"],
                    "options": [
                        {
                            "key": "A",
                            "text": "Because underwater vehicles operate with zero gravitational force.",
                            "isCorrect": False,
                            "distractorType": "事实违背",
                            "analysis": "水下航行器受到重力与浮力的共同恢复力矩作用，非零重力。",
                            "refSentences": ["P2-S1"]
                        },
                        {
                            "key": "B",
                            "text": "Because complex hydrodynamic parameters like time-varying added mass and quadratic damping are notoriously difficult to identify accurately in turbulent waters.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 原文提炼",
                            "analysis": "对应 P2-S1：大角度翻转时水流处于层流湍流过渡区，附加质量与非线性阻尼矩阵参数极难精确辨识，模型误差会直接导致 FBL 施加反向错误补偿推力。",
                            "refSentences": ["P2-S1"]
                        },
                        {
                            "key": "C",
                            "text": "Because underwater vehicles cannot use brushless thrusters.",
                            "isCorrect": False,
                            "distractorType": "常识错误",
                            "analysis": "Cuttlefish 正是配备了 8 个大功率无刷推进器。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "D",
                            "text": "Because optical cameras cannot function underwater.",
                            "isCorrect": False,
                            "distractorType": "无中生有",
                            "analysis": "视觉传感器与动力学模型控制律无关。",
                            "refSentences": ["P2-S1"]
                        }
                    ],
                    "officialAnswer": "B",
                    "presetReflection": {
                        "trapAnalysis": "水下动力学的最大难点在于'流固耦合与未知水动力参数（附加质量与二次阻尼）'。",
                        "methodSummary": "INDI 彻底免除水动力阻尼建模，是海洋机器人领域的重大理论突破。"
                    }
                }
            ]
        },
        {
            "id": "text2",
            "number": 2,
            "title": "II. 6-DOF Underwater Dynamics & Feedback Linearization (FBL)",
            "chineseTitle": "第2章：6自由度水下航行器动力学与反馈线性化基准",
            "topic": "水动力模型 / Fossen 标准方程与 FBL 基准",
            "overview": "根据 Fossen 海洋航行器标准动力学理论建立 6-DOF 刚体与水动力方程，推导对比基准——经典基于模型的反馈线性化（Feedback Linearization, FBL）控制律。",
            "figure": {
                "image": "题库/毕设/images/paper3_fig2_fbl_diagram.png",
                "caption": "Fig. 2: 经典基于精确水动力模型的反馈线性化 (FBL) 速度控制回路框图 (IEEE IROS 2022)",
                "alt": "Fig. 2: FBL velocity controller diagram"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "数学公式 · Fossen 6 自由度水动力学标准微分方程",
                    "mainIdea": "水下航行器动力学包含刚体与水动力质量 M、科氏力 C(nu)、线性与非线性阻尼 D(nu) 和恢复力 g(eta)。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "Following Fossen's underwater vehicle dynamics, the 6-DOF equations in body frame are: M \\dot{\\nu} + C(\\nu)\\nu + D(\\nu)\\nu + g(\\eta) = \\tau.",
                            "translation": "根据 Fossen 海洋航行器动力学标准建模理论，6 自由度 AUV 在机体坐标系下的运动学与动力学方程表示为：$\\boldsymbol{M}\\dot{\\boldsymbol{\\nu}} + \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta}) = \\boldsymbol{\\tau}$。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "Here, M combines rigid-body mass and hydrodynamic added mass, D(\\nu) represents linear and quadratic damping, and g(\\eta) denotes gravitational and buoyancy restoring wrench.",
                            "translation": "其中 $\\boldsymbol{M} = \\boldsymbol{M}_{RB} + \\boldsymbol{M}_A$ 为刚体惯性与水动力附加质量之和，$\\boldsymbol{D}(\\boldsymbol{\\nu})$ 包含线性与二次阻尼，$\\boldsymbol{g}(\\boldsymbol{\\eta})$ 为重力与浮力恢复力矩矢量。",
                            "isTopicSentence": False,
                            "isKeyEvidence": False
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "算法剖析 · 经典反馈线性化 FBL 的固有缺陷",
                    "mainIdea": "FBL 必须显式计算并抵消总非线性场 f(nu, eta)，模型微小失配即导致稳态漂移与振荡。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "The model-based Feedback Linearization control law is formulated as: \\tau_{ref} = M a_{ref} + f(\\nu, \\eta), where f(\\nu, \\eta) = C(\\nu)\\nu + D(\\nu)\\nu + g(\\eta).",
                            "translation": "经典基于模型的反馈线性化（FBL）控制律表示为：$\\boldsymbol{\\tau}_{ref} = \\boldsymbol{M} \\boldsymbol{a}_{ref} + \\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta})$，其中 $\\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta}) = \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta})$。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "The inherent drawback of FBL is its total reliance on precise identification of all terms in f(\\nu, \\eta); any modeling error directly degrades decoupling and stability.",
                            "translation": "FBL 的本质缺陷在于它完全依赖于对 $\\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta})$ 中每一个参数的精密辨识；一旦阻尼或恢复力矩存在微小辨识误差，系统就无法实现真正的解耦和精确补偿。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 2,
                    "type": "机理分析",
                    "tangchiModel": "控制算法数学解构",
                    "stem": "Why does Feedback Linearization (FBL) fail to maintain zero steady-state drift in turbulent underwater conditions?",
                    "stemKeywords": ["Feedback Linearization", "steady-state drift", "f(nu, eta)", "modeling error"],
                    "targetSentences": ["P2-S2"],
                    "options": [
                        {
                            "key": "A",
                            "text": "Because FBL relies on exact cancellation of f(nu, eta); any error in identified damping or restoring wrench injects incorrect control forces.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 本质剖析",
                            "analysis": "对应 P2-S2：FBL 试图在软件中完整复刻并减去非线性项，一旦实际水流阻尼与预设模型不符，抵消项就会变成多余的推力扰动，造成持续漂移。",
                            "refSentences": ["P2-S2"]
                        },
                        {
                            "key": "B",
                            "text": "Because FBL can only control 1 degree of freedom.",
                            "isCorrect": False,
                            "distractorType": "常识错误",
                            "analysis": "FBL 适用于多自由度 MIMO 系统。",
                            "refSentences": ["P1-S1"]
                        },
                        {
                            "key": "C",
                            "text": "Because FBL requires digital computers that cannot operate on submarines.",
                            "isCorrect": False,
                            "distractorType": "荒谬项",
                            "analysis": "Cuttlefish 搭载机载计算机正常运行 FBL。",
                            "refSentences": ["P2-S1"]
                        },
                        {
                            "key": "D",
                            "text": "Because FBL ignores the vehicle mass matrix M.",
                            "isCorrect": False,
                            "distractorType": "偷换概念",
                            "analysis": "FBL 公式中显式包含了质量矩阵 M。",
                            "refSentences": ["P2-S1"]
                        }
                    ],
                    "officialAnswer": "A",
                    "presetReflection": {
                        "trapAnalysis": "模型前馈补偿是把双刃剑：模型准则精度极高，模型不准则成为最大的人工扰动源。",
                        "methodSummary": "深刻理解 FBL'完全依赖模型'与 INDI'完全依赖传感器反馈'的鲜明对立。"
                    }
                }
            ]
        },
        {
            "id": "text3",
            "number": 3,
            "title": "III. 6-DOF Incremental NDI & Thruster Allocation",
            "chineseTitle": "第3章：水下6自由度增量动态逆控制律与推力分配",
            "topic": "INDI 推导 / 伪逆推力分配与四元数外环",
            "overview": "推导水下 6-DOF INDI 控制律（彻底免除阻尼与科氏力建模），通过加权 Moore-Penrose 伪逆求解 8 推进器推力分配，结合 SO(3) 四元数姿态误差控制律规避奇异性。",
            "figure": {
                "image": "题库/毕设/images/paper3_fig3_indi_diagram.png",
                "caption": "Fig. 3: 仅依赖惯性矩阵 M 与高频加速度反馈的水下 6-DOF INDI 速度控制器框图 (IEEE IROS 2022)",
                "alt": "Fig. 3: INDI controller diagram"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "公式推导 · 6 自由度水下 INDI 控制律",
                    "mainIdea": "在相邻采样间隔内水动力变化为高阶极小量，推导出参数极简的 INDI 控制律。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "At high sampling frequencies (50 - 100 Hz), hydrodynamic wrench changes between consecutive steps are negligible compared to thruster force increments.",
                            "translation": "由于控制回路采样频率较高（50 ~ 100 Hz），在相邻采样间隔 $\\Delta t$ 内，航行器水动力学力变化相比执行机构推力增量 $\\Delta \\boldsymbol{\\tau}$ 是极小量，可以忽略。",
                            "isTopicSentence": True,
                            "isKeyEvidence": False
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "By replacing previous states with filtered sensor acceleration \\dot{\\nu}_f and thruster force \\tau_f, we derive the core INDI control law: \\tau_{ref} = \\tau_f + M (a_{ref} - \\dot{\\nu}_f).",
                            "translation": "用经过低通滤波的传感器实测加速度 $\\dot{\\boldsymbol{\\nu}}_f$ 替代上一拍加速度，用推进器当前实际推力 $\\boldsymbol{\\tau}_f$ 替代上一拍推力，推导得出 **水下 INDI 控制律**：$\\boldsymbol{\\tau}_{ref} = \\boldsymbol{\\tau}_f + \\boldsymbol{M} (\\boldsymbol{a}_{ref} - \\dot{\\boldsymbol{\\nu}}_f)$。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 3,
                            "id": "P1-S3",
                            "text": "Crucially, this equation contains zero terms of damping D(\\nu), Coriolis C(\\nu), or restoring forces g(\\eta), reducing the modeling burden to merely the inertia matrix M.",
                            "translation": "最核心的优势在于：整个公式中**完全不包含阻尼 $\\boldsymbol{D}(\\boldsymbol{\\nu})$、科氏力 $\\boldsymbol{C}(\\boldsymbol{\\nu})$ 和恢复力 $\\boldsymbol{g}(\\boldsymbol{\\eta})$！** 将水下建模负担极简缩减至仅需一个惯性矩阵 $\\boldsymbol{M}$。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "执行分配 · 8 推进器控制分配与李群姿态外环",
                    "mainIdea": "采用加权 Moore-Penrose 伪逆分配 8 个推进器推力，外环采用 SO(3) 避免万向节死锁。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "Thruster allocation maps the 6-DOF wrench command \\tau_{ref} to 8 individual thruster commands u via the Moore-Penrose pseudoinverse: u = B^T (B B^T)^-1 \\tau_{ref}.",
                            "translation": "推进器控制分配通过 Moore-Penrose 伪逆将 6 自由度广义力矩指令 $\\boldsymbol{\\tau}_{ref} \\in \\mathbb{R}^6$ 分配映射为 8 个推进器的推力设定值 $\\boldsymbol{u} \\in \\mathbb{R}^8$：$\\boldsymbol{u} = \\boldsymbol{B}^T (\\boldsymbol{B} \\boldsymbol{B}^T)^{-1} \\boldsymbol{\\tau}_{ref}$。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "To prevent Gimbal Lock singularity during 90-degree pitch maneuvers, the outer attitude loop employs an SO(3) rotation Lie Group formulation.",
                            "translation": "为了彻底消除 AUV 在 90° 俯仰大角度特技过渡机动中的万向节死锁（Gimbal Lock）奇异性，姿态外环控制器采用了基于李群 $SO(3)$ 旋转矩阵的姿态误差控制律。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 3,
                    "type": "公式理解",
                    "tangchiModel": "控制律极简特性分析",
                    "stem": "What parameters are strictly required by the underwater INDI control law \\tau_{ref} = \\tau_f + M * (a_{ref} - \\dot{\\nu}_f)?",
                    "stemKeywords": ["INDI control law", "parameters required", "inertia matrix M", "zero damping terms"],
                    "targetSentences": ["P1-S2", "P1-S3"],
                    "options": [
                        {
                            "key": "A",
                            "text": "Only the inertia matrix M (mass and added mass), requiring zero knowledge of D(nu), C(nu), or g(eta).",
                            "isCorrect": True,
                            "distractorType": "正确项 · 核心优势概括",
                            "analysis": "对应 P1-S3：公式中完全剔除了阻尼矩阵 D、科氏力 C 和恢复力矩 g，仅需配置惯量矩阵 M 和推力配置矩阵 B，参数配置极简且调试周期大幅缩短。",
                            "refSentences": ["P1-S2", "P1-S3"]
                        },
                        {
                            "key": "B",
                            "text": "Both linear and quadratic drag coefficients identified from a 50-hour towing tank experiment.",
                            "isCorrect": False,
                            "distractorType": "概念混淆",
                            "analysis": "阻尼系数是 FBL 所必需的，INDI 并不需要。",
                            "refSentences": ["P1-S3"]
                        },
                        {
                            "key": "C",
                            "text": "An exact map of the ocean current speed and direction.",
                            "isCorrect": False,
                            "distractorType": "无中生有",
                            "analysis": "洋流速度会被加速度计在下一拍自动增量抵消，无需预先测绘地图。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "D",
                            "text": "A numerical solver for high-dimensional partial differential equations.",
                            "isCorrect": False,
                            "distractorType": "夸大复杂度",
                            "analysis": "INDI 仅为简单的矩阵向量减法与乘法。",
                            "refSentences": ["P1-S2"]
                        }
                    ],
                    "officialAnswer": "A",
                    "presetReflection": {
                        "trapAnalysis": "把握 INDI 与传统控制的根本差异：'从数十个流体参数的痛苦辨识，骤降到仅需一个质量矩阵 M'。",
                        "methodSummary": "水下航行器姿态控制的终极工程利器就是简洁的 tau_f + M (a_ref - dot_nu_f)。"
                    }
                }
            ]
        },
        {
            "id": "text4",
            "number": 4,
            "title": "IV. Water Basin Pitch-up Hydrobatic Maneuver Experiments",
            "chineseTitle": "第4章：大型试验水池 90° 俯仰特技机动对比实验",
            "topic": "水池实验 / 90度俯仰特技与稳态角度对比",
            "overview": "在 DFKI 德国人工智能研究中心 24m×18m×8m 大型海洋试验水池中，进行 90° 水下俯仰特技（从水平巡航翻转至垂直直立），对比 INDI、线性阻尼 FBL 与二次阻尼 FBL 的稳态姿态误差与各轴速度 RMSE。",
            "figure": {
                "image": "题库/毕设/images/paper3_fig5_pitch_up_maneuvers.png",
                "caption": "Fig. 5: AUV Cuttlefish 在水池中执行 3 轮 90° 俯仰特技过渡机动实测姿态与角速度曲线对比 (IEEE IROS 2022)",
                "alt": "Fig. 5: Three pitch-up maneuvers"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "实验数据 · 90° 俯仰特技机动稳态角度误差对比",
                    "mainIdea": "在 5 秒内翻转 90° 并稳定保持中，INDI 稳态角度误差仅 0.0829°，显著优于 FBL（1.35° 与 1.69°）。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "The 90-degree pitch-up maneuver transitions the AUV from horizontal cruise to vertical intervention pose in 5 seconds.",
                            "translation": "90° 俯仰特技机动（Pitch-up Maneuver）要求潜水器在 5 秒内从水平巡航姿态快速翻转 90° 进入垂直干预作业姿态。",
                            "isTopicSentence": True,
                            "isKeyEvidence": False
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "INDI achieved a steady-state attitude angle error of only 0.0829 degrees, whereas linear-drag FBL had 1.3459 degrees and quadratic-drag FBL had 1.6897 degrees.",
                            "translation": "实机水池试验表明：**INDI 控制器的稳态姿态角度误差仅为 0.0829°**；而线性阻尼 FBL 稳态误差为 1.3459°，二次非线性阻尼 FBL 为 1.6897°（**INDI 精度提升一个数量级以上**）。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "机理反思 · 为什么二次阻尼 FBL 表现反而劣于线性 FBL？",
                    "mainIdea": "在低速与大角度翻转时流场复杂，二次阻尼模型高估了阻尼导致 FBL 反向过度补偿。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "Interestingly, quadratic FBL performed worse than linear FBL because quadratic drag parameters in the transitional flow regime were slightly overestimated, injecting counterproductive compensation forces.",
                            "translation": "值得深入反思的是：二次非线性阻尼 FBL 的跟踪表现反而劣于线性 FBL，这是因为在低速与变姿态翻转过渡流区中，辨识出的二次阻尼项偏大，导致 FBL 控制回路施加了过量的反向抵消力，反而放大了误差。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "INDI completely avoided this issue because it does not rely on any model of fluid damping.",
                            "translation": "而 INDI 完全规避了这一风险，因为它从根本上不依赖任何流体阻力数学模型。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 4,
                    "type": "实验反思",
                    "tangchiModel": "学术深层次机理剖析",
                    "stem": "Why did Quadratic-Drag Feedback Linearization perform worse than Linear-Drag FBL during the pitch-up maneuver?",
                    "stemKeywords": ["Quadratic-Drag FBL", "performed worse", "overestimated damping", "counterproductive compensation"],
                    "targetSentences": ["P2-S1"],
                    "options": [
                        {
                            "key": "A",
                            "text": "Because the thrusters caught fire during the test.",
                            "isCorrect": False,
                            "distractorType": "荒谬项",
                            "analysis": "无水下起火情况发生。",
                            "refSentences": ["P2-S1"]
                        },
                        {
                            "key": "B",
                            "text": "Because the identified quadratic damping coefficients were overestimated in the transitional flow regime, injecting excessive counterproductive compensation forces.",
                            "isCorrect": True,
                            "distractorType": "正确项 · 深刻机理",
                            "analysis": "对应 P2-S1：二次阻尼在低速变姿态过渡流区中极难测准，模型高估了阻尼后，FBL 控制回路计算出过大的抵消推力，反而人为放大了系统振荡与角度误差。",
                            "refSentences": ["P2-S1"]
                        },
                        {
                            "key": "C",
                            "text": "Because linear drag models have infinite bandwidth.",
                            "isCorrect": False,
                            "distractorType": "概念混淆",
                            "analysis": "线性阻尼属于低阶经验近似，并不具有无限带宽。",
                            "refSentences": ["P2-S1"]
                        },
                        {
                            "key": "D",
                            "text": "Because INDI forced the vehicle into a safety shutdown mode.",
                            "isCorrect": False,
                            "distractorType": "无中生有",
                            "analysis": "INDI 表现最佳且运行平稳，非安全关机。",
                            "refSentences": ["P1-S2"]
                        }
                    ],
                    "officialAnswer": "B",
                    "presetReflection": {
                        "trapAnalysis": "常人往往误以为'模型越复杂（二次阻尼）控制效果就越好'，但实际工程中复杂模型参数稍有不准便会变成系统剧毒毒药。",
                        "methodSummary": "这一学术反思是毕业设计论文答辩中极具深度的'控制工程思考亮点'。"
                    }
                }
            ]
        },
        {
            "id": "text5",
            "number": 5,
            "title": "V. 300s Station Keeping Drift & Fault Tolerance Outlook",
            "chineseTitle": "第5章：300秒定点悬停漂移评估与容错控制展望",
            "topic": "悬停实验 / 空间位置漂移与容错控制",
            "overview": "在水下保持 90° 垂直直立状态 300 秒定点悬停，记录空间位置漂移（INDI <0.1m vs FBL >1.5m~2.5m），分析能耗功率，并展望自适应 INDI 在推进器局部故障时的自容错重构潜力。",
            "figure": {
                "image": "题库/毕设/images/paper3_fig6_station_keeping_drift.png",
                "caption": "Fig. 6: 垂直直立姿态下定点悬停 300 秒实测水平面 (x, y) 空间位置漂移对比（INDI 几乎锁定在原点，FBL 漂移超 1.5~2.5 米） (IEEE IROS 2022)",
                "alt": "Fig. 6: Drift after 300s"
            },
            "paragraphs": [
                {
                    "pIndex": 1,
                    "logicRole": "实验数据 · 300 秒垂直悬停空间位置漂移对比",
                    "mainIdea": "在 300 秒垂直直立悬停中，INDI 空间位置漂移小于 0.1 m，而 FBL 累计漂移达 1.5 ~ 2.5 米。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P1-S1",
                            "text": "During the 300-second vertical station keeping test, INDI kept spatial position drift within 0.1 m in both x and y axes.",
                            "translation": "在水下保持 90° 垂直直立状态 300 秒的定点悬停抗漂移测试中，**INDI 在 $x$ 轴与 $y$ 轴的空间位置累计漂移均严格小于 0.1 m**（几乎完全锁定在原地不动）。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P1-S2",
                            "text": "In contrast, linear-drag FBL drifted by 1.5 m and quadratic-drag FBL drifted by over 2.5 m, with comparable continuous power consumption (2231 W for INDI vs 2274 W for quadratic FBL).",
                            "translation": "相比之下，线性阻尼 FBL 在 $x$ 轴累计漂移达 **1.5 m**，二次阻尼 FBL 累计漂移超过 **2.5 m**；同时两者的连续功耗相当（INDI 为 2231 W，二次 FBL 为 2274 W），证明 INDI 并未引入高频抖动或多余能耗。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                },
                {
                    "pIndex": 2,
                    "logicRole": "前瞻展望 · 推进器故障自容错控制潜力",
                    "mainIdea": "INDI 天然具备推力故障容错潜力，推进器衰减时可借助加速度闭环自动增量重构抵消。",
                    "sentences": [
                        {
                            "sIndex": 1,
                            "id": "P2-S1",
                            "text": "Furthermore, INDI inherently exhibits fault-tolerant control potential.",
                            "translation": "此外，INDI 天然具备极其优异的推力故障容错控制（Fault-Tolerant Control, FTC）潜力。",
                            "isTopicSentence": True,
                            "isKeyEvidence": True
                        },
                        {
                            "sIndex": 2,
                            "id": "P2-S2",
                            "text": "When a thruster suffers partial degradation or seaweed entanglement, the resulting acceleration loss is instantly sensed by IMU and compensated in the next incremental step without explicit fault diagnosis.",
                            "translation": "当某个推进器发生局部失效或水草缠绕衰减时，由此引起的加速度损失会被 IMU 加速度计在下一拍立即捕捉并自动增量抵消，在无需显式故障诊断模块的情况下直接实现闭环重构控制。",
                            "isTopicSentence": False,
                            "isKeyEvidence": True
                        }
                    ]
                }
            ],
            "questions": [
                {
                    "qIndex": 5,
                    "type": "实验评估",
                    "tangchiModel": "悬停稳定性与漂移量对比",
                    "stem": "What was the horizontal spatial position drift of INDI after 300 seconds of vertical station keeping?",
                    "stemKeywords": ["300s station keeping", "spatial drift", "< 0.1 m", "FBL 1.5m"],
                    "targetSentences": ["P1-S1", "P1-S2"],
                    "options": [
                        {
                            "key": "A",
                            "text": "Less than 0.1 m (nearly locked in place).",
                            "isCorrect": True,
                            "distractorType": "正确项 · 极高精度",
                            "analysis": "对应 P1-S1：INDI 在 x 轴与 y 轴的漂移均 <0.1m，而 FBL 漂移达 1.5m ~ 2.5m，INDI 展现出统治级的定点悬停锁定能力。",
                            "refSentences": ["P1-S1"]
                        },
                        {
                            "key": "B",
                            "text": "Over 5.0 meters due to water turbulence.",
                            "isCorrect": False,
                            "distractorType": "严重夸大",
                            "analysis": "与实验事实相反，漂移极小。",
                            "refSentences": ["P1-S1"]
                        },
                        {
                            "key": "C",
                            "text": "Identical to Quadratic FBL drift.",
                            "isCorrect": False,
                            "distractorType": "偷换概念",
                            "analysis": "FBL 漂移超过 2.5m，是 INDI 的 25 倍以上。",
                            "refSentences": ["P1-S2"]
                        },
                        {
                            "key": "D",
                            "text": "1.5 meters along the x-axis.",
                            "isCorrect": False,
                            "distractorType": "混淆对象",
                            "analysis": "1.5m 是线性 FBL 的漂移量，非 INDI。",
                            "refSentences": ["P1-S2"]
                        }
                    ],
                    "officialAnswer": "A",
                    "presetReflection": {
                        "trapAnalysis": "分清实验数据：INDI（<0.1m）vs 线性 FBL（1.5m）vs 二次 FBL（2.5m）。",
                        "methodSummary": "长时间水下悬停是检验控制算法抗直流漂移的最严格试金石。"
                    }
                }
            ]
        }
    ]
}

# =========================================================================
# AUTO-ANNOTATE ALL SENTENCES WITH RICH VOCABULARY & BUILD MASTER VOCAB
# =========================================================================

master_vocab = {}

for paper_dataset, pkey in [(paper1_data, "paper1"), (paper2_data, "paper2"), (paper3_data, "paper3")]:
    for text in paper_dataset["texts"]:
        for p in text["paragraphs"]:
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
    f.write("/**\n * 毕设文献精读 · 文献1：四旋翼敏捷飞行的NMPC与微分平坦控制对比研究 (IEEE T-RO 2022)\n */\n\n")
    f.write("window.BISHE_DATA = window.BISHE_DATA || {};\n")
    f.write("window.BISHE_DATA['paper1'] = " + json.dumps(paper1_data, ensure_ascii=False, indent=2) + ";\n")

# Write data_paper2.js
with open(os.path.join(OUT_DIR, "data_paper2.js"), "w", encoding="utf-8") as f:
    f.write("/**\n * 毕设文献精读 · 文献2：微型飞行器姿态控制的自适应增量非线性动态逆 (AIAA JGCD 2016)\n */\n\n")
    f.write("window.BISHE_DATA = window.BISHE_DATA || {};\n")
    f.write("window.BISHE_DATA['paper2'] = " + json.dumps(paper2_data, ensure_ascii=False, indent=2) + ";\n")

# Write data_paper3.js
with open(os.path.join(OUT_DIR, "data_paper3.js"), "w", encoding="utf-8") as f:
    f.write("/**\n * 毕设文献精读 · 文献3：基于增量非线性动态逆的水下特技作业AUV姿态控制 (IEEE/DFKI 2022)\n */\n\n")
    f.write("window.BISHE_DATA = window.BISHE_DATA || {};\n")
    f.write("window.BISHE_DATA['paper3'] = " + json.dumps(paper3_data, ensure_ascii=False, indent=2) + ";\n")

# Write master_vocab_cache.json
with open(os.path.join(OUT_DIR, "master_vocab_cache.json"), "w", encoding="utf-8") as f:
    json.dump(master_vocab, f, ensure_ascii=False, indent=2)

print(f"Successfully generated all data files in {OUT_DIR}")
print(f"Total vocabulary terms in master vocab: {len(master_vocab)}")
