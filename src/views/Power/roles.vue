<template>
   <div>
       <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item> 
       </el-breadcrumb>  -->
       <Breadcrumb name1="权限管理" name2="角色列表" />
       <!-- 卡片视图 -->
        <el-card>
           <el-row>
                <el-col>
                    <el-button style="float:left;" type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row> 
            <!-- 角色列表 -->
            <el-table :data="rolesList" border style="margin-top:15px;">
                 <!-- 展开列 -->
                 <el-table-column type="expand">
                     <template slot-scope="scope">
                       <!-- <pre>{{scope.row}}</pre> -->
                       <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                              <!-- 一级权限 -->
                             <el-col :span="6">
                                 <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                 <i class="el-icon-caret-right"></i>
                              </el-col>
                          <!-- 二级 三级权限 -->
                          <el-col :span="18">
                             <el-row :class="[i2===0 ? '':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                <el-col :span="6">
                                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="18">
                                    <el-tag type="warning" closable @close="removeRightById(scope.row,item3.id)" v-for="item3 in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                                </el-col>
                             </el-row>
                          </el-col>
                       </el-row>
                     </template>
                 </el-table-column>
                 <!-- 索引列 -->
                 <el-table-column type="index"></el-table-column>
                 <el-table-column label="角色名称" prop="roleName"></el-table-column>
                 <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                 <el-table-column label="操作">
                      <template slot-scope="scope">
                         <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                         <el-button size="mini" type="danger" icon="el-icon-delete" @click="rolesdelete(scope.row.id)">删除</el-button>
                         <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">权限分配</el-button>
                      </template>
                 </el-table-column>
            </el-table>
        </el-card>
         <!-- 添加角色对话框 -->
         <el-dialog title="添加角色" :visible.sync="addDialogVisible" @close="addDislogClosed">
            <el-form :model="addRolesForm" :rules="addFormRules" ref="addRolesForm" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
               <el-input v-model="addRolesForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
               <el-input v-model="addRolesForm.roleDesc"></el-input>
            </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRolesUser">确 定</el-button>
            </span>
         </el-dialog>
         <!-- 编辑对话框 -->
         <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="30%">
            <el-form :model="editRolesForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
               <el-input v-model="editRolesForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
               <el-input v-model="editRolesForm.roleDesc"></el-input>
            </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editFormInfo">确 定</el-button>
            </span>
         </el-dialog>
          <!-- 分配权限的弹框 -->
          <el-dialog
               title="分配权限"
               :visible.sync="setRightDialogVisible" @close="setRightDialogClosed"
               width="50%">
               <!-- 树形控件 -->
               <el-tree :data="rightsList" ref="treeRef" :props="treeProps" :default-checked-keys="defKeys" default-expand-all show-checkbox node-key="id"></el-tree>
               <span slot="footer" class="dialog-footer">
                  <el-button @click="setRightDialogVisible = false">取 消</el-button>
                  <el-button type="primary" @click="allotRights">确 定</el-button>
               </span>
         </el-dialog>
   </div>
</template>

