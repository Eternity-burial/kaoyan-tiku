# 思维导图沙箱 (Mindmap Sandbox)

本目录为仓库内**完全独立、零业务侵入的思维导图沙箱实现**。
专注于提供成熟、稳定、高质感的树状节点拖拽与视口交互体验（对标飞书思维导图交互）。

---

## 🌟 核心特性与架构设计

1. **物理隔离**：
   * 独立宿主入口 (`index.html`)、独立样式表 (`css/sandbox.css`)、独立主脚本 (`js/main.js`)；
   * **零修改**题库根目录的 `index.html` 与现有任何题库业务文件；
   * 不依赖任何外部构建工具或 Node 编译管道，纯浏览器原生环境即可运行。
2. **离线高可用 Vendor 库**：
   * 内置官方打包的 `simpleMindMap.umd.min.js` 与 `simpleMindMap.min.css`，纯离线秒级加载，不受外网波动影响。
3. **原生高品质拖拽 (Drag & Drop)**：
   * 拒绝自研 DnD / Hit Test 算法，100% 委托官方成熟 `Drag` 插件；
   * **兄弟节点重排**：拖至节点上下边缘自动浮现蓝色插槽线指示；
   * **父子关系迁移 (Reparenting)**：拖入目标节点主体区域高亮提示，平滑转为目标子节点；
   * **子树原子迁移 (Subtree Integrity)**：携带全部子孙节点同步移动，分支连线自动重排；
   * **视口边缘自动卷滚**：当拖拽节点靠近屏幕边缘时自动平移画布；
   * **防成环保护**：原生拓扑层级校验，杜绝将祖先节点移入子孙分支。
4. **飞书同款快捷键与操作质感**：
   * `Tab`：在当前选中节点下插入子节点
   * `Enter`：在当前选中节点后插入同级兄弟节点
   * `Delete` / `Backspace`：删除当前选中的节点及其整棵子树
   * `Ctrl + Z`：撤销上一步操作（结构迁移、重排、增删均完美支持）
   * `Ctrl + Y`：重做已撤销操作
   * `Space + 鼠标左键拖拽` 或 `鼠标右键拖拽`：平移漫游画布
   * `Ctrl + 滚轮`：以鼠标光标所在点为中心缩放视口
   * `双击节点` 或 `选中按 Enter`：就地调出输入框编辑文本内容

---

## 🚀 启动与体验方式

### 方式 1：本地极简静态服务器启动（推荐）
在仓库根目录下运行：
```bash
# 使用 Python 启动
python -m http.server 8080

# 或使用 Node 启动
node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((q,s)=>{let p=path.join('.',decodeURIComponent(q.url.split('?')[0]));if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');if(!fs.existsSync(p)){s.writeHead(404);s.end();return;}s.writeHead(200);fs.createReadStream(p).pipe(s);}).listen(8080,()=>console.log('http://127.0.0.1:8080/mindmap-sandbox/index.html'));"
```
打开浏览器访问：`http://127.0.0.1:8080/mindmap-sandbox/index.html`

### 方式 2：直接双击打开
在浏览器中直接通过 `file://` 协议打开本目录下的 `index.html` 即可完整体验。

---

## 🧪 自动化回归测试套件 (CDP E2E)

沙箱配套提供全流程端到端自动化测试脚本 `test_runner.js`，基于 Chrome DevTools 协议对 17 项核心指标进行全自动断言：

```bash
# 在仓库根目录运行测试套件
node mindmap-sandbox/test_runner.js
```

### 覆盖测试项一览：
* **Phase 2 基础加载与渲染**：
  * 测试 1: 页面零控制台异常
  * 测试 2: SimpleMindMap 实例挂载于 `window._mindMapInstance`
  * 测试 3: SVG 节点树与 29 个测试节点卡片完整渲染
  * 测试 4: 视口放大、缩小与复位 API 及标签联动
  * 测试 5: 官方 Drag 插件正常注入与激活
* **Phase 3 拖拽与拓扑核心**：
  * 测试 6: 初始三大知识章节拓扑校验
  * 测试 7: 父子关系迁移 (Reparenting) 与子树完整性
  * 测试 8: 历史栈撤销 (Undo) 与重做 (Redo) 100% 拓扑还原
  * 测试 9: 同级节点重新排序 (Sibling Reorder)
  * 测试 10: 祖先-后代防成环保护 (Cycle Prevention)
* **Phase 4 交互与快捷控制**：
  * 测试 11: 插入子节点 (INSERT_CHILD_NODE)
  * 测试 12: 插入同级节点 (INSERT_NODE)
  * 测试 13: 删除节点 (REMOVE_NODE)
  * 测试 14: 节点原地文本编辑 (TextEdit)
  * 测试 15: 画布漫游平移 (Pan / translateXY)
* **Phase 5 数据导入导出**：
  * 测试 16: 纯文本树数据结构序列化导出 (`getData`)
  * 测试 17: 外部数据结构反序列化导入 (`setData`)
