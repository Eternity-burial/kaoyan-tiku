/**
 * 毕设文献精读 · 文献2：微型飞行器姿态控制的自适应增量非线性动态逆 (AIAA JGCD 2016)
 */

window.BISHE_DATA = window.BISHE_DATA || {};
window.BISHE_DATA['paper2'] = {
  "year": "paper2",
  "subject": "毕设",
  "title": "文献2: 微型飞行器姿态控制的自适应增量非线性动态逆 (AIAA JGCD 2016)",
  "texts": [
    {
      "id": "text1",
      "number": 1,
      "title": "I. Abstract & Introduction: Sensor-Based Control Paradigm",
      "chineseTitle": "第1章：摘要与引言 · 基于传感器的控制范式与两大工程难题",
      "topic": "自适应控制 / 传感器增量动态逆",
      "overview": "选自荷兰代尔夫特理工大学 MAVLab 发表在《AIAA Journal of Guidance, Control, and Dynamics (JGCD 2016)》的权威文献。针对微型飞行器（MAV）提出自适应增量非线性动态逆（A-INDI），彻底解决传感器滤波延迟自激振荡与控制效能时变漂移难题。",
      "figure": {
        "image": "题库/毕设/images/paper2_fig6_bebop_drone.png",
        "caption": "Fig. 6: 荷兰代尔夫特理工大学实验飞行器 Parrot Bebop 四旋翼无人机与突加悬挂载荷装置 (AIAA JGCD 2016)",
        "alt": "Fig. 6: Bebop drone with payload"
      },
      "paragraphs": [
        {
          "pIndex": 1,
          "logicRole": "核心思想 · INDI 无模型控制原理",
          "mainIdea": "INDI 仅依赖控制效能模型，利用传感器角加速度测量值替代复杂的动力学物理模型项。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "Incremental Nonlinear Dynamic Inversion (INDI) is a sensor-based nonlinear control approach that achieves high performance without requiring an accurate physical model.",
              "translation": "增量非线性动态逆（Incremental Nonlinear Dynamic Inversion, INDI）是一种基于传感器的非线性控制方法，它在不需要被控对象精确数学模型的前提下实现高性能非线性控制。",
              "isTopicSentence": true,
              "isKeyEvidence": false,
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
                  "word": "sensor-based",
                  "ipa": "/ˈsensə beɪst/",
                  "meaning": "基于传感器的",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "In MAV attitude control, INDI relies only on the control effectiveness model, replacing the remaining physical terms with real-time sensor measurements of angular acceleration.",
              "translation": "在微型飞行器（MAV）姿态控制中，INDI 仅依赖控制效能模型，而利用角加速度的实时传感器测量值来替代传统模型中的其余复杂物理项。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "attitude",
                  "ipa": "/ˈætɪtjuːd/",
                  "meaning": "姿态（俯仰、横滚、偏航）",
                  "level": "red"
                },
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能（如控制效能矩阵 G）",
                  "level": "red"
                },
                {
                  "word": "real-time",
                  "ipa": "/ˈrɪəl taɪm/",
                  "meaning": "实时的",
                  "level": "green"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，旋转的",
                  "level": "green"
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
          "logicRole": "工程瓶颈 · 滤波延迟失稳与参数时变挑战",
          "mainIdea": "MAV 应用 INDI 面临两大瓶颈：滤波相位滞后引起的自激振荡，以及控制效能矩阵的时变不确定性。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P2-S1",
              "text": "This paper addresses two fundamental challenges in applying INDI: sensor and actuator filtering delays leading to severe phase lag, and time-varying control effectiveness.",
              "translation": "本文系统解决了 INDI 在实际应用中的两大核心挑战：传感器滤波与执行器响应引入的时钟延迟与滤波相位滞后，以及飞行过程中控制效能矩阵的时变不确定性。",
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "phase lag",
                  "ipa": "/feɪz læɡ/",
                  "meaning": "相位滞后（低通滤波引入的时序延迟）",
                  "level": "red"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机）",
                  "level": "red"
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
                  "meaning": "效能（如控制效能矩阵 G）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "We propose a synchronized virtual control law to compensate for low-pass filter delays and an online Normalized Least-Mean-Squares (NLMS) algorithm for adaptive parameter estimation.",
              "translation": "我们提出了能够精确补偿低通滤波延迟的**时序同步虚拟控制律**，并引入机载**归一化最小均方误差（NLMS）**自适应算法实时辨识控制效能参数。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "synchronized",
                  "ipa": "/ˈsɪŋkrənaɪzd/",
                  "meaning": "时序同步的，通道对齐的",
                  "level": "green"
                },
                {
                  "word": "virtual",
                  "ipa": "/ˈvɜːtʃuəl/",
                  "meaning": "虚拟的（如虚拟控制量 nu）",
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
                  "meaning": "自适应的（参数在线估计）",
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
          "type": "核心概念",
          "tangchiModel": "控制理论本质解构",
          "stem": "What distinguishes INDI from traditional Model-Based Nonlinear Dynamic Inversion (NDI)?",
          "stemKeywords": [
            "INDI",
            "NDI",
            "sensor-based",
            "angular acceleration measurement"
          ],
          "targetSentences": [
            "P1-S1",
            "P1-S2"
          ],
          "options": [
            {
              "key": "A",
              "text": "INDI requires an extremely precise aerodynamic CFD model of rotor damping.",
              "isCorrect": false,
              "distractorType": "正反倒置",
              "analysis": "INDI 的初衷正是摆脱对精确流体气动 CFD 模型的依赖。",
              "refSentences": [
                "P1-S1"
              ]
            },
            {
              "key": "B",
              "text": "INDI replaces complex physical model terms with IMU angular acceleration sensor measurements, needing only the control effectiveness model.",
              "isCorrect": true,
              "distractorType": "正确项 · 核心提炼",
              "analysis": "对应 P1-S2：INDI 仅需控制效能矩阵 G，其余未建模力和力矩均由当前拍传感器实测角加速度增量直接替代抵消。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "C",
              "text": "INDI cannot be implemented on microprocessors due to high computation.",
              "isCorrect": false,
              "distractorType": "曲解文意",
              "analysis": "INDI 仅为简单的矩阵解析乘加运算，能在单片机上以 500Hz 极速运行。",
              "refSentences": [
                "P1-S1"
              ]
            },
            {
              "key": "D",
              "text": "INDI operates exclusively in the frequency domain without time-domain state feedback.",
              "isCorrect": false,
              "distractorType": "偷换概念",
              "analysis": "INDI 是经典的时域逐拍状态/传感器增量控制律。",
              "refSentences": [
                "P1-S2"
              ]
            }
          ],
          "officialAnswer": "B",
          "presetReflection": {
            "trapAnalysis": "NDI（模型依赖）vs INDI（传感器反馈依赖）是现代非线性控制的最关键分水岭。",
            "methodSummary": "牢记口诀：'用传感器测量精度换取物理建模精度'。"
          }
        }
      ]
    },
    {
      "id": "text2",
      "number": 2,
      "title": "II. Quadrotor Dynamics & Incremental NDI Formulation",
      "chineseTitle": "第2章：四旋翼转动动力学与增量动态逆展开",
      "topic": "动力学方程 / 泰勒展开与增量形式",
      "overview": "从欧拉转动方程出发，显式计入电机控制力矩 Mc、旋翼加减速自旋力矩 Mr，在上一时刻采样点附近进行一阶泰勒展开，推导经典 INDI 增量核心控制方程。",
      "figure": {
        "image": "题库/毕设/images/paper2_fig2_indi_diagram.png",
        "caption": "Fig. 2: 基于角加速度反馈与执行器状态反馈的标准 INDI 控制回路框图 (AIAA JGCD 2016)",
        "alt": "Fig. 2: Block diagram of INDI"
      },
      "paragraphs": [
        {
          "pIndex": 1,
          "logicRole": "公式推导 · 刚体转动动力学与电机力矩展开",
          "mainIdea": "四旋翼姿态动力学包含控制力矩、气动力矩与螺旋桨自旋加减速反作用陀螺力矩。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "The rotational dynamics of the quadrotor are given by Euler's equation: I_v \\dot{\\Omega} + \\Omega \\times (I_v \\Omega) = M_a + M_c - M_r.",
              "translation": "四旋翼飞行器的转动动力学由欧拉方程给出：$\\boldsymbol{I}_v \\dot{\\boldsymbol{\\Omega}} + \\boldsymbol{\\Omega} \\times (\\boldsymbol{I}_v \\boldsymbol{\\Omega}) = \\boldsymbol{M}_a(\\boldsymbol{\\Omega}, \\boldsymbol{v}) + \\boldsymbol{M}_c - \\boldsymbol{M}_r$。",
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
              "id": "P1-S2",
              "text": "Here, M_c represents the control moments generated by rotor thrusts, and M_r = I_r \\dot{\\omega} + \\Omega \\times I_r \\omega denotes the propeller gyroscopic and acceleration torque.",
              "translation": "其中 $\\boldsymbol{M}_c$ 为旋翼产生的控制力矩，$\\boldsymbol{M}_r = \\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}} + \\boldsymbol{\\Omega} \\times \\boldsymbol{I}_r \\boldsymbol{\\omega}$ 为螺旋桨自旋与加减速反作用陀螺力矩。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "rotor",
                  "ipa": "/ˈrəʊtə/",
                  "meaning": "旋翼，螺旋桨",
                  "level": "green"
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
          "logicRole": "公式推导 · 泰勒展开推导 INDI 核心增量方程",
          "mainIdea": "在上一采样点进行一阶泰勒展开，用实测角加速度替换非线性项，得到增量线性方程。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P2-S1",
              "text": "Applying a first-order Taylor series expansion around the previous time step (\\Omega_0, \\omega_0) yields the fundamental INDI incremental equation: \\dot{\\Omega} \\approx \\dot{\\Omega}_0 + G_1 diag(\\omega_0)(\\omega - \\omega_0).",
              "translation": "在上一时刻采样点 $(\\boldsymbol{\\Omega}_0, \\boldsymbol{\\omega}_0)$ 附近进行一阶泰勒展开，并利用实测角加速度 $\\dot{\\boldsymbol{\\Omega}}_0$ 替代非线性物理模型项，得到 **INDI 核心增量方程**：$\\dot{\\boldsymbol{\\Omega}} \\approx \\dot{\\boldsymbol{\\Omega}}_0 + \\boldsymbol{G}_1 \\text{diag}(\\boldsymbol{\\omega}_0)(\\boldsymbol{\\omega} - \\boldsymbol{\\omega}_0)$。",
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
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
          "qIndex": 2,
          "type": "细节题",
          "tangchiModel": "数学推导与物理项分析",
          "stem": "In the derivation of INDI, what replaces the complex unknown nonlinear aerodynamic moments M_a?",
          "stemKeywords": [
            "M_a",
            "Taylor expansion",
            "sensor angular acceleration",
            "dot_Omega_0"
          ],
          "targetSentences": [
            "P2-S1"
          ],
          "options": [
            {
              "key": "A",
              "text": "An offline neural network trained on wind tunnel datasets.",
              "isCorrect": false,
              "distractorType": "无中生有",
              "analysis": "文中未采用离线神经网络。",
              "refSentences": [
                "P2-S1"
              ]
            },
            {
              "key": "B",
              "text": "The real-time sensor measurement of angular acceleration dot_Omega_0 from the IMU.",
              "isCorrect": true,
              "distractorType": "正确项 · 原文推导",
              "analysis": "对应 P2-S1：泰勒展开基准点直接使用传感器上一时刻实测角加速度 dot_Omega_0，包含了所有作用在机体上的实际外力矩效果。",
              "refSentences": [
                "P2-S1"
              ]
            },
            {
              "key": "C",
              "text": "A linear damper model with constant damping coefficients.",
              "isCorrect": false,
              "distractorType": "偷换概念",
              "analysis": "线性阻尼属于传统模型，INDI 并不需要设定常数阻尼项。",
              "refSentences": [
                "P2-S1"
              ]
            },
            {
              "key": "D",
              "text": "The collective vertical thrust command.",
              "isCorrect": false,
              "distractorType": "概念混淆",
              "analysis": "总推力指令是控制输入的一部分，不能替代气动力矩。",
              "refSentences": [
                "P2-S1"
              ]
            }
          ],
          "officialAnswer": "B",
          "presetReflection": {
            "trapAnalysis": "理解 INDI 的核心即：通过传感器实测上一拍的实际加速度输出，间接获知了所有外部未建模力矩的总和。",
            "methodSummary": "泰勒级数增量化是化简强非线性系统的精妙数学工具。"
          }
        }
      ]
    },
    {
      "id": "text3",
      "number": 3,
      "title": "III. Sensor/Actuator Delay & Synchronized Filter Compensation",
      "chineseTitle": "第3章：时序滤波延迟分析与同步补偿控制律设计",
      "topic": "延迟补偿 / 巴特沃斯滤波与时序对齐",
      "overview": "深入研究陀螺仪二阶巴特沃斯低通滤波器与电机电调惯性环节引入的时间滞后，提出对称滤波通道控制律，彻底根除未补偿 INDI 引起的自激极限环剧烈振荡。",
      "figure": {
        "image": "题库/毕设/images/paper2_fig5_filter_compensation.png",
        "caption": "Fig. 5: 消除相位滞后与极限环振荡的时序对称低通滤波补偿结构控制框图 (AIAA JGCD 2016)",
        "alt": "Fig. 5: Filter delay compensation"
      },
      "paragraphs": [
        {
          "pIndex": 1,
          "logicRole": "问题机理 · 滤波滞后引发的回路自激振荡",
          "mainIdea": "陀螺仪信号滤波去噪引入了显著时间滞后，直接输入增量控制律会导致系统在穿越频率处失稳。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "Angular acceleration is obtained by differentiating gyro signals followed by a second-order Butterworth low-pass filter H(z) to suppress high-frequency motor vibrations.",
              "translation": "角加速度通过对陀螺仪信号进行数值差分并经过二阶巴特沃斯低通滤波器 $H(z)$ 滤波以滤除电机高频震动。",
              "isTopicSentence": true,
              "isKeyEvidence": false,
              "vocab": [
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，旋转的",
                  "level": "green"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "gyro",
                  "ipa": "/ˈdʒaɪrəʊ/",
                  "meaning": "陀螺力矩",
                  "level": "green"
                },
                {
                  "word": "butterworth",
                  "ipa": "/ˈbʌtəwɜːθ/",
                  "meaning": "巴特沃斯低通滤波器",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "This filtering delay causes the measured angular acceleration \\dot{\\Omega}_f to reflect past actuator inputs, leading to severe limit-cycle oscillations if uncompensated.",
              "translation": "然而，滤波延迟导致传感器测得的角加速度 $\\dot{\\boldsymbol{\\Omega}}_f$ 实际反映的是过去时刻的电机转速，若不加补偿会直接导致闭环回路发生严重的自激极限环振荡。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，旋转的",
                  "level": "green"
                },
                {
                  "word": "acceleration",
                  "ipa": "/əkˌseləˈreɪʃn/",
                  "meaning": "加速度",
                  "level": "green"
                },
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机）",
                  "level": "red"
                }
              ]
            }
          ]
        },
        {
          "pIndex": 2,
          "logicRole": "解决方案 · 对称时钟同步虚拟控制律推导",
          "mainIdea": "将电机控制量引入相同的滤波通道 omega_f，使控制输入与传感器测量在时序上完全对齐。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P2-S1",
              "text": "To eliminate the phase mismatch, we introduce actuator command into a matching filter channel \\omega_f, deriving the synchronized control law.",
              "translation": "为了消除相位失配，论文提出将执行机构控制量引入对称滤波通道 $\\boldsymbol{\\omega}_f$，推导出时序同步控制律。",
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "actuator",
                  "ipa": "/ˈæktʃueɪtə/",
                  "meaning": "执行机构，执行器（电机/舵机）",
                  "level": "red"
                },
                {
                  "word": "synchronized",
                  "ipa": "/ˈsɪŋkrənaɪzd/",
                  "meaning": "时序同步的，通道对齐的",
                  "level": "green"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P2-S2",
              "text": "This structure mathematically preserves phase margin at crossover frequency, completely eradicating uncompensated oscillations.",
              "translation": "该结构在数学上保证了开环传递函数在穿越频率处的相位裕度，彻底根除了未补偿 INDI 的极限环高频抖振。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": []
            }
          ]
        }
      ],
      "questions": [
        {
          "qIndex": 3,
          "type": "推断题",
          "tangchiModel": "频域与时序同步分析",
          "stem": "Why does an uncompensated INDI controller cause limit-cycle oscillation on real MAV hardware?",
          "stemKeywords": [
            "limit-cycle oscillation",
            "phase lag",
            "Butterworth filter",
            "uncompensated INDI"
          ],
          "targetSentences": [
            "P1-S2"
          ],
          "options": [
            {
              "key": "A",
              "text": "Because the low-pass filter H(z) introduces phase lag, causing the measured angular acceleration to lag behind current actuator commands.",
              "isCorrect": true,
              "distractorType": "正确项 · 机理解析",
              "analysis": "对应 P1-S2：低通滤波器去噪的同时引入了相位滞后，传感器测量值反映的是历史过去的电机状态，若与当前拍指令直接相减会引发高频自激振荡。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "B",
              "text": "Because the battery voltage is too high for the electronic speed controllers.",
              "isCorrect": false,
              "distractorType": "无中生有",
              "analysis": "电池电压不是滤波延迟振荡的机理根源。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "C",
              "text": "Because the quadrotor inertia matrix J is assumed to be zero.",
              "isCorrect": false,
              "distractorType": "荒谬项",
              "analysis": "转动惯量 J 是非零正定矩阵。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "D",
              "text": "Because INDI ignores propeller rotation direction.",
              "isCorrect": false,
              "distractorType": "偷换概念",
              "analysis": "旋翼旋转方向已包含在控制矩阵符号中。",
              "refSentences": [
                "P1-S2"
              ]
            }
          ],
          "officialAnswer": "A",
          "presetReflection": {
            "trapAnalysis": "控制理论中的经典法则：传感器端加了多大的滤波滞后，指令通道就必须对称补偿同等时序。",
            "methodSummary": "对称时钟对齐（Symmetric Filter Compensation）是工程上解决滤波相位滞后的标杆技巧。"
          }
        }
      ]
    },
    {
      "id": "text4",
      "number": 4,
      "title": "IV. Adaptive Online Parameter Estimation (A-INDI)",
      "chineseTitle": "第4章：自适应参数在线辨识算法 (A-INDI)",
      "topic": "自适应辨识 / 归一化最小均方误差 (NLMS)",
      "overview": "引入基于归一化最小均方误差（NLMS）的在线自适应辨识律，实时估计时变控制效能矩阵 G1，免除人工离线建模，适应电池降压与挂载突变。",
      "figure": {
        "image": "题库/毕设/images/paper2_fig18_19_adaptation_curves.png",
        "caption": "Fig. 18 & 19: 自适应 A-INDI 算法在飞行中实时追踪控制效能参数 G1 变化的收敛曲线 (AIAA JGCD 2016)",
        "alt": "Fig. 18-19: Parameter adaptation curves"
      },
      "paragraphs": [
        {
          "pIndex": 1,
          "logicRole": "算法推导 · NLMS 在线自适应递推公式",
          "mainIdea": "根据角加速度预测误差，以极小的计算开销实时修正控制效能估计矩阵 G1。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "To eliminate the need for manual offline calibration, an online Normalized Least-Mean-Squares (NLMS) algorithm is implemented.",
              "translation": "为了使控制器彻底摆脱对离线人工参数测定的依赖，论文引入了基于**归一化最小均方误差（NLMS）**的在线自适应辨识算法。",
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
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
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "The control effectiveness estimate G_1 is updated per step based on prediction error e(k) = \\dot{\\Omega}_f(k) - \\dot{\\Omega}_{f,pred}(k).",
              "translation": "控制效能矩阵 $\\hat{\\boldsymbol{G}}_1$ 在每个控制周期根据滤波角加速度预测误差 $\\boldsymbol{e}(k) = \\dot{\\boldsymbol{\\Omega}}_f(k) - \\dot{\\boldsymbol{\\Omega}}_{f,\\text{pred}}(k)$ 进行在线递推更新。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能（如控制效能矩阵 G）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 3,
              "id": "P1-S3",
              "text": "Because NLMS involves only simple vector dot products, it runs effortlessly at 512 Hz on low-cost onboard microcontrollers.",
              "translation": "由于 NLMS 仅涉及简单的向量点乘与除法运算，它可以在低成本机载单片机上以 512 Hz 实时无延迟运行。",
              "isTopicSentence": false,
              "isKeyEvidence": false,
              "vocab": []
            }
          ]
        }
      ],
      "questions": [
        {
          "qIndex": 4,
          "type": "算法特性",
          "tangchiModel": "机载算法算力开销剖析",
          "stem": "What is the primary advantage of choosing NLMS over complex recursive least squares for onboard MAV parameter adaptation?",
          "stemKeywords": [
            "NLMS",
            "onboard microcontrollers",
            "vector dot products",
            "512 Hz"
          ],
          "targetSentences": [
            "P1-S3"
          ],
          "options": [
            {
              "key": "A",
              "text": "It requires only simple vector operations, running effortlessly at 512 Hz with minimal computational burden.",
              "isCorrect": true,
              "distractorType": "正确项 · 同义提炼",
              "analysis": "对应 P1-S3：NLMS 避免了高阶矩阵求逆，计算量仅几条点乘，极度适合资源受限的微型飞控单片机。",
              "refSentences": [
                "P1-S3"
              ]
            },
            {
              "key": "B",
              "text": "It guarantees zero tracking error even under total sensor blackout.",
              "isCorrect": false,
              "distractorType": "过度推理",
              "analysis": "传感器断电时任何自适应算法均无法工作。",
              "refSentences": [
                "P1-S3"
              ]
            },
            {
              "key": "C",
              "text": "It transforms the nonlinear Euler equations into linear time-invariant forms.",
              "isCorrect": false,
              "distractorType": "概念混淆",
              "analysis": "NLMS 是参数估计器，不改变被控对象的非线性物理本质。",
              "refSentences": [
                "P1-S1"
              ]
            },
            {
              "key": "D",
              "text": "It eliminates the need for gyro differentiation entirely.",
              "isCorrect": false,
              "distractorType": "无中生有",
              "analysis": "预测误差仍然需要与陀螺仪差分加速度做对比更新。",
              "refSentences": [
                "P1-S2"
              ]
            }
          ],
          "officialAnswer": "A",
          "presetReflection": {
            "trapAnalysis": "自适应算法的工程选型关键看算力性价比：NLMS（复杂度 O(N)）vs RLS（复杂度 O(N^2)）。",
            "methodSummary": "微型嵌入式飞控（512 Hz）首选极简稳定的 NLMS 归一化自适应律。"
          }
        }
      ]
    },
    {
      "id": "text5",
      "number": 5,
      "title": "V. Real Flight Experiments: Step Disturbance & Bumpers Adaptation",
      "chineseTitle": "第5章：实机飞行实验 · 突加负载抗扰与防撞圈拆装自适应",
      "topic": "飞行实验 / 阶跃卸载抗扰与转子动量补偿",
      "overview": "在开源 Paparazzi 飞控的 Parrot Bebop 四旋翼上进行 50g 突加挂载阶跃释放、机身防撞圈拆装参数自适应收敛，以及计入转子自旋动量力矩的偏航性能大幅提升验证。",
      "figure": {
        "image": "题库/毕设/images/paper2_fig8_9_step_response.png",
        "caption": "Fig. 8 & 9: 50g 突加重物瞬间断线释放时的俯仰角阶跃扰动响应曲线对比（A-INDI 恢复时间比经典 PID 快 5 倍） (AIAA JGCD 2016)",
        "alt": "Fig. 8-9: Step disturbance response"
      },
      "paragraphs": [
        {
          "pIndex": 1,
          "logicRole": "实验对比 · 突加 50g 负载断线阶跃扰动抑制",
          "mainIdea": "在空中突然释放 50g 负载时，A-INDI 恢复时间仅 0.3 秒，抗扰恢复速度比经典 PID 快 5 倍。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "In a step disturbance test where a 50g attached weight was suddenly dropped during hover, classical PID exhibited a 15-degree pitch jump taking 1.5 s to recover.",
              "translation": "在阶跃扰动试验中，悬停时通过细线悬挂的 50g 额外重物在空中被突然释放（相当于瞬间阶跃卸载），经典 PID 出现了高达 15° 的俯仰角剧烈突跳，耗时 **1.5 秒** 才恢复平衡。",
              "isTopicSentence": true,
              "isKeyEvidence": true,
              "vocab": [
                {
                  "word": "disturbance",
                  "ipa": "/dɪˈstɜːbəns/",
                  "meaning": "外部扰动，突加负载",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "In contrast, A-INDI limited the attitude deviation to under 4 degrees and stabilized within 0.3 s (5 times faster than PID).",
              "translation": "相比之下，A-INDI 将姿态波动峰值限制在 **4° 以内**，仅耗时 **0.3 秒** 即完全重置回水平（**抗扰恢复速度比 PID 快 5 倍**）。",
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
          "logicRole": "实验对比 · 防撞圈自适应收敛与偏航角动量补偿",
          "mainIdea": "加装防撞保护圈后参数在 2~3 秒内自适应收敛；显式补偿转子惯量力矩使偏航上升时间缩短 40%。",
          "sentences": [
            {
              "sIndex": 1,
              "id": "P1-S1",
              "text": "When mounting or removing propeller protective bumpers in flight, the online adaptation converged to true control effectiveness within 2 to 3 seconds.",
              "translation": "在飞行过程中为机身加装或拆卸螺旋桨防撞保护圈时，在线自适应算法在 **2 到 3 秒内** 迅速从初始默认值收敛至真实物理效能值。",
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
                  "word": "effectiveness",
                  "ipa": "/ɪˈfektɪvnəs/",
                  "meaning": "效能（如控制效能矩阵 G）",
                  "level": "red"
                }
              ]
            },
            {
              "sIndex": 2,
              "id": "P1-S2",
              "text": "Furthermore, accounting for rotor angular momentum I_r \\dot{\\omega} shortened yaw doublet rise time by 40%, overcoming traditional sluggish quadrotor yaw response.",
              "translation": "此外，显式计入并补偿转子自旋角动量力矩 $\\boldsymbol{I}_r \\dot{\\boldsymbol{\\omega}}$ 使偏航 Doublet 指令的跟踪上升时间缩短了 **40%**，彻底解决了四旋翼偏航响应迟缓的固有缺陷。",
              "isTopicSentence": false,
              "isKeyEvidence": true,
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
                  "meaning": "旋翼，螺旋桨",
                  "level": "green"
                },
                {
                  "word": "angular",
                  "ipa": "/ˈæŋɡjələ/",
                  "meaning": "角的，旋转的",
                  "level": "green"
                },
                {
                  "word": "doublet",
                  "ipa": "/ˈdʌblɪt/",
                  "meaning": "方波双向激励响应",
                  "level": "green"
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
      ],
      "questions": [
        {
          "qIndex": 5,
          "type": "实验数据",
          "tangchiModel": "抗扰能力定量评估",
          "stem": "How much faster did A-INDI recover from the 50g sudden payload drop compared to classical PID?",
          "stemKeywords": [
            "50g payload drop",
            "recover faster",
            "0.3s vs 1.5s",
            "5 times faster"
          ],
          "targetSentences": [
            "P1-S1",
            "P1-S2"
          ],
          "options": [
            {
              "key": "A",
              "text": "2 times faster.",
              "isCorrect": false,
              "distractorType": "数值偏差",
              "analysis": "数值错误，文中实测为 0.3s vs 1.5s（5倍）。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "B",
              "text": "5 times faster (0.3 s vs 1.5 s).",
              "isCorrect": true,
              "distractorType": "正确项 · 数据精准匹配",
              "analysis": "对应 P1-S1 与 P1-S2：PID 耗时 1.5s 且超调 15°，A-INDI 耗时 0.3s 且超调 <4°，抗扰恢复速度快 5 倍。",
              "refSentences": [
                "P1-S1",
                "P1-S2"
              ]
            },
            {
              "key": "C",
              "text": "10 times faster.",
              "isCorrect": false,
              "distractorType": "数值夸大",
              "analysis": "夸大实验数据。",
              "refSentences": [
                "P1-S2"
              ]
            },
            {
              "key": "D",
              "text": "Both controllers had identical recovery times.",
              "isCorrect": false,
              "distractorType": "事实相反",
              "analysis": "两者表现具有决定性差异。",
              "refSentences": [
                "P1-S1",
                "P1-S2"
              ]
            }
          ],
          "officialAnswer": "B",
          "presetReflection": {
            "trapAnalysis": "精准提取实验数据对比：PID（15° / 1.5s）vs A-INDI（4° / 0.3s）。",
            "methodSummary": "INDI 针对突发外力扰动具有单拍增量抵消特性，因此阶跃抗扰性能极度优越。"
          }
        }
      ]
    }
  ]
};
