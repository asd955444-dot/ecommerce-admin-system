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
      searchMerchantName: '',
      searchChannel: '',

      // 編輯餘額彈窗控制 (v1.2.2)
      showBalanceModal: false,
      selectedMerchantForBalance: null,
      balanceAdjustAmount: 0,
      balanceAdjustReason: '',

      // 新增商戶表單 (v1.2.2 含自訂商戶號)
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
        { id: 'MCH-1002', name: '海淘優選', appKey: 'bc_live_33419b', status: '正常', collectRate: '0.8%', payoutRate: '0.5% + ￥2.00', rawBalance: 42100.00 }
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
    // v1.2.2 支持自訂商戶號
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
    // v1.2.2 編輯商戶餘額彈窗與邏輯
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
    exportReportCSV(filename, rows) {
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      rows.forEach(row => {
        csvContent += row.join(",") + "\n"
      })
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  },
  render() {
    const filteredRunSummary = this.runSummaryList.filter(item => {
      const matchDate = !this.queryDate || item.date === this.queryDate
      const matchMerchant = !this.searchMerchantName || item.merchant.includes(this.searchMerchantName)
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

    // 1. 📊 代收付跑量總表
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
          h('button', { 
            onClick: () => this.exportReportCSV("BCPay_Run_Summary", [
              ["日期", "商戶名稱", "通道", "代收金額", "代付金額", "手續費", "淨結算金額", "交易筆數"],
              ...filteredRunSummary.map(i => [i.date, i.merchant, i.channel, i.collectAmt, i.payoutAmt, i.feeAmt, i.netAmt, i.count])
            ]),
            style: 'background: #52c41a; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;' 
          }, '📥 匯出跑量報表 CSV')
        ]),
        h('div', { style: 'background: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 20px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;' }, [
          h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
            h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '日期:'),
            h('input', { type: 'date', value: this.queryDate, onInput: e => this.queryDate = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ]),
          h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
            h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '商戶名稱:'),
            h('input', { placeholder: '搜尋商戶...', value: this.searchMerchantName, onInput: e => this.searchMerchantName = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
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

    // 6. 🏢 商戶列表 (v1.2.2：取消 App Key 顯示，保留商戶餘額，新增商戶改名與自訂商戶號)
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
        h('h4', { style: 'margin-top: 0; color: #1890ff;' }, '➕ 新增商戶 (v1.2.2)'),
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

    // 7. 💸 商戶下發 (v1.2.2 新增編輯商戶餘額按鈕)
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
            h('th', { style: 'padding: 12px;' }, '狀態'),
            h('th', { style: 'padding: 12px;' }, '操作')
          ])
        ]),
        h('tbody', {}, this.payoutRequests.map(item => h('tr', { style: 'border-bottom: 1px solid #f0f0f0;' }, [
          h('td', { style: 'padding: 12px;' }, item.id),
          h('td', { style: 'padding: 12px;' }, item.merchant),
          h('td', { style: 'padding: 12px; font-weight: bold; color: #fa8c16;' }, item.amount),
          h('td', { style: 'padding: 12px;' }, item.bank),
          h('td', { style: 'padding: 12px;' }, item.status),
          h('td', { style: 'padding: 12px;' }, item.status === '待審核' ? h('button', { onClick: () => this.approvePayout(item), style: 'background: #1890ff; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer;' }, '同意下發') : h('span', { style: 'color: #909399;' }, '已完成'))
        ])))
      ])
    ])

    // v1.2.2 編輯商戶餘額 Modal 小視窗
    const renderBalanceModal = () => this.showBalanceModal && h('div', { style: 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;' }, [
      h('div', { style: 'background: #fff; border-radius: 8px; width: 420px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' }, [
        h('h3', { style: 'margin-top: 0; margin-bottom: 16px; color: #1f2937;' }, `✏️ 編輯商戶餘額 [${this.selectedMerchantForBalance?.name}]`),
        
        h('div', { style: 'margin-bottom: 12px;' }, [
          h('label', { style: 'display: block; font-size: 13px; color: #606266; margin-bottom: 4px;' }, '當前餘額:'),
          h('div', { style: 'font-size: 18px; font-weight: bold; color: #52c41a;' }, `￥${(this.selectedMerchantForBalance?.rawBalance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2})}`)
        ]),

        h('div', { style: 'margin-bottom: 16px;' }, [
          h('label', { style: 'display: block; font-size: 13px; font-weight: bold; color: #262626; margin-bottom: 6px;' }, '變更金額 (增加用正數，扣減用負數):'),
          h('input', { 
            type: 'number', 
            placeholder: '例如: 5000 或 -2000', 
            value: this.balanceAdjustAmount, 
            onInput: e => this.balanceAdjustAmount = e.target.value, 
            style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box;' 
          })
        ]),

        h('div', { style: 'margin-bottom: 20px;' }, [
          h('label', { style: 'display: block; font-size: 13px; font-weight: bold; color: #262626; margin-bottom: 6px;' }, '變更理由:'),
          h('textarea', { 
            rows: 3, 
            placeholder: '請輸入手動人工入帳、下發扣款或系統補償之理由...', 
            value: this.balanceAdjustReason, 
            onInput: e => this.balanceAdjustReason = e.target.value, 
            style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; box-sizing: border-box; resize: vertical;' 
          })
        ]),

        h('div', { style: 'display: flex; justify-content: flex-end; gap: 12px;' }, [
          h('button', { onClick: () => this.closeBalanceModal(), style: 'background: #f0f0f0; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; color: #595959;' }, '取消'),
          h('button', { onClick: () => this.confirmBalanceAdjust(), style: 'background: #1890ff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; color: white; font-weight: bold;' }, '確認')
        ])
      ])
    ])

    // 8. 📊 報表結算
    const renderReportSettlement = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '📊 報表結算中心'),
      renderFilterHeader(false),
      h('p', { style: 'color: #606266;' }, '請點擊下方按鈕直接下載每日統計對帳數據報表：'),
      h('button', { 
        onClick: () => this.exportReportCSV("BCPay_Settlement_Report", [
          ["日期", "代收總金額", "代付總金額", "系統服務費", "應結算淨額"],
          [this.queryDate, "￥328,520.00", "￥142,100.00", "￥2,410.00", "￥184,010.00"]
        ]),
        style: 'background: #1890ff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;' 
      }, '📥 匯出當日對帳結算報表 (CSV)')
    ])

    // 9. ⚖️ 通道權重配置
    const renderGatewaysConfig = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '⚖️ 通道權重與分流策略'),
      h('table', { style: 'width: 100%; border-collapse: collapse;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #fafafa; border-bottom: 1px solid #f0f0f0; text-align: left;' }, [
            h('th', { style: 'padding: 12px;' }, '通道名稱'),
            h('th', { style: 'padding: 12px;' }, '手續費率'),
            h('th', { style: 'padding: 12px;' }, '流量分流比'),
            h('th', { style: 'padding: 12px;' }, '狀態'),
            h('th', { style: 'padding: 12px;' }, '開關控制')
          ])
        ]),
        h('tbody', {}, this.paymentGateways.map(gw => h('tr', { style: 'border-bottom: 1px solid #f0f0f0;' }, [
          h('td', { style: 'padding: 12px; font-weight: bold;' }, `${gw.icon} ${gw.name}`),
          h('td', { style: 'padding: 12px;' }, gw.fee),
          h('td', { style: 'padding: 12px;' }, gw.trafficRate),
          h('td', { style: 'padding: 12px; color: ' + (gw.status ? '#52c41a' : '#f5222d') }, gw.status ? '● 啟用中' : '○ 已停用'),
          h('td', { style: 'padding: 12px;' }, h('button', { onClick: () => this.toggleGateway(gw), style: `border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; color: white; background: ${gw.status ? '#f5222d' : '#52c41a'};` }, gw.status ? '停用通道' : '啟用通道'))
        ])))
      ])
    ])

    return h('div', { style: 'display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f0f2f5;' }, [
      // 彈窗渲染 (v1.2.2)
      renderBalanceModal(),

      // 左側淺藍色導覽選單 (v1.2.2 更名為「商戶列表」)
      h('div', { style: 'width: 240px; background: #e6f7ff; border-right: 1px solid #bae7ff; color: #002c8c; display: flex; flex-direction: column;' }, [
        h('div', { style: 'padding: 20px 16px; font-size: 20px; font-weight: bold; color: #096dd9; border-bottom: 1px solid #bae7ff; background: #e6f2ff;' }, '💳 BC pay 管理後台'),
        h('div', { style: 'flex: 1; padding: 12px 0;' }, [
          h('div', { onClick: () => this.handleSelectMenu('run_summary'), style: `padding: 12px 20px; cursor: pointer; font-weight: 500; color: ${this.activeMenu === 'run_summary' ? '#096dd9' : '#434343'}; background: ${this.activeMenu === 'run_summary' ? '#bae7ff' : 'transparent'}; border-right: ${this.activeMenu === 'run_summary' ? '4px solid #096dd9' : 'none'};` }, '📊 代收付跑量總表'),
          h('div', { onClick: () => this.handleSelectMenu('payment_overview'), style: `padding: 12px 20px; cursor: pointer; font-weight: 500; color: ${this.activeMenu === 'payment_overview' ? '#096dd9' : '#434343'}; background: ${this.activeMenu === 'payment_overview' ? '#bae7ff' : 'transparent'}; border-right: ${this.activeMenu === 'payment_overview' ? '4px solid #096dd9' : 'none'};` }, '📈 支付數據大屏'),
          h('div', { onClick: () => this.handleSelectMenu('gateways'), style: `padding: 12px 20px; cursor: pointer; font-weight: 500; color: ${this.activeMenu === 'gateways' ? '#096dd9' : '#434343'}; background: ${this.activeMenu === 'gateways' ? '#bae7ff' : 'transparent'}; border-right: ${this.activeMenu === 'gateways' ? '4px solid #096dd9' : 'none'};` }, '⚖️ 通道權重配置'),
          h('div', { onClick: () => this.handleSelectMenu('supplier'), style: `padding: 12px 20px; cursor: pointer; font-weight: 500; color: ${this.activeMenu === 'supplier' ? '#096dd9' : '#434343'}; background: ${this.activeMenu === 'supplier' ? '#bae7ff' : 'transparent'}; border-right: ${this.activeMenu === 'supplier' ? '4px solid #096dd9' : 'none'};` }, '🏭 供應商'),
          h('div', { onClick: () => this.handleSelectMenu('collect_orders'), style: `padding: 12px 20px; cursor: pointer; font-weight: 500; color: ${this.activeMenu === 'collect_orders' ? '#096dd9' : '#434343'}; background: ${this.activeMenu === 'collect_orders' ? '#bae7ff' : 'transparent'}; border-right: ${this.activeMenu === 'collect_orders' ? '4px solid #096dd9' : 'none'};` }, '📥 代收訂單'),
          h('div', { onClick: () => this.handleSelectMenu('payout_orders'), style: `padding: 12px 20px; cursor: pointer; font-weight: 500; color: ${this.activeMenu === 'payout_orders' ? '#096dd9' : '#434343'}; background: ${this.activeMenu === 'payout_orders' ? '#bae7ff' : 'transparent'}; border-right: ${this.activeMenu === 'payout_orders' ? '4px solid #096dd9' : 'none'};` }, '📤 代付訂單'),
          h('div', { onClick: () => this.handleSelectMenu('merchant_settings'), style: `padding: 12px 20px; cursor: pointer; font-weight: 500; color: ${this.activeMenu === 'merchant_settings' ? '#096dd9' : '#434343'}; background: ${this.activeMenu === 'merchant_settings' ? '#bae7ff' : 'transparent'}; border-right: ${this.activeMenu === 'merchant_settings' ? '4px solid #096dd9' : 'none'};` }, '🏢 商戶列表'),
          h('div', { onClick: () => this.handleSelectMenu('merchant_payout'), style: `padding: 12px 20px; cursor: pointer; font-weight: 500; color: ${this.activeMenu === 'merchant_payout' ? '#096dd9' : '#434343'}; background: ${this.activeMenu === 'merchant_payout' ? '#bae7ff' : 'transparent'}; border-right: ${this.activeMenu === 'merchant_payout' ? '4px solid #096dd9' : 'none'};` }, '💸 商戶下發'),
          h('div', { onClick: () => this.handleSelectMenu('report_settlement'), style: `padding: 12px 20px; cursor: pointer; font-weight: 500; color: ${this.activeMenu === 'report_settlement' ? '#096dd9' : '#434343'}; background: ${this.activeMenu === 'report_settlement' ? '#bae7ff' : 'transparent'}; border-right: ${this.activeMenu === 'report_settlement' ? '4px solid #096dd9' : 'none'};` }, '📊 報表結算')
        ])
      ]),

      // 右側主要內容視窗
      h('div', { style: 'flex: 1; display: flex; flex-direction: column;' }, [
        h('div', { style: 'height: 60px; background: #fff; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'font-weight: bold; font-size: 16px; color: #1f2937;' }, 'BC pay 運營管理系統'),
          h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, [
            h('span', { style: 'background: #52c41a; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px;' }, 'BC pay v1.2.2'),
            h('a', { href: 'https://render.com', target: '_blank', style: 'color: #8c8c8c; font-size: 14px; text-decoration: none;' }, '託管於 Render')
          ])
        ]),

        h('div', { style: 'padding: 24px; flex: 1;' }, [
          this.activeMenu === 'run_summary' ? renderRunSummaryModule() : null,
          this.activeMenu === 'payment_overview' ? renderPaymentOverview() : null,
          this.activeMenu === 'gateways' ? renderGatewaysConfig() : null,
          this.activeMenu === 'supplier' ? renderSupplierModule() : null,
          this.activeMenu === 'collect_orders' ? renderCollectOrders() : null,
          this.activeMenu === 'payout_orders' ? renderPayoutOrders() : null,
          this.activeMenu === 'merchant_settings' ? renderMerchantSettings() : null,
          this.activeMenu === 'merchant_payout' ? renderMerchantPayout() : null,
          this.activeMenu === 'report_settlement' ? renderReportSettlement() : null
        ])
      ])
    ])
  }
})

app.use(ElementPlus)
app.mount('#app')
