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
                },
                {
                  "word": "navigation",
                  "ipa": "/ˌnævɪˈɡeɪʃn/",
                  "meaning": "自主导航，定位导航",
                  "level": "red"
                },
                {
                  "word": "essential",
                  "ipa": "ɪˈsenʃ(ə)l",
                  "meaning": "adj.必不可少的；基本的，精髓的 n.必需品；要素，本质",
                  "level": "green"
                },
                {
                  "word": "cluttered",
                  "ipa": "/ˈklʌtəd/",
                  "meaning": "拥挤杂乱的，存在密集障碍物的",
                  "level": "red"
                },
                {
                  "word": "accurate",
                  "ipa": "ˈækjərət",
                  "meaning": "adj. 正确无误的,精确的",
                  "level": "green"
                },
                {
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
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
                  "word": "challenging",
                  "ipa": "ˈtʃælɪndʒɪŋ",
                  "meaning": "adj.具有挑战",
                  "level": "green"
                },
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
                  "meaning": "驱动，执行机构作用",
                  "level": "red"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学，动态特性",
                  "level": "red"
                },
                {
                  "word": "however",
                  "ipa": "/haʊˈevə/",
                  "meaning": "然而、不过（常用释义：无论如何）",
                  "level": "red"
                },
                {
                  "word": "complex",
                  "ipa": "/ˈkɒmpleks/",
                  "meaning": "复杂的，多层次的（常用释义：复杂的；复合的；综合体）",
                  "level": "red"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                },
                {
                  "word": "due",
                  "ipa": "/djuː/",
                  "meaning": "应有的；适当的（常用释义：到期的；预定的；由于）",
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
                  "word": "trajectories",
                  "ipa": "/trəˈdʒektəriz/",
                  "meaning": "轨迹，航迹（复数）",
                  "level": "red"
                },
                {
                  "word": "empirically",
                  "ipa": "/ɪmˈpɪrɪkli/",
                  "meaning": "实证地，通过系统实验地",
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
                  "word": "article",
                  "ipa": "ˈɑːrtɪkəl",
                  "meaning": "n. 文章；物品；冠词 v.见习",
                  "level": "green"
                },
                {
                  "word": "compare",
                  "ipa": "",
                  "meaning": "v.比较，对比；把……比作；相比",
                  "level": "red"
                },
                {
                  "word": "variety",
                  "ipa": "vəˈraɪətɪ",
                  "meaning": "n. 种种，种类",
                  "level": "green"
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
                },
                {
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
                  "level": "red"
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
                  "word": "systematically",
                  "ipa": "/ˌsɪstəˈmætɪkli/",
                  "meaning": "系统地；有条理地（常用释义：有条理地；系统地）",
                  "level": "green"
                },
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算上的，计算开销的",
                  "level": "green"
                },
                {
                  "word": "simulation",
                  "ipa": "ˌsɪmjəˈleɪʃən",
                  "meaning": "n.模仿;模拟",
                  "level": "red"
                },
                {
                  "word": "robustness",
                  "ipa": "/rəʊˈbʌstnəs/",
                  "meaning": "鲁棒性，抗扰稳健性",
                  "level": "red"
                },
                {
                  "word": "efficiency",
                  "ipa": "",
                  "meaning": "n.效率，效能；功率",
                  "level": "red"
                },
                {
                  "word": "evaluate",
                  "ipa": "/ɪˈvæljueɪt/",
                  "meaning": "评估；审查（常用释义：评价；估量）",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "accuracy",
                  "ipa": "/ˈækjərəsi/",
                  "meaning": "准确性（常用释义：准确；精确）",
                  "level": "red"
                },
                {
                  "word": "aspect",
                  "ipa": "ˈæspekt",
                  "meaning": "n. 方面，外观，外表",
                  "level": "green"
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
                  "word": "superiority",
                  "ipa": "suːˌpɪəriˈɒrəti",
                  "meaning": "n.优越；优越感",
                  "level": "green"
                },
                {
                  "word": "convergence",
                  "ipa": "/kənˈvɜːdʒəns/",
                  "meaning": "收敛，收敛性",
                  "level": "red"
                },
                {
                  "word": "infeasible",
                  "ipa": "/ɪnˈfiːzəbl/",
                  "meaning": "不可行的（超出物理极限）",
                  "level": "red"
                },
                {
                  "word": "numerical",
                  "ipa": "nuːˈmɛrɪkəl",
                  "meaning": "adj. 数字的；数值的",
                  "level": "green"
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
                  "word": "dynamic inversion",
                  "ipa": "/daɪˈnæmɪk ɪnˈvɜːʃn/",
                  "meaning": "动态逆控制",
                  "level": "blue"
                },
                {
                  "word": "aerodynamic drag",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk dræɡ/",
                  "meaning": "空气动力学阻力",
                  "level": "blue"
                },
                {
                  "word": "incremental",
                  "ipa": "/ˌɪŋkrəˈmentl/",
                  "meaning": "增量的，逐拍差分的",
                  "level": "blue"
                },
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "drag model",
                  "ipa": "/dræɡ ˈmɒdl/",
                  "meaning": "阻力模型",
                  "level": "blue"
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
                  "word": "inversion",
                  "ipa": "/ɪnˈvɜːʃn/",
                  "meaning": "逆，动态逆求解",
                  "level": "blue"
                },
                {
                  "word": "dynamic",
                  "ipa": "/daɪˈnæmɪk/",
                  "meaning": "动态的，动力学的",
                  "level": "red"
                },
                {
                  "word": "effect",
                  "ipa": "",
                  "meaning": "n.作用，影响；效果，印象；所有物，财产；生效，实行",
                  "level": "red"
                },
                {
                  "word": "method",
                  "ipa": "ˈmeθəd",
                  "meaning": "n. 方法，办法",
                  "level": "green"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力，空气阻力",
                  "level": "red"
                },
                {
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
                  "level": "red"
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
                  "word": "aerodynamic drag",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk dræɡ/",
                  "meaning": "空气动力学阻力",
                  "level": "blue"
                },
                {
                  "word": "motion capture",
                  "ipa": "/ˈməʊʃn ˈkæptʃə/",
                  "meaning": "光学动作捕捉系统 (Vicon/OptiTrack)",
                  "level": "blue"
                },
                {
                  "word": "experiments",
                  "ipa": "/ɪkˈsperɪmənts/",
                  "meaning": "实验（复数）",
                  "level": "green"
                },
                {
                  "word": "demonstrate",
                  "ipa": "/ˈdemənstreɪt/",
                  "meaning": "表明，证明，展示（常用释义：证明；说明；示范；游行示威）",
                  "level": "red"
                },
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "drag model",
                  "ipa": "/dræɡ ˈmɒdl/",
                  "meaning": "阻力模型",
                  "level": "blue"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "reduction",
                  "ipa": "/rɪˈdʌkʃn/",
                  "meaning": "降低，减少",
                  "level": "green"
                },
                {
                  "word": "necessity",
                  "ipa": "/nəˈsesəti/",
                  "meaning": "必要性，不可或缺性",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "capture",
                  "ipa": "/ˈkæptʃə/",
                  "meaning": "概括、体现。（常用释义：捕获；夺取；拍摄；吸引。）",
                  "level": "red"
                },
                {
                  "word": "motion",
                  "ipa": "ˈməʊʃn",
                  "meaning": "n.运动，移动；手势，动作；提议，议案 v.打手势，示意",
                  "level": "green"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green"
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
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力，空气阻力",
                  "level": "red"
                },
                {
                  "word": "one",
                  "ipa": "/wʌn/",
                  "meaning": "其中一个（问题）（常用释义：一；一个人/事物）",
                  "level": "red"
                },
                {
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
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
                  "word": "reconnaissance",
                  "ipa": "/rɪˈkɒnɪsns/",
                  "meaning": "侦察，勘测",
                  "level": "red"
                },
                {
                  "word": "time-critical",
                  "ipa": "/taɪm ˈkrɪtɪkl/",
                  "meaning": "时间紧迫的，时间敏感的",
                  "level": "red"
                },
                {
                  "word": "drone racing",
                  "ipa": "/drəʊn ˈreɪsɪŋ/",
                  "meaning": "无人机竞速，穿越机比赛",
                  "level": "blue"
                },
                {
                  "word": "quadrotors",
                  "ipa": "/ˈkwɒdrəʊtəz/",
                  "meaning": "四旋翼飞行器（复数）",
                  "level": "red"
                },
                {
                  "word": "exploiting",
                  "ipa": "/ɪkˈsplɔɪtɪŋ/",
                  "meaning": "充分利用，挖掘发挥",
                  "level": "red"
                },
                {
                  "word": "missions",
                  "ipa": "/ˈmɪʃnz/",
                  "meaning": "任务（复数）",
                  "level": "green"
                },
                {
                  "word": "agility",
                  "ipa": "/əˈdʒɪləti/",
                  "meaning": "机动性，敏捷度",
                  "level": "red"
                },
                {
                  "word": "crucial",
                  "ipa": "/ˈkruːʃl/",
                  "meaning": "至关重要的，关键的",
                  "level": "red"
                },
                {
                  "word": "search",
                  "ipa": "sɜːtʃ",
                  "meaning": "n./v. 搜寻，搜查",
                  "level": "green"
                },
                {
                  "word": "racing",
                  "ipa": "/ˈreɪsɪŋ/",
                  "meaning": "竞速的，赛车/赛机的",
                  "level": "green"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                },
                {
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
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
                },
                {
                  "word": "high-speed",
                  "ipa": "/haɪ spiːd/",
                  "meaning": "高速的",
                  "level": "green"
                },
                {
                  "word": "cluttered",
                  "ipa": "/ˈklʌtəd/",
                  "meaning": "拥挤杂乱的，存在密集障碍物的",
                  "level": "red"
                },
                {
                  "word": "accurate",
                  "ipa": "ˈækjərət",
                  "meaning": "adj. 正确无误的,精确的",
                  "level": "green"
                },
                {
                  "word": "execute",
                  "ipa": "/ˈeksɪkjuːt/",
                  "meaning": "执行，运行轨迹",
                  "level": "green"
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
                  "meaning": "驱动，执行机构作用",
                  "level": "red"
                },
                {
                  "word": "struggle",
                  "ipa": "ˈstrʌɡl",
                  "meaning": "n. 斗争；v. 奋斗；挣扎",
                  "level": "green"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学，动态特性",
                  "level": "red"
                },
                {
                  "word": "however",
                  "ipa": "/haʊˈevə/",
                  "meaning": "然而、不过（常用释义：无论如何）",
                  "level": "red"
                },
                {
                  "word": "joint",
                  "ipa": "/dʒɔɪnt/",
                  "meaning": "联合的、共同的（常用释义：共同拥有的；关节（n.））",
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
              "vocab": [
                {
                  "word": "invalidate",
                  "ipa": "/ɪnˈvælɪdeɪt/",
                  "meaning": "使无效；宣布法律无效（常用释义：使失去效力）",
                  "level": "red"
                },
                {
                  "word": "maneuvers",
                  "ipa": "/məˈnuːvəz/",
                  "meaning": "机动（复数）",
                  "level": "red"
                },
                {
                  "word": "coupling",
                  "ipa": "/ˈkʌplɪŋ/",
                  "meaning": "耦合，相互作用",
                  "level": "red"
                },
                {
                  "word": "rapid",
                  "ipa": "ˈræpɪd",
                  "meaning": "adj.快,急速的 n.(pl.)急流,湍滩",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P6-S3",
              "text": "Second, rotor blade flapping drag and body drag induce substantial aerodynamic forces that cause severe lateral drift in high-speed turns if neglected.",
              "translation": "第二，高速飞行时旋翼叶片挥舞阻力与机身迎风阻力显著增大，若忽略阻力会导致飞行器在弯道产生严重离心外侧漂移；",
              "vocab": [
                {
                  "word": "flapping drag",
                  "ipa": "/ˈflæpɪŋ dræɡ/",
                  "meaning": "旋翼叶片挥舞阻力",
                  "level": "blue"
                },
                {
                  "word": "substantial",
                  "ipa": "/səbˈstænʃl/",
                  "meaning": "相当大的；显著的（常用释义：大量的；重大的；实质性的）",
                  "level": "red"
                },
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "high-speed",
                  "ipa": "/haɪ spiːd/",
                  "meaning": "高速的",
                  "level": "green"
                },
                {
                  "word": "flapping",
                  "ipa": "/ˈflæpɪŋ/",
                  "meaning": "叶片挥舞，桨叶摆动",
                  "level": "blue"
                },
                {
                  "word": "severe",
                  "ipa": "sɪˈvɪə(r)",
                  "meaning": "adj.严厉的;剧烈的,严重的,严峻的,艰难的",
                  "level": "red"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "旋翼，转子",
                  "level": "blue"
                },
                {
                  "word": "cause",
                  "ipa": "kɔː z",
                  "meaning": "n.原因 n.理由",
                  "level": "green"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "漂移，侧向偏差",
                  "level": "red"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力，空气阻力",
                  "level": "red"
                },
                {
                  "word": "body",
                  "ipa": "ˈbɒdi",
                  "meaning": "n.团体,机构",
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
                  "word": "rotational",
                  "ipa": "/rəʊˈteɪʃənl/",
                  "meaning": "转动的，旋转的",
                  "level": "green"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机/推进器）",
                  "level": "red"
                },
                {
                  "word": "maximum",
                  "ipa": "ˈmæksɪməm",
                  "meaning": "adj./n. 最大量",
                  "level": "green"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red"
                },
                {
                  "word": "third",
                  "ipa": "θɜːd",
                  "meaning": "adj.第三的",
                  "level": "red"
                },
                {
                  "word": "motor",
                  "ipa": "/ˈməʊtə/",
                  "meaning": "电动机，电机",
                  "level": "green"
                },
                {
                  "word": "speed",
                  "ipa": "spiːd",
                  "meaning": "n. 速度 v.（使）加速",
                  "level": "green"
                },
                {
                  "word": "body",
                  "ipa": "ˈbɒdi",
                  "meaning": "n.团体,机构",
                  "level": "red"
                },
                {
                  "word": "rate",
                  "ipa": "reɪt",
                  "meaning": "n.速率;等级;价格,费用 v.估价;评级,评价",
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
                  "word": "community",
                  "ipa": "kəˈmjuːnɪti",
                  "meaning": "n. 社区；共同体；团体",
                  "level": "green"
                },
                {
                  "word": "overcome",
                  "ipa": "əʊvəˈkʌm",
                  "meaning": "v. 克服，解决",
                  "level": "green"
                },
                {
                  "word": "distinct",
                  "ipa": "",
                  "meaning": "adj.不同的，有区别的；清楚的，明显的；确切的",
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
                  "word": "particularly",
                  "ipa": "/pəˈtɪkjələli/",
                  "meaning": "尤其，特别（常用释义：especially; notably）",
                  "level": "red"
                },
                {
                  "word": "algorithmic",
                  "ipa": "/ˌælɡəˈrɪðmɪk/",
                  "meaning": "算法上的",
                  "level": "green"
                },
                {
                  "word": "predictive",
                  "ipa": "/prɪˈdɪktɪv/",
                  "meaning": "预测的，具前瞻性的",
                  "level": "blue"
                },
                {
                  "word": "efficiency",
                  "ipa": "",
                  "meaning": "n.效率，效能；功率",
                  "level": "red"
                },
                {
                  "word": "beneficial",
                  "ipa": "/ˌbenɪˈfɪʃl/",
                  "meaning": "有益的，有利的",
                  "level": "green"
                },
                {
                  "word": "high-speed",
                  "ipa": "/haɪ spiːd/",
                  "meaning": "高速的",
                  "level": "green"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "attention",
                  "ipa": "əˈtenʃ(ə)n",
                  "meaning": "n. 注意，关心",
                  "level": "green"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼飞行器，四轴无人机",
                  "level": "red"
                },
                {
                  "word": "advances",
                  "ipa": "/ədˈvɑːnsɪz/",
                  "meaning": "技术进步，突破",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "excels",
                  "ipa": "/ɪkˈselz/",
                  "meaning": "擅长，在……表现卓越",
                  "level": "red"
                },
                {
                  "word": "nature",
                  "ipa": "/ˈneɪtʃə/",
                  "meaning": "本性，固有特性",
                  "level": "green"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
                  "level": "red"
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
                  "word": "non-predictive",
                  "ipa": "/nɒn prɪˈdɪktɪv/",
                  "meaning": "非预测性的",
                  "level": "blue"
                },
                {
                  "word": "algebraically",
                  "ipa": "/ˌældʒɪˈbreɪɪkli/",
                  "meaning": "代数地，解析地",
                  "level": "green"
                },
                {
                  "word": "demanding",
                  "ipa": "/dɪˈmɑːndɪŋ/",
                  "meaning": "苛刻的，耗费算力的",
                  "level": "red"
                },
                {
                  "word": "ultra-low",
                  "ipa": "ˈʌltrə loʊ",
                  "meaning": "adj. 极低的",
                  "level": "green"
                },
                {
                  "word": "however",
                  "ipa": "/haʊˈevə/",
                  "meaning": "然而、不过（常用释义：无论如何）",
                  "level": "red"
                },
                {
                  "word": "method",
                  "ipa": "ˈmeθəd",
                  "meaning": "n. 方法，办法",
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
                },
                {
                  "word": "flat",
                  "ipa": "/flæt/",
                  "meaning": "平坦的（微分平坦输出）",
                  "level": "green"
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
              "vocab": [
                {
                  "word": "literature",
                  "ipa": "ˈlɪtrətʃʊər",
                  "meaning": "n. 文学",
                  "level": "green"
                },
                {
                  "word": "primary",
                  "ipa": "/ˈpraɪməri/",
                  "meaning": "主要的；基本的（常用释义：首要的；初级的；初选的）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P8-S2",
              "text": "1. We perform the first direct benchmark between NMPC and modified DFBC in extreme agile flights up to 20 m/s (72 km/h).",
              "translation": "1. 首次在高达 20 m/s 的极限实飞速度下，对 NMPC 与改进型 DFBC 进行全方位同台基准测试；",
              "vocab": [
                {
                  "word": "benchmark",
                  "ipa": "/ˈbentʃmɑːk/",
                  "meaning": "基准测试，性能标杆",
                  "level": "blue"
                },
                {
                  "word": "perform",
                  "ipa": "pəˈfɔːm",
                  "meaning": "v.履行,执行;表演,演出;完成(事业)",
                  "level": "red"
                },
                {
                  "word": "extreme",
                  "ipa": "ɪkˈstriːm",
                  "meaning": "adj. 极其的，非常的",
                  "level": "green"
                },
                {
                  "word": "direct",
                  "ipa": "/dəˈrekt/",
                  "meaning": "引导；掌控；使朝某方向发展（常用释义：adj. 直接的；v. 指挥、指导、管理）",
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
              "sIndex": 3,
              "id": "P8-S3",
              "text": "2. We formulate a unified control architecture integrating sensor-based INDI inner-loop acceleration feedback with aerodynamic drag compensation.",
              "translation": "2. 提出将增量非线性动态逆（INDI）内环与空气动力学阻力模型统一融入 NMPC 和 DFBC 控制架构；",
              "vocab": [
                {
                  "word": "aerodynamic drag",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk dræɡ/",
                  "meaning": "空气动力学阻力",
                  "level": "blue"
                },
                {
                  "word": "architecture",
                  "ipa": "/ˈɑːkɪtektʃə/",
                  "meaning": "结构；构造（常用释义：建筑；建筑学；结构）",
                  "level": "red"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "compensation",
                  "ipa": "ˌkɑmpənˈseɪʃən",
                  "meaning": "n.补偿(或赔偿)的款物;补偿,赔偿",
                  "level": "red"
                },
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
                  "word": "formulate",
                  "ipa": "ˈfɔːrmjuleɪt",
                  "meaning": "v. 制定；规划；确切表达",
                  "level": "green"
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
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力，空气阻力",
                  "level": "red"
                },
                {
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
                  "level": "red"
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
                  "word": "systematically",
                  "ipa": "/ˌsɪstəˈmætɪkli/",
                  "meaning": "系统地；有条理地（常用释义：有条理地；系统地）",
                  "level": "green"
                },
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
                  "word": "performance",
                  "ipa": "pəˈfɔːm",
                  "meaning": "n. 演出，表演",
                  "level": "green"
                },
                {
                  "word": "infeasible",
                  "ipa": "/ɪnˈfiːzəbl/",
                  "meaning": "不可行的（超出物理极限）",
                  "level": "red"
                },
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（推力饱和/转速饱和/输出饱和）",
                  "level": "red"
                },
                {
                  "word": "parameter",
                  "ipa": "/pəˈræmɪtə/",
                  "meaning": "参数",
                  "level": "green"
                },
                {
                  "word": "evaluate",
                  "ipa": "/ɪˈvæljueɪt/",
                  "meaning": "评估；审查（常用释义：评价；估量）",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "feasible",
                  "ipa": "/ˈfiːzəbl/",
                  "meaning": "可行的（在物理约束范围内）",
                  "level": "green"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机/推进器）",
                  "level": "red"
                },
                {
                  "word": "versus",
                  "ipa": "ˈvɜːsəs",
                  "meaning": "prep.以…为对手；与…相对",
                  "level": "green"
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
              "vocab": [
                {
                  "word": "inertial",
                  "ipa": "/ɪˈnɜːʃl/",
                  "meaning": "惯性的",
                  "level": "red"
                },
                {
                  "word": "frame",
                  "ipa": "freɪm",
                  "meaning": "n.框架；构架，支架；体格，骨架 v.装框架；作伪证陷害；拟",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P9-S2",
              "text": "Quadrotor 6-DOF rigid-body dynamics are governed by translational kinematics $\\dot{\\boldsymbol{\\xi}} = \\boldsymbol{v}$ and Newton's second law: $m \\dot{\\boldsymbol{v}} = m \\boldsymbol{g}_W + \\boldsymbol{R} \\boldsymbol{f}_B + \\boldsymbol{f}_a$.",
              "translation": "四旋翼刚体动力学由线速度运动学 $\\dot{\\boldsymbol{\\xi}} = \\boldsymbol{v}$ 与牛顿第二定律描述：$m \\dot{\\boldsymbol{v}} = m \\boldsymbol{g}_W + \\boldsymbol{R} \\boldsymbol{f}_B + \\boldsymbol{f}_a$。",
              "vocab": [
                {
                  "word": "translational",
                  "ipa": "/trænzˈleɪʃənl/",
                  "meaning": "平移的，平动维度的",
                  "level": "green"
                },
                {
                  "word": "kinematics",
                  "ipa": "/ˌkɪnəˈmætɪks/",
                  "meaning": "运动学（纯几何与时间关系）",
                  "level": "red"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼飞行器，四轴无人机",
                  "level": "red"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学，动态特性",
                  "level": "red"
                },
                {
                  "word": "governed",
                  "ipa": "/ˈɡʌvnd/",
                  "meaning": "受……支配，遵循（物理方程）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P9-S3",
              "text": "Attitude kinematics and rotational dynamics are expressed as $\\dot{\\boldsymbol{q}} = \\frac{1}{2} \\boldsymbol{q} \\otimes \\begin{bmatrix} 0 \\\\ \\boldsymbol{\\Omega}_B \\end{bmatrix}$ and $\\boldsymbol{J} \\dot{\\boldsymbol{\\Omega}}_B = \\boldsymbol{\\tau}_B - \\boldsymbol{\\Omega}_B \\times (\\boldsymbol{J} \\boldsymbol{\\Omega}_B)$.",
              "translation": "姿态四元数运动学与欧拉转动方程为：$\\dot{\\boldsymbol{q}} = \\frac{1}{2} \\boldsymbol{q} \\otimes \\begin{bmatrix} 0 \\\\ \\boldsymbol{\\Omega}_B \\end{bmatrix}$ 以及 $\\boldsymbol{J} \\dot{\\boldsymbol{\\Omega}}_B = \\boldsymbol{\\tau}_B - \\boldsymbol{\\Omega}_B \\times (\\boldsymbol{J} \\boldsymbol{\\Omega}_B)$。",
              "vocab": [
                {
                  "word": "kinematics",
                  "ipa": "/ˌkɪnəˈmætɪks/",
                  "meaning": "运动学（纯几何与时间关系）",
                  "level": "red"
                },
                {
                  "word": "rotational",
                  "ipa": "/rəʊˈteɪʃənl/",
                  "meaning": "转动的，旋转的",
                  "level": "green"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学，动态特性",
                  "level": "red"
                }
              ]
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
              "vocab": [
                {
                  "word": "position",
                  "ipa": "/pəˈzɪʃn/",
                  "meaning": "位置，空间坐标",
                  "level": "green"
                },
                {
                  "word": "velocity",
                  "ipa": "/vəˈlɒsəti/",
                  "meaning": "速度，线速度",
                  "level": "green"
                },
                {
                  "word": "frame",
                  "ipa": "freɪm",
                  "meaning": "n.框架；构架，支架；体格，骨架 v.装框架；作伪证陷害；拟",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P10-S2",
              "text": "The rotation matrix $\\boldsymbol{R} \\in SO(3)$ maps body coordinates to world coordinates parameterized by unit quaternion $\\boldsymbol{q} = [q_w, q_x, q_y, q_z]^T$.",
              "translation": "$\\boldsymbol{R} \\in SO(3)$ 为从机体系到世界系的旋转矩阵，$\\boldsymbol{q} = [q_w, q_x, q_y, q_z]^T$ 为姿态四元数；",
              "vocab": [
                {
                  "word": "parameterized",
                  "ipa": "/pəˈræmɪtəraɪzd/",
                  "meaning": "参数化的",
                  "level": "green"
                },
                {
                  "word": "quaternion",
                  "ipa": "/kwəˈtɜːniən/",
                  "meaning": "四元数（无奇异性表示 3D 旋转）",
                  "level": "red"
                },
                {
                  "word": "rotation",
                  "ipa": "/rəʊˈteɪʃn/",
                  "meaning": "旋转",
                  "level": "green"
                },
                {
                  "word": "body",
                  "ipa": "ˈbɒdi",
                  "meaning": "n.团体,机构",
                  "level": "red"
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
                  "word": "collective",
                  "ipa": "kəˈlektɪv",
                  "meaning": "adj.集体的，共同的；集合的 n.集体农庄，集体企业",
                  "level": "green"
                },
                {
                  "word": "torques",
                  "ipa": "/tɔːks/",
                  "meaning": "力矩（复数）",
                  "level": "red"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red"
                },
                {
                  "word": "rotors",
                  "ipa": "/ˈrəʊtəz/",
                  "meaning": "转子（复数）",
                  "level": "blue"
                },
                {
                  "word": "total",
                  "ipa": "ˈtəʊt(ə)l",
                  "meaning": "adj. 总数的;总括的;完",
                  "level": "green"
                },
                {
                  "word": "body",
                  "ipa": "ˈbɒdi",
                  "meaning": "n.团体,机构",
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
                  "word": "aerodynamic drag",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk dræɡ/",
                  "meaning": "空气动力学阻力",
                  "level": "blue"
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
                  "meaning": "阻力，空气阻力",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P11-S2",
              "text": "We adopt a wind-tunnel validated diagonal lumped drag model: $\\boldsymbol{f}_a = - \\boldsymbol{R} \\boldsymbol{D}_v \\boldsymbol{R}^T \\boldsymbol{v}$.",
              "translation": "本文采用经过风洞实验验证的复合阻力模型：$\\boldsymbol{f}_a = - \\boldsymbol{R} \\boldsymbol{D}_v \\boldsymbol{R}^T \\boldsymbol{v}$。",
              "vocab": [
                {
                  "word": "wind-tunnel",
                  "ipa": "/wɪnd ˈtʌnl/",
                  "meaning": "风洞",
                  "level": "blue"
                },
                {
                  "word": "drag model",
                  "ipa": "/dræɡ ˈmɒdl/",
                  "meaning": "阻力模型",
                  "level": "blue"
                },
                {
                  "word": "validated",
                  "ipa": "/ˈvælɪdeɪtɪd/",
                  "meaning": "经过实验验证的",
                  "level": "green"
                },
                {
                  "word": "diagonal",
                  "ipa": "/daɪˈæɡənl/",
                  "meaning": "对角的，对角矩阵的",
                  "level": "green"
                },
                {
                  "word": "lumped",
                  "ipa": "/lʌmpt/",
                  "meaning": "集总的，复合等效的",
                  "level": "blue"
                },
                {
                  "word": "adopt",
                  "ipa": "əˈdɔpt",
                  "meaning": "v. 收养，领养",
                  "level": "green"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力，空气阻力",
                  "level": "red"
                },
                {
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P11-S3",
              "text": "The matrix $\\boldsymbol{D}_v = \\text{diag}(d_x, d_y, d_z)$ encompasses both rotor blade flapping drag and fuselage parasitic drag.",
              "translation": "其中 $\\boldsymbol{D}_v = \\text{diag}(d_x, d_y, d_z)$ 为对角空气阻力系数矩阵，显式包含了转子叶片挥舞阻力与机身迎风阻力。",
              "vocab": [
                {
                  "word": "parasitic drag",
                  "ipa": "/ˌpærəˈsɪtɪk dræɡ/",
                  "meaning": "机身寄生阻力（迎风阻力）",
                  "level": "blue"
                },
                {
                  "word": "flapping drag",
                  "ipa": "/ˈflæpɪŋ dræɡ/",
                  "meaning": "旋翼叶片挥舞阻力",
                  "level": "blue"
                },
                {
                  "word": "encompasses",
                  "ipa": "/ɪnˈkʌmpəsɪz/",
                  "meaning": "包含，囊括",
                  "level": "red"
                },
                {
                  "word": "parasitic",
                  "ipa": "/ˌpærəˈsɪtɪk/",
                  "meaning": "寄生的，附带的（如寄生阻力）",
                  "level": "red"
                },
                {
                  "word": "flapping",
                  "ipa": "/ˈflæpɪŋ/",
                  "meaning": "叶片挥舞，桨叶摆动",
                  "level": "blue"
                },
                {
                  "word": "fuselage",
                  "ipa": "/ˈfjuːzəlɑːʒ/",
                  "meaning": "机身，机体结构",
                  "level": "red"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "旋翼，转子",
                  "level": "blue"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力，空气阻力",
                  "level": "red"
                }
              ]
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
                  "word": "shooting nodes",
                  "ipa": "/ˈʃuːtɪŋ nəʊdz/",
                  "meaning": "打靶节点，离散区间节点",
                  "level": "blue"
                },
                {
                  "word": "discretizes",
                  "ipa": "/dɪˈskriːtaɪzɪz/",
                  "meaning": "离散化（第三人称单数）",
                  "level": "blue"
                },
                {
                  "word": "constrained",
                  "ipa": "/kənˈstreɪnd/",
                  "meaning": "受约束的",
                  "level": "red"
                },
                {
                  "word": "prediction",
                  "ipa": "/prɪˈdɪkʃn/",
                  "meaning": "预测，时域预测",
                  "level": "green"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "shooting",
                  "ipa": "/ˈʃuːtɪŋ/",
                  "meaning": "打靶法",
                  "level": "blue"
                },
                {
                  "word": "horizon",
                  "ipa": "/həˈraɪzn/",
                  "meaning": "时域，预测时域 (Prediction Horizon)",
                  "level": "red"
                },
                {
                  "word": "nodes",
                  "ipa": "/nəʊdz/",
                  "meaning": "节点（复数）",
                  "level": "green"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
                  "level": "red"
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
                },
                {
                  "word": "transition",
                  "ipa": "/trænˈzɪʃn/",
                  "meaning": "过渡，姿态翻转过渡",
                  "level": "green"
                },
                {
                  "word": "individual",
                  "ipa": "/ˌɪndɪˈvɪdʒuəl/",
                  "meaning": "个体的；个体（常用释义：个人；个别的）",
                  "level": "green"
                },
                {
                  "word": "enforce",
                  "ipa": "/ɪnˈfɔːs/",
                  "meaning": "执行、实施法律（常用释义：强制执行）",
                  "level": "red"
                },
                {
                  "word": "thrusts",
                  "ipa": "/θrʌsts/",
                  "meaning": "推力（复数）",
                  "level": "red"
                },
                {
                  "word": "state",
                  "ipa": "/steɪt/",
                  "meaning": "正式陈述；说明（常用释义：状态；州；国家；陈述）",
                  "level": "red"
                },
                {
                  "word": "motor",
                  "ipa": "/ˈməʊtə/",
                  "meaning": "电动机，电机",
                  "level": "green"
                },
                {
                  "word": "body",
                  "ipa": "ˈbɒdi",
                  "meaning": "n.团体,机构",
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
                  "word": "sequential quadratic programming",
                  "ipa": "/sɪˈkwenʃl kwɒˈdrætɪk ˈprəʊɡræmɪŋ/",
                  "meaning": "序列二次规划 (SQP)",
                  "level": "blue"
                },
                {
                  "word": "quadratic programming",
                  "ipa": "/kwɒˈdrætɪk ˈprəʊɡræmɪŋ/",
                  "meaning": "二次规划 (QP)",
                  "level": "blue"
                },
                {
                  "word": "real-time iteration",
                  "ipa": "/rɪəl taɪm ˌɪtəˈreɪʃn/",
                  "meaning": "实时迭代 (RTI)",
                  "level": "blue"
                },
                {
                  "word": "code generation",
                  "ipa": "/kəʊd ˌdʒenəˈreɪʃn/",
                  "meaning": "自动代码生成",
                  "level": "blue"
                },
                {
                  "word": "programming",
                  "ipa": "/ˈprəʊɡræmɪŋ/",
                  "meaning": "规划（数学规划）；编程",
                  "level": "green"
                },
                {
                  "word": "generation",
                  "ipa": "/ˌdʒenəˈreɪʃn/",
                  "meaning": "生成，产生",
                  "level": "green"
                },
                {
                  "word": "execution",
                  "ipa": "/ˌeksɪˈkjuːʃn/",
                  "meaning": "执行，运算执行",
                  "level": "green"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的，平方的",
                  "level": "green"
                },
                {
                  "word": "iteration",
                  "ipa": "/ˌɪtəˈreɪʃn/",
                  "meaning": "迭代，递推步骤",
                  "level": "green"
                },
                {
                  "word": "sqp-rti",
                  "ipa": "/ˌes.kjuːˈpiː ˌɑːr.tiːˈaɪ/",
                  "meaning": "实时迭代序列二次规划算法",
                  "level": "blue"
                },
                {
                  "word": "acados",
                  "ipa": "/əˈkɑːdɒs/",
                  "meaning": "高性能非线性嵌入式最优控制求解器库",
                  "level": "blue"
                },
                {
                  "word": "code",
                  "ipa": "koʊd",
                  "meaning": "n. 代码；编码；密码 v. 编码",
                  "level": "green"
                },
                {
                  "word": "via",
                  "ipa": "ˈvaɪə",
                  "meaning": "prep.经由；通过，借助于（某种手段或人）",
                  "level": "green"
                },
                {
                  "word": "c",
                  "ipa": "细节推断题",
                  "meaning": "Jefferson 私下厌恶奴隶制，却从制度中获益并扩展奴隶制，同时又释放 Hemings 的孩子，态度复杂。（常用释义：A 因果无依据；B 过度推断父亲身份为原因；D 原文未说玷污声望。）",
                  "level": "red"
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
                  "word": "aerodynamic drag",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk dræɡ/",
                  "meaning": "空气动力学阻力",
                  "level": "blue"
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
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                },
                {
                  "word": "flat",
                  "ipa": "/flæt/",
                  "meaning": "平坦的（微分平坦输出）",
                  "level": "green"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力，空气阻力",
                  "level": "red"
                },
                {
                  "word": "net",
                  "ipa": "net",
                  "meaning": "n. 网；净额；网络 adj. 净得的 v. 净赚；设法获得",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P13-S2",
              "text": "The desired body $z_B$ axis is analytically computed as $\\boldsymbol{z}_{B,\\text{des}} = \\frac{\\boldsymbol{a}_{\\text{des}}}{\\|\\boldsymbol{a}_{\\text{des}}\\|}$.",
              "translation": "由此解得期望机体 $z_B$ 轴方向：$\\boldsymbol{z}_{B,\\text{des}} = \\frac{\\boldsymbol{a}_{\\text{des}}}{\\|\\boldsymbol{a}_{\\text{des}}\\|}$。",
              "vocab": [
                {
                  "word": "analytically",
                  "ipa": "/ˌænəˈlɪtɪkli/",
                  "meaning": "以分析的方式（常用释义：分析地；解析地）",
                  "level": "red"
                },
                {
                  "word": "body",
                  "ipa": "ˈbɒdi",
                  "meaning": "n.团体,机构",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P13-S3",
              "text": "Differentiating $\\boldsymbol{a}_{\\text{des}}$ twice yields trajectory jerk and snap, resolving desired body rates $\\boldsymbol{\\Omega}_{B,\\text{des}}$ and angular accelerations $\\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}}$ without numerical optimization.",
              "translation": "通过对 $\\boldsymbol{a}_{\\text{des}}$ 进行二阶求导（涉及轨迹加加速度 Jerk 与加加加速度 Snap），可解析求出期望角速度 $\\boldsymbol{\\Omega}_{B,\\text{des}}$ 与期望角加速度 $\\dot{\\boldsymbol{\\Omega}}_{B,\\text{des}}$。",
              "vocab": [
                {
                  "word": "differentiating",
                  "ipa": "/ˌdɪfəˈrenʃieɪtɪŋ/",
                  "meaning": "求导中，微分运算",
                  "level": "green"
                },
                {
                  "word": "accelerations",
                  "ipa": "/əkˌseləˈreɪʃnz/",
                  "meaning": "加速度（复数）",
                  "level": "green"
                },
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "numerical",
                  "ipa": "nuːˈmɛrɪkəl",
                  "meaning": "adj. 数字的；数值的",
                  "level": "green"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green"
                },
                {
                  "word": "jerk",
                  "ipa": "/dʒɜːk/",
                  "meaning": "加加速度（加速度对时间的一阶导数）",
                  "level": "blue"
                },
                {
                  "word": "snap",
                  "ipa": "/snæp/",
                  "meaning": "加加加速度（位置对时间的四阶导数）",
                  "level": "blue"
                },
                {
                  "word": "body",
                  "ipa": "ˈbɒdi",
                  "meaning": "n.团体,机构",
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
                  "word": "quadratic programming",
                  "ipa": "/kwɒˈdrætɪk ˈprəʊɡræmɪŋ/",
                  "meaning": "二次规划 (QP)",
                  "level": "blue"
                },
                {
                  "word": "prioritizing",
                  "ipa": "/praɪˈɒrətaɪzɪŋ/",
                  "meaning": "优先保证，优先分配",
                  "level": "green"
                },
                {
                  "word": "programming",
                  "ipa": "/ˈprəʊɡræmɪŋ/",
                  "meaning": "规划（数学规划）；编程",
                  "level": "green"
                },
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（推力饱和/转速饱和/输出饱和）",
                  "level": "red"
                },
                {
                  "word": "collective",
                  "ipa": "kəˈlektɪv",
                  "meaning": "adj.集体的，共同的；集合的 n.集体农庄，集体企业",
                  "level": "green"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的，平方的",
                  "level": "green"
                },
                {
                  "word": "allocator",
                  "ipa": "/ˈæləkeɪtə/",
                  "meaning": "分配器（如控制力矩分配器）",
                  "level": "blue"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red"
                },
                {
                  "word": "torque",
                  "ipa": "/tɔːk/",
                  "meaning": "力矩，转矩",
                  "level": "red"
                },
                {
                  "word": "motor",
                  "ipa": "/ˈməʊtə/",
                  "meaning": "电动机，电机",
                  "level": "green"
                },
                {
                  "word": "qp",
                  "ipa": "/ˌkjuːˈpiː/",
                  "meaning": "二次规划 (Quadratic Programming)",
                  "level": "blue"
                },
                {
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
                  "level": "red"
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
                  "word": "disturbances",
                  "ipa": "/dɪˈstɜːbənsɪz/",
                  "meaning": "扰动（复数）",
                  "level": "red"
                },
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
                  "meaning": "级联的（外环级联内环）",
                  "level": "blue"
                },
                {
                  "word": "isolate",
                  "ipa": "",
                  "meaning": "v.隔离；孤立；脱离；将……剔出;分离；使离析",
                  "level": "red"
                },
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "惯量，惯性",
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
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
                  "level": "red"
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
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "virtual",
                  "ipa": "ˈvɜːrtʃuəl",
                  "meaning": "adj. 虚拟的；实质上的",
                  "level": "green"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green"
                },
                {
                  "word": "command",
                  "ipa": "kəˈmænd",
                  "meaning": "n./v. 命令",
                  "level": "green"
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
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "synthesizing",
                  "ipa": "/ˈsɪnθəsaɪzɪŋ/",
                  "meaning": "合成控制律中",
                  "level": "red"
                },
                {
                  "word": "filtered",
                  "ipa": "/ˈfɪltəd/",
                  "meaning": "已滤波的",
                  "level": "green"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red"
                },
                {
                  "word": "directly",
                  "ipa": "/dəˈrektli/",
                  "meaning": "直接地（常用释义：径直；正好）",
                  "level": "red"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green"
                },
                {
                  "word": "torque",
                  "ipa": "/tɔːk/",
                  "meaning": "力矩，转矩",
                  "level": "red"
                },
                {
                  "word": "motor",
                  "ipa": "/ˈməʊtə/",
                  "meaning": "电动机，电机",
                  "level": "green"
                },
                {
                  "word": "escs",
                  "ipa": "/ˌiː.esˈsiːz/",
                  "meaning": "电子调速器（复数）",
                  "level": "blue"
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
                  "word": "encompasses",
                  "ipa": "/ɪnˈkʌmpəsɪz/",
                  "meaning": "包含，囊括",
                  "level": "red"
                },
                {
                  "word": "challenging",
                  "ipa": "ˈtʃælɪndʒɪŋ",
                  "meaning": "adj.具有挑战",
                  "level": "green"
                },
                {
                  "word": "simulation",
                  "ipa": "ˌsɪmjəˈleɪʃən",
                  "meaning": "n.模仿;模拟",
                  "level": "red"
                },
                {
                  "word": "evaluation",
                  "ipa": "/ɪˌvæljuˈeɪʃən/",
                  "meaning": "评估；评价（常用释义：评价；估计；评估）",
                  "level": "red"
                },
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "benchmarks",
                  "ipa": "/ˈbentʃmɑːks/",
                  "meaning": "基准测试（复数）",
                  "level": "blue"
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
                  "word": "hairpin turns",
                  "ipa": "/ˈheəpɪn tɜːnz/",
                  "meaning": "发卡弯急转",
                  "level": "blue"
                },
                {
                  "word": "drone racing",
                  "ipa": "/drəʊn ˈreɪsɪŋ/",
                  "meaning": "无人机竞速，穿越机比赛",
                  "level": "blue"
                },
                {
                  "word": "high-speed",
                  "ipa": "/haɪ spiːd/",
                  "meaning": "高速的",
                  "level": "green"
                },
                {
                  "word": "hairpin",
                  "ipa": "/ˈheəpɪn/",
                  "meaning": "发卡弯（极急剧的急转弯道）",
                  "level": "red"
                },
                {
                  "word": "racing",
                  "ipa": "/ˈreɪsɪŋ/",
                  "meaning": "竞速的，赛车/赛机的",
                  "level": "green"
                },
                {
                  "word": "track",
                  "ipa": "/træk/",
                  "meaning": "轨迹；路径（常用释义：轨道；小路；痕迹；发展路线）",
                  "level": "red"
                },
                {
                  "word": "dives",
                  "ipa": "/daɪvz/",
                  "meaning": "俯冲（复数）",
                  "level": "green"
                },
                {
                  "word": "race",
                  "ipa": "reɪs",
                  "meaning": "n. 种族，民族 v. （速度）",
                  "level": "green"
                },
                {
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
                  "level": "red"
                },
                {
                  "word": "b",
                  "ipa": "推断题",
                  "meaning": "early days 对应 the country’s infancy；delicate situations 对应 fragile nature 与 moral compromises。（常用释义：A 范围扩大；C 无中生有且反向理解；D 把建国早期扩大为 throughout U.S. history。）",
                  "level": "red"
                },
                {
                  "word": "c",
                  "ipa": "细节推断题",
                  "meaning": "Jefferson 私下厌恶奴隶制，却从制度中获益并扩展奴隶制，同时又释放 Hemings 的孩子，态度复杂。（常用释义：A 因果无依据；B 过度推断父亲身份为原因；D 原文未说玷污声望。）",
                  "level": "red"
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
                },
                {
                  "word": "transitions",
                  "ipa": "/trænˈzɪʃnz/",
                  "meaning": "过渡机动（复数）",
                  "level": "green"
                },
                {
                  "word": "altitude",
                  "ipa": "ˈæltɪtjuːd;(US)ælˈtɪtuːd",
                  "meaning": "n. 海",
                  "level": "green"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "rapid",
                  "ipa": "ˈræpɪd",
                  "meaning": "adj.快,急速的 n.(pl.)急流,湍滩",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 4,
              "id": "P15-S4",
              "text": "3. Aerobatic looping and barrel rolls containing full 360-degree attitude rotations.",
              "translation": "3. 包含 360° 滚转与俯冲回环的极限特技动作（Looping & Barrel Roll）。",
              "vocab": [
                {
                  "word": "barrel rolls",
                  "ipa": "/ˈbærəl rəʊlz/",
                  "meaning": "滚桶机动（复数）",
                  "level": "red"
                },
                {
                  "word": "rotations",
                  "ipa": "/rəʊˈteɪʃnz/",
                  "meaning": "旋转（复数）",
                  "level": "green"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "looping",
                  "ipa": "/ˈluːpɪŋ/",
                  "meaning": "特技回环，竖直大筋斗机动",
                  "level": "red"
                }
              ]
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
                  "word": "identical",
                  "ipa": "",
                  "meaning": "adj.完全相同的；同一的；同卵的；恒等的",
                  "level": "red"
                },
                {
                  "word": "feasible",
                  "ipa": "/ˈfiːzəbl/",
                  "meaning": "可行的（在物理约束范围内）",
                  "level": "green"
                },
                {
                  "word": "position",
                  "ipa": "/pəˈzɪʃn/",
                  "meaning": "位置，空间坐标",
                  "level": "green"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "accuracy",
                  "ipa": "/ˈækjərəsi/",
                  "meaning": "准确性（常用释义：准确；精确）",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
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
                  "meaning": "不可行的（超出物理极限）",
                  "level": "red"
                },
                {
                  "word": "position",
                  "ipa": "/pəˈzɪʃn/",
                  "meaning": "位置，空间坐标",
                  "level": "green"
                },
                {
                  "word": "heading",
                  "ipa": "/ˈhedɪŋ/",
                  "meaning": "航向角，朝向",
                  "level": "red"
                },
                {
                  "word": "whereas",
                  "ipa": "ˌwerˈæz",
                  "meaning": "conj.（表示对比）但是，然而；鉴于",
                  "level": "green"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "旋翼，转子",
                  "level": "blue"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
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
              "id": "P16-S3",
              "text": "NMPC achieves a 48% reduction in position error and a 62% reduction in heading error because its multi-step predictive horizon proactively decelerates before sharp turns to avoid severe saturation breakdown.",
              "translation": "结论：NMPC 位置误差比 DFBC 低 48%，航向误差低 62%。因为 NMPC 具有未来多步预测能力，能提前减速过弯避免剧烈饱和崩溃。",
              "vocab": [
                {
                  "word": "predictive",
                  "ipa": "/prɪˈdɪktɪv/",
                  "meaning": "预测的，具前瞻性的",
                  "level": "blue"
                },
                {
                  "word": "saturation",
                  "ipa": "/ˌsætʃəˈreɪʃn/",
                  "meaning": "饱和（推力饱和/转速饱和/输出饱和）",
                  "level": "red"
                },
                {
                  "word": "reduction",
                  "ipa": "/rɪˈdʌkʃn/",
                  "meaning": "降低，减少",
                  "level": "green"
                },
                {
                  "word": "position",
                  "ipa": "/pəˈzɪʃn/",
                  "meaning": "位置，空间坐标",
                  "level": "green"
                },
                {
                  "word": "heading",
                  "ipa": "/ˈhedɪŋ/",
                  "meaning": "航向角，朝向",
                  "level": "red"
                },
                {
                  "word": "horizon",
                  "ipa": "/həˈraɪzn/",
                  "meaning": "时域，预测时域 (Prediction Horizon)",
                  "level": "red"
                },
                {
                  "word": "severe",
                  "ipa": "sɪˈvɪə(r)",
                  "meaning": "adj.严厉的;剧烈的,严重的,严峻的,艰难的",
                  "level": "red"
                },
                {
                  "word": "sharp",
                  "ipa": "ʃɑːp",
                  "meaning": "adj.锋利的;轮廓分明的;急转的 adv.(指时刻)正",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
                  "level": "red"
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
                  "meaning": "振荡，抖动（复数）",
                  "level": "red"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "ablation",
                  "ipa": "/æbˈleɪʃn/",
                  "meaning": "消融实验（逐个模块剥离对比验证）",
                  "level": "red"
                },
                {
                  "word": "standard",
                  "ipa": "/ˈstændəd/",
                  "meaning": "通行的；公认权威的（常用释义：标准的；标准；普通规格的）",
                  "level": "red"
                },
                {
                  "word": "position",
                  "ipa": "/pəˈzɪʃn/",
                  "meaning": "位置，空间坐标",
                  "level": "green"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "reduces",
                  "ipa": "/rɪˈdjuːsɪz/",
                  "meaning": "降低（第三人称单数）",
                  "level": "green"
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
                },
                {
                  "word": "pid",
                  "ipa": "/ˌpiː.aɪˈdiː/",
                  "meaning": "比例-积分-微分控制器 (Proportional-Integral-Derivative)",
                  "level": "blue"
                },
                {
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
                  "level": "red"
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
                  "word": "aerodynamic drag",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk dræɡ/",
                  "meaning": "空气动力学阻力",
                  "level": "blue"
                },
                {
                  "word": "insufficient",
                  "ipa": "ˌɪnsəˈfɪʃənt",
                  "meaning": "adj. 不充分的；不足的",
                  "level": "green"
                },
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
                  "word": "centripetal",
                  "ipa": "/senˈtrɪpɪtl/",
                  "meaning": "向心的，向心加速度的",
                  "level": "red"
                },
                {
                  "word": "cornering",
                  "ipa": "/ˈkɔːnərɪŋ/",
                  "meaning": "弯道过弯，转向机动",
                  "level": "green"
                },
                {
                  "word": "converges",
                  "ipa": "/kənˈvɜːdʒɪz/",
                  "meaning": "收敛（第三人称单数）",
                  "level": "red"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "漂移，侧向偏差",
                  "level": "red"
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力，空气阻力",
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
                  "meaning": "光学动作捕捉系统 (Vicon/OptiTrack)",
                  "level": "blue"
                },
                {
                  "word": "experiments",
                  "ipa": "/ɪkˈsperɪmənts/",
                  "meaning": "实验（复数）",
                  "level": "green"
                },
                {
                  "word": "capture",
                  "ipa": "/ˈkæptʃə/",
                  "meaning": "概括、体现。（常用释义：捕获；夺取；拍摄；吸引。）",
                  "level": "red"
                },
                {
                  "word": "motion",
                  "ipa": "ˈməʊʃn",
                  "meaning": "n.运动，移动；手势，动作；提议，议案 v.打手势，示意",
                  "level": "green"
                },
                {
                  "word": "vicon",
                  "ipa": "/ˈvaɪkɒn/",
                  "meaning": "Vicon 高精度光学动捕系统",
                  "level": "blue"
                },
                {
                  "word": "hall",
                  "ipa": "hɔːl",
                  "meaning": "n.过道,走廊",
                  "level": "red"
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
                  "word": "thrust-to-weight ratio",
                  "ipa": "/θrʌst tuː weɪt ˈreɪʃiəʊ/",
                  "meaning": "推重比",
                  "level": "blue"
                },
                {
                  "word": "thrust-to-weight",
                  "ipa": "/θrʌst tuː weɪt/",
                  "meaning": "推重比 (TWR)",
                  "level": "blue"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼飞行器，四轴无人机",
                  "level": "red"
                },
                {
                  "word": "vehicle",
                  "ipa": "ˈviːɪkl",
                  "meaning": "n.车辆,交通工具;媒介,载体",
                  "level": "red"
                },
                {
                  "word": "racing",
                  "ipa": "/ˈreɪsɪŋ/",
                  "meaning": "竞速的，赛车/赛机的",
                  "level": "green"
                },
                {
                  "word": "ratio",
                  "ipa": "/ˈreɪʃiəʊ/",
                  "meaning": "比率，比例",
                  "level": "green"
                },
                {
                  "word": "peak",
                  "ipa": "/piːk/",
                  "meaning": "高峰；顶峰（常用释义：山峰；达到顶点）",
                  "level": "red"
                },
                {
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
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
                  "word": "accelerations",
                  "ipa": "/əkˌseləˈreɪʃnz/",
                  "meaning": "加速度（复数）",
                  "level": "green"
                },
                {
                  "word": "centripetal",
                  "ipa": "/senˈtrɪpɪtl/",
                  "meaning": "向心的，向心加速度的",
                  "level": "red"
                },
                {
                  "word": "velocities",
                  "ipa": "/vəˈlɒsətiz/",
                  "meaning": "速度（复数）",
                  "level": "green"
                },
                {
                  "word": "vehicle",
                  "ipa": "ˈviːɪkl",
                  "meaning": "n.车辆,交通工具;媒介,载体",
                  "level": "red"
                },
                {
                  "word": "peak",
                  "ipa": "/piːk/",
                  "meaning": "高峰；顶峰（常用释义：山峰；达到顶点）",
                  "level": "red"
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
                  "word": "remarkable",
                  "ipa": "/rɪˈmɑːkəbəl/",
                  "meaning": "惊人、异乎寻常的（负面批评）（常用释义：卓越的；值得注意的）",
                  "level": "red"
                },
                {
                  "word": "trajectory",
                  "ipa": "/trəˈdʒektəri/",
                  "meaning": "轨迹，航迹",
                  "level": "red"
                },
                {
                  "word": "extreme",
                  "ipa": "ɪkˈstriːm",
                  "meaning": "adj. 极其的，非常的",
                  "level": "green"
                },
                {
                  "word": "overlap",
                  "ipa": "",
                  "meaning": "v.互搭，复叠；部分地重叠，部分相同；同时发生",
                  "level": "red"
                },
                {
                  "word": "track",
                  "ipa": "/træk/",
                  "meaning": "轨迹；路径（常用释义：轨道；小路；痕迹；发展路线）",
                  "level": "red"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                },
                {
                  "word": "race",
                  "ipa": "reɪs",
                  "meaning": "n. 种族，民族 v. （速度）",
                  "level": "green"
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
                  "word": "execution",
                  "ipa": "/ˌeksɪˈkjuːʃn/",
                  "meaning": "执行，运算执行",
                  "level": "green"
                },
                {
                  "word": "whereas",
                  "ipa": "ˌwerˈæz",
                  "meaning": "conj.（表示对比）但是，然而；鉴于",
                  "level": "green"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                },
                {
                  "word": "step",
                  "ipa": "",
                  "meaning": "v. 踏，踩",
                  "level": "green"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
                  "level": "red"
                },
                {
                  "word": "a",
                  "ipa": "细节因果题",
                  "meaning": "Washington 开始相信 all men were created equal，因此释放奴隶源自道德考虑。（常用释义：B 只是触发道德认识的经历背景；C、D 无原文依据。）",
                  "level": "red"
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
                  "word": "hairpin turns",
                  "ipa": "/ˈheəpɪn tɜːnz/",
                  "meaning": "发卡弯急转",
                  "level": "blue"
                },
                {
                  "word": "indispensable",
                  "ipa": "ˌɪndɪˈspɛnsəbəl",
                  "meaning": "adj.(to,for)必不可少的,必需的",
                  "level": "red"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "high-speed",
                  "ipa": "/haɪ spiːd/",
                  "meaning": "高速的",
                  "level": "green"
                },
                {
                  "word": "foundation",
                  "ipa": "faʊnˈdeɪʃ(ə)n",
                  "meaning": "n.基础；基金会；基本原理；建立",
                  "level": "green"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red"
                },
                {
                  "word": "diverge",
                  "ipa": "/daɪˈvɜːdʒ/",
                  "meaning": "发散",
                  "level": "red"
                },
                {
                  "word": "hairpin",
                  "ipa": "/ˈheəpɪn/",
                  "meaning": "发卡弯（极急剧的急转弯道）",
                  "level": "red"
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
                },
                {
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
                  "level": "red"
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
                  "word": "evaluation",
                  "ipa": "/ɪˌvæljuˈeɪʃən/",
                  "meaning": "评估；评价（常用释义：评价；估计；评估）",
                  "level": "red"
                },
                {
                  "word": "core",
                  "ipa": "/kɔː/",
                  "meaning": "核心的、主要的（常用释义：核心；果核）",
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
                  "word": "identical",
                  "ipa": "",
                  "meaning": "adj.完全相同的；同一的；同卵的；恒等的",
                  "level": "red"
                },
                {
                  "word": "feasible",
                  "ipa": "/ˈfiːzəbl/",
                  "meaning": "可行的（在物理约束范围内）",
                  "level": "green"
                },
                {
                  "word": "accuracy",
                  "ipa": "/ˈækjərəsi/",
                  "meaning": "准确性（常用释义：准确；精确）",
                  "level": "red"
                },
                {
                  "word": "exhibit",
                  "ipa": "/ɪɡˈzɪbɪt/",
                  "meaning": "表现出，显示出（常用释义：显示；展览；展品）",
                  "level": "red"
                },
                {
                  "word": "normal",
                  "ipa": "ˈnɔːrml",
                  "meaning": "adj. 正常的；标准的",
                  "level": "green"
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
                  "meaning": "不可行的（超出物理极限）",
                  "level": "red"
                },
                {
                  "word": "overshoot",
                  "ipa": "/ˌəʊvəˈʃuːt/",
                  "meaning": "超调量",
                  "level": "red"
                },
                {
                  "word": "superior",
                  "ipa": "/suːˈpɪəriə/",
                  "meaning": "更优秀的，更高超的（常用释义：优越的；上级的；有优越感的）",
                  "level": "red"
                },
                {
                  "word": "whereas",
                  "ipa": "ˌwerˈæz",
                  "meaning": "conj.（表示对比）但是，然而；鉴于",
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
                  "word": "versus",
                  "ipa": "ˈvɜːsəs",
                  "meaning": "prep.以…为对手；与…相对",
                  "level": "green"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
                  "level": "red"
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
                  "word": "parameterization",
                  "ipa": "/pəˌræmɪtəraɪˈzeɪʃn/",
                  "meaning": "参数化配置",
                  "level": "green"
                },
                {
                  "word": "implementation",
                  "ipa": "ˌɪmplɪmenˈteɪʃ(ə)n",
                  "meaning": "n.实施，执行",
                  "level": "green"
                },
                {
                  "word": "complexity",
                  "ipa": "/kəmˈpleksəti/",
                  "meaning": "复杂性（常用释义：复杂程度）",
                  "level": "green"
                },
                {
                  "word": "algebraic",
                  "ipa": "/ˌældʒɪˈbreɪɪk/",
                  "meaning": "代数的，解析代数运算的",
                  "level": "green"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "whereas",
                  "ipa": "ˌwerˈæz",
                  "meaning": "conj.（表示对比）但是，然而；鉴于",
                  "level": "green"
                },
                {
                  "word": "complex",
                  "ipa": "/ˈkɒmpleks/",
                  "meaning": "复杂的，多层次的（常用释义：复杂的；复合的；综合体）",
                  "level": "red"
                },
                {
                  "word": "dfbc",
                  "ipa": "/ˌdiː.ef.biːˈsiː/",
                  "meaning": "微分平坦控制器 (Differential-Flatness-Based Control)",
                  "level": "blue"
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
                  "word": "allocation",
                  "ipa": "/ˌæləˈkeɪʃn/",
                  "meaning": "分配，控制分配",
                  "level": "blue"
                },
                {
                  "word": "whereas",
                  "ipa": "ˌwerˈæz",
                  "meaning": "conj.（表示对比）但是，然而；鉴于",
                  "level": "green"
                },
                {
                  "word": "state",
                  "ipa": "/steɪt/",
                  "meaning": "正式陈述；说明（常用释义：状态；州；国家；陈述）",
                  "level": "red"
                },
                {
                  "word": "input",
                  "ipa": "ˈɪnˌpʊt",
                  "meaning": "n./v.输入",
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
                  "word": "negligible",
                  "ipa": "",
                  "meaning": "adj.可以忽略不计的；微不足道的；不重要的；不值一提的",
                  "level": "red"
                },
                {
                  "word": "feasible",
                  "ipa": "/ˈfiːzəbl/",
                  "meaning": "可行的（在物理约束范围内）",
                  "level": "green"
                },
                {
                  "word": "accuracy",
                  "ipa": "/ˈækjərəsi/",
                  "meaning": "准确性（常用释义：准确；精确）",
                  "level": "red"
                },
                {
                  "word": "smooth",
                  "ipa": "smuð",
                  "meaning": "n.平滑部分；v.",
                  "level": "green"
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
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
                  "level": "red"
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
                  "word": "missions",
                  "ipa": "/ˈmɪʃnz/",
                  "meaning": "任务（复数）",
                  "level": "green"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机/推进器）",
                  "level": "red"
                },
                {
                  "word": "dynamic",
                  "ipa": "/daɪˈnæmɪk/",
                  "meaning": "动态的，动力学的",
                  "level": "red"
                },
                {
                  "word": "viable",
                  "ipa": "",
                  "meaning": "adj.能独立发展的；能独立生存的；可行的",
                  "level": "green"
                },
                {
                  "word": "nmpc",
                  "ipa": "/ˌen.em.piːˈsiː/",
                  "meaning": "非线性模型预测控制 (Nonlinear MPC)",
                  "level": "blue"
                },
                {
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
                  "level": "red"
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
                  "word": "aerodynamic drag",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk dræɡ/",
                  "meaning": "空气动力学阻力",
                  "level": "blue"
                },
                {
                  "word": "compensation",
                  "ipa": "ˌkɑmpənˈseɪʃən",
                  "meaning": "n.补偿(或赔偿)的款物;补偿,赔偿",
                  "level": "red"
                },
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "cornerstone",
                  "ipa": "/ˈkɔːnəstəʊn/",
                  "meaning": "基石，核心支柱",
                  "level": "red"
                },
                {
                  "word": "inner-loop",
                  "ipa": "/ˈɪnə luːp/",
                  "meaning": "内环控制器（角速度/力矩控制）",
                  "level": "blue"
                },
                {
                  "word": "high-speed",
                  "ipa": "/haɪ spiːd/",
                  "meaning": "高速的",
                  "level": "green"
                },
                {
                  "word": "universal",
                  "ipa": "ˌjuːnɪˈvɜːrs(ə)l",
                  "meaning": "adj.普遍的；通用的；全体的",
                  "level": "green"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "third",
                  "ipa": "θɜːd",
                  "meaning": "adj.第三的",
                  "level": "red"
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
                },
                {
                  "word": "drag",
                  "ipa": "/dræɡ/",
                  "meaning": "阻力，空气阻力",
                  "level": "red"
                },
                {
                  "word": "for",
                  "ipa": "",
                  "meaning": "v.寻找;探索;渴望;盼望",
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
