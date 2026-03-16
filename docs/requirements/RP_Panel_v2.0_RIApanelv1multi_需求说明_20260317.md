# RP Panel v2.0（RIApanelv1multi）结果解读前端需求说明

- 文档版本：v1.0
- 文档日期：2026-03-17
- 适用工程：`bioinfo-view-fe`
- 关联流程：`RP Panel v2.0`
- 流程 code：`RIApanelv1multi`

## 1. 背景与目标

`RIApanelv1multi` 是在 RP Panel v1.0 结果基础上的批量化改造流程。目标是将“任务结果入口”由单样本直达改为“批次汇总先行、样本详情下钻”，并在不影响现有 v1.0/tNGS 页面逻辑的前提下，新增一套独立的 v2.0 结果解读能力。

核心目标：

1. 支持批量样本任务的结果汇总查看。
2. 支持从汇总页进入单样本详情。
3. 支持批次病原统计的表格 + 图表展示。
4. 支持中英文文件按系统语言自动切换。
5. 单样本结果详情“参考旧页面交互，但独立实现，避免与既有组件耦合”。

## 2. 强约束（必须满足）

1. 单样本结果详情页不得直接复用 `tasks/report/pathogen`、`tasks/report/pathogen-virus` 组件。
2. 允许参考原页面布局和交互，但需在 v2.0 专属模块中单独编写。
3. v2.0 专属字段映射、列处理、文件解析逻辑放在独立模块，避免对 v1.0/tNGS 产生回归风险。
4. 通用能力复用仅限“无业务语义”的基础能力（如通用表格壳、纯文件读取工具），禁止复用旧页面内业务判断逻辑。

## 3. 页面流程与信息架构

### 3.1 任务结果入口流程

1. 用户在任务列表点击结果。
2. 当任务流程为 `RIApanelv1multi` 时，先进入“结果汇总页”。
3. 在“样本列表”中点击“查看”后，进入对应样本详情页。

### 3.2 结果汇总页一级 Tab

结果汇总页包含 2 个一级 Tab：

1. 样本列表
2. 批次病原统计

## 4. 数据目录与文件规范

### 4.1 任务根目录示例

假定任务根目录：
`/data/bioinfo/task/1/149/20260306/RIApanelv1multi/4256`

目录示例：

- `D00002415` ~ `D00002424`：样本目录（目录名即样本号）
- `menu`：汇总页数据目录
- `samples.txt`、`tar.list`、日志文件等

### 4.2 汇总页核心数据文件

1. 样本汇总：`menu/merged_results.CN.txt`、`menu/merged_results.EN.txt`
2. 批次统计文件：`menu/analysis_*.txt`
3. 批次统计图：`menu/plots/*.png`

说明：`merged_results.xx.txt` 共 6 列（样本、是否NC、细菌、真菌、病毒、耐药基因），其中“是否NC”用于样本名标识。

## 5. 结果汇总页需求

### 5.1 Tab1：样本列表

#### 5.1.1 表格列定义

表格固定 5 列：

1. 样本名（来自 `merged_results` 第 1 列）
2. 检出细菌（第 3 列）
3. 检出真菌（第 4 列）
4. 检出病毒（第 5 列）
5. 详细信息（操作列）

#### 5.1.2 NC 标识规则

- `merged_results` 第 2 列为 NC 标志，值 `0/1`。
- 当值为 `1` 时，样本名展示为“样本号（NC）”。

#### 5.1.3 筛选规则

支持关键字过滤，作用于 4 列：

1. 样本名
2. 检出细菌
3. 检出真菌
4. 检出病毒

#### 5.1.4 操作按钮

操作列包含 3 个按钮：

1. 查看：跳转到该样本结果详情页
2. 配置报告：待定（占位）
3. 下载报告：待定（占位）

### 5.2 Tab2：批次病原统计（5 个子 Tab）

#### 5.2.1 子 Tab1：阳性样本检出统计

数据文件：

- `menu/analysis_positive_negative_stats.CN.txt`
- `menu/analysis_positive_negative_stats.EN.txt`

表格列：样本类型、阳性数量、阴性数量、总数、阳性率。

图片：

- `menu/plots/cn_positive_negative_bar.png`
- `menu/plots/cn_positive_negative_pie.png`

#### 5.2.2 子 Tab2：菌种检出统计

数据文件：

- `menu/analysis_pathogen_summary.CN.txt`
- `menu/analysis_pathogen_summary.EN.txt`

表格列：病原类型、种类数量、具体病原。

