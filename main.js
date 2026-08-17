import { createApp, ref, reactive } from 'vue/dist/vue.esm-bundler.js'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  template: `
    <!-- 1. 登入畫面 (未登入時顯示) -->
    <div v-if="!isLoggedIn" class="login-container" style="min-height: 100vh; display: flex; justify-content: center; align-items: center; background: #f0f2f5;">
      <el-card class="login-card" style="width: 420px; padding: 10px;">
        <template #header>
          <div style="text-align: center;">
            <h2 style="margin: 0 0 8px 0; color: #409eff;">BC Pay 聚合支付</h2>
            <span style="font-size: 13px; color: #909399;">管理後台系統 v3.0.0</span>
          </div>
        </template>

        <el-form :model="loginForm" label-position="top">
          <el-form-item label="管理員帳號">
            <el-input 
              v-model="loginForm.account" 
              placeholder="請輸入管理員帳號 (預設: admin)" 
              size="large"
            />
          </el-form-item>

          <el-form-item label="登入密碼">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              show-password 
              placeholder="請輸入密碼 (預設: 123456)" 
              size="large"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-button 
            type="primary" 
            size="large" 
            style="width: 100%; margin-top: 10px;" 
            :loading="loginLoading"
            @click="handleLogin"
          >
            登入系統
          </el-button>
        </el-form>
      </el-card>
    </div>

    <!-- 2. 後台主系統 (登入後顯示) -->
    <div v-else class="bc-pay-layout">
      <!-- 頂部列 -->
      <header class="header">
        <div class="logo">BC Pay 聚合支付管理後台 v3.0.0</div>
        <div class="user-info" style="display: flex; align-items: center; gap: 12px;">
          <el-tag type="success" effect="plain">2FA & 帳密保護已啟用</el-tag>
          <span>當前管理員: {{ loginForm.account || 'admin_master' }}</span>
          <el-button type="danger" size="small" plain @click="handleLogout">登出</el-button>
        </div>
      </header>

      <div class="main-container">
        <!-- 側邊欄選單 -->
        <aside class="aside">
          <el-menu default-active="merchant-list" class="el-menu-vertical">
            <el-sub-menu index="merchant">
              <template #title>
                <span>商戶與帳號管理</span>
              </template>
              <el-menu-item index="merchant-list">商戶列表與開戶</el-menu-item>
              <el-menu-item index="balance-log">餘額調整紀錄</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="orders">
              <template #title>
                <span>交易訂單查詢</span>
              </template>
              <el-menu-item index="payin-orders">代收訂單</el-menu-item>
              <el-menu-item index="payout-orders">代付訂單</el-menu-item>
            </el-sub-menu>

            <el-menu-item index="security-setting" @click="securityModalVisible = true">
              <span>Google 2FA 安全設定</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <!-- 主要內容區 -->
        <main class="content">
          <el-card class="box-card mb-4">
            <div class="filter-container">
              <el-select
                v-model="selectedMerchant"
                filterable
                clearable
                placeholder="下拉選單：所有商戶名稱"
                class="filter-item"
              >
                <el-option
                  v-for="item in merchantOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>

              <el-input
                v-model="searchOrderNo"
                placeholder="請輸入三號連動查詢 (商戶/系統/供應商單號)"
                class="filter-item search-input"
                clearable
              />

              <el-button type="primary" @click="handleSearch">關聯搜尋</el-button>
            </div>
          </el-card>

          <!-- 商戶列表卡片 -->
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>商戶餘額與渠道清單</span>
                <el-button type="primary" size="small">新增商戶開戶</el-button>
              </div>
            </template>

            <el-table :data="merchantList" border style="width: 100%">
              <el-table-column prop="id" label="商戶 ID" width="110" />
              <el-table-column prop="name" label="商戶名稱" width="180" />
              <el-table-column prop="balance" label="可用餘額 (PHP)" width="160">
                <template #default="scope">
                  ₱ {{ scope.row.balance.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="settlement" label="結算模式" width="100" />
              <el-table-column prop="channels" label="已串通道" width="140">
                <template #default="scope">
                  <el-tag size="small" type="info">{{ scope.row.channels }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="狀態" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === '啟用' ? 'success' : 'danger'">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="高風險關鍵操作" min-width="220">
                <template #default="scope">
                  <el-button
                    type="warning"
                    size="small"
                    @click="triggerSecureAction('BALANCE_ADJUST', scope.row)"
                  >
                    餘額調整
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="triggerSecureAction('PAYOUT_DISBURSEMENT', scope.row)"
                  >
                    發起代付
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </main>
      </div>

      <!-- 三重驗證彈窗 -->
      <el-dialog
        v-model="confirmModalVisible"
        title="高風險操作 - 管理員三重安全驗證"
        width="460px"
        :close-on-click-modal="false"
      >
        <el-alert
          title="為了保障資金與結算安全，請輸入您的管理員帳號、密碼及 6 位數 2FA 動態驗證碼。"
          type="warning"
          show-icon
          :closable="false"
          class="mb-4"
        />

        <el-form :model="confirmForm" label-position="top">
          <el-form-item label="管理員帳號">
            <el-input
              v-model="confirmForm.adminAccount"
              placeholder="請輸入管理員帳號"
            />
          </el-form-item>

          <el-form-item label="管理員密碼">
            <el-input
              v-model="confirmForm.adminPassword"
              type="password"
              show-password
              placeholder="請輸入管理員密碼"
            />
          </el-form-item>

          <el-form-item label="Google Authenticator 驗證碼 (2FA)">
            <el-input
              v-model="confirmForm.totpCode"
              maxlength="6"
              placeholder="請輸入 6 位數動態碼"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="confirmModalVisible = false">取消</el-button>
            <el-button type="primary" :loading="submitting" @click="submitSecureVerification">
              確認驗證並執行
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 2FA 設定彈窗 -->
      <el-dialog
        v-model="securityModalVisible"
        title="Google Authenticator (2FA) 安全綁定設定"
        width="500px"
      >
        <div class="security-settings-content">
          <p class="mb-3">掃描下方 QR Code 或手動輸入密鑰以綁定 Google Authenticator 雙重驗證。</p>
          <div class="qr-placeholder mb-3">
            <div class="qr-box">🟢 [動態產生的 QR Code]</div>
          </div>
          <el-input readonly value="BCPAY888SECURITYSECRETKEY2026" class="mb-3">
            <template #prepend>Secret Key</template>
          </el-input>
          <el-tag type="warning">目前狀態：尚未綁定 (is2FAEnabled: false)</el-tag>
        </div>
      </dialog>
    </div>
  `,
  setup() {
    // 登入狀態與表單
    const isLoggedIn = ref(false)
    const loginLoading = ref(false)
    const loginForm = reactive({
      account: '',
      password: ''
    })

    // 後台狀態
    const selectedMerchant = ref('')
    const searchOrderNo = ref('')
    const confirmModalVisible = ref(false)
    const securityModalVisible = ref(false)
    const submitting = ref(false)
    const currentActionType = ref('')
    const currentActionRow = ref(null)

    const merchantOptions = ref([
      { value: 'M1001', label: 'M1001 - 東南亞電商平台' },
      { value: 'M1002', label: 'M1002 - 跨境遊戲娛樂' },
      { value: 'M1003', label: 'M1003 - 菲律賓 GCash 直連' }
    ])

    const merchantList = ref([
      { id: 'M1001', name: '東南亞電商平台', balance: 2450000, settlement: 'D0', channels: 'Xendit/GCash', status: '啟用' },
      { id: 'M1002', name: '跨境遊戲娛樂', balance: 890000, settlement: 'T1', channels: 'Maya/GrabPay', status: '啟用' },
      { id: 'M1003', name: '菲律賓 GCash 直連', balance: 5320000, settlement: 'D0', channels: 'GCash API', status: '啟用' }
    ])

    const confirmForm = reactive({
      adminAccount: '',
      adminPassword: '',
      totpCode: ''
    })

    // 登入處理
    const handleLogin = () => {
      if (!loginForm.account || !loginForm.password) {
        ElMessage.warning('請輸入管理員帳號與密碼')
        return
      }

      loginLoading.value = true
      setTimeout(() => {
        loginLoading.value = false
        isLoggedIn.value = true
        ElMessage.success('登入成功！歡迎使用 BC Pay 管理後台')
      }, 600)
    }

    // 登出處理
    const handleLogout = () => {
      isLoggedIn.value = false
      loginForm.password = ''
      ElMessage.info('已成功登出系統')
    }

    const triggerSecureAction = (actionType, row) => {
      currentActionType.value = actionType
      currentActionRow.value = row
      confirmForm.adminAccount = loginForm.account || 'admin_master'
      confirmModalVisible.value = true
    }

    const handleSearch = () => {
      ElMessage.success(`執行三號連動查詢，條件：[${searchOrderNo.value || '無'}]`)
    }

    const submitSecureVerification = () => {
      if (!confirmForm.adminAccount || !confirmForm.adminPassword || !confirmForm.totpCode) {
        ElMessage.warning('請完整填寫管理員帳號、密碼與 2FA 驗證碼')
        return
      }
      submitting.value = true
      setTimeout(() => {
        ElMessage.success('管理員帳密與 2FA 驗證通過，操作已成功執行！')
        submitting.value = false
        confirmModalVisible.value = false
        confirmForm.adminPassword = ''
        confirmForm.totpCode = ''
      }, 1000)
    }

    return {
      isLoggedIn,
      loginLoading,
      loginForm,
      handleLogin,
      handleLogout,
      selectedMerchant,
      searchOrderNo,
      confirmModalVisible,
      securityModalVisible,
      submitting,
      merchantOptions,
      merchantList,
      confirmForm,
      triggerSecureAction,
      handleSearch,
      submitSecureVerification
    }
  }
})

app.use(ElementPlus)
app.mount('#app')
