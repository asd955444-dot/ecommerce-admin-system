<template>
  <div class="bc-pay-layout">
    <!-- 頂部導覽列 -->
    <el-header class="header">
      <div class="logo">BC Pay 聚合支付管理後台 v3.0.0</div>
      <div class="user-info">
        <el-tag type="success" effect="plain" class="mr-2">2FA & 帳密保護已啟用</el-tag>
        <span>當前管理員: admin_master</span>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 側邊樹狀導覽選單 -->
      <el-aside width="240px" class="aside">
        <el-menu default-active="merchant-list" class="el-menu-vertical">
          <el-sub-menu index="merchant">
            <template #title>
              <el-icon><User /></el-icon>
              <span>商戶與帳號管理</span>
            </template>
            <el-menu-item index="merchant-list">商戶列表與開戶</el-menu-item>
            <el-menu-item index="balance-log">餘額調整紀錄</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="orders">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>交易訂單查詢</span>
            </template>
            <el-menu-item index="payin-orders">供應商/商戶代收訂單</el-menu-item>
            <el-menu-item index="payout-orders">供應商/商戶代付訂單</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="channels">
            <template #title>
              <el-icon><Operation /></el-icon>
              <span>渠道與流向管理</span>
            </template>
            <el-menu-item index="channel-config">東南亞通道 (GCash/Maya)</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="security-setting" @click="openSecurityModal">
            <el-icon><Lock /></el-icon>
            <span>Google 2FA 安全設定</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 主要內容區域 -->
      <el-main class="content">
        <!-- 搜尋與三號連動查詢過濾列 -->
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

            <el-button type="primary" icon="Search" @click="handleSearch">關聯搜尋</el-button>
          </div>
        </el-card>

        <!-- 商戶列表與資金操作卡片 -->
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>商戶餘額與渠道清單</span>
              <el-button type="primary" size="small" @click="openMerchantCreateModal">新增商戶開戶</el-button>
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
      </el-main>
    </el-container>

    <!-- 關鍵操作：管理員帳號 + 密碼 + Google Authenticator 三重安全驗證彈窗 -->
    <el-dialog
      v-model="confirmModalVisible"
      title="高風險操作 - 管理員三重安全驗證"
      width="460px"
      :close-on-click-modal="false"
      @closed="resetConfirmForm"
    >
      <el-alert
        title="為了保障資金與結算安全，請輸入您的管理員帳號、密碼及 6 位數 2FA 動態驗證碼。"
        type="warning"
        show-icon
        :closable="false"
        class="mb-4"
      />

      <el-form
        ref="confirmFormRef"
        :model="confirmForm"
        :rules="confirmRules"
        label-position="top"
      >
        <el-form-item label="管理員帳號" prop="adminAccount">
          <el-input
            v-model="confirmForm.adminAccount"
            placeholder="請輸入目前登入的管理帳號"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="管理員密碼" prop="adminPassword">
          <el-input
            v-model="confirmForm.adminPassword"
            type="password"
            show-password
            placeholder="請輸入管理員登入密碼"
            prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item label="Google Authenticator 驗證碼 (2FA)" prop="totpCode">
          <el-input
            v-model="confirmForm.totpCode"
            maxlength="6"
            placeholder="請輸入驗證 App 中的 6 位數動態碼"
            prefix-icon="Key"
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

    <!-- Google 2FA 綁定與設定管理彈窗 -->
    <el-dialog
      v-model="securityModalVisible"
      title="Google Authenticator (2FA) 安全綁定設定"
      width="500px"
    >
      <div class="security-settings-content">
        <p class="text-gray mb-3">掃描下方 QR Code 或手動輸入密鑰以綁定 Google Authenticator 雙重驗證。</p>
        <div class="qr-placeholder mb-3">
          <!-- 模擬未綁定時動態生成的 QR Code -->
          <div class="qr-box">
            <span class="text-sm text-blue">🟢 [動態產生的 QR Code]</span>
          </div>
        </div>
        <el-input
          readonly
          value="BCPAY888SECURITYSECRETKEY2026"
          class="mb-3"
        >
          <template #prepend>Secret Key</template>
        </el-input>
        <el-tag type="warning" class="mb-3">目前狀態：尚未綁定 (is2FAEnabled: false)</el-tag>
      </div>
      <template #footer>
        <el-button type="primary" @click="securityModalVisible = false">關閉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Document, Operation, Lock, Search, Key } from '@element-plus/icons-vue'

