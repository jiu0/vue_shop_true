<template>
  <div id="cate">
       <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item> 
        </el-breadcrumb> -->
            <Breadcrumb name1="商品管理" name2="商品分类" />
            <!-- 添加分类 -->
            <el-card>
                <el-row style="margin-bottom:15px;">
                    <el-col>
                        <el-button type="primary" style="float:left;" @click="showAddCateDialog">添加分类</el-button>
                    </el-col>
                </el-row>
                <!-- 表格 -->
                <tree-table border :show-row-hover="false" show-index index-text="#" :expand-type="false" :selection-type="false" :data="catelist" :columns="columns">
                    <!-- 是否有效 -->
                    <template slot="isok" slot-scope="scope">
                       <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted===false"></i>
                       <i class="el-icon-error" style="color:red" v-else></i>
                    </template>
                    <!-- 排序 -->
                     <template slot="order" slot-scope="scope">
                       <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                       <el-tag size="mini" v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
                       <el-tag size="mini" v-else type="warning">三级</el-tag>
                    </template>
                    <!-- 操作 -->
                     <template slot="opt" slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showeditCateDialog(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCate(scope.row.cat_id)">删除</el-button>
                    </template>
                </tree-table>
                <!-- 分页 -->
                 <el-pagination
                    @size-change="cateSizeChange"
                    @current-change="cateCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[3, 5, 10, 20]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
                </el-pagination>
            </el-card>
            <!-- 添加分类弹框 -->
            <el-dialog
                title="添加分类" @close="addCateDialogClosed"
                :visible.sync="addCateDialogVisible"
                width="50%">
                <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="80px">
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="addCateForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类">
                      <!--  props 用来指定配置对象 -->
                       <el-cascader clearable change-on-select
                          v-model="selectedKeys"
                          :options="parentCateList" :props="cascaderProps"
                          @change="parentCateChanged"></el-cascader>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addCateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addCate">确 定</el-button>
                 </span>
            </el-dialog>
            <!-- 编辑分类信息 -->
            <el-dialog title="修改分类" :visible.sync="editCateDialogVisbel" width="50%">
            <el-form :model="editCate" :rules="editCateRules" ref="editCateRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="editCate.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisbel = false">取 消</el-button>
                <el-button type="primary" @click="editCateInfo">确 定</el-button>
            </span>
            </el-dialog>
  </div>
</template>
<script>
import Breadcrumb from '@/components/content/breadcrumb/Breadcrumb'
export default {
  name: 'cate',
  components: {
     Breadcrumb
  },
  data(){
     return{
         queryInfo:{
             type:3,
             pagenum:1,
             pagesize:5,
         },  // 获取商品分类传递的参数
         catelist:[],  // 商品分类的数据列表
         total:0,  // 总条数
         columns:[
            {
              label:'分类名称',
              prop:'cat_name'  
            },
            {
              label:'是否有效',
              type:'template',  // 当前列定义成模板列
              template:'isok', // 当前这一列的模板名称
            },
            {
              label:'排序',
              type:'template',  // 当前列定义成模板列
              template:'order', // 当前这一列的模板名称
            },
            {
              label:'操作',
              type:'template',  // 当前列定义成模板列
              template:'opt', // 当前这一列的模板名称
            },
         ],
         addCateDialogVisible:false,  // 控制添加分类弹框显隐
         addCateForm:{
            cat_name:'',  // 添加分类名称
            cat_pid:0,   // 父级分类id
            cat_level:0,  // 分类等级 默认要添加的sshi一级分类 
         }, // 添加商品分类表单数据
         // 表单验证规则
         addCateRules:{
            cat_name:[
                { required: true, message: '请输入分类名称', trigger: 'blur' },
             ],
         },
         parentCateList:[],   // 父级分类的数据
         cascaderProps:{
             label:'cat_name',
             value:'cat_id',
             children:'children',
         },
         selectedKeys:[],    // 选中父级分类的id
         editCateDialogVisbel:false,
         editCate:{},
         editCateRules: {
             cat_name: [{ required: true, message: '请输入要修改的信息', trigger: 'blur' }]
         },
     }
  },
  created(){
     this.getCateList()
  },
  methods:{
     // 点击删除按钮
    async removeCate(removeId){
         const confirRustle = await this.$confirm('此操作将永久删除该文件, 是否继续?', '删除分类', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).catch(err => err)
        if (confirRustle !== 'confirm') {
            return this.$message.info('已取消删除操作!')
        } 
        const {data:res} = await this.$http.delete(`categories/${removeId}`)
        if (res.meta.status !== 200) {
           return this.$message.error('分类删除失败!')
        }
        this.$message.success('该分类已经成功删除!')
        this.getCateList()
     },
     // 点编辑确认按钮
     async editCateInfo(){
        const {data:res} = await this.$http.put(`categories/${this.editCate.cat_id}`,{ cat_name: this.editCate.cat_name })
        console.log('777',res)
        if (res.meta.status !== 200) {
           return this.$message.error('更新商品分类数据失败!')
        }
        this.$message.success('更新商品分类数据成功!')
        this.getCateList()
        this.editCateDialogVisbel = false
     },
    // 点击编辑按钮
    async showeditCateDialog(cateId){
       console.log('cateId',cateId)
       const {data:res} = await this.$http.get(`categories/${cateId.cat_id}`)
       console.log('67777',res)
       this.editCate = res.data;
       this.editCateDialogVisbel = true;
    },  
    // 监听添加分类弹框的关闭事件
    addCateDialogClosed(){
       this.$refs.addCateRef.resetFields()
       this.selectedKeys = [];
       this.addCateForm.cat_pid = 0;
       this.addCateForm.cat_level = 0;
    },
    //点击添加分类弹框里面的确认按钮
    addCate(){
       this.$refs.addCateRef.validate(async valid => {
          if(!valid) return
          const {data:res} = await this.$http.post('/categories',this.addCateForm)
          if(res.meta.status !== 201 ){ return this.$message.error('新增商品分类失败')}
          this.$message.success('新增商品分成功')
          this.getCateList();
          this.addCateDialogVisible = false;
      })
    },
    // 级联选取器里面的值发生改变触发
    parentCateChanged(){
    // 如果 selectedKeys 数组中length > 0 说明选中了父级分类
    // 反之 就说明没有选中任何父级分类
    if(this.selectedKeys.length > 0 ){
       // 父级分类id
       this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
       //当前分类的等级
       this.addCateForm.cat_level = this.selectedKeys.length;  
       return;
      }else{
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    //点击添加分类按钮 获取弹框里面的父级分类数据
   showAddCateDialog(){
      // 先获取父级分类的数据
      this.getParentCateList();
      this.addCateDialogVisible = true;
   },
    // 获取父级分类的列表
   async getParentCateList(){
       const { data:res} = await this.$http.get('/categories',{
           params: { type: 2 }
       })
       if(res.meta.status !==200){ return this.$message.error('获取父级分类失败')}
       console.log('888',res)
       this.$message.success('获取父级分类成功')
       this.parentCateList = res.data;
    },
    // pagenum的改变  
    cateCurrentChange(newNum){
        this.queryInfo.pagenum = newNum;
        this.getCateList();
    },   
    // pagesize 的改变  
    cateSizeChange(newSize){
        this.queryInfo.pagesize = newSize;
        this.getCateList();
    }, 
    async getCateList(){
       const {data:res} = await this.$http.get('/categories',{params:this.queryInfo});
       if(res.meta.status !== 200){ return this.$message.error('获取商品分类失败')}
       this.$message.success('获取商品分类成功')
       this.catelist = res.data.result;
       this.total = res.data.total
    }
  }
}
</script>

<style>

.el-cascader{width:100%;}
.el-pagination{margin-top:15px}

</style>
