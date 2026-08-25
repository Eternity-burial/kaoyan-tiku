# -*- coding: utf-8 -*-
"""
Builder for Full Literature Reader (文献阅读器) for 毕设 subject
Outputs:
- 题库/毕设/data_paper1.js
- 题库/毕设/data_paper2.js
- 题库/毕设/data_paper3.js
- 题库/毕设/master_vocab_cache.json
"""

import json
import os
import re

# Comprehensive academic & engineering vocabulary dictionary with IPA and domain-specific definitions
VOCAB_DB = {
    # Control & Math Core
    "nonlinear": {"ipa": "/ˌnɒnˈlɪniər/", "meaning": "非线性的（输出与输入不成正比）", "level": "red"},
    "differential-flatness": {"ipa": "/ˌdɪfəˈrenʃl ˈflætnəs/", "meaning": "微分平坦性（状态与输入可由输出及其导数代数表示）", "level": "red"},
    "differential flatness": {"ipa": "/ˌdɪfəˈrenʃl ˈflætnəs/", "meaning": "微分平坦性", "level": "red"},
    "flatness": {"ipa": "/ˈflætnəs/", "meaning": "平坦性", "level": "green"},
    "differential": {"ipa": "/ˌdɪfəˈrenʃl/", "meaning": "微分的，差分的", "level": "green"},
    "predictive": {"ipa": "/prɪˈdɪktɪv/", "meaning": "预测的（如模型预测控制 MPC）", "level": "red"},
    "model predictive control": {"ipa": "/ˈmɒdl prɪˈdɪktɪv kənˈtrəʊl/", "meaning": "模型预测控制 (MPC)", "level": "blue"},
    "incremental": {"ipa": "/ˌɪŋkrəˈmentl/", "meaning": "增量的（基于传感器逐拍差分）", "level": "red"},
    "dynamic inversion": {"ipa": "/daɪˈnæmɪk ɪnˈvɜːʃn/", "meaning": "动态逆（非线性系统逆解解耦）", "level": "red"},
    "inversion": {"ipa": "/ɪnˈvɜːʃn/", "meaning": "求逆，动态逆", "level": "red"},
    "adaptive": {"ipa": "/əˈdæptɪv/", "meaning": "自适应的（参数在线估计与自调谐）", "level": "red"},
    "linearization": {"ipa": "/ˌlɪniəraɪˈzeɪʃn/", "meaning": "线性化", "level": "green"},
    "feedback linearization": {"ipa": "/ˈfiːdbæk ˌlɪniəraɪˈzeɪʃn/", "meaning": "反馈线性化 (FBL)", "level": "blue"},
    "quaternion": {"ipa": "/kwəˈtɜːniən/", "meaning": "四元数（无奇异性姿态表示法）", "level": "red"},
    "quaternions": {"ipa": "/kwəˈtɜːniənz/", "meaning": "四元数", "level": "red"},
    "euler": {"ipa": "/ˈɔɪlər/", "meaning": "欧拉（如欧拉方程、欧拉角）", "level": "green"},
    "kinematics": {"ipa": "/ˌkɪnəˈmætɪks/", "meaning": "运动学（纯几何与速度描述）", "level": "red"},
    "dynamics": {"ipa": "/daɪˈnæmɪks/", "meaning": "动力学（受力与运动响应）", "level": "red"},
    "dynamic": {"ipa": "/daɪˈnæmɪk/", "meaning": "动态的，动力学的", "level": "green"},
    "jacobian": {"ipa": "/dʒəˈkəʊbiən/", "meaning": "雅可比矩阵", "level": "green"},
    "pseudoinverse": {"ipa": "/ˌsjuːdəʊɪnˈvɜːs/", "meaning": "伪逆矩阵（Moore-Penrose 逆）", "level": "red"},
    "so(3)": {"ipa": "/es əʊ θriː/", "meaning": "三维旋转李群 SO(3)", "level": "blue"},
    "lie group": {"ipa": "/liː ɡruːp/", "meaning": "李群", "level": "blue"},
    "gimbal lock": {"ipa": "/ˈɡɪmbl lɒk/", "meaning": "万向节死锁（欧拉角俯仰 90 度奇异性）", "level": "red"},
    "singularity": {"ipa": "/ˌsɪŋɡjəˈlærəti/", "meaning": "奇异性，奇异点", "level": "red"},
    "optimization": {"ipa": "/ˌɒptɪmaɪˈzeɪʃn/", "meaning": "优化求解", "level": "green"},
    "quadratic programming": {"ipa": "/kwɒˈdrætɪk ˈprəʊɡræmɪŋ/", "meaning": "二次规划 (QP)", "level": "blue"},
    "sequential quadratic programming": {"ipa": "/sɪˈkwenʃl kwɒˈdrætɪk ˈprəʊɡræmɪŋ/", "meaning": "序列二次规划 (SQP)", "level": "blue"},
    "horizon": {"ipa": "/həˈraɪzn/", "meaning": "时域，预测时域 (Horizon)", "level": "green"},
    "discretized": {"ipa": "/ˈdɪskriːtaɪzd/", "meaning": "离散化的", "level": "green"},
    "discretization": {"ipa": "/dɪˌskriːtaɪˈzeɪʃn/", "meaning": "离散化", "level": "green"},
    "taylor expansion": {"ipa": "/ˈteɪlə ɪkˈspænʃn/", "meaning": "泰勒展开", "level": "blue"},
    "taylor": {"ipa": "/ˈteɪlə/", "meaning": "泰勒（级数展开）", "level": "green"},
    "bandwidth": {"ipa": "/ˈbændwɪdθ/", "meaning": "控制带宽，频宽", "level": "green"},
    "crossover": {"ipa": "/ˈkrɒsəʊvə/", "meaning": "穿越频率，截止点", "level": "green"},
    "phase lag": {"ipa": "/feɪz læɡ/", "meaning": "相位滞后", "level": "red"},
    "phase margin": {"ipa": "/feɪz ˈmɑːdʒɪn/", "meaning": "相位裕度", "level": "green"},
    "butterworth": {"ipa": "/ˈbʌtəwɜːθ/", "meaning": "巴特沃斯（低通滤波器）", "level": "green"},
    "low-pass filter": {"ipa": "/ləʊ pɑːs ˈfɪltə/", "meaning": "低通滤波器", "level": "blue"},
    "filter": {"ipa": "/ˈfɪltə/", "meaning": "滤波器，滤波", "level": "green"},
    "filtering": {"ipa": "/ˈfɪltərɪŋ/", "meaning": "滤波", "level": "green"},
    "convergence": {"ipa": "/kənˈvɜːdʒəns/", "meaning": "收敛性", "level": "red"},
    "converge": {"ipa": "/kənˈvɜːdʒ/", "meaning": "收敛，趋近", "level": "green"},
    "divergence": {"ipa": "/daɪˈvɜːdʒəns/", "meaning": "发散，失稳", "level": "red"},
    "limit-cycle": {"ipa": "/ˈlɪmɪt saɪkl/", "meaning": "极限环（自激非线性振荡）", "level": "red"},
    "oscillation": {"ipa": "/ˌɒsɪˈleɪʃn/", "meaning": "振荡，抖振", "level": "red"},
    "oscillations": {"ipa": "/ˌɒsɪˈleɪʃnz/", "meaning": "振荡", "level": "red"},
    "saturation": {"ipa": "/ˌsætʃəˈreɪʃn/", "meaning": "饱和（如推力达到硬件极限）", "level": "red"},
    "actuator": {"ipa": "/ˈæktʃueɪtə/", "meaning": "执行机构，执行器（电机/电调/舵机）", "level": "red"},
    "actuators": {"ipa": "/ˈæktʃueɪtəz/", "meaning": "执行器", "level": "red"},
    "constraints": {"ipa": "/kənˈstreɪnts/", "meaning": "约束条件（硬约束/软约束）", "level": "red"},
    "constraint": {"ipa": "/kənˈstreɪnt/", "meaning": "约束", "level": "red"},
    "constrained": {"ipa": "/kənˈstreɪnd/", "meaning": "受约束的", "level": "red"},
    "allocator": {"ipa": "/ˈæləkeɪtə/", "meaning": "控制分配器", "level": "red"},
    "allocation": {"ipa": "/ˌæləˈkeɪʃn/", "meaning": "控制分配", "level": "red"},
    "decoupling": {"ipa": "/diːˈkʌplɪŋ/", "meaning": "解耦", "level": "red"},
    "decouple": {"ipa": "/diːˈkʌpl/", "meaning": "解耦，分离", "level": "green"},
    "inner-loop": {"ipa": "/ˈɪnə luːp/", "meaning": "内环（高频角速度/角加速度环）", "level": "red"},
    "outer-loop": {"ipa": "/ˈaʊtə luːp/", "meaning": "外环（位置/轨迹环）", "level": "red"},
    "cascaded": {"ipa": "/kæˈskeɪdɪd/", "meaning": "级联的，串级的", "level": "green"},
    "feedforward": {"ipa": "/ˈfiːdfɔːwəd/", "meaning": "前馈控制", "level": "red"},
    "feedback": {"ipa": "/ˈfiːdbæk/", "meaning": "反馈控制", "level": "green"},
    "virtual": {"ipa": "/ˈvɜːtʃuəl/", "meaning": "虚拟的（如虚拟控制输入量 nu）", "level": "red"},
    "synchronized": {"ipa": "/ˈsɪŋkrənaɪzd/", "meaning": "时序同步的，对齐的", "level": "green"},
    "effectiveness": {"ipa": "/ɪˈfektɪvnəs/", "meaning": "效能（控制效能矩阵 G）", "level": "red"},
    "least-mean-squares": {"ipa": "/liːst miːn skweəz/", "meaning": "最小均方误差 (LMS/NLMS)", "level": "blue"},
    "normalized": {"ipa": "/ˈnɔːməlaɪzd/", "meaning": "归一化的", "level": "green"},
    "estimation": {"ipa": "/ˌestɪˈmeɪʃn/", "meaning": "估计，参数估计", "level": "green"},
    "identification": {"ipa": "/aɪˌdentɪfɪˈkeɪʃn/", "meaning": "辨识，参数辨识", "level": "red"},
    "identified": {"ipa": "/aɪˈdentɪfaɪd/", "meaning": "辨识出的", "level": "green"},
    "fault-tolerant": {"ipa": "/fɔːlt ˈtɒlərənt/", "meaning": "容错的（执行器失效重构）", "level": "red"},
    "robustness": {"ipa": "/rəʊˈbʌstnəs/", "meaning": "鲁棒性，抗扰稳健性", "level": "red"},
    "robust": {"ipa": "/rəʊˈbʌst/", "meaning": "鲁棒的，稳健的", "level": "green"},

    # UAV & Robotics Domain
    "quadrotor": {"ipa": "/ˈkwɒdrəʊtə/", "meaning": "四旋翼无人机", "level": "red"},
    "quadcopter": {"ipa": "/ˈkwɒdkɒptə/", "meaning": "四轴飞行器", "level": "red"},
    "agile": {"ipa": "/ˈædʒaɪl/", "meaning": "敏捷的，高机动的", "level": "red"},
    "flight": {"ipa": "/flaɪt/", "meaning": "飞行", "level": "green"},
    "trajectory": {"ipa": "/trəˈdʒektəri/", "meaning": "轨迹，航迹", "level": "red"},
    "trajectories": {"ipa": "/trəˈdʒektəriz/", "meaning": "轨迹（复数）", "level": "red"},
    "tracking": {"ipa": "/ˈtrækɪŋ/", "meaning": "跟踪，追踪", "level": "green"},
    "maneuver": {"ipa": "/məˈnuːvə/", "meaning": "机动动作，特技飞行", "level": "red"},
    "maneuvers": {"ipa": "/məˈnuːvəz/", "meaning": "机动动作", "level": "red"},
    "aerodynamic": {"ipa": "/ˌeərəʊdaɪˈnæmɪk/", "meaning": "空气动力学的，气动的", "level": "red"},
    "drag": {"ipa": "/dræɡ/", "meaning": "阻力（空气阻力/流体阻力）", "level": "red"},
    "fuselage": {"ipa": "/ˈfjuːzəlɑːʒ/", "meaning": "机身，机体", "level": "green"},
    "rotor": {"ipa": "/ˈrəʊtə/", "meaning": "转子，旋翼", "level": "green"},
    "rotors": {"ipa": "/ˈrəʊtəz/", "meaning": "转子，旋翼", "level": "green"},
    "propeller": {"ipa": "/prəˈpelə/", "meaning": "螺旋桨", "level": "green"},
    "propellers": {"ipa": "/prəˈpeləz/", "meaning": "螺旋桨", "level": "green"},
    "flapping": {"ipa": "/ˈflæpɪŋ/", "meaning": "桨叶挥舞运动", "level": "green"},
    "thrust": {"ipa": "/θrʌst/", "meaning": "推力，升力", "level": "red"},
    "torque": {"ipa": "/tɔːk/", "meaning": "力矩，转矩", "level": "red"},
    "torques": {"ipa": "/tɔːks/", "meaning": "力矩", "level": "red"},
    "angular momentum": {"ipa": "/ˈæŋɡjələ məˈmentəm/", "meaning": "角动量（旋转动量）", "level": "blue"},
    "momentum": {"ipa": "/məˈmentəm/", "meaning": "动量", "level": "green"},
    "gyroscopic": {"ipa": "/ˌdʒaɪrəˈskɒpɪk/", "meaning": "陀螺效应的，陀螺力矩的", "level": "green"},
    "gyro": {"ipa": "/ˈdʒaɪrəʊ/", "meaning": "陀螺仪", "level": "green"},
    "imu": {"ipa": "/ˌaɪ em ˈjuː/", "meaning": "惯性测量单元 (IMU)", "level": "blue"},
    "attitude": {"ipa": "/ˈætɪtjuːd/", "meaning": "姿态（横滚、俯仰、偏航）", "level": "red"},
    "heading": {"ipa": "/ˈhedɪŋ/", "meaning": "航向角，偏航角", "level": "red"},
    "yaw": {"ipa": "/jɔː/", "meaning": "偏航角 (Yaw, z轴旋转)", "level": "red"},
    "pitch": {"ipa": "/pɪtʃ/", "meaning": "俯仰角 (Pitch, y轴旋转)", "level": "red"},
    "roll": {"ipa": "/rəʊl/", "meaning": "横滚角 (Roll, x轴旋转)", "level": "red"},
    "jerk": {"ipa": "/dʒɜːk/", "meaning": "加加速度（加速度导数，轨迹三阶导）", "level": "green"},
    "snap": {"ipa": "/snæp/", "meaning": "加加加速度（轨迹四阶导数）", "level": "green"},
    "centrifugal": {"ipa": "/senˈtrɪfjʊɡl/", "meaning": "离心的", "level": "green"},
    "centripetal": {"ipa": "/senˈtrɪpɪtl/", "meaning": "向心的", "level": "green"},
    "washout": {"ipa": "/ˈwɒʃaʊt/", "meaning": "外滑，漂移外甩", "level": "green"},
    "infeasible": {"ipa": "/ɪnˈfiːzəbl/", "meaning": "不可行的（超出物理推力限制）", "level": "red"},
    "feasible": {"ipa": "/ˈfiːzəbl/", "meaning": "物理可行的", "level": "green"},
    "feasibility": {"ipa": "/ˌfiːzəˈbɪləti/", "meaning": "可行性", "level": "green"},
    "thrust-to-weight": {"ipa": "/θrʌst tuː weɪt/", "meaning": "推重比 (如 4.5:1)", "level": "blue"},
    "doublet": {"ipa": "/ˈdʌblɪt/", "meaning": "双向方波脉冲激励", "level": "green"},
    "bumpers": {"ipa": "/ˈbʌmpəz/", "meaning": "防撞保护圈", "level": "green"},
    "payload": {"ipa": "/ˈpeɪləʊd/", "meaning": "有效载荷，外挂重物", "level": "green"},

    # Underwater & Marine Domain
    "hydrobatic": {"ipa": "/ˌhaɪdrəʊˈbætɪk/", "meaning": "水下特技机动的（360度空间翻转）", "level": "red"},
    "hydrobatics": {"ipa": "/ˌhaɪdrəʊˈbætɪks/", "meaning": "水下特技机动", "level": "red"},
    "intervention": {"ipa": "/ˌɪntəˈvenʃn/", "meaning": "水下干预作业（机械臂装配）", "level": "red"},
    "underwater": {"ipa": "/ˌʌndəˈwɔːtə/", "meaning": "水下的", "level": "green"},
    "subsea": {"ipa": "/ˈsʌbsiː/", "meaning": "海底的，深海的", "level": "green"},
    "auv": {"ipa": "/ˌeɪ juː ˈviː/", "meaning": "自主水下航行器 (AUV)", "level": "blue"},
    "rov": {"ipa": "/ˌɑːr əʊ ˈviː/", "meaning": "遥控无人潜水器 (ROV)", "level": "blue"},
    "cuttlefish": {"ipa": "/ˈkʌtlfɪʃ/", "meaning": "墨鱼号（DFKI 双臂特技 AUV 名称）", "level": "blue"},
    "added mass": {"ipa": "/ˈædɪd mæs/", "meaning": "水动力附加质量（随体水体惯性）", "level": "red"},
    "damping": {"ipa": "/ˈdæmpɪŋ/", "meaning": "阻尼（线性与二次非线性水阻）", "level": "red"},
    "hydrodynamic": {"ipa": "/ˌhaɪdrəʊdaɪˈnæmɪk/", "meaning": "水动力学的，流体动力学的", "level": "red"},
    "hydrodynamics": {"ipa": "/ˌhaɪdrəʊdaɪˈnæmɪks/", "meaning": "水动力学", "level": "red"},
    "buoyancy": {"ipa": "/ˈbɔɪənsi/", "meaning": "浮力，静水力", "level": "green"},
    "restoring": {"ipa": "/rɪˈstɔːrɪŋ/", "meaning": "恢复力（重浮力平衡矩）", "level": "green"},
    "wrench": {"ipa": "/rentʃ/", "meaning": "广义力与力矩矢量 (Wrench)", "level": "red"},
    "thruster": {"ipa": "/ˈθrʌstə/", "meaning": "水下推进器", "level": "red"},
    "thrusters": {"ipa": "/ˈθrʌstəz/", "meaning": "推进器（复数）", "level": "red"},
    "station keeping": {"ipa": "/ˈsteɪʃn ˈkiːpɪŋ/", "meaning": "定点悬停，位置锁定", "level": "blue"},
    "drift": {"ipa": "/drɪft/", "meaning": "空间位置漂移量", "level": "red"},
    "pitch-up": {"ipa": "/pɪtʃ ʌp/", "meaning": "大角度仰头翻转机动（90度垂直）", "level": "blue"},
    "basin": {"ipa": "/ˈbeɪsn/", "meaning": "试验水池，水箱", "level": "green"},
    "surge": {"ipa": "/sɜːdʒ/", "meaning": "纵荡（前向线速度 u）", "level": "green"},
    "sway": {"ipa": "/sweɪ/", "meaning": "横荡（侧向线速度 v）", "level": "green"},
    "heave": {"ipa": "/hiːv/", "meaning": "垂荡（垂直线速度 w）", "level": "green"},
    "degrees-of-freedom": {"ipa": "/dɪˈɡriːz əv ˈfriːdəm/", "meaning": "自由度 (6-DOF)", "level": "blue"},
    "dof": {"ipa": "/diː əʊ ef/", "meaning": "自由度 (Degree of Freedom)", "level": "blue"},

    # Academic & Research Vocab
    "comparative": {"ipa": "/kəmˈpærətɪv/", "meaning": "对比的，比较的", "level": "green"},
    "empirical": {"ipa": "/ɪmˈpɪrɪkl/", "meaning": "经验性的，实证的", "level": "green"},
    "empirically": {"ipa": "/ɪmˈpɪrɪkli/", "meaning": "实证地，通过实验系统地", "level": "green"},
    "high-fidelity": {"ipa": "/haɪ fɪˈdeləti/", "meaning": "高保真的", "level": "green"},
    "simulation": {"ipa": "/ˌsɪmjuˈleɪʃn/", "meaning": "物理仿真，模拟", "level": "green"},
    "experiments": {"ipa": "/ɪkˈsperɪmənts/", "meaning": "实验", "level": "green"},
    "experimental": {"ipa": "/ɪkˌsperɪˈmentl/", "meaning": "实验的", "level": "green"},
    "accuracy": {"ipa": "/ˈækjərəsi/", "meaning": "精度，准确度", "level": "green"},
    "precision": {"ipa": "/prɪˈsɪʒn/", "meaning": "精密度，精度", "level": "green"},
    "rmse": {"ipa": "/ˌɑːr em es ˈiː/", "meaning": "均方根误差 (RMSE)", "level": "blue"},
    "root-mean-square": {"ipa": "/ruːt miːn skweə/", "meaning": "均方根 (RMS)", "level": "blue"},
    "benchmark": {"ipa": "/ˈbentʃmɑːk/", "meaning": "基准对比，同台测试", "level": "green"},
    "ablation": {"ipa": "/æbˈleɪʃn/", "meaning": "消融实验（逐项剔除对比）", "level": "red"},
    "trade-off": {"ipa": "/ˈtreɪd ɒf/", "meaning": "权衡，折中", "level": "green"},
    "trade-offs": {"ipa": "/ˈtreɪd ɒfs/", "meaning": "权衡", "level": "green"},
    "computational": {"ipa": "/ˌkɒmpjuˈteɪʃənl/", "meaning": "计算的，算力的", "level": "green"},
    "overhead": {"ipa": "/ˈəʊvəhed/", "meaning": "开销，计算负荷", "level": "green"},
    "latency": {"ipa": "/ˈleɪtənsi/", "meaning": "延迟，耗时", "level": "green"},
    "bottleneck": {"ipa": "/ˈbɒtlnek/", "meaning": "瓶颈，核心限制", "level": "green"},
    "state-of-the-art": {"ipa": "/steɪt əv ði ɑːt/", "meaning": "业界最顶尖的，前沿的", "level": "blue"},
    "framework": {"ipa": "/ˈfreɪmwɜːk/", "meaning": "控制框架，体系", "level": "green"},
    "frameworks": {"ipa": "/ˈfreɪmwɜːks/", "meaning": "框架（复数）", "level": "green"},
    "methodology": {"ipa": "/ˌmeθəˈdɒlədʒi/", "meaning": "方法论，方法设计", "level": "green"},
    "methodologies": {"ipa": "/ˌmeθəˈdɒlədʒiz/", "meaning": "方法", "level": "green"},
    "formulation": {"ipa": "/ˌfɔːmjuˈleɪʃn/", "meaning": "数学公式表达，命题构建", "level": "green"},
    "derive": {"ipa": "/dɪˈraɪv/", "meaning": "推导，推导出", "level": "green"},
    "derivation": {"ipa": "/ˌderɪˈveɪʃn/", "meaning": "数学推导过程", "level": "green"},
    "cornerstone": {"ipa": "/ˈkɔːnəstəʊn/", "meaning": "奠基石，核心支柱", "level": "blue"},
    "indispensable": {"ipa": "/ˌɪndɪˈspensəbl/", "meaning": "必不可少的，不可或缺的", "level": "green"},
    "cost-effective": {"ipa": "/kɒst ɪˈfektɪv/", "meaning": "高性价比的，低开销高效的", "level": "green"},
    "guidelines": {"ipa": "/ˈɡaɪdlaɪnz/", "meaning": "工程选型准则，指南", "level": "green"},
    "negligible": {"ipa": "/ˈneɡlɪdʒəbl/", "meaning": "微不足道的，可忽略的", "level": "green"},
    "crucial": {"ipa": "/ˈkruːʃl/", "meaning": "至关重要的", "level": "green"},
    "essential": {"ipa": "/ɪˈsenʃl/", "meaning": "必不可少的，基础的", "level": "green"},
    "proactively": {"ipa": "/prəʊˈæktɪvli/", "meaning": "前瞻性地，主动地", "level": "green"},
    "anticipate": {"ipa": "/ænˈtɪsɪpeɪt/", "meaning": "前瞻预判，预先感知", "level": "green"},
    "decelerate": {"ipa": "/diːˈseləreɪt/", "meaning": "减速", "level": "green"},
    "accelerate": {"ipa": "/əkˈseləreɪt/", "meaning": "加速", "level": "green"},
    "acceleration": {"ipa": "/əkˌseləˈreɪʃn/", "meaning": "加速度", "level": "green"},
    "velocity": {"ipa": "/vəˈlɒsəti/", "meaning": "速度（矢量）", "level": "green"},
    "coordinate": {"ipa": "/kəʊˈɔːdɪneɪt/", "meaning": "坐标系", "level": "green"},
    "coordinates": {"ipa": "/kəʊˈɔːdɪneɪts/", "meaning": "坐标", "level": "green"},
    "inertia": {"ipa": "/ɪˈnɜːʃə/", "meaning": "转动惯量，惯性", "level": "green"},
    "inertial": {"ipa": "/ɪˈnɜːʃl/", "meaning": "惯性的（如惯性坐标系 W）", "level": "green"},
    "matrix": {"ipa": "/ˈmeɪtrɪks/", "meaning": "矩阵", "level": "green"},
    "matrices": {"ipa": "/ˈmeɪtrɪsiːz/", "meaning": "矩阵（复数）", "level": "green"},
    "vector": {"ipa": "/ˈvektə/", "meaning": "矢量，向量", "level": "green"},
    "vectors": {"ipa": "/ˈvektəz/", "meaning": "矢量", "level": "green"},
    "diagonal": {"ipa": "/daɪˈæɡənl/", "meaning": "对角的（如对角阻力矩阵）", "level": "green"},
    "coriolis": {"ipa": "/ˌkɒriˈəʊlɪs/", "meaning": "科氏力，科里奥利力", "level": "red"},
    "centripetal": {"ipa": "/senˈtrɪpɪtl/", "meaning": "向心的", "level": "green"},
    "disturbance": {"ipa": "/dɪˈstɜːbəns/", "meaning": "外部扰动", "level": "red"},
    "disturbances": {"ipa": "/dɪˈstɜːbənsɪz/", "meaning": "扰动（复数）", "level": "red"},
    "rejection": {"ipa": "/rɪˈdʒekʃn/", "meaning": "抑制，抗扰能力", "level": "red"},
    "compensation": {"ipa": "/ˌkɒmpenˈseɪʃn/", "meaning": "补偿", "level": "red"},
    "compensate": {"ipa": "/ˈkɒmpenseɪt/", "meaning": "补偿，抵消", "level": "green"},
    "uncertainty": {"ipa": "/ʌnˈsɜːtnti/", "meaning": "不确定性，未建模误差", "level": "red"},
    "uncertainties": {"ipa": "/ʌnˈsɜːtntiz/", "meaning": "不确定性", "level": "red"},
    "time-varying": {"ipa": "/ˈtaɪm ˌveəriɪŋ/", "meaning": "时变的", "level": "red"},
    "regime": {"ipa": "/reɪˈʒiːm/", "meaning": "工况，流动区域（如湍流区）", "level": "green"},
    "transitional": {"ipa": "/trænˈzɪʃənl/", "meaning": "过渡的（层流向湍流过渡）", "level": "green"},
    "unmodeled": {"ipa": "/ʌnˈmɒdld/", "meaning": "未建模的（未建模力矩）", "level": "red"},
    "unmodelled": {"ipa": "/ʌnˈmɒdld/", "meaning": "未建模的", "level": "red"}
}

