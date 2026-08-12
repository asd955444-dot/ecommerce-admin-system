import { createApp, h } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp({
  data() {
    return {
      tableData: [
        { date: '2026-08-12', name: '张三', amount: '￥299.00', status: '已支付' },
        { date: '2026-08-12', name: '李四', amount: '￥1,280.00', status: '已发货' },
        { date: '2026-08-11', name: '王五', amount: '￥56.00', status: '已完成' }
      ]
    }
  },
  render() {
    return h('div', { style: 'padding: 30px; font-family: Arial, sans-serif; background-color: #f5f7fa; min-height: 100vh;' }, [
      h('div', { style: 'background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);' }, [
        h('div', { style: 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 16px; margin-bottom: 20px;' }, [
          h('h1', { style: 'margin: 0; color: #409EFF; font-size: 24px;' }, '🛒 电子商务管理系统后台'),
          h('span', { style: 'background: #f0f9eb; color: #67c23a; padding: 6px 12px; border-radius: 4px; font-weight: bold; border: 1px solid #e1f3d8;' }, '● 系统运行正常 (v1.0.0)')
        ]),
        
        h('div', { style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;' }, [
          h('div', { style: 'background: #f8f9fa; padding: 16px; border-radius: 6px; border: 1px solid #eaecf0;' }, [
            h('div', { style: 'color: #666; font-size: 14px;' }, '今日总销售额'),
            h('div', { style: 'font-size: 28px; font-weight: bold; color: #303133; margin-top: 8px;' }, '￥128,450')
          ]),
          h('div', { style: 'background: #f8f9fa; padding: 16px; border-radius: 6px; border: 1px solid #eaecf0;' }, [
            h('div', { style: 'color: #666; font-size: 14px;' }, '今日订单量'),
            h('div', { style: 'font-size: 28px; font-weight: bold; color: #303133; margin-top: 8px;' }, '1,240 单')
          ]),
          h('div', { style: 'background: #f8f9fa; padding: 16px; border-radius: 6px; border: 1px solid #eaecf0;' }, [
            h('div', { style: 'color: #666; font-size: 14px;' }, '新增用户'),
            h('div', { style: 'font-size: 28px; font-weight: bold; color: #303133; margin-top: 8px;' }, '358 人')
          ])
        ]),

        h('div', { style: 'background: #f0f9eb; color: #67c23a; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; border: 1px solid #e1f3d8;' }, 
          '🎉 恭喜！你的云端电商后台网站已成功部署到 Render 上！'
        ),

        h('h3', { style: 'color: #303133; margin-bottom: 16px;' }, '最新订单明细'),
        h('table', { style: 'width: 100%; border-collapse: collapse; text-align: left;' }, [
          h('thead', {}, [
            h('tr', { style: 'background-color: #fafafa; border-bottom: 2px solid #e8e8e8;' }, [
              h('th', { style: 'padding: 12px;' }, '订单日期'),
              h('th', { style: 'padding: 12px;' }, '客户姓名'),
              h('th', { style: 'padding: 12px;' }, '金额'),
              h('th', { style: 'padding: 12px;' }, '状态')
            ])
          ]),
          h('tbody', {}, this.tableData.map(item => 
            h('tr', { style: 'border-bottom: 1px solid #f0f0f0;' }, [
              h('td', { style: 'padding: 12px;' }, item.date),
              h('td', { style: 'padding: 12px;' }, item.name),
              h('td', { style: 'padding: 12px;' }, item.amount),
              h('td', { style: 'padding: 12px;' }, 
                h('span', { style: 'background: #e8f4ff; color: #1890ff; padding: 4px 8px; border-radius: 4px; font-size: 12px;' }, item.status)
              )
            ])
          ))
        ])
      ])
    ])
  }
})

app.use(ElementPlus)
app.mount('#app')
