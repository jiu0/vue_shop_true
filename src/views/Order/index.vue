<template>
  <div>
       <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item> 
        </el-breadcrumb>
         <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索和添加区域 -->
            <el-row :gutter="20">
               <el-col :span="8">
                   <el-input placeholder="请输入内容"  v-model="queryInfo.query" clearable @clear="getOrderList">
                      <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                   </el-input>
               </el-col>
            </el-row> 
            <!-- 订单列表 -->
             <el-table :data="orderList" style="width: 100%" border stripe>
                <el-table-column type="index"></el-table-column> 
                <el-table-column
                    prop="order_number"
                    label="订单编号"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="order_price"
                    label="订单价格"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="pay_status" width="120"
                    label="是否付款">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_status=== '1' " type="success">已付款</el-tag>
                        <el-tag v-else type="danger">未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="is_send" width="120"
                    label="是否发货">
                </el-table-column>
                <el-table-column
                    prop="create_time"
                    label="下单时间">
                    <template slot-scope="scope">
                       {{ scope.row.create_time | dataFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                     <template>
                        <el-tooltip  effect="dark" content="编辑订单" placement="top">
                           <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog"></el-button>
                        </el-tooltip>
                        <el-tooltip  effect="dark" content="订单位置" placement="top">
                           <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
           </el-pagination>
        </el-card>
        <!-- 修改地址 -->
         <el-dialog
            title="修改地址" @close="addressDialogClosed"
            :visible.sync="adressVisible" 
            width="50%">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="120px">
                <el-form-item label="省市区/县" prop="address1">
                   <el-cascader clearable change-on-select width="100%"
                        v-model="addressForm.address1" expand-trigger="hover" 
                        :options="cityData" :props="cityProps"
                        ></el-cascader>  <!--   :props="{ expandTrigger: 'hover' }"  -->
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input  v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="adressVisible=false">取 消</el-button>
                <el-button type="primary" @click="addressSubmit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 物流进度 -->
         <el-dialog
            title="物流进度" @close="addressDialogClosed"
            :visible.sync="processVisible" 
            width="50%">
             <!-- 时间线 -->
             <el-timeline>
                <el-timeline-item
                    v-for="(activity, index) in processInfo"
                    :key="index"
                    :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata'
export default {
  name: 'order',
  data(){
      return{
         queryInfo:{
            query:'',
            pagenum:1,
            pagesize:6,
         }, 
         orderList:[],   // 订单数据列表
         total:0,  // 总条数
         adressVisible:false,
         addressForm:{
            address1:[],
            address2:'',
         },
          addressFormRules:{
            address1:[
                { required: true, message: '请选择省市区县', trigger: 'blur' },
            ],
            address2:[
                { required: true, message: '请填写详细地址', trigger: 'blur' },
            ],
         },  // 验证规则
         cityData,  // 省市区县数据
         cityProps:{
           label:'label',
           value:'value',
           children:'children',
        },
       processVisible:false,  // 物流进度显隐
       processInfo:[],  // 物流信息数据 
      }
  },
  created(){
     this.getOrderList()
  },
  methods:{
    // 显示物流进度条
    async showProgressBox(){
        const { data: res } = await this.$http.get('/kuaidi/1106975712662')
        if(res.meta.status !== 200){ this.$message.error('获取物流信息失败')}
        this.processInfo = res.data;
        this.processVisible = true;
    }, 
    // 关闭地址弹框  
    addressDialogClosed(){
        this.$refs.addressFormRef.resetFields()
        // this.addressForm.address1 = [];
        // this.addressForm.address2 = '';
    },  
    handleCurrentChange(newPage){
         this.queryInfo.pagenum = newPage;
         this.getOrderList()
    },  
    handleSizeChange(newSize){
         this.queryInfo.pagesize = newSize;
         this.getOrderList()
    },  
    async getOrderList(){
        const {data:res} =await this.$http.get('/orders',{
           params: this.queryInfo
        })
        if(res.meta.status !== 200 ) { return this.$message.error('获取订单列表失败')}
        this.$message.success('获取订单列表成功!')
        this.total = res.data.total;
        this.orderList = res.data.goods;
     },
     //修改地址
     showEditDialog(){
        this.adressVisible = true;
     },
     // 点击编辑弹框里的确认按钮
     addressSubmit(){
          this.$refs.addressFormRef.validate(async valid => {
            if(!valid)  return;
            this.adressVisible=false
         })
     }
  },
}
</script>

<style lang="less" scoped>
.el-table{margin-top:15px;}
.el-cascader{display:block;} 
.el-pagination{margin-top:15px;}

</style>