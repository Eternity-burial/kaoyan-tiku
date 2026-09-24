/**
 * 思维导图沙箱默认测试数据
 * 纯文本多层级树结构，专为测试以下交互场景设计：
 * 1. 同级节点重新排序（如将“第一节”拖动至“第三节”后）
 * 2. 父子关系跨层级/跨分支迁移（如将“极值判定”拖入“不定积分”）
 * 3. 带子树整体拖动（如拖动“导数与微分”及其全部 4 个子节点）
 * 4. 视口边缘漫游与缩放
 */
window.defaultMindMapData = {
  data: {
    text: "高等数学知识架构（测试导图）",
    expand: true
  },
  children: [
    {
      data: {
        text: "第一章 函数、极限与连续",
        expand: true
      },
      children: [
        {
          data: {
            text: "函数的奇偶性与周期性"
          },
          children: []
        },
        {
          data: {
            text: "极限的存在准则与夹逼定理"
          },
          children: [
            {
              data: {
                text: "单调有界准则"
              },
              children: []
            },
            {
              data: {
                text: "柯西审敛原理"
              },
              children: []
            }
          ]
        },
        {
          data: {
            text: "无穷小量阶的比较与等价代换"
          },
          children: []
        },
        {
          data: {
            text: "连续性与间断点分类"
          },
          children: [
            {
              data: {
                text: "第一类间断点（可去/跳跃）"
              },
              children: []
            },
            {
              data: {
                text: "第二类间断点（无穷/振荡）"
              },
              children: []
            }
          ]
        }
      ]
    },
    {
      data: {
        text: "第二章 一元函数微分学",
        expand: true
      },
      children: [
        {
          data: {
            text: "导数与微分的基本概念"
          },
          children: [
            {
              data: {
                text: "几何意义与切线法线"
              },
              children: []
            },
            {
              data: {
                text: "可导与连续的关系"
              },
              children: []
            }
          ]
        },
        {
          data: {
            text: "高阶导数求解技巧"
          },
          children: [
            {
              data: {
                text: "莱布尼茨公式"
              },
              children: []
            }
          ]
        },
        {
          data: {
            text: "微分中值定理体系"
          },
          children: [
            {
              data: {
                text: "罗尔定理"
              },
              children: []
            },
            {
              data: {
                text: "拉格朗日中值定理"
              },
              children: []
            },
            {
              data: {
                text: "柯西中值定理"
              },
              children: []
            },
            {
              data: {
                text: "泰勒展开式"
              },
              children: []
            }
          ]
        },
        {
          data: {
            text: "导数应用与极值最值"
          },
          children: []
        }
      ]
    },
    {
      data: {
        text: "第三章 一元函数积分学",
        expand: true
      },
      children: [
        {
          data: {
            text: "不定积分基本方法"
          },
          children: [
            {
              data: {
                text: "第一类换元法（凑微分）"
              },
              children: []
            },
            {
              data: {
                text: "第二类换元法（三角代换）"
              },
              children: []
            },
            {
              data: {
                text: "分部积分法"
              },
              children: []
            }
          ]
        },
        {
          data: {
            text: "定积分性质与变上限积分"
          },
          children: []
        },
        {
          data: {
            text: "反常积分敛散性判定"
          },
          children: []
        }
      ]
    }
  ]
};
