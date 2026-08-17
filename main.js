import { createApp, ref, reactive, h } from 'vue'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  setup() {
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

    const triggerSecureAction = (actionType, row) => {
      currentActionType.value = actionType
      currentActionRow.value = row
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
      }, 1000)
    }

    return {
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
  },
  render() {
    return h('div', { class: 'bc-pay-layout', style: 'padding: 20px; font-family: sans-serif;' }, [
      // 頂部
      h('header', { style: 'background: #e3f0ff; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;' }, [
        h('h2', { style: 'margin: 0; color: #2d8cf0;' }, 'BC Pay 聚合支付管理後台 v3.0.0'),
        h('div', [
          h('span', { style: 'background: #e1f3d8; color: #67c23a; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px;' }, '2FA & 帳密保護已啟用'),
          h('span', '當前管理員: admin_master')
        ])
      ]),

      // 搜尋區塊
      h('div', { style: 'background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1); display: flex; gap: 10px;' }, [
        h('input', {
          value: this.searchOrderNo,
          onInput: (e) => this.searchOrderNo = e.target.value,
          placeholder: '輸入三號連動查詢 (商戶/系統/供應商單號)',
          style: 'padding: 8px; width: 300px; border: 1px solid #dcdfe6; border-radius: 4px;'
        }),
        h('button', {
          onClick: this.handleSearch,
          style: 'background: #409eff; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;'
        }, '關聯搜尋'),
        h('button', {
          onClick: () => this.securityModalVisible = true,
          style: 'background: #909399; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: auto;'
        }, 'Google 2FA 設定')
      ]),

      // 商戶列表表格
      h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);' }, [
        h('h3', { style: 'margin-top: 0;' }, '商戶餘額與關鍵操作'),
        h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
          h('thead', [
            h('tr', { style: 'border-bottom: 2px solid #e4e7ed; background: #f5f7fa;' }, [
              h('th', { style: 'padding: 12px;' }, '商戶 ID'),
              h('th', { style: 'padding: 12px;' }, '商戶名稱'),
              h('th', { style: 'padding: 12px;' }, '可用餘額 (PHP)'),
              h('th', { style: 'padding: 12px;' }, '結算模式'),
              h('th', { style: 'padding: 12px;' }, '操作')
            ])
          ]),
          h('tbody', this.merchantList.map(item => 
            h('tr', { style: 'border-bottom: 1px solid #e4e7ed;' }, [
              h('td', { style: 'padding: 12px;' }, item.id),
              h('td', { style: 'padding: 12px;' }, item.name),
              h('td', { style: 'padding: 12px; color: #67c23a; font-weight: bold;' }, `₱ ${item.balance.toLocaleString()}`),
              h('td', { style: 'padding: 12px;' }, item.settlement),
              h('td', { style: 'padding: 12px;' }, [
                h('button', {
                  onClick: () => this.triggerSecureAction('BALANCE_ADJUST', item),
                  style: 'background: #e6a23c; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 8px;'
                }, '餘額調整'),
                h('button', {
                  onClick: () => this.triggerSecureAction('PAYOUT', item),
                  style: 'background: #f56c6c; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;'
                }, '發起代付')
              ])
            ])
          ))
        ])
      ]),

      // 驗證彈窗 (模態框)
      this.confirmModalVisible ? h('div', {
        style: 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;'
      }, [
        h('div', { style: 'background: #fff; padding: 24px; border-radius: 8px; width: 400px;' }, [
          h('h3', { style: 'margin-top: 0; color: #f56c6c;' }, '高風險操作 - 三重安全驗證'),
          h('p', { style: 'font-size: 13px; color: #606266;' }, '請輸入管理員帳號、密碼及 Google 2FA 驗證碼：'),
          
          h('div', { style: 'margin-bottom: 12px;' }, [
            h('label', { style: 'display: block; font-size: 12px; margin-bottom: 4px;' }, '管理員帳號'),
            h('input', {
              value: this.confirmForm.adminAccount,
              onInput: (e) => this.confirmForm.adminAccount = e.target.value,
              placeholder: '請輸入管理員帳號',
              style: 'width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #dcdfe6; border-radius: 4px;'
            })
          ]),

          h('div', { style: 'margin-bottom: 12px;' }, [
            h('label', { style: 'display: block; font-size: 12px; margin-bottom: 4px;' }, '管理員密碼'),
            h('input', {
              type: 'password',
              value: this.confirmForm.adminPassword,
              onInput: (e) => this.confirmForm.adminPassword = e.target.value,
              placeholder: '請輸入管理員密碼',
              style: 'width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #dcdfe6; border-radius: 4px;'
            })
          ]),

          h('div', { style: 'margin-bottom: 20px;' }, [
            h('label', { style: 'display: block; font-size: 12px; margin-bottom: 4px;' }, 'Google Authenticator 驗證碼 (2FA)'),
            h('input', {
              value: this.confirmForm.totpCode,
              onInput: (e) => this.confirmForm.totpCode = e.target.value,
              placeholder: '請輸入 6 位數動態碼',
              maxLength: 6,
              style: 'width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #dcdfe6; border-radius: 4px;'
            })
          ]),

          h('div', { style: 'text-align: right;' }, [
            h('button', {
              onClick: () => this.confirmModalVisible = false,
              style: 'padding: 8px 16px; border: 1px solid #dcdfe6; background: #fff; border-radius: 4px; cursor: pointer; margin-right: 8px;'
            }, '取消'),
            h('button', {
              onClick: this.submitSecureVerification,
              style: 'padding: 8px 16px; border: none; background: #409eff; color: #fff; border-radius: 4px; cursor: pointer;'
            }, this.submitting ? '驗證中...' : '確認執行')
          ])
        ])
      ]) : null,

      // 2FA 設定彈窗
      this.securityModalVisible ? h('div', {
        style: 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;'
      }, [
        h('div', { style: 'background: #fff; padding: 24px; border-radius: 8px; width: 400px; text-align: center;' }, [
          h('h3', { style: 'margin-top: 0;' }, 'Google 2FA 雙重驗證綁定'),
          h('p', { style: 'font-size: 13px; color: #606266;' }, '掃描二維碼或輸入密鑰以綁定 Authenticator'),
          h('div', { style: 'border: 2px dashed #409eff; padding: 20px; margin: 15px 0; background: #ecf5ff; color: #409eff;' }, '🟢 [動態 QR Code]'),
          h('div', { style: 'background: #f4f4f5; padding: 8px; border-radius: 4px; font-family: monospace; margin-bottom: 15px;' }, 'BCPAY888SECRETKEY2026'),
          h('button', {
            onClick: () => this.securityModalVisible = false,
            style: 'padding: 8px 16px; border: none; background: #409eff; color: #fff; border-radius: 4px; cursor: pointer;'
          }, '關閉')
        ])
      ]) : null
    ])
  }
})

app.use(ElementPlus)
app.mount('#app')
