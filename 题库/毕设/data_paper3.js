window.BISHE_DATA = window.BISHE_DATA || {};
window.BISHE_DATA['paper3'] = {
  "id": "paper3",
  "title": "Attitude Control of the Hydrobatic Intervention AUV Cuttlefish using Incremental Nonlinear Dynamic Inversion",
  "chineseTitle": "基于增量非线性动态逆的水下特技干预 AUV Cuttlefish 姿态控制",
  "authors": "Tom Slawik, Shubham Vyas, Leif Christensen, Frank Kirchner",
  "journal": "IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)",
  "venue": "德国人工智能研究中心机器人创新中心（DFKI GmbH RIC, Robotics Innovation Center, Bremen, Germany）",
  "video": "https://youtu.be/8u8k607lpn4",
  "code": "https://github.com/dfki-ric-underactuated-lab/auv_control_indi",
  "overview": "本文针对双臂水下干预作业潜水器 Cuttlefish，首次提出并实现了基于增量非线性动态逆 (INDI) 的 6 自由度运动与姿态控制方案。在德国 DFKI RIC 大型水池中严格测试了 90° 俯仰特技过渡机动 (Pitch-up Maneuver) 与 300 秒定点直立悬停。试验表明 INDI 稳态姿态误差仅为 0.0829°（比经典反馈线性化 FBL 降低一个数量级），悬停空间漂移小于 0.1 m（远优于 FBL 的 1.5~2.5 m），实现了“用高频传感器测量精度完全替代复杂流体动力学物理建模”。",
  "sections": [
    {
      "id": "sec-abstract",
      "sectionNumber": "摘要",
      "title": "ABSTRACT",
      "chineseTitle": "论文摘要 (Abstract)",
      "paragraphs": [
        {
          "pIndex": 1,
          "logicRole": "基于 INDI 的 AUV 姿态控制理论提出",
          "mainIdea": "针对受高度非线性水动力学影响的自主水下航行器 (AUV)，提出基于增量非线性动态逆 (INDI) 的控制方案。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "In this paper, we present an attitude control scheme for an autonomous underwater vehicle (AUV), which is based on incremental nonlinear dynamic inversion (INDI).",
              "translation": "在本文中，我们提出了一种基于增量非线性动态逆（Incremental Nonlinear Dynamic Inversion, INDI）的自主水下航行器（AUV）姿态控制方案。",
              "vocab": [
                {
                  "word": "dynamic inversion",
                  "ipa": "/daɪˈnæmɪk ɪnˈvɜːʃn/",
                  "meaning": "动态逆控制",
                  "level": "blue"
                },
                {
                  "word": "incremental",
                  "ipa": "/ˌɪŋkrəˈmentl/",
                  "meaning": "增量的，逐拍差分的",
                  "level": "blue"
                },
                {
                  "word": "autonomous",
                  "ipa": "/ɔːˈtɒnəməs/",
                  "meaning": "自主的，独立的",
                  "level": "red"
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
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "vehicle",
                  "ipa": "ˈviːɪkl",
                  "meaning": "n.车辆,交通工具;媒介,载体",
                  "level": "red"
                },
                {
                  "word": "dynamic",
                  "ipa": "/daɪˈnæmɪk/",
                  "meaning": "动态的，动力学的",
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
                },
                {
                  "word": "auv",
                  "ipa": "/ˌeɪ.juːˈviː/",
                  "meaning": "自主水下航行器 (Autonomous Underwater Vehicle)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "Conventional model-based controllers depend on an exact model of the controlled system, which is difficult to find, especially for marine vehicles subject to highly nonlinear hydrodynamic effects.",
              "translation": "传统的基于模型的控制器严重依赖于受控系统的精确数学模型，然而对于受到高度非线性水动力学效应影响的水下航行器而言，建立精确模型极其困难。",
              "vocab": [
                {
                  "word": "conventional",
                  "ipa": "/kənˈvenʃənl/",
                  "meaning": "传统的；常规的（常用释义：按惯例的；普通的）",
                  "level": "red"
                },
                {
                  "word": "hydrodynamic",
                  "ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/",
                  "meaning": "水动力学的，流体动力学的",
                  "level": "red"
                },
                {
                  "word": "depend on",
                  "ipa": "/dɪˈpend ɒn/",
                  "meaning": "取决于；依赖于（常用释义：依靠）",
                  "level": "purple"
                },
                {
                  "word": "difficult",
                  "ipa": "",
                  "meaning": "adj.困难的，费力的；不友好的，难对付的",
                  "level": "red"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "subject",
                  "ipa": "/ˈsʌbdʒɪkt/",
                  "meaning": "主题；中心议题（常用释义：学科；对象；臣民）",
                  "level": "red"
                },
                {
                  "word": "system",
                  "ipa": "ˈsɪstəm",
                  "meaning": "n. 体系；系统",
                  "level": "green"
                },
                {
                  "word": "marine",
                  "ipa": "",
                  "meaning": "adj.海的；海产的；海生的；海船的；货船的；海上贸易的",
                  "level": "red"
                },
                {
                  "word": "exact",
                  "ipa": "ɪɡˈzækt",
                  "meaning": "adj. 精确的；确切的",
                  "level": "green"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green"
                },
                {
                  "word": "find",
                  "ipa": "faɪnd",
                  "meaning": "v.找到;发现;发觉",
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
        },
        {
          "pIndex": 2,
          "logicRole": "用传感器测量精度换取动力学模型精度",
          "mainIdea": "INDI 通过引入高频加速度计反馈与执行器推力反馈，逐拍局部增量线性化，实现免除复杂水动力学物理建模。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P2-S1",
              "text": "INDI trades off model accuracy with sensor accuracy by incorporating acceleration feedback and actuator output feedback to linearize a nonlinear system incrementally.",
              "translation": "INDI 通过引入高频加速度反馈与执行器输出反馈，对非线性系统进行逐拍增量局部线性化，从而实现了“用传感器测量精度换取动力学模型精度”。",
              "vocab": [
                {
                  "word": "incorporating",
                  "ipa": "/ɪnˈkɔːpəreɪtɪŋ/",
                  "meaning": "融入，引入",
                  "level": "red"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
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
                  "meaning": "准确性（常用释义：准确；精确）",
                  "level": "red"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机/推进器）",
                  "level": "red"
                },
                {
                  "word": "output",
                  "ipa": "ˈaʊtpʊt",
                  "meaning": "n. 产量，输出量",
                  "level": "green"
                },
                {
                  "word": "system",
                  "ipa": "ˈsɪstəm",
                  "meaning": "n. 体系；系统",
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
          "pIndex": 3,
          "logicRole": "90 度特技过渡机动研究场景",
          "mainIdea": "针对双臂水下干预作业潜水器 Cuttlefish 从水平巡航翻转至垂直作业的 90 度俯仰特技过渡机动开展开创性研究。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P3-S1",
              "text": "Existing research primarily focuses on studying INDI on unmanned aerial vehicles; however, there is barely any research on controlling marine vehicles using INDI.",
              "translation": "现有的 INDI 控制研究主要集中在无人机（UAV）领域，而在海洋机器人领域的应用几乎处于空白。",
              "vocab": [
                {
                  "word": "primarily",
                  "ipa": "/praɪˈmerəli/",
                  "meaning": "主要地；首要地。（常用释义：主要地。）",
                  "level": "red"
                },
                {
                  "word": "existing",
                  "ipa": "/ɪɡˈzɪstɪŋ/",
                  "meaning": "现有的、已经存在的（常用释义：目前存在的）",
                  "level": "green"
                },
                {
                  "word": "however",
                  "ipa": "/haʊˈevə/",
                  "meaning": "然而、不过（常用释义：无论如何）",
                  "level": "red"
                },
                {
                  "word": "barely",
                  "ipa": "ˈberli",
                  "meaning": "adv.仅仅；几乎不；刚好",
                  "level": "green"
                },
                {
                  "word": "marine",
                  "ipa": "",
                  "meaning": "adj.海的；海产的；海生的；海船的；货船的；海上贸易的",
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
              "sIndex": 2,
              "id": "P3-S2",
              "text": "The control task we are performing is a 90 degrees pitch-up maneuver, where the dual-arm intervention AUV Cuttlefish transitions from a horizontal traveling pose to a vertical intervention pose.",
              "translation": "本文针对具有极高挑战性的 90° 俯仰特技过渡机动（Pitch-up Maneuver）开展研究——双臂水下干预作业型 AUV “Cuttlefish” 从水平巡航姿态快速切换到垂直干预作业姿态。",
              "vocab": [
                {
                  "word": "intervention",
                  "ipa": "/ˌɪntəˈvenʃn/",
                  "meaning": "干预作业，水下工程维修",
                  "level": "red"
                },
                {
                  "word": "transitions",
                  "ipa": "/trænˈzɪʃnz/",
                  "meaning": "过渡机动（复数）",
                  "level": "green"
                },
                {
                  "word": "cuttlefish",
                  "ipa": "/ˈkʌtlfɪʃ/",
                  "meaning": "墨鱼号（DFKI 研发的水下特技干预 AUV）",
                  "level": "blue"
                },
                {
                  "word": "pitch-up",
                  "ipa": "/pɪtʃ ʌp/",
                  "meaning": "俯仰上仰机动（90度翻转直立）",
                  "level": "blue"
                },
                {
                  "word": "maneuver",
                  "ipa": "/məˈnuːvə/",
                  "meaning": "机动动作，飞行机动",
                  "level": "red"
                },
                {
                  "word": "vertical",
                  "ipa": "ˈvɜːtɪk(ə)l",
                  "meaning": "adj. 垂直的，纵向",
                  "level": "green"
                },
                {
                  "word": "pose",
                  "ipa": "/pəʊz/",
                  "meaning": "位姿 (Position & Orientation)",
                  "level": "blue"
                },
                {
                  "word": "auv",
                  "ipa": "/ˌeɪ.juːˈviː/",
                  "meaning": "自主水下航行器 (Autonomous Underwater Vehicle)",
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
          "pIndex": 4,
          "logicRole": "大型海洋水池实机对比测试结论",
          "mainIdea": "在德国 DFKI RIC 大型水池中与经典反馈线性化 (FBL) 严格对比，INDI 在大角度特技机动与定点悬停中展现出显著更优的平稳性与极低空间漂移。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P4-S1",
              "text": "We compare INDI to a classical model-based control scheme in the maritime test basin at DFKI RIC, Germany, and we find that INDI keeps the AUV much more steady both in the transitioning phase as well as in the station keeping phase.",
              "translation": "我们在德国 DFKI RIC 的大型海洋试验水池中，将 INDI 与经典的基于模型控制方案进行了严格的实机对比测试，结果表明 INDI 无论是在大角度动态过渡阶段还是在长时间定点悬停阶段都能使 AUV 保持显著更优的平稳性。",
              "vocab": [
                {
                  "word": "station keeping",
                  "ipa": "/ˈsteɪʃn ˈkiːpɪŋ/",
                  "meaning": "定点悬停，动力定位保持",
                  "level": "blue"
                },
                {
                  "word": "transitioning",
                  "ipa": "/trænˈzɪʃnɪŋ/",
                  "meaning": "过渡中",
                  "level": "green"
                },
                {
                  "word": "classical",
                  "ipa": "ˈklæsɪk(ə)l",
                  "meaning": "adj. 传统的；古典",
                  "level": "green"
                },
                {
                  "word": "compare",
                  "ipa": "",
                  "meaning": "v.比较，对比；把……比作；相比",
                  "level": "red"
                },
                {
                  "word": "station",
                  "ipa": "",
                  "meaning": "n.火车站；公共汽车站；长途汽车站；站；所；局；电台；社会地位",
                  "level": "red"
                },
                {
                  "word": "steady",
                  "ipa": "/ˈstedi/",
                  "meaning": "平稳的，稳定的",
                  "level": "green"
                },
                {
                  "word": "basin",
                  "ipa": "/ˈbeɪsn/",
                  "meaning": "试验水池，水下试验槽",
                  "level": "green"
                },
                {
                  "word": "phase",
                  "ipa": "feɪz",
                  "meaning": "n.阶段；时期 v.分阶段进行",
                  "level": "green"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "find",
                  "ipa": "faɪnd",
                  "meaning": "v.找到;发现;发觉",
                  "level": "red"
                },
                {
                  "word": "auv",
                  "ipa": "/ˌeɪ.juːˈviː/",
                  "meaning": "自主水下航行器 (Autonomous Underwater Vehicle)",
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
          "logicRole": "海洋经济发展与水下自主作业需求",
          "mainIdea": "海洋风电、养殖网箱与水下变电站迅速发展，对水下无人化自主运维作业的需求日益迫切。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P5-S1",
              "text": "With the expansion of the blue economy, there has been a notable increase in subsea infrastructures, including aquaculture installations and offshore wind farms, leading to a growing need for automated subsea operations.",
              "translation": "随着海洋“蓝色经济”的蓬勃发展，海底基础设施（如现代化水产养殖网箱、海上风电场导管架及水下变电站）建设规模迅速扩大，导致对水下无人化自主运维作业的需求日益迫切。",
              "vocab": [
                {
                  "word": "infrastructures",
                  "ipa": "/ˈɪnfrəstrʌktʃəz/",
                  "meaning": "基础设施（复数）",
                  "level": "green"
                },
                {
                  "word": "aquaculture",
                  "ipa": "/ˈækwəkʌltʃə/",
                  "meaning": "水产养殖，深海养殖网箱",
                  "level": "red"
                },
                {
                  "word": "expansion",
                  "ipa": "/ɪkˈspænʃn/",
                  "meaning": "展开，级数展开",
                  "level": "green"
                },
                {
                  "word": "increase",
                  "ipa": "ɪnˈkriːs",
                  "meaning": "v./n. 增加，繁殖",
                  "level": "green"
                },
                {
                  "word": "offshore",
                  "ipa": "/ˌɒfˈʃɔː/",
                  "meaning": "海上的，离岸工程的",
                  "level": "green"
                },
                {
                  "word": "notable",
                  "ipa": "",
                  "meaning": "adj.显要的，值得注意的；非常成功的，令人尊敬的",
                  "level": "red"
                },
                {
                  "word": "leading",
                  "ipa": "ˈliːdɪŋ",
                  "meaning": "adj.领导的,指导的;第一位的;最主要的",
                  "level": "red"
                },
                {
                  "word": "subsea",
                  "ipa": "/ˌsʌbˈsiː/",
                  "meaning": "海底的，水下的",
                  "level": "red"
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
            }
          ]
        },
        {
          "pIndex": 6,
          "logicRole": "传统人工潜水与 ROV 的作业局限",
          "mainIdea": "人工潜水员风险高且深度受限；重载 ROV 依赖大型母船与脐带缆绞车，运维成本高昂且机动受限。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P6-S1",
              "text": "Human diving operations face many dangers, weather dependencies, and restricted depths, while Remotely Operated Vehicles (ROVs) demand large support vessels with umbilical cables, making ROV operations expensive and logistically constrained.",
              "translation": "传统作业方式的局限：人工潜水员作业存在巨大的人身安全风险，作业深度受限，且高度依赖气象海况窗口；遥控无人潜水器（ROV）虽能进行深海重载作业，但必须依赖大型专用支持母船与脐带缆绞车系统，运维成本高昂且机动受限。",
              "vocab": [
                {
                  "word": "constrained",
                  "ipa": "/kənˈstreɪnd/",
                  "meaning": "受约束的",
                  "level": "red"
                },
                {
                  "word": "umbilical",
                  "ipa": "/ʌmˈbɪlɪkl/",
                  "meaning": "脐带缆的（供电与光纤通信绞车缆）",
                  "level": "red"
                },
                {
                  "word": "weather",
                  "ipa": "/ˈweðə/",
                  "meaning": "经受住；渡过（常用释义：天气；使风化）",
                  "level": "red"
                },
                {
                  "word": "support",
                  "ipa": "/səˈpɔːt/",
                  "meaning": "资助、维持或运营知识库（常用释义：支持观点；支撑重量；支持物）",
                  "level": "red"
                },
                {
                  "word": "diving",
                  "ipa": "/ˈdaɪvɪŋ/",
                  "meaning": "潜水，俯冲",
                  "level": "green"
                },
                {
                  "word": "rovs",
                  "ipa": "/ˌɑːr.oʊˈviːz/",
                  "meaning": "遥控水下无人潜水器（复数）",
                  "level": "blue"
                },
                {
                  "word": "rov",
                  "ipa": "/ˌɑːr.oʊˈviː/",
                  "meaning": "遥控水下无人潜水器 (Remotely Operated Vehicle)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 7,
          "logicRole": "干预型 AUV (I-AUV) Cuttlefish 水下特技机动能力",
          "mainIdea": "AUV Cuttlefish 配备 8 推进器与双机械臂，具备 360 度水下特技机动能力，可主动调节质心与浮心。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P7-S1",
              "text": "The new class of intervention AUVs (I-AUVs) aims to facilitate autonomous interaction with subsea infrastructure.",
              "translation": "干预型 AUV（I-AUV）的崛起：配备作业机械臂的新型干预潜水器（如 AUV Cuttlefish）旨在实现全自主作业。",
              "vocab": [
                {
                  "word": "infrastructure",
                  "ipa": "/ˈɪnfrəstrʌktʃə/",
                  "meaning": "基础设施",
                  "level": "green"
                },
                {
                  "word": "intervention",
                  "ipa": "/ˌɪntəˈvenʃn/",
                  "meaning": "干预作业，水下工程维修",
                  "level": "red"
                },
                {
                  "word": "interaction",
                  "ipa": "ˌɪntərˈækʃn",
                  "meaning": "n. 交互作用；交流",
                  "level": "green"
                },
                {
                  "word": "facilitate",
                  "ipa": "/fəˈsɪlɪteɪt/",
                  "meaning": "促进、使……更容易（常用释义：为某过程提供便利）",
                  "level": "purple"
                },
                {
                  "word": "autonomous",
                  "ipa": "/ɔːˈtɒnəməs/",
                  "meaning": "自主的，独立的",
                  "level": "red"
                },
                {
                  "word": "i-auvs",
                  "ipa": "/aɪ ˌeɪ.juːˈviːz/",
                  "meaning": "水下干预作业型航行器（复数）",
                  "level": "blue"
                },
                {
                  "word": "subsea",
                  "ipa": "/ˌsʌbˈsiː/",
                  "meaning": "海底的，水下的",
                  "level": "red"
                },
                {
                  "word": "class",
                  "ipa": "/klɑːs/",
                  "meaning": "类别；种类（常用释义：班级；阶层；类别）",
                  "level": "red"
                },
                {
                  "word": "auvs",
                  "ipa": "/ˌeɪ.juːˈviːz/",
                  "meaning": "自主水下航行器（复数）",
                  "level": "blue"
                },
                {
                  "word": "new",
                  "ipa": "",
                  "meaning": "adj.新的",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P7-S2",
              "text": "The AUV Cuttlefish is an I-AUV equipped with two arms and hydrobatic motion capabilities: using its eight thrusters, it can take on arbitrary 360-degree orientations in the water column while actively shifting its center of mass (CoM) and center of buoyancy (CoB) to achieve desired task stability.",
              "translation": "Cuttlefish 配备 8 个推进器与双机械臂，具备水下特技机动能力（Hydrobatics），能够在水体中实现任意 360° 空间姿态变换，从而深入复杂水下钢结构狭窄空间作业；此外还能主动调节质心（CoM）与浮心（CoB）位置满足静水力稳定性。",
              "vocab": [
                {
                  "word": "center of buoyancy",
                  "ipa": "/ˈsentər əv ˈbɔɪənsi/",
                  "meaning": "浮心 (CoB)",
                  "level": "blue"
                },
                {
                  "word": "center of mass",
                  "ipa": "/ˈsentər əv mæs/",
                  "meaning": "质心 (CoM)",
                  "level": "blue"
                },
                {
                  "word": "orientations",
                  "ipa": "/ˌɔːriənˈteɪʃnz/",
                  "meaning": "姿态（复数）",
                  "level": "red"
                },
                {
                  "word": "cuttlefish",
                  "ipa": "/ˈkʌtlfɪʃ/",
                  "meaning": "墨鱼号（DFKI 研发的水下特技干预 AUV）",
                  "level": "blue"
                },
                {
                  "word": "hydrobatic",
                  "ipa": "/ˌhaɪdrəʊˈbætɪk/",
                  "meaning": "水下特技机动的（具备 360° 空间任意变姿态能力）",
                  "level": "red"
                },
                {
                  "word": "thrusters",
                  "ipa": "/ˈθrʌstəz/",
                  "meaning": "推进器（复数）",
                  "level": "red"
                },
                {
                  "word": "arbitrary",
                  "ipa": "ˈɑːrbɪtreri",
                  "meaning": "adj.任意的；武断的；专横的",
                  "level": "green"
                },
                {
                  "word": "stability",
                  "ipa": "stəˈbɪlɪti",
                  "meaning": "n. 稳定性；稳固",
                  "level": "green"
                },
                {
                  "word": "buoyancy",
                  "ipa": "/ˈbɔɪənsi/",
                  "meaning": "浮力，流体静浮力",
                  "level": "red"
                },
                {
                  "word": "motion",
                  "ipa": "ˈməʊʃn",
                  "meaning": "n.运动，移动；手势，动作；提议，议案 v.打手势，示意",
                  "level": "green"
                },
                {
                  "word": "i-auv",
                  "ipa": "/aɪ ˌeɪ.juːˈviː/",
                  "meaning": "水下干预作业型航行器 (Intervention AUV)",
                  "level": "blue"
                },
                {
                  "word": "take",
                  "ipa": "teɪk",
                  "meaning": "v. 携带，拿",
                  "level": "green"
                },
                {
                  "word": "auv",
                  "ipa": "/ˌeɪ.juːˈviː/",
                  "meaning": "自主水下航行器 (Autonomous Underwater Vehicle)",
                  "level": "blue"
                },
                {
                  "word": "com",
                  "ipa": "/ˌsiː.oʊˈem/",
                  "meaning": "质心 (Center of Mass)",
                  "level": "blue"
                },
                {
                  "word": "cob",
                  "ipa": "/ˌsiː.oʊˈbiː/",
                  "meaning": "浮心 (Center of Buoyancy)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 8,
          "logicRole": "核心难点：水动力学黑盒与传统建模瓶颈",
          "mainIdea": "大角度变姿态机动机理复杂：时变附加质量、速度平方二次阻尼、机械臂流体干扰；传统 FBL 辨识误差会导致推力错误并引发发散。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P8-S1",
              "text": "During large-angle attitude transitions, the vehicle faces intense nonlinear hydrodynamic coupling: time-varying added mass, quadratic damping, and body-manipulator mutual wake interference.",
              "translation": "核心难点：当 AUV 进行大角度变姿态机动（如从水平巡航翻转至垂直直立）时，船体周围流场急剧变化，产生极强的非线性耦合效应（时变附加质量、二次阻尼项、机械臂流体干扰）。",
              "vocab": [
                {
                  "word": "quadratic damping",
                  "ipa": "/kwɒˈdrætɪk ˈdæmpɪŋ/",
                  "meaning": "二次非线性阻尼（与速度平方成正比）",
                  "level": "blue"
                },
                {
                  "word": "hydrodynamic",
                  "ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/",
                  "meaning": "水动力学的，流体动力学的",
                  "level": "red"
                },
                {
                  "word": "interference",
                  "ipa": "ˌɪntəˈfɪərəns",
                  "meaning": "n.(in)干涉,干预;(with)妨碍,打扰",
                  "level": "red"
                },
                {
                  "word": "transitions",
                  "ipa": "/trænˈzɪʃnz/",
                  "meaning": "过渡机动（复数）",
                  "level": "green"
                },
                {
                  "word": "added mass",
                  "ipa": "/ˈædɪd mæs/",
                  "meaning": "水动力附加质量（流体随物体加速附带的等效惯性）",
                  "level": "blue"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的，平方的",
                  "level": "green"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "coupling",
                  "ipa": "/ˈkʌplɪŋ/",
                  "meaning": "耦合，相互作用",
                  "level": "red"
                },
                {
                  "word": "vehicle",
                  "ipa": "ˈviːɪkl",
                  "meaning": "n.车辆,交通工具;媒介,载体",
                  "level": "red"
                },
                {
                  "word": "intense",
                  "ipa": "",
                  "meaning": "adj.很大的，十分强烈的；严肃紧张的，激烈的；热情的；认真的",
                  "level": "red"
                },
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼，黏性阻力",
                  "level": "red"
                },
                {
                  "word": "mutual",
                  "ipa": "/ˈmjuːtʃuəl/",
                  "meaning": "共同的；相互的（常用释义：彼此的；共有的）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P8-S2",
              "text": "Conventional model-based methods (e.g., Feedback Linearization) require precise parameter identification; small parameter estimation mismatches produce incorrect model cancellation forces, inducing severe oscillations or persistent position drift.",
              "translation": "传统基于模型的方法（如反馈线性化 FBL）需要对上述参数进行精密辨识；若辨识出的阻尼偏大或偏小，模型补偿项就会反向施加错误推力，引发严重振荡或持续漂移。",
              "vocab": [
                {
                  "word": "feedback linearization",
                  "ipa": "/ˈfiːdbæk ˌlɪniəraɪˈzeɪʃn/",
                  "meaning": "反馈线性化控制",
                  "level": "blue"
                },
                {
                  "word": "identification",
                  "ipa": "aɪdentɪfɪˈkeɪʃ(ə)n",
                  "meaning": "n. 鉴",
                  "level": "green"
                },
                {
                  "word": "conventional",
                  "ipa": "/kənˈvenʃənl/",
                  "meaning": "传统的；常规的（常用释义：按惯例的；普通的）",
                  "level": "red"
                },
                {
                  "word": "oscillations",
                  "ipa": "/ˌɒsɪˈleɪʃnz/",
                  "meaning": "振荡，抖动（复数）",
                  "level": "red"
                },
                {
                  "word": "estimation",
                  "ipa": "/ˌestɪˈmeɪʃn/",
                  "meaning": "估计，参数辨识",
                  "level": "green"
                },
                {
                  "word": "parameter",
                  "ipa": "/pəˈræmɪtə/",
                  "meaning": "参数",
                  "level": "green"
                },
                {
                  "word": "incorrect",
                  "ipa": "ɪnkəˈrekt",
                  "meaning": "adj. 不正确的，错",
                  "level": "green"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red"
                },
                {
                  "word": "position",
                  "ipa": "/pəˈzɪʃn/",
                  "meaning": "位置，空间坐标",
                  "level": "green"
                },
                {
                  "word": "require",
                  "ipa": "",
                  "meaning": "v.需要；要求做（某事），规定",
                  "level": "red"
                },
                {
                  "word": "precise",
                  "ipa": "prɪˈsaɪs",
                  "meaning": "adj. 准确,精确的,确切",
                  "level": "green"
                },
                {
                  "word": "produce",
                  "ipa": "",
                  "meaning": "v.生产",
                  "level": "green"
                },
                {
                  "word": "severe",
                  "ipa": "sɪˈvɪə(r)",
                  "meaning": "adj.严厉的;剧烈的,严重的,严峻的,艰难的",
                  "level": "red"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "漂移，侧向偏差",
                  "level": "red"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 9,
          "logicRole": "INDI 增量控制的破局之道",
          "mainIdea": "INDI 利用当前 IMU 测量加速度增量抵消全部非线性效应，首次将 INDI 拓展至 6 自由度水下航行器并开源方案。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P9-S1",
              "text": "INDI eliminates the need to calculate complex hydrodynamic functions by utilizing current IMU acceleration measurements to cancel all accumulated nonlinearities, preserving only the control effectiveness mapping.",
              "translation": "增量非线性动态逆（INDI）的破局之道：不试图去预测或计算复杂的外部水动力学非线性函数，而是利用当前时刻 IMU 测量的实际加速度增量来抵消上一时刻的全部非线性效应，仅保留系统的控制效能映射关系。",
              "vocab": [
                {
                  "word": "control effectiveness",
                  "ipa": "/kənˈtrəʊl ɪˈfektɪvnəs/",
                  "meaning": "控制效能，控制增益矩阵 G1",
                  "level": "blue"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能，有效性",
                  "level": "green"
                },
                {
                  "word": "hydrodynamic",
                  "ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/",
                  "meaning": "水动力学的，流体动力学的",
                  "level": "red"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "calculate",
                  "ipa": "ˈkælkjuleɪt",
                  "meaning": "v.计算；预测",
                  "level": "green"
                },
                {
                  "word": "complex",
                  "ipa": "/ˈkɒmpleks/",
                  "meaning": "复杂的，多层次的（常用释义：复杂的；复合的；综合体）",
                  "level": "red"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "imu",
                  "ipa": "/ˌaɪ.emˈjuː/",
                  "meaning": "惯性测量单元 (Inertial Measurement Unit)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P9-S2",
              "text": "This work presents the first extension of INDI to 6-DOF underwater vehicles with fully open-sourced implementation.",
              "translation": "本文首次将 INDI 拓展至 6 自由度水下航行器的运动与姿态控制，并开源了全部实现方案。",
              "vocab": [
                {
                  "word": "implementation",
                  "ipa": "ˌɪmplɪmenˈteɪʃ(ə)n",
                  "meaning": "n.实施，执行",
                  "level": "green"
                },
                {
                  "word": "extension",
                  "ipa": "ɪkˈstenʃ(ə)n",
                  "meaning": "n.扩大，延伸",
                  "level": "green"
                },
                {
                  "word": "work",
                  "ipa": "wɜ:rk",
                  "meaning": "n.工作(量);作品;[pl.]工厂 v.工作;运转",
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
      "id": "sec-impl",
      "sectionNumber": "二",
      "title": "II. SYSTEM IMPLEMENTATION & MATHEMATICAL FORMULATION",
      "chineseTitle": "二、控制系统实现与数学推导 (II. IMPLEMENTATION)",
      "figure": {
        "image": "题库/毕设/images/paper3_fig1_auv_cuttlefish.png",
        "caption": "Fig. 1: 具备 8 推进器与双机械臂的 6-DOF 水下特技干预作业型 AUV Cuttlefish 实机结构与坐标系定义 (IEEE/DFKI 2022)",
        "alt": "Fig. 1: Cuttlefish AUV frame structure"
      },
      "paragraphs": [
        {
          "pIndex": 10,
          "logicRole": "Fossen 6 自由度水下航行器动力学方程",
          "mainIdea": "根据 Fossen 海洋动力学标准理论，列出机体系 6-DOF 运动学与动力学微分方程。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P10-S1",
              "text": "Under Fossen's standard marine vessel kinematics and dynamics formulation, the 6-DOF equations of motion in body frame are given by: $\\boldsymbol{M}\\dot{\\boldsymbol{\\nu}} + \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta}) = \\boldsymbol{\\tau}$ and $\\dot{\\boldsymbol{\\eta}} = \\boldsymbol{J}(\\boldsymbol{\\eta})\\boldsymbol{\\nu}$.",
              "translation": "根据 Fossen 海洋航行器动力学标准建模理论，6 自由度 AUV 在机体坐标系下的运动学与动力学方程表示为：$\\boldsymbol{M}\\dot{\\boldsymbol{\\nu}} + \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta}) = \\boldsymbol{\\tau}$ 以及 $\\dot{\\boldsymbol{\\eta}} = \\boldsymbol{J}(\\boldsymbol{\\eta})\\boldsymbol{\\nu}$。",
              "vocab": [
                {
                  "word": "kinematics",
                  "ipa": "/ˌkɪnəˈmætɪks/",
                  "meaning": "运动学（纯几何与时间关系）",
                  "level": "red"
                },
                {
                  "word": "standard",
                  "ipa": "/ˈstændəd/",
                  "meaning": "通行的；公认权威的（常用释义：标准的；标准；普通规格的）",
                  "level": "red"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学，动态特性",
                  "level": "red"
                },
                {
                  "word": "fossen",
                  "ipa": "/ˈfɒsn/",
                  "meaning": "福森（海洋动力学权威学者）",
                  "level": "blue"
                },
                {
                  "word": "marine",
                  "ipa": "",
                  "meaning": "adj.海的；海产的；海生的；海船的；货船的；海上贸易的",
                  "level": "red"
                },
                {
                  "word": "motion",
                  "ipa": "ˈməʊʃn",
                  "meaning": "n.运动，移动；手势，动作；提议，议案 v.打手势，示意",
                  "level": "green"
                },
                {
                  "word": "frame",
                  "ipa": "freɪm",
                  "meaning": "n.框架；构架，支架；体格，骨架 v.装框架；作伪证陷害；拟",
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
              "sIndex": 2,
              "id": "P10-S2",
              "text": "Here $\\boldsymbol{\\eta} = [x, y, z, \\phi, \\theta, \\psi]^T$ represents NED position and Euler angles, $\\boldsymbol{\\nu} = [u, v, w, p, q, r]^T$ is body linear and angular velocities, $\\boldsymbol{M} = \\boldsymbol{M}_{RB} + \\boldsymbol{M}_A$ includes rigid-body and added mass, $\\boldsymbol{C}(\\boldsymbol{\\nu})$ is Coriolis-centripetal matrix, $\\boldsymbol{D}(\\boldsymbol{\\nu}) = \\boldsymbol{D}_{lin} + \\boldsymbol{D}_{quad}(\\boldsymbol{\\nu})$ is linear and quadratic damping, $\\boldsymbol{g}(\\boldsymbol{\\eta})$ is restoring vector, and $\\boldsymbol{\\tau}$ is generalized thrust.",
              "translation": "物理定义：$\\boldsymbol{\\eta}$ 为大地坐标系位置与欧拉角；$\\boldsymbol{\\nu}$ 为机体线速度与角速度；$\\boldsymbol{M} = \\boldsymbol{M}_{RB} + \\boldsymbol{M}_A$ 为刚体惯性与水动力附加质量矩阵之和；$\\boldsymbol{C}(\\boldsymbol{\\nu})$ 为科氏/向心力矩阵；$\\boldsymbol{D}(\\boldsymbol{\\nu})$ 为线性与二次非线性阻尼；$\\boldsymbol{g}(\\boldsymbol{\\eta})$ 为重浮力恢复力矩矢量；$\\boldsymbol{\\tau}$ 为 8 推进器六轴控制力与力矩。",
              "vocab": [
                {
                  "word": "coriolis-centripetal",
                  "ipa": "/ˌkɒriˈəʊlɪs senˈtrɪpɪtl/",
                  "meaning": "科氏力与向心力耦合项",
                  "level": "blue"
                },
                {
                  "word": "quadratic damping",
                  "ipa": "/kwɒˈdrætɪk ˈdæmpɪŋ/",
                  "meaning": "二次非线性阻尼（与速度平方成正比）",
                  "level": "blue"
                },
                {
                  "word": "euler angles",
                  "ipa": "/ˈɔɪlər ˈæŋɡlz/",
                  "meaning": "欧拉角 (Roll, Pitch, Yaw)",
                  "level": "blue"
                },
                {
                  "word": "added mass",
                  "ipa": "/ˈædɪd mæs/",
                  "meaning": "水动力附加质量（流体随物体加速附带的等效惯性）",
                  "level": "blue"
                },
                {
                  "word": "velocities",
                  "ipa": "/vəˈlɒsətiz/",
                  "meaning": "速度（复数）",
                  "level": "green"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的，平方的",
                  "level": "green"
                },
                {
                  "word": "restoring",
                  "ipa": "/rɪˈstɔːrɪŋ/",
                  "meaning": "恢复的（如重浮力恢复力矩）",
                  "level": "blue"
                },
                {
                  "word": "position",
                  "ipa": "/pəˈzɪʃn/",
                  "meaning": "位置，空间坐标",
                  "level": "green"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green"
                },
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼，黏性阻力",
                  "level": "red"
                },
                {
                  "word": "angles",
                  "ipa": "/ˈæŋɡlz/",
                  "meaning": "角度（复数）",
                  "level": "green"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red"
                },
                {
                  "word": "euler",
                  "ipa": "/ˈɔɪlər/",
                  "meaning": "欧拉（数学家名）",
                  "level": "blue"
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
          "logicRole": "对比基准：经典反馈线性化 (FBL) 控制律",
          "mainIdea": "定义非线性向量场 f(nu, eta)；FBL 必须实时精确计算全部参数，存在对辨识误差极其脆弱的本质缺陷。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P11-S1",
              "text": "Defining total nonlinear vector field $\\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta}) = \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta})$ and virtual acceleration command $\\boldsymbol{a}_{ref} = \\dot{\\boldsymbol{\\nu}}_{ref} = \\boldsymbol{K}_\\nu (\\boldsymbol{\\nu}_{ref} - \\boldsymbol{\\nu})$, model-based Feedback Linearization (FBL) computes $\\boldsymbol{\\tau}_{ref} = \\boldsymbol{M} \\boldsymbol{a}_{ref} + \\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta})$.",
              "translation": "定义非线性动力学总和向量场 $\\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta}) = \\boldsymbol{C}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{D}(\\boldsymbol{\\nu})\\boldsymbol{\\nu} + \\boldsymbol{g}(\\boldsymbol{\\eta})$，引入虚拟控制量 $\\boldsymbol{a}_{ref} = \\dot{\\boldsymbol{\\nu}}_{ref} = \\boldsymbol{K}_\\nu (\\boldsymbol{\\nu}_{ref} - \\boldsymbol{\\nu})$，经典反馈线性化控制律为：$\\boldsymbol{\\tau}_{ref} = \\boldsymbol{M} \\boldsymbol{a}_{ref} + \\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta})$。",
              "vocab": [
                {
                  "word": "feedback linearization",
                  "ipa": "/ˈfiːdbæk ˌlɪniəraɪˈzeɪʃn/",
                  "meaning": "反馈线性化控制",
                  "level": "blue"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red"
                },
                {
                  "word": "virtual",
                  "ipa": "ˈvɜːrtʃuəl",
                  "meaning": "adj. 虚拟的；实质上的",
                  "level": "green"
                },
                {
                  "word": "command",
                  "ipa": "kəˈmænd",
                  "meaning": "n./v. 命令",
                  "level": "green"
                },
                {
                  "word": "total",
                  "ipa": "ˈtəʊt(ə)l",
                  "meaning": "adj. 总数的;总括的;完",
                  "level": "green"
                },
                {
                  "word": "field",
                  "ipa": "fiːld",
                  "meaning": "n. 领域；场地；田地 v. 组建 adj. 实地的",
                  "level": "green"
                },
                {
                  "word": "fbl",
                  "ipa": "/ˌef.biːˈel/",
                  "meaning": "反馈线性化 (Feedback Linearization)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P11-S2",
              "text": "Its fatal drawback is the requirement of exact real-time computation of every coefficient in $\\boldsymbol{f}$; any slight damping or buoyancy identification discrepancy corrupts decoupling and tracking precision.",
              "translation": "本质缺陷：该方法必须实时精确计算 $\\boldsymbol{f}(\\boldsymbol{\\nu}, \\boldsymbol{\\eta})$ 中的每一个参数。一旦阻尼或恢复力矩存在微小辨识误差，系统就无法实现真正的解耦和精确补偿。",
              "vocab": [
                {
                  "word": "identification",
                  "ipa": "aɪdentɪfɪˈkeɪʃ(ə)n",
                  "meaning": "n. 鉴",
                  "level": "green"
                },
                {
                  "word": "requirement",
                  "ipa": "rɪˈkwaɪərmənt",
                  "meaning": "n. 要求；必要条件",
                  "level": "green"
                },
                {
                  "word": "discrepancy",
                  "ipa": "",
                  "meaning": "n.差异，不符",
                  "level": "red"
                },
                {
                  "word": "decoupling",
                  "ipa": "/diːˈkʌplɪŋ/",
                  "meaning": "解耦，解耦控制",
                  "level": "blue"
                },
                {
                  "word": "precision",
                  "ipa": "/prɪˈsɪʒən/",
                  "meaning": "精确性；准确性（常用释义：精确；准确；严谨）",
                  "level": "red"
                },
                {
                  "word": "drawback",
                  "ipa": "ˈdrɔːbæk",
                  "meaning": "n.缺点，不利条件",
                  "level": "green"
                },
                {
                  "word": "buoyancy",
                  "ipa": "/ˈbɔɪənsi/",
                  "meaning": "浮力，流体静浮力",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼，黏性阻力",
                  "level": "red"
                },
                {
                  "word": "slight",
                  "ipa": "slaɪs",
                  "meaning": "adj. 轻微的，细小的",
                  "level": "green"
                },
                {
                  "word": "fatal",
                  "ipa": "ˈfeɪt(ə)l",
                  "meaning": "adj.致命的；导致失败的，灾难性的",
                  "level": "green"
                },
                {
                  "word": "exact",
                  "ipa": "ɪɡˈzækt",
                  "meaning": "adj. 精确的；确切的",
                  "level": "green"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 12,
          "logicRole": "水下 6 自由度 INDI 增量控制律推导",
          "mainIdea": "在高采样频率下相邻步间流体动力学变化相比推力增量是极小量；推导出极其优美的 6-DOF INDI 控制律。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P12-S1",
              "text": "INDI performs a first-order Taylor series expansion around previous sample step $t_0$: $\\boldsymbol{M}\\dot{\\boldsymbol{\\nu}} = \\boldsymbol{M}\\dot{\\boldsymbol{\\nu}}_0 + \\left. \\frac{\\partial (\\boldsymbol{\\tau} - \\boldsymbol{f})}{\\partial \\boldsymbol{\\nu}} \\right|_0 (\\boldsymbol{\\nu} - \\boldsymbol{\\nu}_0) + \\left. \\frac{\\partial (\\boldsymbol{\\tau} - \\boldsymbol{f})}{\\partial \\boldsymbol{\\tau}} \\right|_0 (\\boldsymbol{\\tau} - \\boldsymbol{\\tau}_0)$.",
              "translation": "INDI 对受控系统在上一采样控制时刻 $(t_0)$ 附近进行一阶泰勒级数展开。",
              "vocab": [
                {
                  "word": "taylor series",
                  "ipa": "/ˈteɪlər ˈsɪəriːz/",
                  "meaning": "泰勒级数展开",
                  "level": "blue"
                },
                {
                  "word": "expansion",
                  "ipa": "/ɪkˈspænʃn/",
                  "meaning": "展开，级数展开",
                  "level": "green"
                },
                {
                  "word": "previous",
                  "ipa": "ˈpriːviəs",
                  "meaning": "adj.先前的,以前的",
                  "level": "red"
                },
                {
                  "word": "taylor",
                  "ipa": "/ˈteɪlər/",
                  "meaning": "泰勒（数学家名）",
                  "level": "blue"
                },
                {
                  "word": "around",
                  "ipa": "əˈraʊnd",
                  "meaning": "adv.存在着",
                  "level": "red"
                },
                {
                  "word": "sample",
                  "ipa": "/ˈsɑːmpəl/",
                  "meaning": "样本（常用释义：样品；样本；抽样）",
                  "level": "green"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "step",
                  "ipa": "",
                  "meaning": "v. 踏，踩",
                  "level": "green"
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
              "text": "At high loop rates ($50\\text{ Hz} \\sim 100\\text{ Hz}$), hydrodynamic force changes across $\\Delta t$ are negligible compared to thruster force increments: $\\boldsymbol{M}\\dot{\\boldsymbol{\\nu}} \\approx \\boldsymbol{M}\\dot{\\boldsymbol{\\nu}}_0 + (\\boldsymbol{\\tau} - \\boldsymbol{\\tau}_0)$.",
              "translation": "由于控制回路采样频率极高（$50\\text{ Hz} \\sim 100\\text{ Hz}$），在相邻采样间隔 $\\Delta t$ 内，航行器速度变化量 $\\Delta \\boldsymbol{\\nu}$ 所引起的流体动力学力变化相比执行机构推力增量 $\\Delta \\boldsymbol{\\tau}$ 是极小量，可以忽略：$\\boldsymbol{M}\\dot{\\boldsymbol{\\nu}} \\approx \\boldsymbol{M}\\dot{\\boldsymbol{\\nu}}_0 + (\\boldsymbol{\\tau} - \\boldsymbol{\\tau}_0)$。",
              "vocab": [
                {
                  "word": "hydrodynamic",
                  "ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/",
                  "meaning": "水动力学的，流体动力学的",
                  "level": "red"
                },
                {
                  "word": "negligible",
                  "ipa": "",
                  "meaning": "adj.可以忽略不计的；微不足道的；不重要的；不值一提的",
                  "level": "red"
                },
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "推进器（水下无刷推进电机）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P12-S3",
              "text": "Replacing $\\dot{\\boldsymbol{\\nu}}_0$ with filtered sensor acceleration $\\dot{\\boldsymbol{\\nu}}_f$ and $\\boldsymbol{\\tau}_0$ with filtered thruster output $\\boldsymbol{\\tau}_f$ yields the compact INDI control law: $\\boldsymbol{\\tau}_{ref} = \\boldsymbol{\\tau}_f + \\boldsymbol{M} (\\boldsymbol{a}_{ref} - \\dot{\\boldsymbol{\\nu}}_f)$.",
              "translation": "用低通滤波实测加速度 $\\dot{\\boldsymbol{\\nu}}_f$ 替代 $\\dot{\\boldsymbol{\\nu}}_0$，用当前推进器输出 $\\boldsymbol{\\tau}_f$ 替代 $\\boldsymbol{\\tau}_0$，推导得出 **INDI 控制律**：$\\boldsymbol{\\tau}_{ref} = \\boldsymbol{\\tau}_f + \\boldsymbol{M} (\\boldsymbol{a}_{ref} - \\dot{\\boldsymbol{\\nu}}_f)$。",
              "vocab": [
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "filtered",
                  "ipa": "/ˈfɪltəd/",
                  "meaning": "已滤波的",
                  "level": "green"
                },
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "推进器（水下无刷推进电机）",
                  "level": "red"
                },
                {
                  "word": "compact",
                  "ipa": "kəmˈpækt",
                  "meaning": "adj.小型的；紧凑的；紧密的；矮小而健壮的 n.带镜小粉",
                  "level": "green"
                },
                {
                  "word": "output",
                  "ipa": "ˈaʊtpʊt",
                  "meaning": "n. 产量，输出量",
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
              "sIndex": 4,
              "id": "P12-S4",
              "text": "Crucially, this control law completely eliminates the terms $\\boldsymbol{D}(\\boldsymbol{\\nu})$, $\\boldsymbol{C}(\\boldsymbol{\\nu})$, and $\\boldsymbol{g}(\\boldsymbol{\\eta})$ from calculation, requiring only total mass matrix $\\boldsymbol{M}$ to achieve full 6-DOF decoupling while automatically rejecting manipulator hydrodynamic disturbances.",
              "translation": "核心优势总结：1. 彻底免除阻尼与科氏力建模：整个公式中完全不包含 $\\boldsymbol{D}(\\boldsymbol{\\nu})$、$\\boldsymbol{C}(\\boldsymbol{\\nu})$ 和 $\\boldsymbol{g}(\\boldsymbol{\\eta})$；2. 参数极简：仅需配置惯性矩阵 $\\boldsymbol{M}$；3. 抗未建模扰动极强：机械臂运动引起的水动力突变会被加速度计在下一拍立即捕捉并自动增量抵消。",
              "vocab": [
                {
                  "word": "automatically",
                  "ipa": "ˌɔːtəˈmætɪkli",
                  "meaning": "adv.自动地；自然地；无意识地",
                  "level": "green"
                },
                {
                  "word": "hydrodynamic",
                  "ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/",
                  "meaning": "水动力学的，流体动力学的",
                  "level": "red"
                },
                {
                  "word": "disturbances",
                  "ipa": "/dɪˈstɜːbənsɪz/",
                  "meaning": "扰动（复数）",
                  "level": "red"
                },
                {
                  "word": "manipulator",
                  "ipa": "/məˈnɪpjuleɪtə/",
                  "meaning": "机械臂，作业操作手",
                  "level": "red"
                },
                {
                  "word": "decoupling",
                  "ipa": "/diːˈkʌplɪŋ/",
                  "meaning": "解耦，解耦控制",
                  "level": "blue"
                },
                {
                  "word": "rejecting",
                  "ipa": "/rɪˈdʒektɪŋ/",
                  "meaning": "抑制中",
                  "level": "green"
                },
                {
                  "word": "total",
                  "ipa": "ˈtəʊt(ə)l",
                  "meaning": "adj. 总数的;总括的;完",
                  "level": "green"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 13,
          "logicRole": "推进器控制分配与伪逆求解",
          "mainIdea": "利用加权 Moore-Penrose 伪逆将 6 自由度力/力矩指令分配为 8 个无刷推进器的推力设定值。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P13-S1",
              "text": "Thruster allocation maps 6-DOF generalized force command $\\boldsymbol{\\tau}_{ref} \\in \\mathbb{R}^6$ to 8 individual brushless thruster thrust setpoints $\\boldsymbol{u} \\in \\mathbb{R}^8$: $\\boldsymbol{\\tau} = \\boldsymbol{B} \\boldsymbol{u}$.",
              "translation": "推进器控制分配负责将 6 自由度广义力/力矩指令 $\\boldsymbol{\\tau}_{ref} \\in \\mathbb{R}^6$ 分配为 8 个推进器的推力设定值 $\\boldsymbol{u} \\in \\mathbb{R}^8$：$\\boldsymbol{\\tau} = \\boldsymbol{B} \\boldsymbol{u}$。",
              "vocab": [
                {
                  "word": "thruster allocation",
                  "ipa": "/ˈθrʌstə ˌæləˈkeɪʃn/",
                  "meaning": "推进器控制分配矩阵",
                  "level": "blue"
                },
                {
                  "word": "allocation",
                  "ipa": "/ˌæləˈkeɪʃn/",
                  "meaning": "分配，控制分配",
                  "level": "blue"
                },
                {
                  "word": "individual",
                  "ipa": "/ˌɪndɪˈvɪdʒuəl/",
                  "meaning": "个体的；个体（常用释义：个人；个别的）",
                  "level": "green"
                },
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "推进器（水下无刷推进电机）",
                  "level": "red"
                },
                {
                  "word": "command",
                  "ipa": "kəˈmænd",
                  "meaning": "n./v. 命令",
                  "level": "green"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P13-S2",
              "text": "Using weighted Moore-Penrose pseudo-inverse: $\\boldsymbol{u} = \\boldsymbol{B}^\\dagger \\boldsymbol{\\tau}_{ref} = \\boldsymbol{B}^T (\\boldsymbol{B} \\boldsymbol{B}^T)^{-1} \\boldsymbol{\\tau}_{ref}$, where $\\boldsymbol{B} \\in \\mathbb{R}^{6 \\times 8}$ is the thruster configuration matrix.",
              "translation": "采用加权 Moore-Penrose 伪逆求解：$\\boldsymbol{u} = \\boldsymbol{B}^\\dagger \\boldsymbol{\\tau}_{ref} = \\boldsymbol{B}^T (\\boldsymbol{B} \\boldsymbol{B}^T)^{-1} \\boldsymbol{\\tau}_{ref}$，其中 $\\boldsymbol{B} \\in \\mathbb{R}^{6 \\times 8}$ 为推力配置矩阵。",
              "vocab": [
                {
                  "word": "pseudo-inverse",
                  "ipa": "/ˈsjuːdəʊ ɪnˌvɜːs/",
                  "meaning": "伪逆矩阵 (Moore-Penrose 广义逆)",
                  "level": "blue"
                },
                {
                  "word": "moore-penrose",
                  "ipa": "/mɔː ˈpenrəʊz/",
                  "meaning": "摩尔-彭罗斯广义逆矩阵",
                  "level": "blue"
                },
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "推进器（水下无刷推进电机）",
                  "level": "red"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 14,
          "logicRole": "基于李群 SO(3) 的四元数姿态外环控制器",
          "mainIdea": "为解决 90 度大角度翻转下的欧拉角万向节死锁奇异性，姿态外环采用李群 SO(3) 误差旋转控制律。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P14-S1",
              "text": "To avoid gimbal lock singularities at $\\pm 90^\\circ$ pitch during agile flips, the attitude outer loop is synthesized on Lie group $SO(3)$: $\\boldsymbol{\\omega}_{ref}(\\boldsymbol{R}, \\boldsymbol{R}_d) = \\boldsymbol{K}_\\Omega \\sum_{i=1}^3 \\boldsymbol{e}_i \\times (\\boldsymbol{R}_d^T \\boldsymbol{R} \\boldsymbol{e}_i)$.",
              "translation": "由于 Cuttlefish 需要进行 90° 甚至更大角度的空间翻转，传统欧拉角描述在俯仰 $\\pm 90^\\circ$ 时存在万向节死锁（Gimbal Lock）奇异性。外环采用基于李群 $SO(3)$ 的姿态误差控制律。",
              "vocab": [
                {
                  "word": "singularities",
                  "ipa": "/ˌsɪŋɡjʊˈlærɪtiz/",
                  "meaning": "奇异点（复数）",
                  "level": "red"
                },
                {
                  "word": "gimbal lock",
                  "ipa": "/ˈɡɪmbl lɒk/",
                  "meaning": "万向节死锁（欧拉角在俯仰 90 度处的奇异性）",
                  "level": "blue"
                },
                {
                  "word": "synthesized",
                  "ipa": "/ˈsɪnθəsaɪzd/",
                  "meaning": "已综合设计的",
                  "level": "red"
                },
                {
                  "word": "outer-loop",
                  "ipa": "/ˈaʊtə luːp/",
                  "meaning": "外环控制器（位置/航迹规划）",
                  "level": "blue"
                },
                {
                  "word": "lie group",
                  "ipa": "/liː ɡruːp/",
                  "meaning": "李群 (如 SO(3), SE(3))",
                  "level": "blue"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "pitch",
                  "ipa": "/pɪtʃ/",
                  "meaning": "俯仰角 (Pitch)",
                  "level": "blue"
                },
                {
                  "word": "agile",
                  "ipa": "/ˈædʒaɪl/",
                  "meaning": "敏捷的，高机动性的",
                  "level": "red"
                },
                {
                  "word": "outer",
                  "ipa": "",
                  "meaning": "adj.外面的，外部的；远离中心的，外围的；客观外界的，非主观的；更远",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P14-S2",
              "text": "Here $\\boldsymbol{R} \\in SO(3)$ is current attitude rotation matrix, $\\boldsymbol{R}_d$ is target rotation, $\\boldsymbol{e}_i$ are standard basis vectors, and $\\boldsymbol{K}_\\Omega$ is positive-definite diagonal gain matrix.",
              "translation": "其中 $\\boldsymbol{R} \\in SO(3)$ 为当前姿态旋转矩阵，$\\boldsymbol{R}_d \\in SO(3)$ 为目标姿态旋转矩阵，$\\boldsymbol{e}_i$ 为标准正交基向量，$\\boldsymbol{K}_\\Omega$ 为正定对角增益矩阵。",
              "vocab": [
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "rotation",
                  "ipa": "/rəʊˈteɪʃn/",
                  "meaning": "旋转",
                  "level": "green"
                },
                {
                  "word": "standard",
                  "ipa": "/ˈstændəd/",
                  "meaning": "通行的；公认权威的（常用释义：标准的；标准；普通规格的）",
                  "level": "red"
                },
                {
                  "word": "diagonal",
                  "ipa": "/daɪˈæɡənl/",
                  "meaning": "对角的，对角矩阵的",
                  "level": "green"
                },
                {
                  "word": "basis",
                  "ipa": "ˈbeɪsɪs",
                  "meaning": "n. 基础；原因，缘由，",
                  "level": "green"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-eval",
      "sectionNumber": "三",
      "title": "III. EXPERIMENTAL EVALUATION IN TESTING BASIN",
      "chineseTitle": "三、水池对比试验与结果分析 (III. EVALUATION)",
      "figure": {
        "image": "题库/毕设/images/paper3_fig6_pitchup_curves.png",
        "caption": "Fig. 6: 90° 俯仰特技机动下 INDI 与线性/二次 FBL 控制器姿态角度跟踪与速度均方根误差 (RMSE) 对比曲线 (IEEE/DFKI 2022)",
        "alt": "Fig. 6: 90-degree pitch-up tracking curves"
      },
      "paragraphs": [
        {
          "pIndex": 15,
          "logicRole": "试验平台配置与水动力辨识数据集",
          "mainIdea": "DFKI 24x18x8m 试验水池，AUV Cuttlefish 内置 PHINS C3 光纤陀螺惯导，辨识线性与二次阻尼模型供 FBL 使用。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P15-S1",
              "text": "Experimental validation was carried out on AUV Cuttlefish ($2.8\\text{ m} \\times 2.0\\text{ m} \\times 0.8\\text{ m}$) equipped with a military-grade PHINS Compact C3 fiber-optic gyro INS inside the DFKI indoor saltwater basin ($24\\text{ m} \\times 18\\text{ m} \\times 8\\text{ m}$).",
              "translation": "试验平台：AUV Cuttlefish（长 2.8 m，宽 2.0 m，高 0.8 m），内置军工级高精度光纤陀螺惯导系统（PHINS Compact C3）；试验环境：DFKI 室内海洋试验水池（长 24 m、宽 18 m、水深 8 m）。",
              "vocab": [
                {
                  "word": "experimental",
                  "ipa": "/ɪkˌsperɪˈmentl/",
                  "meaning": "实验的，实证的",
                  "level": "green"
                },
                {
                  "word": "fiber-optic",
                  "ipa": "/ˈfaɪbər ˈɒptɪk/",
                  "meaning": "光纤的，光纤陀螺的",
                  "level": "blue"
                },
                {
                  "word": "validation",
                  "ipa": "/ˌvælɪˈdeɪʃn/",
                  "meaning": "验证，证实",
                  "level": "green"
                },
                {
                  "word": "cuttlefish",
                  "ipa": "/ˈkʌtlfɪʃ/",
                  "meaning": "墨鱼号（DFKI 研发的水下特技干预 AUV）",
                  "level": "blue"
                },
                {
                  "word": "saltwater",
                  "ipa": "/ˈsɔːltwɔːtə/",
                  "meaning": "海水，盐水水池",
                  "level": "green"
                },
                {
                  "word": "compact",
                  "ipa": "kəmˈpækt",
                  "meaning": "adj.小型的；紧凑的；紧密的；矮小而健壮的 n.带镜小粉",
                  "level": "green"
                },
                {
                  "word": "inside",
                  "ipa": "",
                  "meaning": "n.内部，内侧；（尤指）胃；里道，内圈；（靠近路边的）慢车道",
                  "level": "red"
                },
                {
                  "word": "indoor",
                  "ipa": "",
                  "meaning": "adj.室内的，户内的",
                  "level": "red"
                },
                {
                  "word": "basin",
                  "ipa": "/ˈbeɪsn/",
                  "meaning": "试验水池，水下试验槽",
                  "level": "green"
                },
                {
                  "word": "gyro",
                  "ipa": "/ˈdʒaɪrəʊ/",
                  "meaning": "陀螺仪，角速度传感器",
                  "level": "blue"
                },
                {
                  "word": "auv",
                  "ipa": "/ˌeɪ.juːˈviː/",
                  "meaning": "自主水下航行器 (Autonomous Underwater Vehicle)",
                  "level": "blue"
                },
                {
                  "word": "ins",
                  "ipa": "/ˌaɪ.enˈes/",
                  "meaning": "惯性导航系统 (Inertial Navigation System)",
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
              "id": "P15-S2",
              "text": "From 57 minutes of recorded baseline runs, two models were identified for FBL benchmarking: 1. Linear Drag FBL; 2. Quadratic Drag FBL.",
              "translation": "水动力参数辨识：记录 57 分钟实测航行数据，分别辨识出两套模型供 FBL 控制器使用：1. 线性阻尼模型（Linear Drag FBL）；2. 二次非线性阻尼模型（Quadratic Drag FBL）。",
              "vocab": [
                {
                  "word": "benchmarking",
                  "ipa": "/ˈbentʃmɑːkɪŋ/",
                  "meaning": "基准对比中",
                  "level": "blue"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的，平方的",
                  "level": "green"
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
                },
                {
                  "word": "fbl",
                  "ipa": "/ˌef.biːˈel/",
                  "meaning": "反馈线性化 (Feedback Linearization)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 16,
          "logicRole": "试验 1：90° 俯仰特技过渡机动稳态误差对比",
          "mainIdea": "5秒内从水平巡航翻转至垂直直立并保持300秒；稳态误差：INDI 仅 0.0829°，远优于线性 FBL (1.35°) 与二次 FBL (1.69°)。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P16-S1",
              "text": "Experiment 1 (90-degree Pitch-up Maneuver): The AUV pitches up 90 degrees from horizontal cruising to vertical stance in 5 seconds and holds for 300 seconds.",
              "translation": "试验 1（90° 俯仰特技过渡机动）：AUV 在 5 秒内从水平巡航姿态快速俯仰翻转 90° 进入垂直直立姿态，并在直立姿态稳定保持 300 秒。",
              "vocab": [
                {
                  "word": "experiment",
                  "ipa": "/ɪkˈsperɪmənt/",
                  "meaning": "实验",
                  "level": "green"
                },
                {
                  "word": "pitch-up",
                  "ipa": "/pɪtʃ ʌp/",
                  "meaning": "俯仰上仰机动（90度翻转直立）",
                  "level": "blue"
                },
                {
                  "word": "maneuver",
                  "ipa": "/məˈnuːvə/",
                  "meaning": "机动动作，飞行机动",
                  "level": "red"
                },
                {
                  "word": "vertical",
                  "ipa": "ˈvɜːtɪk(ə)l",
                  "meaning": "adj. 垂直的，纵向",
                  "level": "green"
                },
                {
                  "word": "stance",
                  "ipa": "/stɑːns/",
                  "meaning": "姿态，站立姿态",
                  "level": "green"
                },
                {
                  "word": "auv",
                  "ipa": "/ˌeɪ.juːˈviː/",
                  "meaning": "自主水下航行器 (Autonomous Underwater Vehicle)",
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
              "id": "P16-S2",
              "text": "Steady-state attitude error under INDI is only 0.0829 degrees, dramatically superior to 1.3459 degrees for Linear FBL and 1.6897 degrees for Quadratic FBL.",
              "translation": "稳态姿态角度误差对比：INDI 控制器稳态角度误差仅为 0.0829°；线性阻尼 FBL 为 1.3459°；二次阻尼 FBL 为 1.6897°。",
              "vocab": [
                {
                  "word": "steady-state",
                  "ipa": "/ˈstedi steɪt/",
                  "meaning": "稳态的，平衡状态的",
                  "level": "blue"
                },
                {
                  "word": "dramatically",
                  "ipa": "/drəˈmætɪkli/",
                  "meaning": "显著地；大幅度地（常用释义：戏剧性地；显著地）",
                  "level": "red"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的，平方的",
                  "level": "green"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red"
                },
                {
                  "word": "superior",
                  "ipa": "/suːˈpɪəriə/",
                  "meaning": "更优秀的，更高超的（常用释义：优越的；上级的；有优越感的）",
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
                },
                {
                  "word": "fbl",
                  "ipa": "/ˌef.biːˈel/",
                  "meaning": "反馈线性化 (Feedback Linearization)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 17,
          "logicRole": "机动全过程 6 自由度 RMSE 对比与物理机理反思",
          "mainIdea": "全自由度 RMSE 表格：INDI 在横滚、侧移速度上稳定性提升近 3 倍；二次 FBL 反而变差因低速湍流过渡区模型高估阻尼产生反向过度补偿。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P17-S1",
              "text": "Throughout the maneuver, 6-DOF velocity RMSE is significantly lower under INDI: Surge RMSE 0.39 mm/s (vs 0.55/1.04 mm/s), Sway 0.12 mm/s (vs 0.34/0.64 mm/s), Roll rate 0.022 deg/s (vs 0.043/0.063 deg/s, nearly 3x improvement).",
              "translation": "机动过程速度跟踪 RMSE 对比：前进线速度 Surge RMSE 为 0.39 mm/s（FBL 为 0.55/1.04）；侧移线速度 Sway 为 0.12 mm/s（FBL 为 0.34/0.64）；横滚角速度 Roll 为 0.022 deg/s（FBL 为 0.043/0.063，稳定性提升近 3 倍）；俯仰与偏航均表现优异。",
              "vocab": [
                {
                  "word": "improvement",
                  "ipa": "ɪmˈpruːvmənt",
                  "meaning": "n.改善；改进之处",
                  "level": "green"
                },
                {
                  "word": "throughout",
                  "ipa": "/θruːˈaʊt/",
                  "meaning": "遍及；贯穿整个……（常用释义：all through；in every part of）",
                  "level": "red"
                },
                {
                  "word": "maneuver",
                  "ipa": "/məˈnuːvə/",
                  "meaning": "机动动作，飞行机动",
                  "level": "red"
                },
                {
                  "word": "velocity",
                  "ipa": "/vəˈlɒsəti/",
                  "meaning": "速度，线速度",
                  "level": "green"
                },
                {
                  "word": "surge",
                  "ipa": "/sɜːdʒ/",
                  "meaning": "纵荡，前进线速度 (Surge)",
                  "level": "blue"
                },
                {
                  "word": "rmse",
                  "ipa": "/ˌɑːr.em.esˈiː/",
                  "meaning": "均方根误差 (Root Mean Square Error)",
                  "level": "blue"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "sway",
                  "ipa": "/sweɪ/",
                  "meaning": "横荡，侧移线速度 (Sway)",
                  "level": "blue"
                },
                {
                  "word": "roll",
                  "ipa": "/rəʊl/",
                  "meaning": "横滚角 (Roll)",
                  "level": "blue"
                },
                {
                  "word": "rate",
                  "ipa": "reɪt",
                  "meaning": "n.速率;等级;价格,费用 v.估价;评级,评价",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P17-S2",
              "text": "Physical reflection: Quadratic FBL performed worse than Linear FBL because in low-speed transition regimes, water flow transitions between laminar and turbulent flow, making quadratic damping coefficients difficult to identify precisely; the over-estimated model injected excessive counter-thrust, magnifying tracking errors.",
              "translation": "关键物理反思：为什么二次非线性阻尼 FBL 的表现反而劣于线性 FBL？因为在低速与变姿态翻转时，水流处于层流与湍流过渡区，二次阻尼项参数在低速下极难精准辨识；辨识模型高估了阻尼后，FBL 控制回路施加了过量的反向抵消力，反而放大了误差。",
              "vocab": [
                {
                  "word": "quadratic damping",
                  "ipa": "/kwɒˈdrætɪk ˈdæmpɪŋ/",
                  "meaning": "二次非线性阻尼（与速度平方成正比）",
                  "level": "blue"
                },
                {
                  "word": "transitions",
                  "ipa": "/trænˈzɪʃnz/",
                  "meaning": "过渡机动（复数）",
                  "level": "green"
                },
                {
                  "word": "transition",
                  "ipa": "/trænˈzɪʃn/",
                  "meaning": "过渡，姿态翻转过渡",
                  "level": "green"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的，平方的",
                  "level": "green"
                },
                {
                  "word": "turbulent",
                  "ipa": "ˈtɜrbjələnt",
                  "meaning": "adj.狂暴的,骚动的",
                  "level": "red"
                },
                {
                  "word": "difficult",
                  "ipa": "",
                  "meaning": "adj.困难的，费力的；不友好的，难对付的",
                  "level": "red"
                },
                {
                  "word": "precisely",
                  "ipa": "prɪˈsaɪsli",
                  "meaning": "adv. 精确地",
                  "level": "green"
                },
                {
                  "word": "excessive",
                  "ipa": "ɪkˈsesɪv",
                  "meaning": "adj.过度的，过多的",
                  "level": "green"
                },
                {
                  "word": "physical",
                  "ipa": "ˈfɪzɪk(ə)l",
                  "meaning": "adj.物理的；身体的；物质的 n.体检",
                  "level": "green"
                },
                {
                  "word": "identify",
                  "ipa": "/aɪˈdentɪfaɪ/",
                  "meaning": "确认；识别（常用释义：识别；确认；认出；认同）",
                  "level": "red"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                },
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼，黏性阻力",
                  "level": "red"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green"
                },
                {
                  "word": "fbl",
                  "ipa": "/ˌef.biːˈel/",
                  "meaning": "反馈线性化 (Feedback Linearization)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 18,
          "logicRole": "试验 2：300 秒垂直直立悬停抗漂移与能耗测试",
          "mainIdea": "垂直悬停 300 秒：INDI 空间漂移小于 0.1m（近乎原地锁定），而 FBL 累计漂移达 1.5m~2.5m；功耗无额外增加。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P18-S1",
              "text": "Experiment 2 (300-Second Vertical Station Keeping): Holding 90-degree vertical stance for 300 seconds, horizontal $(x, y)$ drift was recorded.",
              "translation": "试验 2（300 秒垂直直立悬停抗漂移测试）：在水下保持 90° 垂直直立状态 300 秒，记录水平面 $(x, y)$ 漂移轨迹：",
              "vocab": [
                {
                  "word": "station keeping",
                  "ipa": "/ˈsteɪʃn ˈkiːpɪŋ/",
                  "meaning": "定点悬停，动力定位保持",
                  "level": "blue"
                },
                {
                  "word": "experiment",
                  "ipa": "/ɪkˈsperɪmənt/",
                  "meaning": "实验",
                  "level": "green"
                },
                {
                  "word": "vertical",
                  "ipa": "ˈvɜːtɪk(ə)l",
                  "meaning": "adj. 垂直的，纵向",
                  "level": "green"
                },
                {
                  "word": "station",
                  "ipa": "",
                  "meaning": "n.火车站；公共汽车站；长途汽车站；站；所；局；电台；社会地位",
                  "level": "red"
                },
                {
                  "word": "stance",
                  "ipa": "/stɑːns/",
                  "meaning": "姿态，站立姿态",
                  "level": "green"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "漂移，侧向偏差",
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
              "id": "P18-S2",
              "text": "INDI constrained total spatial drift to $< 0.1\\text{ m}$ (virtually locked in place), whereas Linear FBL drifted by 1.5 m and Quadratic FBL drifted by 2.5 m.",
              "translation": "INDI 在 $x$ 轴与 $y$ 轴的空间位置漂移小于 0.1 m（几乎完全锁定在原地）；线性阻尼 FBL 累计漂移达 1.5 m；二次阻尼 FBL 累计漂移超过 2.5 m。",
              "vocab": [
                {
                  "word": "constrained",
                  "ipa": "/kənˈstreɪnd/",
                  "meaning": "受约束的",
                  "level": "red"
                },
                {
                  "word": "virtually",
                  "ipa": "ˈvɜːrtʃuəli",
                  "meaning": "adv. 几乎；实际上",
                  "level": "green"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的，平方的",
                  "level": "green"
                },
                {
                  "word": "whereas",
                  "ipa": "ˌwerˈæz",
                  "meaning": "conj.（表示对比）但是，然而；鉴于",
                  "level": "green"
                },
                {
                  "word": "drifted",
                  "ipa": "/ˈdrɪftɪd/",
                  "meaning": "已漂移的",
                  "level": "red"
                },
                {
                  "word": "total",
                  "ipa": "ˈtəʊt(ə)l",
                  "meaning": "adj. 总数的;总括的;完",
                  "level": "green"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "漂移，侧向偏差",
                  "level": "red"
                },
                {
                  "word": "place",
                  "ipa": "",
                  "meaning": "v.放置",
                  "level": "green"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "fbl",
                  "ipa": "/ˌef.biːˈel/",
                  "meaning": "反馈线性化 (Feedback Linearization)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P18-S3",
              "text": "Continuous power consumption was 2231 W for INDI, 2246 W for Linear FBL, and 2274 W for Quadratic FBL, verifying that INDI eliminates drift without introducing high-frequency chatter or extra energy expenditure.",
              "translation": "悬停功率消耗：INDI 连续功耗为 2231 W，线性 FBL 为 2246 W，二次 FBL 为 2274 W。表明 INDI 在消除漂移的同时，并未引入高频抖动或额外能耗。",
              "vocab": [
                {
                  "word": "consumption",
                  "ipa": "kənˈsəmpʃn",
                  "meaning": "n. 消费；消耗",
                  "level": "green"
                },
                {
                  "word": "expenditure",
                  "ipa": "ɪkˈspendɪtʃər",
                  "meaning": "n. 支出；消费",
                  "level": "green"
                },
                {
                  "word": "continuous",
                  "ipa": "kənˈtɪnjuəs",
                  "meaning": "adj. 连续的；不断的",
                  "level": "green"
                },
                {
                  "word": "quadratic",
                  "ipa": "/kwɒˈdrætɪk/",
                  "meaning": "二次型的，平方的",
                  "level": "green"
                },
                {
                  "word": "energy",
                  "ipa": "ˈɛnərdʒi",
                  "meaning": "n. 能量；精力；活力",
                  "level": "green"
                },
                {
                  "word": "power",
                  "ipa": "",
                  "meaning": "n. 力量，权力；v.推动，驱动",
                  "level": "green"
                },
                {
                  "word": "drift",
                  "ipa": "/drɪft/",
                  "meaning": "漂移，侧向偏差",
                  "level": "red"
                },
                {
                  "word": "extra",
                  "ipa": "ˈɛkstrə",
                  "meaning": "adj.额外的,附加的 n.附加物,额外的东西",
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
                },
                {
                  "word": "fbl",
                  "ipa": "/ˌef.biːˈel/",
                  "meaning": "反馈线性化 (Feedback Linearization)",
                  "level": "blue"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-concl",
      "sectionNumber": "四",
      "title": "IV. CONCLUSION & FUTURE OUTLOOK",
      "chineseTitle": "四、主要结论与未来展望 (IV. CONCLUSION)",
      "paragraphs": [
        {
          "pIndex": 19,
          "logicRole": "三大核心学术结论与容错控制展望",
          "mainIdea": "开创性在 6-DOF 水下机器人实现 INDI；大幅缩短建模调试周期；具备天然推力故障容错重构控制潜力。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P19-S1",
              "text": "1. Breakthrough Validation of Underwater INDI: This work provides the first successful realization of 6-DOF INDI on a physical marine robot, proving significant performance gains over Feedback Linearization in agile maneuvers and station keeping.",
              "translation": "1. 水下 INDI 控制的开创性验证：本文首次在真实 6-DOF 水下航行器上成功实现了增量非线性动态逆控制，水池试验全面证明其在大角度特技机动与定点悬停中显著超越经典基于模型的反馈线性化。",
              "vocab": [
                {
                  "word": "feedback linearization",
                  "ipa": "/ˈfiːdbæk ˌlɪniəraɪˈzeɪʃn/",
                  "meaning": "反馈线性化控制",
                  "level": "blue"
                },
                {
                  "word": "station keeping",
                  "ipa": "/ˈsteɪʃn ˈkiːpɪŋ/",
                  "meaning": "定点悬停，动力定位保持",
                  "level": "blue"
                },
                {
                  "word": "breakthrough",
                  "ipa": "/ˈbreɪkθruː/",
                  "meaning": "突破，重大技术进展",
                  "level": "red"
                },
                {
                  "word": "significant",
                  "ipa": "sɪɡˈnɪfɪkənt",
                  "meaning": "adj.重要的；显著的；意味深长的",
                  "level": "green"
                },
                {
                  "word": "performance",
                  "ipa": "pəˈfɔːm",
                  "meaning": "n. 演出，表演",
                  "level": "green"
                },
                {
                  "word": "validation",
                  "ipa": "/ˌvælɪˈdeɪʃn/",
                  "meaning": "验证，证实",
                  "level": "green"
                },
                {
                  "word": "successful",
                  "ipa": "səkˈsesfʊl",
                  "meaning": "adj. 成功的,有",
                  "level": "green"
                },
                {
                  "word": "maneuvers",
                  "ipa": "/məˈnuːvəz/",
                  "meaning": "机动（复数）",
                  "level": "red"
                },
                {
                  "word": "physical",
                  "ipa": "ˈfɪzɪk(ə)l",
                  "meaning": "adj.物理的；身体的；物质的 n.体检",
                  "level": "green"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red"
                },
                {
                  "word": "station",
                  "ipa": "",
                  "meaning": "n.火车站；公共汽车站；长途汽车站；站；所；局；电台；社会地位",
                  "level": "red"
                },
                {
                  "word": "marine",
                  "ipa": "",
                  "meaning": "adj.海的；海产的；海生的；海船的；货船的；海上贸易的",
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
                  "word": "work",
                  "ipa": "wɜ:rk",
                  "meaning": "n.工作(量);作品;[pl.]工厂 v.工作;运转",
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
              "sIndex": 2,
              "id": "P19-S2",
              "text": "2. Minimal Modeling Burden: Unlike conventional controllers requiring dozens of hydrodynamic coefficients, INDI relies solely on total mass matrix $\\boldsymbol{M}$ and thruster configuration $\\boldsymbol{B}$, drastically slashing commissioning time.",
              "translation": "2. 极小化建模负担：传统水下控制需要辨识数十个复杂流体动力学系数，而 INDI 仅需一个惯性矩阵 $\\boldsymbol{M}$ 和推进器配置矩阵 $\\boldsymbol{B}$，大幅缩短了水下机器人的控制调试周期。",
              "vocab": [
                {
                  "word": "conventional",
                  "ipa": "/kənˈvenʃənl/",
                  "meaning": "传统的；常规的（常用释义：按惯例的；普通的）",
                  "level": "red"
                },
                {
                  "word": "hydrodynamic",
                  "ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/",
                  "meaning": "水动力学的，流体动力学的",
                  "level": "red"
                },
                {
                  "word": "drastically",
                  "ipa": "ˈdræstɪkəli",
                  "meaning": "adv. 彻底地；激烈地",
                  "level": "green"
                },
                {
                  "word": "thruster",
                  "ipa": "/ˈθrʌstə/",
                  "meaning": "推进器（水下无刷推进电机）",
                  "level": "red"
                },
                {
                  "word": "minimal",
                  "ipa": "ˈmɪnɪm(ə)l",
                  "meaning": "adj.极小的，极少的",
                  "level": "green"
                },
                {
                  "word": "burden",
                  "ipa": "ˈbɜːrdn",
                  "meaning": "n.负担；重担 v.烦扰，使负重担",
                  "level": "green"
                },
                {
                  "word": "unlike",
                  "ipa": "",
                  "meaning": "prep.不像，和……不同；不是……的个性；与……不同",
                  "level": "red"
                },
                {
                  "word": "solely",
                  "ipa": "ˈsəʊlli",
                  "meaning": "adv. 单独地；唯一地",
                  "level": "green"
                },
                {
                  "word": "total",
                  "ipa": "ˈtəʊt(ə)l",
                  "meaning": "adj. 总数的;总括的;完",
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
              "sIndex": 3,
              "id": "P19-S3",
              "text": "3. Future Outlook on Fault-Tolerant Control: INDI inherently possesses fault tolerance; when thrusters degrade or face weed entanglement, adaptive INDI with acceleration feedback can achieve direct reconfigurable control without explicit fault diagnosis modules.",
              "translation": "3. 未来研究方向：INDI 天然具备推力故障容错潜力（Fault-Tolerant Control）。当推进器发生局部失效或水草缠绕衰减时，结合加速度反馈的自适应 INDI 有望在无需显式故障诊断模块的情况下直接实现重构控制。",
              "vocab": [
                {
                  "word": "fault-tolerant",
                  "ipa": "/fɔːlt ˈtɒlərənt/",
                  "meaning": "容错的，具备容错控制能力的",
                  "level": "blue"
                },
                {
                  "word": "reconfigurable",
                  "ipa": "/ˌriːkənˈfɪɡjərəbl/",
                  "meaning": "可重构的，自重构控制的",
                  "level": "blue"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "inherently",
                  "ipa": "/ɪnˈherəntli/",
                  "meaning": "本质上地；内在地（常用释义：固有地；天生地）",
                  "level": "red"
                },
                {
                  "word": "tolerance",
                  "ipa": "ˈtɑːlərəns",
                  "meaning": "n.忍受，容忍；忍耐力；公差",
                  "level": "green"
                },
                {
                  "word": "thrusters",
                  "ipa": "/ˈθrʌstəz/",
                  "meaning": "推进器（复数）",
                  "level": "red"
                },
                {
                  "word": "diagnosis",
                  "ipa": "/ˌdaɪəɡˈnəʊsɪs/",
                  "meaning": "诊断结果；疾病诊断（常用释义：诊断；判断）",
                  "level": "green"
                },
                {
                  "word": "adaptive",
                  "ipa": "/əˈdæptɪv/",
                  "meaning": "自适应的",
                  "level": "red"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red"
                },
                {
                  "word": "explicit",
                  "ipa": "ɪkˈsplɪsɪt",
                  "meaning": "adj.详述的,明确的;坦率的;显然的",
                  "level": "red"
                },
                {
                  "word": "outlook",
                  "ipa": "",
                  "meaning": "n.看法，态度；前景，展望；景色，风光；瞭望处",
                  "level": "red"
                },
                {
                  "word": "degrade",
                  "ipa": "dɪˈɡreɪd",
                  "meaning": "v.侮辱，贬低；降低（尤指质量）；降解",
                  "level": "green"
                },
                {
                  "word": "direct",
                  "ipa": "/dəˈrekt/",
                  "meaning": "引导；掌控；使朝某方向发展（常用释义：adj. 直接的；v. 指挥、指导、管理）",
                  "level": "red"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue"
                },
                {
                  "word": "weed",
                  "ipa": "wiːd",
                  "meaning": "n. 杂草 vt. 除草",
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
