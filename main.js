import { createApp, h } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  data() {
    return {
      activeMenu: 'dashboard',
      searchQuery: '',
      // 商品数据
      products: [
        { id: 101, name: '无线蓝牙耳机', category: '数码 3C', price: '￥299.00', stock: 120, status: '上架中' },
        { id: 102, name: '智能运动手表', category: '数码 3C', price: '￥899.00', stock: 45, status: '上架中' },
        { id: 103, name: '人体工学办公椅', category: '家居家具', price: '￥650.00', stock: 12, status: '缺货警告' },
        { id: 104, name: '机械键盘 (RGB版)', category: '外设配件', price: '￥399.00', stock: 88, status: '上架中' }
      ],
      // 订单数据
      orders: [
        { id: 'ORD-20260812-01', user: '张三', amount: '￥299.00', payType: '微信支付', status: '已支付', date: '2026-08-12 14:20' },
        { id: 'ORD-20260812-02', user: '李四', amount: '￥1,798.00', payType: '支付宝', status: '已发货', date: '2026-08-12 15:05' },
        { id: 'ORD-20260811-03', user: '王五', amount: '￥650.00', payType: '信用卡', status: '已完成', date: '2026-08-11 09:12' }
      ]
    }
  },
  methods: {
    handleSelectMenu(key) {
      this.activeMenu = key
    },
    statusType(status) {
      if (status === '已完成' || status === '上架中') return 'success'
      if (status === '已发货' || status === '已支付') return 'primary'
      if (status === '缺货警告') return 'warning'
      return 'info'
    }
  },
  render() {
    // 渲染仪表盘
    const renderDashboard = () => h('div', [
      h('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;' }, [
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日总销售额'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #303133; margin: 8px 0;' }, '￥128,450'),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '↑ 较昨日增长 12.5%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '今日订单数'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #303133; margin: 8px 0;' }, '1,240 单'),
          h('div', { style: 'color: #67c23a; font-size: 12px;' }, '↑ 较昨日增长 8.2%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '新增注册用户'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #303133; margin: 8px 0;' }, '358 人'),
          h('div', { style: 'color: #f56c6c; font-size: 12px;' }, '↓ 较昨日微降 1.5%')
        ]),
        h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
          h('div', { style: 'color: #909399; font-size: 14px;' }, '待处理发货'),
          h('div', { style: 'font-size: 26px; font-weight: bold; color: #e6a23c; margin: 8px 0;' }, '42 单'),
          h('div', { style: 'color: #909399; font-size: 12px;' }, '需尽快联系物流处理')
        ])
      ]),
      h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);' }, [
        h('h3', { style: 'margin-top: 0; color: #303133;' }, '实时订单动态'),
        renderOrdersTable()
      ])
    ])

    // 渲染商品管理列表
    const renderProducts = () => h('div', { style: 'background: #fff; padding: 20px; border-radius: 8px;' }, [
      h('div', { style: 'display: flex; justify-content: space-between; margin-bottom: 20px;' }, [
        h('h3', { style: 'margin: 0;' }, '在售商品列表'),
        h('button', { style: 'background: #409eff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;' }, '+ 发布新商品')
      ]),
      h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
        h('thead', {}, [
          h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
            h('th', { style: 'padding: 12px;' }, '商品编号'),
            h('th', { style: 'padding: 12px;' }, '商品名称'),
            h('th', { style: 'padding: 12px;' }, '分类'),
            h('th', { style: 'padding: 12px;' }, '价格'),
            h('th', { style: 'padding: 12px;' }, '库存'),
            h('th', { style: 'padding: 12px;' }, '状态')
          ])
        ]),
        h('tbody', {}, this.products.map(item => 
          h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
            h('td', { style: 'padding: 12px;' }, item.id),
            h('td', { style: 'padding: 12px; font-weight: bold;' }, item.name),
            h('td', { style: 'padding: 12px;' }, item.category),
            h('td', { style: 'padding: 12px; color: #f56c6c;' }, item.price),
            h('td', { style: 'padding: 12px;' }, item.stock),
            h('td', { style: 'padding: 12px;' }, 
              h('span', { style: `padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${item.status === '缺货警告' ? '#fef0f0' : '#f0f9eb'}; color: ${item.status === '缺货警告' ? '#f56c6c' : '#67c23a'};` }, item.status)
            )
          ])
        ))
      ])
    ])

    // 渲染订单管理表格
    const renderOrdersTable = () => h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
      h('thead', {}, [
        h('tr', { style: 'background: #f5f7fa; border-bottom: 2px solid #e4e7ed;' }, [
          h('th', { style: 'padding: 12px;' }, '订单编号'),
          h('th', { style: 'padding: 12px;' }, '买家'),
          h('th', { style: 'padding: 12px;' }, '订单金额'),
          h('th', { style: 'padding: 12px;' }, '支付方式'),
          h('th', { style: 'padding: 12px;' }, '订单状态'),
          h('th', { style: 'padding: 12px;' }, '下单时间')
        ])
      ]),
      h('tbody', {}, this.orders.map(item => 
        h('tr', { style: 'border-bottom: 1px solid #ebedf0;' }, [
          h('td', { style: 'padding: 12px; font-family: monospace;' }, item.id),
          h('td', { style: 'padding: 12px;' }, item.user),
          h('td', { style: 'padding: 12px; font-weight: bold;' }, item.amount),
          h('td', { style: 'padding: 12px;' }, item.payType),
          h('td', { style: 'padding: 12px;' }, 
            h('span', { style: 'background: #e8f4ff; color: #1890ff; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.status)
          ),
          h('td', { style: 'padding: 12px; color: #909399;' }, item.date)
        ])
      ))
    ])

    // 渲染系统设置
    const renderSettings = () => h('div', { style: 'background: #fff; padding: 24px; border-radius: 8px;' }, [
      h('h3', { style: 'margin-top: 0;' }, '系统基础配置'),
      h('div', { style: 'display: grid; gap: 16px; max-width: 500px;' }, [
        h('div', {}, [
          h('label', { style: 'display: block; margin-bottom: 6px; font-size: 14px; color: #606266;' }, '商城名称'),
          h('input', { value: '我的云端电商商城', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
        ]),
        h('div', {}, [
          h('label', { style: 'display: block; margin-bottom: 6px; font-size: 14px; color: #606266;' }, '客服联系邮箱'),
          h('input', { value: 'support@example.com', style: 'width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;' })
        ]),
        h('div', {}, [
          h('label', { style: 'display: block; margin-bottom: 6px; font-size: 14px; color: #606266;' }, '系统通知设置'),
          h('p', { style: 'font-size: 13px; color: #909399;' }, '新订单提醒已开启 (WebSocket 实时监听)')
        ])
      ])
    ])

    // 主页面整体结构
    return h('div', { style: 'display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f0f2f5;' }, [
      // 侧边栏
      h('div', { style: 'width: 220px; background: #001529; color: #fff; display: flex; flex-direction: column;' }, [
        h('div', { style: 'padding: 20px 16px; font-size: 18px; font-weight: bold; color: #409EFF; border-bottom: 1px solid #1f2d3d;' }, '🛒 电商后台系统'),
        h('div', { style: 'flex: 1; padding: 12px 0;' }, [
          h('div', { onClick: () => this.handleSelectMenu('dashboard'), style: `padding: 12px 24px; cursor: pointer; color: ${this.activeMenu === 'dashboard' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'dashboard' ? '#1890ff22' : 'transparent'}; border-left: ${this.activeMenu === 'dashboard' ? '4px solid #409EFF' : 'none'};` }, '📊 数据仪表盘'),
          h('div', { onClick: () => this.handleSelectMenu('products'), style: `padding: 12px 24px; cursor: pointer; color: ${this.activeMenu === 'products' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'products' ? '#1890ff22' : 'transparent'}; border-left: ${this.activeMenu === 'products' ? '4px solid #409EFF' : 'none'};` }, '📦 商品管理'),
          h('div', { onClick: () => this.handleSelectMenu('orders'), style: `padding: 12px 24px; cursor: pointer; color: ${this.activeMenu === 'orders' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'orders' ? '#1890ff22' : 'transparent'}; border-left: ${this.activeMenu === 'orders' ? '4px solid #409EFF' : 'none'};` }, '📑 订单列表'),
          h('div', { onClick: () => this.handleSelectMenu('settings'), style: `padding: 12px 24px; cursor: pointer; color: ${this.activeMenu === 'settings' ? '#409EFF' : '#a6adb4'}; background: ${this.activeMenu === 'settings' ? '#1890ff22' : 'transparent'}; border-left: ${this.activeMenu === 'settings' ? '4px solid #409EFF' : 'none'};` }, '⚙️ 系统设置')
        ])
      ]),

      // 右侧主内容区
      h('div', { style: 'flex: 1; display: flex; flex-direction: column;' }, [
        // 顶部 Header
        h('div', { style: 'height: 60px; background: #fff; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08);' }, [
          h('div', { style: 'font-weight: 500; color: #303133;' }, '欢迎回来，超级管理员 Admin'),
          h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, [
            h('span', { style: 'background: #67c23a; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 12px;' }, '云端已联机 v1.1.0'),
            h('a', { href: 'https://render.com', target: '_blank', style: 'color: #909399; font-size: 14px; text-decoration: none;' }, '托管于 Render')
          ])
        ]),

        // 内容区
        h('div', { style: 'padding: 24px; flex: 1;' }, [
          this.activeMenu === 'dashboard' ? renderDashboard() : null,
          this.activeMenu === 'products' ? renderProducts() : null,
          this.activeMenu === 'orders' ? renderOrdersTable() : null,
          this.activeMenu === 'settings' ? renderSettings() : null
        ])
      ])
    ])
  }
})

app.use(ElementPlus)
app.mount('#app')