def annotate_words(text):
    words = re.findall(r'[A-Za-z\-]+', text)
    annotated = []
    seen = set()
    t_lower = text.lower()
    
    # Check multi-word keys first
    for k, v in VOCAB_DB.items():
        if ' ' in k and k in t_lower:
            if k not in seen:
                seen.add(k)
                annotated.append({"word": k, "ipa": v["ipa"], "meaning": v["meaning"], "level": v["level"]})
                
    for w in words:
        clean = w.lower().strip('-')
        if len(clean) <= 2 and clean not in ['mpc', 'imu', 'auv', 'mav', 'fbl', 'sqp']:
            continue
        if clean in ['the', 'and', 'for', 'are', 'was', 'were', 'with', 'from', 'that', 'this', 'these', 'those', 'such', 'into', 'both', 'each', 'all', 'its', 'can', 'may', 'has', 'have', 'had', 'not', 'but', 'out', 'per']:
            continue
        if clean in seen:
            continue
        if clean in VOCAB_DB:
            seen.add(clean)
            annotated.append({"word": clean, "ipa": VOCAB_DB[clean]["ipa"], "meaning": VOCAB_DB[clean]["meaning"], "level": VOCAB_DB[clean]["level"]})
        elif w in VOCAB_DB:
            seen.add(w)
            annotated.append({"word": w, "ipa": VOCAB_DB[w]["ipa"], "meaning": VOCAB_DB[w]["meaning"], "level": VOCAB_DB[w]["level"]})
    return annotated

print('Vocab DB size:', len(VOCAB_DB))
