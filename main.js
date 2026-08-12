<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BCPay 管理系統 v2.2.5</title>
  <!-- Element Plus 樣式表 -->
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
  <!-- Vue 3 全域版本 (包含模板編譯器) -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <!-- Element Plus 組件庫 -->
  <script src="https://unpkg.com/element-plus"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5; }
    .layout-container { display: flex; min-height: 100vh; }
    .sidebar { width: 220px; background: #001529; color: white; flex-shrink: 0; }
    .sidebar-logo { padding: 20px 16px; font-size: 18px; font-weight: bold; color: #1890ff; border-bottom: 1px solid #002140; }
    .menu-item { padding: 12px 20px; cursor: pointer; font-size: 14px; color: rgba(255,255,255,0.65); transition: 0.2s; }
    .menu-item:hover, .menu-item.active { background: #1890ff; color: #fff; }
    .main-content { flex: 1; padding: 24px; overflow-y: auto; }
    .card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .card-title { color: #8c8c8c; font-size: 13px; }
    .card-value { font-size: 24px; font-weight: bold; margin-top: 8px; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { background: #f5f7fa; border-bottom: 2px solid #e4e7ed; padding: 12px; }
    .data-table td { padding: 12px; border-bottom: 1px solid #ebedf0; }
    .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .modal-box { background: #fff; border-radius: 8px; width: 420px; padding: 24px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; }
    .form-group input { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; }
    .btn { padding: 6px 14px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
    .btn-primary { background: #1890ff; color: #fff; }
    .btn-warning { background: #fa8c16; color: #fff; }
  </style>
</head>
<body>

  <!-- Vue 掛載目標 -->
  <div id="app">
    <div class="layout-container">
      <!-- 左側導覽列 -->
      <div class="sidebar">
        <div class="sidebar-logo">💳 BCPay 管理系統</div>
        <div 
          v-for="item in menuItems" 
          :key="item.key" 
          class="menu-item"
          :class="{ active: activeMenu === item.key }"
          @click="activeMenu = item.key"
        >
          {{ item.label }}
        </div>
      </div>

      <!-- 主內容區 -->
      <div class="main-content">
        
        <!-- 1. 跑量總表模組 -->
        <div v-if="activeMenu === 'run_summary'">
          <div class="card-grid">
            <div class="card">
              <div class="card-title">總代收額</div>
              <div class="card-value" style="color: #52c41a;">￥{{ totalCollect.toLocaleString() }}</div>
            </div>
            <div class="card">
              <div class="card-title">總代付額</div>
              <div class="card-value" style="color: #fa8c16;">￥{{ totalPayout.toLocaleString() }}</div>
            </div>
            <div class="card">
              <div class="card-title">淨跑量</div>
              <div class="card-value" style="color: #1890ff;">￥{{ totalNet.toLocaleString() }}</div>
            </div>
            <div class="card">
              <div class="card-title">平台收益</div>
              <div class="card-value" style="color: #f5222d;">￥{{ totalFee.toLocaleString() }}</div>
            </div>
          </div>

          <div class="card">
            <h3 style="margin-top:0;">📊 代收付跑量總表 (v2.2.5)</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>商戶名稱</th>
                  <th>支付通道</th>
                  <th>代收金額</th>
                  <th>代付金額</th>
                  <th>手續費</th>
                  <th>淨結算金額</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in runSummaryList" :key="idx">
                  <td>{{ item.date }}</td>
                  <td><strong>{{ item.merchant }}</strong></td>
                  <td>{{ item.channel }}</td>
                  <td style="color: #52c41a; font-weight: bold;">￥{{ item.collectAmt.toLocaleString() }}</td>
                  <td style="color: #fa8c16; font-weight: bold;">￥{{ item.payoutAmt.toLocaleString() }}</td>
                  <td style="color: #f5222d;">￥{{ item.feeAmt.toLocaleString() }}</td>
                  <td style="color: #1890ff; font-weight: bold;">￥{{ item.netAmt.toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. 商戶下發與結算明細模組 -->
        <div v-else-if="activeMenu === 'payout_audit'" class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0;">💸 商戶下發與餘額結算歷史</h3>
            <div>
              <button class="btn" :class="payoutAuditTab === 'requests' ? 'btn-primary' : ''" @click="payoutAuditTab = 'requests'" style="margin-right: 8px;">📋 下發審核</button>
              <button class="btn" :class="payoutAuditTab === 'logs' ? 'btn-primary' : ''" @click="payoutAuditTab = 'logs'">📜 餘額變動紀錄</button>
            </div>
          </div>

          <!-- 商戶餘額頂部卡片區 -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
            <div v-for="m in merchants" :key="m.id" style="background: #fafafa; border: 1px solid #f0f0f0; padding: 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: bold;">{{ m.name }} ({{ m.id }})</div>
                <div style="color: #52c41a; font-weight: bold; margin-top: 4px;">￥{{ (m.rawBalance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</div>
              </div>
              <button class="btn btn-warning" @click="openBalanceModal(m)">✏️ 調帳/充值</button>
            </div>
          </div>

          <!-- 下發審核列表 -->
          <table v-if="payoutAuditTab === 'requests'" class="data-table">
            <thead>
              <tr>
                <th>下發單號</th>
                <th>商戶名稱</th>
                <th>提現金額</th>
                <th>收款帳號</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in payoutRequests" :key="item.id">
                <td>{{ item.id }}</td>
                <td><strong>{{ item.merchant }}</strong></td>
                <td style="color: #fa8c16; font-weight: bold;">{{ item.amount }}</td>
                <td>{{ item.bank }}</td>
                <td>{{ item.status }}</td>
                <td>
                  <button v-if="item.status === '待審核'" class="btn btn-primary" @click="approvePayout(item)">同意打款</button>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 餘額日誌列表 -->
          <table v-else class="data-table">
            <thead>
              <tr>
                <th>時間</th>
                <th>商戶名稱</th>
                <th>變動類型</th>
                <th>變動前餘額</th>
                <th>變動金額</th>
                <th>變動後餘額</th>
                <th>理由/備註</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in balanceLogs" :key="log.id">
                <td style="font-size: 12px; color: #666;">{{ log.time }}</td>
                <td><strong>{{ log.merchantName }}</strong></td>
                <td>{{ log.type }}</td>
                <td>￥{{ log.beforeBal.toLocaleString() }}</td>
                <td :style="{ color: log.changeAmt >= 0 ? '#52c41a' : '#f5222d', fontWeight: 'bold' }">
                  {{ log.changeAmt >= 0 ? '+' : '' }}{{ log.changeAmt.toLocaleString() }}
                </td>
                <td><strong>￥{{ log.afterBal.toLocaleString() }}</strong></td>
                <td>{{ log.reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. 其他分頁佔位 -->
        <div v-else class="card" style="text-align: center; padding: 40px;">
          <h3>已選擇模組：{{ activeMenu }}</h3>
          <p style="color: #8c8c8c;">該功能模組正正常運行中，請切換至「📊 代收付跑量總表」或「💸 商戶下發與結算明細」。</p>
        </div>

      </div>
    </div>

    <!-- 調帳對話框 (Modal) -->
    <div v-if="showBalanceModal" class="modal-backdrop">
      <div class="modal-box">
        <h3 style="margin-top:0; color: #1890ff;">✏️ 手動調整商戶餘額</h3>
        <p>商戶名稱：<strong>{{ selectedMerchantForBalance?.name }}</strong></p>
        <div class="form-group">
          <label>變更金額 (正數為充值，負數為扣款)：</label>
          <input type="number" v-model.number="balanceAdjustAmount" placeholder="例如: 5000 或 -2000">
        </div>
        <div class="form-group">
          <label>調整理由/備註：</label>
          <input type="text" v-model="balanceAdjustReason" placeholder="例如: 收到線下銀行轉帳">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
          <button class="btn" @click="closeBalanceModal">取消</button>
          <button class="btn btn-primary" @click="confirmBalanceAdjust">確認變更</button>
        </div>
      </div>
    </div>

  </div>

  <script>
    const { createApp } = Vue;

    const app = createApp({
      data() {
        return {
          activeMenu: 'run_summary',
          payoutAuditTab: 'requests',
          showBalanceModal: false,
          selectedMerchantForBalance: null,
          balanceAdjustAmount: 0,
          balanceAdjustReason: '',

          menuItems: [
            { key: 'run_summary', label: '📊 代收付跑量總表' },
            { key: 'payout_audit', label: '💸 商戶下發與結算明細' },
            { key: 'supplier', label: '🏭 供應商訂單管理' },
            { key: 'collect', label: '📥 代收訂單管理' },
            { key: 'payout', label: '📤 代付訂單管理' },
            { key: 'merchant', label: '🏢 商戶管理與費率' }
          ],

          merchants: [
            { id: 'MCH-1001', name: '閃電電商', rawBalance: 158200.00 },
            { id: 'MCH-1002', name: '海淘優選', rawBalance: 42100.00 },
            { id: 'MCH-1003', name: '星光娛樂', rawBalance: 33405.00 },
            { id: 'MCH-1004', name: '極速跨境', rawBalance: 289000.00 },
            { id: 'MCH-1005', name: '極光數位', rawBalance: 12500.00 },
            { id: 'MCH-1006', name: '華夏智付', rawBalance: 76400.00 }
          ],

          runSummaryList: [
            { date: '2026-08-12', merchant: '閃電電商', channel: '微信支付', collectAmt: 158200, payoutAmt: 50000, feeAmt: 1249.20, netAmt: 106950.80 },
            { date: '2026-08-12', merchant: '海淘優選', channel: '支付寶', collectAmt: 89300, payoutAmt: 20000, feeAmt: 695.80, netAmt: 68604.20 },
            { date: '2026-08-12', merchant: '星光娛樂', channel: 'LINE Pay', collectAmt: 42500, payoutAmt: 8000, feeAmt: 1095.00, netAmt: 33405.00 },
            { date: '2026-08-12', merchant: '極速跨境', channel: '支付寶', collectAmt: 310000, payoutAmt: 120000, feeAmt: 2015.00, netAmt: 187985.00 }
          ],

          payoutRequests: [
            { id: 'WD-2026081201', merchant: '閃電電商', rawAmount: 50000.00, amount: '￥50,000.00', bank: '招商銀行 (尾號 8812)', status: '待審核' },
            { id: 'WD-2026081202', merchant: '極速跨境', rawAmount: 80000.00, amount: '￥80,000.00', bank: '工商銀行 (尾號 1102)', status: '待審核' },
            { id: 'WD-2026081105', merchant: '海淘優選', rawAmount: 20000.00, amount: '￥20,000.00', bank: '建設銀行 (尾號 4102)', status: '已下發' }
          ],

          balanceLogs: [
            { id: 'LOG-001', merchantName: '閃電電商', type: '手動充值', beforeBal: 108200.00, changeAmt: 50000.00, afterBal: 158200.00, reason: '預充值結算', time: '2026-08-12 10:15:22' },
            { id: 'LOG-002', merchantName: '海淘優選', type: '下發扣款', beforeBal: 62100.00, changeAmt: -20000.00, afterBal: 42100.00, reason: '下發審核打款 [WD-2026081105]', time: '2026-08-12 11:30:10' }
          ]
        }
      },
      computed: {
        totalCollect() { return this.runSummaryList.reduce((s, i) => s + i.collectAmt, 0); },
        totalPayout() { return this.runSummaryList.reduce((s, i) => s + i.payoutAmt, 0); },
        totalFee() { return this.runSummaryList.reduce((s, i) => s + i.feeAmt, 0); },
        totalNet() { return this.runSummaryList.reduce((s, i) => s + i.netAmt, 0); }
      },
      methods: {
        openBalanceModal(m) {
          this.selectedMerchantForBalance = m;
          this.balanceAdjustAmount = 0;
          this.balanceAdjustReason = '';
          this.showBalanceModal = true;
        },
        closeBalanceModal() {
          this.showBalanceModal = false;
        },
        confirmBalanceAdjust() {
          if (!this.balanceAdjustAmount) return alert('請輸入調整金額');
          if (!this.balanceAdjustReason) return alert('請輸入理由');
          
          const m = this.selectedMerchantForBalance;
          const before = m.rawBalance || 0;
          const change = Number(this.balanceAdjustAmount);
          const after = before + change;
          
          m.rawBalance = after;
          this.balanceLogs.unshift({
            id: 'LOG-' + Date.now(),
            merchantName: m.name,
            type: change >= 0 ? '手動充值' : '手動扣款',
            beforeBal: before,
            changeAmt: change,
            afterBal: after,
            reason: this.balanceAdjustReason,
            time: new Date().toLocaleString()
          });
          
          alert('調帳成功！');
          this.closeBalanceModal();
        },
        approvePayout(item) {
          const m = this.merchants.find(x => x.name === item.merchant);
          if (m) {
            const before = m.rawBalance;
            const change = -item.rawAmount;
            m.rawBalance = before + change;
            this.balanceLogs.unshift({
              id: 'LOG-' + Date.now(),
              merchantName: m.name,
              type: '下發扣款',
              beforeBal: before,
              changeAmt: change,
              afterBal: m.rawBalance,
              reason: `審核通過下發 [${item.id}]`,
              time: new Date().toLocaleString()
            });
          }
          item.status = '已下發';
          alert('已成功批准打款！');
        }
      }
    });

    app.use(ElementPlus);
    app.mount('#app');
  </script>
</body>
</html>
