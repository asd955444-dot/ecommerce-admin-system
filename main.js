import { createApp, h } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const STORAGE_KEY_MERCHANTS = 'bcpay_merchants_v1'

const app = createApp({
  data() {
    return {
      activeMenu: 'run_summary',
      supplierTab: 'collect_status',
      merchantTab: 'query',

      // 查詢條件狀態
      queryDate: '2026-08-12',
      queryMonth: '2026-08',
      supplierOrderNo: '',
      systemOrderNo: '',
      searchMerchantName: '', // 商戶篩選下拉選單綁定值
      searchChannel: '',

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
        { id: 'alipay', name: '支付寶 (Alipay)', icon: '🟦', fee: '0.6%', status: true, weight: 80, trafficRate: '40%' },
        { id: 'wechat', name: '微信支付 (WeChat Pay)', icon: '🟩', fee: '0.6%', status: true, weight: 80, trafficRate: '40%' },
        { id: 'linepay', name: 'LINE Pay', icon: '🟢', fee: '2.2%', status: true, weight: 30, trafficRate: '15%' },
        { id: 'ecpay', name: '綠界 ECPay (信用卡/超商)', icon: '🟧', fee: '2.85%', status: true, weight: 10, trafficRate: '5%' },
        { id: 'stripe', name: 'Stripe (國際信用卡)', icon: '💜', fee: '3.4% + $0.30', status: false, weight: 0, trafficRate: '0%' }
      ],

      // 代收付跑量總表數據
      runSummaryList: [
        { date: '2026-08-12', merchant: '閃電電商', channel: '微信支付', collectAmt: 158200, payoutAmt: 50000, feeAmt: 1249.20, netAmt: 106950.80, count: 420 },
        { date: '2026-08-12', merchant: '海淘優選', channel: '支付寶', collectAmt: 89300, payoutAmt: 20000, feeAmt: 695.80, netAmt: 68604.20, count: 215 },
        { date: '2026-08-12', merchant: '星光娛樂', channel: 'LINE Pay', collectAmt: 42500, payoutAmt: 8000, feeAmt: 1095.00, netAmt: 33405.00, count: 98 },
        { date: '2026-08-11', merchant: '閃電電商', channel: '微信支付', collectAmt: 182000, payoutAmt: 65000, feeAmt: 1442.00, netAmt: 115558.00, count: 510 },
        { date: '2026-08-11', merchant: '海淘優選', channel: '綠界 ECPay', collectAmt: 31000, payoutAmt: 12000, feeAmt: 907.50, netAmt: 18092.50, count: 76 }
      ],

      transactions: [
        { id: 'TX-20260812-9901', channel: '微信支付', channelIcon: '🟩', orderId: 'BC-IN-2026081201', amount: '￥299.00', status: '交易成功', date: '2026-08-12' },
        { id: 'TX-20260812-9902', channel: '支付寶', channelIcon: '🟦', orderId: 'BC-IN-2026081202', amount: '￥1,280.00', status: '交易成功', date: '2026-08-12' },
        { id: 'TX-20260812-9903', channel: 'LINE Pay', channelIcon: '🟢', orderId: 'BC-OUT-2026081202', amount: 'NT$ 2,500', status: '交易成功', date: '2026-08-12' }
      ],

      supplierOrders: [
        { suppOrderNo: 'SUP-COL-88091', sysOrderNo: 'BC-IN-2026081201', suppName: '極速支付通道A', amount: '￥5,000.00', status: '成功', matchType: '精準成功', date: '2026-08-12' },
        { suppOrderNo: 'SUP-PAY-77102', sysOrderNo: 'BC-OUT-2026081202', suppName: '順達代付網關', amount: '￥12,300.00', status: '處理中', matchType: '精準確認說是', date: '2026-08-12' }
      ],

      collectOrders: [
        { mchOrderNo: 'MCH-ORD-20260812-001', sysOrderNo: 'BC-IN-2026081201', suppOrderNo: 'SUP-COL-88091', merchant: '閃電電商', amount: '￥5,000.00', fee: '￥30.00', status: '已代收成功', date: '2026-08-12' },
        { mchOrderNo: 'MCH-ORD-20260812-002', sysOrderNo: 'BC-IN-2026081202', suppOrderNo: 'SUP-COL-88095', merchant: '海淘優選', amount: '￥1,200.00', fee: '￥7.20', status: '等待支付', date: '2026-08-12' }
      ],

      payoutOrders: [
        { mchOrderNo: 'MCH-WD-20260812-881', sysOrderNo: 'BC-OUT-2026081202', suppOrderNo: 'SUP-PAY-77102', merchant: '閃電電商', amount: '￥12,300.00', fee: '￥15.00', status: '代付處理中', date: '2026-08-12' },
        { mchOrderNo: 'MCH-WD-20260811-992', sysOrderNo: 'BC-OUT-2026081109', suppOrderNo: 'SUP-PAY-76011', merchant: '星光娛樂', amount: '￥8,000.00', fee: '￥10.00', status: '代付成功', date: '2026-08-11' }
      ],

      merchants: [
        { id: 'MCH-1001', name: '閃電電商', appKey: 'bc_live_99812a', status: '正常', collectRate: '0.6%', payoutRate: '0.3% + ￥2.00', rawBalance: 158200.00 },
        { id: 'MCH-1002', name: '海淘優選', appKey: 'bc_live_33419b', status: '正常', collectRate: '0.8%', payoutRate: '0.5% + ￥2.00', rawBalance: 42100.00 },
        { id: 'MCH-1003', name: '星光娛樂', appKey: 'bc_live_77103c', status: '正常', collectRate: '0.7%', payoutRate: '0.4% + ￥2.00', rawBalance: 33405.00 }
      ],

      payoutRequests: [
        { id: 'WD-2026081201', merchant: '閃電電商', amount: '￥50,000.00', bank: '招商銀行 (尾號 8812)', status: '待審核', time: '2026-08-12 16:00' },
        { id: 'WD-2026081105', merchant: '海淘優選', amount: '￥20,000.00', bank: '建設銀行 (尾號 4102)', status: '已下發', time: '2026-08-11 14:30' }
      ]
    }
  },
  created() {
    const savedMerchants = localStorage.getItem(STORAGE_KEY_MERCHANTS)
    if (savedMerchants) {
      try {
        this.merchants = JSON.parse(savedMerchants)
      } catch(e) {
        console.error(e)
      }
    }
  },
  methods: {
    handleSelectMenu(key) {
      this.activeMenu = key
    },
    toggleGateway(gateway) {
      gateway.status = !gateway.status
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
      localStorage.setItem(STORAGE_KEY_MERCHANTS, JSON.stringify(this.merchants))
      alert(`商戶 [${this.newMerchant.name}] 新增成功！商戶號: ${finalId}`)
      this.newMerchant.name = ''
      this.newMerchant.customId = ''
      this.merchantTab = 'query'
    },
    approvePayout(item) {
      item.status = '已下發'
      alert(`已成功同意下發單號: ${item.id}，資金已結算！`)
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
      this.selectedMerchantForBalance.rawBalance = (this.selectedMerchantForBalance.rawBalance || 0) + adj
      localStorage.setItem(STORAGE_KEY_MERCHANTS, JSON.stringify(this.merchants))
      alert(`成功調整商戶 [${this.selectedMerchantForBalance.name}] 餘額！\n變更金額: ${adj >= 0 ? '+' : ''}${adj}\n理由: ${this.balanceAdjustReason}`)
      this.closeBalanceModal()
    },
    // 通用 CSV 匯出邏輯
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
    // v2.2.4 獨立匯出代收結算報表
    exportCollectReport(filteredData) {
      const mName = this.searchMerchantName ? this.searchMerchantName : '全部商戶'
      const rows = [
        ["日期", "商戶名稱", "支付通道", "代收金額", "預估手續費", "交易筆數"],
        ...filteredData.map(i => [i.date, i.merchant, i.channel, i.collectAmt, (i.collectAmt * 0.006).toFixed(2), i.count])
      ]
      this.exportReportCSV(`代收結算報表_${mName}`, rows)
    },
    // v2.2.4 獨立匯出代付結算報表
    exportPayoutReport(filteredData) {
      const mName = this.searchMerchantName ? this.searchMerchantName : '全部商戶'
      const rows = [
        ["日期", "商戶名稱", "支付通道", "代付金額", "預估手續費", "交易筆數"],
        ...filteredData.map(i => [i.date, i.merchant, i.channel, i.payoutAmt, (i.payoutAmt * 0.003 + 2).toFixed(2), i.count])
      ]
      this.exportReportCSV(`代付結算報表_${mName}`, rows)
    }
  },
  render() {
    // 跑量過濾條件邏輯 (支援商戶選擇框精準過濾)
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

    // 1. 📊 代收付跑量總表 (v2.2.4 升級版：含商戶選擇框與獨立分開導出功能)
    const renderRunSummaryModule = () => h('div', [
      h('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;' }, [
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #8c8c8c; font-size: 13px;' }, '當前統計總代收額'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #52c41a; margin-top: 8px;' }, `￥${totalCollect.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #8c8c8c; font-size: 13px;' }, '當前統計總代付額'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #fa8c16; margin-top: 8px;' }, `￥${totalPayout.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #8c8c8c; font-size: 13px;' }, '淨跑量 (代收 - 代付)'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #1890ff; margin-top: 8px;' }, `￥${totalNet.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #8c8c8c; font-size: 13px;' }, '平台手續費收益'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #f5222d; margin-top: 8px;' }, `￥${totalFee.toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ])
      ]),
      h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
        h('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;' }, [
          h('h3', { style: 'margin: 0;' }, '📊 代收付跑量總表'),
          h('div', { style: 'display: flex; gap: 10px;' }, [
            h('button', { 
              onClick: () => this.exportCollectReport(filteredRunSummary),
              style: 'background: #52c41a; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;' 
            }, '📥 導出代收結算報表 CSV'),
            h('button', { 
              onClick: () => this.exportPayoutReport(filteredRunSummary),
              style: 'background: #fa8c16; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;' 
            }, '📤 導出代付結算報表 CSV')
          ])
        ]),
        h('div', { style: 'background: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 20px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;' }, [
          h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
            h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '日期:'),
            h('input', { type: 'date', value: this.queryDate, onInput: e => this.queryDate = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ]),
          // ⭐ v2.2.4 新增：商戶專屬下拉選擇框
          h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
            h('label', { style: 'font-size: 13px; font-weight: bold; color: #1890ff;' }, '選擇商戶:'),
            h('select', { 
              value: this.searchMerchantName, 
              onChange: e => this.searchMerchantName = e.target.value, 
              style: 'padding: 6px 12px; border: 1px solid #1890ff; border-radius: 4px; outline: none; background: #fff; font-weight: bold;' 
            }, [
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

    // 2. 📈 支付數據大屏
    const renderPaymentOverview = () => h('div', [
      h('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;' }, [
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日代收總額'),
          h('div', { style: 'font-size: 26px; font-weight: bold; margin: 8px 0;' }, '￥328,520.00'),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '成功率 99.1%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日代付總額'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #e6a23c; margin: 8px 0;' }, '￥142,100.00'),
          h('div', { style: 'color: #409eff; font-size: 12px;' }, '完成率 98.5%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '平台開戶商戶'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #409eff; margin: 8px 0;' }, `${this.merchants.length} 家`),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '已全部激活')
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

    // 3. 🏭 供應商
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

    // 4. 📥 代收訂單
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
          h('td', { style: 'padding: 12px; font-weight: bold; color: #262626;' }, item.mchOrderNo),
          h('td', { style: 'padding: 12px;' }, item.sysOrderNo),
          h('td', { style: 'padding: 12px;' }, item.merchant),
          h('td', { style: 'padding: 12px; color: #52c41a; font-weight: bold;' }, item.amount),
          h('td', { style: 'padding: 12px;' }, item.fee),
          h('td', { style: 'padding: 12px; color: #1890ff;' }, item.status)
        ])))
      ])
    ])

    // 5. 📤 代付訂單
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
          h('td', { style: 'padding: 12px; font-weight: bold; color: #262626;' }, item.mchOrderNo),
          h('td', { style: 'padding: 12px;' }, item.sysOrderNo),
          h('td', { style: 'padding: 12px;' }, item.merchant),
          h('td', { style: 'padding: 12px; color: #fa8c16; font-weight: bold;' }, item.amount),
          h('td', { style: 'padding: 12px;' }, item.fee),
          h('td', { style: 'padding: 12px; color: #52c41a;' }, item.status)
        ])))
      ])
    ])

    // 6. 🏢 商戶列表
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
      ]) : h('div', { style: 'max-width: 720px; background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #f0f0f0;' }, [
        h('h4', { style: 'margin-top: 0; color: #1890ff;' }, '➕ 新增商戶'),
        h('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;' }, [
          h('div', {}, [
            h('label', { style: 'display: block; margin-bottom: 6px; font-weight: bold;' }, '商戶名稱:'),
            h('input', { value: this.newMerchant.name, onInput: e => this.newMerchant.name = e.target.value, placeholder: '請輸入商戶公司或平台名稱', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ]),
          h('div', {}, [
            h('label', { style: 'display: block; margin-bottom: 6px; font-weight: bold;' }, '自訂商戶號 (可選):'),
            h('input', { value: this.newMerchant.customId, onInput: e => this.newMerchant.customId = e.target.value, placeholder: '留空將自動生成 (例: MCH-888)', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ])
        ]),
        h('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;' }, [
          h('div', {}, [
            h('label', { style: 'display: block; margin-bottom: 6px; font-weight: bold;' }, '預設代收費率 (%):'),
            h('input', { value: this.newMerchant.collectRate, onInput: e => this.newMerchant.collectRate = e.target.value, placeholder: '例：0.6%', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ]),
          h('div', {}, [
            h('label', { style: 'display: block; margin-bottom: 6px; font-weight: bold;' }, '預設代付費率/單筆:'),
            h('input', { value: this.newMerchant.payoutRate, onInput: e => this.newMerchant.payoutRate = e.target.value, placeholder: '例：0.3% + ￥2.00', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ])
        ]),
        
        h('div', { style: 'border-top: 1px dashed #ccc; padding-top: 16px; margin-top: 16px;' }, [
          h('label', { style: 'display: block; margin-bottom: 12px; font-weight: bold; color: #262626;' }, '⚙️ 各別渠道開關、費率與單筆限額調整:'),
          ...this.paymentGateways.map(gw => {
            if (!this.newMerchant.channelConfigs[gw.id]) {
              this.newMerchant.channelConfigs[gw.id] = { enabled: true, rate: gw.fee, limit: '50,000' }
            }
            const cfg = this.newMerchant.channelConfigs[gw.id]
            return h('div', { style: 'display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 10px 12px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #ebedf0;' }, [
              h('div', { style: 'display: flex; align-items: center; gap: 8px; min-width: 180px;' }, [
                h('span', {}, gw.icon),
                h('span', { style: 'font-weight: 500;' }, gw.name)
              ]),
              h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, [
                h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
                  h('label', { style: 'font-size: 12px; color: #606266;' }, '專屬費率:'),
                  h('input', { value: cfg.rate, onInput: e => cfg.rate = e.target.value, style: 'width: 70px; padding: 4px 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 12px;' })
                ]),
                h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
                  h('label', { style: 'font-size: 12px; color: #606266;' }, '單筆限額:'),
                  h('input', { value: cfg.limit, onInput: e => cfg.limit = e.target.value, placeholder: '限額', style: 'width: 85px; padding: 4px 6px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 12px;' })
                ]),
                h('button', { 
                  onClick: () => cfg.enabled = !cfg.enabled, 
                  style: `border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; color: white; background: ${cfg.enabled ? '#52c41a' : '#bfbfbf'};` 
                }, cfg.enabled ? '已開通' : '未開通')
              ])
            ])
          })
        ]),

        h('button', { onClick: () => this.submitCreateMerchant(), style: 'background: #1890ff; color: white; border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 16px;' }, '🚀 完成新增商戶')
      ])
    ])

    // 7. 💸 商戶下發
    const renderMerchantPayout = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;' }, [
        h('h3', { style: 'margin: 0;' }, '💸 商戶下發審核打款'),
        h('span', { style: 'font-size: 13px; color: #8c8c8c;' }, '點擊下方商戶右側可直接調整餘額')
      ]),

      h('h4', { style: 'color: #1890ff; margin-bottom: 12px;' }, '💰 各商戶實時餘額概覽'),
      h('div', { style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;' }, 
        this.merchants.map(m => h('div', { style: 'background: #fafafa; border: 1px solid #f0f0f0; padding: 12px 16px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;' }, [
          h('div', {}, [
            h('div', { style: 'font-weight: bold; font-size: 14px;' }, m.name),
            h('div', { style: 'color: #52c41a; font-weight: bold; font-size: 16px; margin-top: 4px;' }, `￥${(m.rawBalance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
          ]),
          h('button', { onClick: () => this.openBalanceModal(m), style: 'background: #fa8c16; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;' }, '✏️ 編輯餘額')
        ]))
      ),

      h('h4', { style: 'margin-bottom: 12px;' }, '📋 下發申請審核列表'),
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
    ])

    // ✏️ 餘額調整 Modal 彈窗
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
          h('label', { style: 'display: block; font-size: 13px; font-weight: bold; margin-bottom: 6px;' }, '變更金額 (增加寫正數，減少寫負數):'),
          h('input', { 
            type: 'number', 
            value: this.balanceAdjustAmount, 
            onInput: e => this.balanceAdjustAmount = e.target.value,
            placeholder: '例如: 5000 或 -2000',
            style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box;' 
          })
        ]),
        h('div', { style: 'margin-bottom: 20px;' }, [
          h('label', { style: 'display: block; font-size: 13px; font-weight: bold; margin-bottom: 6px;' }, '調整理由/備註:'),
          h('input', { 
            value: this.balanceAdjustReason, 
            onInput: e => this.balanceAdjustReason = e.target.value,
            placeholder: '請輸入調帳理由 (例: 補單充值 / 沖銷)',
            style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box;' 
          })
        ]),
        h('div', { style: 'display: flex; justify-content: flex-end; gap: 12px;' }, [
          h('button', { onClick: () => this.closeBalanceModal(), style: 'padding: 8px 16px; border: 1px solid #dcdfe6; background: #fff; border-radius: 4px; cursor: pointer;' }, '取消'),
          h('button', { onClick: () => this.confirmBalanceAdjust(), style: 'padding: 8px 16px; border: none; background: #1890ff; color: white; border-radius: 4px; cursor: pointer; font-weight: bold;' }, '確認調整')
        ])
      ])
    ])

    // 主選單對應模組選取器
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

    // 系統整體 UI 渲染框架
    return h('div', { style: 'display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5;' }, [
      // 側邊欄 Sidebar
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
            { key: 'payout_audit', label: '💸 商戶下發與提現' }
          ].map(menu => h('div', {
            onClick: () => this.handleSelectMenu(menu.key),
            style: `padding: 12px 20px; cursor: pointer; font-size: 14px; transition: all 0.3s; background: ${this.activeMenu === menu.key ? '#1890ff' : 'transparent'}; color: ${this.activeMenu === menu.key ? '#fff' : 'rgba(255,255,255,0.65)'}`
          }, menu.label))
        ])
      ]),

      // 右側內容區 Content Area
      h('div', { style: 'flex: 1; padding: 24px; overflow-y: auto;' }, [
        renderActiveModule(),
        renderBalanceModal()
      ])
    ])
  }
})

app.use(ElementPlus)
app.mount('#app')
