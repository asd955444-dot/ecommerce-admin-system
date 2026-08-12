import { createApp } from 'vue/dist/vue.esm-bundler.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  template: `
    <div class="layout-container">
      <!-- 左側選單欄 (淺藍色系) -->
      <div class="sidebar">
        <div>
          <div class="sidebar-logo">💳 BCPay 管理系統</div>
          <div class="sidebar-menu">
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
        </div>
        <!-- 版本號移至右下角/左下角小字體顯示 -->
        <div class="sidebar-footer">v2.5.0 Build 2026</div>
      </div>

      <!-- 主內容區 -->
      <div class="main-content">
        
        <!-- 1. 跑量總計 -->
        <div v-if="activeMenu === 'run_summary'">
          <div class="card" style="margin-bottom: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <h3 style="margin:0;">📊 跑量總計</h3>
              <div style="display:flex; gap:12px; align-items:center;">
                <!-- 月/日查詢 -->
                <input type="date" v-model="filterDate" class="input-control" />
                <!-- 商戶獨立篩選 -->
                <select v-model="filterMerchant" class="select-control">
                  <option value="">全部商戶</option>
                  <option v-for="m in merchants" :key="m.id" :value="m.name">{{ m.name }}</option>
                </select>
                <button class="btn btn-primary" @click="exportRunSummaryCSV">📥 導出跑量總計 CSV</button>
              </div>
            </div>
          </div>

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
            <table class="data-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>商戶名稱</th>
                  <th>主要通道</th>
                  <th>代收金額</th>
                  <th>代付金額</th>
                  <th>平台手續費</th>
                  <th>當前最新餘額</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in filteredRunSummary" :key="idx">
                  <td>{{ item.date }}</td>
                  <td><strong>{{ item.merchant }}</strong></td>
                  <td><span class="tag">{{ item.channel }}</span></td>
                  <td style="color: #52c41a; font-weight: bold;">￥{{ item.collectAmt.toLocaleString() }}</td>
                  <td style="color: #fa8c16; font-weight: bold;">￥{{ item.payoutAmt.toLocaleString() }}</td>
                  <td style="color: #f5222d;">￥{{ item.feeAmt.toLocaleString() }}</td>
                  <td style="color: #1890ff; font-weight: bold;">￥{{ item.currentBalance.toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</td>
                </tr>
                <tr v-if="filteredRunSummary.length === 0">
                  <td colspan="7" style="text-align: center; color: #999; padding: 20px;">查無相符跑量紀錄</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. 商戶餘額調整 -->
        <div v-else-if="activeMenu === 'balance_adjust'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h3 style="margin: 0;">💸 商戶餘額調整</h3>
            <span style="font-size:13px; color:#8c8c8c;">調整後系統將即時更新餘額，並於「結算明細」產生變動紀錄</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div v-for="m in merchants" :key="m.id" style="background: #f8fbff; border: 1px solid #d9e8f5; padding: 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: bold; font-size:15px;">{{ m.name }} <span style="font-size:12px; color:#8c8c8c;">({{ m.id }})</span></div>
                <div style="color: #1890ff; font-weight: bold; margin-top: 6px; font-size: 18px;">￥{{ (m.rawBalance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</div>
              </div>
              <button class="btn btn-warning" @click="openBalanceModal(m)">✏️ 調整餘額</button>
            </div>
          </div>
        </div>

        <!-- 3. 結算明細 (變動紀錄) -->
        <div v-else-if="activeMenu === 'settlement_logs'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; flex-wrap:wrap; gap:12px;">
            <h3 style="margin: 0;">📜 商戶餘額變動紀錄與結算明細</h3>
            <div style="display:flex; gap:10px; align-items:center;">
              <!-- 月/日查詢 -->
              <input type="date" v-model="filterDate" class="input-control" />
              <!-- 商戶獨立調出紀錄 -->
              <select v-model="filterMerchant" class="select-control">
                <option value="">全部商戶</option>
                <option v-for="m in merchants" :key="m.id" :value="m.name">{{ m.name }}</option>
              </select>
              <button class="btn btn-success" @click="exportBalanceLogsCSV">📥 導出餘額變動紀錄 CSV</button>
            </div>
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
                <th>理由 / 備註</th>
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
                <td colspan="7" style="text-align: center; color: #999; padding: 24px;">查無相符的變動紀錄</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. 供應商訂單查詢 -->
        <div v-else-if="activeMenu === 'supplier_orders'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; flex-wrap:wrap; gap:12px;">
            <h3 style="margin: 0;">🏭 供應商訂單查詢</h3>
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="date" v-model="filterDate" class="input-control" />
              <input type="text" v-model="searchOrderNo" placeholder="搜尋供應商單號 / 名稱..." class="input-control" />
              <button class="btn btn-primary" @click="exportSupplierOrdersCSV">📥 導出 CSV</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>供應商單號</th>
                <th>供應商名稱</th>
                <th>通道類型</th>
                <th>交易金額</th>
                <th>手續費</th>
                <th>訂單狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in filteredSupplierOrders" :key="o.id">
                <td>{{ o.date }}</td>
                <td><code>{{ o.id }}</code></td>
                <td>{{ o.supplierName }}</td>
                <td><span class="tag">{{ o.channel }}</span></td>
                <td style="font-weight:bold;">￥{{ o.amount.toLocaleString() }}</td>
                <td style="color:#f5222d;">￥{{ o.fee }}</td>
                <td><span class="status-badge" :class="o.statusClass">{{ o.status }}</span></td>
              </tr>
              <tr v-if="filteredSupplierOrders.length === 0">
                <td colspan="7" style="text-align:center; color:#999; padding:20px;">查無相符訂單</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5. 代收訂單查詢 -->
        <div v-else-if="activeMenu === 'collect_orders'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; flex-wrap:wrap; gap:12px;">
            <h3 style="margin: 0;">📥 代收訂單查詢</h3>
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="date" v-model="filterDate" class="input-control" />
              <select v-model="filterMerchant" class="select-control">
                <option value="">全部商戶</option>
                <option v-for="m in merchants" :key="m.id" :value="m.name">{{ m.name }}</option>
              </select>
              <input type="text" v-model="searchOrderNo" placeholder="系統單號 / 商戶單號..." class="input-control" />
              <button class="btn btn-primary" @click="exportCollectOrdersCSV">📥 導出代收 CSV</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>交易時間</th>
                <th>系統單號</th>
                <th>商戶單號</th>
                <th>商戶名稱</th>
                <th>支付通道</th>
                <th>金額</th>
                <th>訂單狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in filteredCollectOrders" :key="o.id">
                <td style="font-size:12px; color:#666;">{{ o.time }}</td>
                <td><code>{{ o.id }}</code></td>
                <td><code>{{ o.merchantOrderNo }}</code></td>
                <td><strong>{{ o.merchant }}</strong></td>
                <td><span class="tag">{{ o.channel }}</span></td>
                <td style="color:#52c41a; font-weight:bold;">￥{{ o.amount.toLocaleString() }}</td>
                <td><span class="status-badge" :class="o.statusClass">{{ o.status }}</span></td>
              </tr>
              <tr v-if="filteredCollectOrders.length === 0">
                <td colspan="7" style="text-align:center; color:#999; padding:20px;">查無相符代收訂單</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. 代付訂單查詢 -->
        <div v-else-if="activeMenu === 'payout_orders'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; flex-wrap:wrap; gap:12px;">
            <h3 style="margin: 0;">📤 代付訂單查詢</h3>
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="date" v-model="filterDate" class="input-control" />
              <select v-model="filterMerchant" class="select-control">
                <option value="">全部商戶</option>
                <option v-for="m in merchants" :key="m.id" :value="m.name">{{ m.name }}</option>
              </select>
              <input type="text" v-model="searchOrderNo" placeholder="代付單號 / 收款帳號..." class="input-control" />
              <button class="btn btn-primary" @click="exportPayoutOrdersCSV">📥 導出代付 CSV</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>申請時間</th>
                <th>代付單號</th>
                <th>商戶名稱</th>
                <th>收款銀行 / 帳號</th>
                <th>代付金額</th>
                <th>訂單狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in filteredPayoutOrders" :key="o.id">
                <td style="font-size:12px; color:#666;">{{ o.time }}</td>
                <td><code>{{ o.id }}</code></td>
                <td><strong>{{ o.merchant }}</strong></td>
                <td>{{ o.bank }}</td>
                <td style="color:#fa8c16; font-weight:bold;">￥{{ o.amount.toLocaleString() }}</td>
                <td><span class="status-badge" :class="o.statusClass">{{ o.status }}</span></td>
              </tr>
              <tr v-if="filteredPayoutOrders.length === 0">
                <td colspan="6" style="text-align:center; color:#999; padding:20px;">查無相符代付訂單</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 7. 商戶列表 -->
        <div v-else-if="activeMenu === 'merchant_list'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h3 style="margin: 0;">🏢 商戶列表與參數配置</h3>
            <button class="btn btn-primary" @click="showAddMerchantModal = true">➕ 新增商戶</button>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>商戶 ID</th>
                <th>商戶名稱</th>
                <th>目前餘額</th>
                <th>代收費率</th>
                <th>代付費率</th>
                <th>渠道費率</th>
                <th>單筆限額 (￥)</th>
                <th>渠道狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in merchants" :key="m.id">
                <td><code>{{ m.id }}</code></td>
                <td><strong>{{ m.name }}</strong></td>
                <td style="color:#1890ff; font-weight:bold;">￥{{ (m.rawBalance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</td>
                <td>{{ m.collectFeeRate }}%</td>
                <td>{{ m.payoutFeeRate }}%</td>
                <td><span class="tag">{{ m.channelFeeRate }}%</span></td>
                <td>￥{{ m.minLimit }} - ￥{{ m.maxLimit }}</td>
                <td>
                  <span class="status-badge" :class="m.channelActive ? 'status-success' : 'status-disabled'">
                    {{ m.channelActive ? '🟢 已開啟' : '🔴 已關閉' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

    <!-- 彈窗 1：商戶餘額調整小視窗 -->
    <div v-if="showBalanceModal" class="modal-backdrop">
      <div class="modal-box">
        <h3 style="margin-top:0; color: #1890ff;">✏️ 調整商戶餘額</h3>
        <p>商戶名稱：<strong>{{ selectedMerchantForBalance?.name }}</strong></p>
        <p style="font-size: 13px; color: #666;">目前餘額：￥{{ selectedMerchantForBalance?.rawBalance.toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</p>
        <div class="form-group">
          <label>調整金額 (正數增加，負數扣除)：</label>
          <input type="number" v-model.number="balanceAdjustAmount" class="input-control" placeholder="例如: 5000 或 -2000">
        </div>
        <div class="form-group">
          <label>調整理由：</label>
          <input type="text" v-model="balanceAdjustReason" class="input-control" placeholder="例如: 收到線下銀行轉帳充值/系統沖銷">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
          <button class="btn" @click="closeBalanceModal">取消</button>
          <button class="btn btn-primary" @click="confirmBalanceAdjust">確認調整</button>
        </div>
      </div>
    </div>

    <!-- 彈窗 2：新增商戶小視窗 -->
    <div v-if="showAddMerchantModal" class="modal-backdrop">
      <div class="modal-box" style="width:500px;">
        <h3 style="margin-top:0; color: #1890ff;">➕ 新增商戶設定</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="form-group">
            <label>自訂商戶號 (ID)：</label>
            <input type="text" v-model="newMerchant.id" class="input-control" placeholder="例: MCH-1007">
          </div>
          <div class="form-group">
            <label>自訂商戶名：</label>
            <input type="text" v-model="newMerchant.name" class="input-control" placeholder="例: 華夏智付">
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
          <div class="form-group">
            <label>代收費率 (%)：</label>
            <input type="number" step="0.01" v-model.number="newMerchant.collectFeeRate" class="input-control">
          </div>
          <div class="form-group">
            <label>代付費率 (%)：</label>
            <input type="number" step="0.01" v-model.number="newMerchant.payoutFeeRate" class="input-control">
          </div>
          <div class="form-group">
            <label>個別渠道費率 (%)：</label>
            <input type="number" step="0.01" v-model.number="newMerchant.channelFeeRate" class="input-control">
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div class="form-group">
            <label>單筆下限 (￥)：</label>
            <input type="number" v-model.number="newMerchant.minLimit" class="input-control">
          </div>
          <div class="form-group">
            <label>單筆上限 (￥)：</label>
            <input type="number" v-model.number="newMerchant.maxLimit" class="input-control">
          </div>
        </div>
        <div class="form-group">
          <label>渠道開關狀態：</label>
          <select v-model="newMerchant.channelActive" class="select-control" style="width:100%;">
            <option :value="true">🟢 開啟</option>
            <option :value="false">🔴 關閉</option>
          </select>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
          <button class="btn" @click="showAddMerchantModal = false">取消</button>
          <button class="btn btn-primary" @click="confirmAddMerchant">確認建立</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      activeMenu: 'run_summary',
      filterDate: '',
      filterMerchant: '',
      searchOrderNo: '',

      showBalanceModal: false,
      selectedMerchantForBalance: null,
      balanceAdjustAmount: 0,
      balanceAdjustReason: '',

      showAddMerchantModal: false,
      newMerchant: {
        id: '',
        name: '',
        collectFeeRate: 0.8,
        payoutFeeRate: 0.5,
        channelFeeRate: 0.3,
        minLimit: 100,
        maxLimit: 50000,
        channelActive: true
      },

      menuItems: [
        { key: 'run_summary', label: '📊 跑量總計' },
        { key: 'balance_adjust', label: '💸 商戶餘額調整' },
        { key: 'settlement_logs', label: '📜 結算明細' },
        { key: 'supplier_orders', label: '🏭 供應商訂單查詢' },
        { key: 'collect_orders', label: '📥 代收訂單查詢' },
        { key: 'payout_orders', label: '📤 代付訂單查詢' },
        { key: 'merchant_list', label: '🏢 商戶列表' }
      ],

      merchants: [
        { id: 'MCH-1001', name: '閃電電商', rawBalance: 158200.00, collectFeeRate: 0.8, payoutFeeRate: 0.5, channelFeeRate: 0.3, minLimit: 100, maxLimit: 50000, channelActive: true },
        { id: 'MCH-1002', name: '海淘優選', rawBalance: 42100.00, collectFeeRate: 0.75, payoutFeeRate: 0.45, channelFeeRate: 0.25, minLimit: 100, maxLimit: 50000, channelActive: true },
        { id: 'MCH-1003', name: '星光娛樂', rawBalance: 33405.00, collectFeeRate: 1.0, payoutFeeRate: 0.6, channelFeeRate: 0.4, minLimit: 200, maxLimit: 30000, channelActive: true },
        { id: 'MCH-1004', name: '極速跨境', rawBalance: 289000.00, collectFeeRate: 0.65, payoutFeeRate: 0.4, channelFeeRate: 0.2, minLimit: 500, maxLimit: 50000, channelActive: true },
        { id: 'MCH-1005', name: '極光數位', rawBalance: 12500.00, collectFeeRate: 0.8, payoutFeeRate: 0.5, channelFeeRate: 0.3, minLimit: 100, maxLimit: 20000, channelActive: false },
        { id: 'MCH-1006', name: '華夏智付', rawBalance: 76400.00, collectFeeRate: 0.7, payoutFeeRate: 0.45, channelFeeRate: 0.25, minLimit: 100, maxLimit: 50000, channelActive: true }
      ],

      runSummaryList: [
        { date: '2026-08-12', merchant: '閃電電商', channel: '微信支付', collectAmt: 158200, payoutAmt: 50000, feeAmt: 1249.20 },
        { date: '2026-08-12', merchant: '海淘優選', channel: '支付寶', collectAmt: 89300, payoutAmt: 20000, feeAmt: 695.80 },
        { date: '2026-08-12', merchant: '極速跨境', channel: '支付寶', collectAmt: 310000, payoutAmt: 120000, feeAmt: 2015.00 },
        { date: '2026-08-12', merchant: '華夏智付', channel: '銀行卡直連', collectAmt: 145000, payoutAmt: 40000, feeAmt: 1150.00 }
      ],

      balanceLogs: [
        { id: 'LOG-1001', merchantName: '閃電電商', type: '手動充值', beforeBal: 108200.00, changeAmt: 50000.00, afterBal: 158200.00, reason: '收到線上銀行轉帳充值', time: '2026-08-12 09:15:22' },
        { id: 'LOG-1002', merchantName: '海淘優選', type: '手動扣除', beforeBal: 62100.00, changeAmt: -20000.00, afterBal: 42100.00, reason: '下發打款沖銷扣除', time: '2026-08-12 10:30:10' }
      ],

      supplierOrders: [
        { id: 'SUP-2026081201', date: '2026-08-12', supplierName: '匯通支付', channel: '微信代收', amount: 85000, fee: 425, status: '交易成功', statusClass: 'status-success' },
        { id: 'SUP-2026081202', date: '2026-08-12', supplierName: '銀聯極速', channel: '銀行卡代付', amount: 45000, fee: 225, status: '交易成功', statusClass: 'status-success' }
      ],

      collectOrders: [
        { id: 'PAY-20260812001', merchantOrderNo: 'ORD-9981201', time: '2026-08-12 10:14:02', merchant: '閃電電商', channel: '微信支付', amount: 5000, status: '支付成功', statusClass: 'status-success' },
        { id: 'PAY-20260812002', merchantOrderNo: 'ORD-9981202', time: '2026-08-12 10:18:45', merchant: '極速跨境', channel: '支付寶', amount: 12000, status: '處理中', statusClass: 'status-warning' }
      ],

      payoutOrders: [
        { id: 'WD-2026081201', time: '2026-08-12 09:00:12', merchant: '閃電電商', bank: '招商銀行 (尾號 8812)', amount: 50000, status: '已打款', statusClass: 'status-success' },
        { id: 'WD-2026081202', time: '2026-08-12 11:20:00', merchant: '極速跨境', bank: '工商銀行 (尾號 1102)', amount: 80000, status: '處理中', statusClass: 'status-warning' }
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
    filteredRunSummary() {
      return this.combinedRunSummary.filter(i => {
        const matchMerchant = !this.filterMerchant || i.merchant === this.filterMerchant;
        const matchDate = !this.filterDate || i.date === this.filterDate;
        return matchMerchant && matchDate;
      });
    },
    filteredBalanceLogs() {
      return this.balanceLogs.filter(log => {
        const matchMerchant = !this.filterMerchant || log.merchantName === this.filterMerchant;
        const matchDate = !this.filterDate || log.time.startsWith(this.filterDate);
        return matchMerchant && matchDate;
      });
    },
    filteredSupplierOrders() {
      return this.supplierOrders.filter(o => {
        const matchDate = !this.filterDate || o.date === this.filterDate;
        const matchSearch = !this.searchOrderNo || o.id.includes(this.searchOrderNo) || o.supplierName.includes(this.searchOrderNo);
        return matchDate && matchSearch;
      });
    },
    filteredCollectOrders() {
      return this.collectOrders.filter(o => {
        const matchDate = !this.filterDate || o.time.startsWith(this.filterDate);
        const matchMerchant = !this.filterMerchant || o.merchant === this.filterMerchant;
        const matchSearch = !this.searchOrderNo || o.id.includes(this.searchOrderNo) || o.merchantOrderNo.includes(this.searchOrderNo);
        return matchDate && matchMerchant && matchSearch;
      });
    },
    filteredPayoutOrders() {
      return this.payoutOrders.filter(o => {
        const matchDate = !this.filterDate || o.time.startsWith(this.filterDate);
        const matchMerchant = !this.filterMerchant || o.merchant === this.filterMerchant;
        const matchSearch = !this.searchOrderNo || o.id.includes(this.searchOrderNo) || o.merchant.includes(this.searchOrderNo);
        return matchDate && matchMerchant && matchSearch;
      });
    },
    totalCollect() { return this.filteredRunSummary.reduce((s, i) => s + i.collectAmt, 0); },
    totalPayout() { return this.filteredRunSummary.reduce((s, i) => s + i.payoutAmt, 0); },
    totalFee() { return this.filteredRunSummary.reduce((s, i) => s + i.feeAmt, 0); },
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
    confirmBalanceAdjust() {
      if (!this.balanceAdjustAmount) return alert('請輸入調整金額');
      if (!this.balanceAdjustReason) return alert('請輸入調整理由');
      
      const m = this.selectedMerchantForBalance;
      const before = m.rawBalance || 0;
      const change = Number(this.balanceAdjustAmount);
      const after = before + change;
      
      m.rawBalance = after;

      this.balanceLogs.unshift({
        id: 'LOG-' + Date.now(),
        merchantName: m.name,
        type: change >= 0 ? '手動充值' : '手動扣除',
        beforeBal: before,
        changeAmt: change,
        afterBal: after,
        reason: this.balanceAdjustReason,
        time: new Date().toLocaleString('zh-TW', { hour12: false }).replace(/\//g, '-')
      });
      
      alert(`調整成功！${m.name} 最新餘額為：￥${after.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`);
      this.closeBalanceModal();
    },
    confirmAddMerchant() {
      if (!this.newMerchant.id || !this.newMerchant.name) return alert('請輸入商戶號與商戶名稱');
      
      this.merchants.push({
        ...this.newMerchant,
        rawBalance: 0.00
      });

      alert(`商戶 ${this.newMerchant.name} (${this.newMerchant.id}) 新增成功！`);
      this.showAddMerchantModal = false;
      this.newMerchant = { id: '', name: '', collectFeeRate: 0.8, payoutFeeRate: 0.5, channelFeeRate: 0.3, minLimit: 100, maxLimit: 50000, channelActive: true };
    },
    // CSV 匯出共用工具
    downloadCSV(filename, headers, rows) {
      let csvContent = '\uFEFF' + headers.join(',') + '\n';
      rows.forEach(r => {
        csvContent += r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n';
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    exportRunSummaryCSV() {
      const headers = ['日期', '商戶名稱', '主要通道', '代收金額', '代付金額', '手續費', '最新餘額'];
      const rows = this.filteredRunSummary.map(i => [i.date, i.merchant, i.channel, i.collectAmt, i.payoutAmt, i.feeAmt, i.currentBalance]);
      const fname = this.filterMerchant ? `${this.filterMerchant}_跑量總計.csv` : '跑量總計.csv';
      this.downloadCSV(fname, headers, rows);
    },
    exportBalanceLogsCSV() {
      const headers = ['時間', '商戶名稱', '變動類型', '變動前餘額', '變動金額', '變動後餘額', '理由'];
      const rows = this.filteredBalanceLogs.map(l => [l.time, l.merchantName, l.type, l.beforeBal, l.changeAmt, l.afterBal, l.reason]);
      const fname = this.filterMerchant ? `${this.filterMerchant}_餘額變動明細.csv` : '結算餘額變動明細.csv';
      this.downloadCSV(fname, headers, rows);
    },
    exportSupplierOrdersCSV() {
      const headers = ['日期', '供應商單號', '供應商', '通道', '金額', '手續費', '狀態'];
      const rows = this.filteredSupplierOrders.map(o => [o.date, o.id, o.supplierName, o.channel, o.amount, o.fee, o.status]);
      this.downloadCSV('供應商訂單.csv', headers, rows);
    },
    exportCollectOrdersCSV() {
      const headers = ['時間', '系統單號', '商戶單號', '商戶', '通道', '金額', '狀態'];
      const rows = this.filteredCollectOrders.map(o => [o.time, o.id, o.merchantOrderNo, o.merchant, o.channel, o.amount, o.status]);
      const fname = this.filterMerchant ? `${this.filterMerchant}_代收訂單.csv` : '代收訂單明細.csv';
      this.downloadCSV(fname, headers, rows);
    },
    exportPayoutOrdersCSV() {
      const headers = ['時間', '代付單號', '商戶', '收款帳號', '金額', '狀態'];
      const rows = this.filteredPayoutOrders.map(o => [o.time, o.id, o.merchant, o.bank, o.amount, o.status]);
      const fname = this.filterMerchant ? `${this.filterMerchant}_代付訂單.csv` : '代付訂單明細.csv';
      this.downloadCSV(fname, headers, rows);
    }
  }
})

// 自動注入淺藍色選單風格樣式
const style = document.createElement('style')
style.innerHTML = `
  * { box-sizing: border-box; }
  .layout-container { display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f7f9; }
  
  /* 淺藍色系 SideBar */
  .sidebar { width: 230px; background: #e8f3ff; color: #2c3e50; flex-shrink: 0; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid #d0e3f7; }
  .sidebar-logo { padding: 20px 16px; font-size: 18px; font-weight: bold; color: #1890ff; border-bottom: 1px solid #d0e3f7; background: #dbeeff; }
  .sidebar-menu { padding: 12px 0; }
  .menu-item { padding: 12px 20px; cursor: pointer; font-size: 14px; color: #4a607a; transition: 0.2s; font-weight: 500; }
  .menu-item:hover { background: #d0e5fc; color: #1890ff; }
  .menu-item.active { background: #1890ff; color: #ffffff; font-weight: bold; }
  
  /* 版本號置於右下角/左下角小字 */
  .sidebar-footer { padding: 16px; font-size: 12px; color: #8a9ba8; border-top: 1px solid #d0e3f7; text-align: left; }

  .main-content { flex: 1; padding: 24px; overflow-y: auto; }
  .card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
  .card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); border: 1px solid #eef2f5; }
  .card-title { color: #8c8c8c; font-size: 13px; }
  .card-value { font-size: 24px; font-weight: bold; margin-top: 8px; }
  
  .data-table { width: 100%; border-collapse: collapse; text-align: left; }
  .data-table th { background: #f7fafc; border-bottom: 2px solid #edf2f7; padding: 12px; font-size: 14px; color: #4a5568; }
  .data-table td { padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; }
  
  .tag { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
  .status-badge { padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  .status-success { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
  .status-warning { background: #fff7e6; color: #fa8c16; border: 1px solid #ffd591; }
  .status-disabled { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }

  .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; }
  .modal-box { background: #fff; border-radius: 8px; width: 420px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .form-group { margin-bottom: 14px; }
  .form-group label { display: block; margin-bottom: 6px; font-size: 13px; color: #4a5568; }
  .input-control, .select-control { padding: 7px 10px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px; outline: none; }
  .input-control:focus, .select-control:focus { border-color: #1890ff; }
  
  .btn { padding: 7px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: 0.2s; }
  .btn-primary { background: #1890ff; color: #fff; }
  .btn-warning { background: #fa8c16; color: #fff; }
  .btn-success { background: #52c41a; color: #fff; }
  .btn:hover { opacity: 0.85; }
`
document.head.appendChild(style)

app.use(ElementPlus)
app.mount('#app')
