window.BISHE_DATA = window.BISHE_DATA || {};
window.BISHE_DATA['paper2'] = {
  "id": "paper2",
  "title": "Adaptive Incremental Nonlinear Dynamic Inversion for Attitude Control of Micro Air Vehicles",
  "chineseTitle": "微型飞行器姿态控制的自适应增量非线性动态逆（A-INDI）",
  "authors": "Ewoud J. J. Smeur, Qiping Chu (楚启平), Guido C. H. E. de Croon",
  "journal": "AIAA Journal of Guidance, Control, and Dynamics (JGCD), Vol. 39, No. 3, 2016",
  "venue": "荷兰代尔夫特理工大学航空航天工程学院控制与仿真系 / MAVLab（Delft University of Technology）",
  "video": "",
  "code": "https://github.com/paparazzi/paparazzi",
  "overview": "本文针对微型飞行器（MAV）在未知复杂气流下的姿态控制难题，提出了基于传感器的自适应增量非线性动态逆（A-INDI）控制架构。通过引入时序同步低通滤波补偿彻底根除了传感器延迟引发的极限环自激震荡；利用 NLMS 在线自适应算法实时辨识时变控制效能矩阵；显式计入螺旋桨转子角动量使偏航上升时间缩短 40%；实飞验证在 50g 突发阶跃卸载下抗扰恢复速度比传统 PID 快 5 倍。",
  "sections": [
    {
      "id": "sec-abstract",
      "sectionNumber": "摘要",
      "title": "ABSTRACT",
      "chineseTitle": "论文摘要 (Abstract)",
      "paragraphs": [
        {
          "pIndex": 1,
          "logicRole": "研究背景与 INDI 核心理论优势",
          "mainIdea": "增量非线性动态逆 (INDI) 是一种基于传感器的控制方法，免除精确动力学建模，仅依赖控制效能模型并通过角加速度实测值替代传统物理项。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "Incremental nonlinear dynamic inversion is a sensor-based control approach that promises to provide high-performance nonlinear control without requiring a detailed model of the controlled vehicle.",
              "translation": "增量非线性动态逆（Incremental Nonlinear Dynamic Inversion, INDI）是一种基于传感器的非线性控制方法，它有望在不需要被控对象精确数学模型的前提下实现高性能非线性控制。",
              "vocab": [
                {
                  "word": "dynamic inversion",
                  "ipa": "/daɪˈnæmɪk ɪnˈvɜːʃn/",
                  "meaning": "动态逆控制",
                  "level": "blue",
                  "zh": "动态逆"
                },
                {
                  "word": "incremental",
                  "ipa": "/ˌɪŋkrəˈmentl/",
                  "meaning": "增量的，逐拍差分的",
                  "level": "blue",
                  "zh": "增量"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red",
                  "zh": "非线性"
                },
                {
                  "word": "inversion",
                  "ipa": "/ɪnˈvɜːʃn/",
                  "meaning": "逆，动态逆求解",
                  "level": "blue",
                  "zh": "动态逆"
                },
                {
                  "word": "dynamic",
                  "ipa": "/daɪˈnæmɪk/",
                  "meaning": "动态的，动力学的",
                  "level": "red",
                  "zh": "动态"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green",
                  "zh": "模型"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "In the context of attitude control of micro air vehicles, incremental nonlinear dynamic inversion only uses a control effectiveness model and uses estimates of the angular accelerations to replace the rest of the model.",
              "translation": "在微型飞行器（MAV）姿态控制领域，INDI 仅依赖控制效能模型，而利用角加速度的实时传感器估计值来替代传统模型中的其余物理项。",
              "vocab": [
                {
                  "word": "control effectiveness",
                  "ipa": "/kənˈtrəʊl ɪˈfektɪvnəs/",
                  "meaning": "控制效能，控制增益矩阵 G1",
                  "level": "blue",
                  "zh": "控制效能"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能，有效性",
                  "level": "green",
                  "zh": "控制效能"
                },
                {
                  "word": "accelerations",
                  "ipa": "/əkˌseləˈreɪʃnz/",
                  "meaning": "加速度（复数）",
                  "level": "green",
                  "zh": "加速度"
                },
                {
                  "word": "estimates",
                  "ipa": "/ˈestɪmeɪts/",
                  "meaning": "估计值（复数）",
                  "level": "green",
                  "zh": "估计值"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red",
                  "zh": "姿态控制"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green",
                  "zh": "角加速度"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green",
                  "zh": "模型"
                },
                {
                  "word": "rest",
                  "ipa": "rɛst",
                  "meaning": "n. 休息；剩余部分 vi. 休息；依赖",
                  "level": "green",
                  "zh": "依赖"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 2,
          "logicRole": "工程落地两大核心技术瓶颈与方案",
          "mainIdea": "解决实际应用中测量与执行器延迟滞后、以及飞行中控制效能矩阵时变漂移两大瓶颈。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P2-S1",
              "text": "This paper provides solutions for two major challenges of incremental nonlinear dynamic inversion control: how to deal with measurement and actuator delays, and how to deal with a changing control effectiveness.",
              "translation": "本文针对 INDI 控制在实际工程应用中的两大核心挑战给出了完备的解决方案：1. 如何处理测量与执行器动力学引入的时钟延迟与滤波相位滞后；2. 如何应对飞行过程中控制效能矩阵的时变不确定性。",
              "vocab": [
                {
                  "word": "control effectiveness",
                  "ipa": "/kənˈtrəʊl ɪˈfektɪvnəs/",
                  "meaning": "控制效能，控制增益矩阵 G1",
                  "level": "blue",
                  "zh": "控制效能"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能，有效性",
                  "level": "green",
                  "zh": "控制效能"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机/推进器）",
                  "level": "red",
                  "zh": "执行器"
                },
                {
                  "word": "dynamic",
                  "ipa": "/daɪˈnæmɪk/",
                  "meaning": "动态的，动力学的",
                  "level": "red",
                  "zh": "动力学"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 3,
          "logicRole": "论文四大理论与工程贡献",
          "mainIdea": "提出时序同步滤波补偿、基于 NLMS 的 A-INDI 在线自适应辨识、显式补偿转子角动量、以及 Parrot Bebop 实机飞行验证。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P3-S1",
              "text": "The main contributions of this article are: 1) A proposed method to correctly take into account the delays occurring when deriving angular accelerations from angular rate measurements; 2) The introduction of adaptive incremental nonlinear dynamic inversion, which can estimate the control effectiveness online, eliminating the need for manual parameter estimation or tuning; 3) The incorporation of the momentum of the propellers in the controller, significantly enhancing yaw tracking response; 4) Real-world experiments on a Parrot Bebop quadrotor showing high performance, disturbance rejection under step load drops, and adaptiveness under bumper alterations.",
              "translation": "本文的主要理论与工程贡献包含以下四点：1) 提出了能够精确补偿从角速率差分推导角加速度时所引入滤波延迟的时序同步控制律；2) 提出了自适应增量非线性动态逆（Adaptive INDI, A-INDI）架构，利用在线自适应算法实时辨识控制效能参数，彻底免除了人工离线建模或增益整定；3) 在姿态控制律中显式计入了螺旋桨旋转角动量与瞬态加减速自旋力矩，显著增强了四旋翼偏航轴的响应带宽；4) 通过 Parrot Bebop 四旋翼无人机的大量实飞实验（包括突加载荷抛掷、加减防撞保护套自适应等）充分验证了该方法卓越的抗扰性、鲁棒性与自适应能力。",
              "vocab": [
                {
                  "word": "control effectiveness",
                  "ipa": "/kənˈtrəʊl ɪˈfektɪvnəs/",
                  "meaning": "控制效能，控制增益矩阵 G1",
                  "level": "blue",
                  "zh": "控制效能参数"
                },
                {
                  "word": "dynamic inversion",
                  "ipa": "/daɪˈnæmɪk ɪnˈvɜːʃn/",
                  "meaning": "动态逆控制",
                  "level": "blue",
                  "zh": "动态逆"
                },
                {
                  "word": "accelerations",
                  "ipa": "/əkˌseləˈreɪʃnz/",
                  "meaning": "加速度（复数）",
                  "level": "green",
                  "zh": "加速度"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能，有效性",
                  "level": "green",
                  "zh": "控制效能"
                },
                {
                  "word": "angular rate",
                  "ipa": "/ˈæŋɡjələ reɪt/",
                  "meaning": "角速率，角速度",
                  "level": "blue",
                  "zh": "角速率"
                },
                {
                  "word": "adaptiveness",
                  "ipa": "/əˈdæptɪvnəs/",
                  "meaning": "自适应性",
                  "level": "red",
                  "zh": "自适应能力"
                },
                {
                  "word": "incremental",
                  "ipa": "/ˌɪŋkrəˈmentl/",
                  "meaning": "增量的，逐拍差分的",
                  "level": "blue",
                  "zh": "增量"
                },
                {
                  "word": "experiments",
                  "ipa": "/ɪkˈsperɪmənts/",
                  "meaning": "实验（复数）",
                  "level": "green",
                  "zh": "实验"
                },
                {
                  "word": "estimation",
                  "ipa": "/ˌestɪˈmeɪʃn/",
                  "meaning": "估计，参数辨识",
                  "level": "green",
                  "zh": "辨识"
                },
                {
                  "word": "propellers",
                  "ipa": "/prəˈpeləz/",
                  "meaning": "螺旋桨（复数）",
                  "level": "red",
                  "zh": "螺旋桨"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red",
                  "zh": "非线性"
                },
                {
                  "word": "inversion",
                  "ipa": "/ɪnˈvɜːʃn/",
                  "meaning": "逆，动态逆求解",
                  "level": "blue",
                  "zh": "动态逆"
                },
                {
                  "word": "parameter",
                  "ipa": "/pəˈræmɪtə/",
                  "meaning": "参数",
                  "level": "green",
                  "zh": "参数"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼飞行器，四轴无人机",
                  "level": "red",
                  "zh": "四旋翼无人机"
                },
                {
                  "word": "rejection",
                  "ipa": "/rɪˈdʒekʃn/",
                  "meaning": "抑制，抗扰能力",
                  "level": "red",
                  "zh": "抗扰"
                },
                {
                  "word": "adaptive",
                  "ipa": "/əˈdæptɪv/",
                  "meaning": "自适应的",
                  "level": "red",
                  "zh": "自适应增量非线性动态逆"
                },
                {
                  "word": "estimate",
                  "ipa": "/ˈestɪmeɪt/",
                  "meaning": "估计，辨识",
                  "level": "green",
                  "zh": "辨识"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green",
                  "zh": "角加速度"
                },
                {
                  "word": "dynamic",
                  "ipa": "/daɪˈnæmɪk/",
                  "meaning": "动态的，动力学的",
                  "level": "red",
                  "zh": "动态"
                },
                {
                  "word": "method",
                  "ipa": "ˈmeθəd",
                  "meaning": "n. 方法，办法",
                  "level": "green",
                  "zh": "方法"
                },
                {
                  "word": "online",
                  "ipa": "/ˌɒnˈlaɪn/",
                  "meaning": "可通过互联网访问的；在线（常用释义：在线的；联网地）",
                  "level": "red",
                  "zh": "在线"
                },
                {
                  "word": "bebop",
                  "ipa": "/ˈbiːbɒp/",
                  "meaning": "Bebop（Parrot 出品的微型四旋翼机型）",
                  "level": "blue",
                  "zh": "Parrot Bebop"
                },
                {
                  "word": "take",
                  "ipa": "teɪk",
                  "meaning": "v. 携带，拿",
                  "level": "green",
                  "zh": "提出"
                },
                {
                  "word": "rate",
                  "ipa": "reɪt",
                  "meaning": "n.速率;等级;价格,费用 v.估价;评级,评价",
                  "level": "red",
                  "zh": "速率"
                },
                {
                  "word": "yaw",
                  "ipa": "/jɔː/",
                  "meaning": "偏航角 (Yaw)",
                  "level": "blue",
                  "zh": "偏航"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-nomenclature",
      "sectionNumber": "符号表",
      "title": "NOMENCLATURE",
      "chineseTitle": "命名与符号表 (Nomenclature)",
      "paragraphs": [
        {
          "pIndex": 4,
          "logicRole": "物理参数与动力学变量定义",
          "mainIdea": "定义机身尺寸 b, l，转动惯量 Iv, Ir，推力力矩常数 k1, k2，气动力矩 Ma，控制力矩 Mc，螺旋桨力矩 Mr，采样周期 Ts，电机转速 u，角速度 Omega，角加速度，虚拟指令 nu，效能矩阵 G1, G2, G3。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P4-S1",
              "text": "The key variables and system parameters are defined as follows.",
              "translation": "本文核心物理参数与动力学变量定义如下：",
              "vocab": [
                {
                  "word": "parameters",
                  "ipa": "/pəˈræmɪtəz/",
                  "meaning": "参数（复数）",
                  "level": "green",
                  "zh": "参数"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P4-S2",
              "text": "$b, l$: width and length of the vehicle $(m)$; $\\boldsymbol{I}_v, \\boldsymbol{I}_r$: moment of inertia matrices of the vehicle and rotor $(kg \\cdot m^2)$; $k_1, k_2$: rotor thrust and moment constants.",
              "translation": "$b, l$：飞行器宽度与长度 $(m)$；$\\boldsymbol{I}_v, \\boldsymbol{I}_r$：飞行器转动惯量矩阵与转子转动惯量矩阵 $(kg \\cdot m^2)$；$k_1, k_2$：旋翼推力常数与力矩常数；",
              "vocab": [
                {
                  "word": "vehicle",
                  "ipa": "ˈviːɪkl",
                  "meaning": "n.车辆,交通工具;媒介,载体",
                  "level": "red",
                  "zh": "飞行器"
                },
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "惯量，惯性",
                  "level": "red",
                  "zh": "转动惯量"
                },
                {
                  "word": "thrust",
                  "ipa": "/θrʌst/",
                  "meaning": "推力",
                  "level": "red",
                  "zh": "推力"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "旋翼，转子",
                  "level": "blue",
                  "zh": "转子"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P4-S3",
              "text": "$\\boldsymbol{M}_a, \\boldsymbol{M}_c, \\boldsymbol{M}_r$: aerodynamic moment, control moment, and rotor acceleration gyroscopic moment vectors $(N \\cdot m)$.",
              "translation": "$\\boldsymbol{M}_a$：作用在机体上的气动力矩矢量；$\\boldsymbol{M}_c$：执行机构产生的控制力矩矢量；$\\boldsymbol{M}_r$：螺旋桨加减速反作用陀螺力矩矢量 $(N \\cdot m)$；",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red",
                  "zh": "气动"
                },
                {
                  "word": "gyroscopic",
                  "ipa": "/ˌdʒaɪrəˈskɒpɪk/",
                  "meaning": "陀螺效应的，反作用陀螺力矩的",
                  "level": "red",
                  "zh": "陀螺力矩"
                }
              ]
            },
            {
              "sIndex": 4,
              "id": "P4-S4",
              "text": "$T_s$: controller sampling period $(s)$; $\\boldsymbol{u} = [\\omega_1, \\omega_2, \\omega_3, \\omega_4]^T$: motor speed input vector $(rad/s)$; $\\boldsymbol{\\Omega} = [p, q, r]^T$: body angular rate vector $(rad/s)$; $\\dot{\\boldsymbol{\\Omega}}$: angular acceleration $(rad/s^2)$.",
              "translation": "$T_s$：控制器采样时间周期 $(s)$；$\\boldsymbol{u} = [\\omega_1, \\omega_2, \\omega_3, \\omega_4]^T$：电机转速输入向量 $(rad/s)$；$\\boldsymbol{\\Omega} = [p, q, r]^T$：机体三轴角速度向量 $(rad/s)$；$\\dot{\\boldsymbol{\\Omega}}$：机体三轴角加速度向量 $(rad/s^2)$；",
              "vocab": [
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue",
                  "zh": "角加速度"
                },
                {
                  "word": "angular rate",
                  "ipa": "/ˈæŋɡjələ reɪt/",
                  "meaning": "角速率，角速度",
                  "level": "blue",
                  "zh": "角速度"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green",
                  "zh": "加速度"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green",
                  "zh": "角速度"
                },
                {
                  "word": "motor",
                  "ipa": "/ˈməʊtə/",
                  "meaning": "电动机，电机",
                  "level": "green",
                  "zh": "电机"
                },
                {
                  "word": "speed",
                  "ipa": "spiːd",
                  "meaning": "n. 速度 v.（使）加速",
                  "level": "green",
                  "zh": "速度"
                },
                {
                  "word": "input",
                  "ipa": "ˈɪnˌpʊt",
                  "meaning": "n./v.输入",
                  "level": "red",
                  "zh": "输入"
                }
              ]
            },
            {
              "sIndex": 5,
              "id": "P4-S5",
              "text": "$\\boldsymbol{\\nu}$: virtual control input (desired angular acceleration) $(rad/s^2)$; $\\boldsymbol{G}_1, \\boldsymbol{G}_2, \\boldsymbol{G}_3$: control effectiveness and rotor inertia mapping matrices.",
              "translation": "$\\boldsymbol{\\nu}$：虚拟控制输入量（期望角加速度）$(rad/s^2)$；$\\boldsymbol{G}_1, \\boldsymbol{G}_2, \\boldsymbol{G}_3$：控制效能与转子惯性映射矩阵。",
              "vocab": [
                {
                  "word": "control effectiveness",
                  "ipa": "/kənˈtrəʊl ɪˈfektɪvnəs/",
                  "meaning": "控制效能，控制增益矩阵 G1",
                  "level": "blue",
                  "zh": "控制效能"
                },
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue",
                  "zh": "角加速度"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能，有效性",
                  "level": "green",
                  "zh": "控制效能"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green",
                  "zh": "加速度"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green",
                  "zh": "角加速度"
                },
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "惯量，惯性",
                  "level": "red",
                  "zh": "惯性"
                },
                {
                  "word": "input",
                  "ipa": "ˈɪnˌpʊt",
                  "meaning": "n./v.输入",
                  "level": "red",
                  "zh": "输入"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "旋翼，转子",
                  "level": "blue",
                  "zh": "转子"
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
          "logicRole": "微型飞行器普及背景与 PID 控制局限",
          "mainIdea": "微型飞行器（MAV）因低成本计算平台与智能手机革命带来的惯导芯片而迅速普及；传统线性 PID 控制在强非线性与外界突发风扰下难以保证全包线高性能。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P5-S1",
              "text": "Micro air vehicles (MAVs) have increased in popularity as low-cost lightweight processors and inertial measurement units have become available through the smartphone revolution.",
              "translation": "得益于智能手机技术革命带来的低成本、轻量化微处理器与惯性测量单元（IMU），微型飞行器（MAV）受到了学术界与工业界的广泛关注与普及。",
              "vocab": [
                {
                  "word": "revolution",
                  "ipa": "ˌrevəˈluːʃ(ə)n",
                  "meaning": "n.革命；彻底变革；旋转",
                  "level": "green",
                  "zh": "革命"
                },
                {
                  "word": "inertial",
                  "ipa": "/ɪˈnɜːʃl/",
                  "meaning": "惯性的",
                  "level": "red",
                  "zh": "惯性"
                },
                {
                  "word": "mavs",
                  "ipa": "/ˈem.eɪ.viːz/",
                  "meaning": "微型飞行器（复数）",
                  "level": "blue",
                  "zh": "MAV"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P5-S2",
              "text": "The inertial sensors allow stabilization of unstable platforms by feedback algorithms. Typically, the stabilization algorithm used for MAVs is simple proportional integral derivative (PID) control.",
              "translation": "机载惯性传感器使得通过反馈控制算法稳定非固有稳定飞行平台成为可能。通常，MAV 采用的基准增稳算法是经典的比例-积分-微分（PID）控制。",
              "vocab": [
                {
                  "word": "algorithms",
                  "ipa": "/ˈælɡərɪðəmz/",
                  "meaning": "算法（复数）",
                  "level": "green",
                  "zh": "算法"
                },
                {
                  "word": "typically",
                  "ipa": "/ˈtɪpɪkli/",
                  "meaning": "通常；一般来说（常用释义：典型地；通常）",
                  "level": "red",
                  "zh": "通常"
                },
                {
                  "word": "algorithm",
                  "ipa": "/ˈælɡərɪðəm/",
                  "meaning": "算法",
                  "level": "green",
                  "zh": "算法"
                },
                {
                  "word": "inertial",
                  "ipa": "/ɪˈnɜːʃl/",
                  "meaning": "惯性的",
                  "level": "red",
                  "zh": "惯性"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red",
                  "zh": "反馈"
                },
                {
                  "word": "mavs",
                  "ipa": "/ˈem.eɪ.viːz/",
                  "meaning": "微型飞行器（复数）",
                  "level": "blue",
                  "zh": "MAV"
                },
                {
                  "word": "pid",
                  "ipa": "/ˌpiː.aɪˈdiː/",
                  "meaning": "比例-积分-微分控制器 (Proportional-Integral-Derivative)",
                  "level": "blue",
                  "zh": "PID"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P5-S3",
              "text": "Problems with PID control occur when the vehicle is highly nonlinear or when the vehicle is subject to large disturbances like wind gusts.",
              "translation": "然而，当飞行器处于强非线性大姿态机动状态，或遭遇阵风紊流等突发外界强扰动时，PID 控制器的性能会显著恶化。",
              "vocab": [
                {
                  "word": "disturbances",
                  "ipa": "/dɪˈstɜːbənsɪz/",
                  "meaning": "扰动（复数）",
                  "level": "red",
                  "zh": "扰动"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red",
                  "zh": "非线性"
                },
                {
                  "word": "vehicle",
                  "ipa": "ˈviːɪkl",
                  "meaning": "n.车辆,交通工具;媒介,载体",
                  "level": "red",
                  "zh": "飞行器"
                },
                {
                  "word": "pid",
                  "ipa": "/ˌpiː.aɪˈdiː/",
                  "meaning": "比例-积分-微分控制器 (Proportional-Integral-Derivative)",
                  "level": "blue",
                  "zh": "PID 控制器"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 6,
          "logicRole": "基于模型的非线性动态逆 (NDI) 痛点",
          "mainIdea": "非线性动态逆 (NDI) 虽能在理论上去除全部非线性，但对模型精度极其敏感；而在微型无人机上获取高精度气动与动力学模型极难实现且代价昂贵。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P6-S1",
              "text": "Alternatively, we could opt for a model-based attitude controller such as nonlinear dynamic inversion (NDI), which involves modeling all of the MAV's forces and dynamics.",
              "translation": "另一种选择是采用基于模型的姿态控制器，例如非线性动态逆（NDI），它需要对 MAV 的全部受力与动力学方程进行精确数学建模。",
              "vocab": [
                {
                  "word": "dynamic inversion",
                  "ipa": "/daɪˈnæmɪk ɪnˈvɜːʃn/",
                  "meaning": "动态逆控制",
                  "level": "blue",
                  "zh": "动态逆"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red",
                  "zh": "非线性"
                },
                {
                  "word": "inversion",
                  "ipa": "/ɪnˈvɜːʃn/",
                  "meaning": "逆，动态逆求解",
                  "level": "blue",
                  "zh": "动态逆"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red",
                  "zh": "姿态控制"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学，动态特性",
                  "level": "red",
                  "zh": "动力学"
                },
                {
                  "word": "dynamic",
                  "ipa": "/daɪˈnæmɪk/",
                  "meaning": "动态的，动力学的",
                  "level": "red",
                  "zh": "动态"
                },
                {
                  "word": "opt",
                  "ipa": "ɒpt",
                  "meaning": "v. 选择",
                  "level": "green",
                  "zh": "选择"
                },
                {
                  "word": "ndi",
                  "ipa": "/ˌen.diːˈaɪ/",
                  "meaning": "非线性动态逆 (Nonlinear Dynamic Inversion)",
                  "level": "blue",
                  "zh": "非线性动态逆"
                },
                {
                  "word": "mav",
                  "ipa": "/ˈem.eɪ.viː/",
                  "meaning": "微型飞行器 (Micro Air Vehicle)",
                  "level": "blue",
                  "zh": "MAV"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P6-S2",
              "text": "Theoretically, this method can remove all nonlinearities from the system and create a linearizing control law.",
              "translation": "在理论上，NDI 能够消除受控系统的全部非线性项，从而构建一个严格解耦的线性化控制律。",
              "vocab": [
                {
                  "word": "system",
                  "ipa": "ˈsɪstəm",
                  "meaning": "n. 体系；系统",
                  "level": "green",
                  "zh": "系统"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P6-S3",
              "text": "However, NDI is very sensitive to model inaccuracies. Obtaining an accurate model is often expensive or impossible with the constraints of the sensors carried onboard a small MAV.",
              "translation": "然而，NDI 对模型不确定性与参数误差极其敏感。受限于微型无人机搭载的低成本传感器，获取精确的物理模型往往代价高昂甚至在工程上不可行。",
              "vocab": [
                {
                  "word": "accurate",
                  "ipa": "ˈækjərət",
                  "meaning": "adj. 正确无误的,精确的",
                  "level": "green",
                  "zh": "精确的"
                },
                {
                  "word": "however",
                  "ipa": "/haʊˈevə/",
                  "meaning": "然而、不过（常用释义：无论如何）",
                  "level": "red",
                  "zh": "然而"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green",
                  "zh": "模型"
                },
                {
                  "word": "ndi",
                  "ipa": "/ˌen.diːˈaɪ/",
                  "meaning": "非线性动态逆 (Nonlinear Dynamic Inversion)",
                  "level": "blue",
                  "zh": "NDI"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 7,
          "logicRole": "增量非线性动态逆 (INDI) 的破局理念",
          "mainIdea": "INDI 不再依赖对全状态动力学的离线预先建模，而是以 IMU 实测角加速度作为基准，计算输入增量以消除全部未建模动态与外界阵风。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P7-S1",
              "text": "The incremental form of nonlinear dynamic inversion (INDI) is less model-dependent and more robust.",
              "translation": "相比之下，增量非线性动态逆（Incremental NDI, INDI）对模型的依赖性大幅降低，且具有更强的鲁棒性。",
              "vocab": [
                {
                  "word": "dynamic inversion",
                  "ipa": "/daɪˈnæmɪk ɪnˈvɜːʃn/",
                  "meaning": "动态逆控制",
                  "level": "blue",
                  "zh": "动态逆"
                },
                {
                  "word": "incremental",
                  "ipa": "/ˌɪŋkrəˈmentl/",
                  "meaning": "增量的，逐拍差分的",
                  "level": "blue",
                  "zh": "增量"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red",
                  "zh": "非线性"
                },
                {
                  "word": "inversion",
                  "ipa": "/ɪnˈvɜːʃn/",
                  "meaning": "逆，动态逆求解",
                  "level": "blue",
                  "zh": "动态逆"
                },
                {
                  "word": "dynamic",
                  "ipa": "/daɪˈnæmɪk/",
                  "meaning": "动态的，动力学的",
                  "level": "red",
                  "zh": "动态"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue",
                  "zh": "INDI"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P7-S2",
              "text": "Compared to NDI, instead of modeling angular acceleration based on the state and inverting the actuator model to get the control input, the angular acceleration is directly measured, and an increment of the control input is calculated based on a desired increment in angular acceleration.",
              "translation": "相比传统 NDI 依据全系统状态预测角加速度并对执行器求逆，INDI 直接利用传感器实时测量当前角加速度，并根据期望的角加速度增量计算控制输入的微分增量。",
              "vocab": [
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue",
                  "zh": "角加速度"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green",
                  "zh": "加速度"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机/推进器）",
                  "level": "red",
                  "zh": "执行器"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green",
                  "zh": "角加速度"
                },
                {
                  "word": "state",
                  "ipa": "/steɪt/",
                  "meaning": "正式陈述；说明（常用释义：状态；州；国家；陈述）",
                  "level": "red",
                  "zh": "状态"
                },
                {
                  "word": "input",
                  "ipa": "ˈɪnˌpʊt",
                  "meaning": "n./v.输入",
                  "level": "red",
                  "zh": "输入"
                },
                {
                  "word": "ndi",
                  "ipa": "/ˌen.diːˈaɪ/",
                  "meaning": "非线性动态逆 (Nonlinear Dynamic Inversion)",
                  "level": "blue",
                  "zh": "NDI"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P7-S3",
              "text": "This way, any unmodeled dynamics, including wind gust disturbances, are measured and compensated. Because INDI makes use of a sensor measurement to replace a large part of the model, it is considered a sensor-based approach.",
              "translation": "通过这种方式，包括阵风扰动在内的全部未建模动态均被传感器直接捕捉并在下一拍予以补偿。由于 INDI 利用高频传感器测量替代了绝大部分物理动力学模型，因此被归类为一种基于传感器的控制方法。",
              "vocab": [
                {
                  "word": "disturbances",
                  "ipa": "/dɪˈstɜːbənsɪz/",
                  "meaning": "扰动（复数）",
                  "level": "red",
                  "zh": "扰动"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学，动态特性",
                  "level": "red",
                  "zh": "动力学"
                },
                {
                  "word": "model",
                  "ipa": "ˈmɒdl",
                  "meaning": "n. 模型；典型；模特儿 vt. 模拟；塑造",
                  "level": "green",
                  "zh": "模型"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue",
                  "zh": "INDI"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 8,
          "logicRole": "INDI 工程落地两大核心挑战与本文贡献",
          "mainIdea": "角加速度微分滤波引入时间延迟容易激发极限环振荡；控制效能矩阵在飞行中因电压下降与载荷变化而时变；本文提出时序同步滤波与自适应 A-INDI 完备解决。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P8-S1",
              "text": "INDI faces two major challenges: first, measurement of angular acceleration is noisy and requires filtering, which introduces phase lag; second, control effectiveness continuously drifts during flight due to battery drops and payload changes.",
              "translation": "在 MAV 上实现 INDI 面临两大核心挑战：首先，角加速度测量信号存在噪声，必须进行低通滤波，这引入了显著的相位滞后；其次，控制效能矩阵在飞行过程中会因电池电压下降、载荷增减等因素持续漂移。",
              "vocab": [
                {
                  "word": "control effectiveness",
                  "ipa": "/kənˈtrəʊl ɪˈfektɪvnəs/",
                  "meaning": "控制效能，控制增益矩阵 G1",
                  "level": "blue",
                  "zh": "控制效能"
                },
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue",
                  "zh": "角加速度"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能，有效性",
                  "level": "green",
                  "zh": "控制效能"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green",
                  "zh": "加速度"
                },
                {
                  "word": "filtering",
                  "ipa": "/ˈfɪltərɪŋ/",
                  "meaning": "滤波处理",
                  "level": "green",
                  "zh": "低通滤波"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green",
                  "zh": "角加速度"
                },
                {
                  "word": "battery",
                  "ipa": "ˈbætərɪ",
                  "meaning": "n. 电池",
                  "level": "green",
                  "zh": "电池"
                },
                {
                  "word": "drifts",
                  "ipa": "/drɪfts/",
                  "meaning": "漂移（复数）",
                  "level": "red",
                  "zh": "漂移"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue",
                  "zh": "INDI"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P8-S2",
              "text": "We show in this paper that perfect synchronization of input and measured output can be achieved by applying the filter used for gyroscope differentiation on the incremented input as well.",
              "translation": "本文证明：通过将用于陀螺仪差分的相同滤波器作用于控制输入增量通道，可以实现输入量与测量输出量之间的严格时序同步，彻底消除相位滞后引起的极限环振荡。",
              "vocab": [
                {
                  "word": "gyroscope",
                  "ipa": "/ˈdʒaɪrəskəʊp/",
                  "meaning": "陀螺仪",
                  "level": "blue",
                  "zh": "陀螺仪"
                },
                {
                  "word": "output",
                  "ipa": "ˈaʊtpʊt",
                  "meaning": "n. 产量，输出量",
                  "level": "green",
                  "zh": "输出量"
                },
                {
                  "word": "filter",
                  "ipa": "/ˈfɪltə/",
                  "meaning": "滤波器",
                  "level": "green",
                  "zh": "滤波器"
                },
                {
                  "word": "input",
                  "ipa": "ˈɪnˌpʊt",
                  "meaning": "n./v.输入",
                  "level": "red",
                  "zh": "输入"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P8-S3",
              "text": "Furthermore, we propose an online Normalized Least Mean Squares (NLMS) scheme to adaptively estimate the control effectiveness matrix, and incorporate propeller spin-up torque to enhance yaw bandwidth.",
              "translation": "此外，我们提出了基于归一化最小均方误差（NLMS）的在线自适应估计方案实时追踪控制效能矩阵，并显式计入螺旋桨转子自旋加速力矩以大幅提升偏航轴响应带宽。",
              "vocab": [
                {
                  "word": "control effectiveness",
                  "ipa": "/kənˈtrəʊl ɪˈfektɪvnəs/",
                  "meaning": "控制效能，控制增益矩阵 G1",
                  "level": "blue",
                  "zh": "控制效能"
                },
                {
                  "word": "least mean squares",
                  "ipa": "/liːst miːn skweəz/",
                  "meaning": "最小均方算法",
                  "level": "blue",
                  "zh": "最小均方误差"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能，有效性",
                  "level": "green",
                  "zh": "控制效能"
                },
                {
                  "word": "normalized",
                  "ipa": "/ˈnɔːməlaɪzd/",
                  "meaning": "归一化的",
                  "level": "green",
                  "zh": "归一化"
                },
                {
                  "word": "propeller",
                  "ipa": "/prəˈpelə/",
                  "meaning": "螺旋桨，桨叶",
                  "level": "red",
                  "zh": "螺旋桨"
                },
                {
                  "word": "bandwidth",
                  "ipa": "/ˈbændwɪdθ/",
                  "meaning": "带宽（频域响应宽度）",
                  "level": "green",
                  "zh": "响应带宽"
                },
                {
                  "word": "estimate",
                  "ipa": "/ˈestɪmeɪt/",
                  "meaning": "估计，辨识",
                  "level": "green",
                  "zh": "估计"
                },
                {
                  "word": "online",
                  "ipa": "/ˌɒnˈlaɪn/",
                  "meaning": "可通过互联网访问的；在线（常用释义：在线的；联网地）",
                  "level": "red",
                  "zh": "在线"
                },
                {
                  "word": "torque",
                  "ipa": "/tɔːk/",
                  "meaning": "力矩，转矩",
                  "level": "red",
                  "zh": "力矩"
                },
                {
                  "word": "nlms",
                  "ipa": "/ˌen.el.emˈes/",
                  "meaning": "归一化最小均方误差算法 (Normalized LMS)",
                  "level": "blue",
                  "zh": "归一化最小均方误差"
                },
                {
                  "word": "yaw",
                  "ipa": "/jɔː/",
                  "meaning": "偏航角 (Yaw)",
                  "level": "blue",
                  "zh": "偏航"
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
      "title": "II. MICRO AIR VEHICLE MODEL",
      "chineseTitle": "二、微型飞行器动力学模型 (II. MICRO AIR VEHICLE MODEL)",
      "figure": {
        "image": "题库/毕设/images/paper2_fig2_indi_diagram.png",
        "caption": "Fig. 2: 基于角加速度传感器反馈与泰勒级数展开的增量非线性动态逆 (INDI) 控制回路原理框图 (AIAA JGCD 2016)",
        "alt": "Fig. 2: Incremental NDI architecture diagram"
      },
      "paragraphs": [
        {
          "pIndex": 9,
          "logicRole": "四旋翼刚体与转子动力学欧拉方程",
          "mainIdea": "考虑飞行器机体坐标系，四旋翼转动动力学由欧拉方程描述，包含电机控制力矩 Mc、气动力矩 Ma 与螺旋桨自旋加减速反扭矩 Mr。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P9-S1",
              "text": "The actuators drive four rotors with angular velocities in body frame given by $\\boldsymbol{\\omega}_i = [0, 0, \\omega_i]^T$, with vehicle width $b$ and length $l$.",
              "translation": "四旋翼的执行机构驱动 4 个转子，转子在机体系下的自转角速度为 $\\boldsymbol{\\omega}_i = [0, 0, \\omega_i]^T$，机体宽度为 $b$，机体长度为 $l$。",
              "vocab": [
                {
                  "word": "velocities",
                  "ipa": "/vəˈlɒsətiz/",
                  "meaning": "速度（复数）",
                  "level": "green",
                  "zh": "速度"
                },
                {
                  "word": "actuators",
                  "ipa": "/ˈæktʃueɪtəz/",
                  "meaning": "执行机构（复数）",
                  "level": "red",
                  "zh": "执行机构"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green",
                  "zh": "角速度"
                },
                {
                  "word": "rotors",
                  "ipa": "/ˈrəʊtəz/",
                  "meaning": "转子（复数）",
                  "level": "blue",
                  "zh": "转子"
                },
                {
                  "word": "body",
                  "ipa": "ˈbɒdi",
                  "meaning": "n.团体,机构",
                  "level": "red",
                  "zh": "机构"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P9-S2",
              "text": "Rotational dynamics are described by Euler's equation: $\\boldsymbol{I}_v \\dot{\\boldsymbol{\\Omega}} + \\boldsymbol{\\Omega} \\times (\\boldsymbol{I}_v \\boldsymbol{\\Omega}) = \\boldsymbol{M}_a(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\boldsymbol{M}_c - \\boldsymbol{M}_r$.",
              "translation": "飞行器转动动力学由欧拉方程描述：$\\boldsymbol{I}_v \\dot{\\boldsymbol{\\Omega}} + \\boldsymbol{\\Omega} \\times (\\boldsymbol{I}_v \\boldsymbol{\\Omega}) = \\boldsymbol{M}_a(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\boldsymbol{M}_c - \\boldsymbol{M}_r$。",
              "vocab": [
                {
                  "word": "rotational",
                  "ipa": "/rəʊˈteɪʃənl/",
                  "meaning": "转动的，旋转的",
                  "level": "green",
                  "zh": "转动"
                },
                {
                  "word": "dynamics",
                  "ipa": "/daɪˈnæmɪks/",
                  "meaning": "动力学，动态特性",
                  "level": "red",
                  "zh": "动力学"
                },
                {
                  "word": "equation",
                  "ipa": "ɪˈkweɪʒn",
                  "meaning": "n. 方程式；等式",
                  "level": "green",
                  "zh": "方程"
                },
                {
                  "word": "euler",
                  "ipa": "/ˈɔɪlər/",
                  "meaning": "欧拉（数学家名）",
                  "level": "blue",
                  "zh": "欧拉"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P9-S3",
              "text": "Control moment is $\\boldsymbol{M}_c = \\boldsymbol{M}_{c,\\text{matrix}} \\boldsymbol{\\omega}^2$, where $\\boldsymbol{\\omega}^2 = [\\omega_1^2, \\omega_2^2, \\omega_3^2, \\omega_4^2]^T$, and propeller gyroscopic and spin-up reaction torque is $\\boldsymbol{M}_r = \\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}} + \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_r \\boldsymbol{\\omega}$.",
              "translation": "控制力矩为 $\\boldsymbol{M}_c = \\boldsymbol{M}_{c,\\text{matrix}} \\boldsymbol{\\omega}^2$，螺旋桨转子自旋加速与陀螺力矩为 $\\boldsymbol{M}_r = \\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}} + \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_r \\boldsymbol{\\omega}$。",
              "vocab": [
                {
                  "word": "gyroscopic",
                  "ipa": "/ˌdʒaɪrəˈskɒpɪk/",
                  "meaning": "陀螺效应的，反作用陀螺力矩的",
                  "level": "red",
                  "zh": "陀螺力矩"
                },
                {
                  "word": "propeller",
                  "ipa": "/prəˈpelə/",
                  "meaning": "螺旋桨，桨叶",
                  "level": "red",
                  "zh": "螺旋桨"
                },
                {
                  "word": "torque",
                  "ipa": "/tɔːk/",
                  "meaning": "力矩，转矩",
                  "level": "red",
                  "zh": "力矩"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 10,
          "logicRole": "全状态角加速度微分方程矩阵展开",
          "mainIdea": "结合惯量矩阵 Iv 与旋翼力矩常数，推导出完整的角加速度显式状态方程。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P10-S1",
              "text": "Combining terms yields total angular acceleration: $\\dot{\\boldsymbol{\\Omega}} = \\boldsymbol{F}(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\frac{1}{2} \\boldsymbol{G}_1 \\boldsymbol{\\omega}^2 - T_s \\boldsymbol{G}_2 \\dot{\\boldsymbol{\\omega}} - \\boldsymbol{C}(\\boldsymbol{\\Omega}) \\boldsymbol{G}_3 \\boldsymbol{\\omega}$.",
              "translation": "综合整理角加速度表达式：$\\dot{\\boldsymbol{\\Omega}} = \\boldsymbol{F}(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\frac{1}{2} \\boldsymbol{G}_1 \\boldsymbol{\\omega}^2 - T_s \\boldsymbol{G}_2 \\dot{\\boldsymbol{\\omega}} - \\boldsymbol{C}(\\boldsymbol{\\Omega}) \\boldsymbol{G}_3 \\boldsymbol{\\omega}$。",
              "vocab": [
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue",
                  "zh": "角加速度"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green",
                  "zh": "加速度"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green",
                  "zh": "角加速度"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P10-S2",
              "text": "Here $\\boldsymbol{F}(\\boldsymbol{\\Omega}, \\boldsymbol{v}) = \\boldsymbol{I}_v^{-1} (\\boldsymbol{M}_a - \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_v \\boldsymbol{\\Omega})$ encompasses aerodynamic damping and rigid-body Coriolis torques.",
              "translation": "其中 $\\boldsymbol{F}(\\boldsymbol{\\Omega}, \\boldsymbol{v}) = \\boldsymbol{I}_v^{-1} (\\boldsymbol{M}_a - \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_v \\boldsymbol{\\Omega})$ 包含了气动阻尼力矩与刚体科氏力矩项。",
              "vocab": [
                {
                  "word": "encompasses",
                  "ipa": "/ɪnˈkʌmpəsɪz/",
                  "meaning": "包含，囊括",
                  "level": "red",
                  "zh": "包含"
                },
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red",
                  "zh": "气动"
                },
                {
                  "word": "coriolis",
                  "ipa": "/ˌkɒriˈəʊlɪs/",
                  "meaning": "科氏力，向心力矩阵",
                  "level": "red",
                  "zh": "科氏力"
                },
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼，黏性阻力",
                  "level": "red",
                  "zh": "阻尼"
                },
                {
                  "word": "torques",
                  "ipa": "/tɔːks/",
                  "meaning": "力矩（复数）",
                  "level": "red",
                  "zh": "力矩"
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
      "title": "III. INCREMENTAL NONLINEAR DYNAMIC INVERSION",
      "chineseTitle": "三、增量非线性动态逆与时序同步滤波补偿 (III. INCREMENTAL NDI)",
      "figure": {
        "image": "题库/毕设/images/paper2_fig5_filter_compensation.png",
        "caption": "Fig. 5: 消除相位滞后与极限环振荡的时序对称低通滤波补偿结构控制框图 (AIAA JGCD 2016)",
        "alt": "Fig. 5: Filter delay compensation block diagram"
      },
      "paragraphs": [
        {
          "pIndex": 11,
          "logicRole": "一阶泰勒级数展开与 INDI 增量方程",
          "mainIdea": "在上一采样时刻展开，利用传感器测量的实际角加速度 dot(Omega0) 替代非线性物理模型项 F(Omega, v)，推导核心增量映射。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P11-S1",
              "text": "Applying a first-order Taylor expansion around previous sample point $(\\boldsymbol{\\Omega}_0, \\boldsymbol{\\omega}_0)$ and replacing nonlinear terms $\\boldsymbol{F}(\\boldsymbol{\\Omega}, \\boldsymbol{v})$ with sensor-measured $\\dot{\\boldsymbol{\\Omega}}_0$ yields the core INDI equation: $\\dot{\\boldsymbol{\\Omega}} \\approx \\dot{\\boldsymbol{\\Omega}}_0 + \\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_0)(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0) + \\boldsymbol{G}_2(\\dot{\\boldsymbol{\\omega}} - \\dot{\\boldsymbol{\\omega}}_0) - \\boldsymbol{C}(\\boldsymbol{\\Omega}_0)\\boldsymbol{G}_3(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0)$.",
              "translation": "在上一时刻采样点 $(\\boldsymbol{\\Omega}_0, \\boldsymbol{\\omega}_0)$ 附近进行一阶泰勒展开，并利用传感器测量的实际角加速度 $\\dot{\\boldsymbol{\\Omega}}_0$ 替代非线性物理模型项 $\\boldsymbol{F}(\\boldsymbol{\\Omega}, \\boldsymbol{v})$，得到 **INDI 核心增量方程**：$\\dot{\\boldsymbol{\\Omega}} \\approx \\dot{\\boldsymbol{\\Omega}}_0 + \\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_0)(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0) + \\boldsymbol{G}_2(\\dot{\\boldsymbol{\\omega}} - \\dot{\\boldsymbol{\\omega}}_0) - \\boldsymbol{C}(\\boldsymbol{\\Omega}_0)\\boldsymbol{G}_3(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0)$。",
              "vocab": [
                {
                  "word": "taylor expansion",
                  "ipa": "/ˈteɪlər ɪkˈspænʃn/",
                  "meaning": "泰勒一阶展开",
                  "level": "blue",
                  "zh": "一阶泰勒展开"
                },
                {
                  "word": "expansion",
                  "ipa": "/ɪkˈspænʃn/",
                  "meaning": "展开，级数展开",
                  "level": "green",
                  "zh": "展开"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red",
                  "zh": "非线性"
                },
                {
                  "word": "equation",
                  "ipa": "ɪˈkweɪʒn",
                  "meaning": "n. 方程式；等式",
                  "level": "green",
                  "zh": "方程"
                },
                {
                  "word": "taylor",
                  "ipa": "/ˈteɪlər/",
                  "meaning": "泰勒（数学家名）",
                  "level": "blue",
                  "zh": "泰勒"
                },
                {
                  "word": "indi",
                  "ipa": "/ˈɪndi/",
                  "meaning": "增量非线性动态逆 (Incremental Nonlinear Dynamic Inversion)",
                  "level": "blue",
                  "zh": "INDI"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 12,
          "logicRole": "低通滤波相位延迟与时序同步虚拟控制律",
          "mainIdea": "陀螺仪差分信号经过二阶巴特沃斯低通滤波器 H(z) 引入时间滞后；将执行机构控制量引入对称滤波通道推导时序同步控制律，彻底根除自激震荡。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P12-S1",
              "text": "Sensor differentiation followed by a second-order Butterworth low-pass filter $H(z)$ introduces filter lag, causing measured acceleration $\\dot{\\boldsymbol{\\Omega}}_f$ to reflect past motor speed $\\boldsymbol{\\omega}_f$.",
              "translation": "传感器端：陀螺仪差分信号经过二阶巴特沃斯低通滤波器 $H(z)$ 引入了滤波延迟，导致测得的角加速度 $\\dot{\\boldsymbol{\\Omega}}_f$ 实际反映的是过去时刻的电机转速 $\\boldsymbol{\\omega}_f$。",
              "vocab": [
                {
                  "word": "low-pass filter",
                  "ipa": "/ləʊ pɑːs ˈfɪltə/",
                  "meaning": "低通滤波器",
                  "level": "blue",
                  "zh": "低通滤波器"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green",
                  "zh": "加速度"
                },
                {
                  "word": "butterworth",
                  "ipa": "/ˈbʌtəwɜːθ/",
                  "meaning": "巴特沃斯低通滤波器",
                  "level": "blue",
                  "zh": "巴特沃斯低通滤波器"
                },
                {
                  "word": "low-pass",
                  "ipa": "/ləʊ pɑːs/",
                  "meaning": "低通的",
                  "level": "blue",
                  "zh": "低通滤波"
                },
                {
                  "word": "reflect",
                  "ipa": "rɪˈflekt",
                  "meaning": "v. 反映，反射",
                  "level": "green",
                  "zh": "反映"
                },
                {
                  "word": "filter",
                  "ipa": "/ˈfɪltə/",
                  "meaning": "滤波器",
                  "level": "green",
                  "zh": "滤波器"
                },
                {
                  "word": "motor",
                  "ipa": "/ˈməʊtə/",
                  "meaning": "电动机，电机",
                  "level": "green",
                  "zh": "电机"
                },
                {
                  "word": "speed",
                  "ipa": "spiːd",
                  "meaning": "n. 速度 v.（使）加速",
                  "level": "green",
                  "zh": "速度"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P12-S2",
              "text": "To eliminate phase mismatch and stabilize the closed loop, we route the actuator command through an identical matched filter channel $\\boldsymbol{\\omega}_f$: $\\boldsymbol{\\omega}_c = \\boldsymbol{\\omega}_f + [\\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_f) + \\boldsymbol{G}_2 - \\boldsymbol{C}(\\boldsymbol{\\Omega}_f)\\boldsymbol{G}_3]^\\dagger (\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_f + \\boldsymbol{G}_2 z^{-1}(\\boldsymbol{\\omega}_c - \\boldsymbol{\\omega}_f))$.",
              "translation": "为了消除相位失配引起的自激振荡，论文提出将执行机构控制量引入对称滤波通道：推导出时序同步虚拟控制律 $\\boldsymbol{\\omega}_c$。",
              "vocab": [
                {
                  "word": "eliminate",
                  "ipa": "/ɪˈlɪmɪneɪt/",
                  "meaning": "消除；取消（常用释义：消除；淘汰；排除）",
                  "level": "red",
                  "zh": "消除"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机/推进器）",
                  "level": "red",
                  "zh": "执行机构"
                },
                {
                  "word": "filter",
                  "ipa": "/ˈfɪltə/",
                  "meaning": "滤波器",
                  "level": "green",
                  "zh": "滤波"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P12-S3",
              "text": "This formulation mathematically guarantees adequate open-loop phase margin around crossover frequency, completely eradicating limit-cycle oscillations.",
              "translation": "该结构在数学上保证了开环传递函数在穿越频率处的相位裕度，彻底根除了未补偿 INDI 的极限环振荡。",
              "vocab": [
                {
                  "word": "phase margin",
                  "ipa": "/feɪz ˈmɑːdʒɪn/",
                  "meaning": "相位裕度",
                  "level": "blue",
                  "zh": "相位裕度"
                },
                {
                  "word": "oscillations",
                  "ipa": "/ˌɒsɪˈleɪʃnz/",
                  "meaning": "振荡，抖动（复数）",
                  "level": "red",
                  "zh": "振荡"
                },
                {
                  "word": "eradicating",
                  "ipa": "/ɪˈrædɪkeɪtɪŋ/",
                  "meaning": "根除中",
                  "level": "red",
                  "zh": "根除"
                },
                {
                  "word": "limit-cycle",
                  "ipa": "/ˈlɪmɪt saɪkl/",
                  "meaning": "极限环振荡（闭环自激震荡）",
                  "level": "red",
                  "zh": "极限环"
                },
                {
                  "word": "crossover",
                  "ipa": "/ˈkrɒsəʊvə/",
                  "meaning": "穿越频率 (Crossover Frequency)",
                  "level": "blue",
                  "zh": "穿越频率"
                },
                {
                  "word": "margin",
                  "ipa": "/ˈmɑːdʒɪn/",
                  "meaning": "裕度（如相位裕度/幅值裕度）",
                  "level": "green",
                  "zh": "相位裕度"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-adaptive",
      "sectionNumber": "四",
      "title": "IV. ADAPTIVE PARAMETER ESTIMATION (A-INDI)",
      "chineseTitle": "四、自适应参数在线估计（A-INDI） (IV. ADAPTIVE ESTIMATION)",
      "figure": {
        "image": "题库/毕设/images/paper2_fig18_19_adaptation_curves.png",
        "caption": "Fig. 18 & 19: 自适应 A-INDI 算法在飞行中实时追踪控制效能参数 G1 变化的收敛曲线 (AIAA JGCD 2016)",
        "alt": "Fig. 18-19: Parameter adaptation curves"
      },
      "paragraphs": [
        {
          "pIndex": 13,
          "logicRole": "NLMS 在线自适应辨识算法推导",
          "mainIdea": "利用归一化最小均方误差 (NLMS) 算法在线实时辨识控制效能矩阵 G1，运算量极小，可在单片机上以 500 Hz 实时无延迟运行。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P13-S1",
              "text": "To liberate the controller from offline parameter identification, an online Normalized Least Mean Squares (NLMS) adaptive estimator is incorporated.",
              "translation": "为了使控制器摆脱对离线参数测定的依赖，论文引入了基于归一化最小均方误差（NLMS）的在线自适应辨识算法。",
              "vocab": [
                {
                  "word": "least mean squares",
                  "ipa": "/liːst miːn skweəz/",
                  "meaning": "最小均方算法",
                  "level": "blue",
                  "zh": "最小均方误差"
                },
                {
                  "word": "incorporated",
                  "ipa": "/ɪnˈkɔːpəreɪtɪd/",
                  "meaning": "已融入的",
                  "level": "red",
                  "zh": "引入"
                },
                {
                  "word": "normalized",
                  "ipa": "/ˈnɔːməlaɪzd/",
                  "meaning": "归一化的",
                  "level": "green",
                  "zh": "归一化"
                },
                {
                  "word": "parameter",
                  "ipa": "/pəˈræmɪtə/",
                  "meaning": "参数",
                  "level": "green",
                  "zh": "参数"
                },
                {
                  "word": "estimator",
                  "ipa": "/ˈestɪmeɪtə/",
                  "meaning": "估计器，辨识器",
                  "level": "green",
                  "zh": "在线自适应辨识算法"
                },
                {
                  "word": "adaptive",
                  "ipa": "/əˈdæptɪv/",
                  "meaning": "自适应的",
                  "level": "red",
                  "zh": "自适应"
                },
                {
                  "word": "online",
                  "ipa": "/ˌɒnˈlaɪn/",
                  "meaning": "可通过互联网访问的；在线（常用释义：在线的；联网地）",
                  "level": "red",
                  "zh": "在线"
                },
                {
                  "word": "nlms",
                  "ipa": "/ˌen.el.emˈes/",
                  "meaning": "归一化最小均方误差算法 (Normalized LMS)",
                  "level": "blue",
                  "zh": "归一化最小均方误差"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P13-S2",
              "text": "Filtered angular acceleration prediction error is defined as $\\boldsymbol{e}(k) = \\dot{\\boldsymbol{\\Omega}}_f(k) - [\\dot{\\boldsymbol{\\Omega}}_f(k-1) + \\hat{\\boldsymbol{G}}_1(k-1) \\text{diag}(\\boldsymbol{\\omega}_f(k-1)) \\Delta \\boldsymbol{\\omega}_f(k)]$.",
              "translation": "定义滤波后的角加速度预测误差为 $\\boldsymbol{e}(k) = \\dot{\\boldsymbol{\\Omega}}_f(k) - \\dot{\\boldsymbol{\\Omega}}_{f,\\text{pred}}(k)$。",
              "vocab": [
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue",
                  "zh": "角加速度"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green",
                  "zh": "加速度"
                },
                {
                  "word": "prediction",
                  "ipa": "/prɪˈdɪkʃn/",
                  "meaning": "预测，时域预测",
                  "level": "green",
                  "zh": "预测"
                },
                {
                  "word": "filtered",
                  "ipa": "/ˈfɪltəd/",
                  "meaning": "已滤波的",
                  "level": "green",
                  "zh": "滤波"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，角向的",
                  "level": "green",
                  "zh": "角加速度"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P13-S3",
              "text": "The parameter adaptation update law is $\\hat{\\boldsymbol{G}}_1(k+1) = \\hat{\\boldsymbol{G}}_1(k) + \\boldsymbol{\\mu}_1 \\frac{\\boldsymbol{e}(k) [\\text{diag}(\\boldsymbol{\\omega}_f(k-1)) \\Delta \\boldsymbol{\\omega}_f(k)]^T}{\\epsilon + \\|\\text{diag}(\\boldsymbol{\\omega}_f(k-1)) \\Delta \\boldsymbol{\\omega}_f(k)\\|^2}$, where $\\boldsymbol{\\mu}_1$ is adaptation gain and $\\epsilon > 0$ prevents division by zero.",
              "translation": "控制效能矩阵 $\\hat{\\boldsymbol{G}}_1$ 的在线更新律利用归一化梯度递推，其中 $\\boldsymbol{\\mu}_1$ 为对角自适应学习率矩阵，$\\epsilon > 0$ 为防止除以零的正则化微小正数。",
              "vocab": [
                {
                  "word": "adaptation",
                  "ipa": "/ˌædæpˈteɪʃn/",
                  "meaning": "自适应过程，在线更新",
                  "level": "red",
                  "zh": "自适应"
                }
              ]
            },
            {
              "sIndex": 4,
              "id": "P13-S4",
              "text": "The computational load is extremely lightweight (only a few vector dot products), executing at 500 Hz on microcontrollers with zero latency.",
              "translation": "该自适应算法计算量极小（仅几条向量点乘指令），可在机载单片机上以 500 Hz 实时无延迟运行。",
              "vocab": [
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算上的，计算开销的",
                  "level": "green",
                  "zh": "计算"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-setup",
      "sectionNumber": "五",
      "title": "V. EXPERIMENTAL SETUP",
      "chineseTitle": "五、实验平台与测试系统配置 (V. EXPERIMENTAL SETUP)",
      "paragraphs": [
        {
          "pIndex": 14,
          "logicRole": "飞行器硬件、传感器与开源飞控配置",
          "mainIdea": "Parrot Bebop 四旋翼（396.2g，防撞套每只 12g），开源 Paparazzi 飞控系统，传感器与控制回路运行在 512 Hz。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P14-S1",
              "text": "Flight experiments were validated on a Parrot Bebop quadrotor weighing $396.2\\text{ g}$ running the open-source Paparazzi UAV autopilot at a control loop frequency of 512 Hz.",
              "translation": "实验平台：Parrot Bebop 四旋翼无人机，净重 $396.2\\text{ g}$，防撞套每只 $12\\text{ g}$；飞控软件：开源飞控架构 Paparazzi，控制频率运行在 $512\\text{ Hz}$。",
              "vocab": [
                {
                  "word": "experiments",
                  "ipa": "/ɪkˈsperɪmənts/",
                  "meaning": "实验（复数）",
                  "level": "green",
                  "zh": "实验"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼飞行器，四轴无人机",
                  "level": "red",
                  "zh": "四旋翼无人机"
                },
                {
                  "word": "paparazzi",
                  "ipa": "/ˌpæpəˈrætsi/",
                  "meaning": "Paparazzi 开源自主无人机飞控系统",
                  "level": "blue",
                  "zh": "Paparazzi"
                },
                {
                  "word": "bebop",
                  "ipa": "/ˈbiːbɒp/",
                  "meaning": "Bebop（Parrot 出品的微型四旋翼机型）",
                  "level": "blue",
                  "zh": "Parrot Bebop"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P14-S2",
              "text": "The vehicle is equipped with a 3-axis gyroscope, 3-axis accelerometer, ultrasonic altitude sensor, and optical flow camera.",
              "translation": "无人机搭载了三轴陀螺仪、三轴加速度计、超声波定高传感器以及光流相机。",
              "vocab": [
                {
                  "word": "gyroscope",
                  "ipa": "/ˈdʒaɪrəskəʊp/",
                  "meaning": "陀螺仪",
                  "level": "blue",
                  "zh": "陀螺仪"
                },
                {
                  "word": "vehicle",
                  "ipa": "ˈviːɪkl",
                  "meaning": "n.车辆,交通工具;媒介,载体",
                  "level": "red",
                  "zh": "无人机"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P14-S3",
              "text": "High-precision ground truth state estimates are captured by an OptiTrack motion capture system at 120 Hz.",
              "translation": "由 OptiTrack 高精度室内动作捕捉系统以 120 Hz 提供毫米级真值位姿参考。",
              "vocab": [
                {
                  "word": "motion capture",
                  "ipa": "/ˈməʊʃn ˈkæptʃə/",
                  "meaning": "光学动作捕捉系统 (Vicon/OptiTrack)",
                  "level": "blue",
                  "zh": "动作捕捉系统"
                },
                {
                  "word": "motion",
                  "ipa": "ˈməʊʃn",
                  "meaning": "n.运动，移动；手势，动作；提议，议案 v.打手势，示意",
                  "level": "green",
                  "zh": "动作"
                },
                {
                  "word": "system",
                  "ipa": "ˈsɪstəm",
                  "meaning": "n. 体系；系统",
                  "level": "green",
                  "zh": "系统"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-results",
      "sectionNumber": "六",
      "title": "VI. RESULTS",
      "chineseTitle": "六、实验结果与性能对比 (VI. RESULTS)",
      "paragraphs": [
        {
          "pIndex": 15,
          "logicRole": "试验 1：延迟滤波补偿消融验证",
          "mainIdea": "未开启滤波补偿无人机起飞瞬间即发生 12 Hz 剧烈发散抖振；开启补偿后姿态跟踪极其平稳干净。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P15-S1",
              "text": "Experiment 1 (Delay Filter Compensation): Without delay filter compensation, the vehicle experienced violent high-frequency divergence (oscillation frequency $\\approx 12\\text{ Hz}$) immediately upon liftoff, unable to maintain flight.",
              "translation": "试验 1（延迟滤波补偿消融）：未开启滤波补偿时，无人机在起飞离地瞬间即发生剧烈的高频发散抖振（振荡频率约 $12\\text{ Hz}$），无法安全飞行；",
              "vocab": [
                {
                  "word": "compensation",
                  "ipa": "ˌkɑmpənˈseɪʃən",
                  "meaning": "n.补偿(或赔偿)的款物;补偿,赔偿",
                  "level": "red",
                  "zh": "补偿"
                },
                {
                  "word": "oscillation",
                  "ipa": "/ˌɒsɪˈleɪʃn/",
                  "meaning": "振荡，抖动",
                  "level": "red",
                  "zh": "振荡"
                },
                {
                  "word": "divergence",
                  "ipa": "/daɪˈvɜːdʒəns/",
                  "meaning": "发散，失稳发散",
                  "level": "red",
                  "zh": "剧烈的高频发散抖振"
                },
                {
                  "word": "vehicle",
                  "ipa": "ˈviːɪkl",
                  "meaning": "n.车辆,交通工具;媒介,载体",
                  "level": "red",
                  "zh": "无人机"
                },
                {
                  "word": "violent",
                  "ipa": "ˈvaɪələnt",
                  "meaning": "adj. 暴力的",
                  "level": "green",
                  "zh": "剧烈"
                },
                {
                  "word": "filter",
                  "ipa": "/ˈfɪltə/",
                  "meaning": "滤波器",
                  "level": "green",
                  "zh": "滤波"
                },
                {
                  "word": "unable",
                  "ipa": "",
                  "meaning": "adj.不能胜任的，不会的",
                  "level": "red",
                  "zh": "无法"
                },
                {
                  "word": "delay",
                  "ipa": "dɪˈleɪ",
                  "meaning": "n./v.延迟；延期；耽搁",
                  "level": "green",
                  "zh": "延迟"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P15-S2",
              "text": "With synchronized compensation enabled, attitude tracking was exceptionally smooth, step responses were sharp and clean, and oscillations were completely absent.",
              "translation": "开启滤波补偿后：姿态跟踪极其平稳，阶跃响应干净利落，无任何超调与震荡。",
              "vocab": [
                {
                  "word": "compensation",
                  "ipa": "ˌkɑmpənˈseɪʃən",
                  "meaning": "n.补偿(或赔偿)的款物;补偿,赔偿",
                  "level": "red",
                  "zh": "补偿"
                },
                {
                  "word": "oscillations",
                  "ipa": "/ˌɒsɪˈleɪʃnz/",
                  "meaning": "振荡，抖动（复数）",
                  "level": "red",
                  "zh": "震荡"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red",
                  "zh": "姿态"
                },
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red",
                  "zh": "跟踪"
                },
                {
                  "word": "step",
                  "ipa": "",
                  "meaning": "v. 踏，踩",
                  "level": "green",
                  "zh": "阶跃"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 16,
          "logicRole": "试验 2：突加 50g 载荷阶跃卸载扰动抑制测试",
          "mainIdea": "50g 载荷突释测试：PID 出现 15 度突跳且耗时 1.5 秒恢复；A-INDI 峰值小于 4 度仅耗时 0.3 秒恢复（快 5 倍）。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P16-S1",
              "text": "Experiment 2 (Step Load Drop Disturbance Rejection): A 50g suspended payload was suddenly dropped during hovering flight, producing an abrupt step load disturbance.",
              "translation": "试验 2（突加载荷阶跃扰动抑制）：在无人机悬停时，通过细线悬挂的 50g 额外重物在空中突然释放（相当于瞬间阶跃卸载）：",
              "vocab": [
                {
                  "word": "disturbance rejection",
                  "ipa": "/dɪˈstɜːbəns rɪˈdʒekʃn/",
                  "meaning": "扰动抑制能力",
                  "level": "blue",
                  "zh": "扰动抑制"
                },
                {
                  "word": "disturbance",
                  "ipa": "/dɪˈstɜːbəns/",
                  "meaning": "扰动，外界风扰",
                  "level": "red",
                  "zh": "扰动"
                },
                {
                  "word": "rejection",
                  "ipa": "/rɪˈdʒekʃn/",
                  "meaning": "抑制，抗扰能力",
                  "level": "red",
                  "zh": "扰动抑制"
                },
                {
                  "word": "step",
                  "ipa": "",
                  "meaning": "v. 踏，踩",
                  "level": "green",
                  "zh": "阶跃"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P16-S2",
              "text": "Under classic PID control, pitch angle underwent a massive $15^\\circ$ spike and took 1.5 seconds to fully recover balance.",
              "translation": "经典 PID 控制器：俯仰角出现高达 $15^\\circ$ 的剧烈突跳，耗时 1.5 秒才完全恢复平衡；",
              "vocab": [
                {
                  "word": "balance",
                  "ipa": "ˈbæləns",
                  "meaning": "n. 平衡",
                  "level": "green",
                  "zh": "平衡"
                },
                {
                  "word": "pitch",
                  "ipa": "/pɪtʃ/",
                  "meaning": "俯仰角 (Pitch)",
                  "level": "blue",
                  "zh": "俯仰"
                },
                {
                  "word": "spike",
                  "ipa": "/spaɪk/",
                  "meaning": "突跳，尖峰波动",
                  "level": "green",
                  "zh": "剧烈突跳"
                },
                {
                  "word": "pid",
                  "ipa": "/ˌpiː.aɪˈdiː/",
                  "meaning": "比例-积分-微分控制器 (Proportional-Integral-Derivative)",
                  "level": "blue",
                  "zh": "经典 PID"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P16-S3",
              "text": "Under A-INDI control, attitude fluctuation was constrained below $4^\\circ$ and stabilized within just 0.3 seconds, demonstrating a 5-fold faster disturbance recovery than PID.",
              "translation": "A-INDI 控制器：姿态波动峰值小于 $4^\\circ$，仅耗时 0.3 秒即完全重置回水平（抗扰恢复速度比 PID 快 5 倍）。",
              "vocab": [
                {
                  "word": "fluctuation",
                  "ipa": "/ˌflʌktʃuˈeɪʃn/",
                  "meaning": "波动，摆动",
                  "level": "green",
                  "zh": "姿态波动"
                },
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态角 (Roll, Pitch, Yaw)",
                  "level": "red",
                  "zh": "姿态"
                },
                {
                  "word": "recovery",
                  "ipa": "/rɪˈkʌvəri/",
                  "meaning": "恢复；灾后恢复（常用释义：恢复；复原）",
                  "level": "green",
                  "zh": "恢复"
                },
                {
                  "word": "a-indi",
                  "ipa": "/eɪ ˈɪndi/",
                  "meaning": "自适应增量非线性动态逆 (Adaptive INDI)",
                  "level": "blue",
                  "zh": "A-INDI"
                },
                {
                  "word": "pid",
                  "ipa": "/ˌpiː.aɪˈdiː/",
                  "meaning": "比例-积分-微分控制器 (Proportional-Integral-Derivative)",
                  "level": "blue",
                  "zh": "PID"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 17,
          "logicRole": "试验 3：防撞保护套拆装的在线自适应收敛",
          "mainIdea": "在飞行中加装/拆卸防撞圈使惯量剧变；A-INDI 在 2~3 秒内迅速自适应收敛，飞行员完全感受不到手感变化。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P17-S1",
              "text": "Experiment 3 (Propeller Bumper Adaptation): Propeller bumpers were dynamically attached and detached during flight, inducing dramatic inertia changes and altering rotor aerodynamics.",
              "translation": "试验 3（防撞环拆装在线自适应）：实验在飞行过程中为机身加装/拆卸防撞保护圈（Bumpers，使机体转动惯量剧变并改变螺旋桨周围气流分布）：",
              "vocab": [
                {
                  "word": "aerodynamics",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪks/",
                  "meaning": "空气动力学",
                  "level": "red",
                  "zh": "气流分布"
                },
                {
                  "word": "experiment",
                  "ipa": "/ɪkˈsperɪmənt/",
                  "meaning": "实验",
                  "level": "green",
                  "zh": "实验"
                },
                {
                  "word": "adaptation",
                  "ipa": "/ˌædæpˈteɪʃn/",
                  "meaning": "自适应过程，在线更新",
                  "level": "red",
                  "zh": "在线自适应"
                },
                {
                  "word": "propeller",
                  "ipa": "/prəˈpelə/",
                  "meaning": "螺旋桨，桨叶",
                  "level": "red",
                  "zh": "螺旋桨"
                },
                {
                  "word": "bumpers",
                  "ipa": "/ˈbʌmpəz/",
                  "meaning": "防撞保护圈，机臂保护罩",
                  "level": "green",
                  "zh": "防撞保护圈"
                },
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "惯量，惯性",
                  "level": "red",
                  "zh": "转动惯量"
                },
                {
                  "word": "bumper",
                  "ipa": "/ˈbʌmpə/",
                  "meaning": "防撞圈",
                  "level": "green",
                  "zh": "防撞保护圈"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P17-S2",
              "text": "Experimental telemetry confirms that A-INDI automatically converged parameter estimates $\\hat{\\boldsymbol{G}}_1$ from default initialization to true physical effectiveness within 2 to 3 seconds, keeping pilot handling feel completely unchanged.",
              "translation": "实验曲线显示，自适应 A-INDI 在无人机起飞后 2~3 秒内，$\\hat{\\boldsymbol{G}}_1$ 估计参数迅速从初始默认值自适应收敛至真实物理效能值；在防撞套拆除后再次迅速自适应收敛，飞行员完全感受不到飞行手感的变化。",
              "vocab": [
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能，有效性",
                  "level": "green",
                  "zh": "物理效能"
                },
                {
                  "word": "telemetry",
                  "ipa": "/təˈlemətri/",
                  "meaning": "遥测数据，实测回传数据",
                  "level": "green",
                  "zh": "实验曲线"
                },
                {
                  "word": "converged",
                  "ipa": "/kənˈvɜːdʒd/",
                  "meaning": "已收敛的",
                  "level": "red",
                  "zh": "自适应收敛"
                },
                {
                  "word": "parameter",
                  "ipa": "/pəˈræmɪtə/",
                  "meaning": "参数",
                  "level": "green",
                  "zh": "参数"
                },
                {
                  "word": "estimates",
                  "ipa": "/ˈestɪmeɪts/",
                  "meaning": "估计值（复数）",
                  "level": "green",
                  "zh": "估计参数"
                },
                {
                  "word": "default",
                  "ipa": "dɪˈfɔlt",
                  "meaning": "n. 违约；默认 v. 默认；拖欠",
                  "level": "green",
                  "zh": "默认"
                },
                {
                  "word": "a-indi",
                  "ipa": "/eɪ ˈɪndi/",
                  "meaning": "自适应增量非线性动态逆 (Adaptive INDI)",
                  "level": "blue",
                  "zh": "A-INDI"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 18,
          "logicRole": "试验 4：计入转子角动量解决偏航软绵固有缺陷",
          "mainIdea": "显式补偿转子惯量力矩 Ir*dot(omega)，使偏航 Doublet 指令上升时间缩短 40%，彻底解决四旋翼偏航迟缓缺陷。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P18-S1",
              "text": "Experiment 4 (Rotor Momentum Feedforward on Yaw Performance): Traditional quadrotors suffer sluggish yaw response because yaw relies purely on small motor differential reaction torques.",
              "translation": "试验 4（计入转子角动量偏航提升）：传统四旋翼在偏航方向因为仅依靠电机反扭矩差动，响应极为迟缓；",
              "vocab": [
                {
                  "word": "quadrotors",
                  "ipa": "/ˈkwɒdrəʊtəz/",
                  "meaning": "四旋翼飞行器（复数）",
                  "level": "red",
                  "zh": "四旋翼"
                },
                {
                  "word": "sluggish",
                  "ipa": "/ˈslʌɡɪʃ/",
                  "meaning": "迟缓的，反应软绵的",
                  "level": "red",
                  "zh": "迟缓"
                },
                {
                  "word": "torques",
                  "ipa": "/tɔːks/",
                  "meaning": "力矩（复数）",
                  "level": "red",
                  "zh": "反扭矩"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "旋翼，转子",
                  "level": "blue",
                  "zh": "转子"
                },
                {
                  "word": "motor",
                  "ipa": "/ˈməʊtə/",
                  "meaning": "电动机，电机",
                  "level": "green",
                  "zh": "电机"
                },
                {
                  "word": "yaw",
                  "ipa": "/jɔː/",
                  "meaning": "偏航角 (Yaw)",
                  "level": "blue",
                  "zh": "偏航"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P18-S2",
              "text": "By explicitly compensating for rotor angular momentum and acceleration torque $\\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}}$, the yaw doublet step command rise time was reduced by 40%, completely resolving the notorious sluggish yaw problem.",
              "translation": "在显式补偿转子加速惯量力矩 $\\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}}$ 后，Doublet 偏航角指令的跟踪上升时间缩短了 40%，彻底解决了四旋翼“偏航软绵”的固有缺陷。",
              "vocab": [
                {
                  "word": "rise time",
                  "ipa": "/raɪz taɪm/",
                  "meaning": "上升时间",
                  "level": "blue",
                  "zh": "跟踪上升时间"
                },
                {
                  "word": "sluggish",
                  "ipa": "/ˈslʌɡɪʃ/",
                  "meaning": "迟缓的，反应软绵的",
                  "level": "red",
                  "zh": "偏航软绵"
                },
                {
                  "word": "doublet",
                  "ipa": "/ˈdʌblət/",
                  "meaning": "双向脉冲激励信号 (Doublet Step)",
                  "level": "blue",
                  "zh": "Doublet 偏航角指令"
                },
                {
                  "word": "reduced",
                  "ipa": "/rɪˈdjuːst/",
                  "meaning": "已降低的",
                  "level": "green",
                  "zh": "缩短"
                },
                {
                  "word": "torque",
                  "ipa": "/tɔːk/",
                  "meaning": "力矩，转矩",
                  "level": "red",
                  "zh": "力矩"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "旋翼，转子",
                  "level": "blue",
                  "zh": "转子"
                },
                {
                  "word": "yaw",
                  "ipa": "/jɔː/",
                  "meaning": "偏航角 (Yaw)",
                  "level": "blue",
                  "zh": "偏航"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-conclusions",
      "sectionNumber": "七",
      "title": "VII. CONCLUSIONS",
      "chineseTitle": "七、主要结论 (VII. CONCLUSIONS)",
      "paragraphs": [
        {
          "pIndex": 19,
          "logicRole": "三大核心学术与工程结论",
          "mainIdea": "A-INDI 是极具前景的前沿控制理论；NLMS 自适应实时追踪效能衰减；抗扰恢复速度比 PID 快 5 倍极大增强生存能力。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P19-S1",
              "text": "1. A-INDI represents a highly promising control paradigm for MAVs by replacing complex physical models with direct sensor acceleration feedback and eliminating delay-induced limit cycles via matched time-synchronized filtering.",
              "translation": "1. A-INDI 是极具前景的微型飞行器姿态控制前沿理论。通过传感器加速度反馈替代了复杂物理模型，同时通过时钟对齐滤波消除了测量延迟引起的震荡失稳；",
              "vocab": [
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green",
                  "zh": "加速度"
                },
                {
                  "word": "filtering",
                  "ipa": "/ˈfɪltərɪŋ/",
                  "meaning": "滤波处理",
                  "level": "green",
                  "zh": "滤波"
                },
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red",
                  "zh": "加速度反馈"
                },
                {
                  "word": "complex",
                  "ipa": "/ˈkɒmpleks/",
                  "meaning": "复杂的，多层次的（常用释义：复杂的；复合的；综合体）",
                  "level": "red",
                  "zh": "复杂"
                },
                {
                  "word": "a-indi",
                  "ipa": "/eɪ ˈɪndi/",
                  "meaning": "自适应增量非线性动态逆 (Adaptive INDI)",
                  "level": "blue",
                  "zh": "A-INDI"
                },
                {
                  "word": "mavs",
                  "ipa": "/ˈem.eɪ.viːz/",
                  "meaning": "微型飞行器（复数）",
                  "level": "blue",
                  "zh": "微型飞行器"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P19-S2",
              "text": "2. Onboard real-time NLMS adaptation tracks motor effectiveness degradation, battery voltage decline, and physical payload shifts with zero tuning overhead.",
              "translation": "2. 机载在线 NLMS 自适应辨识能够实时追踪电机效率衰减、电池压降与载荷变化；",
              "vocab": [
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能，有效性",
                  "level": "green",
                  "zh": "效率"
                },
                {
                  "word": "adaptation",
                  "ipa": "/ˌædæpˈteɪʃn/",
                  "meaning": "自适应过程，在线更新",
                  "level": "red",
                  "zh": "自适应"
                },
                {
                  "word": "battery",
                  "ipa": "ˈbætərɪ",
                  "meaning": "n. 电池",
                  "level": "green",
                  "zh": "电池"
                },
                {
                  "word": "motor",
                  "ipa": "/ˈməʊtə/",
                  "meaning": "电动机，电机",
                  "level": "green",
                  "zh": "电机"
                },
                {
                  "word": "nlms",
                  "ipa": "/ˌen.el.emˈes/",
                  "meaning": "归一化最小均方误差算法 (Normalized LMS)",
                  "level": "blue",
                  "zh": "NLMS"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P19-S3",
              "text": "3. Compared with classic PID and conventional model-based NDI, A-INDI delivers unmatched disturbance rejection under abrupt external wind and weight shocks, drastically boosting MAV survivability.",
              "translation": "3. 相比传统 PID 与基于模型的非线性控制，A-INDI 具有超强的突发外扰抑制能力，大幅提升了无人机在恶劣复杂环境下的生存能力。",
              "vocab": [
                {
                  "word": "survivability",
                  "ipa": "/səˌvaɪvəˈbɪləti/",
                  "meaning": "生存能力，抗毁容错度",
                  "level": "red",
                  "zh": "生存能力"
                },
                {
                  "word": "disturbance",
                  "ipa": "/dɪˈstɜːbəns/",
                  "meaning": "扰动，外界风扰",
                  "level": "red",
                  "zh": "外扰"
                },
                {
                  "word": "drastically",
                  "ipa": "ˈdræstɪkəli",
                  "meaning": "adv. 彻底地；激烈地",
                  "level": "green",
                  "zh": "大幅"
                },
                {
                  "word": "rejection",
                  "ipa": "/rɪˈdʒekʃn/",
                  "meaning": "抑制，抗扰能力",
                  "level": "red",
                  "zh": "抑制"
                },
                {
                  "word": "a-indi",
                  "ipa": "/eɪ ˈɪndi/",
                  "meaning": "自适应增量非线性动态逆 (Adaptive INDI)",
                  "level": "blue",
                  "zh": "A-INDI"
                },
                {
                  "word": "pid",
                  "ipa": "/ˌpiː.aɪˈdiː/",
                  "meaning": "比例-积分-微分控制器 (Proportional-Integral-Derivative)",
                  "level": "blue",
                  "zh": "PID"
                },
                {
                  "word": "ndi",
                  "ipa": "/ˌen.diːˈaɪ/",
                  "meaning": "非线性动态逆 (Nonlinear Dynamic Inversion)",
                  "level": "blue",
                  "zh": "NDI"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