<script>
import { rolesFormRulesMixin } from '@/common/mixin.js'
import Breadcrumb from '@/components/content/breadcrumb/Breadcrumb'
export default {
  name: 'roles',
  components: {
     Breadcrumb
  },
  mixins: [rolesFormRulesMixin],
  data(){
     return{
        rolesList:[], // 角色列表
        setRightDialogVisible:false, // 控制分配权限的显隐
        rightsList:[],  // 分配权限列表
        treeProps:{     // 树形控件
           label:'authName',
           children:'children'
        },
        defKeys:[],   // 默认打开树形结构 勾选中值
        roleId:'',  // 当前分配权限的id
        addDialogVisible:false,
        addRolesForm: {
             roleName: '',
             roleDesc: ''
         },
        editDialogVisible:false,
        editRolesForm:{},
     }
  },
  methods:{
      //点击删除角色按钮
      async rolesdelete(id){
          const confirmRusult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '删除角色', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err)
         if (confirmRusult !== 'confirm') {
            return this.$message.info('已取消该删除操作')
         }
         const {data:res} = await this.$http.delete(`roles/${id}`)
         console.log('666',res)
         if (res.meta.status !== 200) {
            return this.$message.error('该用户删除失败')
         }
         this.$message.success('该用户已经删除')
         this.getRolesList()
      },
     // 点击编辑框的确认按钮
     editFormInfo(){
         this.$refs.editFormRef.validate(async valid => {
            if(!valid) return;
            const {data:res} = await this.$http.put(`roles/${this.editRolesForm.roleId}`,{
               roleName:this.editRolesForm.roleName,
               roleDesc:this.editRolesForm.roleDesc,
            })
            console.log('555',res)
            if(res.meta.status !== 200) { return this.$message.error('修改角色失败!') }
             this.$message.success('修改角色成功!')
             this.getRolesList();
             this.editDialogVisible = false
         })
     },
     // 点击编辑按钮弹框
    async showEditDialog(id){
          const {data:res} = await this.$http.get(`roles/${id}`)
          console.log('444',res)
          if(res.meta.status !== 200) { return this.$message.error('查询角色失败!') }
          this.editRolesForm = res.data;
          this.editDialogVisible = true
     },
     // 点击添加角色弹框的确认按钮
     addRolesUser(){
       this.$refs.addRolesForm.validate(async valid => {
          if(!valid) return;
          const {data:res} = await this.$http.post('/roles',this.addRolesForm)
          console.log('333',res)
          if(res.meta.status !==201) { this.$message.error('添加角色失败!')}
          this.$message.success('添加角色成功!')
          this.getRolesList();
          this.addDialogVisible = false
       })
     },
     // 清空添加角色对话框
     addDislogClosed() {
        this.$refs.addRolesForm.resetFields()
     },
     // 点击分配权限弹框的确认按钮
     async allotRights(){
        const keys = [
           ...this.$refs.treeRef.getCheckedKeys(),
           ...this.$refs.treeRef.getHalfCheckedKeys(),
        ]
        const idStr = keys.join(',')
        const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
        console.log('res66',res)
        if(res.meta.status !== 200){ return this.$message.error('分配权限失败')}
        this.$message.success('分配权限成功!')
        this.setRightDialogVisible = false;
        this.getRolesList();
     },
     //监听分配权限弹框关闭事件
     setRightDialogClosed(){
        this.defKeys = []
     },
     // 通过递归获取三级权限的id 并保存到defKeys 里面
     getDefKeys(node,arr){
       // 如果当前节点没有children 属性  就是第三级节点
       if(!node.children){
            return arr.push(node.id)
       }
       node.children.forEach(item=>{
            this.getDefKeys(item,arr)
       })
     },
     // 分配权限 弹框
    async showSetRightDialog(role){
      this.roleId = role.id;
      const {data:res} = await this.$http.get('rights/tree')
      if(res.meta.status !== 200) { return this.$message.error('分配权限列表失败')}
      this.rightsList = res.data;
      // 递归获取三级权限的id
      this.getDefKeys(role,this.defKeys)
      this.setRightDialogVisible = true;

    },
    async getRolesList(){
       const {data:res} = await this.$http.get('/roles')
       console.log('333',res)
       if(res.meta.status !== 200){ return this.$message.error('获取角色列表失败')}
       this.$message.success(res.meta.msg)
       this.rolesList = res.data;
     },
     //根据id 删除对应的权限
     async removeRightById(role,rightId){
         console.log('role',role)
         const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=> err)
        //点击确定返回 confirm   取消 返回 cancel
        if(confirmResult !== 'confirm'){
            return this.$message.info('已取消删除')
        }else{
            const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            console.log('88888',res)
            if(res.meta.status !== 200){ this.$message.error('删除权限失败')}
            this.$message.success('删除权限成功')
            // this.getRolesList()
            // 直接调用获取用户的方法会导致展开栏的关闭,这样体验不好
            // 可以直接把返回的最新数据直接赋值
            role.children = res.data
            //this.rolesList = res.data
            //this.getRolesList()
        }
     },
  },
  created(){
    this.getRolesList()
  },
 
}
</script>

<style lang="less" scoped>

.el-tag{margin:7px;}

.bdtop{border-top: 1px solid #eee;}
.bdbottom{border-bottom: 1px solid #eee;margin:0 48px;}

.vcenter{
    display: flex;
    align-items: center;
}

</style>
