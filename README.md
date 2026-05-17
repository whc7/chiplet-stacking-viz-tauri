# Chiplet Stacking Visualizer

一款基于 **Tauri + React + Three.js** 的桌面端 3D 芯粒（Chiplet）堆叠可视化工具，用于半导体封装设计中的芯粒布局、堆叠与对齐验证。

---

## 目录

1. [项目简介](#项目简介)
2. [技术栈](#技术栈)
3. [功能特性](#功能特性)
4. [环境要求](#环境要求)
5. [安装与运行](#安装与运行)
6. [使用指南](#使用指南)
   - [界面布局](#界面布局)
   - [添加与管理芯粒](#添加与管理芯粒)
   - [3D 场景操作](#3d-场景操作)
   - [堆叠与折叠](#堆叠与折叠)
   - [凸点与硅通孔](#凸点与硅通孔)
   - [对齐检查](#对齐检查)
   - [项目保存与加载](#项目保存与加载)
7. [数据格式](#数据格式)
8. [开发指南](#开发指南)
9. [常见问题](#常见问题)
10. [许可证](#许可证)

---

## 项目简介

Chiplet Stacking Visualizer 是一款专为半导体封装工程师和芯片设计师打造的 3D 可视化桌面应用。它允许用户在三维空间中创建、编辑和堆叠多个芯粒（Chiplet），并添加凸点（Bump）和硅通孔（TSV）等互连特征，实时验证不同芯粒之间的对齐精度。

该工具采用现代化的 Web 技术栈构建，并通过 Tauri 封装为原生桌面应用，兼顾了开发的灵活性与原生应用的性能体验。

---

## 技术栈

| 层级 | 技术 | 版本 | 说明 |
|:---|:---|:---|:---|
| **桌面框架** | Tauri | v2 | Rust 编写的轻量级桌面应用框架 |
| **前端框架** | React | v19 | 用户界面构建 |
| **类型系统** | TypeScript | v6 | 静态类型检查 |
| **3D 渲染** | Three.js + @react-three/fiber | v0.184 / v9 | WebGL 3D 图形渲染 |
| **3D 辅助** | @react-three/drei | v10 | Three.js 常用组件库 |
| **构建工具** | Vite | v8 | 前端开发与构建 |
| **状态管理** | Zustand | v5 | 轻量级全局状态管理 |
| **后端语言** | Rust | 2021 Edition | Tauri 命令与原生功能 |
| **打包格式** | NSIS | - | Windows 安装程序 |

---

## 功能特性

### 芯粒管理
- ✨ **添加芯粒**：一键添加默认尺寸的芯粒到 3D 场景中
- 🗑️ **删除芯粒**：从列表中移除不需要的芯粒
- 🎯 **选择高亮**：点击芯粒即可选中，显示金色边框高亮
- 📋 **列表管理**：右侧面板展示所有芯粒，支持快速选择和设置基准芯粒

### 3D 交互
- 🖱️ **轨道控制**：鼠标左键旋转视角，右键平移，滚轮缩放
- ✋ **拖拽移动**：选中芯粒后，使用 TransformControls 在 X/Y/Z 三轴上精确拖拽
- 🧭 **方向辅助**：右下角 Gizmo 显示当前相机朝向
- 📐 **参考网格**：无限网格地面，辅助空间定位

### 堆叠与折叠
- 📚 **普通堆叠（Stack）**：将选中芯粒平放到基准芯粒正上方，保持朝向不变
- 🔃 **X 轴翻转（X-Fold）**：将选中芯粒沿 X 轴翻转 180° 后堆叠（背面朝上）
- 🔄 **Y 轴旋转（Y-Fold）**：将选中芯粒沿 Y 轴旋转 180° 后堆叠（左右前后互换）
- ↩️ **撤销恢复**：支持撤销最近一次堆叠/折叠操作，恢复到之前的状态

### 互连特征
- 🔴 **凸点（Bump）**：在芯粒表面添加红色球形凸点，用于芯粒间电气连接
- 🔵 **硅通孔（TSV）**：添加贯穿芯粒的蓝色圆柱形通孔，用于垂直方向互连
- ✏️ **精确编辑**：支持输入精确的 XYZ 坐标调整每个 Bump/TSV 的位置
- 🎨 **视觉区分**：不同特征使用不同颜色和发光效果，便于识别

### 对齐验证
- ✅ **一键检查**：自动计算所有芯粒之间 Bump-Bump 和 TSV-TSV 的平面距离
- 🎚️ **容差可调**：通过滑块调整对齐判定容差（默认 0.05，范围 0.01 ~ 0.2）
- 📊 **结果统计**：显示对齐成功/总数的统计信息
- 🟢🔴 **可视化连线**：绿色连线表示对齐成功，红色表示未对齐，直观展示匹配结果

### 外观与定制
- 🎨 **双面配色**：分别设置芯粒正面（Front）和背面（Back）的颜色
- 👁️ **透明度调节**：支持 0.1 ~ 1.0 的透明度调节，便于观察内部结构
- 🪞 **镜像翻转**：支持沿 X/Y/Z 任意轴进行镜像操作
- 📐 **变换编辑**：精确输入位置（Position）、旋转（Rotation，角度制）、缩放（Scale）数值

### 项目管理
- 💾 **保存项目**：将当前所有芯粒数据导出为 JSON 文件
- 📂 **加载项目**：从 JSON 文件恢复之前保存的设计
- 🧹 **清空场景**：一键移除所有芯粒，重新开始设计

---

## 环境要求

### 开发环境

- **操作系统**：Windows 10/11、macOS 或 Linux
- **Node.js**：v18 或更高版本
- **Rust**：v1.70 或更高版本（安装 [rustup](https://rustup.rs/)）
- **Tauri 系统依赖**：
  - Windows：Microsoft Visual C++ Build Tools、WebView2 Runtime
  - 详细依赖请参考 [Tauri 官方文档](https://tauri.app/start/prerequisites/)

### 运行环境

- **操作系统**：Windows 10/11（64位）
- **显卡**：支持 WebGL 2.0 的显卡（推荐独立显卡以获得更流畅的 3D 体验）
- **内存**：4GB 及以上
- **磁盘空间**：约 100MB（安装包）

---

## 安装与运行

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/chiplet-stacking-viz-tauri.git
cd chiplet-stacking-viz-tauri
```

### 2. 安装前端依赖

```bash
npm install
```

### 3. 安装 Tauri CLI（如未全局安装）

```bash
npm install -g @tauri-apps/cli
```

### 4. 开发模式运行

```bash
npm run tauri:dev
```

此命令会同时启动 Vite 开发服务器和 Tauri 桌面窗口。首次运行会自动编译 Rust 后端，可能需要几分钟时间。

### 5. 构建生产版本

```bash
npm run tauri:build
```

构建完成后，安装程序将位于：
```
src-tauri/target/release/bundle/nsis/
```

---

## 使用指南

### 界面布局

启动应用后，主界面分为左右两大区域：

| 区域 | 位置 | 说明 |
|:---|:---|:---|
| **3D 视口** | 左侧（大面积） | 展示所有芯粒的三维场景，支持鼠标交互 |
| **控制面板** | 右侧（320px 宽） | 包含所有操作按钮、芯粒列表、属性编辑 |

### 添加与管理芯粒

1. **添加芯粒**：点击右侧面板顶部的 **「+ Add Chiplet」** 按钮
   - 新芯粒会以随机位置出现在场景中
   - 默认尺寸：宽 4.0 × 高 0.15 × 深 2.5（单位：毫米）
   - 新添加的芯粒会自动被选中

2. **选择芯粒**：
   - 在 3D 场景中 **点击** 芯粒体
   - 或在右侧面板的芯粒列表中 **点击** 芯粒名称
   - 选中后芯粒会显示 **金色线框** 高亮

3. **删除芯粒**：点击芯粒列表右侧的 **「×」** 按钮

4. **设置基准芯粒（Base）**：
   - 基准芯粒是堆叠操作的参考对象
   - 点击非基准芯粒列表中的 **「Set Base」** 按钮即可切换
   - 基准芯粒名称前会显示 **「⬡」** 标记

### 3D 场景操作

| 操作 | 鼠标/键盘 | 说明 |
|:---|:---|:---|
| **旋转视角** | 左键拖拽 | 围绕场景中心旋转相机 |
| **平移视角** | 右键拖拽 | 在水平/垂直方向移动相机 |
| **缩放** | 滚轮 | 拉近或拉远相机 |
| **选中芯粒** | 左键点击芯粒 | 选中并激活该芯粒 |
| **取消选择** | 点击空白处 | 取消当前选中状态 |
| **拖拽芯粒** | 选中后拖拽轴控件 | 沿 X/Y/Z 单轴或自由移动 |

> 💡 **提示**：拖拽芯粒时，轨道控制会自动禁用，防止视角与物体移动冲突。拖拽结束后自动恢复。

### 堆叠与折叠

进行堆叠操作前，请确保：
1. 已选择要移动的**目标芯粒**（点击选中）
2. 已设置**基准芯粒**（作为堆叠的底部参考）
3. 目标芯粒与基准芯粒不是同一个

| 按钮 | 功能 | 效果 |
|:---|:---|:---|
| **Stack (no flip)** | 普通堆叠 | 目标芯粒平移到基准芯粒正上方，保持原朝向 |
| **X-Fold (flip over X)** | X 轴翻转堆叠 | 芯粒沿 X 轴翻转 180°，背面朝上放置 |
| **Y-Fold (rotate 180°)** | Y 轴旋转堆叠 | 芯粒沿 Y 轴旋转 180°，左右前后互换 |
| **↩ Restore Last Stack/Fold** | 撤销 | 恢复到堆叠/折叠前的状态 |

> ⚠️ **注意**：
> - 如果基准芯粒上方已有其他芯粒，新堆叠的芯粒会自动放置到最高处的上方
> - 堆叠后会自动执行对齐检查
> - 每次堆叠/折叠前会自动保存快照，支持一次撤销

### 凸点与硅通孔

在右侧属性面板中，选中芯粒后可以管理其互连特征：

#### 添加 Bump（凸点）
1. 点击 **「+ Bump」** 按钮
2. 新 Bump 默认出现在芯粒顶部中心
3. 在列表中修改 X/Y/Z 坐标精确调整位置
4. Bump 以**红色球体**显示在芯粒表面

#### 添加 TSV（硅通孔）
1. 点击 **「+ TSV」** 按钮
2. 新 TSV 默认出现在芯粒中心
3. 修改 X/Z 坐标调整平面位置（TSV 自动贯穿芯粒厚度）
4. TSV 以**蓝色圆柱体**显示，上下端有圆环标记

#### 删除特征
点击 Bump 或 TSV 列表项右侧的 **「×」** 按钮即可删除。

### 对齐检查

1. 点击 **「Check Alignment」** 按钮
2. 系统自动计算所有芯粒之间每对 Bump-Bump 和 TSV-TSV 的平面距离
3. 结果展示在右侧面板：
   - **Aligned**: X / Y — 对齐成功数 / 检查总数
   - **Tolerance**: 通过滑块调整对齐判定阈值
4. 3D 场景中会显示连线：
   - 🟢 **绿色连线**：距离 ≤ 容差，对齐成功
   - 🔴 **红色连线**：距离 > 容差，未对齐
5. 点击 **「Hide」** / **「Show」** 可切换连线显示

> 💡 **建议**：根据实际工艺精度调整容差值。例如，先进封装可能要求 0.01 ~ 0.05 的严格容差。

### 项目保存与加载

| 按钮 | 功能 | 说明 |
|:---|:---|:---|
| **Save** | 保存项目 | 弹出系统文件对话框，选择保存位置，导出 JSON 文件 |
| **Load** | 加载项目 | 弹出系统文件对话框，选择之前保存的 JSON 文件恢复 |

保存的文件包含所有芯粒的完整数据（位置、旋转、缩放、颜色、Bumps、TSVs 等），可在不同设备间传递和复用。

---

## 数据格式

保存的项目文件为 JSON 格式，结构如下：

```json
{
  "version": "1.0.0",
  "chiplets": [
    {
      "id": "chiplet_1",
      "name": "Chiplet 1",
      "width": 4.0,
      "height": 0.15,
      "depth": 2.5,
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1],
      "frontColor": "#2c3e50",
      "backColor": "#95a5a6",
      "opacity": 0.7,
      "bumps": [
        {
          "id": "bump_2",
          "position": [0, 0.155, 0],
          "radius": 0.08,
          "color": "#e74c3c"
        }
      ],
      "tsvs": [
        {
          "id": "tsv_3",
          "position": [0, 0],
          "radius": 0.05,
          "color": "#3498db"
        }
      ]
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `width` | number | 芯粒宽度（X 轴，长边） |
| `height` | number | 芯粒厚度（Y 轴，极薄） |
| `depth` | number | 芯粒深度（Z 轴，短边） |
| `position` | [x, y, z] | 三维空间中的中心坐标 |
| `rotation` | [x, y, z] | 绕各轴的旋转角度（弧度制） |
| `scale` | [x, y, z] | 各轴缩放比例（负值表示镜像） |

---

## 开发指南

### 项目结构

```
chiplet-stacking-viz-tauri/
├── src/                        # 前端源码
│   ├── main.tsx                # 应用入口
│   ├── App.tsx                 # 根组件（Canvas + UI 布局）
│   ├── types.ts                # TypeScript 类型定义
│   ├── store/
│   │   └── chipletStore.ts     # Zustand 全局状态管理
│   └── components/
│       ├── Scene3D.tsx         # 3D 场景管理（TransformControls）
│       ├── Chiplet.tsx         # 单个芯粒 3D 渲染组件
│       ├── UI.tsx              # 右侧控制面板
│       └── AlignmentLines.tsx  # 对齐结果连线渲染
├── src-tauri/                  # Tauri / Rust 后端
│   ├── src/                    # Rust 源码
│   ├── Cargo.toml              # Rust 依赖配置
│   └── tauri.conf.json         # Tauri 应用配置
├── index.html                  # HTML 模板
├── vite.config.ts              # Vite 构建配置
├── tsconfig.json               # TypeScript 配置
└── package.json                # Node.js 依赖配置
```

### 常用命令

```bash
# 前端开发服务器
npm run dev

# 带 Tauri 的开发模式
npm run tauri:dev

# 前端生产构建
npm run build

# 完整应用打包（前端 + Rust）
npm run tauri:build

# 预览生产构建
npm run preview
```

### 状态管理架构

应用使用 **Zustand** 进行全局状态管理，核心状态包括：

- `chiplets`: 所有芯粒数据数组
- `selectedChipletId`: 当前选中芯粒 ID
- `baseChipletId`: 基准芯粒 ID（堆叠参考）
- `alignmentResults`: 对齐检查结果
- `history`: 堆叠/折叠前的状态快照（支持撤销）
- `isDragging`: 是否正在拖拽（用于禁用轨道控制）

---

## 常见问题

### Q1: 启动时提示 WebView2 未安装？
**A**: Windows 系统需要安装 Microsoft Edge WebView2 Runtime。大多数 Windows 10/11 系统已预装。如缺失，可前往 [Microsoft 官网](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) 下载安装。

### Q2: 3D 场景卡顿或帧率低？
**A**: 
- 确保显卡驱动为最新版本
- 减少同时显示的芯粒数量（>20 个可能影响性能）
- 关闭对齐连线显示可略微提升性能
- 确保浏览器/应用使用独立显卡而非集成显卡

### Q3: 堆叠后芯粒位置不符合预期？
**A**: 
- 检查是否正确设置了基准芯粒（Base）
- 确保目标芯粒与基准芯粒不是同一个
- 使用「Restore」撤销后重新调整位置再堆叠

### Q4: 保存/加载项目失败？
**A**: 
- 确保应用有文件系统访问权限
- 保存路径不要包含特殊字符
- 加载时请确保选择有效的 JSON 项目文件

### Q5: 如何修改默认芯粒尺寸？
**A**: 编辑 `src/types.ts` 中的 `DEFAULT_CHIPLET` 常量，修改后重新构建即可。

---

## 许可证

本项目采用 **ISC 许可证** 开源。

```
ISC License

Copyright (c) 2024

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

> 📌 **提示**：本手册对应应用版本 **v1.0.0**。如功能与界面有更新，请以实际应用为准。
