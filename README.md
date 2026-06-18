# Pi Flea Market 后端

Pi Network 支付后端，用于处理 User-to-App 支付的 approve 和 complete。

## 部署步骤

1. 在 Vercel 创建新项目
2. 导入此 GitHub 仓库
3. 设置环境变量：
   - `PI_API_KEY`：从 Pi Network 开发者平台获取
4. 部署
5. 记录域名，如 `https://piflea-backend.vercel.app`

## API 接口

### POST /api/approve

请求体：
```json
{
  "paymentId": "xxx"
}
```

### POST /api/complete

请求体：
```json
{
  "paymentId": "xxx",
  "txid": "xxx"
}
```
