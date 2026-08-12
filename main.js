import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const App = {
  template: `
    <div style="padding: 40px; font-family: sans-serif; background-color: #f5f7fa; min-height: 100vh;">
      <el-card shadow="always">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; color: #409EFF;">🛒 电子商务管理系统后台</h2>
            <el-tag type="success">系统运行正常 (v1.0.0)</el-tag>
          </div>
        </template>
        
        <el-row :gutter="20" style="margin-bottom: 20px;">
          <el-col :span="8">
            <el-statistic title="今日总销售额" :value="128450">
              <template #suffix>元</template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="今日订单量" :value="1240">
              <template #suffix>单</template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="新增用户" :value="358">
              <template #suffix>人</template>
            </el-statistic>
          </el-col>
        </el-row>

        <el-alert
          title="恭喜！你的云端电商后台网站已成功架设并上线！"
          type="success"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column prop="date" label="订单日期" width="180" />
          <el-table-column prop="name" label="客户姓名" width="180" />
          <el-table-column prop="amount" label="金额" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag type="success">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  `,
  data() {
    return {
      tableData: [
        { date: '2026-08-12', name: '张三', amount: '￥299.00', status: '已支付' },
        { date: '2026-08-12', name: '李四', amount: '￥1,280.00', status: '已发货' },
        { date: '2026-08-11', name: '王五', amount: '￥56.00', status: '已完成' }
      ]
    }
  }
}

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