// 篩選與搜尋狀態
const selectedMerchant = ref('')
const searchOrderNo = ref('')

// 下拉選單商戶選項
const merchantOptions = ref([
  { value: 'M1001', label: 'M1001 - 東南亞電商平台' },
  { value: 'M1002', label: 'M1002 - 跨境遊戲娛樂' },
  { value: 'M1003', label: 'M1003 - 菲律賓 GCash 直連' }
])

// 商戶列表數據
const merchantList = ref([
  { id: 'M1001', name: '東南亞電商平台', balance: 2450000, settlement: 'D0', channels: 'Xendit/GCash', status: '啟用' },
  { id: 'M1002', name: '跨境遊戲娛樂', balance: 890000, settlement: 'T1', channels: 'Maya/GrabPay', status: '啟用' },
  { id: 'M1003', name: '菲律賓 GCash 直連', balance: 5320000, settlement: 'D0', channels: 'GCash API', status: '啟用' }
])

// 三重驗證彈窗控制
const confirmModalVisible = ref(false)
const submitting = ref(false)
const confirmFormRef = ref(null)
const currentActionType = ref('')
const currentActionRow = ref(null)

// 2FA 綁定設定彈窗控制
const securityModalVisible = ref(false)

// 三重驗證表單數據
const confirmForm = reactive({
  adminAccount: '',
  adminPassword: '',
  totpCode: ''
})

// 表單驗證規則
const confirmRules = reactive({
  adminAccount: [
    { required: true, message: '請輸入管理員帳號', trigger: 'blur' }
  ],
  adminPassword: [
    { required: true, message: '請輸入管理員密碼', trigger: 'blur' }
  ],
  totpCode: [
    { required: true, message: '請輸入 6 位數 2FA 動態驗證碼', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '驗證碼格式必須為 6 位數字', trigger: 'blur' }
  ]
})

// 點擊高風險操作 (觸發驗證)
const triggerSecureAction = (actionType, row) => {
  currentActionType.value = actionType
  currentActionRow.value = row
  confirmModalVisible.value = true
}

// 開啟 2FA 設定面板
const openSecurityModal = () => {
  securityModalVisible.value = true
}

// 開啟新增商戶開戶 Modal (佔位)
const openMerchantCreateModal = () => {
  ElMessage.info('即將開啟商戶開戶設定與通道分配表單')
}

// 關聯搜尋動作
const handleSearch = () => {
  ElMessage.success(`正在執行三號連動查詢，條件：單號 [${searchOrderNo.value || '無'}]`)
}

// 重置表單
const resetConfirmForm = () => {
  if (confirmFormRef.value) {
    confirmFormRef.value.resetFields()
  }
}

// 提交三重安全驗證至後端 API
const submitSecureVerification = async () => {
  if (!confirmFormRef.value) return

  await confirmFormRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const payload = {
        adminAccount: confirmForm.adminAccount,
        adminPassword: confirmForm.adminPassword,
        totpCode: confirmForm.totpCode,
        actionType: currentActionType.value,
        targetMerchantId: currentActionRow.value?.id
      }

      console.log('BC Pay 實時安全校驗 Payload:', payload)

      // 模擬後端 API 驗證耗時
      await new Promise((resolve) => setTimeout(resolve, 1200))

      ElMessage.success('管理員帳號密碼與 2FA 驗證通過，操作已成功執行！')
      confirmModalVisible.value = false
    } catch (error) {
      ElMessage.error('驗證失敗：帳號、密碼或 2FA 動態碼錯誤')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped>
.bc-pay-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f5ff;
}

.header {
  background-color: #e3f0ff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #c6e2ff;
}

.logo {
  font-weight: bold;
  font-size: 18px;
  color: #2d8cf0;
}

.main-container {
  flex: 1;
}

.aside {
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
}

.content {
  padding: 20px;
}

.filter-container {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 380px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mr-2 {
  margin-right: 8px;
}

.qr-placeholder {
  display: flex;
  justify-content: center;
}

.qr-box {
  width: 140px;
  height: 140px;
  border: 2px dashed #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f8ff;
  text-align: center;
  padding: 10px;
}
</style>
