<template>
   <div>
       <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item> 
       </el-breadcrumb> -->
       <Breadcrumb name1="权限管理" name2="权限列表" />
       <!-- 卡片视图 -->
        <el-card>
            <el-table :data="rightList" border stripe>
               <el-table-column type="index"></el-table-column>
               <el-table-column label="权限名称" prop="authName"></el-table-column>
               <el-table-column label="路径" prop="path"></el-table-column>
               <el-table-column label="权限等级" prop="level">
                   <template slot-scope="scope">
                     <el-tag v-if="scope.row.level === '0' ">一级</el-tag>
                     <el-tag type="success" v-else-if="scope.row.level === '1' ">二级</el-tag>
                     <el-tag type="warning" v-else>三级</el-tag>
                   </template>
               </el-table-column>
            </el-table>
        </el-card>    
   </div>
</template>

<script>
import Breadcrumb from '@/components/content/breadcrumb/Breadcrumb'
export default {
  name: 'right',
  components: {
     Breadcrumb
  },
  data(){
    return{
       rightList:[],  //权限列表
    }
  },
  created(){
     this.getRightsList()
  },
  methods:{
    async getRightsList(){
      const {data:res} = await this.$http.get('rights/list')
      console.log('666777',res)
      if(res.meta.status !== 200){
          return this.$message.error('获取权限列表失败')
       }
       this.rightList = res.data;
     }
  },
 
}
</script>

<style lang="less" scoped>



</style>
