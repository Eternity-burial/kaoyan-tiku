/**
 * 毕设文献精读 · 文献3：基于增量非线性动态逆的水下特技作业AUV姿态控制 (IEEE/DFKI 2022)
 */

window.BISHE_DATA = window.BISHE_DATA || {};
window.BISHE_DATA['paper3'] = {
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
              "isTopicSentence": true,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "intervention",
                  "ipa": "/ˌɪntəˈvenʃn/",
                  "meaning": "水下干预作业（机械臂装配/抓取）",
                  "level": "red"
                },
                {
                  "word": "underwater",
                  "ipa": "/ˌʌndəˈwɔːtə/",
                  "meaning": "水下的",
                  "level": "green"
                },
                {
                  "word": "hydrobatic",
                  "ipa": "/ˌhaɪdrəʊˈbætɪk/",
                  "meaning": "水下特技机动的（360°全维空间姿态翻转）",
                  "level": "red"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，极限机动的",
                  "level": "red"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（俯仰、横滚、偏航）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "Equipped with 8 thrusters, Cuttlefish can perform 360-degree hydrobatic maneuvers and transition from horizontal cruise to vertical intervention poses.",
              "translation": "Cuttlefish 配备 8 个无刷推进器，具备 360° 水下特技机动能力（Hydrobatics），能够在水体中从水平巡航姿态快速切换到垂直作业姿态。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "hydrobatic",
                  "ipa": "/ˌhaɪdrəʊˈbætɪk/",
                  "meaning": "水下特技机动的（360°全维空间姿态翻转）",
                  "level": "red"
                },
                {
                  "word": "intervention",
                  "ipa": "/ˌɪntəˈvenʃn/",
                  "meaning": "水下干预作业（机械臂装配/抓取）",
                  "level": "red"
                }
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "added mass",
                  "ipa": "/ˈædɪd mæs/",
                  "meaning": "附加质量（流体附随运动惯性）",
                  "level": "red"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的（二次规划 QP）",
                  "level": "green"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力（转子阻力与机身阻力）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "INDI overcomes this modeling bottleneck by trading hydrodynamic model accuracy for high-frequency sensor measurement accuracy.",
              "translation": "INDI 通过引入高频加速度传感器反馈与执行器推力反馈，对非线性系统进行逐拍增量局部线性化，从而实现了**“用传感器测量精度换取动力学模型精度”**。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "accuracy",
                  "ipa": "/ˈækjərəsi/",
                  "meaning": "精度，准确性",
                  "level": "green"
                }
              ]
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
          "stemKeywords": [
            "hydrobatic",
            "added mass",
            "quadratic drag",
            "difficult to identify"
          ],
          "targetSentences": [
            "P2-S1"
          ],
          "options": [
            {
              "key": "A",
              "text": "Because underwater vehicles operate with zero gravitational force.",
              "isCorrect": false,
              "distractorType": "事实违背",
              "analysis": "水下航行器受到重力与浮力的共同恢复力矩作用，非零重力。",
              "refSentences": [
                "P2-S1"
              ]
            },
            {
              "key": "B",
              "text": "Because complex hydrodynamic parameters like time-varying added mass and quadratic damping are notoriously difficult to identify accurately in turbulent waters.",
              "isCorrect": true,
              "distractorType": "正确项 · 原文提炼",
              "analysis": "对应 P2-S1：大角度翻转时水流处于层流湍流过渡区，附加质量与非线性阻尼矩阵参数极难精确辨识，模型误差会直接导致 FBL 施加反向错误补偿推力。",
              "refSentences": [
                "P2-S1"
              ]
            },
            {
              "key": "C",
              "text": "Because underwater vehicles cannot use brushless thrusters.",
              "isCorrect": false,
              "distractorType": "常识错误",
              "analysis": "Cuttlefish 正是配备了 8 个大功率无刷推进器。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "D",
              "text": "Because optical cameras cannot function underwater.",
              "isCorrect": false,
              "distractorType": "无中生有",
              "analysis": "视觉传感器与动力学模型控制律无关。",
              "refSentences": [
                "P2-S1"
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "underwater",
                  "ipa": "/ˌʌndəˈwɔːtə/",
                  "meaning": "水下的",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "Here, M combines rigid-body mass and hydrodynamic added mass, D(\\nu) represents linear and quadratic damping, and g(\\eta) denotes gravitational and buoyancy restoring wrench.",
              "translation": "其中 $\\boldsymbol{M} = \\boldsymbol{M}_{RB} + \\boldsymbol{M}_A$ 为刚体惯性与水动力附加质量之和，$\\boldsymbol{D}(\\boldsymbol{\\nu})$ 包含线性与二次阻尼，$\\boldsymbol{g}(\\boldsymbol{\\eta})$ 为重力与浮力恢复力矩矢量。",
              "isTopicSentence": false,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "added mass",
                  "ipa": "/ˈædɪd mæs/",
                  "meaning": "附加质量（流体附随运动惯性）",
                  "level": "red"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的（二次规划 QP）",
                  "level": "green"
                },
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼（水流线性与二次非线性阻尼）",
                  "level": "red"
                },
                {
                  "word": "buoyancy",
                  "ipa": "/ˈbɔɪənsi/",
                  "meaning": "浮力",
                  "level": "green"
                },
                {
                  "word": "restoring",
                  "ipa": "/rɪˈstɔːrɪŋ/",
                  "meaning": "恢复力（重力与浮力静水力平衡）",
                  "level": "green"
                }
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "feedback linearization",
                  "ipa": "/ˈfiːdbæk ˌlɪniəraɪˈzeɪʃn/",
                  "meaning": "反馈线性化 (FBL)",
                  "level": "blue"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "The inherent drawback of FBL is its total reliance on precise identification of all terms in f(\\nu, \\eta); any modeling error directly degrades decoupling and stability.",
              "translation": "FBL 的本质缺陷在于它完全依赖于对 $\\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta})$ 中每一个参数的精密辨识；一旦阻尼或恢复力矩存在微小辨识误差，系统就无法实现真正的解耦和精确补偿。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "identification",
                  "ipa": "/aɪˌdentɪfɪˈkeɪʃn/",
                  "meaning": "辨识，参数在线辨识",
                  "level": "red"
                },
                {
                  "word": "decoupling",
                  "ipa": "/diːˈkʌplɪŋ/",
                  "meaning": "解耦，多通道独立控制",
                  "level": "red"
                }
              ]
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
          "stemKeywords": [
            "Feedback Linearization",
            "steady-state drift",
            "f(nu, eta)",
            "modeling error"
          ],
          "targetSentences": [
            "P2-S2"
          ],
          "options": [
            {
              "key": "A",
              "text": "Because FBL relies on exact cancellation of f(nu, eta); any error in identified damping or restoring wrench injects incorrect control forces.",
              "isCorrect": true,
              "distractorType": "正确项 · 本质剖析",
              "analysis": "对应 P2-S2：FBL 试图在软件中完整复刻并减去非线性项，一旦实际水流阻尼与预设模型不符，抵消项就会变成多余的推力扰动，造成持续漂移。",
              "refSentences": [
                "P2-S2"
              ]
            },
            {
              "key": "B",
              "text": "Because FBL can only control 1 degree of freedom.",
              "isCorrect": false,
              "distractorType": "常识错误",
              "analysis": "FBL 适用于多自由度 MIMO 系统。",
              "refSentences": [
                "P1-S1"
              ]
            },
            {
              "key": "C",
              "text": "Because FBL requires digital computers that cannot operate on submarines.",
              "isCorrect": false,
              "distractorType": "荒谬项",
              "analysis": "Cuttlefish 搭载机载计算机正常运行 FBL。",
              "refSentences": [
                "P2-S1"
              ]
            },
            {
              "key": "D",
              "text": "Because FBL ignores the vehicle mass matrix M.",
              "isCorrect": false,
              "distractorType": "偷换概念",
              "analysis": "FBL 公式中显式包含了质量矩阵 M。",
              "refSentences": [
                "P2-S1"
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "推进器（水下多推进器阵列）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "By replacing previous states with filtered sensor acceleration \\dot{\\nu}_f and thruster force \\tau_f, we derive the core INDI control law: \\tau_{ref} = \\tau_f + M (a_{ref} - \\dot{\\nu}_f).",
              "translation": "用经过低通滤波的传感器实测加速度 $\\dot{\\boldsymbol{\\nu}}_f$ 替代上一拍加速度，用推进器当前实际推力 $\\boldsymbol{\\tau}_f$ 替代上一拍推力，推导得出 **水下 INDI 控制律**：$\\boldsymbol{\\tau}_{ref} = \\boldsymbol{\\tau}_f + \\boldsymbol{M} (\\boldsymbol{a}_{ref} - \\dot{\\boldsymbol{\\nu}}_f)$。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "推进器（水下多推进器阵列）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P1-S3",
              "text": "Crucially, this equation contains zero terms of damping D(\\nu), Coriolis C(\\nu), or restoring forces g(\\eta), reducing the modeling burden to merely the inertia matrix M.",
              "translation": "最核心的优势在于：整个公式中**完全不包含阻尼 $\\boldsymbol{D}(\\boldsymbol{\\nu})$、科氏力 $\\boldsymbol{C}(\\boldsymbol{\\nu})$ 和恢复力 $\\boldsymbol{g}(\\boldsymbol{\\eta})$！** 将水下建模负担极简缩减至仅需一个惯性矩阵 $\\boldsymbol{M}$。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼（水流线性与二次非线性阻尼）",
                  "level": "red"
                },
                {
                  "word": "coriolis",
                  "ipa": "/ˌkɒriˈəʊlɪs/",
                  "meaning": "科里奥利力与向心力",
                  "level": "red"
                },
                {
                  "word": "restoring",
                  "ipa": "/rɪˈstɔːrɪŋ/",
                  "meaning": "恢复力（重力与浮力静水力平衡）",
                  "level": "green"
                },
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "转动惯量，惯量矩阵 J",
                  "level": "green"
                },
                {
                  "word": "matrix",
                  "ipa": "/ˈmeɪtrɪks/",
                  "meaning": "矩阵",
                  "level": "green"
                }
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "推进器（水下多推进器阵列）",
                  "level": "red"
                },
                {
                  "word": "allocation",
                  "ipa": "/ˌæləˈkeɪʃn/",
                  "meaning": "控制分配（力矩分配矩阵）",
                  "level": "red"
                },
                {
                  "word": "pseudoinverse",
                  "ipa": "/ˌsjuːdəʊɪnˈvɜːs/",
                  "meaning": "伪逆矩阵（Moore-Penrose 逆）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "To prevent Gimbal Lock singularity during 90-degree pitch maneuvers, the outer attitude loop employs an SO(3) rotation Lie Group formulation.",
              "translation": "为了彻底消除 AUV 在 90° 俯仰大角度特技过渡机动中的万向节死锁（Gimbal Lock）奇异性，姿态外环控制器采用了基于李群 $SO(3)$ 旋转矩阵的姿态误差控制律。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "singularity",
                  "ipa": "/ˌsɪŋɡjəˈlærəti/",
                  "meaning": "奇异性（万向节死锁）",
                  "level": "red"
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
          "qIndex": 3,
          "type": "公式理解",
          "tangchiModel": "控制律极简特性分析",
          "stem": "What parameters are strictly required by the underwater INDI control law \\tau_{ref} = \\tau_f + M * (a_{ref} - \\dot{\\nu}_f)?",
          "stemKeywords": [
            "INDI control law",
            "parameters required",
            "inertia matrix M",
            "zero damping terms"
          ],
          "targetSentences": [
            "P1-S2",
            "P1-S3"
          ],
          "options": [
            {
              "key": "A",
              "text": "Only the inertia matrix M (mass and added mass), requiring zero knowledge of D(nu), C(nu), or g(eta).",
              "isCorrect": true,
              "distractorType": "正确项 · 核心优势概括",
              "analysis": "对应 P1-S3：公式中完全剔除了阻尼矩阵 D、科氏力 C 和恢复力矩 g，仅需配置惯量矩阵 M 和推力配置矩阵 B，参数配置极简且调试周期大幅缩短。",
              "refSentences": [
                "P1-S2",
                "P1-S3"
              ]
            },
            {
              "key": "B",
              "text": "Both linear and quadratic drag coefficients identified from a 50-hour towing tank experiment.",
              "isCorrect": false,
              "distractorType": "概念混淆",
              "analysis": "阻尼系数是 FBL 所必需的，INDI 并不需要。",
              "refSentences": [
                "P1-S3"
              ]
            },
            {
              "key": "C",
              "text": "An exact map of the ocean current speed and direction.",
              "isCorrect": false,
              "distractorType": "无中生有",
              "analysis": "洋流速度会被加速度计在下一拍自动增量抵消，无需预先测绘地图。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "D",
              "text": "A numerical solver for high-dimensional partial differential equations.",
              "isCorrect": false,
              "distractorType": "夸大复杂度",
              "analysis": "INDI 仅为简单的矩阵向量减法与乘法。",
              "refSentences": [
                "P1-S2"
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "pitch-up",
                  "ipa": "/pɪtʃ ʌp/",
                  "meaning": "大角度仰头过渡机动（90°直立）",
                  "level": "blue"
                },
                {
                  "word": "maneuver",
                  "ipa": "/məˈnuːvə/",
                  "meaning": "特技机动动作",
                  "level": "red"
                },
                {
                  "word": "intervention",
                  "ipa": "/ˌɪntəˈvenʃn/",
                  "meaning": "水下干预作业（机械臂装配/抓取）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "INDI achieved a steady-state attitude angle error of only 0.0829 degrees, whereas linear-drag FBL had 1.3459 degrees and quadratic-drag FBL had 1.6897 degrees.",
              "translation": "实机水池试验表明：**INDI 控制器的稳态姿态角度误差仅为 0.0829°**；而线性阻尼 FBL 稳态误差为 1.3459°，二次非线性阻尼 FBL 为 1.6897°（**INDI 精度提升一个数量级以上**）。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（俯仰、横滚、偏航）",
                  "level": "red"
                }
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的（二次规划 QP）",
                  "level": "green"
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
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "INDI completely avoided this issue because it does not rely on any model of fluid damping.",
              "translation": "而 INDI 完全规避了这一风险，因为它从根本上不依赖任何流体阻力数学模型。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼（水流线性与二次非线性阻尼）",
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
          "type": "实验反思",
          "tangchiModel": "学术深层次机理剖析",
          "stem": "Why did Quadratic-Drag Feedback Linearization perform worse than Linear-Drag FBL during the pitch-up maneuver?",
          "stemKeywords": [
            "Quadratic-Drag FBL",
            "performed worse",
            "overestimated damping",
            "counterproductive compensation"
          ],
          "targetSentences": [
            "P2-S1"
          ],
          "options": [
            {
              "key": "A",
              "text": "Because the thrusters caught fire during the test.",
              "isCorrect": false,
              "distractorType": "荒谬项",
              "analysis": "无水下起火情况发生。",
              "refSentences": [
                "P2-S1"
              ]
            },
            {
              "key": "B",
              "text": "Because the identified quadratic damping coefficients were overestimated in the transitional flow regime, injecting excessive counterproductive compensation forces.",
              "isCorrect": true,
              "distractorType": "正确项 · 深刻机理",
              "analysis": "对应 P2-S1：二次阻尼在低速变姿态过渡流区中极难测准，模型高估了阻尼后，FBL 控制回路计算出过大的抵消推力，反而人为放大了系统振荡与角度误差。",
              "refSentences": [
                "P2-S1"
              ]
            },
            {
              "key": "C",
              "text": "Because linear drag models have infinite bandwidth.",
              "isCorrect": false,
              "distractorType": "概念混淆",
              "analysis": "线性阻尼属于低阶经验近似，并不具有无限带宽。",
              "refSentences": [
                "P2-S1"
              ]
            },
            {
              "key": "D",
              "text": "Because INDI forced the vehicle into a safety shutdown mode.",
              "isCorrect": false,
              "distractorType": "无中生有",
              "analysis": "INDI 表现最佳且运行平稳，非安全关机。",
              "refSentences": [
                "P1-S2"
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "station keeping",
                  "ipa": "/ˈsteɪʃn ˈkiːpɪŋ/",
                  "meaning": "定点悬停，位置保持",
                  "level": "blue"
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
              "id": "P1-S2",
              "text": "In contrast, linear-drag FBL drifted by 1.5 m and quadratic-drag FBL drifted by over 2.5 m, with comparable continuous power consumption (2231 W for INDI vs 2274 W for quadratic FBL).",
              "translation": "相比之下，线性阻尼 FBL 在 $x$ 轴累计漂移达 **1.5 m**，二次阻尼 FBL 累计漂移超过 **2.5 m**；同时两者的连续功耗相当（INDI 为 2231 W，二次 FBL 为 2274 W），证明 INDI 并未引入高频抖动或多余能耗。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的（二次规划 QP）",
                  "level": "green"
                }
              ]
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
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "fault-tolerant",
                  "ipa": "/fɔːlt ˈtɒlərənt/",
                  "meaning": "容错控制（推进器损坏自适应）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "When a thruster suffers partial degradation or seaweed entanglement, the resulting acceleration loss is instantly sensed by IMU and compensated in the next incremental step without explicit fault diagnosis.",
              "translation": "当某个推进器发生局部失效或水草缠绕衰减时，由此引起的加速度损失会被 IMU 加速度计在下一拍立即捕捉并自动增量抵消，在无需显式故障诊断模块的情况下直接实现闭环重构控制。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "推进器（水下多推进器阵列）",
                  "level": "red"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "incremental",
                  "ipa": "/ˌɪŋkrəˈmentl/",
                  "meaning": "增量的（基于传感器逐拍差分）",
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
          "type": "实验评估",
          "tangchiModel": "悬停稳定性与漂移量对比",
          "stem": "What was the horizontal spatial position drift of INDI after 300 seconds of vertical station keeping?",
          "stemKeywords": [
            "300s station keeping",
            "spatial drift",
            "< 0.1 m",
            "FBL 1.5m"
          ],
          "targetSentences": [
            "P1-S1",
            "P1-S2"
          ],
          "options": [
            {
              "key": "A",
              "text": "Less than 0.1 m (nearly locked in place).",
              "isCorrect": true,
              "distractorType": "正确项 · 极高精度",
              "analysis": "对应 P1-S1：INDI 在 x 轴与 y 轴的漂移均 <0.1m，而 FBL 漂移达 1.5m ~ 2.5m，INDI 展现出统治级的定点悬停锁定能力。",
              "refSentences": [
                "P1-S1"
              ]
            },
            {
              "key": "B",
              "text": "Over 5.0 meters due to water turbulence.",
              "isCorrect": false,
              "distractorType": "严重夸大",
              "analysis": "与实验事实相反，漂移极小。",
              "refSentences": [
                "P1-S1"
              ]
            },
            {
              "key": "C",
              "text": "Identical to Quadratic FBL drift.",
              "isCorrect": false,
              "distractorType": "偷换概念",
              "analysis": "FBL 漂移超过 2.5m，是 INDI 的 25 倍以上。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "D",
              "text": "1.5 meters along the x-axis.",
              "isCorrect": false,
              "distractorType": "混淆对象",
              "analysis": "1.5m 是线性 FBL 的漂移量，非 INDI。",
              "refSentences": [
                "P1-S2"
              ]
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
};
