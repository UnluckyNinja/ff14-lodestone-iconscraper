# Lodestone 物品图标下载工具
## 安装 & 运行
下载 Node.js 最新LTS版本安装  
（可选）安装pnpm

Clone项目到本地，或从github下载源码包

修改downloadImages.js中最顶端参数：
- 页数
- 请求间隔
- 列表查询地址

打开命令行/PowerShell/其它，输入以下命令安装依赖（仅需运行一次）
```bash
npm i
# 或
pnpm i # 若安装了pnpm
```

输入以下命令运行代码
```bash
npm run d
# 或
pnpm d # 若安装了pnpm
```

图片会被下载到`./images/`目录下  
生成的`record_*.log`文件中包含所下载物品图标的记录
