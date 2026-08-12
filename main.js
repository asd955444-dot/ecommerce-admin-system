import { createApp, h } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  data() {
    return {
      activeMenu: 'payment_overview',
      // 供应商选单子标签
      supplierTab: 'collect_status',
      // 商户开户设置子标签
      merchantTab: 'query',

      // 通用查询表单状态
      queryDate: '2026-08-12',
      queryMonth: '2026-08',
      supplierOrderNo: '',
      systemOrderNo: '',
      merchantQueryKey: '',

      // 三方支付渠道配置
      paymentGateways: [
        { id: 'alipay', name: '支付宝 (Alipay)', icon: '🟦', fee: '0.6%', status: true, dailyLimit: '￥500,000' },
        { id: 'wechat', name: '微信支付 (WeChat Pay)', icon: '🟩', fee: '0.6%', status: true, dailyLimit: '￥500,000' },
        { id: 'linepay', name: 'LINE Pay', icon: '🟢', fee: '2.2%', status: true, dailyLimit: 'NT$ 300,000' },
        { id: 'ecpay', name: '绿界 ECPay (信用卡/超商)', icon: '🟧', fee: '2.85%', status: true, dailyLimit: 'NT$ 1,000,000' },
        { id: 'stripe', name: 'Stripe (国际信用卡)', icon: '💜', fee: '3.4% + $0.30', status: false, dailyLimit: '$ 50,000' }
      ],

      // 实时交易流水
      transactions: [
        { id: 'TX-20260812-9901', channel: '微信支付', channelIcon: '🟩', orderId: 'ORD-882101', amount: '￥299.00', fee: '￥1.79', user: '张三', status: '交易成功', date: '2026-08-12 16:22:05' },
        { id: 'TX-20260812-9902', channel: '支付宝', channelIcon: '🟦', orderId: 'ORD-882102', amount: '￥1,280.00', fee: '￥7.68', user: '李四', status: '交易成功', date: '2026-08-12 16:15:30' },
        { id: 'TX-20260812-9903', channel: 'LINE Pay', channelIcon: '🟢', orderId: 'ORD-882103', amount: 'NT$ 2,500', fee: 'NT$ 55', user: '陈小明', status: '交易成功', date: '2026-08-12 15:40:12' }
      ],

      // 供应商订单（供应商单号与系统单号不同）
      supplierOrders: [
        { suppOrderNo: 'SUP-COL-88091', sysOrderNo: 'BC-IN-2026081201', suppName: '极速支付通道A', amount: '￥5,000.00', status: '成功', matchType: '精准成功', date: '2026-08-12' },
        { suppOrderNo: 'SUP-PAY-77102', sysOrderNo: 'BC-OUT-2026081202', suppName: '顺达代付网关', amount: '￥12,300.00', status: '处理中', matchType: '精准确认为是', date: '2026-08-12' }
      ],

      // 代收订单数据
      collectOrders: [
        { sysOrderNo: 'BC-IN-2026081201', suppOrderNo: 'SUP-COL-88091', merchant: '闪电电商', amount: '￥5,000.00', fee: '￥30.00', status: '已代收成功', date: '2026-08-12 15:30' },
        { sysOrderNo: 'BC-IN-2026081202', suppOrderNo: 'SUP-COL-88095', merchant: '海淘优选', amount: '￥1,200.00', fee: '￥7.20', status: '等待支付', date: '2026-08-12 16:05' }
      ],

      // 代付订单数据
      payoutOrders: [
        { sysOrderNo: 'BC-OUT-2026081202', suppOrderNo: 'SUP-PAY-77102', merchant: '闪电电商', amount: '￥12,300.00', fee: '￥15.00', status: '代付处理中', date: '2026-08-12 15:45' },
        { sysOrderNo: 'BC-OUT-2026081109', suppOrderNo: 'SUP-PAY-76011', merchant: '星光娱乐', amount: '￥8,000.00', fee: '￥10.00', status: '代付成功', date: '2026-08-11 11:20' }
      ],

      // 商户列表
      merchants: [
        { id: 'MCH-1001', name: '闪电电商', appKey: 'bc_live_99812a', status: '正常', rate: '0.6%', balance: '￥158,200.00' },
        { id: 'MCH-1002', name: '海淘优选', appKey: 'bc_live_33419b', status: '正常', rate: '0.8%', balance: '￥42,100.00' }
      ],

      // 商户下发申请
      payoutRequests: [
        { id: 'WD-2026081201', merchant: '闪电电商', amount: '￥50,000.00', bank: '招商银行 (尾号 8812)', status: '待审核', time: '2026-08-12 16:00' },
        { id: 'WD-2026081105', merchant: '海淘优选', amount: '￥20,000.00', bank: '建设银行 (尾号 4102)', status: '已下发', time: '2026-08-11 14:30' }
      ]
    }
  },
  methods: {
    handleSelectMenu(key) {
      this.activeMenu = key
    },
    toggleGateway(gateway) {
      gateway.status = !gateway.status
    }
  },
  render() {
    // 通用搜索头部组件
    const renderFilterHeader = (isSupplier = false) => h('div', { style: 'background: #f8f9fa; padding: 16px; border-radius: 6px; margin-bottom: 20px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;' }, [
      h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '日期按日:'),
        h('input', { type: 'date', value: this.queryDate, onInput: e => this.queryDate = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]),
      h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '月份查询:'),
        h('input', { type: 'month', value: this.queryMonth, onInput: e => this.queryMonth = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]),
      isSupplier ? h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, '供应商订单号:'),
        h('input', { placeholder: '输入供应商单号...', value: this.supplierOrderNo, onInput: e => this.supplierOrderNo = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]) : null,
      h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('label', { style: 'font-size: 13px; font-weight: bold; color: #606266;' }, 'BC pay代收付单号:'),
        h('input', { placeholder: '输入系统订单号...', value: this.systemOrderNo, onInput: e => this.systemOrderNo = e.target.value, style: 'padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px;' })
      ]),
      h('button', { style: 'background: #409eff; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer;' }, '🔍 立即查询')
    ])

    // 1. 支付数据大屏
    const renderPaymentOverview = () => h('div', [
      h('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;' }, [
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日总代收金额'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #303133; margin: 8px 0;' }, '￥328,520.00'),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '↑ 成功率 99.1%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日总代付金额'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #e6a23c; margin: 8px 0;' }, '￥142,100.00'),
          h('div', { style: 'color: #409eff; font-size: 12px;' }, '代付完成率 98.5%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '活跃商户数'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #409eff; margin: 8px 0;' }, '18 家'),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '系统审核全通过')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '待处理下发'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #f56c6c; margin: 8px 0;' }, '1 笔'),
          h('div', { style: 'color: #909399; font-size: 12px;' }, '需财务手动确认')
        ])
      ]),
      h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
        h('h3', { style: 'margin-top: 0;' }, 'BC pay 聚合流水记录'),
        renderTransactionTable()
      ])
    ])

    // 2. 供应商模块
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
            h('th', { style: 'padding: 12px;' }, '供应商订单号 (原厂)'),
            h('th', { style: 'padding: 12px;' }, 'BC pay 后台订单号'),
            h('th', { style: 'padding: 12px;' }, '金额'),
            h('th', { style: 'padding: 12px;' }, '状态描述'),
            h('th', { style: 'padding: 12px;' }, '精准匹配模式'),
            h('th', { style: 'padding: 12px;' }, '日期')
          ])
        ]),
        h('tbody', {}, this.supplierOrders.map(item => 
          h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
            h('td', { style: 'padding: 12px;' }, item.suppName),
            h('td', { style: 'padding: 12px; font-family: monospace; color: #e6a23c;' }, item.suppOrderNo),
            h('td', { style: 'padding: 12px; font-family: monospace; color: #409eff;' }, item.sysOrderNo),
            h('td', { style: 'padding: 12px; font-weight: bold;' }, item.amount),
            h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #f0f9eb; color: #67c23a; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.status)),
            h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #e8f4ff; color: #1890ff; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.matchType)),
            h('td', { style: 'padding: 12px; color: #909399;' }, item.date)
          ])
        ))
      ])
    ])

    // 3. 代收订单模块
    const renderCollectOrders = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '📥 代收订单管理'),
      renderFilterHeader(false),
      h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
            h('th', { style: 'padding: 12px;' }, 'BC pay 代收订单号'),
            h('th', { style: 'padding: 12px;' }, '关联供应商订单号'),
            h('th', { style: 'padding: 12px;' }, '商户名称'),
            h('th', { style: 'padding: 12px;' }, '代收金额'),
            h('th', { style: 'padding: 12px;' }, '手续费'),
            h('th', { style: 'padding: 12px;' }, '状态'),
            h('th', { style: 'padding: 12px;' }, '时间')
          ])
        ]),
        h('tbody', {}, this.collectOrders.map(item => 
          h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
            h('td', { style: 'padding: 12px; font-family: monospace; color: #409eff;' }, item.sysOrderNo),
            h('td', { style: 'padding: 12px; font-family: monospace; color: #909399;' }, item.suppOrderNo),
            h('td', { style: 'padding: 12px;' }, item.merchant),
            h('td', { style: 'padding: 12px; font-weight: bold; color: #67c23a;' }, item.amount),
            h('td', { style: 'padding: 12px; color: #f56c6c;' }, item.fee),
            h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #f0f9eb; color: #67c23a; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.status)),
            h('td', { style: 'padding: 12px; color: #909399;' }, item.date)
          ])
        ))
      ])
    ])

    // 4. 代付订单模块
    const renderPayoutOrders = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '📤 代付订单管理'),
      renderFilterHeader(false),
      h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
            h('th', { style: 'padding: 12px;' }, 'BC pay 代付订单号'),
            h('th', { style: 'padding: 12px;' }, '关联供应商订单号'),
            h('th', { style: 'padding: 12px;' }, '申请商户'),
            h('th', { style: 'padding: 12px;' }, '代付金额'),
            h('th', { style: 'padding: 12px;' }, '代付手续费'),
            h('th', { style: 'padding: 12px;' }, '代付状态'),
            h('th', { style: 'padding: 12px;' }, '时间')
          ])
        ]),
        h('tbody', {}, this.payoutOrders.map(item => 
          h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
            h('td', { style: 'padding: 12px; font-family: monospace; color: #409eff;' }, item.sysOrderNo),
            h('td', { style: 'padding: 12px; font-family: monospace; color: #909399;' }, item.suppOrderNo),
            h('td', { style: 'padding: 12px;' }, item.merchant),
            h('td', { style: 'padding: 12px; font-weight: bold; color: #e6a23c;' }, item.amount),
            h('td', { style: 'padding: 12px; color: #f56c6c;' }, item.fee),
            h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #fdf6ec; color: #e6a23c; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.status)),
            h('td', { style: 'padding: 12px; color: #909399;' }, item.date)
          ])
        ))
      ])
    ])

    // 5. 商户开户设置
    const renderMerchantSettings = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '🏢 商户开户设置中心'),
      h('div', { style: 'display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #e4e7ed; padding-bottom: 10px;' }, [
        h('button', { onClick: () => this.merchantTab = 'query', style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; ${this.merchantTab === 'query' ? 'background: #409eff; color: white;' : 'background: #f4f4f5; color: #606266;'}` }, '🔍 商户查询页面'),
        h('button', { onClick: () => this.merchantTab = 'config', style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; ${this.merchantTab === 'config' ? 'background: #67c23a; color: white;' : 'background: #f4f4f5; color: #606266;'}` }, '⚙️ 商户开户配置页面')
      ]),
      this.merchantTab === 'query' ? h('div', [
        h('div', { style: 'margin-bottom: 16px; display: flex; gap: 12px;' }, [
          h('input', { placeholder: '输入商户名称 / 商户号...', style: 'padding: 8px; width: 300px; border: 1px solid #dcdfe6; border-radius: 4px;' }),
          h('button', { style: 'background: #409eff; color: white; border: none; padding: 8px 16px; border-radius: 4px;' }, '查询商户')
        ]),
        h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
          h('thead', {}, [
            h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
              h('th', { style: 'padding: 12px;' }, '商户编号'),
              h('th', { style: 'padding: 12px;' }, '商户名称'),
              h('th', { style: 'padding: 12px;' }, 'AppKey'),
              h('th', { style: 'padding: 12px;' }, '签约费率'),
              h('th', { style: 'padding: 12px;' }, '账户余额'),
              h('th', { style: 'padding: 12px;' }, '状态')
            ])
          ]),
          h('tbody', {}, this.merchants.map(m => 
            h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
              h('td', { style: 'padding: 12px;' }, m.id),
              h('td', { style: 'padding: 12px; font-weight: bold;' }, m.name),
              h('td', { style: 'padding: 12px; font-family: monospace;' }, m.appKey),
              h('td', { style: 'padding: 12px;' }, m.rate),
              h('td', { style: 'padding: 12px; color: #67c23a; font-weight: bold;' }, m.balance),
              h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #f0f9eb; color: #67c23a; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, m.status))
            ])
          ))
        ])
      ]) : h('div', { style: 'max-width: 600px;' }, [
        h('h4', {}, '开辟新商户账户'),
        h('div', { style: 'display: grid; gap: 12px;' }, [
          h('div', {}, [h('label', { style: 'display: block; font-size: 13px; margin-bottom: 4px;' }, '商户全称:'), h('input', { placeholder: '例如: 某某科技公司', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })]),
          h('div', {}, [h('label', { style: 'display: block; font-size: 13px; margin-bottom: 4px;' }, '初始代收费率 (%):'), h('input', { value: '0.6', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })]),
          h('div', {}, [h('label', { style: 'display: block; font-size: 13px; margin-bottom: 4px;' }, '初始代付费率 (定额/笔):'), h('input', { value: '2.00', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })]),
          h('button', { style: 'background: #67c23a; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 10px;' }, '提交开户配置')
        ])
      ])
    ])

    // 6. 商户下发
    const renderMerchantPayout = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '💸 商户下发审核与打款'),
      h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
            h('th', { style: 'padding: 12px;' }, '下发单号'),
            h('th', { style: 'padding: 12px;' }, '申请商户'),
            h('th', { style: 'padding: 12px;' }, '提现金额'),
            h('th', { style: 'padding: 12px;' }, '收款银行卡'),
            h('th', { style: 'padding: 12px;' }, '状态'),
            h('th', { style: 'padding: 12px;' }, '申请时间'),
            h('th', { style: 'padding: 12px;' }, '操作')
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
            h('td', { style: 'padding: 12px;' }, p.status === '待审核' ? h('button', { style: 'background: #409eff; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer;' }, '同意下发') : '已完成')
          ])
        ))
      ])
    ])

    // 7. 报表结算
    const renderReportSettlement = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '📊 报表结算中心'),
      renderFilterHeader(false),
      h('div', { style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;' }, [
        h('div', { style: 'border: 1px solid #e4e7ed; padding: 20px; border-radius: 8px; text-align: center;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '本月结算总代收'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #303133; margin: 10px 0;' }, '￥4,850,200.00'),
          h('button', { style: 'background: #67c23a; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer;' }, '导出代收报表 Excel')
        ]),
        h('div', { style: 'border: 1px solid #e4e7ed; padding: 20px; border-radius: 8px; text-align: center;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '本月结算总代付'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #e6a23c; margin: 10px 0;' }, '￥2,120,000.00'),
          h('button', { style: 'background: #e6a23c; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer;' }, '导出代付报表 Excel')
        ]),
        h('div', { style: 'border: 1px solid #e4e7ed; padding: 20px; border-radius: 8px; text-align: center;' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '系统平台净润'),
          h('div', { style: 'font-size: 24px; font-weight: bold; color: #f56c6c; margin: 10px 0;' }, '￥28,401.20'),
          h('button', { style: 'background: #409eff; color: white; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer;' }, '生成财务对账单')
        ])
      ])
    ])

    // 三方网关配置页面
    const renderGatewaysConfig = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0; margin-bottom: 20px;' }, '第三方支付网关配置与开关'),
      h('div', { style: 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;' }, this.paymentGateways.map(gw => 
        h('div', { style: 'border: 1px solid #e4e7ed; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;' }, [
          h('div', [
            h('div', { style: 'font-size: 18px; font-weight: bold; margin-bottom: 6px;' }, `${gw.icon} ${gw.name}`),
            h('div', { style: 'font-size: 13px; color: #606266; margin-bottom: 4px;' }, `结算手续费率: ${gw.fee}`),
            h('div', { style: 'font-size: 13px; color: #909399;' }, `单日收款限额: ${gw.dailyLimit}`)
          ]),
          h('button', { 
            onClick: () => this.toggleGateway(gw), 
            style: `padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; color: white; background: ${gw.status ? '#67c23a' : '#909399'};` 
          }, gw.status ? '已开启 (运行中)' : '已关闭')
        ])
      ))
    ])

    // 流水表格
    const renderTransactionTable = () => h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
      h('thead', {}, [
        h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
          h('th', { style: 'padding: 12px;' }, '三方交易流水号'),
          h('th', { style: 'padding: 12px;' }, '支付渠道'),
          h('th', { style: 'padding: 12px;' }, '关联订单'),
          h('th', { style: 'padding: 12px;' }, '交易金额'),
          h('th', { style: 'padding: 12px;' }, '状态')
        ])
      ]),
      h('tbody', {}, this.transactions.map(item => 
        h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
          h('td', { style: 'padding: 12px; font-family: monospace;' }, item.id),
          h('td', { style: 'padding: 12px;' }, `${item.channelIcon} ${item.channel}`),
          h('td', { style: 'padding: 12px; color: #409eff;' }, item.orderId),
          h('td', { style: 'padding: 12px; font-weight: bold;' }, item.amount),
          h('td', { style: 'padding: 12px;' }, h('span', { style: 'background: #f0f9eb; color: #67c23a; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.status))
        ])
      ))
    ])

    // 主架构渲染
    return h('div', { style: 'display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f0f2f5;' }, [
      // 左侧侧边栏
      h('div', { style: 'width: 250px; background: #001529; color: #fff; display: flex; flex-direction: column;' }, [
        h('div', { style: 'padding: 20px 16px; font-size: 20px; font-weight: bold; color: #409EFF; border-bottom: 1px solid #1f2d3d;' }, '💳 BC pay 管理后台'),
        h('div', { style: 'flex: 1; padding: 12px 0; overflow-y: auto;' }, [
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
        // 顶部 Header
        h('div', { style: 'height: 60px; background: #fff; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08);' }, [
          h('div', { style: 'font-weight: bold; font-size: 16px; color: #303133;' }, 'BC pay 运营管理系统'),
          h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, [
            h('span', { style: 'background: #67c23a; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px;' }, 'BC pay v2.0.0'),
            h('a', { href: 'https://render.com', target: '_blank', style: 'color: #909399; font-size: 14px; text-decoration: none;' }, '托管于 Render')
          ])
        ]),

        // 内容区
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
