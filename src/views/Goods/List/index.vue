<template>
  <div>
        <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item> 
        </el-breadcrumb> -->
        <Breadcrumb name1="商品管理" name2="商品列表" />
         <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索和添加区域 -->
            <el-row :gutter="20">
               <el-col :span="8">
                   <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getGoodsList">
                      <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                   </el-input>
               </el-col>
               <el-col :span="4">
                    <el-button type="primary" @click="goAddGoods">添加商品</el-button>
               </el-col>
            </el-row>
             <!-- 商品列表 -->
             <el-table :data="goodsList" style="width: 100%" border stripe>
                <el-table-column type="index"></el-table-column> 
                <el-table-column
                    prop="goods_name"
                    label="商品名称">
                </el-table-column>
                <el-table-column
                    prop="goods_price"
                    label="商品价格(元)"
                    width="120">
                </el-table-column>
                <el-table-column
                    prop="goods_weight"
                    label="商品重量" width="100">
                </el-table-column>
                <el-table-column
                    prop="add_time"
                    label="创建时间" width="180">
                    <template slot-scope="scope">
                       {{ scope.row.add_time | dataFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                     <template slot-scope="scope">
                        <el-tooltip  effect="dark" content="编辑商品" placement="top">
                           <el-button size="mini" type="primary" icon="el-icon-edit" @click="editGoods(scope.row.goods_id)"></el-button>
                        </el-tooltip>
                        <el-tooltip  effect="dark" content="删除商品" placement="top">
                           <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeGoodsById(scope.row.goods_id)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
             <!-- 分页区域 -->
             <el-pagination
                @size-change="handleSizeChange" background
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>
  </div>
</template>

<script>
import Breadcrumb from '@/components/content/breadcrumb/Breadcrumb'
export default {
  name: 'list',
  components: {
      Breadcrumb
  },
  data(){
     return{
        queryInfo:{
           query:'',
           pagenum:1,
           pagesize:4,
        },   // 获取商品列表接口的参数
        goodsList:[],  // 商品列表数据
        total:0,
        editDialogVisible:false,
        editRolesForm:{},
     }
  },
  methods:{
    // 编辑商品
    editGoods(id){
       this.$router.push({name:'goodsAdd',query:{id:id}}) 
    },  
    // 添加商品
    goAddGoods(){
       this.$router.push('/goods/add')
    },  
    async getGoodsList(){
      const {data:res} = await this.$http.get('/goods', {
           params: this.queryInfo
      })
      if(res.meta.status !== 200){ return this.$message.error('获取商品列表失败')}
      this.$message.success(res.meta.msg)
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    // 根据商品id删除商品
    async removeGoodsById(id){
        // 弹框提示
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=> err)
            //点击确定返回 confirm   取消 返回 cancel
            if(confirmResult !== 'confirm'){
                return this.$message.info('已取消删除')
            }else{
                const {data:res} = await this.$http.delete(`/goods/${id}`)
                if(res.meta.status !== 200){ this.$message.error('删除单个商品失败')}
                this.$message.success('删除单个商品成功')
                this.getGoodsList()
            }
       },
  },
  created(){
     this.getGoodsList()
  }
}
</script>

<style lang="less" scoped>

.el-table{margin-top:15px;}


</style>
