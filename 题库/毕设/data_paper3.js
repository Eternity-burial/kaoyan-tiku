/**
 * 毕设文献阅读器 · 文献3：基于增量非线性动态逆的水下特技作业AUV姿态控制 (IEEE/DFKI 2022)
 */

window.BISHE_DATA = window.BISHE_DATA || {};
window.BISHE_DATA['paper3'] = {
  "id": "paper3",
  "subject": "毕设",
  "title": "Attitude Control of the Hydrobatic Intervention AUV Cuttlefish using Incremental Nonlinear Dynamic Inversion",
  "chineseTitle": "基于增量非线性动态逆的水下特技作业AUV Cuttlefish姿态控制",
  "meta": {
    "authors": "Tom Slawik, Shubham Vyas, Leif Christensen, Frank Kirchner",
    "institution": "德国人工智能研究中心（DFKI GmbH）机器人创新中心（RIC），德国不来梅",
    "journal": "IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS) / DFKI Underactuated Lab, 2022",
    "links": [
      {
        "label": "开源代码库 (GitHub)",
        "url": "https://github.com/dfki-ric-underactuated-lab/auv_control_indi"
      },
      {
        "label": "实验视频 (YouTube)",
        "url": "https://youtu.be/8u8k607lpn4"
      }
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
              "translation": "在本文中，我们提出了一种基于增量非线性动态逆（Incremental Nonlinear Dynamic Inversion, INDI）的自主水下航行器（AUV）姿态控制方案。",
              "vocab": [
                {
                  "word": "dynamic inversion",
                  "ipa": "/daɪˈnæmɪk ɪnˈvɜːʃn/",
                  "meaning": "动态逆（非线性系统逆解解耦）",
                  "level": "red"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（横滚、俯仰、偏航）",
                  "level": "red"
                },
                {
                  "word": "incremental",
                  "ipa": "/ˌɪŋkrəˈmentl/",
                  "meaning": "增量的（基于传感器逐拍差分）",
                  "level": "red"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "dynamic",
                  "ipa": "/daɪˈnæmɪk/",
                  "meaning": "动态的，动力学的",
                  "level": "green"
                },
                {
                  "word": "inversion",
                  "ipa": "/ɪnˈvɜːʃn/",
                  "meaning": "求逆，动态逆",
                  "level": "red"
                },
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
              "text": "Traditional model-based controllers rely on accurate hydrodynamic models, which are notoriously difficult to obtain under strong nonlinear fluid effects; INDI achieves high performance by trading model accuracy for high-frequency sensor feedback.",
              "translation": "传统的基于模型的控制器严重依赖于受控系统的精确数学模型，然而对于受到高度非线性水动力学效应影响的水下航行器而言，建立精确模型极其困难。INDI 通过引入高频加速度反馈与执行器输出反馈，对非线性系统进行逐拍增量局部线性化，从而实现了**“用传感器测量精度换取动力学模型精度”**。",
              "vocab": [
                {
                  "word": "hydrodynamic",
                  "ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/",
                  "meaning": "水动力学的，流体动力学的",
                  "level": "red"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "accuracy",
                  "ipa": "/ˈækjərəsi/",
                  "meaning": "精度，准确度",
                  "level": "green"
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
              "sIndex": 3,
              "id": "P1-S3",
              "text": "Tested in the DFKI RIC large ocean basin on a challenging 90-degree pitch-up maneuver (horizontal cruise to vertical intervention pose), INDI significantly outperformed model-based feedback linearization in stability and drift reduction.",
              "translation": "本文针对具有极高挑战性的 **90° 俯仰特技过渡机动（Pitch-up Maneuver）**开展研究——双臂水下干预潜水器“Cuttlefish”从水平巡航快速翻转到垂直作业姿态。水池对比试验表明，无论在过渡阶段还是 300 秒定点悬停阶段，INDI 都能保持显著更优的平稳性，空间漂移远小于模型依赖型控制器。",
              "vocab": [
                {
                  "word": "feedback linearization",
                  "ipa": "/ˈfiːdbæk ˌlɪniəraɪˈzeɪʃn/",
                  "meaning": "反馈线性化 (FBL)",
                  "level": "blue"
                },
                {
                  "word": "basin",
                  "ipa": "/ˈbeɪsn/",
                  "meaning": "试验水池，水箱",
                  "level": "green"
                },
                {
                  "word": "pitch-up",
                  "ipa": "/pɪtʃ ʌp/",
                  "meaning": "大角度仰头翻转机动（90度垂直）",
                  "level": "blue"
                },
                {
                  "word": "maneuver",
                  "ipa": "/məˈnuːvə/",
                  "meaning": "机动动作，特技飞行",
                  "level": "red"
                },
                {
                  "word": "intervention",
                  "ipa": "/ˌɪntəˈvenʃn/",
                  "meaning": "水下干预作业（机械臂装配）",
                  "level": "red"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "green"
                },
                {
                  "word": "linearization",
                  "ipa": "/ˌlɪniəraɪˈzeɪʃn/",
                  "meaning": "线性化",
                  "level": "green"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "空间位置漂移量",
                  "level": "red"
                }
              ]
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
              "translation": "随着海洋经济发展，海底基础设施（如海上风电场导管架及水下变电站）对无人自主运维的需求日益迫切。传统人工潜水员风险高、深度受限，遥控潜水器（ROV）则高度依赖大型母船支持。",
              "vocab": [
                {
                  "word": "subsea",
                  "ipa": "/ˈsʌbsiː/",
                  "meaning": "海底的，深海的",
                  "level": "green"
                },
                {
                  "word": "intervention",
                  "ipa": "/ˌɪntəˈvenʃn/",
                  "meaning": "水下干预作业（机械臂装配）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "AUV Cuttlefish is equipped with 8 thrusters and dual manipulators, possessing hydrobatic capability for 360-degree spatial attitude transitions and CoM/CoB adjustments.",
              "translation": "配备双机械臂的新型干预潜水器 AUV Cuttlefish 配备 8 个推进器，具备水下特技机动能力（Hydrobatics），能够在水体中实现任意 360° 空间姿态变换以深入狭窄钢结构作业，并能主动调节质心与浮心位置。",
              "vocab": [
                {
                  "word": "auv",
                  "ipa": "/ˌeɪ juː ˈviː/",
                  "meaning": "自主水下航行器 (AUV)",
                  "level": "blue"
                },
                {
                  "word": "cuttlefish",
                  "ipa": "/ˈkʌtlfɪʃ/",
                  "meaning": "墨鱼号（DFKI 双臂特技 AUV 名称）",
                  "level": "blue"
                },
                {
                  "word": "thrusters",
                  "ipa": "/ˈθrʌstəz/",
                  "meaning": "推进器（复数）",
                  "level": "red"
                },
                {
                  "word": "hydrobatic",
                  "ipa": "/ˌhaɪdrəʊˈbætɪk/",
                  "meaning": "水下特技机动的（360度空间翻转）",
                  "level": "red"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（横滚、俯仰、偏航）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P2-S3",
              "text": "Large-angle transitions induce complex added mass variations, quadratic damping, and hydrodynamic body-arm cross-coupling, turning traditional model-based FBL into an inaccurate and destabilizing approach.",
              "translation": "当 AUV 进行大角度变姿态翻转时，产生极强的非线性耦合效应（时变附加质量、速度平方非线性阻尼与机械臂干扰）。传统基于模型的方法（如反馈线性化 FBL）若参数辨识稍有偏差，模型补偿项就会反向施加错误推力引发严重振荡或持续漂移。",
              "vocab": [
                {
                  "word": "added mass",
                  "ipa": "/ˈædɪd mæs/",
                  "meaning": "水动力附加质量（随体水体惯性）",
                  "level": "red"
                },
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼（线性与二次非线性水阻）",
                  "level": "red"
                },
                {
                  "word": "hydrodynamic",
                  "ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/",
                  "meaning": "水动力学的，流体动力学的",
                  "level": "red"
                }
              ]
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
              "text": "Following Fossen's standard equations, the 6-DOF underwater dynamics are: $\\boldsymbol{M} \\dot{\\boldsymbol{\\nu}} + \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta}) = \\boldsymbol{\\tau}$, and $\\dot{\\boldsymbol{\\eta}} = \\boldsymbol{J}(\\boldsymbol{\\eta})\\boldsymbol{\\nu}$.",
              "translation": "根据 Fossen 海洋航行器动力学标准理论，6 自由度 AUV 动力学方程表示为：$\\boldsymbol{M}\\dot{\\boldsymbol{\\nu}} + \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta}) = \\boldsymbol{\\tau}$；$\\dot{\\boldsymbol{\\eta}} = \\boldsymbol{J}(\\boldsymbol{\\eta})\\boldsymbol{\\nu}$。",
              "vocab": [
                {
                  "word": "dof",
                  "ipa": "/diː əʊ ef/",
                  "meaning": "自由度 (Degree of Freedom)",
                  "level": "blue"
                },
                {
                  "word": "underwater",
                  "ipa": "/ˌʌndəˈwɔːtə/",
                  "meaning": "水下的",
                  "level": "green"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学（受力与运动响应）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P3-S2",
              "text": "Here, $\\boldsymbol{M} = \\boldsymbol{M}_{RB} + \\boldsymbol{M}_A$ combines rigid-body and hydrodynamic added mass, $\\boldsymbol{D}(\\boldsymbol{\\nu}) = \\boldsymbol{D}_{lin} + \\boldsymbol{D}_{quad}(\\boldsymbol{\\nu})$ includes quadratic damping, and $\\boldsymbol{g}(\\boldsymbol{\\eta})$ represents gravity/buoyancy restoring forces.",
              "translation": "其中 $\\boldsymbol{M} = \\boldsymbol{M}_{RB} + \\boldsymbol{M}_A$ 为刚体质量与水动力附加质量之和，$\\boldsymbol{D}(\\boldsymbol{\\nu})$ 包含线性与二次阻尼对角矩阵，$\\boldsymbol{g}(\\boldsymbol{\\eta})$ 为重力与浮力恢复力矩矢量。",
              "vocab": [
                {
                  "word": "added mass",
                  "ipa": "/ˈædɪd mæs/",
                  "meaning": "水动力附加质量（随体水体惯性）",
                  "level": "red"
                },
                {
                  "word": "hydrodynamic",
                  "ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/",
                  "meaning": "水动力学的，流体动力学的",
                  "level": "red"
                },
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼（线性与二次非线性水阻）",
                  "level": "red"
                },
                {
                  "word": "buoyancy",
                  "ipa": "/ˈbɔɪənsi/",
                  "meaning": "浮力，静水力",
                  "level": "green"
                },
                {
                  "word": "restoring",
                  "ipa": "/rɪˈstɔːrɪŋ/",
                  "meaning": "恢复力（重浮力平衡矩）",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P3-S3",
              "text": "Model-based Feedback Linearization defines $\\boldsymbol{\\tau}_{ref} = \\boldsymbol{M} \\boldsymbol{a}_{ref} + \\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta})$, where $\\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta}) = \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta})$; any identification error in $\\boldsymbol{f}$ directly corrupts decoupling.",
              "translation": "经典基于模型的反馈线性化（FBL）控制律为：$\\boldsymbol{\\tau}_{ref} = \\boldsymbol{M} \\boldsymbol{a}_{ref} + \\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta})$，其中 $\\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta}) = \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta})$。其本质缺陷在于一旦阻尼或恢复力矩存在微小辨识误差，就会施加错误推力引发持续漂移。",
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
                },
                {
                  "word": "linearization",
                  "ipa": "/ˌlɪniəraɪˈzeɪʃn/",
                  "meaning": "线性化",
                  "level": "green"
                },
                {
                  "word": "identification",
                  "ipa": "/aɪˌdentɪfɪˈkeɪʃn/",
                  "meaning": "辨识，参数辨识",
                  "level": "red"
                },
                {
                  "word": "decoupling",
                  "ipa": "/diːˈkʌplɪŋ/",
                  "meaning": "解耦",
                  "level": "red"
                }
              ]
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
              "translation": "由于控制回路采样频率高（50~100 Hz），在相邻采样间隔内航行器水动力变化相比执行机构推力增量是极小量：$\\boldsymbol{M}\\dot{\\boldsymbol{\\nu}} \\approx \\boldsymbol{M}\\dot{\\boldsymbol{\\nu}}_0 + (\\boldsymbol{\\tau} - \\boldsymbol{\\tau}_0)$。",
              "vocab": [
                {
                  "word": "hydrodynamic",
                  "ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/",
                  "meaning": "水动力学的，流体动力学的",
                  "level": "red"
                },
                {
                  "word": "negligible",
                  "ipa": "/ˈneɡlɪdʒəbl/",
                  "meaning": "微不足道的，可忽略的",
                  "level": "green"
                },
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "水下推进器",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P4-S2",
              "text": "Replacing with filtered acceleration $\\dot{\\boldsymbol{\\nu}}_f$ and thruster force $\\boldsymbol{\\tau}_f$ yields the core INDI law: $\\boldsymbol{\\tau}_{ref} = \\boldsymbol{\\tau}_f + \\boldsymbol{M}(\\boldsymbol{a}_{ref} - \\dot{\\boldsymbol{\\nu}}_f)$.",
              "translation": "用滤波传感器实测加速度 $\\dot{\\boldsymbol{\\nu}}_f$ 和推进器推力 $\\boldsymbol{\\tau}_f$ 替代，推导得出 **水下 INDI 控制律**：$\\boldsymbol{\\tau}_{ref} = \\boldsymbol{\\tau}_f + \\boldsymbol{M} (\\boldsymbol{a}_{ref} - \\dot{\\boldsymbol{\\nu}}_f)$。",
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
                  "meaning": "水下推进器",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P4-S3",
              "text": "Crucially, this equation contains zero terms of damping $\\boldsymbol{D}(\\boldsymbol{\\nu})$, Coriolis $\\boldsymbol{C}(\\boldsymbol{\\nu})$, or restoring $\\boldsymbol{g}(\\boldsymbol{\\eta})$, reducing the entire parameter tuning burden to merely the inertia matrix $\\boldsymbol{M}$.",
              "translation": "核心优势：整个公式中**完全不包含阻尼 $\\boldsymbol{D}(\\boldsymbol{\\nu})$、科氏力 $\\boldsymbol{C}(\\boldsymbol{\\nu})$ 和恢复力 $\\boldsymbol{g}(\\boldsymbol{\\eta})$！** 将水下建模负担缩减至仅需一个惯性矩阵 $\\boldsymbol{M}$。",
              "vocab": [
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼（线性与二次非线性水阻）",
                  "level": "red"
                },
                {
                  "word": "coriolis",
                  "ipa": "/ˌkɒriˈəʊlɪs/",
                  "meaning": "科氏力，科里奥利力",
                  "level": "red"
                },
                {
                  "word": "restoring",
                  "ipa": "/rɪˈstɔːrɪŋ/",
                  "meaning": "恢复力（重浮力平衡矩）",
                  "level": "green"
                },
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "转动惯量，惯性",
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
          "pIndex": 5,
          "logicRole": "8 推进器伪逆控制分配与 SO(3) 姿态外环",
          "mainIdea": "通过加权 Moore-Penrose 伪逆求解 8 推进器推力分配，外环基于李群 SO(3) 规避 90 度俯仰奇异性。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P5-S1",
              "text": "Thruster allocation maps 6-DOF wrench $\\boldsymbol{\\tau}_{ref}$ to 8 thruster commands $\\boldsymbol{u}$ via weighted Moore-Penrose pseudoinverse: $\\boldsymbol{u} = \\boldsymbol{B}^T (\\boldsymbol{B} \\boldsymbol{B}^T)^{-1} \\boldsymbol{\\tau}_{ref}$.",
              "translation": "推进器控制分配通过加权 Moore-Penrose 伪逆将 6 自由度力矩指令分配给 8 个推进器：$\\boldsymbol{u} = \\boldsymbol{B}^T (\\boldsymbol{B} \\boldsymbol{B}^T)^{-1} \\boldsymbol{\\tau}_{ref}$。",
              "vocab": [
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "水下推进器",
                  "level": "red"
                },
                {
                  "word": "allocation",
                  "ipa": "/ˌæləˈkeɪʃn/",
                  "meaning": "控制分配",
                  "level": "red"
                },
                {
                  "word": "dof",
                  "ipa": "/diː əʊ ef/",
                  "meaning": "自由度 (Degree of Freedom)",
                  "level": "blue"
                },
                {
                  "word": "wrench",
                  "ipa": "/rentʃ/",
                  "meaning": "广义力与力矩矢量 (Wrench)",
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
              "id": "P5-S2",
              "text": "To prevent Gimbal Lock singularity at 90-degree pitch, the outer attitude loop uses an SO(3) Lie Group error formulation: $\\boldsymbol{\\omega}_{ref} = \\boldsymbol{K}_\\Omega \\sum \\boldsymbol{e}_i \\times (\\boldsymbol{R}_d^T \\boldsymbol{R} \\boldsymbol{e}_i)$.",
              "translation": "为了消除 90° 俯仰翻转中的万向节死锁奇异性，姿态外环采用基于李群 $SO(3)$ 旋转矩阵的姿态误差控制律：$\\boldsymbol{\\omega}_{ref}(\\boldsymbol{R}, \\boldsymbol{R}_d) = \\boldsymbol{K}_\\Omega \\sum_{i=1}^3 \\boldsymbol{e}_i \\times (\\boldsymbol{R}_d^T \\boldsymbol{R} \\boldsymbol{e}_i)$。",
              "vocab": [
                {
                  "word": "lie group",
                  "ipa": "/liː ɡruːp/",
                  "meaning": "李群",
                  "level": "blue"
                },
                {
                  "word": "gimbal lock",
                  "ipa": "/ˈɡɪmbl lɒk/",
                  "meaning": "万向节死锁（欧拉角俯仰 90 度奇异性）",
                  "level": "red"
                },
                {
                  "word": "singularity",
                  "ipa": "/ˌsɪŋɡjəˈlærəti/",
                  "meaning": "奇异性，奇异点",
                  "level": "red"
                },
                {
                  "word": "pitch",
                  "ipa": "/pɪtʃ/",
                  "meaning": "俯仰角 (Pitch, y轴旋转)",
                  "level": "red"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（横滚、俯仰、偏航）",
                  "level": "red"
                },
                {
                  "word": "formulation",
                  "ipa": "/ˌfɔːmjuˈleɪʃn/",
                  "meaning": "数学公式表达，命题构建",
                  "level": "green"
                }
              ]
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
              "translation": "在德国 DFKI RIC 大型海洋试验水池（$24\\text{ m} \\times 18\\text{ m} \\times 8\\text{ m}$）中，Cuttlefish 在 5 秒内从水平巡航姿态快速翻转 90° 进入垂直直立姿态，并稳定保持 300 秒。",
              "vocab": [
                {
                  "word": "basin",
                  "ipa": "/ˈbeɪsn/",
                  "meaning": "试验水池，水箱",
                  "level": "green"
                },
                {
                  "word": "cuttlefish",
                  "ipa": "/ˈkʌtlfɪʃ/",
                  "meaning": "墨鱼号（DFKI 双臂特技 AUV 名称）",
                  "level": "blue"
                },
                {
                  "word": "pitch-up",
                  "ipa": "/pɪtʃ ʌp/",
                  "meaning": "大角度仰头翻转机动（90度垂直）",
                  "level": "blue"
                },
                {
                  "word": "maneuver",
                  "ipa": "/məˈnuːvə/",
                  "meaning": "机动动作，特技飞行",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P6-S2",
              "text": "INDI achieved a steady-state attitude angle error of only 0.0829 degrees, compared to 1.3459 degrees for linear-drag FBL and 1.6897 degrees for quadratic-drag FBL.",
              "translation": "实机水池试验表明：**INDI 控制器的稳态姿态角度误差仅为 0.0829°**；而线性阻尼 FBL 稳态误差为 1.3459°，二次非线性阻尼 FBL 为 1.6897°。",
              "vocab": [
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（横滚、俯仰、偏航）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P6-S3",
              "text": "Quadratic FBL performed worse because quadratic drag parameters were slightly overestimated in the low-speed transitional regime, injecting counterproductive compensation forces.",
              "translation": "关键物理反思：二次非线性阻尼 FBL 的表现反而劣于线性 FBL，这是因为在低速与变姿态翻转过渡流区中二次阻尼极难测准，模型高估了阻尼后施加了过量的反向抵消力，反而放大了误差；而 INDI 完全规避了这一建模风险。",
              "vocab": [
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力（空气阻力/流体阻力）",
                  "level": "red"
                },
                {
                  "word": "transitional",
                  "ipa": "/trænˈzɪʃənl/",
                  "meaning": "过渡的（层流向湍流过渡）",
                  "level": "green"
                },
                {
                  "word": "regime",
                  "ipa": "/reɪˈʒiːm/",
                  "meaning": "工况，流动区域（如湍流区）",
                  "level": "green"
                },
                {
                  "word": "compensation",
                  "ipa": "/ˌkɒmpenˈseɪʃn/",
                  "meaning": "补偿",
                  "level": "red"
                }
              ]
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
              "translation": "在水下保持 90° 垂直直立状态 300 秒的定点悬停测试中，**INDI 在 $x$ 轴与 $y$ 轴的空间位置累计漂移均严格小于 0.1 m**（几乎完全锁定在原地）；而线性 FBL 累计漂移达 **1.5 m**，二次 FBL 漂移超过 **2.5 m**。",
              "vocab": [
                {
                  "word": "station keeping",
                  "ipa": "/ˈsteɪʃn ˈkiːpɪŋ/",
                  "meaning": "定点悬停，位置锁定",
                  "level": "blue"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "空间位置漂移量",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P7-S2",
              "text": "Continuous power consumption was comparable (2231 W for INDI vs 2274 W for quadratic FBL), demonstrating drift elimination without added oscillation.",
              "translation": "连续功耗对比相当（INDI 连续功耗 2231 W，二次 FBL 为 2274 W），证明 INDI 在消除漂移的同时并未引入高频抖动或额外能耗。",
              "vocab": [
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "空间位置漂移量",
                  "level": "red"
                },
                {
                  "word": "oscillation",
                  "ipa": "/ˌɒsɪˈleɪʃn/",
                  "meaning": "振荡，抖振",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P7-S3",
              "text": "Furthermore, INDI inherently exhibits fault-tolerant control potential: when a thruster degrades or entangles with seaweed, the resulting acceleration loss is instantly compensated in the next step without explicit fault diagnosis.",
              "translation": "前瞻展望：INDI 天然具备推力故障容错潜力（Fault-Tolerant Control）。当推进器发生局部失效或水草缠绕衰减时，由此引起的加速度损失会被 IMU 在下一拍立即捕捉并自动增量抵消，在无需显式故障诊断模块的情况下直接实现闭环重构控制。",
              "vocab": [
                {
                  "word": "fault-tolerant",
                  "ipa": "/fɔːlt ˈtɒlərənt/",
                  "meaning": "容错的（执行器失效重构）",
                  "level": "red"
                },
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "水下推进器",
                  "level": "red"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
