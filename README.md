# Prompt Master Desktop (Electron)

桌面版提示词管理工具（Electron + Bun）。

## 功能

- 提示词：新增 / 编辑 / 删除 / 置顶 / 搜索 / 标签筛选
- 点击卡片复制后自动最小化
- JSON 导入 / 导出（系统文件选择器）
- 全局快捷键：`Alt+E`（显示/隐藏主窗口）
- 系统托盘：显示窗口 / 隐藏窗口 / 退出，左键托盘图标切换窗口
- 窗口状态自动记忆（位置、尺寸、最大化状态）

## 开发

```bash
cd electron-app
bun install
bun run dev
```

## 打包

```bash
cd electron-app
bun run build
```

输出目录：`electron-app/dist`

## 说明

- 关闭窗口默认隐藏到托盘，可通过托盘菜单退出。
- 修改快捷键：编辑 `electron-app/main.js` 中的 `globalShortcut.register("Alt+E", ...)`。
