<template>
  <div id="params">
        <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item> 
        </el-breadcrumb> -->
        <Breadcrumb name1="商品管理" name2="参数列表" />
         <!-- 卡片视图 -->
        <el-card>
            <el-alert :closable="false" show-icon title="注意:只允许为第三级分类设置相关参数!" type="warning"></el-alert>
            <!-- 选择商品分类区域 -->
            <el-row style="margin:15px 0;">
               <el-col>
                 <span style="display:inline-block;">选择商品分类:</span>
                 <!-- 商品选择级联 -->
                 <!--  props 用来指定配置对象 -->
                 <el-cascader clearable change-on-select
                    v-model="selectedCateKeys" expand-trigger="hover"
                    :options="cateList" :props="cateProps"
                    @change="handlerCateChange"></el-cascader>    
               </el-col>
            </el-row>
            <!-- tab选项卡 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数面板 -->
                <el-tab-pane label="动态参数" name="many">
                      <el-button :disabled="isBtnDisabled" type="primary" size="mini" @click="addDialogVisible=true">添加参数</el-button>
                      <el-table :default-expand-all="true" :data="manyTableData" stripe borde style="width: 100%">
                         <el-table-column  type="expand" width="50">
                            <template slot-scope="scope">
                               <el-tag @close="handlerClose(i,scope.row)" v-for="(item,i) in scope.row.attr_vals" :key="i" closable>
                                  {{ item }}
                               </el-tag>
                                 <!-- 输入框按钮切换 -->
                                 <el-input 
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                    </el-input>
                                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                         </el-table-column>
                         <el-table-column  type="index" width="50"></el-table-column>
                         <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                         <el-table-column label="操作" width="180px">
                                <template slot-scope="scope">
                                    <el-tooltip  effect="dark" content="编辑" placement="top">
                                       <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)"></el-button>
                                    </el-tooltip>
                                    <el-tooltip  effect="dark" content="删除" placement="top">
                                       <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)"></el-button>
                                    </el-tooltip>
                                  </template>
                          </el-table-column>
                     </el-table>
                </el-tab-pane>
                <!-- 添加静态属性面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button :disabled="isBtnDisabled" type="primary" size="mini" @click="addDialogVisible=true">添加静态</el-button>
                    <el-table :data="onlyTableData" stripe borde style="width: 100%">
                         <el-table-column  type="expand" width="50">
                              <template slot-scope="scope">
                               <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable>
                                   {{ item }}
                               </el-tag>
                                 <!-- 输入框按钮切换 -->
                                 <el-input 
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                    >
                                    </el-input>
                                    <el-button  class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                         </el-table-column>
                         <el-table-column  type="index" width="50"></el-table-column>
                         <el-table-column prop="attr_name" label="属性名称"></el-table-column>
                         <el-table-column label="操作" width="180px">
                                <template slot-scope="scope">
                                    <el-tooltip  effect="dark" content="编辑" placement="top">
                                       <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)"></el-button>
                                    </el-tooltip>
                                    <el-tooltip  effect="dark" content="删除" placement="top">
                                       <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)"></el-button>
                                    </el-tooltip>
                                  </template>
                          </el-table-column>
                     </el-table>
                </el-tab-pane>
             </el-tabs>
        </el-card>
        <!-- 添加参数的弹框 -->
        <el-dialog @close="addDialogClosed"
            :title="'添加'+ titleDialog"
            :visible.sync="addDialogVisible"
            width="50%">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
                <el-form-item :label="titleDialog" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
         <!-- 修改参数的弹框 -->
        <el-dialog @close="editDialogClosed"
            :title="'修改'+ titleDialog"
            :visible.sync="editDialogVisible"
            width="50%">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
                <el-form-item :label="titleDialog" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '@/components/content/breadcrumb/Breadcrumb'
