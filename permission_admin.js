import { createApp } from 'vue/dist/vue.esm-bundler.js'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  template: `
    <div style="min-height: 100vh; background: #f0f2f5; padding: 24px;">
      
      <!-- 頂部 Header -->
      <div style="background: #fff; padding: 16px 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="margin: 0; color: #1890ff; font-size: 20px;">🛡️ BCPay 帳號與權限管理系統</h2>
          <p style="margin: 4px 0 0 0; color: #8c8c8c; font-size: 13px;">設定管理員帳號、角色分工與後台選單訪問權限</p>
        </div>
        <div>
          <button class="btn btn-primary" @click="openAddUserModal">➕ 新增帳號</button>
          <button class="btn btn-success" style="margin-left: 8px;" @click="exportUsersToBCPay">🔄 同步至 BCPay 系統</button>
        </div>
      </div>

      <!-- 主要分頁切換 -->
      <div style="background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        
        <div style="border-bottom: 1px solid #f0f0f0; margin-bottom: 20px; display: flex; gap: 20px;">
          <div 
            :style="{ padding: '10px 16px', cursor: 'pointer', fontWeight: 'bold', borderBottom: activeTab === 'users' ? '2px solid #1890ff' : 'none', color: activeTab === 'users' ? '#1890ff' : '#666' }"
            @click="activeTab = 'users'"
          >
            👥 帳號管理 ({{ users.length }})
          </div>
          <div 
            :style="{ padding: '10px 16px', cursor: 'pointer', fontWeight: 'bold', borderBottom: activeTab === 'roles' ? '2px solid #1890ff' : 'none', color: activeTab === 'roles' ? '#1890ff' : '#666' }"
            @click="activeTab = 'roles'"
          >
            🔑 角色與權限分配
          </div>
        </div>

        <!-- 1. 帳號管理頁面 -->
        <div v-if="activeTab === 'users'">
          <table class="data-table">
            <thead>
              <tr>
                <th>用戶 ID</th>
                <th>登入帳號</th>
                <th>使用者姓名</th>
                <th>所屬角色</th>
                <th>目前狀態</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td><code>{{ user.id }}</code></td>
                <td><strong>{{ user.username }}</strong></td>
                <td>{{ user.name }}</td>
                <td>
                  <span class="tag" :style="{ background: getRoleColor(user.roleId).bg, color: getRoleColor(user.roleId).color }">
                    {{ getRoleName(user.roleId) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="user.active ? 'status-success' : 'status-disabled'">
                    {{ user.active ? '🟢 啟用中' : '🔴 已停用' }}
                  </span>
                </td>
                <td style="font-size: 12px; color: #8c8c8c;">{{ user.createdAt }}</td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-warning" style="padding: 2px 8px; font-size: 12px;" @click="openEditUserModal(user)">✏️ 編輯</button>
                    <button class="btn" :class="user.active ? 'btn-danger' : 'btn-success'" style="padding: 2px 8px; font-size: 12px;" @click="toggleUserStatus(user)">
                      {{ user.active ? '停用' : '啟用' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. 角色與權限分配頁面 -->
        <div v-else-if="activeTab === 'roles'">
          <div style="display: flex; gap: 24px;">
            <!-- 左側角色清單 -->
            <div style="width: 260px; border-right: 1px solid #f0f0f0; padding-right: 16px;">
              <h4 style="margin-top: 0;">系統角色設定</h4>
              <div 
                v-for="role in roles" 
                :key="role.id"
                @click="selectedRole = role"
                :style="{ padding: '12px', borderRadius: '6px', cursor: 'pointer', marginBottom: '8px', background: selectedRole.id === role.id ? '#e6f7ff' : '#fafafa', border: selectedRole.id === role.id ? '1px solid #91d5ff' : '1px solid #f0f0f0' }"
              >
                <div style="font-weight: bold; color: #333;">{{ role.name }}</div>
                <div style="font-size: 12px; color: #8c8c8c; margin-top: 4px;">{{ role.description }}</div>
              </div>
            </div>

            <!-- 右側權限勾選表格 -->
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="margin: 0;">⚙️ 設定【{{ selectedRole.name }}】可訪問的模組權限</h4>
                <button class="btn btn-primary" @click="saveRolePermissions">💾 儲存權限設定</button>
              </div>

              <div style="background: #fafafa; padding: 16px; border-radius: 6px; border: 1px solid #f0f0f0;">
                <div v-for="menu in allPermissions" :key="menu.key" style="margin-bottom: 16px; background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #e8e8e8;">
                  <div style="font-weight: bold; margin-bottom: 8px; color: #1890ff;">
                    <input type="checkbox" :checked="isAllChildChecked(selectedRole, menu)" @change="toggleParentMenu(selectedRole, menu)" />
                    {{ menu.label }}
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 12px; padding-left: 20px;">
                    <label v-for="child in menu.children" :key="child.key" style="font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                      <input type="checkbox" :value="child.key" v-model="selectedRole.permissions" />
                      {{ child.label }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 彈窗：新增/編輯帳號 -->
      <div v-if="showUserModal" class="modal-backdrop">
        <div class="modal-box" style="width: 450px;">
          <h3 style="margin-top:0; color: #1890ff;">{{ isEditing ? '✏️ 編輯帳號資訊' : '➕ 新增管理員帳號' }}</h3>
          
          <div class="form-group" style="margin-bottom: 12px;">
            <label style="display:block; margin-bottom: 4px; font-weight:bold;">登入帳號：</label>
            <input type="text" v-model="userForm.username" :disabled="isEditing" class="input-control" placeholder="例: operator02" style="width:100%; box-sizing:border-box;">
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label style="display:block; margin-bottom: 4px; font-weight:bold;">登入密碼：</label>
            <input type="password" v-model="userForm.password" class="input-control" :placeholder="isEditing ? '若不修改請留空' : '請輸入密碼'" style="width:100%; box-sizing:border-box;">
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label style="display:block; margin-bottom: 4px; font-weight:bold;">使用者真實姓名：</label>
            <input type="text" v-model="userForm.name" class="input-control" placeholder="例: 張大明" style="width:100%; box-sizing:border-box;">
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label style="display:block; margin-bottom: 4px; font-weight:bold;">分配角色：</label>
            <select v-model="userForm.roleId" class="input-control" style="width:100%;">
              <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display:block; margin-bottom: 4px; font-weight:bold;">帳號狀態：</label>
            <select v-model="userForm.active" class="input-control" style="width:100%;">
              <option :value="true">🟢 啟用</option>
              <option :value="false">🔴 停用</option>
            </select>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
            <button class="btn" @click="showUserModal = false">取消</button>
            <button class="btn btn-primary" @click="saveUser">確認儲存</button>
          </div>
        </div>
      </div>

    </div>
  `,
  data() {
    return {
      activeTab: 'users',
      showUserModal: false,
      isEditing: false,

      // 角色定義
      roles: [
        { id: 'SuperAdmin', name: '超級管理員', description: '擁有系統全功能完整權限', permissions: ['channel_weight', 'channel_toggle', 'sup_collect', 'sup_collect_exact', 'sup_payout', 'sup_payout_exact', 'collect_orders', 'collect_exact', 'payout_orders', 'payout_exact', 'merchant_list', 'settlement_channel_total', 'settlement_channel_single', 'settlement_collect', 'settlement_payout', 'settlement_merchant_single', 'settlement_merchant_total', 'settlement_logs'] },
        { id: 'Operator', name: '營運專員', description: '負責渠道監控、訂單查詢與商戶配置', permissions: ['channel_weight', 'channel_toggle', 'collect_orders', 'collect_exact', 'payout_orders', 'payout_exact', 'merchant_list'] },
        { id: 'Finance', name: '財務專員', description: '負責總跑量對帳與資金結算明細', permissions: ['sup_collect', 'sup_payout', 'collect_orders', 'payout_orders', 'settlement_channel_total', 'settlement_collect', 'settlement_payout', 'settlement_logs'] }
      ],

      selectedRole: null,

      // 帳號資料庫
      users: [
        { id: 'USR-001', username: 'admin', password: '123', name: '超級管理員', roleId: 'SuperAdmin', active: true, createdAt: '2026-01-01 10:00' },
        { id: 'USR-002', username: 'operator', password: '456', name: '林營運', roleId: 'Operator', active: true, createdAt: '2026-02-10 14:20' },
        { id: 'USR-003', username: 'finance', password: '789', name: '陳財務', roleId: 'Finance', active: true, createdAt: '2026-03-05 09:15' }
      ],

      userForm: { id: '', username: '', password: '', name: '', roleId: 'Operator', active: true },

      // 主系統選單權限模組
      allPermissions: [
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
        {
          key: 'merchant_group',
          label: '🏢 商戶管理',
          children: [
            { key: 'merchant_list', label: '商戶列表與配置' }
          ]
        },
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
            { key: 'settlement_logs', label: '結算明細' }
          ]
        }
      ]
    }
  },
  created() {
    this.selectedRole = this.roles[0]
  },
  methods: {
    getRoleName(roleId) {
      const role = this.roles.find(r => r.id === roleId)
      return role ? role.name : roleId
    },
    getRoleColor(roleId) {
      const map = {
        SuperAdmin: { bg: '#fff0f6', color: '#c41d7f' },
        Operator: { bg: '#e6f7ff', color: '#1890ff' },
        Finance: { bg: '#f6ffed', color: '#52c41a' }
      }
      return map[roleId] || { bg: '#f5f5f5', color: '#666' }
    },
    openAddUserModal() {
      this.isEditing = false
      this.userForm = { id: 'USR-' + (this.users.length + 1).toString().padStart(3, '0'), username: '', password: '', name: '', roleId: 'Operator', active: true }
      this.showUserModal = true
    },
    openEditUserModal(user) {
      this.isEditing = true
      this.userForm = { ...user, password: '' }
      this.showUserModal = true
    },
    saveUser() {
      if (!this.userForm.username || !this.userForm.name) {
        ElMessage.warning('請填寫完整帳號與姓名')
        return
      }
      if (!this.isEditing && !this.userForm.password) {
        ElMessage.warning('新增帳號請設定密碼')
        return
      }

      if (this.isEditing) {
        const idx = this.users.findIndex(u => u.id === this.userForm.id)
        if (idx !== -1) {
          if (!this.userForm.password) {
            this.userForm.password = this.users[idx].password // 保留原密碼
          }
          this.users[idx] = { ...this.userForm }
        }
        ElMessage.success('帳號修改成功')
      } else {
        this.userForm.createdAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
        this.users.push({ ...this.userForm })
        ElMessage.success('成功新增管理員帳號！')
      }
      this.showUserModal = false
    },
    toggleUserStatus(user) {
      user.active = !user.active
      ElMessage.info(`帳號 [${user.username}] 已切換為 ${user.active ? '🟢 啟用' : '🔴 停用'}`)
    },

    // 權限 Checkbox 邏輯
    isAllChildChecked(role, menu) {
      return menu.children.every(child => role.permissions.includes(child.key))
    },
    toggleParentMenu(role, menu) {
      const allChecked = this.isAllChildChecked(role, menu)
      menu.children.forEach(child => {
        const idx = role.permissions.indexOf(child.key)
        if (allChecked) {
          if (idx !== -1) role.permissions.splice(idx, 1)
        } else {
          if (idx === -1) role.permissions.push(child.key)
        }
      })
    },
    saveRolePermissions() {
      ElMessage.success(`【${this.selectedRole.name}】的權限變更已成功儲存！`)
    },
    exportUsersToBCPay() {
      ElMessage.success('已順利同步最新的帳號與權限列表至 BCPay 系統！')
    }
  }
})

app.use(ElementPlus)
app.mount('#app')
