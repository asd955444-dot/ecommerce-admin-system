import { createApp, h } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const STORAGE_KEY_MERCHANTS = 'bcpay_merchants_v1'

const app = createApp({
  data() {
    return {
      activeMenu: 'payment_overview',
      supplierTab: 'collect_status',
      merchantTab: 'query',

      // 查询条件状态
      queryDate: '2026-08-12',
      queryMonth: '2026-08',
      supplierOrderNo: '',
      systemOrderNo: '',

      // 新增商户表单
      newMerchant: {
        name: '',
        rate: '0.6%',
        payoutFee: '2.00'
      },

      // 三方通道状态
      paymentGateways: [
        { id: 'alipay', name: '支付宝 (Alipay)', icon: '🟦', fee: '0.6%', status: true, dailyLimit: '￥500,000' },
        { id: 'wechat', name: '微信支付 (WeChat Pay)', icon: '🟩', fee: '0.6%', status: true, dailyLimit: '￥500,000' },
        { id: 'linepay', name: 'LINE Pay', icon: '🟢', fee: '2.2%', status: true, dailyLimit: 'NT$ 300,000' },
        { id: 'ecpay', name: '绿界 ECPay (信用卡/超商)', icon: '🟧', fee: '2.85%', status: true, dailyLimit: 'NT$ 1,000,000' },
        { id: 'stripe', name: 'Stripe (国际信用卡)', icon: '💜', fee: '3.4% + $0.30', status: false, dailyLimit: '$ 50,000' }
      ],

      // 基础数据
      transactions: [
        { id: 'TX-20260812-9901', channel: '微信支付', channelIcon: '🟩', orderId: 'BC-IN-2026081201', amount: '￥299.00', status: '交易成功', date: '2026-08-12' },
        { id: 'TX-20260812-9902', channel: '支付宝', channelIcon: '🟦', orderId: 'BC-IN-2026081202', amount: '￥1,280.00', status: '交易成功', date: '2026-08-12' },
        { id: 'TX-20260812-9903', channel: 'LINE Pay', channelIcon: '🟢', orderId: 'BC-OUT-2026081202', amount: 'NT$ 2,500', status: '交易成功', date: '2026-08-12' }
      ],

      supplierOrders: [
        { suppOrderNo: 'SUP-COL-88091', sysOrderNo: 'BC-IN-2026081201', suppName: '极速支付通道A', amount: '￥5,000.00', status: '成功', matchType: '精准成功', date: '2026-08-12' },
        { suppOrderNo: 'SUP-PAY-77102', sysOrderNo: 'BC-OUT-2026081202', suppName: '顺达代付网关', amount: '￥12,300.00', status: '处理中', matchType: '精准确认为是', date: '2026-08-12' }
      ],

      collectOrders: [
        { sysOrderNo: 'BC-IN-2026081201', suppOrderNo: 'SUP-COL-88091', merchant: '闪电电商', amount: '￥5,000.00', fee: '￥30.00', status: '已代收成功', date: '2026-08-12' },
        { sysOrderNo: 'BC-IN-2026081202', suppOrderNo: 'SUP-COL-88095', merchant: '海淘优选', amount: '￥1,200.00', fee: '￥7.20', status: '等待支付', date: '2026-08-12' }
      ],

      payoutOrders: [
        { sysOrderNo: 'BC-OUT-2026081202', suppOrderNo: 'SUP-PAY-77102', merchant: '闪电电商', amount: '￥12,300.00', fee: '￥15.00', status: '代付处理中', date: '2026-08-12' },
        { sysOrderNo: 'BC-OUT-2026081109', suppOrderNo: 'SUP-PAY-76011', merchant: '星光娱乐', amount: '￥8,000.00', fee: '￥10.00', status: '代付成功', date: '2026-08-11' }
      ],

      merchants: [
        { id: 'MCH-1001', name: '闪电电商', appKey: 'bc_live_99812a', status: '正常', rate: '0.6%', balance: '￥158,200.00' },
        { id: 'MCH-1002', name: '海淘优选', appKey: 'bc_live_33419b', status: '正常', rate: '0.8%', balance: '￥42,100.00' }
      ],

      payoutRequests: [
        { id: 'WD-2026081201', merchant: '闪电电商', amount: '￥50,000.00', bank: '招商银行 (尾号 8812)', status: '待审核', time: '2026-08-12 16:00' },
        { id: 'WD-2026081105', merchant: '海淘优选', amount: '￥20,000.00', bank: '建设银行 (尾号 4102)', status: '已下发', time: '2026-08-11 14:30' }
      ]
    }
  },
  created() {
    // 读取本地保存的商户数据
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
    // 提交创建商户
    submitCreateMerchant() {
      if (!this.newMerchant.name) {
        alert('请输入商户名称')
        return
      }
      const newId = `MCH-${1000 + this.merchants.length + 1}`
      const newKey = `bc_live_${Math.random().toString(36).substring(2, 8)}`
      const item = {
        id: newId,
        name: this.newMerchant.name,
        appKey: newKey,
        status: '正常',
        rate: this.newMerchant.rate || '0.6%',
        balance: '￥0.00'
      }
      this.merchants.push(item)
      localStorage.setItem(STORAGE_KEY_MERCHANTS, JSON.stringify(this.merchants))
      alert(`商户 [${this.newMerchant.name}] 开户成功！分配商户号: ${newId}`)
      this.newMerchant.name = ''
      this.merchantTab = 'query'
    },
    // 同意下发
    approvePayout(item) {
      item.status = '已下发'
      alert(`已成功同意下发单号: ${item.id}，资金已结算！`)
    },
    // 导出 Excel/CSV
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
    // 筛选计算逻辑
    const filteredSupplierOrders = this.supplierOrders.filter(o => {
      const matchSupp = !this.supplierOrderNo || o.suppOrderNo.includes(this.supplierOrderNo)
      const matchSys = !this.systemOrderNo || o.sysOrderNo.includes(this.systemOrderNo)
      const matchDate = !this.queryDate || o.date === this.queryDate
      return matchSupp && matchSys && matchDate
    })

    const filteredCollectOrders = this.collectOrders.filter(o => {
      const matchSys = !this.systemOrderNo || o.sysOrderNo.includes(this.systemOrderNo)
      const matchDate = !this.queryDate || o.date === this.queryDate
      return matchSys && matchDate
    })

    const filteredPayoutOrders = this.payoutOrders.filter(o => {
      const matchSys = !this.systemOrderNo || o.sysOrderNo.includes(this.systemOrderNo)
      const matchDate = !this.queryDate || o.date === this.queryDate
      return matchSys && matchDate
    })

    // 常用筛选组件
    const renderFilterHeader = (isSupplier = false) => h('div', { style: 'background: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 20px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;' }, [
      h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '按日查询:'),
        h('input', { type: 'date', value: this.queryDate, onInput: e => this.queryDate = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]),
      h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '按月查询:'),
        h('input', { type: 'month', value: this.queryMonth, onInput: e => this.queryMonth = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]),
      isSupplier ? h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '供应商单号:'),
        h('input', { placeholder: '输入供应商单号...', value: this.supplierOrderNo, onInput: e => this.supplierOrderNo = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]) : null,
      h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, 'BC pay单号:'),
        h('input', { placeholder: '输入BC pay单号...', value: this.systemOrderNo, onInput: e => this.systemOrderNo = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]),
      h('button', { onClick: () => this.$forceUpdate(), style: 'background: #409eff; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer;' }, '🔍 立即检索')
    ])

    // 数据大屏
    const renderPaymentOverview = () => h('div', [
      h('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;' }, [
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日代收总额'),
          h('div', { style: 'font-size: 26px; font-weight: bold; margin: 8px 0;' }, '￥328,520.00'),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '成功率 99.1%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日代付总额'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #e6a23c; margin: 8px 0;' }, '￥142,100.00'),
          h('div', { style: 'color: #409eff; font-size: 12px;' }, '完成率 98.5%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '平台开户商户'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #409eff; margin: 8px 0;' }, `${this.merchants.length} 家`),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '已全部激活')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '待处理下发'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #f56c6c; margin: 8px 0;' }, `${this.payoutRequests.filter(p => p.status === '待审核').length} 笔`),
          h('div', { style: 'color: #909399; font-size: 12px;' }, '需要财务审核')
        ])
      ]),
      h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
        h('h3', { style: 'margin-top: 0;' }, 'BC pay 聚合交易流水'),
        h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
          h('thead', {}, [
            h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
              h('th', { style: 'padding: 12px;' }, '交易流水号'),
              h('th', { style: 'padding: 12px;' }, '渠道'),
              h('th', { style: 'padding: 12px;' }, '关联单号'),
              h('th', { style: 'padding: 12px;' }, '金额'),
              h('th', { style: 'padding: 12px;' }, '状态')
            ])
          ]),
          h('tbody', {}, this.transactions.map(t => h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
            h('td', { style: 'padding: 12px; font-family: monospace;' }, t.id),
            h('td', { style: 'padding: 12px;' }, `${t.channelIcon} ${t.channel}`),
            h('td', { style: 'padding: 12px; color: #409eff;' }, t.orderId),
            h('td', { style: 'padding: 12px; font-weight: bold;' }, t.amount),
            h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #f0f9eb; color: #67c23a; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, t.status))
          ])))
        ])
      ])
    ])

    // 供应商模块
    const renderSupplierModule = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '🏭 供应商订单管理中心'),
      h('div', { style: 'display: flex; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid #e4e7ed; padding-bottom: 10px;' }, [
        h('button', { onClick: () => this.supplierTab = 'collect_status', style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; ${this.supplierTab === 'collect_status' ? 'background: #409eff; color: white;' : 'background: #f4f4f5; color: #606266;'}` }, '供应商代收订单状态'),
        h('button', { onClick: () => this.supplierTab = 'payout_status', style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; ${this.supplierTab === 'payout_status' ? 'background: #409eff; color: white;' : 'background: #f4f4f5; color: #606266;'}` }, '供应商代付订单状态'),
        h('button', { onClick: () => this.supplierTab = 'collect_exact', style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; ${this.supplierTab === 'collect_exact' ? 'background: #67c23a; color: white;' : 'background: #f4f4f5; color: #606266;'}` }, '供应商代收订单状态(精准)'),
        h('button', { onClick: () => this.supplierTab = 'payout_exact', style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; ${this.supplierTab === 'payout_exact' ? 'background: #67c23a; color: white;' : 'background: #f4f4f5; color: #606266;'}` }, '供应商代付订单状态(精准)')
      ]),
      renderFilterHeader(true),
      h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
            h('th', { style: 'padding: 12px;' }, '供应商'),
            h('th', { style: 'padding: 12px;' }, '供应商订单号'),
            h('th', { style: 'padding: 12px;' }, 'BC pay订单号'),
            h('th', { style: 'padding: 12px;' }, '金额'),
            h('th', { style: 'padding: 12px;' }, '状态'),
            h('th', { style: 'padding: 12px;' }, '匹配模式'),
            h('th', { style: 'padding: 12px;' }, '日期')
          ])
        ]),
        h('tbody', {}, filteredSupplierOrders.length ? filteredSupplierOrders.map(item => 
          h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
            h('td', { style: 'padding: 12px;' }, item.suppName),
            h('td', { style: 'padding: 12px; font-family: monospace; color: #e6a23c;' }, item.suppOrderNo),
            h('td', { style: 'padding: 12px; font-family: monospace; color: #409eff;' }, item.sysOrderNo),
            h('td', { style: 'padding: 12px; font-weight: bold;' }, item.amount),
            h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #f0f9eb; color: #67c23a; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.status)),
            h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #e8f4ff; color: #1890ff; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.matchType)),
            h('td', { style: 'padding: 12px; color: #909399;' }, item.date)
          ])
        ) : [h('tr', {}, [h('td', { colspan: 7, style: 'text-align: center; padding: 24px; color: #909399;' }, '未找到符合条件的供应商订单')])])
      ])
    ])

    // 代收订单
    const renderCollectOrders = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '📥 代收订单管理'),
      renderFilterHeader(false),
      h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
            h('th', { style: 'padding: 12px;' }, 'BC pay代收单号'),
            h('th', { style: 'padding: 12px;' }, '供应商单号'),
            h('th', { style: 'padding: 12px;' }, '所属商户'),
            h('th', { style: 'padding: 12px;' }, '金额'),
            h('th', { style: 'padding: 12px;' }, '手续费'),
            h('th', { style: 'padding: 12px;' }, '状态'),
            h('th', { style: 'padding: 12px;' }, '日期')
          ])
        ]),
        h('tbody', {}, filteredCollectOrders.length ? filteredCollectOrders.map(item => 
          h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
            h('td', { style: 'padding: 12px; font-family: monospace; color: #409eff;' }, item.sysOrderNo),
            h('td', { style: 'padding: 12px; font-family: monospace; color: #909399;' }, item.suppOrderNo),
            h('td', { style: 'padding: 12px;' }, item.merchant),
            h('td', { style: 'padding: 12px; font-weight: bold; color: #67c23a;' }, item.amount),
            h('td', { style: 'padding: 12px; color: #f56c6c;' }, item.fee),
            h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #f0f9eb; color: #67c23a; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.status)),
            h('td', { style: 'padding: 12px; color: #909399;' }, item.date)
          ])
        ) : [h('tr', {}, [h('td', { colspan: 7, style: 'text-align: center; padding: 24px; color: #909399;' }, '无对应代收订单')])])
      ])
    ])

    // 代付订单
    const renderPayoutOrders = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '📤 代付订单管理'),
      renderFilterHeader(false),
      h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
            h('th', { style: 'padding: 12px;' }, 'BC pay代付单号'),
            h('th', { style: 'padding: 12px;' }, '供应商单号'),
            h('th', { style: 'padding: 12px;' }, '申请商户'),
            h('th', { style: 'padding: 12px;' }, '代付金额'),
            h('th', { style: 'padding: 12px;' }, '手续费'),
            h('th', { style: 'padding: 12px;' }, '状态'),
            h('th', { style: 'padding: 12px;' }, '日期')
          ])
        ]),
        h('tbody', {}, filteredPayoutOrders.length ? filteredPayoutOrders.map(item => 
          h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
            h('td', { style: 'padding: 12px; font-family: monospace; color: #409eff;' }, item.sysOrderNo),
            h('td', { style: 'padding: 12px; font-family: monospace; color: #909399;' }, item.suppOrderNo),
            h('td', { style: 'padding: 12px;' }, item.merchant),
            h('td', { style: 'padding: 12px; font-weight: bold; color: #e6a23c;' }, item.amount),
            h('td', { style: 'padding: 12px; color: #f56c6c;' }, item.fee),
            h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #fdf6ec; color: #e6a23c; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.status)),
            h('td', { style: 'padding: 12px; color: #909399;' }, item.date)
          ])
        ) : [h('tr', {}, [h('td', { colspan: 7, style: 'text-align: center; padding: 24px; color: #909399;' }, '无对应代付订单')])])
      ])
    ])

    // 商户开户设置
    const renderMerchantSettings = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '🏢 商户开户设置中心'),
      h('div', { style: 'display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #e4e7ed; padding-bottom: 10px;' }, [
        h('button', { onClick: () => this.merchantTab = 'query', style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; ${this.merchantTab === 'query' ? 'background: #409eff; color: white;' : 'background: #f4f4f5; color: #606266;'}` }, '🔍 商户查询页面'),
        h('button', { onClick: () => this.merchantTab = 'config', style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; ${this.merchantTab === 'config' ? 'background: #67c23a; color: white;' : 'background: #f4f4f5; color: #606266;'}` }, '⚙️ 商户开户配置页面')
      ]),
      this.merchantTab === 'query' ? h('div', [
        h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
          h('thead', {}, [
            h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
              h('th', { style: 'padding: 12px;' }, '商户号'),
              h('th', { style: 'padding: 12px;' }, '商户名称'),
              h('th', { style: 'padding: 12px;' }, 'API AppKey'),
              h('th', { style: 'padding: 12px;' }, '签约费率'),
              h('th', { style: 'padding: 12px;' }, '账户余额'),
              h('th', { style: 'padding: 12px;' }, '状态')
            ])
          ]),
          h('tbody', {}, this.merchants.map(m => 
            h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
              h('td', { style: 'padding: 12px; font-weight: bold;' }, m.id),
              h('td', { style: 'padding: 12px;' }, m.name),
              h('td', { style: 'padding: 12px; font-family: monospace; color: #e6a23c;' }, m.appKey),
              h('td', { style: 'padding: 12px;' }, m.rate),
              h('td', { style: 'padding: 12px; color: #67c23a; font-weight: bold;' }, m.balance),
              h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #f0f9eb; color: #67c23a; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, m.status))
            ])
          ))
        ])
      ]) : h('div', { style: 'max-width: 500px; background: #f8f9fa; padding: 20px; border-radius: 8px;' }, [
        h('h4', { style: 'margin-top: 0;' }, '开设新商户账号'),
        h('div', { style: 'display: grid; gap: 12px;' }, [
          h('div', {}, [
            h('label', { style: 'display: block; font-size: 13px; margin-bottom: 4px; font-weight: bold;' }, '商户全称:'),
            h('input', { placeholder: '例如: 某某科技公司', value: this.newMerchant.name, onInput: e => this.newMerchant.name = e.target.value, style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ]),
          h('div', {}, [
            h('label', { style: 'display: block; font-size: 13px; margin-bottom: 4px; font-weight: bold;' }, '代收费率 (%):'),
            h('input', { value: this.newMerchant.rate, onInput: e => this.newMerchant.rate = e.target.value, style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ]),
          h('div', {}, [
            h('label', { style: 'display: block; font-size: 13px; margin-bottom: 4px; font-weight: bold;' }, '代付费率 (定额/笔):'),
            h('input', { value: this.newMerchant.payoutFee, onInput: e => this.newMerchant.payoutFee = e.target.value, style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
          ]),
          h('button', { onClick: () => this.submitCreateMerchant(), style: 'background: #67c23a; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold;' }, '确认开户并自动生成 AppKey')
        ])
      ])
    ])

    // 商户下发
    const renderMerchantPayout = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '💸 商户下发审核打款'),
      h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
            h('th', { style: 'padding: 12px;' }, '下发单号'),
            h('th', { style: 'padding: 12px;' }, '申请商户'),
            h('th', { style: 'padding: 12px;' }, '下发金额'),
            h('th', { style: 'padding: 12px;' }, '收款银行'),
            h('th', { style: 'padding: 12px;' }, '状态'),
            h('th', { style: 'padding: 12px;' }, '申请时间'),
            h('th', { style: 'padding: 12px;' }, '审核操作')
          ])
        ]),
        h('tbody', {}, this.payoutRequests.map(p => 
          h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
            h('td', { style: 'padding: 12px; font-family: monospace;' }, p.id),
            h('td', { style: 'padding: 12px; font-weight: bold;' }, p.merchant),
            h('td', { style: 'padding: 12px; color: #f56c6c; font-weight: bold;' }, p.amount),
            h('td', { style: 'padding: 12px;' }, p.bank),
            h('td', { style: 'padding: 12px;' }, h('span', { style: `padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${p.status === '已下发' ? '#f0f9eb' : '#fef0f0'}; color: ${p.status === '已下发' ? '#67c23a' : '#f56c6c'};` }, p.status)),
            h('td', { style: 'padding: 12px; color: #909399;' }, p.time),
            h('td', { style: 'padding: 12px;' }, p.status === '待审核' ? h('button', { onClick: () => this.approvePayout(p), style: 'background: #409eff; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer;' }, '同意打款') : '✓ 已打款')
          ])
        ))
      ])
    ])

    // 报表结算
    const renderReportSettlement = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '📊 报表结算中心'),
      renderFilterHeader(false),
      h('div', { style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;' }, [
        h('div', { style: 'border: 1px solid #e4e7ed; padding: 20px; border-radius: 8px; text-align: center;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '本月结算总代收'),
          h('div', { style: 'font-size: 24px; font-weight: bold; margin: 10px 0;' }, '￥4,850,200.00'),
          h('button', { 
            onClick: () => this.exportReportCSV("BCPay_Collect_Report", [
              ["BC pay单号", "供应商单号", "商户", "金额", "手续费", "状态", "日期"],
              ...this.collectOrders.map(o => [o.sysOrderNo, o.suppOrderNo, o.merchant, o.amount, o.fee, o.status, o.date])
            ]), 
            style: 'background: #67c23a; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;' 
          }, '📥 真实导出代收 CSV')
        ]),
        h('div', { style: 'border: 1px solid #e4e7ed; padding: 20px; border-radius: 8px; text-align: center;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '本月结算总代付'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #e6a23c; margin: 10px 0;' }, '￥2,120,000.00'),
          h('button', { 
            onClick: () => this.exportReportCSV("BCPay_Payout_Report", [
              ["BC pay单号", "供应商单号", "商户", "金额", "手续费", "状态", "日期"],
              ...this.payoutOrders.map(o => [o.sysOrderNo, o.suppOrderNo, o.merchant, o.amount, o.fee, o.status, o.date])
            ]), 
            style: 'background: #e6a23c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;' 
          }, '📥 真实导出代付 CSV')
        ]),
        h('div', { style: 'border: 1px solid #e4e7ed; padding: 20px; border-radius: 8px; text-align: center;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '平台交易净利润'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #f56c6c; margin: 10px 0;' }, '￥28,401.20'),
          h('button', { onClick: () => alert('已自动生成对账分析凭证！'), style: 'background: #409eff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;' }, '📄 结算对账凭证')
        ])
      ])
    ])

    // 三方通道配置
    const renderGatewaysConfig = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0; margin-bottom: 20px;' }, '第三方支付网关配置与开关'),
      h('div', { style: 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;' }, this.paymentGateways.map(gw => 
        h('div', { style: 'border: 1px solid #e4e7ed; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;' }, [
          h('div', [
            h('div', { style: 'font-size: 18px; font-weight: bold; margin-bottom: 6px;' }, `${gw.icon} ${gw.name}`),
            h('div', { style: 'font-size: 13px; color: #606266; margin-bottom: 4px;' }, `结算手续费率: ${gw.fee}`),
            h('div', { style: 'font-size: 13px; color: #909399;' }, `单日限额: ${gw.dailyLimit}`)
          ]),
          h('button', { 
            onClick: () => this.toggleGateway(gw), 
            style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; color: white; background: ${gw.status ? '#67c23a' : '#909399'};` 
          }, gw.status ? '已开启' : '已关闭')
        ])
      ))
    ])

    return h('div', { style: 'display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f0f2f5;' }, [
      // 侧边栏
      h('div', { style: 'width: 240px; background: #001529; color: #fff; display: flex; flex-direction: column;' }, [
        h('div', { style: 'padding: 20px 16px; font-size: 20px; font-weight: bold; color: #409EFF; border-bottom: 1px solid #1f2d3d;' }, '💳 BC pay 管理后台'),
        h('div', { style: 'flex: 1; padding: 12px 0;' }, [
          h('div', { onClick: () => this.handleSelectMenu('payment_overview'), style: `padding: 12px 20px; cursor: pointer; color: ${this.activeMenu === 'payment_overview' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'payment_overview' ? '#1890ff22' : 'transparent'};` }, '📈 支付数据大屏'),
          h('div', { onClick: () => this.handleSelectMenu('gateways'), style: `padding: 12px 20px; cursor: pointer; color: ${this.activeMenu === 'gateways' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'gateways' ? '#1890ff22' : 'transparent'};` }, '⚙️ 三方通道配置'),
          h('div', { onClick: () => this.handleSelectMenu('supplier'), style: `padding: 12px 20px; cursor: pointer; color: ${this.activeMenu === 'supplier' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'supplier' ? '#1890ff22' : 'transparent'};` }, '🏭 供应商'),
          h('div', { onClick: () => this.handleSelectMenu('collect_orders'), style: `padding: 12px 20px; cursor: pointer; color: ${this.activeMenu === 'collect_orders' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'collect_orders' ? '#1890ff22' : 'transparent'};` }, '📥 代收订单'),
          h('div', { onClick: () => this.handleSelectMenu('payout_orders'), style: `padding: 12px 20px; cursor: pointer; color: ${this.activeMenu === 'payout_orders' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'payout_orders' ? '#1890ff22' : 'transparent'};` }, '📤 代付订单'),
          h('div', { onClick: () => this.handleSelectMenu('merchant_settings'), style: `padding: 12px 20px; cursor: pointer; color: ${this.activeMenu === 'merchant_settings' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'merchant_settings' ? '#1890ff22' : 'transparent'};` }, '🏢 商户开户设置'),
          h('div', { onClick: () => this.handleSelectMenu('merchant_payout'), style: `padding: 12px 20px; cursor: pointer; color: ${this.activeMenu === 'merchant_payout' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'merchant_payout' ? '#1890ff22' : 'transparent'};` }, '💸 商户下发'),
          h('div', { onClick: () => this.handleSelectMenu('report_settlement'), style: `padding: 12px 20px; cursor: pointer; color: ${this.activeMenu === 'report_settlement' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'report_settlement' ? '#1890ff22' : 'transparent'};` }, '📊 报表结算')
        ])
      ]),

      // 右侧主内容区
      h('div', { style: 'flex: 1; display: flex; flex-direction: column;' }, [
        h('div', { style: 'height: 60px; background: #fff; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08);' }, [
          h('div', { style: 'font-weight: bold; font-size: 16px;' }, 'BC pay 运营管理系统'),
          h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, [
            h('span', { style: 'background: #67c23a; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px;' }, 'BC pay v2.1.0 (交互就绪)'),
            h('a', { href: 'https://render.com', target: '_blank', style: 'color: #909399; font-size: 14px; text-decoration: none;' }, '托管于 Render')
          ])
        ]),

        h('div', { style: 'padding: 24px; flex: 1;' }, [
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
