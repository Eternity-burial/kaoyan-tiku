/**
 * 毕设文献阅读器 · 文献1：四旋翼敏捷飞行的NMPC与微分平坦控制对比研究 (IEEE T-RO 2022)
 */

window.BISHE_DATA = window.BISHE_DATA || {};
window.BISHE_DATA['paper1'] = {
  "id": "paper1",
  "subject": "毕设",
  "title": "A Comparative Study of Nonlinear MPC and Differential-Flatness-Based Control for Quadrotor Agile Flight",
  "chineseTitle": "四旋翼敏捷飞行的非线性模型预测控制（NMPC）与微分平坦控制（DFBC）对比研究",
  "meta": {
    "authors": "Sihao Sun (孙思豪), Angel Romero, Philipp Foehn, Elia Kaufmann, Davide Scaramuzza",
    "institution": "苏黎世大学机器人与感知实验室（Robotics and Perception Group, University of Zurich, Switzerland）",
    "journal": "IEEE Transactions on Robotics (T-RO), Vol. 38, No. 6, 2022",
    "links": [
      {
        "label": "视频演示 (YouTube)",
        "url": "https://youtu.be/XpuRpKHp_Bk"
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
              "translation": "在复杂受限环境中实现安全敏捷导航，四旋翼无人机的高精度轨迹跟踪控制至关重要。",
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
                },
                {
                  "word": "crucial",
                  "ipa": "/ˈkruːʃl/",
                  "meaning": "至关重要的",
                  "level": "green"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动的",
                  "level": "red"
                },
                {
                  "word": "constrained",
                  "ipa": "/kənˈstreɪnd/",
                  "meaning": "受约束的",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "However, in extreme agile flight, tracking is challenging due to highly nonlinear dynamics, complex aerodynamic effects, and strict actuator constraints.",
              "translation": "然而，在极限敏捷飞行中，由于高度非线性动力学、复杂的空气动力学效应以及执行机构物理约束的共同耦合作用，高精度轨迹跟踪面临极大挑战。",
              "vocab": [
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动的",
                  "level": "red"
                },
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
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
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学（受力与运动响应）",
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
                  "meaning": "执行机构，执行器（电机/电调/舵机）",
                  "level": "red"
                },
                {
                  "word": "constraints",
                  "ipa": "/kənˈstreɪnts/",
                  "meaning": "约束条件（硬约束/软约束）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P1-S3",
              "text": "In this paper, we systematically and empirically compare two state-of-the-art control frameworks: Nonlinear Model Predictive Control (NMPC) and Differential-Flatness-Based Control (DFBC).",
              "translation": "在本文中，我们通过在高达 20 m/s（即 72 km/h）的飞行速度和高达 5g 的加速度下跟踪各种极限敏捷轨迹，经验性地系统对比了当今两大主流前沿控制框架：非线性模型预测控制器（NMPC）与基于微分平坦的控制器（DFBC）。",
              "vocab": [
                {
                  "word": "model predictive control",
                  "ipa": "/ˈmɒdl prɪˈdɪktɪv kənˈtrəʊl/",
                  "meaning": "模型预测控制 (MPC)",
                  "level": "blue"
                },
                {
                  "word": "empirically",
                  "ipa": "/ɪmˈpɪrɪkli/",
                  "meaning": "实证地，通过实验系统地",
                  "level": "green"
                },
                {
                  "word": "state-of-the-art",
                  "ipa": "/steɪt əv ði ɑːt/",
                  "meaning": "业界最顶尖的，前沿的",
                  "level": "blue"
                },
                {
                  "word": "frameworks",
                  "ipa": "/ˈfreɪmwɜːks/",
                  "meaning": "框架（复数）",
                  "level": "green"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "predictive",
                  "ipa": "/prɪˈdɪktɪv/",
                  "meaning": "预测的（如模型预测控制 MPC）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 4,
              "id": "P1-S4",
              "text": "The evaluation covers high-fidelity physical simulation and real-world experiments across tracking accuracy, robustness, computational cost, and constraint handling.",
              "translation": "对比涵盖了高保真物理仿真与真实世界大型动作捕捉系统飞行实验，从跟踪精度、鲁棒性、计算开销与执行器约束处理等多个维度展开了全方位定量评估。",
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
                  "meaning": "物理仿真，模拟",
                  "level": "green"
                },
                {
                  "word": "experiments",
                  "ipa": "/ɪkˈsperɪmənts/",
                  "meaning": "实验",
                  "level": "green"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "green"
                },
                {
                  "word": "accuracy",
                  "ipa": "/ˈækjərəsi/",
                  "meaning": "精度，准确度",
                  "level": "green"
                },
                {
                  "word": "robustness",
                  "ipa": "/rəʊˈbʌstnəs/",
                  "meaning": "鲁棒性，抗扰稳健性",
                  "level": "red"
                },
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算的，算力的",
                  "level": "green"
                },
                {
                  "word": "constraint",
                  "ipa": "/kənˈstreɪnt/",
                  "meaning": "约束",
                  "level": "red"
                }
              ]
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
              "translation": "研究表明：在跟踪动态不可行轨迹（即超出单电机最大推力限制的激进轨迹）时，NMPC 展现出显著优势，其位置跟踪误差降低 48%，航向角误差降低 62%，但代价是更高的计算耗时以及潜在的数值求解收敛风险。",
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
                  "meaning": "不可行的（超出物理推力限制）",
                  "level": "red"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹（复数）",
                  "level": "red"
                },
                {
                  "word": "actuators",
                  "ipa": "/ˈæktʃueɪtəz/",
                  "meaning": "执行器",
                  "level": "red"
                },
                {
                  "word": "heading",
                  "ipa": "/ˈhedɪŋ/",
                  "meaning": "航向角，偏航角",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "For both methods, introducing an Incremental Nonlinear Dynamic Inversion (INDI) inner-loop controller and explicit aerodynamic drag modeling reduces trajectory tracking error by over 78%.",
              "translation": "对于两种控制方法，引入基于增量非线性动态逆（INDI）的角速度内环控制器以及显式建模空气动力学阻力均至关重要。实飞实验表明，加入 INDI 内环可使 NMPC 与 DFBC 的轨迹跟踪误差降低 78% 以上。",
              "vocab": [
                {
                  "word": "dynamic inversion",
                  "ipa": "/daɪˈnæmɪk ɪnˈvɜːʃn/",
                  "meaning": "动态逆（非线性系统逆解解耦）",
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
                  "meaning": "阻力（空气阻力/流体阻力）",
                  "level": "red"
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
              "translation": "四旋翼飞行器具有极高的机动敏捷性。充分发挥其敏捷性能对于时间敏感型任务至关重要，例如水下/空中搜救、自主探索、无人机竞速（Drone Racing）以及空中物流运输。",
              "vocab": [
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动的",
                  "level": "red"
                },
                {
                  "word": "indispensable",
                  "ipa": "/ˌɪndɪˈspensəbl/",
                  "meaning": "必不可少的，不可或缺的",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P3-S2",
              "text": "In extreme agile flight, quadrotor control faces three core bottlenecks: strong nonlinear coupled dynamics, complex aerodynamic drag causing centrifugal drift in sharp corners, and strict actuator saturation limits.",
              "translation": "在敏捷极限机动中，控制系统面临三大核心瓶颈：1. 大角度机动时姿态与平移完全耦合的强非线性动力学；2. 高速转弯时显著增大的转子挥舞阻力与机身阻力引发的严重离心外滑；3. 电机转速与推力上限极其严格的饱和硬约束。",
              "vocab": [
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动的",
                  "level": "red"
                },
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
                  "level": "green"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼无人机",
                  "level": "red"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学（受力与运动响应）",
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
                  "meaning": "阻力（空气阻力/流体阻力）",
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
                  "meaning": "空间位置漂移量",
                  "level": "red"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/电调/舵机）",
                  "level": "red"
                },
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（如推力达到硬件极限）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P3-S3",
              "text": "To solve these challenges, NMPC optimizes trajectories over a finite prediction horizon with explicit constraints, while DFBC utilizes differential flatness to map flat outputs to algebraic feedforward commands.",
              "translation": "为了解决上述难题，学术界形成了两大代表性流派：NMPC 在有限时域内滚动求解最优控制，天然支持多输入多输出（MIMO）显式硬约束；DFBC 则利用微分平坦特性将高维微分方程代数映射为平坦输出及其高阶导数，实现超低延迟的解析前馈控制。",
              "vocab": [
                {
                  "word": "differential flatness",
                  "ipa": "/ˌdɪfəˈrenʃl ˈflætnəs/",
                  "meaning": "微分平坦性",
                  "level": "red"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹（复数）",
                  "level": "red"
                },
                {
                  "word": "horizon",
                  "ipa": "/həˈraɪzn/",
                  "meaning": "时域，预测时域 (Horizon)",
                  "level": "green"
                },
                {
                  "word": "constraints",
                  "ipa": "/kənˈstreɪnts/",
                  "meaning": "约束条件（硬约束/软约束）",
                  "level": "red"
                },
                {
                  "word": "differential",
                  "ipa": "/ˌdɪfəˈrenʃl/",
                  "meaning": "微分的，差分的",
                  "level": "green"
                },
                {
                  "word": "flatness",
                  "ipa": "/ˈflætnəs/",
                  "meaning": "平坦性",
                  "level": "green"
                },
                {
                  "word": "feedforward",
                  "ipa": "/ˈfiːdfɔːwəd/",
                  "meaning": "前馈控制",
                  "level": "red"
                }
              ]
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
              "translation": "本文的主要学术贡献包括：1. 首次在高达 20 m/s 的极限实飞速度下，对 NMPC 与改进型 DFBC 进行全方位同台基准测试；",
              "vocab": [
                {
                  "word": "benchmark",
                  "ipa": "/ˈbentʃmɑːk/",
                  "meaning": "基准对比，同台测试",
                  "level": "green"
                },
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P4-S2",
              "text": "We propose unifying the cascaded INDI inner-loop and aerodynamic drag compensation into both control architectures.",
              "translation": "2. 提出将增量非线性动态逆（INDI）与空气动力学阻力模型统一融入 NMPC 和 DFBC 控制架构；",
              "vocab": [
                {
                  "word": "cascaded",
                  "ipa": "/kæˈskeɪdɪd/",
                  "meaning": "级联的，串级的",
                  "level": "green"
                },
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
                  "meaning": "阻力（空气阻力/流体阻力）",
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
              "sIndex": 3,
              "id": "P4-S3",
              "text": "We comprehensively reveal the performance evolution under feasible versus infeasible trajectories, computational delay, and model uncertainties.",
              "translation": "3. 系统揭示了动态可行与动态不可行轨迹、单拍计算延迟、模型不确定性及执行器饱和下的性能演化规律。",
              "vocab": [
                {
                  "word": "feasible",
                  "ipa": "/ˈfiːzəbl/",
                  "meaning": "物理可行的",
                  "level": "green"
                },
                {
                  "word": "infeasible",
                  "ipa": "/ɪnˈfiːzəbl/",
                  "meaning": "不可行的（超出物理推力限制）",
                  "level": "red"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹（复数）",
                  "level": "red"
                },
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算的，算力的",
                  "level": "green"
                },
                {
                  "word": "uncertainties",
                  "ipa": "/ʌnˈsɜːtntiz/",
                  "meaning": "不确定性",
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
              "text": "Let $\\mathcal{W} = \\{x_W, y_W, z_W\\}$ denote the world inertial frame and $\\mathcal{B} = \\{x_B, y_B, z_B\\}$ denote the body-fixed frame.",
              "translation": "定义惯性坐标系为 $\\mathcal{W} = \\{x_W, y_W, z_W\\}$，机体坐标系为 $\\mathcal{B} = \\{x_B, y_B, z_B\\}$。",
              "vocab": [
                {
                  "word": "inertial",
                  "ipa": "/ɪˈnɜːʃl/",
                  "meaning": "惯性的（如惯性坐标系 W）",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P5-S2",
              "text": "The rigid-body quadrotor dynamics are formulated as: $\\dot{\\boldsymbol{\\xi}} = \\boldsymbol{v}$, $m \\dot{\\boldsymbol{v}} = m \\boldsymbol{g}_W + \\boldsymbol{R} \\boldsymbol{f}_B + \\boldsymbol{f}_a$, $\\dot{\\boldsymbol{q}} = \\frac{1}{2} \\boldsymbol{q} \\otimes [0, \\boldsymbol{\\Omega}_B^T]^T$, and $\\boldsymbol{J} \\dot{\\boldsymbol{\\Omega}}_B = \\boldsymbol{\\tau}_B - \\boldsymbol{\\Omega}_B \\times (\\boldsymbol{J} \\boldsymbol{\\Omega}_B)$.",
              "translation": "四旋翼刚体动力学模型由下式描述：$\\dot{\\boldsymbol{\\xi}} = \\boldsymbol{v}$；$m \\dot{\\boldsymbol{v}} = m \\boldsymbol{g}_W + \\boldsymbol{R} \\boldsymbol{f}_B + \\boldsymbol{f}_a$；$\\dot{\\boldsymbol{q}} = \\frac{1}{2} \\boldsymbol{q} \\otimes [0, \\boldsymbol{\\Omega}_B^T]^T$；$\\boldsymbol{J} \\dot{\\boldsymbol{\\Omega}}_B = \\boldsymbol{\\tau}_B - \\boldsymbol{\\Omega}_B \\times (\\boldsymbol{J} \\boldsymbol{\\Omega}_B)$。",
              "vocab": [
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼无人机",
                  "level": "red"
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
              "sIndex": 3,
              "id": "P5-S3",
              "text": "Here, $\\boldsymbol{\\xi}$ is position, $\\boldsymbol{v}$ is linear velocity, $\\boldsymbol{R} \\in SO(3)$ is rotation parameterized by quaternion $\\boldsymbol{q}$, $\\boldsymbol{J}$ is inertia matrix, $\\boldsymbol{\\Omega}_B$ is body angular velocity, $\\boldsymbol{f}_B = [0, 0, T]^T$ is total thrust, and $\\boldsymbol{\\tau}_B$ is three-axis moment.",
              "translation": "其中：$\\boldsymbol{\\xi}$ 为世界系位置，$\\boldsymbol{v}$ 为线速度；$m$ 为总质量，$\\boldsymbol{g}_W = [0,0,-g]^T$ 为重力加速度；$\\boldsymbol{R} \\in SO(3)$ 为旋转矩阵，$\\boldsymbol{q}$ 为四元数；$\\boldsymbol{J}$ 为转动惯量矩阵，$\\boldsymbol{\\Omega}_B$ 为角速度；$\\boldsymbol{f}_B = [0, 0, T]^T$ 为总推力，$T = \\sum f_i$；$\\boldsymbol{\\tau}_B$ 为合成控制力矩。",
              "vocab": [
                {
                  "word": "velocity",
                  "ipa": "/vəˈlɒsəti/",
                  "meaning": "速度（矢量）",
                  "level": "green"
                },
                {
                  "word": "quaternion",
                  "ipa": "/kwəˈtɜːniən/",
                  "meaning": "四元数（无奇异性姿态表示法）",
                  "level": "red"
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
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力，升力",
                  "level": "red"
                }
              ]
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
              "translation": "在高速飞行时，空气阻力 $\\boldsymbol{f}_a$ 不可忽略。若忽略阻力会导致飞行器在急弯处因向心力不足产生严重的侧向漂移。",
              "vocab": [
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
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
                  "meaning": "阻力（空气阻力/流体阻力）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P6-S2",
              "text": "We adopt a wind-tunnel validated composite drag model: $\\boldsymbol{f}_a = - \\boldsymbol{R} \\boldsymbol{D}_v \\boldsymbol{R}^T \\boldsymbol{v}$, where $\\boldsymbol{D}_v = \\text{diag}(d_x, d_y, d_z)$ denotes the diagonal drag coefficients.",
              "translation": "本文采用经过风洞实验验证的复合阻力模型：$\\boldsymbol{f}_a = - \\boldsymbol{R} \\boldsymbol{D}_v \\boldsymbol{R}^T \\boldsymbol{v}$，其中 $\\boldsymbol{D}_v = \\text{diag}(d_x, d_y, d_z)$ 为对角空气阻力系数矩阵，显式包含了转子诱导阻力与机身迎风阻力。",
              "vocab": [
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力（空气阻力/流体阻力）",
                  "level": "red"
                },
                {
                  "word": "diagonal",
                  "ipa": "/daɪˈæɡənl/",
                  "meaning": "对角的（如对角阻力矩阵）",
                  "level": "green"
                }
              ]
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
              "text": "NMPC discretizes the dynamics into $N$ intervals $dt = h/N$ over horizon $[t, t+h]$ and solves a constrained quadratic cost optimization $\\min_{\\boldsymbol{u}} \\sum (\\|\\boldsymbol{x}_k - \\boldsymbol{x}_{k,r}\\|_{\\boldsymbol{Q}}^2 + \\|\\boldsymbol{u}_k - \\boldsymbol{u}_{k,r}\\|_{\\boldsymbol{Q}_u}^2)$.",
              "translation": "NMPC 在有限时域 $[t, t+h]$ 内将系统离散化为 $N$ 个等长步长区间 $dt = h/N$，构建如下受约束的非线性优化命题：$\\min_{\\boldsymbol{u}} \\sum_{k=0}^{N-1} (\\|\\boldsymbol{x}_k - \\boldsymbol{x}_{k,r}\\|_{\\boldsymbol{Q}}^2 + \\|\\boldsymbol{u}_k - \\boldsymbol{u}_{k,r}\\|_{\\boldsymbol{Q}_u}^2) + \\|\\boldsymbol{x}_N - \\boldsymbol{x}_{N,r}\\|_{\\boldsymbol{Q}_N}^2$。",
              "vocab": [
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学（受力与运动响应）",
                  "level": "red"
                },
                {
                  "word": "horizon",
                  "ipa": "/həˈraɪzn/",
                  "meaning": "时域，预测时域 (Horizon)",
                  "level": "green"
                },
                {
                  "word": "constrained",
                  "ipa": "/kənˈstreɪnd/",
                  "meaning": "受约束的",
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
              "id": "P7-S2",
              "text": "Constraints explicitly enforce actuator thrust bounds $u_i \\in [u_{\\min}, u_{\\max}]$ and angular velocity bounds $\\boldsymbol{\\Omega}_B \\in [\\boldsymbol{\\Omega}_{\\min}, \\boldsymbol{\\Omega}_{\\max}]$.",
              "translation": "约束条件显式包含了系统动力学状态转移 $\\boldsymbol{x}_{k+1} = f(\\boldsymbol{x}_k, \\boldsymbol{u}_k)$、机体角速度限制 $\\boldsymbol{\\Omega}_B \\in [\\boldsymbol{\\Omega}_{\\min}, \\boldsymbol{\\Omega}_{\\max}]$ 以及各电机推力指令硬约束 $u_i \\in [u_{\\min}, u_{\\max}]$。",
              "vocab": [
                {
                  "word": "constraints",
                  "ipa": "/kənˈstreɪnts/",
                  "meaning": "约束条件（硬约束/软约束）",
                  "level": "red"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/电调/舵机）",
                  "level": "red"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力，升力",
                  "level": "red"
                },
                {
                  "word": "velocity",
                  "ipa": "/vəˈlɒsəti/",
                  "meaning": "速度（矢量）",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P7-S3",
              "text": "The solver employs the acados C++ code generation framework with sequential quadratic programming real-time iterations (SQP-RTI) to solve within 2-4 ms.",
              "translation": "求解器采用高效 C++ 代码生成框架 **acados**，结合序列二次规划实时迭代（SQP-RTI）算法在 2~4 毫秒内实时完成数值求解。",
              "vocab": [
                {
                  "word": "quadratic programming",
                  "ipa": "/kwɒˈdrætɪk ˈprəʊɡræmɪŋ/",
                  "meaning": "二次规划 (QP)",
                  "level": "blue"
                },
                {
                  "word": "sequential quadratic programming",
                  "ipa": "/sɪˈkwenʃl kwɒˈdrætɪk ˈprəʊɡræmɪŋ/",
                  "meaning": "序列二次规划 (SQP)",
                  "level": "blue"
                },
                {
                  "word": "framework",
                  "ipa": "/ˈfreɪmwɜːk/",
                  "meaning": "控制框架，体系",
                  "level": "green"
                }
              ]
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
              "translation": "四旋翼的平坦输出选取为位置与偏航角 $\\boldsymbol{\\sigma} = [x, y, z, \\psi]^T$。考虑气动阻力后的期望合力加速度为 $\\boldsymbol{a}_{\\text{des}} = \\ddot{\\boldsymbol{\\xi}}_{ref} + \\boldsymbol{K}_p(\\boldsymbol{\\xi}_{ref} - \\boldsymbol{\\xi}) + \\boldsymbol{K}_d(\\dot{\\boldsymbol{\\xi}}_{ref} - \\dot{\\boldsymbol{\\xi}}) - \\boldsymbol{g}_W - \\frac{1}{m}\\boldsymbol{f}_a$，由此解得期望机体 $z_B$ 轴方向 $\\boldsymbol{z}_{B,\\text{des}} = \\boldsymbol{a}_{\\text{des}} / \\|\\boldsymbol{a}_{\\text{des}}\\|$。",
              "vocab": [
                {
                  "word": "yaw",
                  "ipa": "/jɔː/",
                  "meaning": "偏航角 (Yaw, z轴旋转)",
                  "level": "red"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
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
                  "meaning": "阻力（空气阻力/流体阻力）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P8-S2",
              "text": "By taking higher-order derivatives involving trajectory jerk and snap, DFBC algebraically computes feedforward angular velocity $\\boldsymbol{\\Omega}_{B,\\text{des}}$ and acceleration $\\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}}$.",
              "translation": "通过对 $\\boldsymbol{a}_{\\text{des}}$ 进行二阶求导（涉及轨迹加加速度 Jerk 与加加加速度 Snap），可纯解析代数求出期望角速度 $\\boldsymbol{\\Omega}_{B,\\text{des}}$ 与期望角加速度 $\\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}}$。",
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
                  "meaning": "加加速度（加速度导数，轨迹三阶导）",
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
                  "word": "velocity",
                  "ipa": "/vəˈlɒsəti/",
                  "meaning": "速度（矢量）",
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
              "id": "P8-S3",
              "text": "A constrained QP allocator scales down collective thrust while strictly prioritizing attitude control torque when required thrust exceeds single motor limits.",
              "translation": "当合力需求超出单电机推力极限时，采用小型单拍 QP 求解器在优先保证姿态控制力矩的前提下等比例缩减总推力，防止无人机发生翻滚失控。",
              "vocab": [
                {
                  "word": "constrained",
                  "ipa": "/kənˈstreɪnd/",
                  "meaning": "受约束的",
                  "level": "red"
                },
                {
                  "word": "allocator",
                  "ipa": "/ˈæləkeɪtə/",
                  "meaning": "控制分配器",
                  "level": "red"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力，升力",
                  "level": "red"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（横滚、俯仰、偏航）",
                  "level": "red"
                },
                {
                  "word": "torque",
                  "ipa": "/tɔːk/",
                  "meaning": "力矩，转矩",
                  "level": "red"
                }
              ]
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
              "translation": "为隔绝转动惯量不确定性、未建模力矩与外部阵风扰动，NMPC 与 DFBC 的底层均级联了高频（500 Hz）INDI 姿态内环。",
              "vocab": [
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "转动惯量，惯性",
                  "level": "green"
                },
                {
                  "word": "uncertainties",
                  "ipa": "/ʌnˈsɜːtntiz/",
                  "meaning": "不确定性",
                  "level": "red"
                },
                {
                  "word": "disturbances",
                  "ipa": "/dɪˈstɜːbənsɪz/",
                  "meaning": "扰动（复数）",
                  "level": "red"
                },
                {
                  "word": "cascaded",
                  "ipa": "/kæˈskeɪdɪd/",
                  "meaning": "级联的，串级的",
                  "level": "green"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环（高频角速度/角加速度环）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P9-S2",
              "text": "Virtual angular acceleration command is $\\boldsymbol{\\nu} = \\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}} + \\boldsymbol{K}_p(\\boldsymbol{q}_{\\text{ref}} \\ominus \\boldsymbol{q}) + \\boldsymbol{K}_d(\\boldsymbol{\\Omega}_{B,\\text{des}} - \\boldsymbol{\\Omega}_B)$, computing torque increment $\\Delta \\boldsymbol{\\tau}_B = \\boldsymbol{J}(\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_{B,f})$.",
              "translation": "虚拟角加速度指令为 $\\boldsymbol{\\nu} = \\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}} + \\boldsymbol{K}_p (\\boldsymbol{q}_{ref} \\ominus \\boldsymbol{q}) + \\boldsymbol{K}_d (\\boldsymbol{\\Omega}_{B,\\text{des}} - \\boldsymbol{\\Omega}_B)$。根据角加速度反馈 $\\dot{\\boldsymbol{\\Omega}}_{B,f}$ 计算机体控制力矩增量 $\\Delta \\boldsymbol{\\tau}_B = \\boldsymbol{J} (\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_{B,f})$，合成 $\\boldsymbol{\\tau}_B = \\boldsymbol{\\tau}_{B,f} + \\Delta \\boldsymbol{\\tau}_B$ 并直接驱动电调。",
              "vocab": [
                {
                  "word": "virtual",
                  "ipa": "/ˈvɜːtʃuəl/",
                  "meaning": "虚拟的（如虚拟控制输入量 nu）",
                  "level": "red"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "torque",
                  "ipa": "/tɔːk/",
                  "meaning": "力矩，转矩",
                  "level": "red"
                }
              ]
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
              "translation": "在动态可行轨迹下：NMPC+INDI 位置跟踪 RMSE 为 $0.14 \\pm 0.05\\text{ m}$；DFBC+INDI 为 $0.15 \\pm 0.06\\text{ m}$。结论：在轨迹物理可行时，DFBC 与 NMPC 精度几乎完全一致。",
              "vocab": [
                {
                  "word": "feasible",
                  "ipa": "/ˈfiːzəbl/",
                  "meaning": "物理可行的",
                  "level": "green"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹（复数）",
                  "level": "red"
                },
                {
                  "word": "rmse",
                  "ipa": "/ˌɑːr em es ˈiː/",
                  "meaning": "均方根误差 (RMSE)",
                  "level": "blue"
                },
                {
                  "word": "accuracy",
                  "ipa": "/ˈækjərəsi/",
                  "meaning": "精度，准确度",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P10-S2",
              "text": "For dynamically infeasible trajectories exceeding motor thrust limits, NMPC+INDI reduced position RMSE to 0.38 m (heading error 3.2 deg) compared to DFBC+INDI at 0.73 m (heading error 8.5 deg).",
              "translation": "在动态不可行轨迹（电机推力饱和）下：NMPC+INDI 位置 RMSE 为 **0.38 m**，航向误差 **3.2°**；DFBC+INDI 位置 RMSE 为 **0.73 m**，航向误差 **8.5°**。结论：**NMPC 位置误差比 DFBC 低 48%，航向误差低 62%**。因为 NMPC 具有未来多步预测能力，能提前减速过弯避免剧烈饱和崩溃。",
              "vocab": [
                {
                  "word": "infeasible",
                  "ipa": "/ɪnˈfiːzəbl/",
                  "meaning": "不可行的（超出物理推力限制）",
                  "level": "red"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹（复数）",
                  "level": "red"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力，升力",
                  "level": "red"
                },
                {
                  "word": "rmse",
                  "ipa": "/ˌɑːr em es ˈiː/",
                  "meaning": "均方根误差 (RMSE)",
                  "level": "blue"
                },
                {
                  "word": "heading",
                  "ipa": "/ˈhedɪŋ/",
                  "meaning": "航向角，偏航角",
                  "level": "red"
                }
              ]
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
              "translation": "消融实验表明：采用经典 PID 内环时，轨迹跟踪 RMSE 为 $0.82\\text{ m}$；引入 INDI 内环后，跟踪误差直接降至 $0.18\\text{ m}$（**误差降低 78%**），且完全消除了高速转弯时的姿态低频抖动。",
              "vocab": [
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环（高频角速度/角加速度环）",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "green"
                },
                {
                  "word": "rmse",
                  "ipa": "/ˌɑːr em es ˈiː/",
                  "meaning": "均方根误差 (RMSE)",
                  "level": "blue"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（横滚、俯仰、偏航）",
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
              "sIndex": 2,
              "id": "P11-S2",
              "text": "At speeds exceeding 12 m/s, disabling aerodynamic drag feedforward caused severe centrifugal drift over 1.2 m, whereas drag compensation reduced drift to under 0.2 m.",
              "translation": "在速度 $> 12\\text{ m/s}$ 时，关闭阻力前馈会导致向心力不足，弯道最大侧向漂移超 $1.2\\text{ m}$；引入阻力模型后漂移收敛至 $< 0.2\\text{ m}$。",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力（空气阻力/流体阻力）",
                  "level": "red"
                },
                {
                  "word": "feedforward",
                  "ipa": "/ˈfiːdfɔːwəd/",
                  "meaning": "前馈控制",
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
                  "meaning": "空间位置漂移量",
                  "level": "red"
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
              "translation": "实验在苏黎世大学 $30\\text{ m} \\times 30\\text{ m} \\times 8\\text{ m}$ 大型高精度 Vicon 动捕大厅开展；测试无人机为定制竞速四旋翼（重 0.75 kg，推重比高达 **4.5:1**，机载 Jetson / STM32 平台），实飞最高速度 **20 m/s (72 km/h)**，向心加速度达 **5g (49 m/s²)**。",
              "vocab": [
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
                  "level": "green"
                },
                {
                  "word": "experiments",
                  "ipa": "/ɪkˈsperɪmənts/",
                  "meaning": "实验",
                  "level": "green"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼无人机",
                  "level": "red"
                },
                {
                  "word": "thrust-to-weight",
                  "ipa": "/θrʌst tuː weɪt/",
                  "meaning": "推重比 (如 4.5:1)",
                  "level": "blue"
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
              "id": "P12-S2",
              "text": "DFBC required only 0.05 ms per step, running 50 to 100 times faster than NMPC (2.5 - 4.5 ms), while achieving near-identical tracking on feasible trajectories.",
              "translation": "实飞数据完美印证了仿真结论：NMPC+INDI 与 DFBC+INDI 均成功以 72 km/h 极速刷圈；DFBC 单步耗时仅 **0.05 ms**，而 NMPC 单步耗时 **2.5 ~ 4.5 ms**（DFBC 快 50~100 倍）。",
              "vocab": [
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "green"
                },
                {
                  "word": "feasible",
                  "ipa": "/ˈfiːzəbl/",
                  "meaning": "物理可行的",
                  "level": "green"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹（复数）",
                  "level": "red"
                }
              ]
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
              "translation": "最终工程选型建议：1. 对于具备高质量规划器、轨迹满足动力学可行性的场景，**DFBC+INDI 是性价比最高的黄金组合**，以极低算力实现媲美 NMPC 的顶级跟踪精度；",
              "vocab": [
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹（复数）",
                  "level": "red"
                },
                {
                  "word": "cost-effective",
                  "ipa": "/kɒst ɪˈfektɪv/",
                  "meaning": "高性价比的，低开销高效的",
                  "level": "green"
                },
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算的，算力的",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P13-S2",
              "text": "For highly dynamic environments with frequent trajectory revisions near actuator saturation limits, NMPC is indispensable for proactive constraint avoidance.",
              "translation": "2. 对于环境高度动态未知、轨迹频繁突变或执行器工作在饱和边缘的极限机动，**NMPC 是唯一能够前瞻性规避饱和崩溃的控制方案**；",
              "vocab": [
                {
                  "word": "dynamic",
                  "ipa": "/daɪˈnæmɪk/",
                  "meaning": "动态的，动力学的",
                  "level": "green"
                },
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/电调/舵机）",
                  "level": "red"
                },
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（如推力达到硬件极限）",
                  "level": "red"
                },
                {
                  "word": "indispensable",
                  "ipa": "/ˌɪndɪˈspensəbl/",
                  "meaning": "必不可少的，不可或缺的",
                  "level": "green"
                },
                {
                  "word": "constraint",
                  "ipa": "/kənˈstreɪnt/",
                  "meaning": "约束",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P13-S3",
              "text": "Cascaded INDI inner-loop combined with aerodynamic drag feedforward is the foundational cornerstone for all high-speed quadrotor controllers.",
              "translation": "3. **“INDI 姿态内环 + 空气动力学阻力补偿” 是所有高速敏捷飞行控制器的必备核心基石**。",
              "vocab": [
                {
                  "word": "cascaded",
                  "ipa": "/kæˈskeɪdɪd/",
                  "meaning": "级联的，串级的",
                  "level": "green"
                },
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
                  "meaning": "阻力（空气阻力/流体阻力）",
                  "level": "red"
                },
                {
                  "word": "feedforward",
                  "ipa": "/ˈfiːdfɔːwəd/",
                  "meaning": "前馈控制",
                  "level": "red"
                },
                {
                  "word": "cornerstone",
                  "ipa": "/ˈkɔːnəstəʊn/",
                  "meaning": "奠基石，核心支柱",
                  "level": "blue"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼无人机",
                  "level": "red"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
