<template>
   <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item> 
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 搜索和添加区域 -->
            <el-row :gutter="20">
               <el-col :span="8">
                   <el-input placeholder="请输入内容"  v-model="queryInfo.query" clearable @clear="getUserList">
                      <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                   </el-input>
               </el-col>
               <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
               </el-col>
            </el-row>
            <!-- 用户列表 -->
             <el-table :data="userList" style="width: 100%" border stripe>
                <el-table-column type="index"></el-table-column> 
                <el-table-column
                    prop="username"
                    label="姓名"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="email"
                    label="邮箱"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="mobile"
                    label="电话">
                </el-table-column>
                <el-table-column
                    prop="role_name"
                    label="角色">
                </el-table-column>
                <el-table-column
                    prop="mg_state"
                    label="状态">
                    <template slot-scope="scope">
                      <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                     <template slot-scope="scope">
                        <el-tooltip  effect="dark" content="编辑用户" placement="top">
                           <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id,scope.$index)"></el-button>
                        </el-tooltip>
                        <el-tooltip  effect="dark" content="删除用户" placement="top">
                           <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)"></el-button>
                        </el-tooltip>
                        <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
                           <el-button size="mini" type="warning" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
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
        <!-- 添加用户的弹框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible" @close="addDialogColsed"
            width="50%">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input  v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input  v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>    
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCancel">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
       </el-dialog>
        <!-- 编辑用户 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible" @close="editDialogColsed"
            width="50%">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input  v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input  v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCancel">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
         <!-- 分配角色 -->
        <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible" @close="setRoleDialogColsed"
            width="50%">
            <div>
               <p>当前的用户:{{userInfo.username}}</p>
               <p>当前的角色:{{userInfo.role_name}}</p>
               <p>分配新角色:
                  <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option
                            v-for="item in rolesList"
                            :key="item.id"
                            :label="item.roleName"
                            :value="item.id">
                        </el-option>
                  </el-select>
               </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'users',
  data(){
    // 验证邮箱
    let checkEmail = (rule, value, callback)=>{
         let regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
         if(regEmail.test(value)){
           return callback()
        }
         callback(new Error('请输入合法的邮箱'))
    };
    let checkMobil = (rule, value, callback)=>{
       let regMobil = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
         if(regMobil.test(value)){
           return callback()
        }
         callback(new Error('请输入合法的手机号'))
    };
    return{
       selectedRoleId:'',  //已选中的角色id 
       rolesList:[],   // 保存所有角色列表 
       userInfo:{},    // 保存分配权限按钮获取的行数据
       setRoleDialogVisible:false,  // 控制分配角色的显隐 
       queryInfo:{
          query:'',         // 搜索关键字
          pagenum:1,        // 当前的页数
          pagesize:2,       // 每页的大小
       },   // 获取用户列表的参数对象
       userList:[],
       total:0,
       addDialogVisible:false,  // 新增弹框显隐
       editDialogVisible:false, // 编辑弹框显隐
       addForm:{
           username:'',
           password:'',
           email:'',
           mobile:''
       },   // 新增用户表单数据
       editForm:{
           username:'',
           email:'',
           mobile:''
       },  // 修改用户弹框数据
       //新增用户验证
       addFormRules:{
         username:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min:3,max:20,  message: '长度在 3 到 20 个字符', trigger: 'blur'},
         ],
         password:[
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min:3,max:20,  message: '长度在 3 到 20 个字符', trigger: 'blur'},
         ],
         email:[
              { required: true, message: '请输入邮箱', trigger: 'blur' },
              { validator: checkEmail, trigger: 'blur' }
         ],
         mobile:[
             { required: true, message: '请输入手机号', trigger: 'blur' },
             { validator: checkMobil, trigger: 'blur' }
         ],
       },  // 验证规则
       //修改用户验证
       editFormRules:{
         email:[
              { required: true, message: '请输入邮箱', trigger: 'blur' },
              { validator: checkEmail, trigger: 'blur' }
         ],
         mobile:[
             { required: true, message: '请输入手机号', trigger: 'blur' },
             { validator: checkMobil, trigger: 'blur' }
         ],
       },  // 验证规则
     }
  },
  created(){
      this.getUserList()
  },
  methods:{
    // 关闭分配角色弹框
    setRoleDialogColsed(){
       this.selectedRoleId = '';
       this.userInfo = {}
    },
     //点击确认 分配角色
    async saveRoleInfo(){
        if(!this.selectedRoleId) { return this.$message.error('请选择要分配的角色')}
        const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{
           rid:this.selectedRoleId
        })
        if(res.meta.status !== 200 ) { return this.$message.error('设置角色失败')}
        this.$message.success(res.meta.msg)
        this.getUserList();
        this.setRoleDialogVisible = false;
     }, 
    // 分配角色按钮
    async setRole(userInfo){
        this.userInfo = userInfo
        //在展示弹框之前 获取所有的角色列表
        const {data:res} = await this.$http.get(`roles`)
        if(res.meta.status !== 200){ return this.$message.error('获取角色列表失败')}
        this.rolesList = res.data;
        this.setRoleDialogVisible = true;
    },
    // 根据用户id删除用户
    async removeUserById(id){
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
                const {data:res} = await this.$http.delete(`users/${id}`)
                if(res.meta.status !== 200){ this.$message.error('删除单个用户失败')}
                this.$message.success('删除单个用户成功')
                this.getUserList()
            }
     },
     // 编辑用户 渲染数据
     async showEditDialog(userId,index){
         const {data:res} = await this.$http.get('/users/'+userId)
          console.log('res222',res)
         if(res.meta.status !== 200){
            return this.$message.error('获取用户信息失败')
         }
         this.editForm = res.data
         this.editDialogVisible = true;
         return this.$message.success(res.meta.msg)
     },
     //点击编辑取消按钮
     editCancel(){
       this.editDialogVisible = false
     },
     // 点击新增的取消
    addCancel(){
        this.addDialogColsed()
        this.addDialogVisible = false
     },
    // 点击新增确定按钮
    addUser(){
       this.$refs.addFormRef.validate(async valid => {
           if(!valid)  return;
           const {data:res} = await this.$http.post('/users',this.addForm)
           console.log('res444',res)
           if(res.meta.status !== 201) { return this.$message.error('新建用户失败')}
           this.$message.success(res.meta.msg)
           this.addDialogVisible = false
           this.addDialogColsed()
           this.getUserList()  // 刷新列表
        });
    },
    // 点击编辑确定按钮
    editUser(){
       this.$refs.editFormRef.validate(async valid => {
           if(!valid)  return;
           const {data:res} = await this.$http.put('/users/' + this.editForm.id,{
                    email:this.editForm.email,
                    mobile:this.editForm.mobile
               })     
           if(res.meta.status !== 200) { return this.$message.error('更新用户失败')}
           this.$message.success(res.meta.msg)
           this.editDialogVisible = false
           this.editDialogColsed()
           this.getUserList()  // 刷新列表
        });
    },
    // 关闭编辑弹框
    editDialogColsed(){
       this.$refs.editFormRef.resetFields()
    },
    //关闭新增弹框
    addDialogColsed(){
        this.$refs.addFormRef.resetFields()
    },
     // 搜索列表
    //  getUserListSearch(){
    //     if(!this.queryInfo.query){
    //         this.$message.error('搜索框不能为空')
    //         return false;
    //     }
    //     this.getUserList()
    //     this.queryInfo.query = ''
    //  },
     // 获取用户列表
     async getUserList(){
        const {data:res} = await this.$http.get('/users',{
              params: this.queryInfo
        })
        console.log('222',res)
        if(res.meta.status !== 200) return this.$message.error('获取用户列表失败')
        this.$message.success(res.meta.msg)
        this.userList = res.data.users
        this.total = res.data.total;
     },
     // 监听 pageSize
     handleSizeChange(newSize){
          //console.log('newSize',newSize)     // 10
          this.queryInfo.pagesize = newSize;
          this.getUserList()
     },
     // 监听页码值改变
     handleCurrentChange(newPage){
         //console.log('newPage',newPage)  // 3
         this.queryInfo.pagenum = newPage;
         this.getUserList()
     },
     // 监听 Switch 开关状态的改变
     async userStateChanged(userStatus){
         //const {data:res}  = await this.$http.put(`/users/${userinfo.id}/state/${userinfo.mg_state}`)
         const {data:res}  = await this.$http.put(`/users/${userStatus.id}/state/${userStatus.mg_state}`)
         if(res.meta.status !== 200){ 
            userStatus.mg_state = !userStatus.mg_state
            return this.$message.error('更新用户状态失败')
         }
         this.$message.success('更新用户状态成功')
     }
  }
}
</script>

<style lang="less" scoped>
.el-table{margin-top: 15px;}
.el-pagination{margin-top:15px}
</style>
