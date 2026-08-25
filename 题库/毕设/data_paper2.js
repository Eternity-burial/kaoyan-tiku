/**
 * 毕设文献阅读器 · 文献2：微型飞行器姿态控制的自适应增量非线性动态逆 (AIAA JGCD 2016)
 */

window.BISHE_DATA = window.BISHE_DATA || {};
window.BISHE_DATA['paper2'] = {
  "id": "paper2",
  "subject": "毕设",
  "title": "Adaptive Incremental Nonlinear Dynamic Inversion for Attitude Control of Micro Air Vehicles",
  "chineseTitle": "微型飞行器姿态控制的自适应增量非线性动态逆（A-INDI）",
  "meta": {
    "authors": "Ewoud J. J. Smeur, Qiping Chu (楚启平), Guido C. H. E. de Croon",
    "institution": "荷兰代尔夫特理工大学航空航天工程学院控制与仿真系 / MAVLab（Delft University of Technology）",
    "journal": "AIAA Journal of Guidance, Control, and Dynamics (JGCD), Vol. 39, No. 3, 2016",
    "links": [
      {
        "label": "DOI: 10.2514/1.G001490",
        "url": "https://doi.org/10.2514/1.G001490"
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
        "image": "题库/毕设/images/paper2_fig6_bebop_drone.png",
        "caption": "Fig. 6: 荷兰代尔夫特理工大学 MAVLab 实验飞行器 Parrot Bebop 四旋翼无人机与突加悬挂载荷装置 (AIAA JGCD 2016)",
        "alt": "Fig. 6: Bebop drone with payload"
      },
      "paragraphs": [
        {
          "pIndex": 1,
          "logicRole": "研究背景与 INDI 核心理念",
          "mainIdea": "增量非线性动态逆（INDI）利用传感器角加速度实测替代复杂物理模型项，摆脱对被控对象精确建模的依赖。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "Incremental Nonlinear Dynamic Inversion (INDI) is a sensor-based nonlinear control approach that promises high performance without requiring an accurate physical model.",
              "translation": "增量非线性动态逆（Incremental Nonlinear Dynamic Inversion, INDI）是一种基于传感器的非线性控制方法，它有望在不需要被控对象精确数学模型的前提下实现高性能非线性控制。",
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
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "In MAV attitude control, INDI relies only on the control effectiveness model, replacing the remaining physical terms with real-time sensor measurements of angular acceleration.",
              "translation": "在微型飞行器（MAV）姿态控制领域，INDI 仅依赖控制效能模型，而利用角加速度的实时传感器测量值来替代传统模型中的其余物理项。",
              "vocab": [
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（横滚、俯仰、偏航）",
                  "level": "red"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能（控制效能矩阵 G）",
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
        },
        {
          "pIndex": 2,
          "logicRole": "两大核心工程难题与解决方案",
          "mainIdea": "提出时序同步控制律补偿滤波滞后振荡，提出机载 NLMS 自适应算法在线估计时变控制效能矩阵 G1。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P2-S1",
              "text": "This paper resolves two fundamental challenges: handling clock delays and phase lag from sensor and actuator filtering, and adapting to time-varying control effectiveness.",
              "translation": "本文针对 INDI 控制在实际工程应用中的两大核心挑战给出了完备的解决方案：1. 如何处理传感器测量与执行器动力学引入的时钟延迟与滤波相位滞后；2. 如何应对飞行过程中控制效能矩阵的时变不确定性。",
              "vocab": [
                {
                  "word": "phase lag",
                  "ipa": "/feɪz læɡ/",
                  "meaning": "相位滞后",
                  "level": "red"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/电调/舵机）",
                  "level": "red"
                },
                {
                  "word": "filtering",
                  "ipa": "/ˈfɪltərɪŋ/",
                  "meaning": "滤波",
                  "level": "green"
                },
                {
                  "word": "time-varying",
                  "ipa": "/ˈtaɪm ˌveəriɪŋ/",
                  "meaning": "时变的",
                  "level": "red"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能（控制效能矩阵 G）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "Contributions include a synchronized virtual control law for delay compensation, an online Normalized Least-Mean-Squares (NLMS) adaptive parameter estimator, and accounting for rotor angular momentum.",
              "translation": "主要贡献包括：1. 提出了能够精确补偿角加速度低通滤波延迟的时序同步虚拟控制律；2. 提出了自适应增量非线性动态逆（A-INDI）架构，利用机载 NLMS 滤波器在线实时辨识控制效能参数；3. 显式计入螺旋桨旋转角动量与加减速自旋力矩；4. 通过 Parrot Bebop 实飞实验充分验证了卓越的抗扰自适应能力。",
              "vocab": [
                {
                  "word": "angular momentum",
                  "ipa": "/ˈæŋɡjələ məˈmentəm/",
                  "meaning": "角动量（旋转动量）",
                  "level": "blue"
                },
                {
                  "word": "synchronized",
                  "ipa": "/ˈsɪŋkrənaɪzd/",
                  "meaning": "时序同步的，对齐的",
                  "level": "green"
                },
                {
                  "word": "virtual",
                  "ipa": "/ˈvɜːtʃuəl/",
                  "meaning": "虚拟的（如虚拟控制输入量 nu）",
                  "level": "red"
                },
                {
                  "word": "compensation",
                  "ipa": "/ˌkɒmpenˈseɪʃn/",
                  "meaning": "补偿",
                  "level": "red"
                },
                {
                  "word": "normalized",
                  "ipa": "/ˈnɔːməlaɪzd/",
                  "meaning": "归一化的",
                  "level": "green"
                },
                {
                  "word": "least-mean-squares",
                  "ipa": "/liːst miːn skweəz/",
                  "meaning": "最小均方误差 (LMS/NLMS)",
                  "level": "blue"
                },
                {
                  "word": "adaptive",
                  "ipa": "/əˈdæptɪv/",
                  "meaning": "自适应的（参数在线估计与自调谐）",
                  "level": "red"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "转子，旋翼",
                  "level": "green"
                },
                {
                  "word": "momentum",
                  "ipa": "/məˈmentəm/",
                  "meaning": "动量",
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
      "chineseTitle": "一、引言与研究动机",
      "paragraphs": [
        {
          "pIndex": 3,
          "logicRole": "MAV 抗扰瓶颈与传统方法局限",
          "mainIdea": "微型飞行器极易受突发阵风扰动，线性 PID 难以全包线保持性能，传统 NDI 则严重依赖难以测定的气动阻尼模型。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P3-S1",
              "text": "Micro Air Vehicles (MAVs), due to small size and low inertia, are highly vulnerable to wind gusts, turbulence, and ground effects.",
              "translation": "微型飞行器（MAV）由于尺寸小、重量轻、惯量极低，在飞行过程中极其容易受到风切变、阵风紊流以及地面效应等剧烈扰动的影响。",
              "vocab": [
                {
                  "word": "inertia",
                  "ipa": "/ɪˈnɜːʃə/",
                  "meaning": "转动惯量，惯性",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P3-S2",
              "text": "Traditional PID controllers require tedious gain tuning around operating points, while traditional NDI relies heavily on accurate aerodynamic and damping models.",
              "translation": "传统的线性 PID 控制器需要在线性工作点附近精细整定增益，难以在全飞行包线和未知扰动下保持一致的高性能；传统的非线性动态逆（NDI）虽然能理论解耦，但严重依赖极难精确测定的气动阻尼和旋翼干扰模型。",
              "vocab": [
                {
                  "word": "aerodynamic",
                  "ipa": "/ˌeərəʊdaɪˈnæmɪk/",
                  "meaning": "空气动力学的，气动的",
                  "level": "red"
                },
                {
                  "word": "damping",
                  "ipa": "/ˈdæmpɪŋ/",
                  "meaning": "阻尼（线性与二次非线性水阻）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P3-S3",
              "text": "INDI breaks this bottleneck by utilizing IMU measured angular acceleration $\\dot{\\boldsymbol{\\Omega}}_0$ as the baseline point, simplifying dynamic inversion into control input increments $\\Delta \\dot{\\boldsymbol{\\Omega}} = \\boldsymbol{G}_1 \\Delta \\boldsymbol{u}$.",
              "translation": "增量非线性动态逆（INDI）的破局理念：不依赖对未知非线性函数的离线预先计算，而是直接利用 IMU 传感器测得的角加速度 $\\dot{\\boldsymbol{\\Omega}}_0$ 作为基准点，通过泰勒级数展开将动力学逆解简化为控制输入的增量映射 $\\Delta \\dot{\\boldsymbol{\\Omega}} = \\boldsymbol{G}_1 \\Delta \\boldsymbol{u}$。",
              "vocab": [
                {
                  "word": "dynamic inversion",
                  "ipa": "/daɪˈnæmɪk ɪnˈvɜːʃn/",
                  "meaning": "动态逆（非线性系统逆解解耦）",
                  "level": "red"
                },
                {
                  "word": "bottleneck",
                  "ipa": "/ˈbɒtlnek/",
                  "meaning": "瓶颈，核心限制",
                  "level": "green"
                },
                {
                  "word": "imu",
                  "ipa": "/ˌaɪ em ˈjuː/",
                  "meaning": "惯性测量单元 (IMU)",
                  "level": "blue"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
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
      "chineseTitle": "二、四旋翼动力学模型与增量形式展开",
      "figure": {
        "image": "题库/毕设/images/paper2_fig2_indi_diagram.png",
        "caption": "Fig. 2: 基于角加速度传感器反馈与电机转速状态反馈的标准 INDI 控制回路框图 (AIAA JGCD 2016)",
        "alt": "Fig. 2: Block diagram of INDI"
      },
      "paragraphs": [
        {
          "pIndex": 4,
          "logicRole": "欧拉转动方程与力矩分解",
          "mainIdea": "四旋翼转动动力学包含电机控制力矩 Mc、气动力矩 Ma 与螺旋桨自旋加减速反作用陀螺力矩 Mr。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P4-S1",
              "text": "Quadrotor rotational dynamics are described by Euler's equation: $\\boldsymbol{I}_v \\dot{\\boldsymbol{\\Omega}} + \\boldsymbol{\\Omega} \\times (\\boldsymbol{I}_v \\boldsymbol{\\Omega}) = \\boldsymbol{M}_a(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\boldsymbol{M}_c - \\boldsymbol{M}_r$.",
              "translation": "四旋翼飞行器的转动动力学由欧拉方程给出：$\\boldsymbol{I}_v \\dot{\\boldsymbol{\\Omega}} + \\boldsymbol{\\Omega} \\times (\\boldsymbol{I}_v \\boldsymbol{\\Omega}) = \\boldsymbol{M}_a(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\boldsymbol{M}_c - \\boldsymbol{M}_r$。",
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
                },
                {
                  "word": "euler",
                  "ipa": "/ˈɔɪlər/",
                  "meaning": "欧拉（如欧拉方程、欧拉角）",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P4-S2",
              "text": "Here, control moment is $\\boldsymbol{M}_c = \\boldsymbol{M}_{c,\\text{matrix}} \\boldsymbol{\\omega}^2$, and propeller gyroscopic and acceleration torque is $\\boldsymbol{M}_r = \\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}} + \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_r \\boldsymbol{\\omega}$.",
              "translation": "其中控制力矩为 $\\boldsymbol{M}_c = \\boldsymbol{M}_{c,\\text{matrix}} \\boldsymbol{\\omega}^2$，螺旋桨自旋与加减速反扭矩为 $\\boldsymbol{M}_r = \\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}} + \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_r \\boldsymbol{\\omega}$。",
              "vocab": [
                {
                  "word": "matrix",
                  "ipa": "/ˈmeɪtrɪks/",
                  "meaning": "矩阵",
                  "level": "green"
                },
                {
                  "word": "propeller",
                  "ipa": "/prəˈpelə/",
                  "meaning": "螺旋桨",
                  "level": "green"
                },
                {
                  "word": "gyroscopic",
                  "ipa": "/ˌdʒaɪrəˈskɒpɪk/",
                  "meaning": "陀螺效应的，陀螺力矩的",
                  "level": "green"
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
        },
        {
          "pIndex": 5,
          "logicRole": "泰勒展开推导 INDI 核心增量方程",
          "mainIdea": "在上一时刻采样点展开，用传感器实测角加速度替换物理模型项，得出增量控制方程。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P5-S1",
              "text": "Applying a first-order Taylor expansion around previous step $(\\boldsymbol{\\Omega}_0, \\boldsymbol{\\omega}_0)$ and replacing physical model terms with measured $\\dot{\\boldsymbol{\\Omega}}_0$ yields: $\\dot{\\boldsymbol{\\Omega}} \\approx \\dot{\\boldsymbol{\\Omega}}_0 + \\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_0)(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0) + \\boldsymbol{G}_2(\\dot{\\boldsymbol{\\omega}} - \\dot{\\boldsymbol{\\omega}}_0)$.",
              "translation": "在上一时刻采样点 $(\\boldsymbol{\\Omega}_0, \\boldsymbol{\\omega}_0)$ 附近进行一阶泰勒展开，并利用传感器测量的实际角加速度 $\\dot{\\boldsymbol{\\Omega}}_0$ 替代非线性物理模型项，得到 **INDI 核心增量方程**：$\\dot{\\boldsymbol{\\Omega}} \\approx \\dot{\\boldsymbol{\\Omega}}_0 + \\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_0)(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0) + \\boldsymbol{G}_2(\\dot{\\boldsymbol{\\omega}} - \\dot{\\boldsymbol{\\omega}}_0)$。",
              "vocab": [
                {
                  "word": "taylor expansion",
                  "ipa": "/ˈteɪlə ɪkˈspænʃn/",
                  "meaning": "泰勒展开",
                  "level": "blue"
                },
                {
                  "word": "taylor",
                  "ipa": "/ˈteɪlə/",
                  "meaning": "泰勒（级数展开）",
                  "level": "green"
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
      "title": "III. SENSOR DELAY & FILTER COMPENSATION",
      "chineseTitle": "三、时序滤波延迟分析与同步补偿设计",
      "figure": {
        "image": "题库/毕设/images/paper2_fig5_filter_compensation.png",
        "caption": "Fig. 5: 消除相位滞后与极限环振荡的时序对称低通滤波补偿结构控制框图 (AIAA JGCD 2016)",
        "alt": "Fig. 5: Filter delay compensation block diagram"
      },
      "paragraphs": [
        {
          "pIndex": 6,
          "logicRole": "滤波相位滞后机理与对称同步控制律",
          "mainIdea": "角加速度低通滤波引入严重相位滞后导致极限环振荡；提出将执行机构指令输入对称滤波通道以消除相位失配。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P6-S1",
              "text": "Gyro differentiation followed by a second-order Butterworth low-pass filter $H(z)$ creates phase lag, causing $\\dot{\\boldsymbol{\\Omega}}_f$ to reflect past motor inputs and inducing severe limit-cycle oscillations.",
              "translation": "陀螺仪差分信号经过二阶巴特沃斯低通滤波器 $H(z)$ 以滤除电机高频震动，这引入了不可忽视的时间滞后；传感器测得的角加速度 $\\dot{\\boldsymbol{\\Omega}}_f$ 实际反映的是过去时刻的电机转速，直接控制会导致回路自激剧烈震荡。",
              "vocab": [
                {
                  "word": "phase lag",
                  "ipa": "/feɪz læɡ/",
                  "meaning": "相位滞后",
                  "level": "red"
                },
                {
                  "word": "low-pass filter",
                  "ipa": "/ləʊ pɑːs ˈfɪltə/",
                  "meaning": "低通滤波器",
                  "level": "blue"
                },
                {
                  "word": "gyro",
                  "ipa": "/ˈdʒaɪrəʊ/",
                  "meaning": "陀螺仪",
                  "level": "green"
                },
                {
                  "word": "butterworth",
                  "ipa": "/ˈbʌtəwɜːθ/",
                  "meaning": "巴特沃斯（低通滤波器）",
                  "level": "green"
                },
                {
                  "word": "filter",
                  "ipa": "/ˈfɪltə/",
                  "meaning": "滤波器，滤波",
                  "level": "green"
                },
                {
                  "word": "limit-cycle",
                  "ipa": "/ˈlɪmɪt saɪkl/",
                  "meaning": "极限环（自激非线性振荡）",
                  "level": "red"
                },
                {
                  "word": "oscillations",
                  "ipa": "/ˌɒsɪˈleɪʃnz/",
                  "meaning": "振荡",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P6-S2",
              "text": "To eliminate phase mismatch, we route the actuator command through a matched filter channel $\\boldsymbol{\\omega}_f$, formulating the synchronized virtual control law: $\\boldsymbol{\\omega}_c = \\boldsymbol{\\omega}_f + [\\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_f)]^\\dagger (\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_f)$.",
              "translation": "为了消除相位失配引起的自激振荡，论文提出将执行机构控制量引入对称滤波通道：$\\boldsymbol{\\omega}_c = \\boldsymbol{\\omega}_f + [\\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_f)]^\\dagger (\\boldsymbol{\\nu} - \\dot{\\boldsymbol{\\Omega}}_f)$。该结构在数学上保证了穿越频率处的相位裕度，彻底根除了未补偿 INDI 的极限环振荡。",
              "vocab": [
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/电调/舵机）",
                  "level": "red"
                },
                {
                  "word": "filter",
                  "ipa": "/ˈfɪltə/",
                  "meaning": "滤波器，滤波",
                  "level": "green"
                },
                {
                  "word": "synchronized",
                  "ipa": "/ˈsɪŋkrənaɪzd/",
                  "meaning": "时序同步的，对齐的",
                  "level": "green"
                },
                {
                  "word": "virtual",
                  "ipa": "/ˈvɜːtʃuəl/",
                  "meaning": "虚拟的（如虚拟控制输入量 nu）",
                  "level": "red"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sec-adaptation",
      "sectionNumber": "四",
      "title": "IV. ADAPTIVE ONLINE PARAMETER ESTIMATION (A-INDI)",
      "chineseTitle": "四、自适应参数在线辨识算法 (A-INDI)",
      "figure": {
        "image": "题库/毕设/images/paper2_fig18_19_adaptation_curves.png",
        "caption": "Fig. 18 & 19: 自适应 A-INDI 算法在飞行中实时追踪控制效能参数 G1 变化的收敛曲线 (AIAA JGCD 2016)",
        "alt": "Fig. 18-19: Parameter adaptation curves"
      },
      "paragraphs": [
        {
          "pIndex": 7,
          "logicRole": "NLMS 在线自适应递推更新律",
          "mainIdea": "基于归一化最小均方误差（NLMS）在线更新控制效能矩阵 G1，仅几条向量点乘即可在机载 512 Hz 实时运行。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P7-S1",
              "text": "To adapt to battery voltage drop and payload variations without manual tuning, an online Normalized Least-Mean-Squares (NLMS) algorithm estimates control effectiveness $\\boldsymbol{G}_1$.",
              "translation": "为了使控制器摆脱对离线参数测定的依赖并自适应电池电压下降与挂载变化，论文引入了基于归一化最小均方误差（NLMS）的在线自适应辨识算法。",
              "vocab": [
                {
                  "word": "payload",
                  "ipa": "/ˈpeɪləʊd/",
                  "meaning": "有效载荷，外挂重物",
                  "level": "green"
                },
                {
                  "word": "normalized",
                  "ipa": "/ˈnɔːməlaɪzd/",
                  "meaning": "归一化的",
                  "level": "green"
                },
                {
                  "word": "least-mean-squares",
                  "ipa": "/liːst miːn skweəz/",
                  "meaning": "最小均方误差 (LMS/NLMS)",
                  "level": "blue"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能（控制效能矩阵 G）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P7-S2",
              "text": "The update law is: $\\hat{\\boldsymbol{G}}_1(k+1) = \\hat{\\boldsymbol{G}}_1(k) + \\boldsymbol{\\mu}_1 \\boldsymbol{e}(k) [\\text{diag}(\\boldsymbol{\\omega}_f) \\Delta \\boldsymbol{\\omega}_f]^T / (\\epsilon + \\|\\text{diag}(\\boldsymbol{\\omega}_f) \\Delta \\boldsymbol{\\omega}_f\\|^2)$, requiring minimal computation at 512 Hz.",
              "translation": "控制效能矩阵更新律为：$\\hat{\\boldsymbol{G}}_1(k+1) = \\hat{\\boldsymbol{G}}_1(k) + \\boldsymbol{\\mu}_1 \\frac{\\boldsymbol{e}(k) [\\text{diag}(\\boldsymbol{\\omega}_f) \\Delta \\boldsymbol{\\omega}_f]^T}{\\epsilon + \\|\\text{diag}(\\boldsymbol{\\omega}_f) \\Delta \\boldsymbol{\\omega}_f\\|^2}$。该算法计算量极小（仅几条向量点乘），可在机载单片机上以 512 Hz 实时无延迟运行。",
              "vocab": []
            }
          ]
        }
      ]
    },
    {
      "id": "sec-experiments",
      "sectionNumber": "五",
      "title": "V. REAL FLIGHT EXPERIMENTS & STEP DISTURBANCE REJECTION",
      "chineseTitle": "五、实机飞行实验：阶跃扰动抑制与防撞圈自适应",
      "figures": [
        {
          "image": "题库/毕设/images/paper2_fig8_9_step_response.png",
          "caption": "Fig. 8 & 9: 50g 突加重物瞬间断线释放时的俯仰角阶跃扰动响应曲线对比（A-INDI 恢复时间比经典 PID 快 5 倍） (AIAA JGCD 2016)"
        },
        {
          "image": "题库/毕设/images/paper2_fig15_pid_step_response.png",
          "caption": "Fig. 15: 经典 PID 在阶跃扰动下的姿态超调与振荡衰减过程"
        },
        {
          "image": "题库/毕设/images/paper2_fig26_yaw_doublet.png",
          "caption": "Fig. 26: 显式计入转子角动量力矩后，四旋翼偏航 (Yaw) Doublet 响应上升时间缩短 40%"
        }
      ],
      "paragraphs": [
        {
          "pIndex": 8,
          "logicRole": "飞行试验与阶跃扰动定量对比",
          "mainIdea": "Parrot Bebop 实飞证明：50g 突加负载断线释放时 A-INDI 恢复仅需 0.3s (快 5 倍)；防撞圈拆装 2~3s 内自适应收敛；偏航响应提速 40%。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P8-S1",
              "text": "In a sudden 50g attached weight release test during hover, classical PID exhibited a 15-degree pitch jump taking 1.5 s to recover, while A-INDI limited deviation to under 4 degrees and recovered in 0.3 s (5 times faster).",
              "translation": "在 50g 额外重物突然释放（瞬间阶跃卸载）试验中：经典 PID 俯仰角出现高达 15° 的剧烈突跳，耗时 **1.5 秒** 才恢复平衡；A-INDI 姿态波动峰值小于 4°，仅耗时 **0.3 秒** 即完全重置回水平（**抗扰恢复速度比 PID 快 5 倍**）。",
              "vocab": [
                {
                  "word": "pitch",
                  "ipa": "/pɪtʃ/",
                  "meaning": "俯仰角 (Pitch, y轴旋转)",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P8-S2",
              "text": "During in-flight propeller bumper mounting/dismounting, G_1 estimates converged to true physical values within 2-3 seconds without pilot notice.",
              "translation": "在飞行过程中加装/拆卸防撞保护圈试验中，自适应 A-INDI 在 **2~3 秒内** 参数迅速从初始值自适应收敛至真实物理效能值，飞行手感保持完全一致。",
              "vocab": [
                {
                  "word": "propeller",
                  "ipa": "/prəˈpelə/",
                  "meaning": "螺旋桨",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P8-S3",
              "text": "Compensating for rotor angular momentum $\\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}}$ reduced yaw doublet rise time by 40%, resolving sluggish yaw response.",
              "translation": "显式补偿转子加速惯量力矩 $\\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}}$ 后，偏航 Doublet 指令的跟踪上升时间缩短了 **40%**，彻底解决了四旋翼“偏航软绵”的固有缺陷。",
              "vocab": [
                {
                  "word": "angular momentum",
                  "ipa": "/ˈæŋɡjələ məˈmentəm/",
                  "meaning": "角动量（旋转动量）",
                  "level": "blue"
                },
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "转子，旋翼",
                  "level": "green"
                },
                {
                  "word": "momentum",
                  "ipa": "/məˈmentəm/",
                  "meaning": "动量",
                  "level": "green"
                },
                {
                  "word": "yaw",
                  "ipa": "/jɔː/",
                  "meaning": "偏航角 (Yaw, z轴旋转)",
                  "level": "red"
                },
                {
                  "word": "doublet",
                  "ipa": "/ˈdʌblɪt/",
                  "meaning": "双向方波脉冲激励",
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
