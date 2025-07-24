// 上下文工程管理文件模板系统
import { formatTimestamp } from '../utils/path-utils.js';

/**
 * 生成上下文工程管理文件模板
 */
export function getContextEngineeringTemplates(): Record<string, string> {
  const timestamp = formatTimestamp();

  return {
    "productContext.md": `# 产品上下文

本文件提供项目的高层概览以及预期创建的产品信息。最初基于 projectBrief.md（如果提供）和工作目录中所有其他可用的项目相关信息。本文件旨在随着项目发展而更新，并应用于指导项目的所有其他方面的目标和上下文。
${timestamp} - 更新日志将作为脚注附加到文件末尾。

*

## 项目目标

*   

## 关键功能

*   

## 整体架构

*   `,

    "activeContext.md": `# 活跃上下文

本文件跟踪项目的当前状态，包括最近的变更、当前目标和待解决的问题。
${timestamp} - 更新日志。

*

## 当前关注点

*   

## 最近变更

*   

## 待解决问题/议题

*   `,

    "progress.md": `# 进度

本文件使用任务列表格式跟踪项目的进度。
${timestamp} - 更新日志。

*

## 已完成任务

*   

## 当前任务

*   

## 下一步计划

*   `,

    "decisionLog.md": `# 决策日志

本文件使用列表格式记录架构和实现决策。
${timestamp} - 更新日志。

*

## 决策

*

## 理由 

*

## 实现细节

*   `,

    "systemPatterns.md": `# 系统模式 *可选*

本文件记录项目中使用的重复模式和标准。
虽然是可选的，但建议随着项目发展而更新。
${timestamp} - 更新日志。

*

## 编码模式

*   

## 架构模式

*   

## 测试模式

*   `,
  };
}

/**
 * 获取详细的上下文工程管理文件指导
 */
export function getDetailedFileGuide(): Record<string, any> {
  return {
    "productContext.md": {
      role: "项目概览和产品定义的核心文件",
      purpose:
        "定义项目目标、核心功能和整体架构，为所有开发活动提供战略指导",
      updateTriggers: [
        "架构变更",
        "新功能添加",
        "产品目标调整",
        "核心业务逻辑变更",
      ],
      updateStrategy:
        "保持高层次视角，专注于长期目标和核心价值",
      sections: {
        "项目目标":
          "核心项目目标和价值提案，在主要目标调整时更新",
        "关键功能":
          "核心产品功能列表，在新功能完成时添加相应描述",
        "整体架构":
          "系统架构的高层次描述，在架构变更时必须同步更新",
      },
      priority: 1,
    },
    "activeContext.md": {
      role: "当前项目状态和实时信息的跟踪文件",
      purpose:
        "记录当前工作重点、最近变更和待解决问题，保持项目状态的实时可见性",
      updateTriggers: [
        "任何代码变更",
        "新任务开始",
        "问题发现",
        "状态转换",
      ],
      updateStrategy:
        "频繁更新，保持信息的新鲜度，定期清理过时内容",
      sections: {
        "当前关注点":
          "当前主要工作重点，在任务切换时必须更新",
        "最近变更":
          "最近的变更记录，所有变更都需要在此记录",
        "待解决问题/议题":
          "待解决的问题和疑问，发现问题时立即添加",
      },
      priority: 2,
    },
    "progress.md": {
      role: "任务进度管理和完成状态跟踪文件",
      purpose:
        "管理任务生命周期，跟踪从规划到完成的完整过程",
      updateTriggers: [
        "任务创建",
        "任务完成",
        "任务状态变更",
        "里程碑达成",
      ],
      updateStrategy:
        "保持时间顺序，定期将已完成任务移动到已完成区域",
      sections: {
        "已完成任务":
          "已完成任务列表，任务完成时立即移动到此部分",
        "当前任务":
          "正在进行的任务，任务开始时添加，完成时删除",
        "下一步计划": "计划中的后续任务，在规划时添加",
      },
      priority: 3,
    },
    "decisionLog.md": {
      role: "重要决策和技术选择的记录文件",
      purpose:
        "记录关键决策的过程、原因和影响，为未来参考提供依据",
      updateTriggers: [
        "架构决策",
        "技术选型",
        "重要业务逻辑决策",
        "设计模式选择",
      ],
      updateStrategy:
        "详细记录决策背景、考虑因素和最终选择，方便未来回顾",
      sections: {
        决策: "具体决策内容",
        理由: "决策的原因和考虑因素",
        "实现细节":
          "决策的具体实现细节",
      },
      priority: 4,
    },
    "systemPatterns.md": {
      role: "项目中使用的模式和标准的文档文件",
      purpose:
        "记录重复使用的代码模式、架构模式和测试模式，促进一致性",
      updateTriggers: [
        "新模式发现",
        "标准变更",
        "最佳实践总结",
      ],
      updateStrategy:
        "总结和抽象常用模式，定期整理和更新",
      sections: {
        "编码模式": "代码层面的常用模式",
        "架构模式": "架构层面的设计模式",
        "测试模式": "测试相关的模式和标准",
      },
      priority: 5,
    },
  };
}