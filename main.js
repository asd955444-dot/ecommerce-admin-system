import { createApp } from 'vue/dist/vue.esm-bundler.js'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  template: `
    <!-- 1. 登入頁面 -->
    <div v-if="!isLoggedIn" class="login-wrapper" style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f2f5;">
      <div class="card" style="width: 400px; padding: 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #fff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; color: #1890ff; font-size: 24px;">💳 BCPay 管理後台</h2>
          <p style="color: #8c8c8c; font-size: 13px; margin-top: 6px;">聚合支付管理系統 v3.0</p>
        </div>

        <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #1890ff; margin-bottom: 16px;">
          💡 <strong>可測試帳號：</strong><br>
          • 超級管理員: <code>admin</code> / <code>123</code> (含權限頁面)<br>
          • 營運專員: <code>operator</code> / <code>456</code> (無權限頁面)<br>
          • 財務專員: <code>finance</code> / <code>789</code> (無權限頁面)
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
            <label style="display: block; margin-bottom: 6px; font-weight: bold; color: #333;">安全驗證碼</label>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="text" v-model="loginForm.captchaInput" class="input-control" placeholder="輸入 4 位驗證碼" maxlength="4" required style="flex: 1;" />
              <canvas ref="captchaCanvas" width="110" height="38" @click="refreshCaptcha" style="border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer;" title="點擊刷新驗證碼"></canvas>
            </div>
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
            <!-- 僅限制 SuperAdmin 或 admin 帳號可見權限管理選單 -->
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
          <div>v3.0.0</div>
          <a href="javascript:void(0)" @click="handleLogout" style="color: #ff4d4f; font-size: 12px; text-decoration: none;">🚪 安全登出系統</a>
        </div>
      </div>

      <!-- 右側主內容區 -->
      <div class="main-content">
        
        <!-- 模組 A：權限管理系統區塊 (有存取防護) -->
        <div v-if="activeMenu === 'permission_system' && (currentUser?.roleId === 'SuperAdmin' || currentUser?.username === 'admin')">
          <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="margin: 0; color: #1890ff; font-size: 20px;">🛡️ 帳號與權限管理</h2>
              <p style="margin: 4px 0 0 0; color: #8c8c8c; font-size: 13px;">可即時新增管理員帳號、編輯密碼與設定角色權限</p>
            </div>
            <button class="btn btn-primary" @click="openAddUserModal">➕ 新增帳號</button>
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

            <!-- 帳號管理 -->
            <div v-if="permTab === 'users'">
              <table class="data-table">
                <thead>
                  <tr><th>ID</th><th>登入帳號</th><th>使用者姓名</th><th>角色</th><th>狀態</th><th>操作</th></tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td><code>{{ user.id }}</code></td>
                    <td><strong>{{ user.username }}</strong></td>
                    <td>{{ user.name }}</td>
                    <td><span class="tag">{{ user.roleName }}</span></td>
                    <td><span class="status-badge" :class="user.active ? 'status-success' : 'status-disabled'">{{ user.active ? '🟢 啟用' : '🔴 停用' }}</span></td>
                    <td>
                      <div style="display:flex; gap:6px;">
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

            <!-- 角色權限 -->
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

        <!-- 模組 B：BCPay 原有功能區塊 (渠道/訂單/商戶/跑量) -->
        <div v-else-if="activeMenu === 'channel_weight'" class="card">
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

        <div v-else-if="activeMenu === 'channel_toggle'" class="card">
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
                <td><span class="status-badge" :class="c.active ? 'status-success' : 'status-disabled'">{{ c.active ? '🟢 已開啟' : '🔴 已關閉' }}</span></td>
                <td><button class="btn" :class="c.active ? 'btn-danger' : 'btn-success'" @click="c.active = !c.active">{{ c.active ? '關閉渠道' : '開啟渠道' }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="activeMenu === 'merchant_list'" class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h3 style="margin: 0;">🏢 商戶列表與配置管理</h3>
            <button class="btn btn-primary" @click="openAddMerchantModal">➕ 新增商戶</button>
          </div>
          <table class="data-table">
            <thead>
              <tr><th>商戶 ID</th><th>商戶名稱</th><th>目前餘額</th><th>費率 (代收/代付)</th><th>結算模式</th><th>狀態</th><th>操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="m in merchants" :key="m.id">
                <td><code>{{ m.id }}</code></td>
                <td><strong>{{ m.name }}</strong></td>
                <td style="color:#1890ff; font-weight:bold;">￥{{ (m.rawBalance || 0).toLocaleString() }}</td>
                <td>{{ m.collectFeeRate }}% / {{ m.payoutFeeRate }}%</td>
                <td><span class="tag">{{ m.settleMode || 'D0' }}</span></td>
                <td><span class="status-badge" :class="m.active ? 'status-success' : 'status-disabled'">{{ m.active ? '🟢 啟用' : '🔴 停用' }}</span></td>
                <td>
                  <button class="btn btn-warning" style="padding: 4px 8px; font-size:12px;" @click="openConfigModal(m)">⚙️ 調整配置</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="card">
          <h3 style="margin-top:0;">📊 詳細頁面</h3>
          <p style="color:#666;">系統運作正常，可透過左側選單隨時切換查看紀錄。</p>
        </div>

      </div>
    </div>

    <!-- 帳號新增/編輯彈窗 -->
    <div v-if="showUserModal" class="modal-backdrop">
      <div class="modal-box" style="width: 400px;">
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
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn" @click="showUserModal = false">取消</button>
          <button class="btn btn-primary" @click="saveUser">儲存</button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      isLoggedIn: false,
      loginForm: { username: 'admin', password: '', captchaInput: '' },
      currentCaptchaCode: '',
      currentUser: null,

      activeMenu: 'channel_weight',
      openSubMenus: ['channel_group'],

      permTab: 'users',
      showUserModal: false,
      isEditingUser: false,
      userForm: { id: '', username: '', password: '', name: '', roleId: 'Operator', active: true },

      roles: [
        { id: 'SuperAdmin', name: '超級管理員', permissions: ['channel_weight', 'channel_toggle', 'merchant_list'] },
        { id: 'Operator', name: '營運專員', permissions: ['channel_weight', 'channel_toggle'] },
        { id: 'Finance', name: '財務專員', permissions: ['merchant_list'] }
      ],
      selectedRole: null,

      users: [
        { id: 'USR-001', username: 'admin', password: '123', name: '超級管理員', roleId: 'SuperAdmin', roleName: '超級管理員', active: true },
        { id: 'USR-002', username: 'operator', password: '456', name: '林營運', roleId: 'Operator', roleName: '營運專員', active: true },
        { id: 'USR-003', username: 'finance', password: '789', name: '陳財務', roleId: 'Finance', roleName: '財務專員', active: true }
      ],

      channels: [
        { id: 'CHN-01', name: 'GCash (Xendit)', type: '代收', provider: 'Xendit Gateway', currency: 'PHP', weight: 50, minLimit: 100, maxLimit: 50000, active: true },
        { id: 'CHN-02', name: 'GCash Direct Payout', type: '代付', provider: 'Xendit Disbursement', currency: 'PHP', weight: 50, minLimit: 100, maxLimit: 50000, active: true }
      ],
      merchants: [
        { id: 'MCH-1001', name: '菲律賓跨境電商', rawBalance: 285000.00, collectFeeRate: 1.2, payoutFeeRate: 0.8, settleMode: 'D0', active: true }
      ],

      menuItems: [
        {
          key: 'channel_group',
          label: '⚙️ 渠道與東南亞設置',
          children: [
            { key: 'channel_weight', label: '渠道權重' },
            { key: 'channel_toggle', label: '渠道開關' }
          ]
        },
        { key: 'merchant_list', label: '🏢 商戶列表' }
      ]
    }
  },
  created() {
    this.selectedRole = this.roles[0]
  },
  mounted() {
    this.$nextTick(() => { this.refreshCaptcha() })
  },
  methods: {
    refreshCaptcha() {
      if (!this.$refs.captchaCanvas) return
      const canvas = this.$refs.captchaCanvas
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
      let code = ''
      for (let i = 0; i < 4; i++) { code += chars.charAt(Math.floor(Math.random() * chars.length)) }
      this.currentCaptchaCode = code
      ctx.fillStyle = '#f6f8fa'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = 'bold 20px monospace'
      for (let i = 0; i < code.length; i++) {
        ctx.fillStyle = '#333'
        ctx.fillText(code[i], 16 + i * 22, 26)
      }
    },
    handleLogin() {
      if (this.loginForm.captchaInput.toUpperCase() !== this.currentCaptchaCode.toUpperCase()) {
        ElMessage.error('圖形驗證碼不正確')
        this.refreshCaptcha()
        return
      }
      const u = this.users.find(x => x.username === this.loginForm.username && x.password === this.loginForm.password)
      if (u) {
        if (!u.active) { ElMessage.error('該帳號已被停用'); return }
        this.currentUser = u
        this.isLoggedIn = true

        // 登入權限自動轉向控制
        if (u.roleId === 'SuperAdmin' || u.username === 'admin') {
          this.activeMenu = 'permission_system'
        } else {
          this.activeMenu = 'channel_weight'
        }

        ElMessage.success(`歡迎回來，${u.name}`)
      } else {
        ElMessage.error('帳號或密碼錯誤')
        this.refreshCaptcha()
      }
    },
    handleLogout() {
      this.isLoggedIn = false
      this.currentUser = null
      this.$nextTick(() => { this.refreshCaptcha() })
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
      this.userForm = { id: 'USR-' + (this.users.length + 1).toString().padStart(3, '0'), username: '', password: '', name: '', roleId: 'Operator', active: true }
      this.showUserModal = true
    },
    openEditUserModal(u) {
      this.isEditingUser = true
      this.userForm = { ...u, password: '' }
      this.showUserModal = true
    },
    saveUser() {
      const role = this.roles.find(r => r.id === this.userForm.roleId)
      this.userForm.roleName = role ? role.name : this.userForm.roleId

      if (this.isEditingUser) {
        const idx = this.users.findIndex(x => x.id === this.userForm.id)
        if (!this.userForm.password) this.userForm.password = this.users[idx].password
        this.users[idx] = { ...this.userForm }
        ElMessage.success('帳號更新成功')
      } else {
        this.users.push({ ...this.userForm })
        ElMessage.success('新增帳號成功')
      }
      this.showUserModal = false
    },
    savePermissions() {
      ElMessage.success('權限變更儲存成功！')
    },
    saveChannelWeight(c) { ElMessage.success('權限已更新') }
  }
})

app.use(ElementPlus)
app.mount('#app')
