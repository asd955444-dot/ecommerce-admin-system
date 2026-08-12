import { createApp } from 'vue/dist/vue.esm-bundler.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  template: `
    <div class="layout-container">
      <!-- 左側選單欄 -->
      <div class="sidebar">
        <div>
          <div class="sidebar-logo">💳 BCPay 管理系統</div>
          <div class="sidebar-menu">
            <template v-for="item in menuItems" :key="item.key">
              
              <!-- 有子選單 -->
              <div v-if="item.children">
                <div 
                  class="menu-item menu-parent"
                  :class="{ active: isChildActive(item) }"
                  @click="toggleSubMenu(item.key)"
                >
                  <span>{{ item.label }}</span>
                  <span class="arrow-icon" :class="{ open: openSubMenus.includes(item.key) }">▼</span>
                </div>

                <div v-show="openSubMenus.includes(item.key)" class="submenu-container">
                  <div 
                    v-for="sub in item.children" 
                    :key="sub.key"
                    class="submenu-item"
                    :class="{ active: activeMenu === sub.key }"
                    @click="activeMenu = sub.key"
                  >
                    └ {{ sub.label }}
                  </div>
                </div>
              </div>

              <!-- 單層選單 -->
              <div 
                v-else 
                class="menu-item"
                :class="{ active: activeMenu === item.key }"
                @click="activeMenu = item.key"
              >
                {{ item.label }}
              </div>

            </template>
          </div>
        </div>
        <div class="sidebar-footer">v2.6.0 Build 2026</div>
      </div>

      <!-- 主內容區 -->
      <div class="main-content">
        
        <!-- 1-1. 渠道權重 -->
        <div v-if="activeMenu === 'channel_weight'" class="card">
          <h3 style="margin-top:0;">⚙️ 渠道權重設定</h3>
          <table class="data-table">
            <thead>
              <tr><th>渠道名稱</th><th>當前權重 (1-100)</th><th>分流比例</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="c in channels" :key="c.id">
                <td><strong>{{ c.name }}</strong></td>
                <td><input type="number" v-model.number="c.weight" class="input-control" style="width:80px;" /></td>
                <td><span class="tag">{{ c.weight }}%</span></td>
                <td><button class="btn btn-primary" @click="saveChannelWeight(c)">儲存權重</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 1-2. 渠道開關 -->
        <div v-if="activeMenu === 'channel_toggle'" class="card">
          <h3 style="margin-top:0;">🔌 渠道狀態開關</h3>
          <table class="data-table">
            <thead>
              <tr><th>渠道 ID</th><th>渠道名稱</th><th>類型</th><th>單筆限額</th><th>當前狀態</th><th>切換開關</th></tr>
            </thead>
            <tbody>
              <tr v-for="c in channels" :key="c.id">
                <td><code>{{ c.id }}</code></td>
                <td><strong>{{ c.name }}</strong></td>
                <td><span class="tag">{{ c.type }}</span></td>
                <td>￥{{ c.minLimit }} - ￥{{ c.maxLimit }}</td>
                <td>
                  <span class="status-badge" :class="c.active ? 'status-success' : 'status-disabled'">
                    {{ c.active ? '🟢 已開啟' : '🔴 已關閉' }}
                  </span>
                </td>
                <td>
                  <button class="btn" :class="c.active ? 'btn-danger' : 'btn-success'" @click="c.active = !c.active">
                    {{ c.active ? '關閉渠道' : '開啟渠道' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. 供應商訂單查詢 (4個子頁皆統一：3訂單號 + 日/月選擇 + 底部列表) -->
        <div v-else-if="isSupplierQueryMenu" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="margin:0;">🏭 {{ getMenuTitle(activeMenu) }}</h3>
            <button class="btn btn-primary" @click="exportCSV(getMenuTitle(activeMenu) + '.csv')">📥 導出 CSV</button>
          </div>
          
          <div class="search-box-group" style="margin-bottom: 20px;">
            <input type="text" v-model="searchQuery.mchNo" placeholder="商戶訂單號" class="input-control" />
            <input type="text" v-model="searchQuery.sysNo" placeholder="系統訂單號" class="input-control" />
            <input type="text" v-model="searchQuery.supNo" placeholder="供應商訂單號" class="input-control" />
            
            <select v-model="searchQuery.dateType" class="input-control" style="width: 100px;">
              <option value="day">按日選擇</option>
              <option value="month">按月選擇</option>
            </select>
            <input :type="searchQuery.dateType === 'day' ? 'date' : 'month'" v-model="searchQuery.selectedDate" class="input-control" />
            
            <button class="btn btn-primary" @click="handleExactSearch(getMenuTitle(activeMenu))">🔍 查詢</button>
          </div>

          <table class="data-table">
            <thead>
              <tr><th>時間</th><th>商戶訂單號</th><th>系統訂單號</th><th>供應商訂單號</th><th>供應商</th><th>金額</th><th>狀態</th></tr>
            </thead>
            <tbody>
              <tr v-for="o in activeSupplierList" :key="o.sysNo">
                <td>{{ o.date }}</td><td><code>{{ o.mchNo }}</code></td><td><code>{{ o.sysNo }}</code></td><td><code>{{ o.supNo }}</code></td><td>{{ o.supplier }}</td>
                <td :style="{ color: isPayoutMenu(activeMenu) ? '#fa8c16' : '#52c41a', fontWeight: 'bold' }">￥{{ o.amount.toLocaleString() }}</td>
                <td><span class="status-badge status-success">{{ o.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. 代收訂單查詢 (一般: 2欄 / 精準: 3欄 + 日/月選擇 + 底部列表) -->
        <div v-else-if="isCollectQueryMenu" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="margin:0;">📥 {{ getMenuTitle(activeMenu) }}</h3>
            <button class="btn btn-primary" @click="exportCSV(getMenuTitle(activeMenu) + '.csv')">📥 導出 CSV</button>
          </div>

          <div class="search-box-group" style="margin-bottom: 20px;">
            <input type="text" v-model="searchQuery.mchNo" placeholder="商戶訂單號" class="input-control" />
            <input type="text" v-model="searchQuery.sysNo" placeholder="系統訂單號" class="input-control" />
            <input v-if="activeMenu === 'collect_exact'" type="text" v-model="searchQuery.supNo" placeholder="供應商訂單號 (精準)" class="input-control" />
            
            <select v-model="searchQuery.dateType" class="input-control" style="width: 100px;">
              <option value="day">按日選擇</option>
              <option value="month">按月選擇</option>
            </select>
            <input :type="searchQuery.dateType === 'day' ? 'date' : 'month'" v-model="searchQuery.selectedDate" class="input-control" />
            
            <button class="btn btn-primary" @click="handleExactSearch(getMenuTitle(activeMenu))">🔍 查詢</button>
          </div>

          <table class="data-table">
            <thead>
              <tr><th>時間</th><th>商戶訂單號</th><th>系統訂單號</th><th>供應商訂單號</th><th>商戶</th><th>金額</th><th>狀態</th></tr>
            </thead>
            <tbody>
              <tr v-for="o in collectList" :key="o.sysNo">
                <td style="font-size:12px; color:#666;">{{ o.time }}</td><td><code>{{ o.mchNo }}</code></td><td><code>{{ o.sysNo }}</code></td><td><code>{{ o.supNo }}</code></td><td>{{ o.merchant }}</td>
                <td style="color:#52c41a; font-weight:bold;">￥{{ o.amount.toLocaleString() }}</td>
                <td><span class="status-badge status-success">{{ o.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. 代付訂單查詢 (一般: 2欄 / 精準: 3欄 + 日/月選擇 + 底部列表) -->
        <div v-else-if="isPayoutQueryMenu" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="margin:0;">📤 {{ getMenuTitle(activeMenu) }}</h3>
            <button class="btn btn-primary" @click="exportCSV(getMenuTitle(activeMenu) + '.csv')">📥 導出 CSV</button>
          </div>

          <div class="search-box-group" style="margin-bottom: 20px;">
            <input type="text" v-model="searchQuery.mchNo" placeholder="商戶訂單號" class="input-control" />
            <input type="text" v-model="searchQuery.sysNo" placeholder="系統訂單號" class="input-control" />
            <input v-if="activeMenu === 'payout_exact'" type="text" v-model="searchQuery.supNo" placeholder="供應商訂單號 (精準)" class="input-control" />
            
            <select v-model="searchQuery.dateType" class="input-control" style="width: 100px;">
              <option value="day">按日選擇</option>
              <option value="month">按月選擇</option>
            </select>
            <input :type="searchQuery.dateType === 'day' ? 'date' : 'month'" v-model="searchQuery.selectedDate" class="input-control" />
            
            <button class="btn btn-primary" @click="handleExactSearch(getMenuTitle(activeMenu))">🔍 查詢</button>
          </div>

          <table class="data-table">
            <thead>
              <tr><th>時間</th><th>商戶訂單號</th><th>系統訂單號</th><th>供應商訂單號</th><th>商戶</th><th>金額</th><th>狀態</th></tr>
            </thead>
            <tbody>
              <tr v-for="o in payoutList" :key="o.sysNo">
                <td style="font-size:12px; color:#666;">{{ o.time }}</td><td><code>{{ o.mchNo }}</code></td><td><code>{{ o.sysNo }}</code></td><td><code>{{ o.supNo }}</code></td><td>{{ o.merchant }}</td>
                <td style="color:#fa8c16; font-weight:bold;">￥{{ o.amount.toLocaleString() }}</td>
                <td><span class="status-badge status-success">{{ o.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5. 商戶列表 & 商戶餘額/配置調整 -->
        <div v-else-if="activeMenu === 'merchant_list'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h3 style="margin: 0;">🏢 商戶列表與配置管理</h3>
            <button class="btn btn-primary" @click="openAddMerchantModal">➕ 新增商戶</button>
          </div>
          <table class="data-table">
            <thead>
              <tr><th>商戶 ID</th><th>商戶名稱</th><th>目前餘額</th><th>費率 (代收/代付)</th><th>單筆限額</th><th>結算模式</th><th>已串渠道</th><th>狀態</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="m in merchants" :key="m.id">
                <td><code>{{ m.id }}</code></td>
                <td><strong>{{ m.name }}</strong></td>
                <td style="color:#1890ff; font-weight:bold;">￥{{ (m.rawBalance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2}) }}</td>
                <td>{{ m.collectFeeRate }}% / {{ m.payoutFeeRate }}%</td>
                <td>￥{{ m.minLimit }} - ￥{{ m.maxLimit }}</td>
                <td><span class="tag" style="background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">{{ m.settleMode || 'D0' }}</span></td>
                <td>
                  <span v-for="c in m.connectedChannels" :key="c" class="tag" style="margin-right: 4px;">{{ c }}</span>
                </td>
                <td>
                  <span class="status-badge" :class="m.active ? 'status-success' : 'status-disabled'">
                    {{ m.active ? '🟢 啟用' : '🔴 停用' }}
                  </span>
                </td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-warning" style="padding: 4px 8px; font-size:12px;" @click="openConfigModal(m)">⚙️ 調整配置</button>
                    <button class="btn btn-primary" style="padding: 4px 8px; font-size:12px;" @click="openBalanceModal(m)">✏️ 餘額調整</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. 總跑量結算 -->
        <div v-else-if="isSettlementMenu" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3 style="margin:0;">📊 總跑量結算 - {{ currentSettlementTitle }}</h3>
            <div style="display:flex; gap:10px;">
              <input type="date" v-model="filterDate" class="input-control" />
              <button class="btn btn-success" @click="exportCSV(currentSettlementTitle + '.csv')">📥 導出紀錄 CSV</button>
            </div>
          </div>

          <div v-if="activeMenu === 'settlement_logs'">
            <h4>📜 結算明細變動紀錄</h4>
            <table class="data-table">
              <thead>
                <tr><th>時間</th><th>商戶</th><th>類型</th><th>變動前</th><th>金額</th><th>變動後</th><th>理由</th></tr>
              </thead>
              <tbody>
                <tr v-for="l in balanceLogs" :key="l.id">
                  <td>{{ l.time }}</td><td>{{ l.merchantName }}</td><td><span class="tag">{{ l.type }}</span></td>
                  <td>￥{{ l.beforeBal }}</td><td style="color:#52c41a; font-weight:bold;">+￥{{ l.changeAmt }}</td>
                  <td>￥{{ l.afterBal }}</td><td>{{ l.reason }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else>
            <div class="card-grid">
              <div class="card"><div class="card-title">總代收跑量</div><div class="card-value" style="color:#52c41a;">￥{{ totalCollect.toLocaleString() }}</div></div>
              <div class="card"><div class="card-title">總代付跑量</div><div class="card-value" style="color:#fa8c16;">￥{{ totalPayout.toLocaleString() }}</div></div>
            </div>
            <table class="data-table">
              <thead>
                <tr><th>日期</th><th>項目分類</th><th>代收跑量</th><th>代付跑量</th><th>淨跑量</th></tr>
              </thead>
              <tbody>
                <tr v-for="(r, idx) in runSummaryList" :key="idx">
                  <td>{{ r.date }}</td><td><strong>{{ r.merchant }} / {{ r.channel }}</strong></td>
                  <td style="color:#52c41a;">￥{{ r.collectAmt.toLocaleString() }}</td>
                  <td style="color:#fa8c16;">￥{{ r.payoutAmt.toLocaleString() }}</td>
                  <td style="color:#1890ff; font-weight:bold;">￥{{ (r.collectAmt - r.payoutAmt).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- 彈窗 1：新增商戶 (含 D0/T1 選擇) -->
    <div v-if="showAddMerchantModal" class="modal-backdrop">
      <div class="modal-box" style="width: 500px;">
        <h3 style="margin-top:0; color: #1890ff;">➕ 新增商戶</h3>
        
        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label>商戶號 (可自訂)：</label>
            <input type="text" v-model="newMerchant.id" class="input-control" placeholder="例: MCH-1003">
          </div>
          <div class="form-group" style="flex:1;">
            <label>商戶名稱：</label>
            <input type="text" v-model="newMerchant.name" class="input-control" placeholder="輸入商戶名稱">
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label>代收費率 (%)：</label>
            <input type="number" v-model.number="newMerchant.collectFeeRate" step="0.01" class="input-control">
          </div>
          <div class="form-group" style="flex:1;">
            <label>代付費率 (%)：</label>
            <input type="number" v-model.number="newMerchant.payoutFeeRate" step="0.01" class="input-control">
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label>單筆最小限額：</label>
            <input type="number" v-model.number="newMerchant.minLimit" class="input-control">
          </div>
          <div class="form-group" style="flex:1;">
            <label>單筆最大限額：</label>
            <input type="number" v-model.number="newMerchant.maxLimit" class="input-control">
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label>結算模式：</label>
            <select v-model="newMerchant.settleMode" class="input-control">
              <option value="D0">D0 (當日即時結算)</option>
              <option value="T1">T1 (次工作日結算)</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;">
            <label>商戶啟用狀態：</label>
            <select v-model="newMerchant.active" class="input-control">
              <option :value="true">🟢 啟用 (正常營運)</option>
              <option :value="false">🔴 停用 (暫停交易)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>渠道產品串接選項：</label>
          <div style="display:flex; gap:12px; margin-top: 6px;">
            <label v-for="ch in availableChannels" :key="ch" style="font-size:13px; cursor:pointer;">
              <input type="checkbox" :value="ch" v-model="newMerchant.connectedChannels"> {{ ch }}
            </label>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button class="btn" @click="showAddMerchantModal = false">取消</button>
          <button class="btn btn-primary" @click="confirmAddMerchant">確認新增</button>
        </div>
      </div>
    </div>

    <!-- 彈窗 2：調整商戶配置小窗框 -->
    <div v-if="showConfigModal" class="modal-backdrop">
      <div class="modal-box" style="width: 500px;">
        <h3 style="margin-top:0; color: #fa8c16;">⚙️ 調整商戶配置 ({{ editingMerchant?.id }})</h3>

        <div class="form-group">
          <label>商戶名稱：</label>
          <input type="text" v-model="editingMerchant.name" class="input-control">
        </div>

        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label>代收費率 (%)：</label>
            <input type="number" v-model.number="editingMerchant.collectFeeRate" step="0.01" class="input-control">
          </div>
          <div class="form-group" style="flex:1;">
            <label>代付費率 (%)：</label>
            <input type="number" v-model.number="editingMerchant.payoutFeeRate" step="0.01" class="input-control">
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label>單筆最小限額：</label>
            <input type="number" v-model.number="editingMerchant.minLimit" class="input-control">
          </div>
          <div class="form-group" style="flex:1;">
            <label>單筆最大限額：</label>
            <input type="number" v-model.number="editingMerchant.maxLimit" class="input-control">
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label>結算模式：</label>
            <select v-model="editingMerchant.settleMode" class="input-control">
              <option value="D0">D0 (當日即時結算)</option>
              <option value="T1">T1 (次工作日結算)</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;">
            <label>商戶啟用狀態：</label>
            <select v-model="editingMerchant.active" class="input-control">
              <option :value="true">🟢 啟用 (正常營運)</option>
              <option :value="false">🔴 停用 (暫停交易)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>渠道產品串接選項：</label>
          <div style="display:flex; gap:12px; margin-top: 6px;">
            <label v-for="ch in availableChannels" :key="ch" style="font-size:13px; cursor:pointer;">
              <input type="checkbox" :value="ch" v-model="editingMerchant.connectedChannels"> {{ ch }}
            </label>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button class="btn" @click="showConfigModal = false">取消</button>
          <button class="btn btn-warning" @click="saveMerchantConfig">儲存配置</button>
        </div>
      </div>
    </div>

    <!-- 彈窗 3：商戶餘額調整 -->
    <div v-if="showBalanceModal" class="modal-backdrop">
      <div class="modal-box">
        <h3 style="margin-top:0; color: #1890ff;">✏️ 商戶餘額調整</h3>
        <p>商戶：<strong>{{ selectedMerchantForBalance?.name }}</strong></p>
        <div class="form-group">
          <label>金額 (正數增加 / 負數扣除)：</label>
          <input type="number" v-model.number="balanceAdjustAmount" class="input-control" placeholder="例: 5000">
        </div>
        <div class="form-group">
          <label>調整理由：</label>
          <input type="text" v-model="balanceAdjustReason" class="input-control" placeholder="請輸入理由">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button class="btn" @click="showBalanceModal = false">取消</button>
          <button class="btn btn-primary" @click="confirmBalanceAdjust">確認調整</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      activeMenu: 'merchant_list',
      openSubMenus: ['channel_group', 'supplier_group', 'collect_group', 'payout_group', 'settlement_group'],
      filterDate: '',

      searchQuery: {
        mchNo: '',
        sysNo: '',
        supNo: '',
        dateType: 'day',
        selectedDate: '2026-08-13'
      },

      showAddMerchantModal: false,
      availableChannels: ['微信支付直連', '支付寶原生', '銀聯快速代付'],
      newMerchant: {
        id: '',
        name: '',
        rawBalance: 0,
        collectFeeRate: 0.8,
        payoutFeeRate: 0.5,
        minLimit: 100,
        maxLimit: 50000,
        settleMode: 'D0',
        connectedChannels: ['微信支付直連', '支付寶原生'],
        active: true
      },

      showConfigModal: false,
      editingMerchant: null,

      showBalanceModal: false,
      selectedMerchantForBalance: null,
      balanceAdjustAmount: 0,
      balanceAdjustReason: '',

      menuItems: [
        {
          key: 'channel_group',
          label: '⚙️ 渠道',
          children: [
            { key: 'channel_weight', label: '渠道權重' },
            { key: 'channel_toggle', label: '渠道開關' }
          ]
        },
        {
          key: 'supplier_group',
          label: '🏭 供應商訂單查詢',
          children: [
            { key: 'sup_collect', label: '供應商代收訂單' },
            { key: 'sup_collect_exact', label: '供應商代收訂單(精準)' },
            { key: 'sup_payout', label: '供應商代付訂單' },
            { key: 'sup_payout_exact', label: '供應商代付訂單(精準)' }
          ]
        },
        {
          key: 'collect_group',
          label: '📥 代收訂單查詢',
          children: [
            { key: 'collect_orders', label: '代收訂單查詢' },
            { key: 'collect_exact', label: '代收訂單查詢(精準)' }
          ]
        },
        {
          key: 'payout_group',
          label: '📤 代付訂單查詢',
          children: [
            { key: 'payout_orders', label: '代付訂單查詢' },
            { key: 'payout_exact', label: '代付訂單查詢(精準)' }
          ]
        },
        { key: 'merchant_list', label: '🏢 商戶列表' },
        {
          key: 'settlement_group',
          label: '📊 總跑量結算',
          children: [
            { key: 'settlement_channel_total', label: '渠道總跑量' },
            { key: 'settlement_channel_single', label: '渠道個跑量' },
            { key: 'settlement_collect', label: '代收跑量' },
            { key: 'settlement_payout', label: '代付跑量' },
            { key: 'settlement_merchant_single', label: '商戶個跑量' },
            { key: 'settlement_merchant_total', label: '商戶總跑量' },
            { key: 'settlement_logs', label: '📜 結算明細' }
          ]
        }
      ],

      channels: [
        { id: 'CHN-01', name: '微信支付直連', type: '代收', weight: 60, minLimit: 100, maxLimit: 50000, active: true },
        { id: 'CHN-02', name: '支付寶原生', type: '代收', weight: 40, minLimit: 100, maxLimit: 50000, active: true },
        { id: 'CHN-03', name: '銀聯快速代付', type: '代付', weight: 100, minLimit: 500, maxLimit: 50000, active: true }
      ],

      merchants: [
        { id: 'MCH-1001', name: '閃電電商', rawBalance: 158200.00, collectFeeRate: 0.8, payoutFeeRate: 0.5, minLimit: 100, maxLimit: 50000, settleMode: 'D0', connectedChannels: ['微信支付直連', '支付寶原生'], active: true },
        { id: 'MCH-1002', name: '海淘優選', rawBalance: 42100.00, collectFeeRate: 0.75, payoutFeeRate: 0.45, minLimit: 100, maxLimit: 50000, settleMode: 'T1', connectedChannels: ['銀聯快速代付'], active: true }
      ],

      supCollectList: [
        { mchNo: 'MCH202608130001', sysNo: 'SYS-C-88101', supNo: 'SUP-WX-9981', date: '2026-08-13 10:20', supplier: '匯通通道', amount: 85000, status: '成功' }
      ],

      supPayoutList: [
        { mchNo: 'MCH202608130099', sysNo: 'SYS-P-99201', supNo: 'SUP-UNION-112', date: '2026-08-13 11:45', supplier: '銀聯極速', amount: 45000, status: '成功' }
      ],

      collectList: [
        { time: '2026-08-13 10:12:00', mchNo: 'MCH202608130001', sysNo: 'SYS-C-88101', supNo: 'SUP-WX-9981', merchant: '閃電電商', amount: 5000, status: '支付成功' }
      ],

      payoutList: [
        { time: '2026-08-13 11:05:22', mchNo: 'MCH202608130099', sysNo: 'SYS-P-99201', supNo: 'SUP-UNION-112', merchant: '海淘優選', amount: 20000, status: '打款成功' }
      ],

      runSummaryList: [
        { date: '2026-08-13', merchant: '閃電電商', channel: '微信支付', collectAmt: 158200, payoutAmt: 50000 },
        { date: '2026-08-13', merchant: '海淘優選', channel: '支付寶', collectAmt: 89300, payoutAmt: 20000 }
      ],

      balanceLogs: [
        { id: 'LOG-01', time: '2026-08-13 09:00:00', merchantName: '閃電電商', type: '手動充值', beforeBal: 108200, changeAmt: 50000, afterBal: 158200, reason: '線上轉帳充值' }
      ]
    }
  },
  computed: {
    isSupplierQueryMenu() { return this.activeMenu.startsWith('sup_'); },
    isCollectQueryMenu() { return this.activeMenu.startsWith('collect_'); },
    isPayoutQueryMenu() { return this.activeMenu.startsWith('payout_'); },
    isSettlementMenu() { return this.activeMenu.startsWith('settlement_'); },

    activeSupplierList() {
      return this.isPayoutMenu(this.activeMenu) ? this.supPayoutList : this.supCollectList;
    },

    currentSettlementTitle() {
      const titles = {
        settlement_channel_total: '渠道總跑量',
        settlement_channel_single: '渠道個跑量',
        settlement_collect: '代收跑量',
        settlement_payout: '代付跑量',
        settlement_merchant_single: '商戶個跑量',
        settlement_merchant_total: '商戶總跑量',
        settlement_logs: '結算明細'
      };
      return titles[this.activeMenu] || '跑量統計';
    },
    totalCollect() { return this.runSummaryList.reduce((s, i) => s + i.collectAmt, 0); },
    totalPayout() { return this.runSummaryList.reduce((s, i) => s + i.payoutAmt, 0); }
  },
  methods: {
    toggleSubMenu(key) {
      const index = this.openSubMenus.indexOf(key);
      if (index > -1) this.openSubMenus.splice(index, 1);
      else this.openSubMenus.push(key);
    },
    isChildActive(parentItem) {
      if (!parentItem.children) return false;
      return parentItem.children.some(child => child.key === this.activeMenu);
    },
    isPayoutMenu(key) {
      return key.includes('payout');
    },
    getMenuTitle(key) {
      const map = {
        sup_collect: '供應商代收訂單',
        sup_collect_exact: '供應商代收訂單 (精準)',
        sup_payout: '供應商代付訂單',
        sup_payout_exact: '供應商代付訂單 (精準)',
        collect_orders: '代收訂單查詢',
        collect_exact: '代收訂單 (精準)',
        payout_orders: '代付訂單查詢',
        payout_exact: '代付訂單 (精準)'
      };
      return map[key] || '訂單查詢';
    },

    openAddMerchantModal() {
      const defaultId = `MCH-${1000 + this.merchants.length + 1}`;
      this.newMerchant = {
        id: defaultId,
        name: '',
        rawBalance: 0,
        collectFeeRate: 0.8,
        payoutFeeRate: 0.5,
        minLimit: 100,
        maxLimit: 50000,
        settleMode: 'D0',
        connectedChannels: ['微信支付直連', '支付寶原生'],
        active: true
      };
      this.showAddMerchantModal = true;
    },
    confirmAddMerchant() {
      if (!this.newMerchant.id) return alert('請輸入商戶號！');
      if (!this.newMerchant.name) return alert('請輸入商戶名稱！');

      this.merchants.push({ ...this.newMerchant, rawBalance: 0 });
      alert(`商戶 [${this.newMerchant.name}] (${this.newMerchant.id}) 新增成功！`);
      this.showAddMerchantModal = false;
    },

    openConfigModal(m) {
      // 複製一份資料進行編輯
      this.editingMerchant = JSON.parse(JSON.stringify(m));
      this.showConfigModal = true;
    },
    saveMerchantConfig() {
      const idx = this.merchants.findIndex(m => m.id === this.editingMerchant.id);
      if (idx !== -1) {
        this.merchants[idx] = { ...this.editingMerchant };
        alert(`商戶 [${this.editingMerchant.name}] 配置儲存成功！`);
      }
      this.showConfigModal = false;
    },

    handleExactSearch(type) {
      alert(`[${type}] 查詢條件：\n` +
            `商戶號: ${this.searchQuery.mchNo || '全部'}\n` +
            `系統單號: ${this.searchQuery.sysNo || '全部'}\n` +
            `供應商單號: ${this.searchQuery.supNo || '無'}\n` +
            `時間類型: ${this.searchQuery.dateType === 'day' ? '按日' : '按月'} (${this.searchQuery.selectedDate})`);
    },
    saveChannelWeight(c) {
      alert(`渠道 [${c.name}] 權重已更新為：${c.weight}`);
    },
    openBalanceModal(m) {
      this.selectedMerchantForBalance = m;
      this.balanceAdjustAmount = 0;
      this.balanceAdjustReason = '';
      this.showBalanceModal = true;
    },
    confirmBalanceAdjust() {
      if (!this.balanceAdjustAmount) return alert('請輸入金額');
      const m = this.selectedMerchantForBalance;
      m.rawBalance += Number(this.balanceAdjustAmount);
      alert('餘額調整完畢！');
      this.showBalanceModal = false;
    },
    exportCSV(filename) {
      alert(`已成功導出 CSV 檔案：${filename}`);
    }
  }
})

// 自動注入樣式
const style = document.createElement('style')
style.innerHTML = `
  * { box-sizing: border-box; }
  .layout-container { display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f4f7f9; }
  
  .sidebar { width: 240px; background: #e8f3ff; color: #2c3e50; flex-shrink: 0; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid #d0e3f7; }
  .sidebar-logo { padding: 20px 16px; font-size: 18px; font-weight: bold; color: #1890ff; border-bottom: 1px solid #d0e3f7; background: #dbeeff; }
  .sidebar-menu { padding: 12px 0; }
  
  .menu-item { padding: 12px 18px; cursor: pointer; font-size: 14px; color: #4a607a; transition: 0.2s; font-weight: 500; display: flex; justify-content: space-between; align-items: center; }
  .menu-item:hover { background: #d0e5fc; color: #1890ff; }
  .menu-item.active { background: #1890ff; color: #ffffff; font-weight: bold; }
  
  .arrow-icon { font-size: 10px; transition: transform 0.2s; }
  .arrow-icon.open { transform: rotate(180deg); }
  .submenu-container { background: #dcf0ff; }
  .submenu-item { padding: 10px 10px 10px 32px; cursor: pointer; font-size: 13px; color: #3b536f; transition: 0.2s; }
  .submenu-item:hover { background: #cce5fd; color: #1890ff; }
  .submenu-item.active { background: #1890ff; color: #ffffff; font-weight: bold; }

  .sidebar-footer { padding: 16px; font-size: 12px; color: #8a9ba8; border-top: 1px solid #d0e3f7; text-align: left; }

  .main-content { flex: 1; padding: 24px; overflow-y: auto; }
  .card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
  .card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); border: 1px solid #eef2f5; }
  .card-title { color: #8c8c8c; font-size: 13px; }
  .card-value { font-size: 24px; font-weight: bold; margin-top: 6px; }
  
  .search-box-group { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .search-box-group .input-control { width: 160px; }

  .data-table { width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px; }
  .data-table th { background: #f7fafc; border-bottom: 2px solid #edf2f7; padding: 12px; font-size: 14px; color: #4a5568; }
  .data-table td { padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; }
  
  .tag { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
  .status-badge { padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  .status-success { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
  .status-disabled { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }

  .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; }
  .modal-box { background: #fff; border-radius: 8px; width: 440px; padding: 24px; }
  .form-group { margin-bottom: 14px; }
  .form-group label { display: block; margin-bottom: 6px; font-size: 13px; color: #4a5568; }
  .input-control { padding: 7px 10px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 14px; outline: none; width: 100%; }
  
  .btn { padding: 7px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
  .btn-primary { background: #1890ff; color: #fff; }
  .btn-warning { background: #fa8c16; color: #fff; }
  .btn-success { background: #52c41a; color: #fff; }
  .btn-danger { background: #f5222d; color: #fff; }
`
document.head.appendChild(style)

app.use(ElementPlus)
app.mount('#app')
