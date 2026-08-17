import { createApp } from 'vue/dist/vue.esm-bundler.js'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  template: `
    <!-- 1. 登入頁面 (含圖形驗證碼) -->
    <div v-if="!isLoggedIn" class="login-wrapper" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f2f5;">
      <div class="card" style="width: 400px; padding: 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #fff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; color: #1890ff; font-size: 24px;">💳 BCPay 管理後台</h2>
          <p style="color: #8c8c8c; font-size: 13px; margin-top: 6px;">聚合支付管理系統 v3.0</p>
        </div>

        <form @submit.prevent="handleLogin">
          <!-- 帳號 -->
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #333;">管理員帳號</label>
            <input type="text" v-model="loginForm.username" class="input-control" placeholder="請輸入帳號" required style="width: 100%; box-sizing: border-box;" />
          </div>

          <!-- 密碼 -->
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #333;">密碼</label>
            <input type="password" v-model="loginForm.password" class="input-control" placeholder="請輸入密碼" required style="width: 100%; box-sizing: border-box;" />
          </div>

          <!-- 圖形驗證碼 (Captcha) -->
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #333;">安全驗證碼</label>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="text" v-model="loginForm.captchaInput" class="input-control" placeholder="輸入 4 位驗證碼" maxlength="4" required style="flex: 1;" />
              <!-- 驗證碼 Canvas -->
              <canvas ref="captchaCanvas" width="110" height="38" @click="refreshCaptcha" style="border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer;" title="點擊刷新驗證碼"></canvas>
            </div>
          </div>

          <!-- 2FA Authenticator 驗證碼 (選填/啟用時必須) -->
          <div v-if="is2FAEnabled" class="form-group" style="margin-bottom: 20px; background: #e6f7ff; padding: 10px; border-radius: 6px; border: 1px solid #91d5ff;">
            <label style="display: block; margin-bottom: 4px; font-weight: bold; color: #1890ff;">🔐 2FA 動態驗證碼 (Authenticator)</label>
            <input type="text" v-model="loginForm.twoFACode" class="input-control" placeholder="請輸入 6 位數 Authenticator 碼" maxlength="6" style="width: 100%; text-align: center; letter-spacing: 2px; box-sizing: border-box;" />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; height: 40px; font-size: 16px; margin-top: 8px;">立即登入</button>
        </form>
      </div>
    </div>

    <!-- 2. 後台主系統畫面 -->
    <div v-else class="layout-container">
      <!-- 左側選單欄 -->
      <div class="sidebar">
        <div>
          <div class="sidebar-logo" style="display: flex; justify-content: space-between; align-items: center;">
            <span>💳 BCPay 系統</span>
            <button class="btn btn-danger" style="padding: 2px 8px; font-size: 11px;" @click="handleLogout">登出</button>
          </div>
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
        <div class="sidebar-footer">
          <div>v3.0.0 (Google 2FA)</div>
          <a href="javascript:void(0)" @click="handleLogout" style="color: #ff4d4f; font-size: 12px; text-decoration: none;">🚪 安全登出系統</a>
        </div>
      </div>

      <!-- 主內容區 -->
      <div class="main-content">
        
        <!-- 0. Google Authenticator 設定頁面 -->
        <div v-if="activeMenu === 'security_2fa'" class="card" style="max-width: 650px;">
          <h3 style="margin-top:0; color: #1890ff;">🔐 Google Authenticator (2FA 雙重驗證)</h3>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            綁定 Google Authenticator 可為管理後台提供額外的安全保護。啟用後，執行資金變動、餘額調整及關鍵操作時，需要輸入 6 位數動態驗證碼。
          </p>

          <div style="background: #fafafa; border: 1px solid #f0f0f0; padding: 20px; border-radius: 8px; margin-top: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <span style="font-weight: bold; font-size: 15px;">2FA 驗證狀態：</span>
              <span class="status-badge" :class="is2FAEnabled ? 'status-success' : 'status-disabled'">
                {{ is2FAEnabled ? '🟢 已綁定並啟用' : '🔴 未啟用' }}
              </span>
            </div>

            <div v-if="!is2FAEnabled" style="text-align: center; padding: 10px 0;">
              <div style="margin-bottom: 12px; font-weight: bold; color: #333;">請使用 Google Authenticator / Authy 掃描下方 QR Code：</div>
              
              <div style="background: #fff; border: 1px solid #ddd; padding: 12px; display: inline-block; border-radius: 6px;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/BCPay:admin@bcpay.com?secret=JBSWY3DPEHPK3PXP&issuer=BCPay" alt="2FA QR Code" width="150" height="150" />
              </div>
              
              <div style="margin-top: 10px; font-size: 13px; color: #666;">
                手動密鑰 (Secret Key)：<code style="background: #e6f7ff; color: #1890ff; padding: 2px 6px; border-radius: 4px;">JBSWY3DPEHPK3PXP</code>
              </div>

              <div style="margin-top: 20px; display: flex; justify-content: center; gap: 10px; align-items: center;">
                <input type="text" v-model="bind2FACode" placeholder="輸入 6 位數 Authenticator 驗證碼" class="input-control" style="width: 240px; text-align: center; font-size: 16px; letter-spacing: 2px;" maxlength="6" />
                <button class="btn btn-primary" @click="enable2FA">驗證並綁定 2FA</button>
              </div>
            </div>

            <div v-else style="padding: 10px 0;">
              <p style="color: #52c41a; font-weight: bold;">✅ 您已成功綁定 Google Authenticator。</p>
              <p style="color: #666; font-size: 13px;">綁定時間：2026-08-17 18:30:00 (管理員帳號)</p>
              <button class="btn btn-danger" style="margin-top: 10px;" @click="disable2FA">解除 2FA 綁定</button>
            </div>
          </div>
        </div>

        <!-- 1-1. 渠道權重 -->
        <div v-if="activeMenu === 'channel_weight'" class="card">
          <h3 style="margin-top:0;">⚙️ 渠道權重設定 (含東南亞/GCash)</h3>
          <table class="data-table">
            <thead>
              <tr><th>渠道名稱</th><th>類型 / 幣別</th><th>當前權重 (1-100)</th><th>分流比例</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="c in channels" :key="c.id">
                <td><strong>{{ c.name }}</strong></td>
                <td><span class="tag">{{ c.type }} ({{ c.currency }})</span></td>
                <td><input type="number" v-model.number="c.weight" class="input-control" style="width:80px;" /></td>
                <td><span class="tag">{{ c.weight }}%</span></td>
                <td><button class="btn btn-primary" @click="saveChannelWeight(c)">儲存權重</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 1-2. 渠道開關 -->
        <div v-if="activeMenu === 'channel_toggle'" class="card">
          <h3 style="margin-top:0;">🔌 渠道狀態與 API 模式開關</h3>
          <table class="data-table">
            <thead>
              <tr><th>渠道 ID</th><th>渠道名稱</th><th>對接方式 / 幣別</th><th>單筆限額</th><th>當前狀態</th><th>切換開關</th></tr>
            </thead>
            <tbody>
              <tr v-for="c in channels" :key="c.id">
                <td><code>{{ c.id }}</code></td>
                <td><strong>{{ c.name }}</strong></td>
                <td><span class="tag">{{ c.provider }} / {{ c.currency }}</span></td>
                <td>{{ c.currency === 'PHP' ? '₱' : '￥' }}{{ c.minLimit }} - {{ c.currency === 'PHP' ? '₱' : '￥' }}{{ c.maxLimit }}</td>
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

        <!-- 2. 供應商訂單查詢 -->
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
            
            <button class="btn btn-primary" @click="resetSearch">🧹 重置</button>
          </div>

          <table class="data-table">
            <thead>
              <tr><th>時間</th><th>商戶訂單號</th><th>系統訂單號</th><th>供應商訂單號</th><th>供應商 / 通道</th><th>金額</th><th>狀態</th></tr>
            </thead>
            <tbody>
              <tr v-for="o in filteredSupplierList" :key="o.sysNo">
                <td>{{ o.date }}</td>
                <td><code>{{ o.mchNo }}</code></td>
                <td><code>{{ o.sysNo }}</code></td>
                <td><code>{{ o.supNo }}</code></td>
                <td>{{ o.supplier }}</td>
                <td :style="{ color: isPayoutMenu(activeMenu) ? '#fa8c16' : '#52c41a', fontWeight: 'bold' }">{{ o.currency === 'PHP' ? '₱' : '￥' }}{{ o.amount.toLocaleString() }}</td>
                <td><span class="status-badge status-success">{{ o.status }}</span></td>
              </tr>
              <tr v-if="filteredSupplierList.length === 0">
                <td colspan="7" style="text-align:center; color:#999; padding:24px;">未找到符合條件的訂單數據</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. 代收訂單查詢 -->
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
            
            <button class="btn btn-primary" @click="resetSearch">🧹 重置</button>
          </div>

          <table class="data-table">
            <thead>
              <tr><th>時間</th><th>商戶訂單號</th><th>系統訂單號</th><th>供應商訂單號</th><th>商戶</th><th>金額</th><th>狀態</th></tr>
            </thead>
            <tbody>
              <tr v-for="o in filteredCollectList" :key="o.sysNo">
                <td style="font-size:12px; color:#666;">{{ o.time }}</td>
                <td><code>{{ o.mchNo }}</code></td>
                <td><code>{{ o.sysNo }}</code></td>
                <td><code>{{ o.supNo }}</code></td>
                <td>{{ o.merchant }}</td>
                <td style="color:#52c41a; font-weight:bold;">{{ o.currency === 'PHP' ? '₱' : '￥' }}{{ o.amount.toLocaleString() }}</td>
                <td><span class="status-badge status-success">{{ o.status }}</span></td>
              </tr>
              <tr v-if="filteredCollectList.length === 0">
                <td colspan="7" style="text-align:center; color:#999; padding:24px;">未找到符合條件的訂單數據</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 4. 代付訂單查詢 (包含 GCash 錢包出款) -->
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
            
            <button class="btn btn-primary" @click="resetSearch">🧹 重置</button>
          </div>

          <table class="data-table">
            <thead>
              <tr><th>時間</th><th>商戶訂單號</th><th>系統訂單號</th><th>供應商訂單號</th><th>接收帳號 (GCash/卡號)</th><th>商戶</th><th>金額</th><th>狀態</th></tr>
            </thead>
            <tbody>
              <tr v-for="o in filteredPayoutList" :key="o.sysNo">
                <td style="font-size:12px; color:#666;">{{ o.time }}</td>
                <td><code>{{ o.mchNo }}</code></td>
                <td><code>{{ o.sysNo }}</code></td>
                <td><code>{{ o.supNo }}</code></td>
                <td><code>{{ o.targetAccount || '-' }}</code></td>
                <td>{{ o.merchant }}</td>
                <td style="color:#fa8c16; font-weight:bold;">{{ o.currency === 'PHP' ? '₱' : '￥' }}{{ o.amount.toLocaleString() }}</td>
                <td><span class="status-badge status-success">{{ o.status }}</span></td>
              </tr>
              <tr v-if="filteredPayoutList.length === 0">
                <td colspan="8" style="text-align:center; color:#999; padding:24px;">未找到符合條件的訂單數據</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5. 商戶列表 & 配置調整 -->
        <div v-else-if="activeMenu === 'merchant_list'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h3 style="margin: 0;">🏢 商戶列表與配置管理</h3>
            <button class="btn btn-primary" @click="openAddMerchantModal">➕ 新增商戶</button>
          </div>

          <div class="search-box-group" style="margin-bottom: 20px; background: #fafafa; padding: 12px; border-radius: 6px; border: 1px solid #f0f0f0;">
            <label style="font-weight: bold; color: #4a5568;">🔍 篩選商戶名：</label>
            <select v-model="selectedMerchantFilter" class="input-control" style="width: 240px; background-color: #fff;">
              <option value="">-- 所有商戶名 (全部) --</option>
              <option v-for="name in allMerchantNames" :key="name" :value="name">
                {{ name }}
              </option>
            </select>
            <button v-if="selectedMerchantFilter" class="btn" style="background:#e0e0e0; color:#333;" @click="selectedMerchantFilter = ''">重置篩選</button>
          </div>

          <table class="data-table">
            <thead>
              <tr><th>商戶 ID</th><th>商戶名稱</th><th>目前餘額</th><th>費率 (代收/代付)</th><th>單筆限額</th><th>結算模式</th><th>已串渠道</th><th>狀態</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="m in filteredMerchants" :key="m.id">
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
              <tr v-if="filteredMerchants.length === 0">
                <td colspan="9" style="text-align:center; color:#999; padding:24px;">查無符合「{{ selectedMerchantFilter }}」的商戶資料</td>
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
              <div class="card"><div class="card-title">總代收跑量 (CNY)</div><div class="card-value" style="color:#52c41a;">￥{{ totalCollect.toLocaleString() }}</div></div>
              <div class="card"><div class="card-title">總代付跑量 (CNY)</div><div class="card-value" style="color:#fa8c16;">￥{{ totalPayout.toLocaleString() }}</div></div>
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

    <!-- 彈窗 1：新增商戶 -->
    <div v-if="showAddMerchantModal" class="modal-backdrop">
      <div class="modal-box" style="width: 500px;">
        <h3 style="margin-top:0; color: #1890ff;">➕ 新增商戶</h3>
        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;"><label>商戶號：</label><input type="text" v-model="newMerchant.id" class="input-control" placeholder="例: MCH-1003"></div>
          <div class="form-group" style="flex:1;"><label>商戶名稱：</label><input type="text" v-model="newMerchant.name" class="input-control" placeholder="輸入商戶名稱"></div>
        </div>
        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;"><label>代收費率 (%)：</label><input type="number" v-model.number="newMerchant.collectFeeRate" step="0.01" class="input-control"></div>
          <div class="form-group" style="flex:1;"><label>代付費率 (%)：</label><input type="number" v-model.number="newMerchant.payoutFeeRate" step="0.01" class="input-control"></div>
        </div>
        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;"><label>結算模式：</label>
            <select v-model="newMerchant.settleMode" class="input-control">
              <option value="D0">D0 (當日即時結算)</option>
              <option value="T1">T1 (次工作日結算)</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;"><label>商戶啟用狀態：</label>
            <select v-model="newMerchant.active" class="input-control">
              <option :value="true">🟢 啟用</option>
              <option :value="false">🔴 停用</option>
            </select>
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
        <div class="form-group"><label>商戶名稱：</label><input type="text" v-model="editingMerchant.name" class="input-control"></div>
        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;"><label>代收費率 (%)：</label><input type="number" v-model.number="editingMerchant.collectFeeRate" step="0.01" class="input-control"></div>
          <div class="form-group" style="flex:1;"><label>代付費率 (%)：</label><input type="number" v-model.number="editingMerchant.payoutFeeRate" step="0.01" class="input-control"></div>
        </div>
        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;"><label>結算模式：</label>
            <select v-model="editingMerchant.settleMode" class="input-control">
              <option value="D0">D0 (當日即時結算)</option>
              <option value="T1">T1 (次工作日結算)</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;"><label>商戶啟用狀態：</label>
            <select v-model="editingMerchant.active" class="input-control">
              <option :value="true">🟢 啟用</option>
              <option :value="false">🔴 停用</option>
            </select>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
          <button class="btn" @click="showConfigModal = false">取消</button>
          <button class="btn btn-warning" @click="saveMerchantConfig">儲存配置</button>
        </div>
      </div>
    </div>

    <!-- 彈窗 3：商戶餘額調整 (含 Authenticator 2FA 雙重驗證) -->
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

        <div v-if="is2FAEnabled" class="form-group" style="background:#e6f7ff; padding:10px; border-radius:6px; border:1px solid #91d5ff;">
          <label style="color:#1890ff; font-weight:bold;">🔐 Authenticator 6 位數動態驗證碼：</label>
          <input type="text" v-model="input2FACode" class="input-control" placeholder="請查看手機 App 輸入" maxlength="6" style="text-align:center; font-size:16px; letter-spacing:2px; margin-top:4px;">
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
      // 登入狀態控制 (預設 false 顯示登入畫面)
      isLoggedIn: false,
      loginForm: {
        username: 'admin',
        password: '',
        captchaInput: '',
        twoFACode: ''
      },
      currentCaptchaCode: '',

      activeMenu: 'security_2fa',
      openSubMenus: ['channel_group', 'supplier_group', 'collect_group', 'payout_group', 'settlement_group'],
      filterDate: '',

      // 2FA / Authenticator 狀態
      is2FAEnabled: true,
      bind2FACode: '',
      input2FACode: '',

      selectedMerchantFilter: '',

      searchQuery: {
        mchNo: '',
        sysNo: '',
        supNo: '',
        dateType: 'day',
        selectedDate: ''
      },

      showAddMerchantModal: false,
      newMerchant: { id: '', name: '', rawBalance: 0, collectFeeRate: 0.8, payoutFeeRate: 0.5, minLimit: 100, maxLimit: 50000, settleMode: 'D0', connectedChannels: ['GCash (Xendit)'], active: true },

      showConfigModal: false,
      editingMerchant: null,

      showBalanceModal: false,
      selectedMerchantForBalance: null,
      balanceAdjustAmount: 0,
      balanceAdjustReason: '',

      menuItems: [
        { key: 'security_2fa', label: '🔐 安全設定 (2FA)' },
        {
          key: 'channel_group',
          label: '⚙️ 渠道與東南亞設置',
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
        { id: 'CHN-01', name: 'GCash (Xendit)', type: '代收', provider: 'Xendit Gateway', currency: 'PHP', weight: 50, minLimit: 100, maxLimit: 50000, active: true },
        { id: 'CHN-02', name: 'GCash Direct Payout', type: '代付', provider: 'Xendit Disbursement', currency: 'PHP', weight: 50, minLimit: 100, maxLimit: 50000, active: true },
        { id: 'CHN-03', name: 'PayMaya Native', type: '代收', provider: 'Maya Direct', currency: 'PHP', weight: 30, minLimit: 100, maxLimit: 30000, active: true },
        { id: 'CHN-04', name: '微信支付直連', type: '代收', provider: 'WeChat Pay', currency: 'CNY', weight: 60, minLimit: 100, maxLimit: 50000, active: true }
      ],

      merchants: [
        { id: 'MCH-1001', name: '菲律賓跨境跨境電商', rawBalance: 285000.00, collectFeeRate: 1.2, payoutFeeRate: 0.8, minLimit: 100, maxLimit: 50000, settleMode: 'D0', connectedChannels: ['GCash (Xendit)', 'PayMaya Native'], active: true },
        { id: 'MCH-1002', name: '海淘優選', rawBalance: 42100.00, collectFeeRate: 0.75, payoutFeeRate: 0.45, minLimit: 100, maxLimit: 50000, settleMode: 'T1', connectedChannels: ['微信支付直連'], active: true }
      ],

      collectList: [
        { time: '2026-08-13 10:12:00', mchNo: 'MCH202608130001', sysNo: 'SYS-C-88101', supNo: 'SUP-GCASH-9981', currency: 'PHP', merchant: '菲律賓跨境跨境電商', amount: 3500, status: '支付成功' },
        { time: '2026-08-13 10:25:14', mchNo: 'MCH202608130002', sysNo: 'SYS-C-88102', supNo: 'SUP-MAYA-8822', currency: 'PHP', merchant: '菲律賓跨境跨境電商', amount: 12500, status: '支付成功' },
        { time: '2026-08-13 11:02:40', mchNo: 'MCH202608130003', sysNo: 'SYS-C-88103', supNo: 'SUP-WX-9983', currency: 'CNY', merchant: '海淘優選', amount: 3200, status: '支付成功' }
      ],

      payoutList: [
        { time: '2026-08-13 11:05:22', mchNo: 'MCH202608130099', sysNo: 'SYS-P-99201', supNo: 'SUP-GCASH-OUT-112', targetAccount: '09171234567 (GCash)', currency: 'PHP', merchant: '菲律賓跨境跨境電商', amount: 15000, status: '打款成功' },
        { time: '2026-08-13 11:30:10', mchNo: 'MCH202608130100', sysNo: 'SYS-P-99202', supNo: 'SUP-UNION-113', targetAccount: '622202******8819', currency: 'CNY', merchant: '海淘優選', amount: 45000, status: '打款成功' }
      ],

      supCollectList: [
        { date: '2026-08-13 10:20:00', mchNo: 'MCH202608130001', sysNo: 'SYS-C-88101', supNo: 'SUP-GCASH-9981', currency: 'PHP', supplier: 'Xendit (GCash)', amount: 3500, status: '成功' },
        { date: '2026-08-13 10:25:00', mchNo: 'MCH202608130002', sysNo: 'SYS-C-88102', supNo: 'SUP-MAYA-8822', currency: 'PHP', supplier: 'PayMaya Official', amount: 12500, status: '成功' }
      ],

      supPayoutList: [
        { date: '2026-08-13 11:45:00', mchNo: 'MCH202608130099', sysNo: 'SYS-P-99201', supNo: 'SUP-GCASH-OUT-112', currency: 'PHP', supplier: 'Xendit Disbursement', amount: 15000, status: '成功' }
      ],

      runSummaryList: [
        { date: '2026-08-13', merchant: '菲律賓跨境跨境電商', channel: 'GCash (Xendit)', collectAmt: 285000, payoutAmt: 65000 },
        { date: '2026-08-13', merchant: '海淘優選', channel: '微信支付', collectAmt: 89300, payoutAmt: 20000 }
      ],

      balanceLogs: [
        { id: 'LOG-01', time: '2026-08-13 09:00:00', merchantName: '菲律賓跨境跨境電商', type: '手動充值', beforeBal: 185000, changeAmt: 100000, afterBal: 285000, reason: 'GCash 預付款充值' }
      ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.refreshCaptcha()
    })
  },
  computed: {
    allMerchantNames() { return this.merchants.map(m => m.name); },
    filteredMerchants() {
      if (!this.selectedMerchantFilter) return this.merchants;
      return this.merchants.filter(m => m.name === this.selectedMerchantFilter);
    },

    isSupplierQueryMenu() { return this.activeMenu.startsWith('sup_'); },
    isCollectQueryMenu() { return this.activeMenu.startsWith('collect_'); },
    isPayoutQueryMenu() { return this.activeMenu.startsWith('payout_'); },
    isSettlementMenu() { return this.activeMenu.startsWith('settlement_'); },

    filteredCollectList() { return this.filterOrders(this.collectList); },
    filteredPayoutList() { return this.filterOrders(this.payoutList); },
    filteredSupplierList() {
      const list = this.isPayoutMenu(this.activeMenu) ? this.supPayoutList : this.supCollectList;
      return this.filterOrders(list);
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
    // --- 登入與圖形驗證碼 (Captcha) 邏輯 ---
    refreshCaptcha() {
      if (!this.$refs.captchaCanvas) return
      const canvas = this.$refs.captchaCanvas
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 產生隨機 4 位英文數字
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      let code = ''
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      this.currentCaptchaCode = code

      // 繪製背景干擾線與文字
      ctx.fillStyle = '#f6f8fa'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 干擾線
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `rgba(${Math.random()*150},${Math.random()*150},${Math.random()*150},0.5)`
        ctx.beginPath()
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
        ctx.stroke()
      }

      // 繪製驗證碼文字
      ctx.font = 'bold 20px monospace'
      for (let i = 0; i < code.length; i++) {
        ctx.fillStyle = `rgb(${Math.floor(Math.random()*100)}, ${Math.floor(Math.random()*100)}, ${Math.floor(Math.random()*100)})`
        ctx.fillText(code[i], 16 + i * 22, 26)
      }
    },
    handleLogin() {
      // 1. 驗證圖形驗證碼
      if (this.loginForm.captchaInput.toUpperCase() !== this.currentCaptchaCode.toUpperCase()) {
        ElMessage.error('圖形驗證碼不正確')
        this.refreshCaptcha()
        this.loginForm.captchaInput = ''
        return
      }

      // 2. 驗證 2FA (若啟用)
      if (this.is2FAEnabled && (!this.loginForm.twoFACode || this.loginForm.twoFACode.length !== 6)) {
        ElMessage.warning('請輸入有效的 6 位數 Authenticator 2FA 驗證碼')
        return
      }

      // 3. 模擬登入成功
      this.isLoggedIn = true
      ElMessage.success('登入成功，歡迎回到 BCPay 管理後台！')
    },
    handleLogout() {
      this.isLoggedIn = false
      this.loginForm.password = ''
      this.loginForm.captchaInput = ''
      this.loginForm.twoFACode = ''
      this.$nextTick(() => {
        this.refreshCaptcha()
      })
      ElMessage.info('已安全登出')
    },

    // --- 2FA 功能 ---
    enable2FA() {
      if (!this.bind2FACode || this.bind2FACode.length !== 6) {
        ElMessage.warning('請輸入正確的 6 位數 Authenticator 驗證碼')
        return
      }
      this.is2FAEnabled = true
      this.bind2FACode = ''
      ElMessage.success('Google Authenticator 雙重驗證綁定成功！')
    },
    disable2FA() {
      this.is2FAEnabled = false
      ElMessage.info('已解除 2FA 雙重驗證保護')
    },

    // --- 選單切換 ---
    toggleSubMenu(key) {
      const index = this.openSubMenus.indexOf(key)
      if (index > -1) {
        this.openSubMenus.splice(index, 1)
      } else {
        this.openSubMenus.push(key)
      }
    },
    isChildActive(item) {
      if (!item.children) return false
      return item.children.some(child => child.key === this.activeMenu)
    },
    getMenuTitle(key) {
      for (const item of this.menuItems) {
        if (item.key === key) return item.label
        if (item.children) {
          const child = item.children.find(c => c.key === key)
          if (child) return child.label
        }
      }
      return '查詢紀錄'
    },
    isPayoutMenu(key) {
      return key.includes('payout')
    },

    // --- 搜尋與過濾 ---
    filterOrders(list) {
      return list.filter(item => {
        const matchMch = !this.searchQuery.mchNo || (item.mchNo && item.mchNo.includes(this.searchQuery.mchNo))
        const matchSys = !this.searchQuery.sysNo || (item.sysNo && item.sysNo.includes(this.searchQuery.sysNo))
        const matchSup = !this.searchQuery.supNo || (item.supNo && item.supNo.includes(this.searchQuery.supNo))
        return matchMch && matchSys && matchSup
      })
    },
    resetSearch() {
      this.searchQuery = { mchNo: '', sysNo: '', supNo: '', dateType: 'day', selectedDate: '' }
    },

    // --- 商戶管理彈窗 ---
    openAddMerchantModal() {
      this.newMerchant = { id: '', name: '', rawBalance: 0, collectFeeRate: 0.8, payoutFeeRate: 0.5, minLimit: 100, maxLimit: 50000, settleMode: 'D0', connectedChannels: ['GCash (Xendit)'], active: true }
      this.showAddMerchantModal = true
    },
    confirmAddMerchant() {
      if (!this.newMerchant.id || !this.newMerchant.name) {
        ElMessage.warning('請填寫完整商戶號與名稱')
        return
      }
      this.merchants.push({ ...this.newMerchant })
      this.showAddMerchantModal = false
      ElMessage.success('新增商戶成功！')
    },
    openConfigModal(merchant) {
      this.editingMerchant = JSON.parse(JSON.stringify(merchant))
      this.showConfigModal = true
    },
    saveMerchantConfig() {
      const idx = this.merchants.findIndex(m => m.id === this.editingMerchant.id)
      if (idx !== -1) {
        this.merchants[idx] = { ...this.editingMerchant }
      }
      this.showConfigModal = false
      ElMessage.success('商戶配置更新成功')
    },
    saveChannelWeight(channel) {
      ElMessage.success(`渠道 [${channel.name}] 權重已更新為 ${channel.weight}%`)
    },

    // --- 餘額調整 (2FA 保護) ---
    openBalanceModal(merchant) {
      this.selectedMerchantForBalance = merchant
      this.balanceAdjustAmount = 0
      this.balanceAdjustReason = ''
      this.input2FACode = ''
      this.showBalanceModal = true
    },
    confirmBalanceAdjust() {
      if (!this.balanceAdjustAmount) {
        ElMessage.warning('請輸入調整金額')
        return
      }
      if (this.is2FAEnabled && (!this.input2FACode || this.input2FACode.length !== 6)) {
        ElMessage.error('請輸入正確的 6 位數 Google Authenticator 驗證碼')
        return
      }

      const m = this.merchants.find(item => item.id === this.selectedMerchantForBalance.id)
      if (m) {
        const before = m.rawBalance
        m.rawBalance += this.balanceAdjustAmount
        
        this.balanceLogs.unshift({
          id: 'LOG-' + (this.balanceLogs.length + 1).toString().padStart(2, '0'),
          time: new Date().toLocaleString(),
          merchantName: m.name,
          type: this.balanceAdjustAmount >= 0 ? '手動加款' : '手動扣款',
          beforeBal: before,
          changeAmt: this.balanceAdjustAmount,
          afterBal: m.rawBalance,
          reason: this.balanceAdjustReason || '管理員手動調整'
        })
      }

      this.showBalanceModal = false
      ElMessage.success('餘額調整完成！')
    },

    // --- CSV 導出 ---
    exportCSV(filename) {
      ElMessage.success(`已順利導出 ${filename} 檔案`)
    }
  }
})

app.use(ElementPlus)
app.mount('#app')
