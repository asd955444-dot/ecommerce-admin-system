import { createApp } from 'vue/dist/vue.esm-bundler.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  template: `
    <div class="layout-container">
      <!-- 左側導覽列 -->
      <div class="sidebar">
        <div class="sidebar-logo">💳 BCPay 管理系統 v2.3.0</div>
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 style="margin: 0;">📊 代收付跑量總表 (全商戶動態結算)</h3>
              <span style="font-size: 13px; color: #8c8c8c;">數據已即時同步商戶最新餘額變動</span>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>商戶名稱</th>
                  <th>主要支付通道</th>
                  <th>代收金額</th>
                  <th>代付金額</th>
                  <th>手續費</th>
                  <th>目前最新餘額</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in combinedRunSummary" :key="idx">
                  <td>{{ item.date }}</td>
                  <td><strong>{{ item.merchant }}</strong></td>
                  <td><span class="tag">{{ item.channel }}</span></td>
                  <td style="color: #52c41a; font-weight: bold;">￥{{ item.collectAmt.toLocaleString() }}</td>
                  <td style="color: #fa8c16; font-weight: bold;">￥{{ item.payoutAmt.toLocaleString() }}</td>
                  <td style="color: #f5222d;">￥{{ item.feeAmt.toLocaleString() }}</td>
                  <td style="color: #1890ff; font-weight: bold;">￥{{ item.currentBalance.toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. 商戶下發與結算明細模組 (含歷史變動 Audit Log & CSV 導出) -->
        <div v-else-if="activeMenu === 'payout_audit'" class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0;">💸 商戶下發與餘額結算歷史 (Balance Audit Log)</h3>
            <div style="display: flex; gap: 8px;">
              <button class="btn" :class="payoutAuditTab === 'requests' ? 'btn-primary' : ''" @click="payoutAuditTab = 'requests'">📋 下發審核</button>
              <button class="btn" :class="payoutAuditTab === 'logs' ? 'btn-primary' : ''" @click="payoutAuditTab = 'logs'">📜 餘額變動紀錄</button>
              <button v-if="payoutAuditTab === 'logs'" class="btn btn-success" @click="exportBalanceLogsCSV">📥 導出商戶變動明細 CSV</button>
            </div>
          </div>

          <!-- 商戶餘額動態卡片區 -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
            <div v-for="m in merchants" :key="m.id" style="background: #fafafa; border: 1px solid #f0f0f0; padding: 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: bold;">{{ m.name }} <span style="font-size:12px; color:#8c8c8c;">({{ m.id }})</span></div>
                <div style="color: #52c41a; font-weight: bold; margin-top: 4px; font-size: 16px;">￥{{ (m.rawBalance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</div>
              </div>
              <button class="btn btn-warning" @click="openBalanceModal(m)">✏️ 調帳/充值</button>
            </div>
          </div>

          <!-- 下發審核列表 Tab -->
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
                <td style="color: #fa8c16; font-weight: bold;">￥{{ item.rawAmount.toLocaleString() }}</td>
                <td>{{ item.bank }}</td>
                <td>
                  <span :style="{ color: item.status === '待審核' ? '#fa8c16' : '#52c41a', fontWeight: 'bold' }">{{ item.status }}</span>
                </td>
                <td>
                  <button v-if="item.status === '待審核'" class="btn btn-primary" @click="approvePayout(item)">同意打款並扣款</button>
                  <span v-else style="color: #8c8c8c;">已完成結算</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 餘額變動紀錄 Tab (含動態篩選) -->
          <div v-else>
            <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
              <span style="font-weight: bold; font-size: 14px;">🔍 按商戶精確篩選：</span>
              <select v-model="filterLogMerchant" class="select-control">
                <option value="">全部商戶</option>
                <option v-for="m in merchants" :key="m.id" :value="m.name">{{ m.name }}</option>
              </select>
            </div>

            <table class="data-table">
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
                <tr v-for="log in filteredBalanceLogs" :key="log.id">
                  <td style="font-size: 12px; color: #666;">{{ log.time }}</td>
                  <td><strong>{{ log.merchantName }}</strong></td>
                  <td><span class="tag">{{ log.type }}</span></td>
                  <td>￥{{ log.beforeBal.toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</td>
                  <td :style="{ color: log.changeAmt >= 0 ? '#52c41a' : '#f5222d', fontWeight: 'bold' }">
                    {{ log.changeAmt >= 0 ? '+' : '' }}{{ log.changeAmt.toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}
                  </td>
                  <td><strong>￥{{ log.afterBal.toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</strong></td>
                  <td>{{ log.reason }}</td>
                </tr>
                <tr v-if="filteredBalanceLogs.length === 0">
                  <td colspan="7" style="text-align: center; color: #999; padding: 24px;">查無該商戶的變動歷史紀錄</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. 其他分頁佔位 -->
        <div v-else class="card" style="text-align: center; padding: 40px;">
          <h3>已選擇模組：{{ activeMenu }}</h3>
          <p style="color: #8c8c8c;">該功能模組正常運行中，請切換至「📊 代收付跑量總表」或「💸 商戶下發與結算明細」。</p>
        </div>

      </div>
    </div>

    <!-- 調帳對話框 (Modal) -->
    <div v-if="showBalanceModal" class="modal-backdrop">
      <div class="modal-box">
        <h3 style="margin-top:0; color: #1890ff;">✏️ 手動調整商戶餘額</h3>
        <p>商戶名稱：<strong>{{ selectedMerchantForBalance?.name }}</strong></p>
        <p style="font-size: 13px; color: #666;">目前餘額：￥{{ selectedMerchantForBalance?.rawBalance.toLocaleString() }}</p>
        <div class="form-group">
          <label>變更金額 (正數為充值/增加，負數為扣款/減少)：</label>
          <input type="number" v-model.number="balanceAdjustAmount" placeholder="例如: 5000 或 -2000">
        </div>
        <div class="form-group">
          <label>調整理由/備註：</label>
          <input type="text" v-model="balanceAdjustReason" placeholder="例如: 收到線下銀行轉帳充值/手續費沖銷">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
          <button class="btn" @click="closeBalanceModal">取消</button>
          <button class="btn btn-primary" @click="confirmBalanceAdjust">確認變更並同步結算</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      activeMenu: 'run_summary',
      payoutAuditTab: 'requests',
      filterLogMerchant: '',
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

      // 擴充至 6+ 家測試商戶與真實數據
      merchants: [
        { id: 'MCH-1001', name: '閃電電商', rawBalance: 158200.00 },
        { id: 'MCH-1002', name: '海淘優選', rawBalance: 42100.00 },
        { id: 'MCH-1003', name: '星光娛樂', rawBalance: 33405.00 },
        { id: 'MCH-1004', name: '極速跨境', rawBalance: 289000.00 },
        { id: 'MCH-1005', name: '極光數位', rawBalance: 12500.00 },
        { id: 'MCH-1006', name: '華夏智付', rawBalance: 76400.00 }
      ],

      // 豐富代收付與總表紀錄數據
      runSummaryList: [
        { date: '2026-08-12', merchant: '閃電電商', channel: '微信支付', collectAmt: 158200, payoutAmt: 50000, feeAmt: 1249.20 },
        { date: '2026-08-12', merchant: '海淘優選', channel: '支付寶', collectAmt: 89300, payoutAmt: 20000, feeAmt: 695.80 },
        { date: '2026-08-12', merchant: '星光娛樂', channel: 'LINE Pay', collectAmt: 42500, payoutAmt: 8000, feeAmt: 1095.00 },
        { date: '2026-08-12', merchant: '極速跨境', channel: '支付寶', collectAmt: 310000, payoutAmt: 120000, feeAmt: 2015.00 },
        { date: '2026-08-12', merchant: '極光數位', channel: '快捷支付', collectAmt: 52000, payoutAmt: 15000, feeAmt: 410.00 },
        { date: '2026-08-12', merchant: '華夏智付', channel: '銀行卡直連', collectAmt: 145000, payoutAmt: 40000, feeAmt: 1150.00 }
      ],

      // 多筆下發審核單號
      payoutRequests: [
        { id: 'WD-2026081201', merchant: '閃電電商', rawAmount: 50000.00, bank: '招商銀行 (尾號 8812)', status: '待審核' },
        { id: 'WD-2026081202', merchant: '極速跨境', rawAmount: 80000.00, bank: '工商銀行 (尾號 1102)', status: '待審核' },
        { id: 'WD-2026081203', merchant: '華夏智付', rawAmount: 30000.00, bank: '建設銀行 (尾號 9921)', status: '待審核' },
        { id: 'WD-2026081204', merchant: '極光數位', rawAmount: 10000.00, bank: '中國銀行 (尾號 5543)', status: '待審核' },
        { id: 'WD-2026081105', merchant: '海淘優選', rawAmount: 20000.00, bank: '建設銀行 (尾號 4102)', status: '已下發' }
      ],

      // 商戶變動歷史紀錄 Audit Logs
      balanceLogs: [
        { id: 'LOG-1001', merchantName: '閃電電商', type: '手動充值', beforeBal: 108200.00, changeAmt: 50000.00, afterBal: 158200.00, reason: '收到線上銀行轉帳充值', time: '2026-08-12 09:15:22' },
        { id: 'LOG-1002', merchantName: '海淘優選', type: '下發扣款', beforeBal: 62100.00, changeAmt: -20000.00, afterBal: 42100.00, reason: '下發審核打款 [WD-2026081105]', time: '2026-08-12 10:30:10' },
        { id: 'LOG-1003', merchantName: '極速跨境', type: '手動充值', beforeBal: 189000.00, changeAmt: 100000.00, afterBal: 289000.00, reason: '大額商戶押金預充', time: '2026-08-12 11:05:44' },
        { id: 'LOG-1004', merchantName: '華夏智付', type: '手動扣除', beforeBal: 78000.00, changeAmt: -1600.00, afterBal: 76400.00, reason: '月度通道系統服務費扣除', time: '2026-08-12 11:20:00' }
      ]
    }
  },
  computed: {
    combinedRunSummary() {
      return this.runSummaryList.map(item => {
        const m = this.merchants.find(x => x.name === item.merchant)
        return {
          ...item,
          currentBalance: m ? m.rawBalance : 0
        }
      })
    },
    filteredBalanceLogs() {
      if (!this.filterLogMerchant) return this.balanceLogs;
      return this.balanceLogs.filter(log => log.merchantName === this.filterLogMerchant);
    },
    totalCollect() { return this.runSummaryList.reduce((s, i) => s + i.collectAmt, 0); },
    totalPayout() { return this.runSummaryList.reduce((s, i) => s + i.payoutAmt, 0); },
    totalFee() { return this.runSummaryList.reduce((s, i) => s + i.feeAmt, 0); },
    totalNet() { return this.totalCollect - this.totalPayout; }
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
    // 手動調帳（充值/扣款/沖銷），並寫入 Audit Log
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
        time: new Date().toLocaleString('zh-TW', { hour12: false })
      });
      
      alert(`調帳成功！${m.name} 最新餘額為：￥${after.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`);
      this.closeBalanceModal();
    },
    // 同意打款，扣除餘額並寫入 Audit Log
    approvePayout(item) {
      const m = this.merchants.find(x => x.name === item.merchant);
      if (m) {
        if (m.rawBalance < item.rawAmount) {
          return alert(`無法下發！商戶 ${m.name} 的當前餘額 (￥${m.rawBalance.toLocaleString()}) 不足支付 ￥${item.rawAmount.toLocaleString()}`);
        }
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
          time: new Date().toLocaleString('zh-TW', { hour12: false })
        });
      }
      item.status = '已下發';
      alert('已批准打款，商戶結算餘額與變動歷史已同步更新！');
    },
    // 導出商戶變動明細 CSV 功能
    exportBalanceLogsCSV() {
      const logs = this.filteredBalanceLogs;
      if (logs.length === 0) {
        return alert('當前無可導出的變動歷史紀錄！');
      }

      let csvContent = '\uFEFF'; // 加入 UTF-8 BOM 避免 Excel 開啟亂碼
      csvContent += '紀錄ID,時間,商戶名稱,變動類型,變動前餘額,變動金額,變動後餘額,理由/備註\n';

      logs.forEach(l => {
        const row = [
          l.id,
          `"${l.time}"`,
          `"${l.merchantName}"`,
          `"${l.type}"`,
          l.beforeBal,
          l.changeAmt,
          l.afterBal,
          `"${l.reason.replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = this.filterLogMerchant 
        ? `${this.filterLogMerchant}_餘額變動明細_${new Date().toISOString().slice(0,10)}.csv`
        : `全商戶_餘額變動明細_${new Date().toISOString().slice(0,10)}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
})

// 自動注入頁面樣式
const style = document.createElement('style')
style.innerHTML = `
  * { box-sizing: border-box; }
  .layout-container { display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
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
  .data-table th { background: #f5f7fa; border-bottom: 2px solid #e4e7ed; padding: 12px; font-size: 14px; }
  .data-table td { padding: 12px; border-bottom: 1px solid #ebedf0; font-size: 14px; }
  .tag { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
  .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
  .modal-box { background: #fff; border-radius: 8px; width: 420px; padding: 24px; }
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; margin-bottom: 6px; font-size: 14px; }
  .form-group input { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; box-sizing: border-box; }
  .select-control { padding: 6px 12px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 14px; outline: none; }
  .btn { padding: 6px 14px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
  .btn-primary { background: #1890ff; color: #fff; }
  .btn-warning { background: #fa8c16; color: #fff; }
  .btn-success { background: #52c41a; color: #fff; }
`
document.head.appendChild(style)

app.use(ElementPlus)
app.mount('#app')
