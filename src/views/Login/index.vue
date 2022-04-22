<template>
  <div class="login_container">
     <div class="login_box">
         <!-- 头像区 -->
         <div class="avatar_box">
             <img src="../../assets/logo.jpg" alt="" />
         </div>
         <el-form ref="loginFormRef" :model="loginForm" class="login_form" :rules="loginRules">
            <!-- 用户名 -->
            <el-form-item prop="username">
                <el-input  v-model="loginForm.username" prefix-icon="iconfont icon-yonghuming"></el-input>
            </el-form-item>
            <!-- 密码 -->
             <el-form-item prop="password">
                <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-mima"></el-input>
            </el-form-item>
             <el-form-item class="btns">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="resetLoginForm('loginFormRef')">重置</el-button>
            </el-form-item>
        </el-form>
     </div>
  </div>
</template>

<script>
export default {
  name: 'index',
  data(){
    return{
      loginForm:{
         username:'',
         password:''
      },
      // 表单验证
      loginRules: {
         username: [
            { required: true, message: '请输入登录用户名', trigger: 'blur' },
            { min:3,max:20,  message: '长度在 3 到 20 个字符', trigger: 'blur'},
          ],
          password: [
             { required: true, message: '请输入登录密码', trigger: 'blur' },
             { min:6,max:15,  message: '长度在 6 到 15 个字符', trigger: 'blur'},
          ],
        }
    }
  },
  methods:{
    resetLoginForm(formName){
        this.$refs[formName].resetFields();
    },
    login(){
      this.$refs.loginFormRef.validate(async valid=>{
         if(!valid)  return;
         const result = await this.$http.post('/login',this.loginForm)
         console.log('result',result)
         if(result.data.meta.status !==200){ this.$message.error('登录失败')}
         else{
            this.$message({
                    message:result.data.meta.msg,
                    type:'success'
            })
         }
         sessionStorage.setItem('token',result.data.data.token)
         this.$router.push('/home')
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login_container{
     background-color: #2b4b6b;
     height:100%;
}

.login_box{
    width:450px;height:300px;background-color: #fff;border-radius: 3px;
    position:absolute;left:50%;top:50%;
    transform:translate(-50%,-50%);
    .avatar_box{
       width:130px;
       height:130px;
       border:1px solid #eee;
       padding:10px;
       border-radius: 50%;
       box-shadow: 0 0 10px #ddd;
       position:absolute;left:50%;
       transform:translate(-50%,-50%);
       background-color: #fff;
       img{
          width:100%;
          height:100%;
          border-radius: 50%;
          background-color: #eee;
       }
    }
}

.login_form{
   position:absolute;bottom:0;
   width:100%;
   padding:0 20px;
   box-sizing: border-box;
}

.btns{
  display: flex;
  justify-content: flex-end;
}

</style>
