/**
 * 毕设文献精读 · 文献1：四旋翼敏捷飞行的NMPC与微分平坦控制对比研究 (IEEE T-RO 2022)
 */

window.BISHE_DATA = window.BISHE_DATA || {};
window.BISHE_DATA['paper1'] = {
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
              "isTopicSentence": true,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "high-precision",
                  "ipa": "/haɪ prɪˈsɪʒn/",
                  "meaning": "高精度的",
                  "level": "green"
                },
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "green"
                },
                {
                  "word": "crucial",
                  "ipa": "/ˈkruːʃl/",
                  "meaning": "至关重要的，关键的",
                  "level": "green"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，极限机动的",
                  "level": "red"
                },
                {
                  "word": "navigation",
                  "ipa": "/ˌnævɪˈɡeɪʃn/",
                  "meaning": "导航，航行",
                  "level": "green"
                },
                {
                  "word": "constrained",
                  "ipa": "/kənˈstreɪnd/",
                  "meaning": "受约束的，受限制的",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "However, in extreme agile flight, tracking is challenging due to highly nonlinear dynamics, aerodynamic effects, and actuator constraints.",
              "translation": "然而，在极限敏捷飞行中，由于高度非线性动力学、复杂的空气动力学效应以及执行机构约束的共同作用，高精度轨迹跟踪面临极大挑战。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，极限机动的",
                  "level": "red"
                },
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行，航行",
                  "level": "green"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "green"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（系统输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机）",
                  "level": "red"
                },
                {
                  "word": "constraints",
                  "ipa": "/kənˈstreɪnts/",
                  "meaning": "约束条件（如推力上限、电调饱和）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P1-S3",
              "text": "To address these issues, we empirically compare two state-of-the-art control frameworks: Nonlinear Model Predictive Control (NMPC) and Differential-Flatness-Based Control (DFBC).",
              "translation": "为了解决上述难题，我们经验性地系统对比了当今两大主流前沿控制框架：非线性模型预测控制（NMPC）与基于微分平坦的控制器（DFBC）。",
              "isTopicSentence": false,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "state-of-the-art",
                  "ipa": "/steɪt əv ði ɑːt/",
                  "meaning": "当前最前沿的，业界顶尖的",
                  "level": "blue"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（系统输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "predictive",
                  "ipa": "/prɪˈdɪktɪv/",
                  "meaning": "预测的",
                  "level": "green"
                }
              ]
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
              "isTopicSentence": false,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "high-fidelity",
                  "ipa": "/haɪ fɪˈdeləti/",
                  "meaning": "高保真的",
                  "level": "green"
                },
                {
                  "word": "simulation",
                  "ipa": "/ˌsɪmjuˈleɪʃn/",
                  "meaning": "仿真，模拟",
                  "level": "green"
                },
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行，航行",
                  "level": "green"
                },
                {
                  "word": "accelerations",
                  "ipa": "/əkˌseləˈreɪʃnz/",
                  "meaning": "加速度",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "When tracking dynamically infeasible trajectories, NMPC shows significant advantages, reducing position tracking error by 48% and heading error by 62%.",
              "translation": "在跟踪动态不可行轨迹（超出电机推力限制的激进轨迹）时，NMPC 展现出显著优势，其位置跟踪误差降低 48%，航向角误差降低 62%。",
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "green"
                },
                {
                  "word": "infeasible",
                  "ipa": "/ɪnˈfiːzəbl/",
                  "meaning": "不可行的（超出物理极限的激进轨迹）",
                  "level": "red"
                },
                {
                  "word": "heading",
                  "ipa": "/ˈhedɪŋ/",
                  "meaning": "航向角，偏航姿态",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P2-S3",
              "text": "For both methods, introducing an Incremental Nonlinear Dynamic Inversion (INDI) inner-loop controller and explicit aerodynamic drag modeling reduces trajectory error by over 78%.",
              "translation": "对于这两种控制方法，引入基于增量非线性动态逆（INDI）的角速度内环控制器以及显式空气动力学阻力模型，可使轨迹跟踪误差降低 78% 以上。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "incremental",
                  "ipa": "/ˌɪŋkrəˈmentl/",
                  "meaning": "增量的（基于传感器逐拍差分）",
                  "level": "red"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（系统输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "inversion",
                  "ipa": "/ɪnˈvɜːʃn/",
                  "meaning": "求逆，动态逆",
                  "level": "red"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环（高频角速度/角加速度环）",
                  "level": "red"
                },
                {
                  "word": "controller",
                  "ipa": "/kənˈtrəʊlə/",
                  "meaning": "控制器",
                  "level": "green"
                },
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力（转子阻力与机身阻力）",
                  "level": "red"
                },
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                }
              ]
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
          "stemKeywords": [
            "NMPC",
            "DFBC",
            "dynamically infeasible",
            "advantages"
          ],
          "targetSentences": [
            "P2-S2"
          ],
          "options": [
            {
              "key": "A",
              "text": "When the quadrotor flies in low-speed hover mode with zero aerodynamic drag.",
              "isCorrect": false,
              "distractorType": "偷换概念",
              "analysis": "A 选项偷换为低速悬停，原文明确指出优势出现在极限不可行轨迹（infeasible trajectories）下。",
              "refSentences": [
                "P2-S2"
              ]
            },
            {
              "key": "B",
              "text": "When tracking dynamically infeasible trajectories where actuators reach saturation.",
              "isCorrect": true,
              "distractorType": "正确项 · 同义替换",
              "analysis": "对应 P2-S2 原文：'When tracking dynamically infeasible trajectories, NMPC shows significant advantages... reducing error by 48%'。由于 NMPC 具有滚动时域前瞻预测与约束平滑能力，在电机饱和时优势最大。",
              "refSentences": [
                "P2-S2"
              ]
            },
            {
              "key": "C",
              "text": "When the computational power of the onboard processor is severely limited.",
              "isCorrect": false,
              "distractorType": "正反倒置",
              "analysis": "C 选项颠倒因果，NMPC 算力开销显著大于 DFBC，在算力极其受限时 DFBC 更具优势。",
              "refSentences": [
                "P2-S2"
              ]
            },
            {
              "key": "D",
              "text": "When the INDI inner-loop is removed from the control architecture.",
              "isCorrect": false,
              "distractorType": "曲解文意",
              "analysis": "撤除 INDI 会导致两者均发散或性能大幅衰减，而非 NMPC 展现优势的条件。",
              "refSentences": [
                "P2-S3"
              ]
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
          "stemKeywords": [
            "INDI",
            "inner-loop",
            "78%",
            "aerodynamic drag"
          ],
          "targetSentences": [
            "P2-S3"
          ],
          "options": [
            {
              "key": "A",
              "text": "It completely eliminates the need for any position outer-loop controller.",
              "isCorrect": false,
              "distractorType": "过度推理",
              "analysis": "INDI 仅充当底层角速度内环，外环仍需 NMPC 或 DFBC 计算期望加速度与姿态。",
              "refSentences": [
                "P2-S3"
              ]
            },
            {
              "key": "B",
              "text": "It cancels model uncertainties and external disturbances using sensor feedback, reducing error by over 78%.",
              "isCorrect": true,
              "distractorType": "正确项 · 同义替换",
              "analysis": "对应 P2-S3：INDI 内环利用高频角加速度实测反馈抵消未建模力和气动力扰动，使跟踪误差降低超 78%。",
              "refSentences": [
                "P2-S3"
              ]
            },
            {
              "key": "C",
              "text": "It calculates the global differential flatness output of quadrotor translation.",
              "isCorrect": false,
              "distractorType": "概念混淆",
              "analysis": "平坦输出属于 DFBC 外环前馈范畴，而非底层 INDI 内环。",
              "refSentences": [
                "P2-S3"
              ]
            },
            {
              "key": "D",
              "text": "It converts nonlinear optimization into an unconstrained linear equation.",
              "isCorrect": false,
              "distractorType": "偷换概念",
              "analysis": "INDI 是逐拍传感器增量线性化，并非将非线性优化转化为无约束方程。",
              "refSentences": [
                "P2-S3"
              ]
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
              "isTopicSentence": false,
              "isKeyEvidence": false,
              "vocab": []
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "The translational and rotational dynamics of the rigid-body quadrotor are modeled as: m \\dot{v} = m g_W + R f_B + f_a, and J \\dot{\\Omega}_B = \\tau_B - \\Omega_B \\times (J \\Omega_B).",
              "translation": "四旋翼刚体平移与旋转动力学由以下微分方程描述：$m \\dot{\\boldsymbol{v}} = m \\boldsymbol{g}_W + \\boldsymbol{R} \\boldsymbol{f}_B + \\boldsymbol{f}_a$，以及 $\\boldsymbol{J} \\dot{\\boldsymbol{\\Omega}}_B = \\boldsymbol{\\tau}_B - \\boldsymbol{\\Omega}_B \\times (\\boldsymbol{J} \\boldsymbol{\\Omega}_B)$。",
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼无人机",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P1-S3",
              "text": "Here, R is the rotation matrix in SO(3) parameterized by unit quaternion q, J is the inertia matrix, and f_B = [0, 0, T]^T is the collective rotor thrust.",
              "translation": "其中，$\\boldsymbol{R} \\in SO(3)$ 为由单位四元数 $\\boldsymbol{q}$ 参数化的旋转矩阵，$\\boldsymbol{J}$ 为转动惯量矩阵，$\\boldsymbol{f}_B = [0, 0, T]^T$ 为 4 个转子产生的机体总推力。",
              "isTopicSentence": false,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "matrix",
                  "ipa": "/ˈmeɪtrɪks/",
                  "meaning": "矩阵",
                  "level": "green"
                },
                {
                  "word": "quaternion",
                  "ipa": "/kwəˈtɜːniən/",
                  "meaning": "四元数（无奇异性姿态表示）",
                  "level": "red"
                },
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "转动惯量，惯量矩阵 J",
                  "level": "green"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "旋翼，螺旋桨",
                  "level": "green"
                }
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行，航行",
                  "level": "green"
                },
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "旋翼，螺旋桨",
                  "level": "green"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力（转子阻力与机身阻力）",
                  "level": "red"
                },
                {
                  "word": "centrifugal",
                  "ipa": "/senˈtrɪfjʊɡl/",
                  "meaning": "离心的",
                  "level": "green"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "空间漂移量",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "We employ a wind-tunnel validated diagonal drag model: f_a = - R D_v R^T v, where D_v = diag(d_x, d_y, d_z) represents the translational drag coefficients.",
              "translation": "本文采用经风洞实验标定的复合对角阻力模型：$\\boldsymbol{f}_a = - \\boldsymbol{R} \\boldsymbol{D}_v \\boldsymbol{R}^T \\boldsymbol{v}$，其中 $\\boldsymbol{D}_v = \\text{diag}(d_x, d_y, d_z)$ 为沿机体三轴的平移空气阻力系数矩阵。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力（转子阻力与机身阻力）",
                  "level": "red"
                }
              ]
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
          "stemKeywords": [
            "f_a",
            "translational dynamics",
            "D_v",
            "aerodynamic drag"
          ],
          "targetSentences": [
            "P1-S2",
            "P2-S2"
          ],
          "options": [
            {
              "key": "A",
              "text": "The collective vertical thrust generated by four brushless motors.",
              "isCorrect": false,
              "distractorType": "偷换概念",
              "analysis": "A 是 R * f_B（电机总推力），而不是 f_a。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "B",
              "text": "The Coriolis virtual force caused by frame rotation.",
              "isCorrect": false,
              "distractorType": "概念混淆",
              "analysis": "科氏力存在于非惯性系旋转推导中，平移方程中世界惯性系下的 f_a 为气动阻力项。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "C",
              "text": "The aerodynamic drag force explicitly modeled as - R * D_v * R^T * v.",
              "isCorrect": true,
              "distractorType": "正确项 · 原文推导",
              "analysis": "对应 P2-S2：f_a 为空气动力学阻力矢量，显式由 - R D_v R^T v 给出。",
              "refSentences": [
                "P2-S2"
              ]
            },
            {
              "key": "D",
              "text": "The external disturbance force from ground effect.",
              "isCorrect": false,
              "distractorType": "无中生有",
              "analysis": "文中高速飞行阻力模型重点刻画的是迎风阻力与叶片挥舞阻力，非地面效应。",
              "refSentences": [
                "P2-S1"
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "horizon",
                  "ipa": "/həˈraɪzn/",
                  "meaning": "时域，预测时域",
                  "level": "green"
                },
                {
                  "word": "constrained",
                  "ipa": "/kənˈstreɪnd/",
                  "meaning": "受约束的，受限制的",
                  "level": "red"
                },
                {
                  "word": "optimization",
                  "ipa": "/ˌɒptɪmaɪˈzeɪʃn/",
                  "meaning": "优化求解",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "The solver uses the acados C++ code generation framework with sequential quadratic programming real-time iteration (SQP-RTI) for fast computation.",
              "translation": "求解器采用高效 C++ 代码生成框架 **acados**，结合序列二次规划实时迭代（SQP-RTI）算法在几毫秒内实现快速数值求解。",
              "isTopicSentence": false,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "sequential",
                  "ipa": "/sɪˈkwenʃl/",
                  "meaning": "序列的",
                  "level": "green"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的（二次规划 QP）",
                  "level": "green"
                },
                {
                  "word": "programming",
                  "ipa": "/ˈprəʊɡræmɪŋ/",
                  "meaning": "规划（SQP 求解器）",
                  "level": "green"
                },
                {
                  "word": "real-time",
                  "ipa": "/ˈrɪəl taɪm/",
                  "meaning": "实时的",
                  "level": "green"
                },
                {
                  "word": "iteration",
                  "ipa": "/ˌɪtəˈreɪʃn/",
                  "meaning": "迭代求解",
                  "level": "green"
                }
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼无人机",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "By taking higher-order analytical derivatives including trajectory jerk and snap, DFBC calculates feedforward body angular velocity and acceleration algebraically.",
              "translation": "通过对期望轨迹进行高阶解析求导（包含加加速度 Jerk 与加加加速度 Snap），DFBC 能够以纯代数运算计算出前馈期望角速度与角加速度。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "jerk",
                  "ipa": "/dʒɜːk/",
                  "meaning": "加加速度（轨迹三阶导数）",
                  "level": "green"
                },
                {
                  "word": "snap",
                  "ipa": "/snæp/",
                  "meaning": "加加加速度（轨迹四阶导数）",
                  "level": "green"
                },
                {
                  "word": "feedforward",
                  "ipa": "/ˈfiːdfɔːwəd/",
                  "meaning": "前馈控制",
                  "level": "red"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，旋转的",
                  "level": "green"
                },
                {
                  "word": "velocity",
                  "ipa": "/vəˈlɒsəti/",
                  "meaning": "速度（线速度/角速度）",
                  "level": "green"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P2-S3",
              "text": "When the required total thrust exceeds actuator limits, a constrained Quadratic Programming (QP) allocator scales down collective thrust while prioritizing attitude control torques.",
              "translation": "当所需总推力超出电机极限时，单拍二次规划（QP）分配器在优先保证姿态控制力矩的前提下等比例缩减总推力。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机）",
                  "level": "red"
                },
                {
                  "word": "constrained",
                  "ipa": "/kənˈstreɪnd/",
                  "meaning": "受约束的，受限制的",
                  "level": "red"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的（二次规划 QP）",
                  "level": "green"
                },
                {
                  "word": "programming",
                  "ipa": "/ˈprəʊɡræmɪŋ/",
                  "meaning": "规划（SQP 求解器）",
                  "level": "green"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（俯仰、横滚、偏航）",
                  "level": "red"
                }
              ]
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
          "stemKeywords": [
            "DFBC",
            "thrust saturation",
            "QP allocator",
            "prioritizing attitude"
          ],
          "targetSentences": [
            "P2-S3"
          ],
          "options": [
            {
              "key": "A",
              "text": "It solves a multi-step future predictive optimization over the entire trajectory.",
              "isCorrect": false,
              "distractorType": "概念混淆",
              "analysis": "A 是 NMPC 的多步滚动预测机制，不是 DFBC。",
              "refSentences": [
                "P1-S1"
              ]
            },
            {
              "key": "B",
              "text": "It employs a constrained QP allocator that scales down collective thrust while prioritizing attitude control torque.",
              "isCorrect": true,
              "distractorType": "正确项 · 原文同义表达",
              "analysis": "对应 P2-S3：DFBC 采用单拍 QP 控制分配器，优先保证姿态控制力矩（防翻滚失控），等比例缩减总升力。",
              "refSentences": [
                "P2-S3"
              ]
            },
            {
              "key": "C",
              "text": "It cuts off the power to all motors immediately to prevent crashes.",
              "isCorrect": false,
              "distractorType": "无中生有",
              "analysis": "直接断电属于严重错误描述。",
              "refSentences": [
                "P2-S3"
              ]
            },
            {
              "key": "D",
              "text": "It ignores the saturation and commands unbounded voltages to ESCs.",
              "isCorrect": false,
              "distractorType": "正反倒置",
              "analysis": "DFBC 显式引入 QP 分配器就是为了合规处理电机推力硬约束。",
              "refSentences": [
                "P2-S3"
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "feasible",
                  "ipa": "/ˈfiːzəbl/",
                  "meaning": "物理可行的",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "This confirms that when the reference trajectory respects physical actuation limits, DFBC achieves tracking performance on par with NMPC.",
              "translation": "这证实了当参考轨迹符合物理执行器极限时，DFBC 的跟踪性能与 NMPC 完全媲美。",
              "isTopicSentence": false,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "green"
                }
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "infeasible",
                  "ipa": "/ɪnˈfiːzəbl/",
                  "meaning": "不可行的（超出物理极限的激进轨迹）",
                  "level": "red"
                },
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（推力达到物理上限）",
                  "level": "red"
                },
                {
                  "word": "heading",
                  "ipa": "/ˈhedɪŋ/",
                  "meaning": "航向角，偏航姿态",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "NMPC effectively anticipates future actuator saturation and proactively decelerates before entering sharp corners.",
              "translation": "NMPC 能够前瞻性地预判未来的执行器饱和，在进入急发卡弯之前主动提前减速过弯。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机）",
                  "level": "red"
                },
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（推力达到物理上限）",
                  "level": "red"
                }
              ]
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
          "stemKeywords": [
            "48% lower error",
            "NMPC",
            "anticipates saturation",
            "proactively decelerates"
          ],
          "targetSentences": [
            "P2-S1",
            "P2-S2"
          ],
          "options": [
            {
              "key": "A",
              "text": "Because NMPC has zero computational latency.",
              "isCorrect": false,
              "distractorType": "正反倒置",
              "analysis": "NMPC 的单步计算耗时远高于 DFBC（2~5ms vs 0.05ms），并非零延迟。",
              "refSentences": [
                "P2-S2"
              ]
            },
            {
              "key": "B",
              "text": "Because NMPC optimizes future trajectories across a horizon and proactively decelerates before saturation occurs.",
              "isCorrect": true,
              "distractorType": "正确项 · 同义替换",
              "analysis": "对应 P2-S2：NMPC 在预测时域内进行多步滚动优化，能预先感知急弯处的推力饱和并提前降速平滑过弯。",
              "refSentences": [
                "P2-S2"
              ]
            },
            {
              "key": "C",
              "text": "Because NMPC uses higher motor maximum thrust than DFBC in the simulation.",
              "isCorrect": false,
              "distractorType": "偷换概念",
              "analysis": "两者测试基于完全相同的高保真物理硬件参数，推力上限一致。",
              "refSentences": [
                "P2-S1"
              ]
            },
            {
              "key": "D",
              "text": "Because DFBC does not include any feedback loop.",
              "isCorrect": false,
              "distractorType": "曲解文意",
              "analysis": "DFBC 具备外环 PD 反馈与底层高频 INDI 闭环反馈。",
              "refSentences": [
                "P2-S1"
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行，航行",
                  "level": "green"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，极限机动的",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "green"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "DFBC requires only 0.05 ms per step, making it 50 to 100 times faster than NMPC (2.5 - 4.5 ms).",
              "translation": "DFBC 单步计算仅需 **0.05 ms**，比 NMPC（2.5 ~ 4.5 ms）快 **50 到 100 倍**，极其适合嵌入式飞控单片机部署。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": []
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "accuracy",
                  "ipa": "/ˈækjərəsi/",
                  "meaning": "精度，准确性",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "Second, for highly dynamic or adversarial environments near actuator saturation, NMPC is indispensable.",
              "translation": "第二，对于环境高度动态未知或执行器工作在饱和边缘的极限机动，**NMPC 是不可或缺的防崩溃前瞻方案**。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机）",
                  "level": "red"
                },
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（推力达到物理上限）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P2-S3",
              "text": "Finally, the combination of an INDI inner-loop with aerodynamic drag compensation is the foundational cornerstone for any high-speed quadrotor controller.",
              "translation": "最终结论：**“INDI 姿态内环 + 空气动力学阻力补偿” 是所有高速敏捷飞行控制器的必备核心基石**。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环（高频角速度/角加速度环）",
                  "level": "red"
                },
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力（转子阻力与机身阻力）",
                  "level": "red"
                },
                {
                  "word": "compensation",
                  "ipa": "/ˌkɒmpenˈseɪʃn/",
                  "meaning": "补偿",
                  "level": "red"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼无人机",
                  "level": "red"
                },
                {
                  "word": "controller",
                  "ipa": "/kənˈtrəʊlə/",
                  "meaning": "控制器",
                  "level": "green"
                }
              ]
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
          "stemKeywords": [
            "DFBC+INDI",
            "engineering guidelines",
            "cost-effective",
            "feasible trajectory"
          ],
          "targetSentences": [
            "P2-S1",
            "P1-S2"
          ],
          "options": [
            {
              "key": "A",
              "text": "When the trajectory planner guarantees dynamic feasibility and onboard computational resources are limited.",
              "isCorrect": true,
              "distractorType": "正确项 · 提炼总结",
              "analysis": "对应 P2-S1 与 P1-S2：在轨迹动力学可行时，DFBC 耗时仅 0.05ms（比 NMPC 快 50-100 倍），精度与 NMPC 几乎完全一致，是嵌入式算力受限平台的最高性价比首选。",
              "refSentences": [
                "P2-S1",
                "P1-S2"
              ]
            },
            {
              "key": "B",
              "text": "When the motors frequently operate under severe over-thrust saturation.",
              "isCorrect": false,
              "distractorType": "正反倒置",
              "analysis": "频繁饱和场景应选 NMPC。",
              "refSentences": [
                "P2-S2"
              ]
            },
            {
              "key": "C",
              "text": "When aerodynamic drag can be completely ignored in indoor low speed.",
              "isCorrect": false,
              "distractorType": "偷换概念",
              "analysis": "阻力补偿是两者高速飞行的共同基础，不是优先选 DFBC 的理由。",
              "refSentences": [
                "P2-S3"
              ]
            },
            {
              "key": "D",
              "text": "When the quadrotor does not possess any IMU sensor for feedback.",
              "isCorrect": false,
              "distractorType": "逻辑谬误",
              "analysis": "INDI 强烈依赖 IMU 高频角加速度反馈，没有 IMU 则无法运行。",
              "refSentences": [
                "P2-S3"
              ]
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
};
