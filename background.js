// 定义插件页面的完整 URL（替换为你自己的文件名）
const CHROME_EXTENSION_URL = chrome.runtime.getURL("index.html");

// 辅助：根据当前窗口位置保存下次打开的坐标
function persistWindowBounds(win) {
  if (win?.state === "normal") {
    chrome.storage.local.set({
      lastWindowPos: {
        left: win.left,
        top: win.top,
        width: win.width,
        height: win.height,
      },
    });
  }
}

// 辅助：创建扩展窗口，带有记忆位置
function createPromptWindow() {
  chrome.storage.local.get(["lastWindowPos"], (res) => {
    const pos = res.lastWindowPos || {};

    chrome.system.display.getInfo((displays) => {
      const primary = displays[0].workArea;
      const width = pos.width || 1200;
      const height = pos.height || 800;

      const left =
        pos.left ?? Math.round((primary.width - width) / 2 + primary.left);
      const top =
        pos.top ?? Math.round((primary.height - height) / 2 + primary.top);

      chrome.windows.create({
        url: "index.html",
        type: "popup",
        width,
        height,
        left,
        top,
        focused: true,
      });
    });
  });
}

// 找到已存在的扩展标签页（如果有）
async function findExistingTab() {
  const tabs = await chrome.tabs.query({});
  return tabs.find((tab) => tab.url === CHROME_EXTENSION_URL);
}

// 鼠标点击扩展图标：只负责打开或聚焦，不做关闭
async function openOrFocusWindow() {
  const existingTab = await findExistingTab();

  if (existingTab) {
    chrome.windows.update(existingTab.windowId, { focused: true });
    chrome.tabs.update(existingTab.id, { active: true });
    chrome.tabs.sendMessage(existingTab.id, { action: "FOCUS_SEARCH" });
    return;
  }

  createPromptWindow();
}

// 快捷键触发：支持 Alt+E 再次关闭（聚焦状态下），不聚焦则先唤起
async function toggleWindowWithShortcut() {
  const existingTab = await findExistingTab();

  if (existingTab) {
    try {
      const win = await chrome.windows.get(existingTab.windowId);

      if (win.focused) {
        // 已聚焦：保存位置并关闭
        persistWindowBounds(win);
        if (win.type === "popup") {
          await chrome.windows.remove(win.id);
        } else {
          await chrome.tabs.remove(existingTab.id);
        }
      } else {
        // 未聚焦：先唤起
        chrome.windows.update(existingTab.windowId, { focused: true });
        chrome.tabs.update(existingTab.id, { active: true });
        chrome.tabs.sendMessage(existingTab.id, { action: "FOCUS_SEARCH" });
      }
      return;
    } catch (error) {
      // 兜底：如果窗口信息获取失败，重新创建
      createPromptWindow();
      return;
    }
  }

  // 未打开：直接创建
  createPromptWindow();
}

// 确保 chrome.action 存在后再监听
if (chrome.action) {
  chrome.action.onClicked.addListener(openOrFocusWindow);
}

// 快捷键监听
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-prompt-master") {
    toggleWindowWithShortcut();
  }
});