export default {
  name: 'params',
  components: {
     Breadcrumb
  },
  data(){
    return{
       cateList:[], // 级联菜单里的数据
       cateProps:{
           label:'cat_name',
           value:'cat_id',
           children:'children',
       },
       selectedCateKeys:[],  // 级联选中的id
       activeName:'many',  // 被激活的页签名称
       manyTableData:[],   // 动态参数的数据
       onlyTableData:[],   // 静态属性的数据
       addDialogVisible:false, // 添加分类框显隐
       addForm:{
          attr_name:'',
       },  // 添加参数表单数据
       addFormRules:{
         attr_name:[
            { required: true, message: '请输入参数名称', trigger: 'blur' },
         ],
       },
       editDialogVisible:false, // 编辑弹框显隐
       editForm:{
          attr_name:''
       },   // 修改表单的数据
       editFormRules:{
         attr_name:[
            { required: true, message: '请输入参数名称', trigger: 'blur' },
         ],
       },
    }
  },
  created(){
    this.getCateList()
  },
  methods:{ 
     // 显示输入框
    showInput(params){
        params.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      }, 
       // 输入框失去焦点触发
     handleInputConfirm(row){
        console.log('9999',row)
        if(row.inputValue.trim().length ===0){
           row.inputValue = '';
           row.inputVisible = false;
           return;
        }
        if (row.inputValue) {
           row.attr_vals.push(row.inputValue.trim());
        }
        // 数组去重
        const newArr = [];
        row.attr_vals.forEach((item,i)=>{
          if(newArr.indexOf(item)===-1){
              newArr.push(item)
              //newArr[newArr.length] = row.attr_vals[i]
          }
        })
        row.attr_vals = newArr; 
        row.inputValue = '';
        row.inputVisible = false;
        // 需要发送请求,保存
        this.saveAttrVals(row)
     }, 
     // 删除 tag标签项
     handlerClose(i,row){
        row.attr_vals.splice(i,1)
        this.saveAttrVals(row)
     }, 
     async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_sel: this.activeName,
        attr_name: row.attr_name,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败!')
      }
      this.$message.success('修改参数项成功!')
    },
     //删除按钮 根据id删除
    async removeParams(attr_id){
        // 弹框提示
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err=> err)
            //点击确定返回 confirm   取消 返回 cancel
            if(confirmResult !== 'confirm'){
                return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
            if(res.meta.status !== 200){ this.$message.error('删除单个参数失败')}
            this.$message.success('删除单个参数成功')
            this.getParamsData()
            
     },
    // 点击编辑按钮渲染数据
    async showEditDialog(attr_id){
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
           params: { attr_sel: this.activeName }
        })
        if (res.meta.status !== 200) {
           return this.$message.error('获取参数信息失败!')
         }
        console.log('000',res)
        this.editForm = res.data
        this.editDialogVisible = true
    },  
    // 点击编辑弹框里确认按钮
    editParams(){
       this.$refs.editFormRef.validate(async valid => {
            if(!valid)  return;
            const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                  attr_name: this.editForm.attr_name,
                  attr_sel: this.activeName
            })
            if (res.meta.status !== 200) {
                     return this.$message.error('修改参数失败!')
            }
            this.$message.success('修改参数成功!')
            this.editDialogVisible = false
            this.editDialogClosed()
            this.getParamsData() 
         })
     },
     editDialogClosed(){
         this.$refs.editFormRef.resetFields()
      }, 
     //添加参数弹框的关闭事件
     addDialogClosed(){
          this.$refs.addFormRef.resetFields()
     },
     //添加分类弹框确认按钮
     addParams(){
       this.$refs.addFormRef.validate(async valid => {
             if(!valid)  return;
             const {data:res} = await this.$http.post(`/categories/${this.cateId}/attributes`,
             {
                attr_name:this.addForm.attr_name,
                attr_sel:this.activeName
             })  
             console.log('6666',res)
             if(res.meta.status !== 201) { return this.$message.error('添加参数失败')}
             this.$message.success(res.meta.msg)
             this.addDialogVisible = false
             this.addDialogClosed()
             this.getParamsData() 
       })
     },
     //选项卡点击事件
     handleTabClick(){
        this.getParamsData()
     }, 
    //获取参数的列表数据 
    async getParamsData(){
            // 证明选中的不是三级分类  需要选中3级才能选上
            if(this.selectedCateKeys.length !== 3){
               this.selectedCateKeys = [];
               this.manyTableData = [];
               this.onlyTableData = [];
               return;
            }
            const {data:res} =await this.$http.get(`/categories/${this.cateId}/attributes`,{
                  params: { sel: this.activeName }
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取参数列表失败!')
            }
            // 获取Tag的数据分割为数组
            res.data.forEach(item => {
               item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                // 控制文本框的显示和隐藏
               item.inputVisible = false
               item.inputValue = ''
            })
            //  res.data.forEach(item=>{ 
            //     this.$set(item,'inputVisible',false)  // 设置公共的 属性
            //     this.$set(item,'inputValue','')
            //     item.attr_vals = item.attr_vals ? item.attr_vals.split(',') :[]
            //  })
             if (this.activeName === 'many') {
                 this.manyTableData = res.data
              }else {
                this.onlyTableData = res.data
             }
     },
    // 级联框值改变触发
    handlerCateChange(){
       this.getParamsData()
    },
    // 获取商品分类的数据  放入级联框里
    async getCateList(){
        const {data:res} = await this.$http.get(`/categories`)
        if(res.meta.status !== 200){ return this.$message.error('获取商品分类失败')}
        this.$message.success('获取商品分类成功')
        this.cateList = res.data;
     },
   },
   computed:{
     // 级联分类不是3级 按钮禁用 反之启用
     isBtnDisabled(){
       if(this.selectedCateKeys.length !==3){ return true}
       return false;
     },
     //获取三级分类的id
     cateId(){
         if(this.selectedCateKeys.length ===3){
             return this.selectedCateKeys[2]
         }
         return null;
     },
     //添加参数弹框的标题
     titleDialog(){
       return this.activeName === "many" ? "动态参数":"静态属性"
     },
  },
}
</script>

<style lang="less" scoped>
.el-cascader{margin-left:15px;display: inline-block;width:300px!important;}
.el-tag{margin:6px;}
.input-new-tag{width:150px;}
</style>
