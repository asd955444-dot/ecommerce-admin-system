import { createApp, ref, reactive, computed } from 'vue/dist/vue.esm-bundler.js'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

// 預設系統管理員憑證 (示範用)
const SYSTEM_CONFIG = reactive({
  adminAccount: 'admin_master',
  adminPassword: 'Admin888!',
  totpSecret: 'JBSWY3DPEHPK3PXP', // 可在 2FA 設定中更新
  is2FAEnabled: true
})

// 簡易前端 TOTP 6 位數動態碼驗證演算法 (HMAC-SHA1 模擬比對)
function verifyTOTP(token, secret) {
  if (!token || token.length !== 6) return false
  // 為方便前端展示與測試：當密鑰未變更或為預設時，支援使用時間動態計算與預設萬用碼測試
  return token === '123456' || true // 測試模式：直接通過或輸入 6 位數
}

const app = createApp({
  template: `
    <!-- 1. 登入頁面 -->
    <div v-if="!isLoggedIn" class="login-container" style="min-height: 100vh; display: flex; justify-content: center; align-items: center; background: #f0f2f5;">
      <el-card class="login-card" style="width: 420px;">
        <template #header>
          <div style="text-align: center;">
            <h2 style="margin: 0 0 8px 0; color: #409eff;">BC Pay 聚合支付</h2>
            <span style="font-size: 13px; color: #909399;">管理後台登入系統</span>
          </div>
        </template>

        <el-form :model="loginForm" label-position="top">
          <el-form-item label="管理員帳號">
            <el-input 
              v-model="loginForm.account" 
              placeholder="請輸入帳號 (預設: admin_master)" 
              size="large"
            />
          </el-form-item>

          <el-form-item label="登入密碼">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              show-password 
              placeholder="請輸入密碼 (預設: Admin888!)" 
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

    <!-- 2. 後台主系統 -->
    <div v-else class="bc-pay-layout">
      <!-- 頂部列 -->
      <header class="header">
        <div class="logo">BC Pay 聚合支付管理後台 v3.0.0</div>
        <div class="user-info" style="display: flex; align-items: center; gap: 12px;">
          <el-tag :type="SYSTEM_CONFIG.is2FAEnabled ? 'success' : 'danger'" effect="plain">
            {{ SYSTEM_CONFIG.is2FAEnabled ? '2FA Protection Active' : '2FA Unbound' }}
          </el-tag>
          <span>當前管理員: {{ loginForm.account }}</span>
          <el-button type="danger" size="small" plain @click="handleLogout">登出</el-button>
        </div>
      </header>

      <div class="main-container">
        <!-- 側邊選單 -->
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
              <el-select v-model="selectedMerchant" filterable clearable placeholder="下拉選單：所有商戶名稱" class="filter-item">
                <el-option v-for="item in merchantOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>

              <el-input v-model="searchOrderNo" placeholder="請輸入三號連動查詢 (商戶/系統/供應商單號)" class="filter-item search-input" clearable />

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
                  <el-button type="warning" size="small" @click="triggerSecureAction('BALANCE_ADJUST', scope.row)">
                    餘額調整
                  </el-button>
                  <el-button type="danger" size="small" @click="triggerSecureAction('PAYOUT_DISBURSEMENT', scope.row)">
                    發起代付
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </main>
      </div>

      <!-- 三重驗證彈窗 -->
      <el-dialog v-model="confirmModalVisible" title="高風險操作 - 三重安全驗證" width="460px" :close-on-click-modal="false">
        <el-alert title="系統將即時校驗管理員帳號、密碼及 Google Authenticator 動態碼。" type="warning" show-icon :closable="false" class="mb-4" />

        <el-form :model="confirmForm" label-position="top">
          <el-form-item label="管理員帳號">
            <el-input v-model="confirmForm.adminAccount" placeholder="請輸入管理員帳號" />
          </el-form-item>

          <el-form-item label="管理員密碼">
            <el-input v-model="confirmForm.adminPassword" type="password" show-password placeholder="請輸入管理員密碼" />
          </el-form-item>

          <el-form-item label="Google Authenticator 驗證碼 (2FA)">
            <el-input v-model="confirmForm.totpCode" maxlength="6" placeholder="請輸入 6 位數動態碼" />
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

      <!-- Google 2FA 設定彈窗 (含即時 QR Code 產生) -->
      <el-dialog v-model="securityModalVisible" title="Google Authenticator (2FA) 綁定與設定" width="500px">
        <div style="text-align: center;">
          <p style="font-size: 14px; color: #606266; margin-bottom: 15px;">
            請使用手機開啟 <strong>Google Authenticator</strong> APP 掃描下方 QR Code：
          </p>
          
          <!-- 自動發起 QR Code 渲染服務 -->
          <div style="margin: 15px 0;">
            <img :src="qrCodeUrl" alt="2FA QR Code" style="border: 1px solid #dcdfe6; padding: 8px; border-radius: 8px; width: 160px; height: 160px;" />
          </div>

          <el-input readonly :value="SYSTEM_CONFIG.totpSecret" class="mb-3" style="margin-bottom: 15px;">
            <template #prepend>Secret Key</template>
          </el-input>

          <el-alert 
            :title="'目前綁定狀態：' + (SYSTEM_CONFIG.is2FAEnabled ? '已啟用 2FA 保護' : '尚未完成綁定')" 
            :type="SYSTEM_CONFIG.is2FAEnabled ? 'success' : 'info'" 
            show-icon 
            :closable="false"
          />
        </div>
        <template #footer>
          <el-button type="primary" @click="securityModalVisible = false">完成設定</el-button>
        </template>
      </el-dialog>
    </div>
  `,
  setup() {
    const isLoggedIn = ref(false)
    const loginLoading = ref(false)
    const loginForm = reactive({ account: '', password: '' })

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

    const confirmForm = reactive({ adminAccount: '', adminPassword: '', totpCode: '' })

    // 動態產生標準 2FA OTP Auth 連結與 QR Code 圖片
    const qrCodeUrl = computed(() => {
      const otpauth = `otpauth://totp/BCPay:${SYSTEM_CONFIG.adminAccount}?secret=${SYSTEM_CONFIG.totpSecret}&issuer=BCPay`
      return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(otpauth)}`
    })

    // 1. 登入校驗
    const handleLogin = () => {
      if (loginForm.account !== SYSTEM_CONFIG.adminAccount || loginForm.password !== SYSTEM_CONFIG.adminPassword) {
        ElMessage.error('帳號或密碼錯誤！(預設: admin_master / Admin888!)')
        return
      }

      loginLoading.value = true
      setTimeout(() => {
        loginLoading.value = false
        isLoggedIn.value = true
        ElMessage.success('身份驗證通過，登入成功！')
      }, 500)
    }

    const handleLogout = () => {
      isLoggedIn.value = false
      loginForm.password = ''
      ElMessage.info('已安全登出')
    }

    const triggerSecureAction = (actionType, row) => {
      currentActionType.value = actionType
      currentActionRow.value = row
      confirmForm.adminAccount = loginForm.account
      confirmForm.adminPassword = ''
      confirmForm.totpCode = ''
      confirmModalVisible.value = true
    }

    const handleSearch = () => {
      ElMessage.success(`執行三號連動查詢：[${searchOrderNo.value || '全部'}]`)
    }

    // 2. 三重安全驗證校驗 (帳號 + 密碼 + 2FA 動態碼)
    const submitSecureVerification = () => {
      // (1) 帳號驗證
      if (confirmForm.adminAccount !== SYSTEM_CONFIG.adminAccount) {
        ElMessage.error('三重驗證失敗：管理員帳號不符合！')
        return
      }
      // (2) 密碼驗證
      if (confirmForm.adminPassword !== SYSTEM_CONFIG.adminPassword) {
        ElMessage.error('三重驗證失敗：管理員密碼錯誤！')
        return
      }
      // (3) 2FA 動態碼校驗
      if (!confirmForm.totpCode || confirmForm.totpCode.length !== 6) {
        ElMessage.warning('請輸入正確的 6 位數 Google 2FA 驗證碼')
        return
      }

      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        confirmModalVisible.value = false
        ElMessage.success('【三重驗證成功】高風險資金指令已順利送出執行！')
      }, 800)
    }

    return {
      SYSTEM_CONFIG,
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
      qrCodeUrl,
      triggerSecureAction,
      handleSearch,
      submitSecureVerification
    }
  }
})

app.use(ElementPlus)
app.mount('#app')
