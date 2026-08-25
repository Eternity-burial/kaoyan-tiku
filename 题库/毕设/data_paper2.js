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
          "logicRole": "INDI 理论优势与在微型飞行器姿态控制中的应用",
          "mainIdea": "增量非线性动态逆 (INDI) 是一种基于传感器的控制方法，免除精确数学模型；利用角加速度传感器实测值替代传统物理模型项。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "Incremental nonlinear dynamic inversion is a sensor-based control approach that promises to provide high-performance nonlinear control without requiring a detailed model of the controlled vehicle.",
              "translation": "增量非线性动态逆（Incremental Nonlinear Dynamic Inversion, INDI）是一种基于传感器的非线性控制方法，它有望在不需要被控对象精确数学模型的前提下实现高性能非线性控制。",
              "vocab": [
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
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
                  "level": "blue"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 2,
          "logicRole": "工程落地两大核心技术挑战",
          "mainIdea": "针对实际工程中测量与执行器延迟滞后、以及飞行中控制效能矩阵时变漂移两大瓶颈给出完备方案。",
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
                  "level": "blue"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
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
        },
        {
          "pIndex": 3,
          "logicRole": "论文四大理论与工程贡献",
          "mainIdea": "提出时序同步滤波补偿、基于 NLMS 的 A-INDI 在线自适应辨识、显式补偿转子角动量、以及 Parrot Bebop 实机飞行验证。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P3-S1",
              "text": "The main contributions of this article are:",
              "translation": "本文的主要理论与工程贡献包含以下四点：",
              "vocab": []
            },
            {
              "sIndex": 2,
              "id": "P3-S2",
              "text": "1) A proposed method to correctly take into account the delays occurring when deriving angular accelerations from angular rate measurements;",
              "translation": "1) 提出了能够精确补偿从角速率差分推导角加速度时所引入滤波延迟的时序同步控制律；",
              "vocab": [
                {
                  "word": "angular rate",
                  "ipa": "/ˈæŋɡjələ reɪt/",
                  "meaning": "角速率，角速度",
                  "level": "blue"
                },
                {
                  "word": "delays",
                  "ipa": "/dɪˈleɪz/",
                  "meaning": "延迟（复数）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P3-S3",
              "text": "2) The introduction of adaptive incremental nonlinear dynamic inversion, which can estimate the control effectiveness online, eliminating the need for manual parameter estimation or tuning;",
              "translation": "2) 提出了自适应增量非线性动态逆（Adaptive INDI, A-INDI）架构，利用在线自适应算法实时辨识控制效能参数，彻底免除了人工离线建模或增益整定；",
              "vocab": [
                {
                  "word": "control effectiveness",
                  "ipa": "/kənˈtrəʊl ɪˈfektɪvnəs/",
                  "meaning": "控制效能，控制增益矩阵 G1",
                  "level": "blue"
                },
                {
                  "word": "estimation",
                  "ipa": "/ˌestɪˈmeɪʃn/",
                  "meaning": "估计，辨识",
                  "level": "green"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "adaptive",
                  "ipa": "/əˈdæptɪv/",
                  "meaning": "自适应的，可在线调整的",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 4,
              "id": "P3-S4",
              "text": "3) The incorporation of the momentum of the propellers in the controller, significantly enhancing yaw tracking response;",
              "translation": "3) 在姿态控制律中显式计入了螺旋桨旋转角动量与瞬态加减速自旋力矩，显著增强了四旋翼偏航轴的响应带宽；",
              "vocab": [
                {
                  "word": "tracking",
                  "ipa": "/ˈtrækɪŋ/",
                  "meaning": "跟踪，追踪",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 5,
              "id": "P3-S5",
              "text": "4) Real-world experiments on a Parrot Bebop quadrotor showing high performance, disturbance rejection under step load drops, and adaptiveness under bumper alterations.",
              "translation": "4) 通过 Parrot Bebop 四旋翼无人机的大量实飞实验（包括突加载荷抛掷、加减防撞保护套自适应等）充分验证了该方法卓越的抗扰性、鲁棒性与自适应能力。",
              "vocab": [
                {
                  "word": "disturbance rejection",
                  "ipa": "/dɪˈstɜːbəns rɪˈdʒekʃn/",
                  "meaning": "扰动抑制能力",
                  "level": "blue"
                },
                {
                  "word": "adaptiveness",
                  "ipa": "/əˈdæptɪvnəs/",
                  "meaning": "自适应能力",
                  "level": "red"
                },
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼飞行器，四轴无人机",
                  "level": "red"
                },
                {
                  "word": "rejection",
                  "ipa": "/rɪˈdʒekʃn/",
                  "meaning": "抑制，抗扰能力 (Disturbance Rejection)",
                  "level": "red"
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
      "chineseTitle": "命名表 (Nomenclature)",
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
              "vocab": []
            },
            {
              "sIndex": 2,
              "id": "P4-S2",
              "text": "$b, l$: width and length of the vehicle $(m)$; $\\boldsymbol{I}_v, \\boldsymbol{I}_r$: moment of inertia matrices of the vehicle and rotor $(kg \\cdot m^2)$; $k_1, k_2$: rotor thrust and moment constants.",
              "translation": "$b, l$：飞行器宽度与长度 $(m)$；$\\boldsymbol{I}_v, \\boldsymbol{I}_r$：飞行器转动惯量矩阵与转子转动惯量矩阵 $(kg \\cdot m^2)$；$k_1, k_2$：旋翼推力常数与力矩常数；",
              "vocab": [
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "惯量，转动惯量",
                  "level": "red"
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
              "sIndex": 3,
              "id": "P4-S3",
              "text": "$\\boldsymbol{M}_a, \\boldsymbol{M}_c, \\boldsymbol{M}_r$: aerodynamic moment, control moment, and rotor acceleration gyroscopic moment vectors $(N \\cdot m)$.",
              "translation": "$\\boldsymbol{M}_a$：作用在机体上的气动力矩矢量；$\\boldsymbol{M}_c$：执行机构产生的控制力矩矢量；$\\boldsymbol{M}_r$：螺旋桨加减速反作用陀螺力矩矢量 $(N \\cdot m)$；",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "gyroscopic",
                  "ipa": "/ˌdʒaɪrəˈskɒpɪk/",
                  "meaning": "陀螺效应的，反作用力矩的",
                  "level": "red"
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
                  "level": "blue"
                },
                {
                  "word": "angular rate",
                  "ipa": "/ˈæŋɡjələ reɪt/",
                  "meaning": "角速率，角速度",
                  "level": "blue"
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
                  "level": "blue"
                },
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue"
                },
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "惯量，转动惯量",
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
          "logicRole": "微型飞行器抗风扰痛点与经典控制局限",
          "mainIdea": "MAV 尺寸小惯量低极易受风扰；经典线性 PID 需精细整定，NDI 严重依赖精确动力学与气动模型，极难测定。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P5-S1",
              "text": "Micro air vehicles (MAVs) have increased in popularity as their applications have diversified, but their small size makes them particularly vulnerable to wind gusts and turbulence.",
              "translation": "微型飞行器（MAV）由于尺寸小、重量轻、惯量极低，在飞行过程中极其容易受到阵风紊流以及突发外界扰动的影响。",
              "vocab": [
                {
                  "word": "mavs",
                  "ipa": "/ˈem.eɪ.viːz/",
                  "meaning": "微型飞行器（复数）",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P5-S2",
              "text": "Traditional linear PID controllers require meticulous gain tuning around specific operating points and struggle to maintain consistent high performance across the full flight envelope.",
              "translation": "传统的线性 PID 控制器需要在线性工作点附近精细整定增益，难以在全飞行包线和未知扰动下保持一致的高性能。",
              "vocab": [
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P5-S3",
              "text": "While classical Nonlinear Dynamic Inversion (NDI) theoretically decouples nonlinear systems, it relies heavily on precise rigid-body aerodynamics and motor dynamics that are notoriously difficult to identify accurately on low-cost MAVs.",
              "translation": "传统的非线性动态逆（NDI）虽然在理论上能完全解耦非线性系统，但其严重依赖高度精确的刚体动力学模型与气动力模型。对于低成本 MAV 而言，气动阻尼、地面效应和旋翼间气流干扰等参数极难精确测定。",
              "vocab": [
                {
                  "word": "aerodynamics",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪks/",
                  "meaning": "空气动力学",
                  "level": "red"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
                  "level": "red"
                },
                {
                  "word": "mavs",
                  "ipa": "/ˈem.eɪ.viːz/",
                  "meaning": "微型飞行器（复数）",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 6,
          "logicRole": "INDI 破局理念与实际工程瓶颈",
          "mainIdea": "INDI 以 IMU 实测角加速度作为基准，泰勒展开简化为增量映射；但面临传感器低通滤波延迟自激震荡与效能参数时变漂移两大难题。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P6-S1",
              "text": "Incremental NDI circumvents model dependency by using direct IMU angular acceleration measurements $\\dot{\\boldsymbol{\\Omega}}_0$ as a baseline point, simplifying dynamics through a first-order Taylor expansion to an incremental mapping $\\Delta \\dot{\\boldsymbol{\\Omega}} \\approx \\boldsymbol{G}_1 \\Delta \\boldsymbol{u}$.",
              "translation": "增量非线性动态逆（INDI）的破局理念：INDI 不依赖对未知非线性函数的离线预先计算，而是直接利用 IMU 传感器测得的角加速度 $\\dot{\\boldsymbol{\\Omega}}_0$ 作为基准点，通过泰勒级数展开将动力学逆解简化为控制输入的增量映射 $\\Delta \\dot{\\boldsymbol{\\Omega}} \\approx \\boldsymbol{G}_1 \\Delta \\boldsymbol{u}$。",
              "vocab": [
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue"
                },
                {
                  "word": "taylor expansion",
                  "ipa": "/ˈteɪlər ɪkˈspænʃn/",
                  "meaning": "泰勒一阶展开",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P6-S2",
              "text": "However, two critical hurdles arise: first, numerical differentiation and low-pass filtering of gyro signals introduce substantial phase lag, exciting catastrophic limit-cycle oscillations if uncompensated.",
              "translation": "然而，在 MAV 上实现 INDI 面临两个长期困扰学界的难题：1. 传感器滤波延迟与振荡：角加速度需要对陀螺仪原始信号进行数值差分并经过二阶低通滤波以滤除电机高频震动，这引入了不可忽视的时间滞后，直接控制会导致回路自激剧烈震荡；",
              "vocab": [
                {
                  "word": "oscillations",
                  "ipa": "/ˌɒsɪˈleɪʃnz/",
                  "meaning": "振荡，抖动",
                  "level": "red"
                },
                {
                  "word": "limit-cycle",
                  "ipa": "/ˈlɪmɪt saɪkl/",
                  "meaning": "极限环振荡（自激震荡）",
                  "level": "red"
                },
                {
                  "word": "phase lag",
                  "ipa": "/feɪz læɡ/",
                  "meaning": "相位滞后",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P6-S3",
              "text": "Second, the control effectiveness matrix $\\boldsymbol{G}_1$ continuously drifts due to battery voltage drops, payload variations, and structural alterations such as prop guards.",
              "translation": "2. 控制效能参数未知且时变：随着电池放电电压下降、机载挂载变化（如加装防护罩、吊挂不同负载），控制效能矩阵 $\\boldsymbol{G}_1$ 会持续漂移。",
              "vocab": [
                {
                  "word": "control effectiveness",
                  "ipa": "/kənˈtrəʊl ɪˈfektɪvnəs/",
                  "meaning": "控制效能，控制增益矩阵 G1",
                  "level": "blue"
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
      "title": "II. QUADROTOR DYNAMICS & INCREMENTAL FORMULATION",
      "chineseTitle": "二、四旋翼动力学模型与增量形式展开 (II. QUADROTOR DYNAMICS)",
      "figure": {
        "image": "题库/毕设/images/paper2_fig2_indi_diagram.png",
        "caption": "Fig. 2: 基于角加速度传感器反馈与泰勒级数展开的增量非线性动态逆 (INDI) 控制回路原理框图 (AIAA JGCD 2016)",
        "alt": "Fig. 2: Incremental NDI architecture diagram"
      },
      "paragraphs": [
        {
          "pIndex": 7,
          "logicRole": "四旋翼转动动力学欧拉方程与力矩分解",
          "mainIdea": "四旋翼转动动力学包含电机控制力矩 Mc、气动力矩 Ma 与螺旋桨自旋加减速反作用陀螺力矩 Mr。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P7-S1",
              "text": "Quadrotor rotational dynamics are described by Euler's equation: $\\boldsymbol{I}_v \\dot{\\boldsymbol{\\Omega}} + \\boldsymbol{\\Omega} \\times (\\boldsymbol{I}_v \\boldsymbol{\\Omega}) = \\boldsymbol{M}_a(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\boldsymbol{M}_c - \\boldsymbol{M}_r$.",
              "translation": "四旋翼飞行器的转动动力学由欧拉方程给出：$\\boldsymbol{I}_v \\dot{\\boldsymbol{\\Omega}} + \\boldsymbol{\\Omega} \\times (\\boldsymbol{I}_v \\boldsymbol{\\Omega}) = \\boldsymbol{M}_a(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\boldsymbol{M}_c - \\boldsymbol{M}_r$。",
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
              "sIndex": 2,
              "id": "P7-S2",
              "text": "Control moment is $\\boldsymbol{M}_c = \\boldsymbol{M}_{c,\\text{matrix}} \\boldsymbol{\\omega}^2$, where $\\boldsymbol{\\omega}^2 = [\\omega_1^2, \\omega_2^2, \\omega_3^2, \\omega_4^2]^T$, and propeller gyroscopic and acceleration torque is $\\boldsymbol{M}_r = \\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}} + \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_r \\boldsymbol{\\omega}$.",
              "translation": "其中控制力矩为 $\\boldsymbol{M}_c = \\boldsymbol{M}_{c,\\text{matrix}} \\boldsymbol{\\omega}^2$，螺旋桨自旋与加减速反扭矩为 $\\boldsymbol{M}_r = \\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}} + \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_r \\boldsymbol{\\omega}$。",
              "vocab": [
                {
                  "word": "gyroscopic",
                  "ipa": "/ˌdʒaɪrəˈskɒpɪk/",
                  "meaning": "陀螺效应的，反作用力矩的",
                  "level": "red"
                },
                {
                  "word": "torque",
                  "ipa": "/tɔːk/",
                  "meaning": "力矩，转矩",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P7-S3",
              "text": "Combining terms yields total angular acceleration: $\\dot{\\boldsymbol{\\Omega}} = \\boldsymbol{F}(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\frac{1}{2} \\boldsymbol{G}_1 \\boldsymbol{\\omega}^2 - T_s \\boldsymbol{G}_2 \\dot{\\boldsymbol{\\omega}} - \\boldsymbol{C}(\\boldsymbol{\\Omega}) \\boldsymbol{G}_3 \\boldsymbol{\\omega}$.",
              "translation": "综合整理角加速度表达式：$\\dot{\\boldsymbol{\\Omega}} = \\boldsymbol{F}(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\frac{1}{2} \\boldsymbol{G}_1 \\boldsymbol{\\omega}^2 - T_s \\boldsymbol{G}_2 \\dot{\\boldsymbol{\\omega}} - \\boldsymbol{C}(\\boldsymbol{\\Omega}) \\boldsymbol{G}_3 \\boldsymbol{\\omega}$。",
              "vocab": [
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 8,
          "logicRole": "一阶泰勒展开与 INDI 核心增量方程推导",
          "mainIdea": "在上一采样时刻展开，用实测角加速度替代非线性物理模型项，得出 INDI 核心增量控制方程。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P8-S1",
              "text": "Applying a first-order Taylor expansion around previous sample point $(\\boldsymbol{\\Omega}_0, \\boldsymbol{\\omega}_0)$ and replacing nonlinear terms $\\boldsymbol{F}(\\boldsymbol{\\Omega}, \\boldsymbol{v})$ with sensor-measured $\\dot{\\boldsymbol{\\Omega}}_0$ yields the core INDI equation: $\\dot{\\boldsymbol{\\Omega}} \\approx \\dot{\\boldsymbol{\\Omega}}_0 + \\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_0)(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0) + \\boldsymbol{G}_2(\\dot{\\boldsymbol{\\omega}} - \\dot{\\boldsymbol{\\omega}}_0) - \\boldsymbol{C}(\\boldsymbol{\\Omega}_0)\\boldsymbol{G}_3(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0)$.",
              "translation": "在上一时刻采样点 $(\\boldsymbol{\\Omega}_0, \\boldsymbol{\\omega}_0)$ 附近进行一阶泰勒展开，并利用传感器测量的实际角加速度 $\\dot{\\boldsymbol{\\Omega}}_0$ 替代非线性物理模型项 $\\boldsymbol{F}(\\boldsymbol{\\Omega}, \\boldsymbol{v})$，得到 **INDI 核心增量方程**：$\\dot{\\boldsymbol{\\Omega}} \\approx \\dot{\\boldsymbol{\\Omega}}_0 + \\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_0)(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0) + \\boldsymbol{G}_2(\\dot{\\boldsymbol{\\omega}} - \\dot{\\boldsymbol{\\omega}}_0) - \\boldsymbol{C}(\\boldsymbol{\\Omega}_0)\\boldsymbol{G}_3(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0)$。",
              "vocab": [
                {
                  "word": "taylor expansion",
                  "ipa": "/ˈteɪlər ɪkˈspænʃn/",
                  "meaning": "泰勒一阶展开",
                  "level": "blue"
                },
                {
                  "word": "nonlinear",
                  "ipa": "/ˌnɒnˈlɪniər/",
                  "meaning": "非线性的（输出与输入不成正比）",
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
      "id": "sec-delay",
      "sectionNumber": "三",
      "title": "III. DELAY & FILTER COMPENSATION",
      "chineseTitle": "三、延迟与滤波补偿设计 (III. DELAY & FILTER COMPENSATION)",
      "figure": {
        "image": "题库/毕设/images/paper2_fig5_filter_compensation.png",
        "caption": "Fig. 5: 消除相位滞后与极限环振荡的时序对称低通滤波补偿结构控制框图 (AIAA JGCD 2016)",
        "alt": "Fig. 5: Filter delay compensation block diagram"
      },
      "paragraphs": [
        {
          "pIndex": 9,
          "logicRole": "传感器与执行器频域相位滞后机理",
          "mainIdea": "陀螺仪差分信号经过二阶巴特沃斯低通滤波器 H(z)，电机表现为一阶惯性 A(z)；测得角加速度反映过去电机状态造成严重相位滞后。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P9-S1",
              "text": "Sensor differentiation followed by a second-order Butterworth low-pass filter $H(z) = \\frac{Y(z)}{X(z)}$ filters out motor vibrations, while brushless ESC motor response exhibits first-order lag $A(z)$.",
              "translation": "传感器端：陀螺仪差分信号经过二阶巴特沃斯低通滤波器 $H(z)$ 以滤除电机高频震动；执行器端：无刷电机电调响应表现为一阶低通惯性环节 $A(z)$。",
              "vocab": [
                {
                  "word": "low-pass filter",
                  "ipa": "/ləʊ pɑːs ˈfɪltə/",
                  "meaning": "低通滤波器",
                  "level": "blue"
                },
                {
                  "word": "butterworth",
                  "ipa": "/ˈbʌtəwɜːθ/",
                  "meaning": "巴特沃斯滤波器",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P9-S2",
              "text": "Due to filter latency, measured angular acceleration $\\dot{\\boldsymbol{\\Omega}}_f$ actually reflects past motor rotational speed $\\boldsymbol{\\omega}_f$, leading to a severe phase lag mismatch.",
              "translation": "由于存在滤波延迟，传感器测得的角加速度 $\\dot{\\boldsymbol{\\Omega}}_f$ 实际反映的是过去时刻的电机转速 $\\boldsymbol{\\omega}_f$。",
              "vocab": [
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue"
                },
                {
                  "word": "phase lag",
                  "ipa": "/feɪz læɡ/",
                  "meaning": "相位滞后",
                  "level": "red"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 10,
          "logicRole": "时序同步虚拟控制律推导与极限环振荡消除",
          "mainIdea": "将电机指令引入对称滤波通道 omega_f，推导出时序同步控制律，数学上保证相位裕度并彻底根除自激震荡。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P10-S1",
              "text": "To eliminate phase mismatch and stabilize the closed loop, we route the actuator command through an identical matched filter channel $\\boldsymbol{\\omega}_f$: $\\boldsymbol{\\omega}_c = \\boldsymbol{\\omega}_f + [\\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_f) + \\boldsymbol{G}_2 - \\boldsymbol{C}(\\boldsymbol{\\Omega}_f)\\boldsymbol{G}_3]^\\dagger (\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_f + \\boldsymbol{G}_2 z^{-1}(\\boldsymbol{\\omega}_c - \\boldsymbol{\\omega}_f))$.",
              "translation": "为了消除相位失配引起的自激振荡，论文提出将执行机构控制量引入对称滤波通道：推导出时序同步虚拟控制律 $\\boldsymbol{\\omega}_c$。",
              "vocab": [
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/电调/舵机/推进器）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P10-S2",
              "text": "Here $\\boldsymbol{\\omega}_c$ is the current motor speed command, and $\\boldsymbol{\\omega}_f$ is the motor speed filtered by the exact same low-pass filter $H(z)$ used for the angular acceleration sensor.",
              "translation": "其中 $\\boldsymbol{\\omega}_c$ 为当前拍下发给电机的转速指令，$\\boldsymbol{\\omega}_f$ 为经过与传感器低通滤波器 $H(z)$ 相同滤波器的电机转速估算值。",
              "vocab": [
                {
                  "word": "angular acceleration",
                  "ipa": "/ˈæŋɡjələ əkˌseləˈreɪʃn/",
                  "meaning": "角加速度",
                  "level": "blue"
                },
                {
                  "word": "low-pass filter",
                  "ipa": "/ləʊ pɑːs ˈfɪltə/",
                  "meaning": "低通滤波器",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P10-S3",
              "text": "This formulation mathematically guarantees adequate open-loop phase margin around crossover frequency, completely eradicating limit-cycle oscillations.",
              "translation": "该结构在数学上保证了开环传递函数在穿越频率处的相位裕度，彻底根除了未补偿 INDI 的极限环振荡。",
              "vocab": [
                {
                  "word": "oscillations",
                  "ipa": "/ˌɒsɪˈleɪʃnz/",
                  "meaning": "振荡，抖动",
                  "level": "red"
                },
                {
                  "word": "limit-cycle",
                  "ipa": "/ˈlɪmɪt saɪkl/",
                  "meaning": "极限环振荡（自激震荡）",
                  "level": "red"
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
      "title": "IV. ADAPTIVE ONLINE PARAMETER ESTIMATION (A-INDI)",
      "chineseTitle": "四、自适应参数在线估计（A-INDI） (IV. ADAPTIVE ESTIMATION)",
      "figure": {
        "image": "题库/毕设/images/paper2_fig18_19_adaptation_curves.png",
        "caption": "Fig. 18 & 19: 自适应 A-INDI 算法在飞行中实时追踪控制效能参数 G1 变化的收敛曲线 (AIAA JGCD 2016)",
        "alt": "Fig. 18-19: Parameter adaptation curves"
      },
      "paragraphs": [
        {
          "pIndex": 11,
          "logicRole": "NLMS 在线自适应参数估计更新律",
          "mainIdea": "利用归一化最小均方误差 (NLMS) 算法在线实时辨识控制效能矩阵 G1，彻底免除离线参数测定。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P11-S1",
              "text": "To liberate the controller from offline parameter identification, an online Normalized Least Mean Squares (NLMS) adaptive estimator is incorporated.",
              "translation": "为了使控制器摆脱对离线参数测定的依赖，论文引入了基于归一化最小均方误差（NLMS）的在线自适应辨识算法。",
              "vocab": [
                {
                  "word": "least mean squares",
                  "ipa": "/liːst miːn skweəz/",
                  "meaning": "最小均方算法",
                  "level": "blue"
                },
                {
                  "word": "adaptive",
                  "ipa": "/əˈdæptɪv/",
                  "meaning": "自适应的，可在线调整的",
                  "level": "red"
                },
                {
                  "word": "nlms",
                  "ipa": "/ˌen.el.emˈes/",
                  "meaning": "归一化最小均方误差算法 (Normalized LMS)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P11-S2",
              "text": "Filtered angular acceleration prediction error is defined as $\\boldsymbol{e}(k) = \\dot{\\boldsymbol{\\Omega}}_f(k) - [\\dot{\\boldsymbol{\\Omega}}_f(k-1) + \\hat{\\boldsymbol{G}}_1(k-1) \\text{diag}(\\boldsymbol{\\omega}_f(k-1)) \\Delta \\boldsymbol{\\omega}_f(k)]$.",
              "translation": "定义滤波后的角加速度预测误差为 $\\boldsymbol{e}(k) = \\dot{\\boldsymbol{\\Omega}}_f(k) - \\dot{\\boldsymbol{\\Omega}}_{f,\\text{pred}}(k)$。",
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
              "id": "P11-S3",
              "text": "The parameter adaptation update law is $\\hat{\\boldsymbol{G}}_1(k+1) = \\hat{\\boldsymbol{G}}_1(k) + \\boldsymbol{\\mu}_1 \\frac{\\boldsymbol{e}(k) [\\text{diag}(\\boldsymbol{\\omega}_f(k-1)) \\Delta \\boldsymbol{\\omega}_f(k)]^T}{\\epsilon + \\|\\text{diag}(\\boldsymbol{\\omega}_f(k-1)) \\Delta \\boldsymbol{\\omega}_f(k)\\|^2}$, where $\\boldsymbol{\\mu}_1$ is adaptation gain and $\\epsilon > 0$ prevents division by zero.",
              "translation": "控制效能矩阵 $\\hat{\\boldsymbol{G}}_1$ 的在线更新律利用归一化梯度递推，其中 $\\boldsymbol{\\mu}_1$ 为对角自适应学习率矩阵，$\\epsilon > 0$ 为防止除以零的正则化微小正数。",
              "vocab": []
            },
            {
              "sIndex": 4,
              "id": "P11-S4",
              "text": "The computational load is extremely lightweight (only a few vector dot products), executing at 500 Hz on microcontrollers with zero latency.",
              "translation": "该自适应算法计算量极小（仅几条向量点乘指令），可在机载单片机上以 500 Hz 实时无延迟运行。",
              "vocab": [
                {
                  "word": "computational",
                  "ipa": "/ˌkɒmpjuˈteɪʃənl/",
                  "meaning": "计算上的，计算开销的",
                  "level": "green"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-flights",
      "sectionNumber": "五",
      "title": "V. REAL-WORLD FLIGHT EXPERIMENTS",
      "chineseTitle": "五、实机飞行实验验证 (VI. FLIGHT EXPERIMENTS)",
      "paragraphs": [
        {
          "pIndex": 12,
          "logicRole": "实验平台与开源 Paparazzi 飞控配置",
          "mainIdea": "实验采用 Parrot Bebop 四旋翼无人机（质量约 400g），Paparazzi 开源飞控控制频率 512 Hz。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P12-S1",
              "text": "Flight experiments were validated on a Parrot Bebop quadrotor weighing $400\\text{ g}$ running the open-source Paparazzi UAV autopilot at a control loop frequency of 512 Hz.",
              "translation": "实验平台：Parrot Bebop 四旋翼无人机，质量约 $400\\text{ g}$；飞控软件：开源飞控架构 Paparazzi，控制频率运行在 $512\\text{ Hz}$。",
              "vocab": [
                {
                  "word": "quadrotor",
                  "ipa": "/ˈkwɒdrəʊtə/",
                  "meaning": "四旋翼飞行器，四轴无人机",
                  "level": "red"
                },
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
          "pIndex": 13,
          "logicRole": "试验 1：延迟滤波补偿的决定性消融验证",
          "mainIdea": "未开启滤波补偿无人机起飞瞬间即发生 12 Hz 剧烈发散抖振；开启补偿后姿态跟踪极其平稳干净。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P13-S1",
              "text": "Experiment 1: Without delay filter compensation, the vehicle experienced violent high-frequency divergence (oscillation frequency $\\approx 12\\text{ Hz}$) immediately upon liftoff, unable to maintain flight.",
              "translation": "试验 1（延迟滤波补偿消融）：未开启滤波补偿时，无人机在起飞离地瞬间即发生剧烈的高频发散抖振（振荡频率约 $12\\text{ Hz}$），无法安全飞行；",
              "vocab": [
                {
                  "word": "flight",
                  "ipa": "/flaɪt/",
                  "meaning": "飞行",
                  "level": "green"
                },
                {
                  "word": "delay",
                  "ipa": "/dɪˈleɪ/",
                  "meaning": "时钟延迟，时间滞后",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P13-S2",
              "text": "With synchronized compensation enabled, attitude tracking was exceptionally smooth, step responses were sharp and clean, and oscillations were completely absent.",
              "translation": "开启滤波补偿后：姿态跟踪极其平稳，阶跃响应干净利落，无任何超调与震荡。",
              "vocab": [
                {
                  "word": "oscillations",
                  "ipa": "/ˌɒsɪˈleɪʃnz/",
                  "meaning": "振荡，抖动",
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
          "pIndex": 14,
          "logicRole": "试验 2：突加 50g 载荷阶跃卸载扰动抑制测试",
          "mainIdea": "50g 载荷突释测试：PID 出现 15 度突跳且耗时 1.5 秒恢复；A-INDI 峰值小于 4 度仅耗时 0.3 秒恢复（快 5 倍）。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P14-S1",
              "text": "Experiment 2: A 50g suspended payload was suddenly dropped during hovering flight, producing an abrupt step load disturbance.",
              "translation": "试验 2（突加载荷阶跃扰动抑制）：在无人机悬停时，通过细线悬挂的 50g 额外重物在空中突然释放（相当于瞬间阶跃卸载）：",
              "vocab": [
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
              "id": "P14-S2",
              "text": "Under classic PID control, pitch angle underwent a massive $15^\\circ$ spike and took 1.5 seconds to fully recover balance.",
              "translation": "经典 PID 控制器：俯仰角出现高达 $15^\\circ$ 的剧烈突跳，耗时 1.5 秒才完全恢复平衡；",
              "vocab": []
            },
            {
              "sIndex": 3,
              "id": "P14-S3",
              "text": "Under A-INDI control, attitude fluctuation was constrained below $4^\\circ$ and stabilized within just 0.3 seconds, demonstrating a 5-fold faster disturbance recovery than PID.",
              "translation": "A-INDI 控制器：姿态波动峰值小于 $4^\\circ$，仅耗时 0.3 秒即完全重置回水平（抗扰恢复速度比 PID 快 5 倍）。",
              "vocab": [
                {
                  "word": "a-indi",
                  "ipa": "/eɪ ˈɪndi/",
                  "meaning": "自适应增量非线性动态逆 (Adaptive INDI)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 15,
          "logicRole": "试验 3：防撞保护套拆装的在线自适应收敛",
          "mainIdea": "在飞行中加装/拆卸防撞圈使惯量剧变；A-INDI 在 2~3 秒内迅速自适应收敛，飞行员完全感受不到手感变化。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P15-S1",
              "text": "Experiment 3: Propeller bumpers were dynamically attached and detached during flight, inducing dramatic inertia changes and altering rotor aerodynamics.",
              "translation": "试验 3（防撞环拆装在线自适应）：实验在飞行过程中为机身加装/拆卸防撞保护圈（Bumpers，使机体转动惯量剧变并改变螺旋桨周围气流分布）：",
              "vocab": [
                {
                  "word": "aerodynamics",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪks/",
                  "meaning": "空气动力学",
                  "level": "red"
                },
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "惯量，转动惯量",
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
              "id": "P15-S2",
              "text": "Experimental telemetry confirms that A-INDI automatically converged parameter estimates $\\hat{\\boldsymbol{G}}_1$ from default initialization to true physical effectiveness within 2 to 3 seconds, keeping pilot handling feel completely unchanged.",
              "translation": "实验曲线显示，自适应 A-INDI 在无人机起飞后 2~3 秒内，$\\hat{\\boldsymbol{G}}_1$ 估计参数迅速从初始默认值自适应收敛至真实物理效能值；在防撞套拆除后再次迅速自适应收敛，飞行员完全感受不到飞行手感的变化。",
              "vocab": [
                {
                  "word": "a-indi",
                  "ipa": "/eɪ ˈɪndi/",
                  "meaning": "自适应增量非线性动态逆 (Adaptive INDI)",
                  "level": "blue"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 16,
          "logicRole": "试验 4：计入转子角动量解决偏航软绵固有缺陷",
          "mainIdea": "显式补偿转子惯量力矩 Ir*dot(omega)，使偏航 Doublet 指令上升时间缩短 40%，彻底解决四旋翼偏航迟缓缺陷。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P16-S1",
              "text": "Experiment 4: Traditional quadrotors suffer sluggish yaw response because yaw relies purely on small motor differential reaction torques.",
              "translation": "试验 4（计入转子角动量偏航提升）：传统四旋翼在偏航方向因为仅依靠电机反扭矩差动，响应极为迟缓；",
              "vocab": [
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
              "id": "P16-S2",
              "text": "By explicitly compensating for rotor angular momentum and acceleration torque $\\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}}$, the yaw doublet step command rise time was reduced by 40%, completely resolving the notorious sluggish yaw problem.",
              "translation": "在显式补偿转子加速惯量力矩 $\\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}}$ 后，Doublet 偏航角指令的跟踪上升时间缩短了 40%，彻底解决了四旋翼“偏航软绵”的固有缺陷。",
              "vocab": [
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
      "id": "sec-conclusions",
      "sectionNumber": "六",
      "title": "VI. CONCLUSIONS",
      "chineseTitle": "六、主要结论 (VII. CONCLUSIONS)",
      "paragraphs": [
        {
          "pIndex": 17,
          "logicRole": "三大核心学术与工程结论",
          "mainIdea": "A-INDI 是极具前景的前沿控制理论；NLMS 自适应实时追踪效能衰减；抗扰恢复速度比 PID 快 5 倍极大增强生存能力。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P17-S1",
              "text": "1. A-INDI represents a highly promising control paradigm for MAVs by replacing complex physical models with direct sensor acceleration feedback and eliminating delay-induced limit cycles via matched time-synchronized filtering.",
              "translation": "1. A-INDI 是极具前景的微型飞行器姿态控制前沿理论。通过传感器加速度反馈替代了复杂物理模型，同时通过时钟对齐滤波消除了测量延迟引起的震荡失稳；",
              "vocab": [
                {
                  "word": "feedback",
                  "ipa": "/ˈfiːdbæk/",
                  "meaning": "反馈控制",
                  "level": "red"
                },
                {
                  "word": "a-indi",
                  "ipa": "/eɪ ˈɪndi/",
                  "meaning": "自适应增量非线性动态逆 (Adaptive INDI)",
                  "level": "blue"
                },
                {
                  "word": "mavs",
                  "ipa": "/ˈem.eɪ.viːz/",
                  "meaning": "微型飞行器（复数）",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P17-S2",
              "text": "2. Onboard real-time NLMS adaptation tracks motor effectiveness degradation, battery voltage decline, and physical payload shifts with zero tuning overhead.",
              "translation": "2. 机载在线 NLMS 自适应辨识能够实时追踪电机效率衰减、电池压降与载荷变化；",
              "vocab": [
                {
                  "word": "nlms",
                  "ipa": "/ˌen.el.emˈes/",
                  "meaning": "归一化最小均方误差算法 (Normalized LMS)",
                  "level": "blue"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P17-S3",
              "text": "3. Compared with classic PID and conventional model-based NDI, A-INDI delivers unmatched disturbance rejection under abrupt external wind and weight shocks, drastically boosting MAV survivability.",
              "translation": "3. 相比传统 PID 与基于模型的非线性控制，A-INDI 具有超强的突发外扰抑制能力，大幅提升了无人机在恶劣复杂环境下的生存能力。",
              "vocab": [
                {
                  "word": "disturbance rejection",
                  "ipa": "/dɪˈstɜːbəns rɪˈdʒekʃn/",
                  "meaning": "扰动抑制能力",
                  "level": "blue"
                },
                {
                  "word": "rejection",
                  "ipa": "/rɪˈdʒekʃn/",
                  "meaning": "抑制，抗扰能力 (Disturbance Rejection)",
                  "level": "red"
                },
                {
                  "word": "a-indi",
                  "ipa": "/eɪ ˈɪndi/",
                  "meaning": "自适应增量非线性动态逆 (Adaptive INDI)",
                  "level": "blue"
                },
                {
                  "word": "mav",
                  "ipa": "/ˈem.eɪ.viː/",
                  "meaning": "微型飞行器 (Micro Air Vehicle)",
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
