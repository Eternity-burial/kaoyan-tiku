window.BISHE_DATA = window.BISHE_DATA || {};
window.BISHE_DATA['paper1'] = {
  "id": "paper1",
  "title": "A Comparative Study of Nonlinear MPC and Differential-Flatness-Based Control for Quadrotor Agile Flight",
  "chineseTitle": "四旋翼敏捷飞行的非线性模型预测控制（NMPC）与微分平坦控制（DFBC）对比研究",
  "authors": "Sihao Sun (孙思豪), Angel Romero, Philipp Foehn, Elia Kaufmann, Davide Scaramuzza",
  "journal": "IEEE Transactions on Robotics (T-RO), Vol. 38, No. 6, 2022",
  "venue": "苏黎世大学机器人与感知实验室（Robotics and Perception Group, University of Zurich, Switzerland）",
  "video": "https://youtu.be/XpuRpKHp_Bk",
  "code": "https://github.com/uzh-rpg/agile_flight",
  "overview": "本文在高达 72 km/h (20 m/s) 速度与 5g 加速度的极限飞行机动下，系统对比了非线性模型预测控制 (NMPC) 与基于微分平坦的控制器 (DFBC)。揭示了动态不可行轨迹下 NMPC 的前瞻优势（误差降低 48%~62%），以及 DFBC 在计算耗时上的巨大优势（0.05 ms vs 4.5 ms，快 50-100 倍）。实飞证实了“INDI 姿态内环 + 空气动力学阻力补偿”使轨迹跟踪误差降低 78% 以上，是高速敏捷飞行的核心基石。",
  "sections": [
    {
      "id": "sec-abstract",
      "sectionNumber": "摘要",
      "title": "ABSTRACT",
      "chineseTitle": "论文摘要 (Abstract)",
      "paragraphs": [
        {
          "pIndex": 1,
          "logicRole": "研究背景与高精度轨迹跟踪挑战",
          "mainIdea": "在复杂环境中实现安全导航需要高精度轨迹跟踪；极限敏捷飞行面临强非线性动力学、复杂气动效应与执行机构物理约束三重挑战。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "Accurate trajectory-tracking control for quadrotors is essential for safe navigation in cluttered environments.",
              "translation": "在复杂受限环境中实现安全自主导航，四旋翼无人机的高精度轨迹跟踪控制至关重要。",
              "vocab": [
                {
                  "word": "trajectory-tracking",
                  "ipa": "/trəˈdʒektəri ˈtrækɪŋ/",
                  "meaning": "轨迹跟踪的",
                  "level": "blue"
                },
                {
                  "word": "quadrotors",
                  "ipa": "/ˈkwɒdrəʊtəz/",
                  "meaning": "四旋翼飞行器（复数）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "However, this is challenging in agile flights due to nonlinear dynamics, complex aerodynamic effects, and actuation constraints.",
              "translation": "然而，在极限敏捷飞行中，由于高度非线性动力学、复杂的空气动力学效应以及执行机构物理约束的共同耦合作用，高精度轨迹跟踪面临极大挑战。",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "constraints",
                  "ipa": "/kənˈstreɪnts/",
                  "meaning": "约束条件（硬约束/软约束）",
                  "level": "red"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "actuation",
                  "ipa": "/ˌæktʃuˈeɪʃn/",
                  "meaning": "驱动，执行机构驱动",
                  "level": "red"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 2,
          "logicRole": "研究方法与两大前沿框架同台对比",
          "mainIdea": "在高达 20 m/s (72 km/h) 速度与 5g 加速度极限机动下，系统性实证对比 NMPC 与 DFBC 两大主流控制框架。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P2-S1",
              "text": "In this article, we empirically compare two state-of-the-art control frameworks: the nonlinear-model-predictive controller (NMPC) and the differential-flatness-based controller (DFBC), by tracking a wide variety of agile trajectories at speeds up to 20 m/s (i.e., 72 km/h).",
              "translation": "在本文中，我们经验性地系统对比了当今两大主流前沿控制框架：非线性模型预测控制器（NMPC）与基于微分平坦的控制器（DFBC），通过在高达 20 m/s（即 72 km/h）的飞行速度下跟踪各种极限敏捷轨迹。",
              "vocab": [
                {
                  "word": "state-of-the-art",
                  "ipa": "/steɪt əv ði ɑːt/",
                  "meaning": "业界最顶尖的，前沿的",
                  "level": "blue"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹，航迹（复数）",
                  "level": "red"
                },
                {
                  "word": "empirically",
                  "ipa": "/ɪmˈpɪrɪkli/",
                  "meaning": "实证地，通过实验系统地",
                  "level": "green"
                },
                {
                  "word": "frameworks",
                  "ipa": "/ˈfreɪmwɜːks/",
                  "meaning": "框架（复数）",
                  "level": "green"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "The comparisons are performed in both simulation and real-world environments to systematically evaluate both methods from the aspect of tracking accuracy, robustness, and computational efficiency.",
              "translation": "对比评估在物理仿真与真实世界飞行实验中全方位展开，从跟踪精度、鲁棒性与计算效率等维度对两种方法进行系统性评估。",
              "vocab": [
                {
                  "word": "computational efficiency",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl ɪˈfɪʃnsi/",
                  "meaning": "计算效率",
                  "level": "blue"
                },
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算上的，计算开销的",
                  "level": "green"
                },
                {
                  "word": "simulation",
                  "ipa": "/ˌsɪmjuˈleɪʃn/",
                  "meaning": "仿真，模拟",
                  "level": "green"
                },
                {
                  "word": "robustness",
                  "ipa": "/rəʊˈbʌstnəs/",
                  "meaning": "鲁棒性，抗扰稳健性",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 3,
          "logicRole": "动态不可行轨迹对比结论",
          "mainIdea": "在跟踪超出单电机推力极限的动态不可行轨迹时，NMPC 展现出显著前瞻优势，代价是更高的计算耗时与数值收敛风险。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P3-S1",
              "text": "We show the superiority of NMPC in tracking dynamically infeasible trajectories, at the cost of higher computation time and risk of numerical convergence issues.",
              "translation": "研究表明：在跟踪超出单电机最大推力极限的动态不可行轨迹时，NMPC 展现出显著优势，但其代价是更高的计算耗时以及潜在的数值求解收敛风险。",
              "vocab": [
                {
                  "word": "dynamically infeasible",
                  "ipa": "/daɪˈnæmɪkli ɪnˈfiːzəbl/",
                  "meaning": "动态不可行的（超出电机最大推力/速度极限）",
                  "level": "blue"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹，航迹（复数）",
                  "level": "red"
                },
                {
                  "word": "infeasible",
                  "ipa": "/ɪnˈfiːzəbl/",
                  "meaning": "不可行的（如超出执行机构物理极限）",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 4,
          "logicRole": "INDI内环与气动阻力模型的决定性作用",
          "mainIdea": "引入增量非线性动态逆 (INDI) 内环与显式空气动力学阻力模型至关重要，实飞实验中将两者跟踪误差降低 78% 以上。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P4-S1",
              "text": "For both methods, we also quantitatively study the effect of adding an inner-loop controller using the incremental nonlinear dynamic inversion (INDI) method, and the effect of adding an aerodynamic drag model.",
              "translation": "对于两种控制方法，我们均定量研究了引入基于增量非线性动态逆（INDI）的角加速度内环控制器以及加入显式空气动力学阻力模型的影响。",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "study",
                  "ipa": "/ˈstʌdi/",
                  "meaning": "研究",
                  "level": "green"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P4-S2",
              "text": "Our real-world experiments, performed in one of the world's largest motion capture systems, demonstrate more than 78% tracking error reduction of both NMPC and DFBC, indicating the necessity of using an inner-loop controller and aerodynamic drag model for agile trajectory tracking.",
              "translation": "在苏黎世大学全球最大的动作捕捉系统之一中进行的真实飞行实验表明：引入 INDI 内环与气动阻力模型使 NMPC 与 DFBC 的跟踪误差降低了 78% 以上，证实了两者对于高速敏捷轨迹跟踪的绝对必要性。",
              "vocab": [
                {
                  "word": "trajectory tracking",
                  "ipa": "/trəˈdʒektəri ˈtrækɪŋ/",
                  "meaning": "轨迹跟踪控制",
                  "level": "blue"
                },
                {
                  "word": "motion capture",
                  "ipa": "/ˈməʊʃn ˈkæptʃə/",
                  "meaning": "动作捕捉系统 (OptiTrack/Vicon)",
                  "level": "blue"
                },
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
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
      "chineseTitle": "一、引言 (I. INTRODUCTION)",
      "paragraphs": [
        {
          "pIndex": 5,
          "logicRole": "四旋翼机动性与时间敏感应用需求",
          "mainIdea": "四旋翼具有极高机动性，对于搜救、管道勘测、自主探索、无人机竞速及空中运输等时间敏感任务至关重要。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P5-S1",
              "text": "Quadrotors are extremely agile. Exploiting their agility is crucial for time-critical missions, such as search and rescue, monitoring, exploration, aerial delivery, drone racing, reconnaissance, and even flying cars.",
              "translation": "四旋翼飞行器具有极高的机动敏捷性。充分发挥其敏捷性能对于时间敏感型任务至关重要，例如水下/空中搜救、监测、自主探索、无人机物流、竞速穿越机（Drone Racing）、侦察乃至飞行汽车。",
              "vocab": [
                {
                  "word": "drone racing",
                  "ipa": "/drəʊn ˈreɪsɪŋ/",
                  "meaning": "穿越机竞速，无人机竞速",
                  "level": "blue"
                },
                {
                  "word": "quadrotors",
                  "ipa": "/ˈkwɒdrəʊtəz/",
                  "meaning": "四旋翼飞行器（复数）",
                  "level": "red"
                },
                {
                  "word": "agility",
                  "ipa": "/əˈdʒɪləti/",
                  "meaning": "机动性，敏捷度",
                  "level": "red"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P5-S2",
              "text": "An accurate trajectory-tracking controller is required to safely execute high-speed trajectories in cluttered environments.",
              "translation": "要在复杂受限环境中安全执行高速机动航迹，必须配备高精度的轨迹跟踪控制器。",
              "vocab": [
                {
                  "word": "trajectory-tracking",
                  "ipa": "/trəˈdʒektəri ˈtrækɪŋ/",
                  "meaning": "轨迹跟踪的",
                  "level": "blue"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹，航迹（复数）",
                  "level": "red"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 6,
          "logicRole": "极限敏捷飞行的三大核心控制瓶颈",
          "mainIdea": "三大核心瓶颈：强非线性动力学耦合、高速气动阻力效应、执行器物理推力与转速饱和约束。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P6-S1",
              "text": "However, most approaches struggle to handle joint effects in agile flights, such as nonlinear dynamics, aerodynamic effects, and actuation limits.",
              "translation": "然而，现有大多数控制方法难以同时应对敏捷飞行中的复合效应，包括高度非线性动力学、空气动力学效应以及执行机构输出极限。",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "actuation",
                  "ipa": "/ˌæktʃuˈeɪʃn/",
                  "meaning": "驱动，执行机构驱动",
                  "level": "red"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P6-S2",
              "text": "First, large-attitude maneuvers invalidate small-angle linearization assumptions during rapid position-attitude coupling.",
              "translation": "第一，在大角度快速翻转机动中，位置与姿态强烈耦合，经典小角度线性化假设彻底失效；",
              "vocab": []
            },
            {
              "sIndex": 3,
              "id": "P6-S3",
              "text": "Second, rotor blade flapping drag and body drag induce substantial aerodynamic forces that cause severe lateral drift in high-speed turns if neglected.",
              "translation": "第二，高速飞行时旋翼叶片挥舞阻力与机身迎风阻力显著增大，若忽略阻力会导致飞行器在弯道产生严重离心外侧漂移；",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "body drag",
                  "ipa": "/ˈbɒdi dræɡ/",
                  "meaning": "机身形状迎风阻力",
                  "level": "blue"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "漂移，位置偏差",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 4,
              "id": "P6-S4",
              "text": "Third, strict actuator constraints on maximum motor rotational speed, thrust limits, and body rate limits must never be violated.",
              "translation": "第三，电调与电机的最大转速、推力上限以及姿态角速率等物理硬约束极其严苛。",
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
                  "meaning": "执行机构，执行器（电机/电调/舵机/推进器）",
                  "level": "red"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 7,
          "logicRole": "两大主流控制流派原理与对比",
          "mainIdea": "NMPC 采用在线滚动时域最优求解显式处理约束；DFBC 利用微分平坦性实现解析前馈超低延迟控制。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P7-S1",
              "text": "To overcome these challenges, the robotics community has pursued two distinct control philosophies: NMPC and DFBC.",
              "translation": "为了解决上述难题，机器人学术界形成了两大代表性控制流派：",
              "vocab": [
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P7-S2",
              "text": "Recently, nonlinear model predictive control (NMPC) has drawn much attention for quadrotor control thanks to advances in hardware and algorithmic efficiency; NMPC particularly excels in handling control limits, and its predictive nature is beneficial for high-speed tracking.",
              "translation": "近年来，得益于计算硬件与高效算法的发展，非线性模型预测控制（NMPC）受到广泛关注；NMPC 特别擅长显式处理执行器约束，其前瞻预测特性对于高速跟踪大有裨益。",
              "vocab": [
                {
                  "word": "model predictive control",
                  "ipa": "/ˈmɒdl prɪˈdɪktɪv kənˈtrəʊl/",
                  "meaning": "模型预测控制 (MPC)",
                  "level": "blue"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼飞行器，四轴无人机",
                  "level": "red"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P7-S3",
              "text": "However, NMPC is computationally extremely demanding compared to the state-of-the-art non-predictive method: the differential-flatness-based controller (DFBC), which maps flat outputs algebraically to control inputs with ultra-low latency.",
              "translation": "然而，相比当今顶尖的非预测控制方法——基于微分平坦的控制器（DFBC），NMPC 的计算开销极其庞大；DFBC 利用四旋翼的微分平坦特性，将平坦输出及其高阶导数代数映射为控制指令，计算延迟极低。",
              "vocab": [
                {
                  "word": "state-of-the-art",
                  "ipa": "/steɪt əv ði ɑːt/",
                  "meaning": "业界最顶尖的，前沿的",
                  "level": "blue"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 8,
          "logicRole": "论文三大核心学术贡献",
          "mainIdea": "本文完成了 20 m/s 极速同台基准测试、提出 INDI+气动阻力融合架构、揭示了多维度性能演化规律。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P8-S1",
              "text": "This paper delivers three primary contributions to the robotics literature.",
              "translation": "本文的主要学术贡献包括以下三点：",
              "vocab": []
            },
            {
              "sIndex": 2,
              "id": "P8-S2",
              "text": "1. We perform the first direct benchmark between NMPC and modified DFBC in extreme agile flights up to 20 m/s (72 km/h).",
              "translation": "1. 首次在高达 20 m/s 的极限实飞速度下，对 NMPC 与改进型 DFBC 进行全方位同台基准测试；",
              "vocab": [
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P8-S3",
              "text": "2. We formulate a unified control architecture integrating sensor-based INDI inner-loop acceleration feedback with aerodynamic drag compensation.",
              "translation": "2. 提出将增量非线性动态逆（INDI）内环与空气动力学阻力模型统一融入 NMPC 和 DFBC 控制架构；",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 4,
              "id": "P8-S4",
              "text": "3. We systematically evaluate tracking performance under dynamically feasible versus infeasible trajectories, computational delays, parameter uncertainties, and actuator saturation.",
              "translation": "3. 系统揭示了动态可行与动态不可行轨迹、单拍计算延迟、模型不确定性及执行器饱和下的性能演化规律。",
              "vocab": [
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算上的，计算开销的",
                  "level": "green"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹，航迹（复数）",
                  "level": "red"
                },
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（推力饱和/转速饱和/输出饱和）",
                  "level": "red"
                },
                {
                  "word": "infeasible",
                  "ipa": "/ɪnˈfiːzəbl/",
                  "meaning": "不可行的（如超出执行机构物理极限）",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/电调/舵机/推进器）",
                  "level": "red"
                },
                {
                  "word": "delays",
                  "ipa": "/dɪˈleɪz/",
                  "meaning": "延迟（复数）",
                  "level": "red"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-prelim",
      "sectionNumber": "二",
      "title": "II. SYSTEM DYNAMICS & AERODYNAMIC DRAG (PRELIMINARIES)",
      "chineseTitle": "二、系统动力学与气动阻力建模 (III. PRELIMINARIES)",
      "figure": {
        "image": "题库/毕设/images/paper1_fig1_quadrotor_nmpc_dfbc.png",
        "caption": "Fig. 1: 四旋翼飞行器坐标系定义、NMPC 滚动预测与 DFBC 几何平坦控制系统整体架构图 (IEEE T-RO 2022)",
        "alt": "Fig. 1: Quadrotor coordinate frame and control system architecture"
      },
      "paragraphs": [
        {
          "pIndex": 9,
          "logicRole": "四旋翼 6-DOF 刚体动力学方程",
          "mainIdea": "在世界坐标系与机体坐标系下，由位置微分、牛顿第二定律、四元数运动学及欧拉转动动力学构成完备刚体模型。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P9-S1",
              "text": "Let world inertial frame be $\\mathcal{W} = \\{x_W, y_W, z_W\\}$ and body-fixed frame be $\\mathcal{B} = \\{x_B, y_B, z_B\\}$.",
              "translation": "定义惯性坐标系为 $\\mathcal{W} = \\{x_W, y_W, z_W\\}$，机体坐标系为 $\\mathcal{B} = \\{x_B, y_B, z_B\\}$。",
              "vocab": []
            },
            {
              "sIndex": 2,
              "id": "P9-S2",
              "text": "Quadrotor 6-DOF rigid-body dynamics are governed by translational kinematics $\\dot{\\boldsymbol{\\xi}} = \\boldsymbol{v}$ and Newton's second law: $m \\dot{\\boldsymbol{v}} = m \\boldsymbol{g}_W + \\boldsymbol{R} \\boldsymbol{f}_B + \\boldsymbol{f}_a$.",
              "translation": "四旋翼刚体动力学由线速度运动学 $\\dot{\\boldsymbol{\\xi}} = \\boldsymbol{v}$ 与牛顿第二定律描述：$m \\dot{\\boldsymbol{v}} = m \\boldsymbol{g}_W + \\boldsymbol{R} \\boldsymbol{f}_B + \\boldsymbol{f}_a$。",
              "vocab": [
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼飞行器，四轴无人机",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P9-S3",
              "text": "Attitude kinematics and rotational dynamics are expressed as $\\dot{\\boldsymbol{q}} = \\frac{1}{2} \\boldsymbol{q} \\otimes \\begin{bmatrix} 0 \\\\ \\boldsymbol{\\Omega}_B \\end{bmatrix}$ and $\\boldsymbol{J} \\dot{\\boldsymbol{\\Omega}}_B = \\boldsymbol{\\tau}_B - \\boldsymbol{\\Omega}_B \\times (\\boldsymbol{J} \\boldsymbol{\\Omega}_B)$.",
              "translation": "姿态四元数运动学与欧拉转动方程为：$\\dot{\\boldsymbol{q}} = \\frac{1}{2} \\boldsymbol{q} \\otimes \\begin{bmatrix} 0 \\\\ \\boldsymbol{\\Omega}_B \\end{bmatrix}$ 以及 $\\boldsymbol{J} \\dot{\\boldsymbol{\\Omega}}_B = \\boldsymbol{\\tau}_B - \\boldsymbol{\\Omega}_B \\times (\\boldsymbol{J} \\boldsymbol{\\Omega}_B)$。",
              "vocab": []
            }
          ]
        },
        {
          "pIndex": 10,
          "logicRole": "系统状态与力矩参数物理定义",
          "mainIdea": "定义位置 xi、线速度 v、质量 m、重力 gW、姿态四元数 q、旋转矩阵 R、转动惯量 J、总推力 fB 及三轴控制力矩 tauB。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P10-S1",
              "text": "Here, $\\boldsymbol{\\xi} = [x, y, z]^T$ denotes position in world frame, $\\boldsymbol{v}$ is linear velocity, $m$ is mass, and $\\boldsymbol{g}_W = [0, 0, -g]^T$ is gravity.",
              "translation": "其中 $\\boldsymbol{\\xi} = [x, y, z]^T$ 为世界系位置，$\\boldsymbol{v} = [\\dot{x}, \\dot{y}, \\dot{z}]^T$ 为线速度，$m$ 为总质量，$\\boldsymbol{g}_W = [0, 0, -g]^T$ 为重力加速度矢量；",
              "vocab": []
            },
            {
              "sIndex": 2,
              "id": "P10-S2",
              "text": "The rotation matrix $\\boldsymbol{R} \\in SO(3)$ maps body coordinates to world coordinates parameterized by unit quaternion $\\boldsymbol{q} = [q_w, q_x, q_y, q_z]^T$.",
              "translation": "$\\boldsymbol{R} \\in SO(3)$ 为从机体系到世界系的旋转矩阵，$\\boldsymbol{q} = [q_w, q_x, q_y, q_z]^T$ 为姿态四元数；",
              "vocab": [
                {
                  "word": "quaternion",
                  "ipa": "/kwəˈtɜːniən/",
                  "meaning": "四元数（无奇异性表示 3D 旋转）",
                  "level": "red"
                },
                {
                  "word": "so(3)",
                  "ipa": "/ˌes.oʊ ˈθriː/",
                  "meaning": "三维特殊正交旋转李群",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P10-S3",
              "text": "Total collective thrust is $\\boldsymbol{f}_B = [0, 0, T]^T$ with $T = \\sum_{i=1}^4 f_i$, and $\\boldsymbol{\\tau}_B = [\\tau_x, \\tau_y, \\tau_z]^T$ represents body torques generated by 4 rotors.",
              "translation": "$\\boldsymbol{f}_B = [0, 0, T]^T$ 为 4 个转子产生的机体总推力（$T = \\sum_{i=1}^4 f_i$），$\\boldsymbol{\\tau}_B = [\\tau_x, \\tau_y, \\tau_z]^T$ 为转子合成的三轴控制力矩。",
              "vocab": [
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 11,
          "logicRole": "空气动力学复合阻力模型",
          "mainIdea": "在高速飞行中空气阻力显著；采用风洞验证的对角复合阻力矩阵显式补偿转子诱导阻力与迎风阻力。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P11-S1",
              "text": "At high flight speeds exceeding 10 m/s, aerodynamic drag force $\\boldsymbol{f}_a$ cannot be neglected.",
              "translation": "在高速飞行（超过 10 m/s）时，空气阻力 $\\boldsymbol{f}_a$ 不可忽略。",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
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
              "id": "P11-S2",
              "text": "We adopt a wind-tunnel validated diagonal lumped drag model: $\\boldsymbol{f}_a = - \\boldsymbol{R} \\boldsymbol{D}_v \\boldsymbol{R}^T \\boldsymbol{v}$.",
              "translation": "本文采用经过风洞实验验证的复合阻力模型：$\\boldsymbol{f}_a = - \\boldsymbol{R} \\boldsymbol{D}_v \\boldsymbol{R}^T \\boldsymbol{v}$。",
              "vocab": []
            },
            {
              "sIndex": 3,
              "id": "P11-S3",
              "text": "The matrix $\\boldsymbol{D}_v = \\text{diag}(d_x, d_y, d_z)$ encompasses both rotor blade flapping drag and fuselage parasitic drag.",
              "translation": "其中 $\\boldsymbol{D}_v = \\text{diag}(d_x, d_y, d_z)$ 为对角空气阻力系数矩阵，显式包含了转子叶片挥舞阻力与机身迎风阻力。",
              "vocab": []
            }
          ]
        }
      ]
    },
    {
      "id": "sec-methods",
      "sectionNumber": "三",
      "title": "III. CONTROL METHODOLOGY DESIGN",
      "chineseTitle": "三、控制方法设计 (IV. METHODOLOGIES)",
      "figure": {
        "image": "题库/毕设/images/paper1_fig3_indi_inner_loop.png",
        "caption": "Fig. 3: 级联 500 Hz 增量非线性动态逆 (INDI) 角加速度内环与电机推力分配控制框图 (IEEE T-RO 2022)",
        "alt": "Fig. 3: Cascaded INDI inner-loop block diagram"
      },
      "paragraphs": [
        {
          "pIndex": 12,
          "logicRole": "NMPC 有限预测时域优化命题构建",
          "mainIdea": "NMPC 构建二次型跟踪代价函数，在有限时域内利用 acados 和 SQP-RTI 快速求解带推力硬约束的最优控制序列。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P12-S1",
              "text": "NMPC discretizes a prediction horizon $\\tau \\in [t, t+h]$ into $N$ shooting nodes and solves a constrained nonlinear optimal control problem: $\\min_{\\boldsymbol{u}} \\sum_{k=0}^{N-1} ( \\|\\boldsymbol{x}_k - \\boldsymbol{x}_{k,r}\\|_{\\boldsymbol{Q}}^2 + \\|\\boldsymbol{u}_k - \\boldsymbol{u}_{k,r}\\|_{\\boldsymbol{Q}_u}^2 ) + \\|\\boldsymbol{x}_N - \\boldsymbol{x}_{N,r}\\|_{\\boldsymbol{Q}_N}^2$.",
              "translation": "NMPC 在有限时域 $\\tau \\in [t, t + h]$ 内将系统离散化为 $N$ 个等长步长区间，构建受约束的非线性二次优化命题。",
              "vocab": [
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "horizon",
                  "ipa": "/həˈraɪzn/",
                  "meaning": "时域，预测时域 (Prediction Horizon)",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P12-S2",
              "text": "Constraints enforce state transition $\\boldsymbol{x}_{k+1} = f(\\boldsymbol{x}_k, \\boldsymbol{u}_k)$, body rates $\\boldsymbol{\\Omega}_B \\in [\\boldsymbol{\\Omega}_{\\min}, \\boldsymbol{\\Omega}_{\\max}]$, and individual motor thrusts $u_i \\in [u_{\\min}, u_{\\max}]$.",
              "translation": "约束条件包含状态转移方程、机体角速度上下界 $\\boldsymbol{\\Omega}_B \\in [\\boldsymbol{\\Omega}_{\\min}, \\boldsymbol{\\Omega}_{\\max}]$ 以及各电机独立推力硬约束 $u_i \\in [u_{\\min}, u_{\\max}]$。",
              "vocab": [
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
              "id": "P12-S3",
              "text": "Real-time execution is realized via the high-performance C++ code generation tool acados utilizing the Sequential Quadratic Programming Real-Time Iteration (SQP-RTI) scheme.",
              "translation": "求解器采用高效率 C++ 代码生成框架 acados，结合序列二次规划（SQP-RTI）算法在几毫秒内实时求解。",
              "vocab": [
                {
                  "word": "acados",
                  "ipa": "/əˈkɑːdɒs/",
                  "meaning": "高性能非线性嵌入式最优控制求解器库",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 13,
          "logicRole": "改进型 DFBC 几何前馈与高阶导数解析",
          "mainIdea": "选取平坦输出为位置与偏航角；由期望合力加速度解析机体 z 轴方向，二阶求导计算加加速度 Jerk 与角速度前馈。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P13-S1",
              "text": "DFBC chooses flat outputs as $\\boldsymbol{\\sigma} = [x, y, z, \\psi]^T$. The desired net acceleration including aerodynamic drag is $\\boldsymbol{a}_{\\text{des}} = \\ddot{\\boldsymbol{\\xi}}_{ref} + \\boldsymbol{K}_p (\\boldsymbol{\\xi}_{ref} - \\boldsymbol{\\xi}) + \\boldsymbol{K}_d (\\dot{\\boldsymbol{\\xi}}_{ref} - \\dot{\\boldsymbol{\\xi}}) - \\boldsymbol{g}_W - \\frac{1}{m}\\boldsymbol{f}_a$.",
              "translation": "四旋翼的平坦输出选取为位置与偏航角 $\\boldsymbol{\\sigma} = [x, y, z, \\psi]^T$。考虑气动阻力后的期望合力加速度矢量为 $\\boldsymbol{a}_{\\text{des}}$。",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P13-S2",
              "text": "The desired body $z_B$ axis is analytically computed as $\\boldsymbol{z}_{B,\\text{des}} = \\frac{\\boldsymbol{a}_{\\text{des}}}{\\|\\boldsymbol{a}_{\\text{des}}\\|}$.",
              "translation": "由此解得期望机体 $z_B$ 轴方向：$\\boldsymbol{z}_{B,\\text{des}} = \\frac{\\boldsymbol{a}_{\\text{des}}}{\\|\\boldsymbol{a}_{\\text{des}}\\|}$。",
              "vocab": []
            },
            {
              "sIndex": 3,
              "id": "P13-S3",
              "text": "Differentiating $\\boldsymbol{a}_{\\text{des}}$ twice yields trajectory jerk and snap, resolving desired body rates $\\boldsymbol{\\Omega}_{B,\\text{des}}$ and angular accelerations $\\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}}$ without numerical optimization.",
              "translation": "通过对 $\\boldsymbol{a}_{\\text{des}}$ 进行二阶求导（涉及轨迹加加速度 Jerk 与加加加速度 Snap），可解析求出期望角速度 $\\boldsymbol{\\Omega}_{B,\\text{des}}$ 与期望角加速度 $\\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}}$。",
              "vocab": [
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 4,
              "id": "P13-S4",
              "text": "A lightweight quadratic programming (QP) control allocator resolves motor thrust saturation while strictly prioritizing attitude torque over collective thrust.",
              "translation": "当合力需求超出单电机推力极限时，采用小型 QP 求解器在优先保证姿态控制力矩的前提下等比例缩减总推力。",
              "vocab": [
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（推力饱和/转速饱和/输出饱和）",
                  "level": "red"
                },
                {
                  "word": "torque",
                  "ipa": "/tɔːk/",
                  "meaning": "力矩，转矩",
                  "level": "red"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red"
                },
                {
                  "word": "qp",
                  "ipa": "/ˌkjuːˈpiː/",
                  "meaning": "二次规划 (Quadratic Programming)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 14,
          "logicRole": "级联 500 Hz INDI 姿态增量内环设计",
          "mainIdea": "为隔绝惯量不确定性与风扰，级联 500 Hz INDI 内环；通过角加速度反馈直接递推力矩增量驱动电调。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P14-S1",
              "text": "To isolate inertia uncertainties and aerodynamic disturbances, both NMPC and DFBC are cascaded with a 500 Hz sensor-based INDI inner-loop.",
              "translation": "为隔绝转动惯量不确定性、未建模力矩与外部阵风扰动，NMPC 与 DFBC 的底层均级联了高频（500 Hz）INDI 姿态内环。",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "cascaded",
                  "ipa": "/kæˈskeɪdɪd/",
                  "meaning": "级联的（如外环位置级联内环姿态）",
                  "level": "blue"
                },
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "惯量，转动惯量",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P14-S2",
              "text": "Virtual angular acceleration command is $\\boldsymbol{\\nu} = \\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}} + \\boldsymbol{K}_p (\\boldsymbol{q}_{ref} \\ominus \\boldsymbol{q}) + \\boldsymbol{K}_d (\\boldsymbol{\\Omega}_{B,\\text{des}} - \\boldsymbol{\\Omega}_B)$.",
              "translation": "虚拟角加速度指令为 $\\boldsymbol{\\nu} = \\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}} + \\boldsymbol{K}_p (\\boldsymbol{q}_{ref} \\ominus \\boldsymbol{q}) + \\boldsymbol{K}_d (\\boldsymbol{\\Omega}_{B,\\text{des}} - \\boldsymbol{\\Omega}_B)$。",
              "vocab": [
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P14-S3",
              "text": "Control torque increment is computed from filtered angular acceleration feedback $\\dot{\\boldsymbol{\\Omega}}_{B,f}$ as $\\Delta \\boldsymbol{\\tau}_B = \\boldsymbol{J} (\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_{B,f})$, synthesizing $\\boldsymbol{\\tau}_B = \\boldsymbol{\\tau}_{B,f} + \\Delta \\boldsymbol{\\tau}_B$ directly to motor ESCs.",
              "translation": "根据角加速度反馈 $\\dot{\\boldsymbol{\\Omega}}_{B,f}$ 计算机体控制力矩增量 $\\Delta \\boldsymbol{\\tau}_B = \\boldsymbol{J} (\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_{B,f})$，合成 $\\boldsymbol{\\tau}_B = \\boldsymbol{\\tau}_{B,f} + \\Delta \\boldsymbol{\\tau}_B$ 并直接驱动电调。",
              "vocab": [
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
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
        }
      ]
    },
    {
      "id": "sec-sim",
      "sectionNumber": "四",
      "title": "IV. SIMULATION BENCHMARKS & ABLATION STUDIES",
      "chineseTitle": "四、仿真实验与消融对比 (VI. SIMULATION EXPERIMENTS)",
      "figure": {
        "image": "题库/毕设/images/paper1_fig7_tracking_curves.png",
        "caption": "Fig. 7: 72 km/h 极速赛道下 NMPC+INDI 与 DFBC+INDI 轨迹跟踪与推力饱和对比曲线 (IEEE T-RO 2022)",
        "alt": "Fig. 7: 72 km/h race track tracking comparison"
      },
      "paragraphs": [
        {
          "pIndex": 15,
          "logicRole": "4 种典型极限测试轨迹设计",
          "mainIdea": "设计专业穿越机赛道 Race Track A/B/C、3D 空间 Figure-8 航迹以及包含 360 度特技滚转与回环动作。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P15-S1",
              "text": "Simulation evaluation encompasses 4 highly challenging agile trajectory benchmarks.",
              "translation": "测试包含了 4 种典型极限航迹：",
              "vocab": [
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "simulation",
                  "ipa": "/ˌsɪmjuˈleɪʃn/",
                  "meaning": "仿真，模拟",
                  "level": "green"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P15-S2",
              "text": "1. Professional drone racing tracks (Race Track A / B / C) featuring hairpin turns and high-speed dives up to 20 m/s.",
              "translation": "1. 专业穿越机竞速赛道（Race Track A / B / C），包含急转发卡弯、俯冲跃升等动作，最高速度达 20 m/s；",
              "vocab": [
                {
                  "word": "drone racing",
                  "ipa": "/drəʊn ˈreɪsɪŋ/",
                  "meaning": "穿越机竞速，无人机竞速",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P15-S3",
              "text": "2. Spatial 3D Figure-8 trajectories with rapid altitude and attitude transitions.",
              "translation": "2. 空间 3D 立体“8”字飞行（3D Figure-8）；",
              "vocab": [
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹，航迹（复数）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 4,
              "id": "P15-S4",
              "text": "3. Aerobatic looping and barrel rolls containing full 360-degree attitude rotations.",
              "translation": "3. 包含 360° 滚转与俯冲回环的极限特技动作（Looping & Barrel Roll）。",
              "vocab": []
            }
          ]
        },
        {
          "pIndex": 16,
          "logicRole": "可行与不可行轨迹跟踪对比数据",
          "mainIdea": "在动态可行轨迹下两者精度相当；在动态不可行轨迹下 NMPC 误差显著降低 48%~62%。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P16-S1",
              "text": "On dynamically feasible trajectories, NMPC+INDI achieves position RMSE of $0.14 \\pm 0.05\\text{ m}$, while DFBC+INDI achieves $0.15 \\pm 0.06\\text{ m}$, exhibiting nearly identical tracking accuracy.",
              "translation": "在动态可行轨迹（Dynamically Feasible）下：NMPC+INDI 位置跟踪 RMSE 为 $0.14 \\pm 0.05\\text{ m}$，DFBC+INDI 为 $0.15 \\pm 0.06\\text{ m}$，两者精度几乎完全一致。",
              "vocab": [
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹，航迹（复数）",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "rmse",
                  "ipa": "/ˌɑːr.em.esˈiː/",
                  "meaning": "均方根误差 (Root Mean Square Error)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P16-S2",
              "text": "On dynamically infeasible trajectories where rotor thrust limits are exceeded, NMPC+INDI maintains position RMSE of $0.38\\text{ m}$ and heading error of $3.2^\\circ$, whereas DFBC+INDI degrades to $0.73\\text{ m}$ and $8.5^\\circ$.",
              "translation": "在动态不可行轨迹（Dynamically Infeasible，电机推力饱和）下：NMPC+INDI 位置 RMSE 为 0.38 m，航向误差 3.2°；DFBC+INDI 位置 RMSE 为 0.73 m，航向误差 8.5°。",
              "vocab": [
                {
                  "word": "dynamically infeasible",
                  "ipa": "/daɪˈnæmɪkli ɪnˈfiːzəbl/",
                  "meaning": "动态不可行的（超出电机最大推力/速度极限）",
                  "level": "blue"
                },
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹，航迹（复数）",
                  "level": "red"
                },
                {
                  "word": "infeasible",
                  "ipa": "/ɪnˈfiːzəbl/",
                  "meaning": "不可行的（如超出执行机构物理极限）",
                  "level": "red"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "rmse",
                  "ipa": "/ˌɑːr.em.esˈiː/",
                  "meaning": "均方根误差 (Root Mean Square Error)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P16-S3",
              "text": "NMPC achieves a 48% reduction in position error and a 62% reduction in heading error because its multi-step predictive horizon proactively decelerates before sharp turns to avoid severe saturation breakdown.",
              "translation": "结论：NMPC 位置误差比 DFBC 低 48%，航向误差低 62%。因为 NMPC 具有未来多步预测能力，能提前减速过弯避免剧烈饱和崩溃。",
              "vocab": [
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（推力饱和/转速饱和/输出饱和）",
                  "level": "red"
                },
                {
                  "word": "horizon",
                  "ipa": "/həˈraɪzn/",
                  "meaning": "时域，预测时域 (Prediction Horizon)",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 17,
          "logicRole": "INDI 内环与空气动力学阻力消融分析",
          "mainIdea": "消融实验表明 INDI 使误差降低 78%；关闭阻力模型会导致高速转弯出现超 1.2 m 侧向漂移。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P17-S1",
              "text": "In ablation tests, replacing the INDI inner-loop with a standard PID controller increases position RMSE from $0.18\\text{ m}$ to $0.82\\text{ m}$, proving that INDI reduces tracking error by over 78% while eliminating attitude oscillations.",
              "translation": "消融实验：采用经典 PID 内环时，轨迹跟踪 RMSE 为 0.82 m；引入 INDI 内环后，跟踪误差直接降至 0.18 m（误差降低 78%），且完全消除了高速转弯时的姿态低频抖动。",
              "vocab": [
                {
                  "word": "oscillations",
                  "ipa": "/ˌɒsɪˈleɪʃnz/",
                  "meaning": "振荡，抖动",
                  "level": "red"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "rmse",
                  "ipa": "/ˌɑːr.em.esˈiː/",
                  "meaning": "均方根误差 (Root Mean Square Error)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P17-S2",
              "text": "Disabling aerodynamic drag feedforward at speeds $> 12\\text{ m/s}$ results in insufficient centripetal force and lateral cornering drift exceeding $1.2\\text{ m}$, which converges back to $< 0.2\\text{ m}$ once drag is compensated.",
              "translation": "消融实验：在速度大于 12 m/s 时，关闭阻力前馈会导致向心力不足，弯道最大侧向漂移超 1.2 m；引入阻力模型后漂移收敛至 0.2 m 以内。",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "feedforward",
                  "ipa": "/ˈfiːdfɔːwəd/",
                  "meaning": "前馈控制",
                  "level": "red"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "漂移，位置偏差",
                  "level": "red"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-real",
      "sectionNumber": "五",
      "title": "V. REAL-WORLD VICON FLIGHT EXPERIMENTS",
      "chineseTitle": "五、大型动捕实机极限飞行实验 (VII. REAL-WORLD EXPERIMENTS)",
      "paragraphs": [
        {
          "pIndex": 18,
          "logicRole": "实机实验平台与极限飞测配置",
          "mainIdea": "苏黎世大学 30x30x8m 动捕大厅，定制 0.75kg、推重比 4.5:1 穿越机，实飞达到 72 km/h 与 5g 极限指标。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P18-S1",
              "text": "Real-world flight experiments were conducted in the University of Zurich $30\\text{ m} \\times 30\\text{ m} \\times 8\\text{ m}$ high-precision Vicon motion capture hall.",
              "translation": "实验场地：苏黎世大学 $30\\text{ m} \\times 30\\text{ m} \\times 8\\text{ m}$ 大型高精度 Vicon 动作捕捉飞行大厅；",
              "vocab": [
                {
                  "word": "motion capture",
                  "ipa": "/ˈməʊʃn ˈkæptʃə/",
                  "meaning": "动作捕捉系统 (OptiTrack/Vicon)",
                  "level": "blue"
                },
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
                  "level": "green"
                },
                {
                  "word": "vicon",
                  "ipa": "/ˈvaɪkɒn/",
                  "meaning": "Vicon 高精度光学动作捕捉系统",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P18-S2",
              "text": "The test vehicle is a custom racing quadrotor weighing $0.75\\text{ kg}$ with a peak thrust-to-weight ratio of 4.5:1, powered by onboard Jetson and STM32 processing units.",
              "translation": "测试无人机：定制竞速四旋翼，重量 0.75 kg，推重比高达 4.5:1，机载 Jetson / STM32 高性能嵌入式平台；",
              "vocab": [
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼飞行器，四轴无人机",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P18-S3",
              "text": "The vehicle successfully reached peak flight velocities of 20 m/s (72 km/h) and centripetal accelerations up to 5g ($49\\text{ m/s}^2$).",
              "translation": "实飞最高速度达到 20 m/s (72 km/h)，向心加速度峰值达 5g ($49\\text{ m/s}^2$)。",
              "vocab": [
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
                  "level": "green"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 19,
          "logicRole": "实飞数据验证与计算耗时对比",
          "mainIdea": "实飞数据印证仿真结论：DFBC 单步仅耗时 0.05 ms（快 50-100 倍），NMPC 耗时 2.5~4.5 ms；撤除 INDI 均出现发散。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P19-S1",
              "text": "Both NMPC+INDI and DFBC+INDI completed the 72 km/h extreme race track with remarkable trajectory overlap.",
              "translation": "NMPC+INDI 与 DFBC+INDI 均成功以 72 km/h 极速刷圈，轨迹重合度极高；",
              "vocab": [
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P19-S2",
              "text": "DFBC requires an execution time of only 0.05 ms per step, whereas NMPC requires 2.5 to 4.5 ms per step, confirming a 50-to-100-fold computational speedup for DFBC.",
              "translation": "DFBC 单步耗时仅 0.05 ms，而 NMPC 单步耗时 2.5 ~ 4.5 ms，证实 DFBC 运算速度快 50~100 倍；",
              "vocab": [
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算上的，计算开销的",
                  "level": "green"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P19-S3",
              "text": "Removing the INDI inner-loop during real flights caused both controllers to diverge in high-speed hairpin turns, validating sensor feedback as an indispensable foundation for agile flight.",
              "translation": "实飞中撤除 INDI 后，两者均在高速发卡弯出现明显发散趋势，充分证实了传感器反馈驱动的增量内环对于极限飞行的必要性。",
              "vocab": [
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red"
                },
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
                  "level": "green"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-discuss",
      "sectionNumber": "六",
      "title": "VI. DISCUSSION & ENGINEERING GUIDELINES",
      "chineseTitle": "六、综合对比与工程选型指南 (VIII. DISCUSSION & CONCLUSION)",
      "paragraphs": [
        {
          "pIndex": 20,
          "logicRole": "全维度综合对比矩阵",
          "mainIdea": "综合对比表格：可行轨迹精度、不可行轨迹表现、单拍计算开销、实现复杂度与执行器硬约束支持。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P20-S1",
              "text": "We summarize the quantitative comparison across five core evaluation metrics between NMPC and DFBC.",
              "translation": "本文从五个核心维度总结 NMPC+INDI 与 DFBC+INDI 的量化评估矩阵：",
              "vocab": [
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P20-S2",
              "text": "1. Normal Feasible Trajectories: Both controllers exhibit identical top-tier accuracy ($RMSE \\approx 0.15\\text{ m}$).",
              "translation": "1. 正常可行轨迹精度：两者并无差异，均达到极高精度（RMSE 约 0.15 m）；",
              "vocab": [
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹，航迹（复数）",
                  "level": "red"
                },
                {
                  "word": "rmse",
                  "ipa": "/ˌɑːr.em.esˈiː/",
                  "meaning": "均方根误差 (Root Mean Square Error)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P20-S3",
              "text": "2. Over-Limit Infeasible Trajectories: NMPC is decisively superior with 48% to 62% lower error, whereas DFBC suffers single-point overshoot.",
              "translation": "2. 超限不可行轨迹表现：NMPC 极其优异（误差低 48~62%），而 DFBC 容易发生单点过冲；",
              "vocab": [
                {
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹，航迹（复数）",
                  "level": "red"
                },
                {
                  "word": "infeasible",
                  "ipa": "/ɪnˈfiːzəbl/",
                  "meaning": "不可行的（如超出执行机构物理极限）",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 4,
              "id": "P20-S4",
              "text": "3. Computational Time: DFBC computes in $0.02 \\sim 0.06\\text{ ms}$ (50-100x faster) versus $1.5 \\sim 5.0\\text{ ms}$ for NMPC.",
              "translation": "3. 单拍计算时间：DFBC 仅需 0.02~0.06 ms（快 50-100 倍），而 NMPC 需 1.5~5.0 ms；",
              "vocab": [
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算上的，计算开销的",
                  "level": "green"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 5,
              "id": "P20-S5",
              "text": "4. Implementation Complexity: DFBC relies on pure algebraic calculus, whereas NMPC requires complex nonlinear solver parameterization.",
              "translation": "4. 数学与实现复杂度：DFBC 为纯解析代数运算极易调试，而 NMPC 需配置非线性求解器与求解边界；",
              "vocab": [
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 6,
              "id": "P20-S6",
              "text": "5. Hard Constraints: NMPC natively enforces multi-step state and input bounds, whereas DFBC relies on single-step QP allocation.",
              "translation": "5. 执行器硬约束支持：NMPC 原生显式支持多步时域平滑约束，DFBC 依赖单拍 QP 分配器。",
              "vocab": [
                {
                  "word": "constraints",
                  "ipa": "/kənˈstreɪnts/",
                  "meaning": "约束条件（硬约束/软约束）",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                },
                {
                  "word": "qp",
                  "ipa": "/ˌkjuːˈpiː/",
                  "meaning": "二次规划 (Quadratic Programming)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 21,
          "logicRole": "工程落地三大选型结论",
          "mainIdea": "高质量规划首选 DFBC+INDI（高性价比），极限边界首选 NMPC，INDI+气动阻力是所有高速控制器的通用基石。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P21-S1",
              "text": "First, for applications with smooth, dynamically feasible trajectory planners, DFBC+INDI provides the optimal trade-off by achieving NMPC-level accuracy at negligible computational cost.",
              "translation": "第一，对于具备高质量规划器、轨迹满足动力学可行性的场景，DFBC+INDI 是性价比最高的黄金组合，以极低算力实现媲美 NMPC 的顶级跟踪精度；",
              "vocab": [
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算上的，计算开销的",
                  "level": "green"
                },
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P21-S2",
              "text": "Second, for highly dynamic missions with unpredictable trajectory mutations or operating on actuator boundaries, NMPC is the only viable choice that proactively avoids saturation breakdown.",
              "translation": "第二，对于环境高度动态、轨迹频繁突变或执行器工作在饱和边缘的极限机动，NMPC 是唯一能够前瞻性规避饱和的控制方案；",
              "vocab": [
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（推力饱和/转速饱和/输出饱和）",
                  "level": "red"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/电调/舵机/推进器）",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P21-S3",
              "text": "Third, the combination of an INDI attitude inner-loop and aerodynamic drag compensation constitutes the universal cornerstone for all high-speed agile flight controllers.",
              "translation": "第三，“INDI 姿态内环 + 空气动力学阻力补偿” 是所有高速敏捷飞行控制器的必备核心基石。",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
                  "level": "green"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
