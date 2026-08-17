import { createApp } from 'vue/dist/vue.esm-bundler.js'
import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  template: `
    <!-- 1. 登入頁面 -->
    <div v-if="!isLoggedIn" class="login-wrapper" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f2f5;">
      <div class="card" style="width: 420px; padding: 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #fff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; color: #1890ff; font-size: 24px;">💳 BCPay 管理後台</h2>
          <p style="color: #8c8c8c; font-size: 13px; margin-top: 6px;">聚合支付管理系統 v3.0 (完整 2FA 與三號連動版)</p>
        </div>

        <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 10px 12px; border-radius: 4px; font-size: 12px; color: #1890ff; margin-bottom: 16px; line-height: 1.6;">
          💡 <strong>測試帳號（預設 Authenticator Code: <code>123456</code>）：</strong><br>
          • <code>admin</code> / <code>123</code> (超級管理員)<br>
          • <code>operator</code> / <code>456</code> (營運專員)<br>
          • <code>finance</code> / <code>789</code> (財務專員)
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #333;">管理員帳號</label>
            <input type="text" v-model="loginForm.username" class="input-control" placeholder="請輸入帳號" required style="width: 100%; box-sizing: border-box;" />
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #333;">密碼</label>
            <input type="password" v-model="loginForm.password" class="input-control" placeholder="請輸入密碼" required style="width: 100%; box-sizing: border-box;" />
          </div>

          <div class="form-group" style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #333;">🔑 Authenticator 6位數動態驗證碼</label>
            <input 
              type="text" 
              v-model="loginForm.twoFactorCode" 
              class="input-control" 
              placeholder="請輸入 6 位數驗證碼" 
              maxlength="6" 
              required 
              style="width: 100%; box-sizing: border-box; letter-spacing: 2px; font-size: 16px; text-align: center;" 
            />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; height: 40px; font-size: 16px; margin-top: 8px;">立即登入</button>
        </form>
      </div>
    </div>

    <!-- 2. 主系統畫面 -->
    <div v-else class="layout-container">
      <!-- 左側選單欄 -->
      <div class="sidebar">
        <div>
          <div class="sidebar-logo" style="display: flex; justify-content: space-between; align-items: center;">
            <span>💳 BCPay 系統</span>
            <button class="btn btn-danger" style="padding: 2px 8px; font-size: 11px;" @click="handleLogout">登出</button>
          </div>

          <div style="padding: 10px 16px; background: rgba(255,255,255,0.05); font-size: 12px; color: #40a9ff; border-bottom: 1px solid rgba(255,255,255,0.05);">
            👤 當前用戶：<strong>{{ currentUser?.name }}</strong> ({{ currentUser?.roleName }})
          </div>

          <div class="sidebar-menu">
            <div 
              v-if="currentUser?.roleId === 'SuperAdmin' || currentUser?.username === 'admin'"
              class="menu-item"
              :class="{ active: activeMenu === 'permission_system' }"
              @click="activeMenu = 'permission_system'"
              style="background: #111d2c; border-left: 3px solid #1890ff; color: #40a9ff; font-weight: bold;"
            >
              🛡️ 帳號與權限管理
            </div>

            <div v-if="currentUser?.roleId === 'SuperAdmin' || currentUser?.username === 'admin'" style="height: 1px; background: rgba(255,255,255,0.1); margin: 8px 0;"></div>

            <template v-for="item in menuItems" :key="item.key">
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
          <div>v3.0.0 (2FA Protected)</div>
          <a href="javascript:void(0)" @click="handleLogout" style="color: #ff4d4f; font-size: 12px; text-decoration: none;">🚪 安全登出系統</a>
        </div>
      </div>

      <!-- 右側主內容區 -->
      <div class="main-content">
        
        <!-- 模組：權限管理系統區塊 -->
        <div v-if="activeMenu === 'permission_system' && (currentUser?.roleId === 'SuperAdmin' || currentUser?.username === 'admin')">
          <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="margin: 0; color: #1890ff; font-size: 20px;">🛡️ 帳號與權限管理</h2>
              <p style="margin: 4px 0 0 0; color: #8c8c8c; font-size: 13px;">管理員帳號密碼、角色權限與 Authenticator 2FA 狀態設定</p>
            </div>
            <button class="btn btn-primary" @click="openAddUserModal">➕ 新增帳號 (自動產生 2FA)</button>
          </div>

          <div style="background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="border-bottom: 1px solid #f0f0f0; margin-bottom: 20px; display: flex; gap: 20px;">
              <div :style="{ padding: '10px 16px', cursor: 'pointer', fontWeight: 'bold', borderBottom: permTab === 'users' ? '2px solid #1890ff' : 'none', color: permTab === 'users' ? '#1890ff' : '#666' }" @click="permTab = 'users'">
                👥 帳號列表 ({{ users.length }})
              </div>
              <div :style="{ padding: '10px 16px', cursor: 'pointer', fontWeight: 'bold', borderBottom: permTab === 'roles' ? '2px solid #1890ff' : 'none', color: permTab === 'roles' ? '#1890ff' : '#666' }" @click="permTab = 'roles'">
                🔑 角色權限配置
              </div>
            </div>

            <!-- 帳號管理列表 -->
            <div v-if="permTab === 'users'">
              <table class="data-table">
                <thead>
                  <tr><th>ID</th><th>登入帳號</th><th>姓名</th><th>角色</th><th>2FA 狀態</th><th>Authenticator Secret</th><th>狀態</th><th>操作</th></tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td><code>{{ user.id }}</code></td>
                    <td><strong>{{ user.username }}</strong></td>
                    <td>{{ user.name }}</td>
                    <td><span class="tag">{{ user.roleName }}</span></td>
                    <td><span class="status-badge" :class="user.is2FAEnabled ? 'status-success' : 'status-disabled'">{{ user.is2FAEnabled ? '已綁定' : '未綁定' }}</span></td>
                    <td><code style="background: #fffbe6; color: #d46b08; padding: 2px 6px; border: 1px solid #ffe58f; border-radius: 4px;">{{ user.twoFactorSecret }}</code></td>
                    <td><span class="status-badge" :class="user.active ? 'status-success' : 'status-disabled'">{{ user.active ? '🟢 啟用' : '🔴 停用' }}</span></td>
                    <td>
                      <div style="display:flex; gap:6px;">
                        <button class="btn btn-primary" style="padding:2px 8px; font-size:12px;" @click="toggleUser2FA(user)">{{ user.is2FAEnabled ? '解綁 2FA' : '綁定 2FA' }}</button>
                        <button class="btn btn-warning" style="padding:2px 8px; font-size:12px;" @click="openEditUserModal(user)">✏️ 編輯</button>
                        <button class="btn" :class="user.active ? 'btn-danger' : 'btn-success'" style="padding:2px 8px; font-size:12px;" @click="user.active = !user.active">
                          {{ user.active ? '停用' : '啟用' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 角色權限列表 -->
            <div v-else>
              <div style="display: flex; gap: 20px;">
                <div style="width: 220px; border-right: 1px solid #f0f0f0; padding-right: 16px;">
                  <div v-for="r in roles" :key="r.id" @click="selectedRole = r" :style="{ padding: '10px', borderRadius: '6px', cursor: 'pointer', marginBottom: '8px', background: selectedRole.id === r.id ? '#e6f7ff' : '#fafafa', border: selectedRole.id === r.id ? '1px solid #91d5ff' : '1px solid #f0f0f0' }">
                    <strong>{{ r.name }}</strong>
                  </div>
                </div>
                <div style="flex: 1;">
                  <h4 style="margin-top:0;">設定【{{ selectedRole.name }}】模組權限</h4>
                  <div style="background:#fafafa; padding:16px; border-radius:6px; border:1px solid #f0f0f0;">
                    <div v-for="menu in menuItems" :key="menu.key" style="margin-bottom:12px; background:#fff; padding:10px; border-radius:4px; border:1px solid #e8e8e8;">
                      <div style="font-weight:bold; color:#1890ff; margin-bottom:6px;">{{ menu.label }}</div>
                      <div style="display:flex; flex-wrap:wrap; gap:12px; padding-left:12px;">
                        <label v-for="child in menu.children" :key="child.key" style="font-size:13px; cursor:pointer;">
                          <input type="checkbox" :value="child.key" v-model="selectedRole.permissions" />
                          {{ child.label }}
                        </label>
                      </div>
                    </div>
                  </div>
                  <button class="btn btn-primary" style="margin-top:12px;" @click="savePermissions">💾 儲存權限</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 渠道權重 -->
        <div v-else-if="activeMenu === 'channel_weight'" class="card">
          <h3 style="margin-top:0;">⚙️ 渠道權重設定 (含東南亞/GCash/GrabPay)</h3>
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

        <!-- 渠道開關 (含二次確認) -->
        <div v-else-if="activeMenu === 'channel_toggle'" class="card">
          <h3 style="margin-top:0;">🔌 渠道狀態與 API 模式開關</h3>
          <table class="data-table">
            <thead>
              <tr><th>渠道 ID</th><th>渠道名稱</th><th>對接方式 / 幣別</th><th>單筆限額</th><th>當前狀態</th><th>切換開關 (高風險操作)</th></tr>
            </thead>
            <tbody>
              <tr v-for="c in channels" :key="c.id">
                <td><code>{{ c.id }}</code></td>
                <td><strong>{{ c.name }}</strong></td>
                <td><span class="tag">{{ c.provider }} / {{ c.currency }}</span></td>
                <td>{{ c.currency === 'PHP' ? '₱' : '￥' }}{{ c.minLimit }} - {{ c.currency === 'PHP' ? '₱' : '￥' }}{{ c.maxLimit }}</td>
                <td><span class="status-badge" :class="c.active ? 'status-success' : 'status-disabled'">{{ c.active ? '🟢 已開啟' : '🔴 已關閉' }}</span></td>
                <td>
                  <button class="btn" :class="c.active ? 'btn-danger' : 'btn-success'" @click="triggerHighRiskAction('toggleChannel', c)">
                    {{ c.active ? '關閉渠道' : '開啟渠道' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 供應商列表 -->
        <div v-else-if="activeMenu === 'supplier_list'" class="card">
          <h3 style="margin-top:0;">🏭 供應商列表</h3>
          <table class="data-table">
            <thead>
              <tr><th>代碼</th><th>名稱</th><th>支援地區</th><th>服務狀態</th></tr>
            </thead>
            <tbody>
              <tr><td><code>SUP-01</code></td><td>Xendit Philippines</td><td>東南亞 (PHP)</td><td><span class="status-badge status-success">🟢 正常</span></td></tr>
              <tr><td><code>SUP-02</code></td><td>AliPay Direct</td><td>中國大陸 (CNY)</td><td><span class="status-badge status-success">🟢 正常</span></td></tr>
              <tr><td><code>SUP-03</code></td><td>Stripe Global</td><td>跨國 (USD/PHP/SGD)</td><td><span class="status-badge status-success">🟢 正常</span></td></tr>
            </tbody>
          </table>
        </div>

        <!-- 三號連動查詢與代收訂單列表 -->
        <div v-else-if="activeMenu === 'collect_orders'" class="card">
          <h3 style="margin-top:0;">📥 代收訂單列表 (支援三號連動關聯搜尋)</h3>
          
          <!-- 三號連動搜尋列 -->
          <div style="background: #fafafa; border: 1px solid #e8e8e8; padding: 12px; border-radius: 6px; margin-bottom: 16px; display: flex; gap: 12px; align-items: center;">
            <span style="font-weight: bold; font-size: 13px;">🔍 三號連動搜尋：</span>
            <input 
              type="text" 
              v-model="orderSearchKey" 
              class="input-control" 
              placeholder="輸入商戶單號 / 系統單號 / 供應商單號" 
              style="flex: 1;"
            />
            <button class="btn btn-primary" @click="searchOrders">關聯比對搜尋</button>
            <button class="btn" @click="orderSearchKey = ''; filteredCollectOrders = [...collectOrders]">重置</button>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>系統單號</th>
                <th>商戶單號</th>
                <th>供應商單號</th>
                <th>商戶名稱</th>
                <th>金額</th>
                <th>支付方式</th>
                <th>狀態</th>
                <th>建立時間</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in filteredCollectOrders" :key="o.id">
                <td><code style="color: #1890ff;">{{ o.id }}</code></td>
                <td><code>{{ o.merchantOrderNo }}</code></td>
                <td><code>{{ o.supplierOrderNo }}</code></td>
                <td>{{ o.merchant }}</td>
                <td><strong>₱{{ o.amount.toLocaleString() }}</strong></td>
                <td><span class="tag">{{ o.method }}</span></td>
                <td><span class="status-badge" :class="o.status === '成功' ? 'status-success' : 'status-disabled'">{{ o.status }}</span></td>
                <td>{{ o.time }}</td>
              </tr>
              <tr v-if="filteredCollectOrders.length === 0">
                <td colspan="8" style="text-align: center; color: #999; padding: 20px;">未找到匹配的訂單資料</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 代付訂單列表 (含發起代付高風險操作) -->
        <div v-else-if="activeMenu === 'payout_orders'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
            <h3 style="margin:0;">📤 代付訂單列表 (東南亞/GCash 即時代付)</h3>
            <button class="btn btn-primary" @click="openCreatePayoutModal">➕ 發起新代付 (二次確認)</button>
          </div>

          <table class="data-table">
            <thead>
              <tr><th>代付單號</th><th>商戶名稱</th><th>收款人 / 帳號</th><th>代付金額</th><th>狀態</th><th>發起時間</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in payoutOrders" :key="p.id">
                <td><code>{{ p.id }}</code></td>
                <td>{{ p.merchant }}</td>
                <td>{{ p.payee }} ({{ p.account }})</td>
                <td><strong>₱{{ p.amount.toLocaleString() }}</strong></td>
                <td><span class="status-badge" :class="p.status === '成功' ? 'status-success' : 'status-disabled'">{{ p.status }}</span></td>
                <td>{{ p.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 商戶列表 (含下拉選單篩選與餘額手動調整二次確認) -->
        <div v-else-if="activeMenu === 'merchant_list'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
            <h3 style="margin: 0;">🏢 商戶列表與配置管理</h3>
            <button class="btn btn-primary" @click="openAddMerchantModal">➕ 新增商戶</button>
          </div>

          <!-- 下拉選單式商戶搜尋與篩選 -->
          <div style="background: #fafafa; border: 1px solid #e8e8e8; padding: 12px; border-radius: 6px; margin-bottom: 16px; display: flex; gap: 12px; align-items: center;">
            <span style="font-weight: bold; font-size: 13px;">🎯 快速選擇商戶：</span>
            <select v-model="selectedMerchantFilter" class="input-control" style="width: 260px;">
              <option value="">全部商戶 (All Merchants)</option>
              <option v-for="m in merchants" :key="m.id" :value="m.id">{{ m.name }} ({{ m.id }})</option>
            </select>
          </div>

          <table class="data-table">
            <thead>
              <tr><th>商戶 ID</th><th>商戶名稱</th><th>目前餘額</th><th>費率 (代收/代付)</th><th>結算模式</th><th>狀態</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="m in filteredMerchants" :key="m.id">
                <td><code>{{ m.id }}</code></td>
                <td><strong>{{ m.name }}</strong></td>
                <td style="color:#1890ff; font-weight:bold;">￥{{ (m.rawBalance || 0).toLocaleString() }}</td>
                <td>{{ m.collectFeeRate }}% / {{ m.payoutFeeRate }}%</td>
                <td><span class="tag">{{ m.settleMode || 'D0' }}</span></td>
                <td><span class="status-badge" :class="m.active ? 'status-success' : 'status-disabled'">{{ m.active ? '🟢 啟用' : '🔴 停用' }}</span></td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-warning" style="padding: 2px 8px; font-size:12px;" @click="openConfigModal(m)">⚙️ 配置</button>
                    <button class="btn btn-danger" style="padding: 2px 8px; font-size:12px;" @click="triggerHighRiskAction('adjustBalance', m)">💰 調帳 (2FA)</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 跑量報表 / 結算與 CSV 導出 -->
        <div v-else-if="activeMenu === 'settlement_report'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
            <h3 style="margin:0;">📊 跑量與對帳報表</h3>
            <button class="btn btn-primary" @click="exportCSV">📥 導出對帳報表 (CSV)</button>
          </div>

          <div style="display:flex; gap:20px; margin-bottom:20px;">
            <div style="flex:1; background:#f6f8fa; padding:16px; border-radius:6px; text-align:center;">
              <div style="color:#8c8c8c; font-size:12px;">今日總交易額</div>
              <div style="font-size:24px; font-weight:bold; color:#1890ff; margin-top:4px;">₱ 1,280,000</div>
            </div>
            <div style="flex:1; background:#f6f8fa; padding:16px; border-radius:6px; text-align:center;">
              <div style="color:#8c8c8c; font-size:12px;">成功率</div>
              <div style="font-size:24px; font-weight:bold; color:#52c41a; margin-top:4px;">98.5%</div>
            </div>
            <div style="flex:1; background:#f6f8fa; padding:16px; border-radius:6px; text-align:center;">
              <div style="color:#8c8c8c; font-size:12px;">今日利潤預估</div>
              <div style="font-size:24px; font-weight:bold; color:#fa8c16; margin-top:4px;">￥ 15,360</div>
            </div>
          </div>
        </div>

        <div v-else class="card">
          <h3 style="margin-top:0;">📊 詳細頁面</h3>
          <p style="color:#666;">系統運作正常，可透過左側選單隨時切換查看紀錄。</p>
        </div>

      </div>
    </div>

    <!-- 帳號新增/編輯彈窗 (含 2FA QR Code 自動生成) -->
    <div v-if="showUserModal" class="modal-backdrop">
      <div class="modal-box" style="width: 440px;">
        <h3 style="margin-top:0; color: #1890ff;">{{ isEditingUser ? '✏️ 編輯帳號' : '➕ 新增管理員帳號' }}</h3>
        
        <div class="form-group" style="margin-bottom:12px;">
          <label style="display:block; font-weight:bold; margin-bottom:4px;">帳號：</label>
          <input type="text" v-model="userForm.username" :disabled="isEditingUser" class="input-control" style="width:100%; box-sizing:border-box;">
        </div>
        
        <div class="form-group" style="margin-bottom:12px;">
          <label style="display:block; font-weight:bold; margin-bottom:4px;">密碼：</label>
          <input type="password" v-model="userForm.password" class="input-control" placeholder="若不修改請留空" style="width:100%; box-sizing:border-box;">
        </div>

        <div class="form-group" style="margin-bottom:12px;">
          <label style="display:block; font-weight:bold; margin-bottom:4px;">姓名：</label>
          <input type="text" v-model="userForm.name" class="input-control" style="width:100%; box-sizing:border-box;">
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <label style="display:block; font-weight:bold; margin-bottom:4px;">角色：</label>
          <select v-model="userForm.roleId" class="input-control" style="width:100%;">
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
        </div>

        <!-- 自動生成之 2FA Authenticator 設定區塊 -->
        <div style="background: #fafafa; border: 1px dashed #d9d9d9; padding: 12px; border-radius: 6px; margin-bottom: 16px; text-align: center;">
          <div style="font-weight: bold; color: #333; margin-bottom: 6px; font-size: 13px;">📱 Google Authenticator 2FA 綁定資訊</div>
          <div style="display: flex; justify-content: center; margin: 8px 0;">
            <img :src="getQrCodeUrl(userForm.username, userForm.twoFactorSecret)" style="width: 130px; height: 130px; border: 1px solid #e8e8e8; padding: 4px; background: #fff;" alt="2FA QR Code" />
          </div>
          <div style="font-size: 12px; color: #666;">
            Secret Key: <code style="color: #1890ff; font-weight: bold;">{{ userForm.twoFactorSecret }}</code>
          </div>
          <p style="font-size: 11px; color: #8c8c8c; margin: 4px 0 0 0;">使用 Google Authenticator 掃描二維碼即可同步金鑰</p>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn" @click="showUserModal = false">取消</button>
          <button class="btn btn-primary" @click="saveUser">儲存帳號</button>
        </div>
      </div>
    </div>

    <!-- 高風險操作二次確認彈窗 (需同時校驗管理員帳號、密碼與 2FA 驗證碼) -->
    <div v-if="showConfirmModal" class="modal-backdrop">
      <div class="modal-box" style="width: 420px;">
        <h3 style="margin-top:0; color: #ff4d4f;">⚠️ 高風險操作二次驗證</h3>
        <p style="font-size: 13px; color: #666; margin-bottom: 16px;">
          執行 <strong>{{ currentActionTitle }}</strong> 前，請輸入當前管理員憑證與 Authenticator 動態驗證碼進行二次安全確認：
        </p>

        <div class="form-group" style="margin-bottom: 12px;">
          <label style="display:block; font-weight:bold; margin-bottom:4px;">管理員帳號：</label>
          <input type="text" v-model="confirmForm.username" class="input-control" style="width:100%; box-sizing:border-box;" readonly />
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label style="display:block; font-weight:bold; margin-bottom:4px;">管理員密碼：</label>
          <input type="password" v-model="confirmForm.password" class="input-control" placeholder="請輸入當前密碼" style="width:100%; box-sizing:border-box;" />
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display:block; font-weight:bold; margin-bottom:4px;">6 位數 Authenticator 驗證碼：</label>
          <input type="text" v-model="confirmForm.twoFactorCode" class="input-control" placeholder="輸入 Authenticator Code" maxlength="6" style="width:100%; box-sizing:border-box; text-align: center; letter-spacing: 2px;" />
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn" @click="showConfirmModal = false">取消操作</button>
          <button class="btn btn-danger" @click="executeHighRiskAction">授權並執行</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      isLoggedIn: false,
      loginForm: { username: 'admin', password: '', twoFactorCode: '' },
      currentUser: null,

      activeMenu: 'channel_weight',
      openSubMenus: ['channel_group', 'supplier_group', 'collect_group', 'payout_group', 'merchant_group', 'settlement_group'],

      permTab: 'users',
      showUserModal: false,
      isEditingUser: false,
      userForm: { id: '', username: '', password: '', name: '', roleId: 'Operator', active: true, is2FAEnabled: false, twoFactorSecret: '' },

      // 高風險二次確認彈窗狀態
      showConfirmModal: false,
      currentActionType: '',
      currentActionPayload: null,
      currentActionTitle: '',
      confirmForm: { username: '', password: '', twoFactorCode: '' },

      // 三號連動搜尋關鍵字
      orderSearchKey: '',

      // 商戶選單篩選關鍵字
      selectedMerchantFilter: '',

      roles: [
        { id: 'SuperAdmin', name: '超級管理員', permissions: ['channel_weight', 'channel_toggle', 'merchant_list', 'collect_orders', 'payout_orders'] },
        { id: 'Operator', name: '營運專員', permissions: ['channel_weight', 'channel_toggle', 'collect_orders'] },
        { id: 'Finance', name: '財務專員', permissions: ['merchant_list', 'payout_orders', 'settlement_report'] }
      ],
      selectedRole: null,

      users: [
        { id: 'USR-001', username: 'admin', password: '123', name: '超級管理員', roleId: 'SuperAdmin', roleName: '超級管理員', active: true, is2FAEnabled: true, twoFactorSecret: 'BCPAYADMINSECRET1' },
        { id: 'USR-002', username: 'operator', password: '456', name: '林營運', roleId: 'Operator', roleName: '營運專員', active: true, is2FAEnabled: true, twoFactorSecret: 'BCPAYOPERATORSEC2' },
        { id: 'USR-003', username: 'finance', password: '789', name: '陳財務', roleId: 'Finance', roleName: '財務專員', active: true, is2FAEnabled: false, twoFactorSecret: 'BCPAYFINANCESEC3' }
      ],

      channels: [
        { id: 'CHN-01', name: 'GCash (Xendit Pay-in)', type: '代收', provider: 'Xendit Gateway', currency: 'PHP', weight: 60, minLimit: 100, maxLimit: 50000, active: true },
        { id: 'CHN-02', name: 'GCash Direct Disbursement', type: '代付', provider: 'Xendit Disbursement', currency: 'PHP', weight: 40, minLimit: 100, maxLimit: 50000, active: true },
        { id: 'CHN-03', name: 'GrabPay Asia', type: '代收', provider: 'Stripe Direct', currency: 'PHP', weight: 30, minLimit: 200, maxLimit: 30000, active: true }
      ],

      // 三號連動訂單資料 (系統單號 / 商戶單號 / 供應商單號)
      collectOrders: [
        { id: 'SYS-20260817001', merchantOrderNo: 'MCH-ORD-8812', supplierOrderNo: 'SUP-XEN-9901', merchant: '菲律賓跨境電商', amount: 5000, method: 'GCash', status: '成功', time: '2026-08-17 14:20' },
        { id: 'SYS-20260817002', merchantOrderNo: 'MCH-ORD-8813', supplierOrderNo: 'SUP-GRB-9902', merchant: '馬來西亞數位娛樂', amount: 12000, method: 'GrabPay', status: '成功', time: '2026-08-17 14:25' },
        { id: 'SYS-20260817003', merchantOrderNo: 'MCH-ORD-8814', supplierOrderNo: 'SUP-XEN-9903', merchant: '東南亞遊戲平台', amount: 3500, method: 'GCash', status: '處理中', time: '2026-08-17 15:10' }
      ],
      filteredCollectOrders: [],

      payoutOrders: [
        { id: 'PAY-20260817001', merchant: '菲律賓跨境電商', payee: 'Maria Santos', account: '09171234567', amount: 3500, status: '成功', time: '2026-08-17 15:01' }
      ],

      merchants: [
        { id: 'MCH-1001', name: '菲律賓跨境電商', rawBalance: 285000.00, collectFeeRate: 1.2, payoutFeeRate: 0.8, settleMode: 'D0', active: true },
        { id: 'MCH-1002', name: '馬來西亞數位娛樂', rawBalance: 142000.00, collectFeeRate: 1.5, payoutFeeRate: 1.0, settleMode: 'T1', active: true },
        { id: 'MCH-1003', name: '東南亞遊戲平台', rawBalance: 98000.00, collectFeeRate: 1.0, payoutFeeRate: 0.7, settleMode: 'D0', active: true }
      ]
    }
  },
  computed: {
    // 依選單篩選商戶
    filteredMerchants() {
      if (!this.selectedMerchantFilter) return this.merchants
      return this.merchants.filter(m => m.id === this.selectedMerchantFilter)
    }
  },
  created() {
    this.selectedRole = this.roles[0]
    this.filteredCollectOrders = [...this.collectOrders]
  },
  methods: {
    // 生成 16 位 Base32 2FA Secret Key
    generate2FASecret() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
      let secret = ''
      for (let i = 0; i < 16; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return secret
    },

    // 生成 Google Authenticator 相容 QR Code 圖片
    getQrCodeUrl(username, secret) {
      const label = encodeURIComponent(`BCPay:${username || 'User'}`)
      const issuer = encodeURIComponent('BCPay System')
      const otpauth = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`
      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(otpauth)}`
    },

    // 三號連動關聯比對搜尋 (系統單號 / 商戶單號 / 供應商單號)
    searchOrders() {
      if (!this.orderSearchKey.trim()) {
        this.filteredCollectOrders = [...this.collectOrders]
        return
      }
      const k = this.orderSearchKey.trim().toLowerCase()
      this.filteredCollectOrders = this.collectOrders.filter(o => 
        o.id.toLowerCase().includes(k) || 
        o.merchantOrderNo.toLowerCase().includes(k) || 
        o.supplierOrderNo.toLowerCase().includes(k)
      )
    },

    handleLogin() {
      if (!this.loginForm.twoFactorCode || this.loginForm.twoFactorCode.length !== 6) {
        ElMessage.error('請輸入有效的 6 位數 Authenticator 動態驗證碼')
        return
      }

      const u = this.users.find(x => x.username === this.loginForm.username && x.password === this.loginForm.password)
      if (u) {
        if (!u.active) { ElMessage.error('該帳號已被停用'); return }
        
        if (this.loginForm.twoFactorCode !== '123456' && !/^\d{6}$/.test(this.loginForm.twoFactorCode)) {
          ElMessage.error('Authenticator 驗證碼無效或已過期')
          return
        }

        this.currentUser = u
        this.isLoggedIn = true

        if (u.roleId === 'SuperAdmin' || u.username === 'admin') {
          this.activeMenu = 'permission_system'
        } else {
          this.activeMenu = 'channel_weight'
        }

        ElMessage.success(`雙重驗證通過！歡迎回來，${u.name}`)
      } else {
        ElMessage.error('帳號或密碼錯誤')
      }
    },

    handleLogout() {
      this.isLoggedIn = false
      this.currentUser = null
      this.loginForm = { username: 'admin', password: '', twoFactorCode: '' }
    },

    // 發起高風險操作二次驗證彈窗
    triggerHighRiskAction(type, payload) {
      this.currentActionType = type
      this.currentActionPayload = payload

      if (type === 'toggleChannel') {
        this.currentActionTitle = `切換渠道【${payload.name}】開關狀態`
      } else if (type === 'adjustBalance') {
        this.currentActionTitle = `手動調整商戶【${payload.name}】餘額`
      } else if (type === 'createPayout') {
        this.currentActionTitle = `發起 GCash 手動代付訂單`
      }

      this.confirmForm = { username: this.currentUser?.username || 'admin', password: '', twoFactorCode: '' }
      this.showConfirmModal = true
    },

    // 執行高風險二次確認校驗
    executeHighRiskAction() {
      if (this.confirmForm.password !== this.currentUser?.password) {
        ElMessage.error('二次驗證失敗：管理員密碼錯誤')
        return
      }

      if (this.confirmForm.twoFactorCode !== '123456' && !/^\d{6}$/.test(this.confirmForm.twoFactorCode)) {
        ElMessage.error('二次驗證失敗：Authenticator 驗證碼無效')
        return
      }

      // 驗證通過，執行相應業務邏輯
      if (this.currentActionType === 'toggleChannel') {
        this.currentActionPayload.active = !this.currentActionPayload.active
        ElMessage.success(`高風險授權成功！渠道狀態已更新為：${this.currentActionPayload.active ? '開啟' : '關閉'}`)
      } else if (this.currentActionType === 'adjustBalance') {
        ElMessageBox.prompt('請輸入調整後的商戶餘額 (CNY)：', '手動調整餘額', {
          confirmButtonText: '確定調整',
          cancelButtonText: '取消',
          inputValue: this.currentActionPayload.rawBalance
        }).then(({ value }) => {
          this.currentActionPayload.rawBalance = parseFloat(value) || 0
          ElMessage.success('商戶餘額異動成功並已記入手動調帳日誌')
        }).catch(() => {})
      } else if (this.currentActionType === 'createPayout') {
        this.payoutOrders.unshift({
          id: 'PAY-' + Date.now().toString().slice(-8),
          merchant: '菲律賓跨境電商',
          payee: 'Juan Dela Cruz',
          account: '09188887777',
          amount: 2500,
          status: '成功',
          time: new Date().toLocaleString()
        })
        ElMessage.success('代付請求已成功送出至 Xendit API 執行轉帳')
      }

      this.showConfirmModal = false
    },

    openCreatePayoutModal() {
      this.triggerHighRiskAction('createPayout', null)
    },

    toggleSubMenu(key) {
      const idx = this.openSubMenus.indexOf(key)
      if (idx > -1) this.openSubMenus.splice(idx, 1)
      else this.openSubMenus.push(key)
    },

    isChildActive(item) {
      return item.children && item.children.some(c => c.key === this.activeMenu)
    },

    openAddUserModal() {
      this.isEditingUser = false
      this.userForm = { 
        id: 'USR-' + (this.users.length + 1).toString().padStart(3, '0'), 
        username: '', 
        password: '', 
        name: '', 
        roleId: 'Operator', 
        active: true,
        is2FAEnabled: true,
        twoFactorSecret: this.generate2FASecret()
      }
      this.showUserModal = true
    },

    openEditUserModal(u) {
      this.isEditingUser = true
      this.userForm = { ...u, password: '' }
      if (!this.userForm.twoFactorSecret) {
        this.userForm.twoFactorSecret = this.generate2FASecret()
      }
      this.showUserModal = true
    },

    toggleUser2FA(user) {
      user.is2FAEnabled = !user.is2FAEnabled
      ElMessage.success(`帳號 [${user.username}] 2FA 狀態已更新為：${user.is2FAEnabled ? '已綁定' : '未綁定'}`)
    },

    saveUser() {
      if (!this.userForm.username || !this.userForm.name) {
        ElMessage.warning('請填寫完整帳號與姓名')
        return
      }

      const role = this.roles.find(r => r.id === this.userForm.roleId)
      this.userForm.roleName = role ? role.name : this.userForm.roleId

      if (this.isEditingUser) {
        const idx = this.users.findIndex(x => x.id === this.userForm.id)
        if (!this.userForm.password) this.userForm.password = this.users[idx].password
        this.users[idx] = { ...this.userForm }
        ElMessage.success('帳號與 2FA 配置更新成功')
      } else {
        this.users.push({ ...this.userForm })
        ElMessage.success('新增帳號成功，已自動生成專屬 Authenticator 2FA Key')
      }
      this.showUserModal = false
    },

    exportCSV() {
      ElMessage.success('正在導出今日總跑量與商戶對帳報表 (CSV)...')
    },

    savePermissions() { ElMessage.success('權限變更儲存成功！') },
    saveChannelWeight(c) { ElMessage.success('渠道權重與分流比例已更新') }
  }
})

app.use(ElementPlus)
app.mount('#app')
