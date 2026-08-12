import { createApp, h } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const STORAGE_KEY_MERCHANTS = 'bcpay_merchants_v2'
const STORAGE_KEY_LOGS = 'bcpay_balance_logs_v1'

const app = createApp({
  data() {
    return {
      activeMenu: 'run_summary',
      payoutAuditTab: 'requests', // 'requests' | 'logs'
      merchantTab: 'query',

      // 查詢條件狀態
      queryDate: '2026-08-12',
      queryMonth: '2026-08',
      supplierOrderNo: '',
      systemOrderNo: '',
      searchMerchantName: '',
      searchChannel: '',
      logMerchantFilter: '', // 明細篩選

      // 編輯餘額彈窗控制
      showBalanceModal: false,
      selectedMerchantForBalance: null,
      balanceAdjustAmount: 0,
      balanceAdjustReason: '',

      // 新增商戶表單
      newMerchant: {
        customId: '',
        name: '',
        collectRate: '0.6%',
        payoutRate: '0.3% + ￥2.00',
        channelConfigs: {
          alipay: { enabled: true, rate: '0.6%', limit: '50,000' },
          wechat: { enabled: true, rate: '0.6%', limit: '20,000' },
          linepay: { enabled: true, rate: '2.2%', limit: '30,000' },
          ecpay: { enabled: false, rate: '2.85%', limit: '100,000' },
          stripe: { enabled: false, rate: '3.4%', limit: '10,000' }
        }
      },

      // 全局通道列表
      paymentGateways: [
        { id: 'alipay', name: '支付寶 (Alipay)', icon: '🟦', fee: '0.6%', status: true },
        { id: 'wechat', name: '微信支付 (WeChat Pay)', icon: '🟩', fee: '0.6%', status: true },
        { id: 'linepay', name: 'LINE Pay', icon: '🟢', fee: '2.2%', status: true },
        { id: 'ecpay', name: '綠界 ECPay (信用卡/超商)', icon: '🟧', fee: '2.85%', status: true },
        { id: 'stripe', name: 'Stripe (國際信用卡)', icon: '💜', fee: '3.4% + $0.30', status: false }
      ],

      // 商戶列表 (擴充至 6 家)
      merchants: [
        { id: 'MCH-1001', name: '閃電電商', appKey: 'bc_live_99812a', status: '正常', collectRate: '0.6%', payoutRate: '0.3% + ￥2.00', rawBalance: 158200.00 },
        { id: 'MCH-1002', name: '海淘優選', appKey: 'bc_live_33419b', status: '正常', collectRate: '0.8%', payoutRate: '0.5% + ￥2.00', rawBalance: 42100.00 },
        { id: 'MCH-1003', name: '星光娛樂', appKey: 'bc_live_77103c', status: '正常', collectRate: '0.7%', payoutRate: '0.4% + ￥2.00', rawBalance: 33405.00 },
        { id: 'MCH-1004', name: '極速跨境', appKey: 'bc_live_88201d', status: '正常', collectRate: '0.55%', payoutRate: '0.25% + ￥2.00', rawBalance: 289000.00 },
        { id: 'MCH-1005', name: '極光數位', appKey: 'bc_live_11092e', status: '正常', collectRate: '0.65%', payoutRate: '0.35% + ￥2.00', rawBalance: 12500.00 },
        { id: 'MCH-1006', name: '華夏智付', appKey: 'bc_live_55489f', status: '正常', collectRate: '0.6%', payoutRate: '0.3% + ￥2.00', rawBalance: 76400.00 }
      ],

      // 商戶餘額變動紀錄/結算日誌
      balanceLogs: [
        { id: 'LOG-20260812-001', merchantName: '閃電電商', type: '手動充值', beforeBal: 108200.00, changeAmt: 50000.00, afterBal: 158200.00, reason: '線上大額預充值結算', operator: '系統管理員', time: '2026-08-12 10:15:22' },
        { id: 'LOG-20260812-002', merchantName: '海淘優選', type: '下發扣款', beforeBal: 62100.00, changeAmt: -20000.00, afterBal: 42100.00, reason: '下發審核通過打款 [WD-2026081105]', operator: '財務專員', time: '2026-08-12 11:30:10' },
        { id: 'LOG-20260811-003', merchantName: '星光娛樂', type: '手動沖銷', beforeBal: 35405.00, changeAmt: -2000.00, afterBal: 33405.00, reason: '扣除異常訂單退款手續費', operator: '風控管理員', time: '2026-08-11 16:45:00' },
        { id: 'LOG-20260811-004', merchantName: '極速跨境', type: '代收結算', beforeBal: 239000.00, changeAmt: 50000.00, afterBal: 289000.00, reason: '日終自動跑量結算入帳', operator: 'System', time: '2026-08-11 23:59:59' }
      ],

      // 代收付跑量總表數據 (多單號)
      runSummaryList: [
        { date: '2026-08-12', merchant: '閃電電商', channel: '微信支付', collectAmt: 158200, payoutAmt: 50000, feeAmt: 1249.20, netAmt: 106950.80, count: 420 },
        { date: '2026-08-12', merchant: '海淘優選', channel: '支付寶', collectAmt: 89300, payoutAmt: 20000, feeAmt: 695.80, netAmt: 68604.20, count: 215 },
        { date: '2026-08-12', merchant: '星光娛樂', channel: 'LINE Pay', collectAmt: 42500, payoutAmt: 8000, feeAmt: 1095.00, netAmt: 33405.00, count: 98 },
        { date: '2026-08-12', merchant: '極速跨境', channel: '支付寶', collectAmt: 310000, payoutAmt: 120000, feeAmt: 2015.00, netAmt: 187985.00, count: 680 },
        { date: '2026-08-12', merchant: '華夏智付', channel: '微信支付', collectAmt: 92000, payoutAmt: 15000, feeAmt: 597.00, netAmt: 76403.00, count: 190 },
        { date: '2026-08-11', merchant: '閃電電商', channel: '微信支付', collectAmt: 182000, payoutAmt: 65000, feeAmt: 1442.00, netAmt: 115558.00, count: 510 },
        { date: '2026-08-11', merchant: '極光數位', channel: '綠界 ECPay', collectAmt: 25000, payoutAmt: 5000, feeAmt: 732.50, netAmt: 19267.50, count: 45 }
      ],

      transactions: [
        { id: 'TX-20260812-9901', channel: '微信支付', channelIcon: '🟩', orderId: 'BC-IN-2026081201', amount: '￥299.00', status: '交易成功', date: '2026-08-12' },
        { id: 'TX-20260812-9902', channel: '支付寶', channelIcon: '🟦', orderId: 'BC-IN-2026081202', amount: '￥1,280.00', status: '交易成功', date: '2026-08-12' },
        { id: 'TX-20260812-9903', channel: 'LINE Pay', channelIcon: '🟢', orderId: 'BC-OUT-2026081202', amount: 'NT$ 2,500', status: '交易成功', date: '2026-08-12' },
        { id: 'TX-20260812-9904', channel: '支付寶', channelIcon: '🟦', orderId: 'BC-IN-2026081203', amount: '￥8,800.00', status: '交易成功', date: '2026-08-12' },
        { id: 'TX-20260812-9905', channel: '微信支付', channelIcon: '🟩', orderId: 'BC-OUT-2026081204', amount: '￥15,000.00', status: '交易成功', date: '2026-08-12' }
      ],

      supplierOrders: [
        { suppOrderNo: 'SUP-COL-88091', sysOrderNo: 'BC-IN-2026081201', suppName: '極速支付通道A', amount: '￥5,000.00', status: '成功', matchType: '精準成功', date: '2026-08-12' },
        { suppOrderNo: 'SUP-PAY-77102', sysOrderNo: 'BC-OUT-2026081202', suppName: '順達代付網關', amount: '￥12,300.00', status: '處理中', matchType: '精準確認說是', date: '2026-08-12' },
        { suppOrderNo: 'SUP-COL-99201', sysOrderNo: 'BC-IN-2026081203', suppName: '環球金融網關B', amount: '￥8,800.00', status: '成功', matchType: '精準成功', date: '2026-08-12' },
        { suppOrderNo: 'SUP-PAY-66309', sysOrderNo: 'BC-OUT-2026081204', suppName: '順達代付網關', amount: '￥15,000.00', status: '成功', matchType: '精準成功', date: '2026-08-12' }
      ],

      collectOrders: [
        { mchOrderNo: 'MCH-ORD-20260812-001', sysOrderNo: 'BC-IN-2026081201', suppOrderNo: 'SUP-COL-88091', merchant: '閃電電商', amount: '￥5,000.00', fee: '￥30.00', status: '已代收成功', date: '2026-08-12' },
        { mchOrderNo: 'MCH-ORD-20260812-002', sysOrderNo: 'BC-IN-2026081202', suppOrderNo: 'SUP-COL-88095', merchant: '海淘優選', amount: '￥1,200.00', fee: '￥7.20', status: '等待支付', date: '2026-08-12' },
        { mchOrderNo: 'MCH-ORD-20260812-003', sysOrderNo: 'BC-IN-2026081203', suppOrderNo: 'SUP-COL-99201', merchant: '極速跨境', amount: '￥8,800.00', fee: '￥48.40', status: '已代收成功', date: '2026-08-12' },
        { mchOrderNo: 'MCH-ORD-20260812-004', sysOrderNo: 'BC-IN-2026081205', suppOrderNo: 'SUP-COL-99210', merchant: '華夏智付', amount: '￥12,500.00', fee: '￥75.00', status: '已代收成功', date: '2026-08-12' }
      ],

      payoutOrders: [
        { mchOrderNo: 'MCH-WD-20260812-881', sysOrderNo: 'BC-OUT-2026081202', suppOrderNo: 'SUP-PAY-77102', merchant: '閃電電商', amount: '￥12,300.00', fee: '￥15.00', status: '代付處理中', date: '2026-08-12' },
        { mchOrderNo: 'MCH-WD-20260812-882', sysOrderNo: 'BC-OUT-2026081204', suppOrderNo: 'SUP-PAY-66309', merchant: '華夏智付', amount: '￥15,000.00', fee: '￥17.00', status: '代付成功', date: '2026-08-12' },
        { mchOrderNo: 'MCH-WD-20260811-992', sysOrderNo: 'BC-OUT-2026081109', suppOrderNo: 'SUP-PAY-76011', merchant: '星光娛樂', amount: '￥8,000.00', fee: '￥10.00', status: '代付成功', date: '2026-08-11' }
      ],

      payoutRequests: [
        { id: 'WD-2026081201', merchant: '閃電電商', rawAmount: 50000.00, amount: '￥50,000.00', bank: '招商銀行 (尾號 8812)', status: '待審核', time: '2026-08-12 16:00' },
        { id: 'WD-2026081202', merchant: '極速跨境', rawAmount: 80000.00, amount: '￥80,000.00', bank: '工商銀行 (尾號 1102)', status: '待審核', time: '2026-08-12 17:20' },
        { id: 'WD-2026081105', merchant: '海淘優選', rawAmount: 20000.00, amount: '￥20,000.00', bank: '建設銀行 (尾號 4102)', status: '已下發', time: '2026-08-11 14:30' }
      ]
    }
  },
  created() {
    const savedMerchants = localStorage.getItem(STORAGE_KEY_MERCHANTS)
    if (savedMerchants) {
      try { this.merchants = JSON.parse(savedMerchants) } catch(e) {}
    }
    const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS)
    if (savedLogs) {
      try { this.balanceLogs = JSON.parse(savedLogs) } catch(e) {}
    }
  },
  methods: {
    handleSelectMenu(key) {
      this.activeMenu = key
    },
    saveMerchantsAndLogs() {
      localStorage.setItem(STORAGE_KEY_MERCHANTS, JSON.stringify(this.merchants))
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(this.balanceLogs))
    },
    // 新增結算變動日誌
    addBalanceLog(merchantName, type, beforeBal, changeAmt, afterBal, reason, operator = '管理員') {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19)
      const logItem = {
        id: `LOG-${Date.now().toString().slice(-8)}`,
        merchantName,
        type,
        beforeBal,
        changeAmt,
        afterBal,
        reason,
        operator,
        time: nowStr
      }
      this.balanceLogs.unshift(logItem)
      this.saveMerchantsAndLogs()
    },
    submitCreateMerchant() {
      if (!this.newMerchant.name) {
        alert('請輸入商戶名稱')
        return
      }
      const finalId = this.newMerchant.customId.trim() || `MCH-${1000 + this.merchants.length + 1}`
      const newKey = `bc_live_${Math.random().toString(36).substring(2, 8)}`
      const item = {
        id: finalId,
        name: this.newMerchant.name,
        appKey: newKey,
        status: '正常',
        collectRate: this.newMerchant.collectRate || '0.6%',
        payoutRate: this.newMerchant.payoutRate || '0.3% + ￥2.00',
        channelConfigs: JSON.parse(JSON.stringify(this.newMerchant.channelConfigs)),
        rawBalance: 0.00
      }
      this.merchants.push(item)
      this.addBalanceLog(item.name, '初始化建戶', 0, 0, 0, '新商戶開戶成功', '系統管理員')
      alert(`商戶 [${this.newMerchant.name}] 新增成功！商戶號: ${finalId}`)
      this.newMerchant.name = ''
      this.newMerchant.customId = ''
      this.merchantTab = 'query'
    },
    approvePayout(item) {
      const targetMch = this.merchants.find(m => m.name === item.merchant)
      if (targetMch) {
        const before = targetMch.rawBalance || 0
        const amt = item.rawAmount || 0
        if (before < amt) {
          if (!confirm(`警告: 商戶餘額 (￥${before}) 小於提現金額 (￥${amt})，確定要強制下發扣款嗎？`)) {
            return
          }
        }
        const after = before - amt
        targetMch.rawBalance = after
        this.addBalanceLog(targetMch.name, '下發扣款', before, -amt, after, `下發審核同意打款 [單號: ${item.id}]`, '財務管理員')
      }
      item.status = '已下發'
      alert(`已成功同意下發單號: ${item.id}，已同步扣除商戶餘額並記錄結算歷程！`)
    },
    openBalanceModal(merchant) {
      this.selectedMerchantForBalance = merchant
      this.balanceAdjustAmount = 0
      this.balanceAdjustReason = ''
      this.showBalanceModal = true
    },
    closeBalanceModal() {
      this.showBalanceModal = false
      this.selectedMerchantForBalance = null
    },
    confirmBalanceAdjust() {
      if (!this.selectedMerchantForBalance) return
      const adj = parseFloat(this.balanceAdjustAmount)
      if (isNaN(adj) || adj === 0) {
        alert('請輸入有效的變更金額！')
        return
      }
      if (!this.balanceAdjustReason.trim()) {
        alert('請輸入調整理由！')
        return
      }

      const m = this.selectedMerchantForBalance
      const before = m.rawBalance || 0
      const after = before + adj
      m.rawBalance = after

      const changeType = adj > 0 ? '手動充值/調增' : '手動扣款/沖銷'
      this.addBalanceLog(m.name, changeType, before, adj, after, this.balanceAdjustReason, '人工操作員')

      alert(`成功調整商戶 [${m.name}] 餘額！\n變更前: ￥${before}\n變更金額: ${adj >= 0 ? '+' : ''}${adj}\n變更後: ￥${after}`)
      this.closeBalanceModal()
    },
    exportReportCSV(filename, rows) {
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      rows.forEach(row => {
        csvContent += row.map(v => `"${v}"`).join(",") + "\n"
      })
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    exportCollectReport(filteredData) {
      const mName = this.searchMerchantName ? this.searchMerchantName : '全部商戶'
      const rows = [
        ["日期", "商戶名稱", "支付通道", "代收金額", "預估手續費", "交易筆數"],
        ...filteredData.map(i => [i.date, i.merchant, i.channel, i.collectAmt, (i.collectAmt * 0.006).toFixed(2), i.count])
      ]
      this.exportReportCSV(`代收結算報表_${mName}`, rows)
    },
    exportPayoutReport(filteredData) {
      const mName = this.searchMerchantName ? this.searchMerchantName : '全部商戶'
      const rows = [
        ["日期", "商戶名稱", "支付通道", "代付金額", "預估手續費", "交易筆數"],
        ...filteredData.map(i => [i.date, i.merchant, i.channel, i.payoutAmt, (i.payoutAmt * 0.003 + 2).toFixed(2), i.count])
      ]
      this.exportReportCSV(`代付結算報表_${mName}`, rows)
    },
    // 匯出商戶變動紀錄 CSV
    exportBalanceLogsCSV(logs) {
      const mName = this.logMerchantFilter ? this.logMerchantFilter : '全部商戶'
      const rows = [
        ["紀錄單號", "時間", "商戶名稱", "變動類型", "變動前餘額", "變動金額", "變動後餘額", "調帳理由", "操作員"],
        ...logs.map(l => [l.id, l.time, l.merchantName, l.type, l.beforeBal, l.changeAmt, l.afterBal, l.reason, l.operator])
      ]
      this.exportReportCSV(`商戶結算餘額變動明細_${mName}`, rows)
    }
  },
  render() {
    const filteredRunSummary = this.runSummaryList.filter(item => {
      const matchDate = !this.queryDate || item.date === this.queryDate
      const matchMerchant = !this.searchMerchantName || item.merchant === this.searchMerchantName
      const matchChannel = !this.searchChannel || item.channel.includes(this.searchChannel)
      return matchDate && matchMerchant && matchChannel
    })

    const totalCollect = filteredRunSummary.reduce((sum, i) => sum + i.collectAmt, 0)
    const totalPayout = filteredRunSummary.reduce((sum, i) => sum + i.payoutAmt, 0)
    const totalFee = filteredRunSummary.reduce((sum, i) => sum + i.feeAmt, 0)
    const totalNet = filteredRunSummary.reduce((sum, i) => sum + i.netAmt, 0)

    const renderFilterHeader = (isSupplier = false) => h('div', { style: 'background: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 20px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;' }, [
      h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '按日查詢:'),
        h('input', { type: 'date', value: this.queryDate, onInput: e => this.queryDate = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]),
      h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '按月查詢:'),
        h('input', { type: 'month', value: this.queryMonth, onInput: e => this.queryMonth = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]),
      isSupplier ? h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '供應商單號:'),
        h('input', { placeholder: '輸入供應商單號...', value: this.supplierOrderNo, onInput: e => this.supplierOrderNo = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]) : null,
      h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, 'BC pay單號:'),
        h('input', { placeholder: '輸入BC pay單號...', value: this.systemOrderNo, onInput: e => this.systemOrderNo = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]),
      h('button', { onClick: () => this.$forceUpdate(), style: 'background: #1890ff; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer;' }, '🔍 檢索')
    ])

    // 1. 代收付跑量總表
    const renderRunSummaryModule = () => h('div', [
      h('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;' }, [
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #8c8c8c; font-size: 13px;' }, '當前統計總代收額'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #52c41a; margin-top: 8px;' }, `￥${totalCollect.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #8c8c8c; font-size: 13px;' }, '當前統計總代付額'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #fa8c16; margin-top: 8px;' }, `￥${totalPayout.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #8c8c8c; font-size: 13px;' }, '淨跑量 (代收 - 代付)'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #1890ff; margin-top: 8px;' }, `￥${totalNet.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #8c8c8c; font-size: 13px;' }, '平台手續費收益'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #f5222d; margin-top: 8px;' }, `￥${totalFee.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ])
      ]),
      h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
        h('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;' }, [
          h('h3', { style: 'margin: 0;' }, '📊 代收付跑量總表'),
          h('div', { style: 'display: flex; gap: 10px;' }, [
            h('button', { onClick: () => this.exportCollectReport(filteredRunSummary), style: 'background: #52c41a; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;' }, '📥 導出代收結算報表 CSV'),
            h('button', { onClick: () => this.exportPayoutReport(filteredRunSummary), style: 'background: #fa8c16; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;' }, '📤 導出代付結算報表 CSV')
          ])
        ]),
        h('div', { style: 'background: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 20px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;' }, [
          h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
            h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '日期:'),
            h('input', { type: 'date', value: this.queryDate, onInput: e => this.queryDate = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ]),
          h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
            h('label', { style: 'font-size: 13px; font-weight: bold; color: #1890ff;' }, '選擇商戶:'),
            h('select', { value: this.searchMerchantName, onChange: e => this.searchMerchantName = e.target.value, style: 'padding: 6px 12px; border: 1px solid #1890ff; border-radius: 4px; font-weight: bold;' }, [
              h('option', { value: '' }, '-- 全部商戶 --'),
              ...this.merchants.map(m => h('option', { value: m.name }, `${m.name} (${m.id})`))
            ])
          ]),
          h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
            h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '通道名稱:'),
            h('input', { placeholder: '搜尋通道...', value: this.searchChannel, onInput: e => this.searchChannel = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ])
        ]),
        h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
          h('thead', {}, [
            h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
              h('th', { style: 'padding: 12px;' }, '日期'),
              h('th', { style: 'padding: 12px;' }, '商戶名稱'),
              h('th', { style: 'padding: 12px;' }, '支付通道'),
              h('th', { style: 'padding: 12px;' }, '代收金額'),
              h('th', { style: 'padding: 12px;' }, '代付金額'),
              h('th', { style: 'padding: 12px;' }, '手續費'),
              h('th', { style: 'padding: 12px;' }, '淨結算金額'),
              h('th', { style: 'padding: 12px;' }, '總筆數')
            ])
          ]),
          h('tbody', {}, filteredRunSummary.length ? filteredRunSummary.map(item => 
            h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
              h('td', { style: 'padding: 12px; color: #606266;' }, item.date),
              h('td', { style: 'padding: 12px; font-weight: bold;' }, item.merchant),
              h('td', { style: 'padding: 12px;' }, item.channel),
              h('td', { style: 'padding: 12px; color: #52c41a; font-weight: bold;' }, `￥${item.collectAmt.toLocaleString()}`),
              h('td', { style: 'padding: 12px; color: #fa8c16; font-weight: bold;' }, `￥${item.payoutAmt.toLocaleString()}`),
              h('td', { style: 'padding: 12px; color: #f5222d;' }, `￥${item.feeAmt.toLocaleString()}`),
              h('td', { style: 'padding: 12px; color: #1890ff; font-weight: bold;' }, `￥${item.netAmt.toLocaleString()}`),
              h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #e6f7ff; color: #1890ff; padding: 2px 8px; border-radius: 10px; font-size: 12px;' }, `${item.count} 筆`))
            ])
          ) : [h('tr', {}, [h('td', { colspan: 8, style: 'text-align: center; padding: 24px; color: #909399;' }, '查無對應跑量紀錄')])])
        ])
      ])
    ])

    // 2. 數據大屏
    const renderPaymentOverview = () => h('div', [
      h('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;' }, [
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日代收總額'),
          h('div', { style: 'font-size: 26px; font-weight: bold; margin: 8px 0;' }, '￥692,020.00'),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '成功率 99.4%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日代付總額'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #e6a23c; margin: 8px 0;' }, '￥213,000.00'),
          h('div', { style: 'color: #409eff; font-size: 12px;' }, '完成率 98.9%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '平台開戶商戶'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #409eff; margin: 8px 0;' }, `${this.merchants.length} 家`),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '全部運作中')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '待處理下發'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #f56c6c; margin: 8px 0;' }, `${this.payoutRequests.filter(p => p.status === '待審核').length} 筆`),
          h('div', { style: 'color: #909399; font-size: 12px;' }, '需要財務審核')
        ])
      ]),
      h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
        h('h3', { style: 'margin-top: 0;' }, '即時交易流水'),
        h('table', { style: 'width: 100%; border-collapse: collapse;' }, [
          h('thead', {}, [
            h('tr', { style: 'background: #fafafa; border-bottom: 1px solid #f0f0f0; text-align: left;' }, [
              h('th', { style: 'padding: 12px;' }, '交易單號'),
              h('th', { style: 'padding: 12px;' }, '支付通道'),
              h('th', { style: 'padding: 12px;' }, '系統單號'),
              h('th', { style: 'padding: 12px;' }, '金額'),
              h('th', { style: 'padding: 12px;' }, '狀態')
            ])
          ]),
          h('tbody', {}, this.transactions.map(item => h('tr', { style: 'border-bottom: 1px solid #f0f0f0;' }, [
            h('td', { style: 'padding: 12px;' }, item.id),
            h('td', { style: 'padding: 12px;' }, `${item.channelIcon} ${item.channel}`),
            h('td', { style: 'padding: 12px;' }, item.orderId),
            h('td', { style: 'padding: 12px; font-weight: bold;' }, item.amount),
            h('td', { style: 'padding: 12px; color: #52c41a;' }, item.status)
          ])))
        ])
      ])
    ])

    // 3. 供應商
    const renderSupplierModule = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '🏭 供應商訂單管理中心'),
      renderFilterHeader(true),
      h('table', { style: 'width: 100%; border-collapse: collapse;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #fafafa; border-bottom: 1px solid #f0f0f0; text-align: left;' }, [
            h('th', { style: 'padding: 12px;' }, '供應商單號'),
            h('th', { style: 'padding: 12px;' }, 'BC Pay 單號'),
            h('th', { style: 'padding: 12px;' }, '供應商名稱'),
            h('th', { style: 'padding: 12px;' }, '金額'),
            h('th', { style: 'padding: 12px;' }, '對帳狀態')
          ])
        ]),
        h('tbody', {}, this.supplierOrders.map(item => h('tr', { style: 'border-bottom: 1px solid #f0f0f0;' }, [
          h('td', { style: 'padding: 12px;' }, item.suppOrderNo),
          h('td', { style: 'padding: 12px;' }, item.sysOrderNo),
          h('td', { style: 'padding: 12px;' }, item.suppName),
          h('td', { style: 'padding: 12px; font-weight: bold;' }, item.amount),
          h('td', { style: 'padding: 12px; color: #1890ff;' }, item.matchType)
        ])))
      ])
    ])

    // 4. 代收訂單
    const renderCollectOrders = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '📥 代收訂單管理'),
      renderFilterHeader(false),
      h('table', { style: 'width: 100%; border-collapse: collapse;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #fafafa; border-bottom: 1px solid #f0f0f0; text-align: left;' }, [
            h('th', { style: 'padding: 12px; color: #1890ff;' }, '商戶訂單號'),
            h('th', { style: 'padding: 12px;' }, '系統單號'),
            h('th', { style: 'padding: 12px;' }, '商戶名稱'),
            h('th', { style: 'padding: 12px;' }, '代收金額'),
            h('th', { style: 'padding: 12px;' }, '手續費'),
            h('th', { style: 'padding: 12px;' }, '狀態')
          ])
        ]),
        h('tbody', {}, this.collectOrders.map(item => h('tr', { style: 'border-bottom: 1px solid #f0f0f0;' }, [
          h('td', { style: 'padding: 12px; font-weight: bold;' }, item.mchOrderNo),
          h('td', { style: 'padding: 12px;' }, item.sysOrderNo),
          h('td', { style: 'padding: 12px;' }, item.merchant),
          h('td', { style: 'padding: 12px; color: #52c41a; font-weight: bold;' }, item.amount),
          h('td', { style: 'padding: 12px;' }, item.fee),
          h('td', { style: 'padding: 12px; color: #1890ff;' }, item.status)
        ])))
      ])
    ])

    // 5. 代付訂單
    const renderPayoutOrders = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '📤 代付訂單管理'),
      renderFilterHeader(false),
      h('table', { style: 'width: 100%; border-collapse: collapse;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #fafafa; border-bottom: 1px solid #f0f0f0; text-align: left;' }, [
            h('th', { style: 'padding: 12px; color: #1890ff;' }, '商戶訂單號'),
            h('th', { style: 'padding: 12px;' }, '系統單號'),
            h('th', { style: 'padding: 12px;' }, '商戶名稱'),
            h('th', { style: 'padding: 12px;' }, '代付金額'),
            h('th', { style: 'padding: 12px;' }, '手續費'),
            h('th', { style: 'padding: 12px;' }, '狀態')
          ])
        ]),
        h('tbody', {}, this.payoutOrders.map(item => h('tr', { style: 'border-bottom: 1px solid #f0f0f0;' }, [
          h('td', { style: 'padding: 12px; font-weight: bold;' }, item.mchOrderNo),
          h('td', { style: 'padding: 12px;' }, item.sysOrderNo),
          h('td', { style: 'padding: 12px;' }, item.merchant),
          h('td', { style: 'padding: 12px; color: #fa8c16; font-weight: bold;' }, item.amount),
          h('td', { style: 'padding: 12px;' }, item.fee),
          h('td', { style: 'padding: 12px; color: #52c41a;' }, item.status)
        ])))
      ])
    ])

    // 6. 商戶管理
    const renderMerchantSettings = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('div', { style: 'display: flex; gap: 12px; margin-bottom: 20px;' }, [
        h('button', { onClick: () => this.merchantTab = 'query', style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; background: ${this.merchantTab === 'query' ? '#1890ff' : '#f0f0f0'}; color: ${this.merchantTab === 'query' ? '#fff' : '#000'};` }, '商戶列表'),
        h('button', { onClick: () => this.merchantTab = 'add', style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; background: ${this.merchantTab === 'add' ? '#1890ff' : '#f0f0f0'}; color: ${this.merchantTab === 'add' ? '#fff' : '#000'};` }, '+ 新增商戶')
      ]),
      this.merchantTab === 'query' ? h('table', { style: 'width: 100%; border-collapse: collapse;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #fafafa; border-bottom: 1px solid #f0f0f0; text-align: left;' }, [
            h('th', { style: 'padding: 12px;' }, '商戶號'),
            h('th', { style: 'padding: 12px;' }, '商戶名稱'),
            h('th', { style: 'padding: 12px;' }, '代收總費率'),
            h('th', { style: 'padding: 12px;' }, '代付總費率'),
            h('th', { style: 'padding: 12px; color: #1890ff;' }, '商戶餘額')
          ])
        ]),
        h('tbody', {}, this.merchants.map(item => h('tr', { style: 'border-bottom: 1px solid #f0f0f0;' }, [
          h('td', { style: 'padding: 12px; font-weight: 500;' }, item.id),
          h('td', { style: 'padding: 12px; font-weight: bold;' }, item.name),
          h('td', { style: 'padding: 12px;' }, item.collectRate || '0.6%'),
          h('td', { style: 'padding: 12px;' }, item.payoutRate || '0.3% + ￥2.00'),
          h('td', { style: 'padding: 12px; color: #52c41a; font-weight: bold;' }, `￥${(item.rawBalance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ])))
      ]) : h('div', { style: 'max-width: 720px; background: #fafafa; padding: 20px; border-radius: 8px;' }, [
        h('h4', { style: 'margin-top: 0; color: #1890ff;' }, '➕ 新增商戶'),
        h('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;' }, [
          h('div', {}, [
            h('label', { style: 'display: block; margin-bottom: 6px; font-weight: bold;' }, '商戶名稱:'),
            h('input', { value: this.newMerchant.name, onInput: e => this.newMerchant.name = e.target.value, placeholder: '請輸入商戶公司或平台名稱', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ]),
          h('div', {}, [
            h('label', { style: 'display: block; margin-bottom: 6px; font-weight: bold;' }, '自訂商戶號:'),
            h('input', { value: this.newMerchant.customId, onInput: e => this.newMerchant.customId = e.target.value, placeholder: '留空自動生成 (例: MCH-888)', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ])
        ]),
        h('button', { onClick: () => this.submitCreateMerchant(), style: 'background: #1890ff; color: white; border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;' }, '🚀 完成新增商戶')
      ])
    ])

    // 7. 💸 商戶下發與變動歷史記錄 (v2.2.5 核心亮點)
    const renderMerchantPayout = () => {
      const filteredLogs = this.balanceLogs.filter(l => !this.logMerchantFilter || l.merchantName === this.logMerchantFilter)

      return h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
        h('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;' }, [
          h('h3', { style: 'margin: 0;' }, '💸 商戶下發與餘額結算歷史'),
          h('div', { style: 'display: flex; gap: 8px;' }, [
            h('button', { 
              onClick: () => this.payoutAuditTab = 'requests', 
              style: `padding: 6px 14px; border-radius: 4px; border: none; cursor: pointer; font-weight: bold; background: ${this.payoutAuditTab === 'requests' ? '#1890ff' : '#f0f0f0'}; color: ${this.payoutAuditTab === 'requests' ? '#fff' : '#000'};` 
            }, '📋 下發審核'),
            h('button', { 
              onClick: () => this.payoutAuditTab = 'logs', 
              style: `padding: 6px 14px; border-radius: 4px; border: none; cursor: pointer; font-weight: bold; background: ${this.payoutAuditTab === 'logs' ? '#1890ff' : '#f0f0f0'}; color: ${this.payoutAuditTab === 'logs' ? '#fff' : '#000'};` 
            }, '📜 商戶餘額變動紀錄')
          ])
        ]),

        // 頂部卡片列出所有商戶餘額
        h('div', { style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;' }, 
          this.merchants.map(m => h('div', { style: 'background: #fafafa; border: 1px solid #f0f0f0; padding: 12px 16px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;' }, [
            h('div', {}, [
              h('div', { style: 'font-weight: bold; font-size: 14px;' }, `${m.name} (${m.id})`),
              h('div', { style: 'color: #52c41a; font-weight: bold; font-size: 16px; margin-top: 4px;' }, `￥${(m.rawBalance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
            ]),
            h('button', { onClick: () => this.openBalanceModal(m), style: 'background: #fa8c16; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;' }, '✏️ 調帳/充值')
          ]))
        ),

        // 頁籤 1: 提現審核
        this.payoutAuditTab === 'requests' ? h('div', [
          h('h4', { style: 'margin-bottom: 12px;' }, '📋 下發提現申請審核列表'),
          h('table', { style: 'width: 100%; border-collapse: collapse;' }, [
            h('thead', {}, [
              h('tr', { style: 'background: #fafafa; border-bottom: 1px solid #f0f0f0; text-align: left;' }, [
                h('th', { style: 'padding: 12px;' }, '下發單號'),
                h('th', { style: 'padding: 12px;' }, '商戶名稱'),
                h('th', { style: 'padding: 12px;' }, '提現金額'),
                h('th', { style: 'padding: 12px;' }, '收款帳戶'),
                h('th', { style: 'padding: 12px;' }, '申請時間'),
                h('th', { style: 'padding: 12px;' }, '狀態'),
                h('th', { style: 'padding: 12px;' }, '操作')
              ])
            ]),
            h('tbody', {}, this.payoutRequests.map(item => h('tr', { style: 'border-bottom: 1px solid #f0f0f0;' }, [
              h('td', { style: 'padding: 12px;' }, item.id),
              h('td', { style: 'padding: 12px; font-weight: bold;' }, item.merchant),
              h('td', { style: 'padding: 12px; color: #fa8c16; font-weight: bold;' }, item.amount),
              h('td', { style: 'padding: 12px;' }, item.bank),
              h('td', { style: 'padding: 12px; color: #8c8c8c; font-size: 12px;' }, item.time),
              h('td', { style: 'padding: 12px;' }, h('span', { style: `padding: 2px 8px; border-radius: 10px; font-size: 12px; background: ${item.status === '待審核' ? '#fff7e6' : '#f6ffed'}; color: ${item.status === '待審核' ? '#fa8c16' : '#52c41a'};` }, item.status)),
              h('td', { style: 'padding: 12px;' }, item.status === '待審核' ? h('button', { onClick: () => this.approvePayout(item), style: 'background: #1890ff; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;' }, '同意打款') : '-')
            ])))
          ])
        ]) : 
        
        // 頁籤 2: 商戶結算餘額變動歷史 (v2.2.5 新增功能)
        h('div', [
          h('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; background: #f8f9fa; padding: 12px; border-radius: 6px;' }, [
            h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
              h('label', { style: 'font-weight: bold; font-size: 13px;' }, '按商戶篩選歷史:'),
              h('select', { value: this.logMerchantFilter, onChange: e => this.logMerchantFilter = e.target.value, style: 'padding: 6px 12px; border: 1px solid #1890ff; border-radius: 4px; font-weight: bold;' }, [
                h('option', { value: '' }, '-- 全部商戶 --'),
                ...this.merchants.map(m => h('option', { value: m.name }, m.name))
              ])
            ]),
            h('button', { onClick: () => this.exportBalanceLogsCSV(filteredLogs), style: 'background: #1890ff; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;' }, '📥 導出商戶變動明細 CSV')
          ]),
          h('table', { style: 'width: 100%; border-collapse: collapse;' }, [
            h('thead', {}, [
              h('tr', { style: 'background: #fafafa; border-bottom: 1px solid #f0f0f0; text-align: left;' }, [
                h('th', { style: 'padding: 12px;' }, '紀錄單號'),
                h('th', { style: 'padding: 12px;' }, '時間'),
                h('th', { style: 'padding: 12px;' }, '商戶名稱'),
                h('th', { style: 'padding: 12px;' }, '變動類型'),
                h('th', { style: 'padding: 12px;' }, '變動前餘額'),
                h('th', { style: 'padding: 12px;' }, '變動金額'),
                h('th', { style: 'padding: 12px;' }, '變動後餘額'),
                h('th', { style: 'padding: 12px;' }, '理由 / 備註'),
                h('th', { style: 'padding: 12px;' }, '操作人')
              ])
            ]),
            h('tbody', {}, filteredLogs.length ? filteredLogs.map(log => h('tr', { style: 'border-bottom: 1px solid #f0f0f0;' }, [
              h('td', { style: 'padding: 12px; font-size: 12px; color: #8c8c8c;' }, log.id),
              h('td', { style: 'padding: 12px; font-size: 12px;' }, log.time),
              h('td', { style: 'padding: 12px; font-weight: bold;' }, log.merchantName),
              h('td', { style: 'padding: 12px;' }, h('span', { style: `padding: 2px 8px; border-radius: 10px; font-size: 12px; background: ${log.changeAmt >= 0 ? '#e6f7ff' : '#fff1f0'}; color: ${log.changeAmt >= 0 ? '#1890ff' : '#f5222d'};` }, log.type)),
              h('td', { style: 'padding: 12px; color: #595959;' }, `￥${log.beforeBal.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`),
              h('td', { style: `padding: 12px; font-weight: bold; color: ${log.changeAmt >= 0 ? '#52c41a' : '#f5222d'};` }, `${log.changeAmt >= 0 ? '+' : ''}${log.changeAmt.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`),
              h('td', { style: 'padding: 12px; font-weight: bold;' }, `￥${log.afterBal.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`),
              h('td', { style: 'padding: 12px; color: #262626;' }, log.reason),
              h('td', { style: 'padding: 12px; color: #8c8c8c; font-size: 12px;' }, log.operator)
            ])) : [h('tr', {}, [h('td', { colspan: 9, style: 'text-align: center; padding: 24px; color: #909399;' }, '暫無變動紀錄')])])
          ])
        ])
      ])
    }

    // ✏️ 餘額調整 Modal 彈窗 (自動聯動變動明細)
    const renderBalanceModal = () => !this.showBalanceModal ? null : h('div', {
      style: 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;'
    }, [
      h('div', { style: 'background: #fff; border-radius: 8px; width: 420px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' }, [
        h('h3', { style: 'margin-top: 0; color: #1890ff;' }, `✏️ 手動調整商戶餘額`),
        h('div', { style: 'margin-bottom: 12px; font-size: 14px;' }, [
          h('span', { style: 'color: #606266;' }, '商戶名稱：'),
          h('strong', {}, this.selectedMerchantForBalance?.name)
        ]),
        h('div', { style: 'margin-bottom: 16px; font-size: 14px;' }, [
          h('span', { style: 'color: #606266;' }, '當前餘額：'),
          h('strong', { style: 'color: #52c41a;' }, `￥${(this.selectedMerchantForBalance?.rawBalance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ]),
        h('div', { style: 'margin-bottom: 16px;' }, [
          h('label', { style: 'display: block; font-size: 13px; font-weight: bold; margin-bottom: 6px;' }, '變更金額 (充值寫正數，扣款/沖銷寫負數):'),
          h('input', { 
            type: 'number', 
            value: this.balanceAdjustAmount, 
            onInput: e => this.balanceAdjustAmount = e.target.value,
            placeholder: '例如: 5000 或 -2000',
            style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box;' 
          })
        ]),
        h('div', { style: 'margin-bottom: 20px;' }, [
          h('label', { style: 'display: block; font-size: 13px; font-weight: bold; margin-bottom: 6px;' }, '調整理由/備註 (將記錄於結算歷史):'),
          h('input', { 
            value: this.balanceAdjustReason, 
            onInput: e => this.balanceAdjustReason = e.target.value,
            placeholder: '請輸入調帳理由 (例: 補單充值 / 手續費沖銷)',
            style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box;' 
          })
        ]),
        h('div', { style: 'display: flex; justify-content: flex-end; gap: 12px;' }, [
          h('button', { onClick: () => this.closeBalanceModal(), style: 'padding: 8px 16px; border: 1px solid #dcdfe6; background: #fff; border-radius: 4px; cursor: pointer;' }, '取消'),
          h('button', { onClick: () => this.confirmBalanceAdjust(), style: 'padding: 8px 16px; border: none; background: #1890ff; color: white; border-radius: 4px; cursor: pointer; font-weight: bold;' }, '確認調整')
        ])
      ])
    ])

    const renderActiveModule = () => {
      switch (this.activeMenu) {
        case 'run_summary': return renderRunSummaryModule()
        case 'overview': return renderPaymentOverview()
        case 'supplier': return renderSupplierModule()
        case 'collect': return renderCollectOrders()
        case 'payout': return renderPayoutOrders()
        case 'merchant': return renderMerchantSettings()
        case 'payout_audit': return renderMerchantPayout()
        default: return renderRunSummaryModule()
      }
    }

    return h('div', { style: 'display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5;' }, [
      h('div', { style: 'width: 220px; background: #001529; color: white; flex-shrink: 0;' }, [
        h('div', { style: 'padding: 20px 16px; font-size: 18px; font-weight: bold; color: #1890ff; border-bottom: 1px solid #002140;' }, '💳 BCPay 管理系統'),
        h('div', { style: 'padding: 10px 0;' }, [
          [
            { key: 'run_summary', label: '📊 代收付跑量總表' },
            { key: 'overview', label: '📈 數據大屏概覽' },
            { key: 'supplier', label: '🏭 供應商訂單管理' },
            { key: 'collect', label: '📥 代收訂單管理' },
            { key: 'payout', label: '📤 代付訂單管理' },
            { key: 'merchant', label: '🏢 商戶管理與費率' },
            { key: 'payout_audit', label: '💸 商戶下發與結算明細' }
          ].map(menu => h('div', {
            onClick: () => this.handleSelectMenu(menu.key),
            style: `padding: 12px 20px; cursor: pointer; font-size: 14px; transition: all 0.3s; background: ${this.activeMenu === menu.key ? '#1890ff' : 'transparent'}; color: ${this.activeMenu === menu.key ? '#fff' : 'rgba(255,255,255,0.65)'}`
          }, menu.label))
        ])
      ]),
      h('div', { style: 'flex: 1; padding: 24px; overflow-y: auto;' }, [
        renderActiveModule(),
        renderBalanceModal()
      ])
    ])
  }
})

app.use(ElementPlus)
app.mount('#app')
app.use(ElementPlus)
app.mount('#app')