图片：

- `menu/plots/cn_pathogen_pie.png`
- `menu/plots/cn_pathogen_bar.png`

#### 5.2.3 子 Tab3：病原类型检出统计

数据文件：

- `menu/analysis_sample_pathogen_count.CN.add.txt`
- `menu/analysis_sample_pathogen_count.CN.txt`
- `menu/analysis_sample_pathogen_count.EN.add.txt`
- `menu/analysis_sample_pathogen_count.EN.txt`

展示规则：

1. 表格使用带 `.add.txt` 的文件。
2. 表头直接读取文件第一行。

图片：

- `menu/plots/cn_by_type_bar.png`

#### 5.2.4 子 Tab4：背景菌关联统计

数据文件：

- `menu/analysis_NC_overlap_stats.CN.add.txt`
- `menu/analysis_NC_overlap_stats.CN.txt`
- `menu/analysis_NC_overlap_stats.EN.add.txt`
- `menu/analysis_NC_overlap_stats.EN.txt`

展示规则：

1. 表格1：读取 `*.add.txt`。
2. 表格2：读取非 `add` 文件。
3. 两个表格表头均读取文件第一行。

#### 5.2.5 子 Tab5：样本间相似性统计

数据文件：

- `menu/analysis_sample_similarity.CN.add.txt`
- `menu/analysis_sample_similarity.CN.txt`
- `menu/analysis_sample_similarity.EN.add.txt`
- `menu/analysis_sample_similarity.EN.txt`

展示规则：

1. 表格1：读取非 `add` 文件（`analysis_sample_similarity.CN.txt/EN.txt`）。
2. 表头读取文件第一行。

图片：

- `menu/plots/similarity_heatmap.png`

## 6. 单样本结果详情页需求（独立实现）

### 6.1 实现原则

1. 单独编写 v2.0 样本详情页与组件，不直接复用旧业务组件。
2. 页面交互可参考现有 `pathogen` / `pathogen-virus`。
3. 组件组织建议采用 v2.0 专属目录（示例：`rp-panel-v2`）。

### 6.2 页面结构

固定 3 个 Tab：

1. 细菌
2. 真菌
3. 病毒

### 6.3 数据文件映射

以样本 `D00002415` 为例：

1. 细菌：`D00002415/final_result/Bacteria/Bacteria_CN_pintai.RPM.txt`
2. 真菌：`D00002415/final_result/Fungus/Fungus_CN_pintai.RPM.txt`
3. 病毒：`D00002415/final_result/Virus/Virus_CN_pintai.RPM.txt`

### 6.4 列改造要求

1. 保持原有表格设计风格。
2. 删除“去重后序列数”列。
3. 新增“RPM”列。
4. 新增“致病等级”列。

## 7. 通用组件要求（结果文本渲染）

为减少重复开发，新增一个无业务语义的通用文本表格渲染组件（名称可实现时确定）：

1. 输入：中文文件路径、英文文件路径。
2. 语言选择：按系统语言自动选择 CN/EN 文件。
3. 渲染规则：按文件内容原样渲染表头和数据。
4. 适用范围：批次病原统计中“文件即表格”的场景。

限制：该组件只负责“文件 -> 表格”，不得承载旧页面定制业务判断。

## 8. 异常与兜底

1. 单个文件缺失：对应区域显示“数据文件缺失”提示，不影响同页其他模块。
2. 图片缺失：图区域显示占位提示，不阻断表格展示。
3. 语言文件缺失：优先回退到中文文件。
4. 空文件或仅表头：按空数据态渲染。

## 9. 验收清单

1. 入口流程正确：`RIApanelv1multi` 任务点击结果先进入汇总页。
2. 样本列表正确：5 列展示、4 列筛选、NC 标识规则生效。
3. 跳转正确：点击“查看”进入对应样本详情页。
4. 批次统计正确：5 个子 Tab 的文件与图片映射完整、表头来源正确。
5. 样本详情正确：3 Tab 文件读取正确，完成“删1加2”列改造。
6. 解耦达标：样本详情页为 v2.0 独立实现，不直接复用旧业务组件。
7. 待定项隔离：配置报告、下载报告仅占位，不扩展未确认交互与接口。

## 10. Assumptions（本版假设）

1. 本次仅产出需求文档，不进行代码改造。
2. 系统语言决定 CN/EN 文件选择。
3. `NC=1` 样本展示“（NC）”标识。
4. 若后续产品确认“配置报告/下载报告”细节，再补充二期需求。
