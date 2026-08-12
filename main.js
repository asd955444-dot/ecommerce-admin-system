import { createApp, h } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  data() {
    return {
      activeMenu: 'payment_overview',
      // 三方支付渠道配置
      paymentGateways: [
        { id: 'alipay', name: '支付宝 (Alipay)', icon: '🟦', fee: '0.6%', status: true, dailyLimit: '￥500,000' },
        { id: 'wechat', name: '微信支付 (WeChat Pay)', icon: '🟩', fee: '0.6%', status: true, dailyLimit: '￥500,000' },
        { id: 'linepay', name: 'LINE Pay', icon: '🟢', fee: '2.2%', status: true, dailyLimit: 'NT$ 300,000' },
        { id: 'ecpay', name: '绿界 ECPay (信用卡/超商)', icon: '🟧', fee: '2.85%', status: true, dailyLimit: 'NT$ 1,000,000' },
        { id: 'stripe', name: 'Stripe (国际信用卡)', icon: '💜', fee: '3.4% + $0.30', status: false, dailyLimit: '$ 50,000' }
      ],
      // 聚合支付实时交易流水
      transactions: [
        { id: 'TX-20260812-9901', channel: '微信支付', channelIcon: '🟩', orderId: 'ORD-882101', amount: '￥299.00', fee: '￥1.79', user: '张三', status: '交易成功', date: '2026-08-12 16:22:05' },
        { id: 'TX-20260812-9902', channel: '支付宝', channelIcon: '🟦', orderId: 'ORD-882102', amount: '￥1,280.00', fee: '￥7.68', user: '李四', status: '交易成功', date: '2026-08-12 16:15:30' },
        { id: 'TX-20260812-9903', channel: 'LINE Pay', channelIcon: '🟢', orderId: 'ORD-882103', amount: 'NT$ 2,500', fee: 'NT$ 55', user: '陈小明', status: '交易成功', date: '2026-08-12 15:40:12' },
        { id: 'TX-20260812-9904', channel: '绿界 ECPay', channelIcon: '🟧', orderId: 'ORD-882104', amount: 'NT$ 890', fee: 'NT$ 25', user: '林婷婷', status: '已退款', date: '2026-08-12 14:10:00' },
        { id: 'TX-20260812-9905', channel: 'Stripe', channelIcon: '💜', orderId: 'ORD-882105', amount: '$ 150.00', fee: '$ 5.40', user: 'John Doe', status: '支付失败', date: '2026-08-12 12:05:44' }
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
    // 1. 三方支付数据概览
    const renderPaymentOverview = () => h('div', [
      h('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;' }, [
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日三方支付流水'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #303133; margin: 8px 0;' }, '￥186,520.00'),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '↑ 成功率 99.2%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '预计三方扣除手续费'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #f56c6c; margin: 8px 0;' }, '￥1,119.12'),
          h('div', { style: 'color: #909399; font-size: 12px;' }, '综合平均费率 0.6%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '活跃支付通道'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #409eff; margin: 8px 0;' }, '4 / 5 个'),
          h('div', { style: 'color: #e6a23c; font-size: 12px;' }, 'Stripe 通道已停用')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日退款申请'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #e6a23c; margin: 8px 0;' }, '1 笔'),
          h('div', { style: 'color: #909399; font-size: 12px;' }, '原路退回处理中')
        ])
      ]),
      h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
        h('h3', { style: 'margin-top: 0; color: #303133;' }, '实时支付流水记录'),
        renderTransactionTable()
      ])
    ])

    // 2. 三方支付渠道管理
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

    // 3. 交易流水表格
    const renderTransactionTable = () => h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
      h('thead', {}, [
        h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
          h('th', { style: 'padding: 12px;' }, '三方交易流水号'),
          h('th', { style: 'padding: 12px;' }, '支付渠道'),
          h('th', { style: 'padding: 12px;' }, '关联订单'),
          h('th', { style: 'padding: 12px;' }, '交易金额'),
          h('th', { style: 'padding: 12px;' }, '预估手续费'),
          h('th', { style: 'padding: 12px;' }, '付款用户'),
          h('th', { style: 'padding: 12px;' }, '状态'),
          h('th', { style: 'padding: 12px;' }, '交易时间')
        ])
      ]),
      h('tbody', {}, this.transactions.map(item => 
        h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
          h('td', { style: 'padding: 12px; font-family: monospace; font-size: 12px;' }, item.id),
          h('td', { style: 'padding: 12px;' }, `${item.channelIcon} ${item.channel}`),
          h('td', { style: 'padding: 12px; color: #409eff;' }, item.orderId),
          h('td', { style: 'padding: 12px; font-weight: bold;' }, item.amount),
          h('td', { style: 'padding: 12px; color: #f56c6c; font-size: 13px;' }, item.fee),
          h('td', { style: 'padding: 12px;' }, item.user),
          h('td', { style: 'padding: 12px;' }, 
            h('span', { 
              style: `padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${
                item.status === '交易成功' ? '#f0f9eb' : item.status === '已退款' ? '#fdf6ec' : '#fef0f0'
              }; color: ${
                item.status === '交易成功' ? '#67c23a' : item.status === '已退款' ? '#e6a23c' : '#f56c6c'
              };` 
            }, item.status)
          ),
          h('td', { style: 'padding: 12px; color: #909399; font-size: 12px;' }, item.date)
        ])
      ))
    ])

    // 主页面整体结构
    return h('div', { style: 'display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f0f2f5;' }, [
      // 侧边栏
      h('div', { style: 'width: 230px; background: #001529; color: #fff; display: flex; flex-direction: column;' }, [
        h('div', { style: 'padding: 20px 16px; font-size: 17px; font-weight: bold; color: #409EFF; border-bottom: 1px solid #1f2d3d;' }, '💳 聚合支付后台管理'),
        h('div', { style: 'flex: 1; padding: 12px 0;' }, [
          h('div', { onClick: () => this.handleSelectMenu('payment_overview'), style: `padding: 12px 24px; cursor: pointer; color: ${this.activeMenu === 'payment_overview' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'payment_overview' ? '#1890ff22' : 'transparent'}; border-left: ${this.activeMenu === 'payment_overview' ? '4px solid #409EFF' : 'none'};` }, '📈 支付数据大屏'),
          h('div', { onClick: () => this.handleSelectMenu('gateways'), style: `padding: 12px 24px; cursor: pointer; color: ${this.activeMenu === 'gateways' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'gateways' ? '#1890ff22' : 'transparent'}; border-left: ${this.activeMenu === 'gateways' ? '4px solid #409EFF' : 'none'};` }, '⚙️ 三方通道配置'),
          h('div', { onClick: () => this.handleSelectMenu('transactions'), style: `padding: 12px 24px; cursor: pointer; color: ${this.activeMenu === 'transactions' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'transactions' ? '#1890ff22' : 'transparent'}; border-left: ${this.activeMenu === 'transactions' ? '4px solid #409EFF' : 'none'};` }, '📋 交易流水明细')
        ])
      ]),

      // 右侧主内容区
      h('div', { style: 'flex: 1; display: flex; flex-direction: column;' }, [
        // 顶部 Header
        h('div', { style: 'height: 60px; background: #fff; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08);' }, [
          h('div', { style: 'font-weight: 500; color: #303133;' }, '三方支付中心面板'),
          h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, [
            h('span', { style: 'background: #67c23a; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px;' }, '网关网安节点连通 v1.2.0'),
            h('a', { href: 'https://render.com', target: '_blank', style: 'color: #909399; font-size: 14px; text-decoration: none;' }, '托管于 Render')
          ])
        ]),

        // 内容区
        h('div', { style: 'padding: 24px; flex: 1;' }, [
          this.activeMenu === 'payment_overview' ? renderPaymentOverview() : null,
          this.activeMenu === 'gateways' ? renderGatewaysConfig() : null,
          this.activeMenu === 'transactions' ? renderTransactionTable() : null
        ])
      ])
    ])
  }
})

app.use(ElementPlus)
app.mount('#app')
