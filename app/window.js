/*
 * @Author: fzf404
 * @Date: 2022-05-26 19:48:32
 * @LastEditors: fzf404 nmdfzf404@163.com
 * @LastEditTime: 2022-05-31 18:00:32
 * @Description: 窗口管理
 */

import { BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'

import { cget } from '../common/storage'
import { pluginList } from '../common/plugin'
import { winEvent } from './event'

// 窗口网格大小
const BasicMesh = 200

// 窗口列表
const windowList = []

// 创建窗口
export const createWindow = (name) => {
  // 判断窗口是否存在
  const exist = windowList.find((item) => item.title === name)
  if (exist) {
    // 展示窗口
    exist.show()
    return
  }

  // 窗口大小
  const size = pluginList.find(({ name: n }) => n === name).size

  // 读取配置
  const x = cget(name, 'x', 20)
  const y = cget(name, 'y', 20)
  const top = cget(name, 'top', false)

  // 创建窗口
  // TODO 隐藏任务栏图标
  const win = new BrowserWindow({
    x: x,
    y: y,
    title: name,
    width: size[0] * BasicMesh,
    height: size[1] * BasicMesh,
    alwaysOnTop: top, // 置顶

    skipTaskbar: true, // 隐藏任务栏图标
    transparent: true, // 透明
    hasShadow: false, // 阴影
    frame: false, // 隐藏边框
    resizable: false, // 不可调整大小
    fullscreenable: false, // 禁止全屏
    roundedCorners: false, // 圆角

    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
  })

  // 根据模式启动应用
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // 调试模式
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '#/' + name) // 加载应用
    if (!process.env.IS_TEST) win.webContents.openDevTools() // 打开调试器
  } else {
    // 生产模式
    createProtocol('app') // 创建协议
    win.loadURL('app://./index.html#/' + name) // 加载应用
  }

  // 监听事件
  winEvent(win, name)

  // 移除窗口
  win.on('closed', () => {
    windowList.splice(windowList.indexOf(win), 1)
  })

  // 添加窗口
  windowList.push(win)
}

// 开机自启窗口
export const autoWindow = () => {
  const openPlugins = cget('_config', 'open', ['welcome'])
  openPlugins.forEach((item) => {
    createWindow(item)
  })
}
