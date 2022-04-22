<template>
  <div>
       <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item> 
        </el-breadcrumb> -->
        <Breadcrumb name1="商品管理" name2="添加商品" />
        <!-- 卡片视图 -->
        <el-card>
           <el-alert
                title="添加商品信息" :closable="false"
                type="info"
                center
                show-icon>
            </el-alert>
            <el-steps align-center :space="200" :active="activeIndex - 0" finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" 
            label-width="80px" label-position="top">
                <el-tabs :before-leave="beforeTabLeave" @tab-click="tabClicked"
                v-model="activeIndex" :tab-position="tabPosition">
                    <el-tab-pane label="基本信息" name="0">
                       <el-form-item label="商品名称" prop="goods_name">
                          <el-input v-model="addForm.goods_name"></el-input>
                       </el-form-item>
                       <el-form-item label="商品价格" prop="goods_price" type="number">
                          <el-input v-model="addForm.goods_price"></el-input>
                       </el-form-item>
                       <el-form-item label="商品重量" prop="goods_weight" type="number">
                          <el-input v-model="addForm.goods_weight"></el-input>
                       </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number" type="number">
                          <el-input v-model="addForm.goods_number"></el-input>
                       </el-form-item>
                       <el-form-item label="商品分类" prop="goods_cat">
                          <el-cascader clearable change-on-select style="width:300px"
                            v-model="addForm.goods_cat" expand-trigger="hover"
                            :options="goodsList" :props="goodsProps" 
                            @change="handlerGoodsChange"></el-cascader> 
                       </el-form-item>   
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                       <el-form-item :label="item.attr_name" 
                          v-for="item in manyTableData" :key="item.attr_id">
                         <!-- 复选框组 -->
                         <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox border :key="i2" v-for="(item2,i2) in item.attr_vals" :label="item2"></el-checkbox>
                         </el-checkbox-group>
                       </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                          <el-input v-model="item.attr_vals"></el-input>
                       </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action 图片上传的服务器地址 -->
                        <el-upload :file-list="flieList"
                            :action="uploadURL" :headers="headersObj"
                            :on-preview="handlePreview" :on-success="handleSuccess"
                            :on-remove="handleRemove"
                            list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑框 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button style="margin-top:15px;" type="primary" @click="addGoods">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>  
        </el-card>
        <!-- 图片预览区 -->
        <el-dialog
            title="图片预览"
            :visible.sync="previewVisible"
            width="53%">
              <img :src="previewPath" style="width:100%;height:100%;" />
        </el-dialog>
  </div>
</template>

<script>
import Breadcrumb from '@/components/content/breadcrumb/Breadcrumb'
import { goodsAddFormRulesMixin } from '@/common/mixin.js'
import _ from 'lodash'  // 深拷贝 对象
export default {
  name: 'add',
  components: {
      Breadcrumb
  },
  mixins: [goodsAddFormRulesMixin],
  data(){
      return{
         previewVisible:false,
         headersObj:{
             Authorization:sessionStorage.getItem('token')
         },  // 图片上传请求头
         uploadURL:'https://lianghj.top:8888/api/private/v1/upload',
         //uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
         activeIndex:'0',
         tabPosition:'left',
         addForm:{
            goods_name:'',
            goods_price:0,
            goods_weight:0,
            goods_number:0,
            goods_cat:[],   // 商品所属分类数组
            pics:[],  // 图片数组
            goods_introduce:'',  // 商品详情描述
            attrs:[],  // 
         },    // 表单数据
         addFormRules:{
            goods_name:[
                { required: true, message: '请输入商品名称', trigger: 'blur' },
              ],
            goods_price:[
                { required: true, message: '请输入商品价格', trigger: 'blur' },
              ],
            goods_weight:[
                { required: true, message: '请输入商品重量', trigger: 'blur' },
              ], 
            goods_number:[
                { required: true, message: '请输入商品数量', trigger: 'blur' },
              ], 
            goods_cat:[
                { required: true, message: '请选泽商品分类', trigger: 'blur' },
            ]    
         },    // 表单验证
         goodsList:[],   // 放入级联框里的数据
         goodsProps:{
             label:'cat_name',
             value:'cat_id',
             children:'children',
         },
         manyTableData:[],   // 动态参数列表
         onlyTableData:[],  // 静态商品属性
         previewPath:'',  // 图片预览路径
         flieList:[],     // 图片回显
         editOnlyAttr:[]  // 会显时存放静态属性的数组

      }
  },
  mounted(){
    console.log('query',this.$route.query.id)
    this.editInitGoods()
  },
  created(){
     this.getCateList()
  },
  computed:{
     cateId(){
         if(this.addForm.goods_cat.length ===3){
             return this.addForm.goods_cat[2]
         }
         return null;
     }
  },
  methods:{
    // 渲染数据到对应的输入框里
    async editInitGoods(){
       // 如果有id就是编辑 否则就是新增
       if(this.$route.query.id){
           const {data:res} = await this.$http.get(`goods/${this.$route.query.id}`)
           console.log('0000999',res)
           this.editOnlyAttr = res.data.attrs;
           const cateArr = res.data.goods_cat.split(',')
           cateArr.forEach(item=>{
              this.addForm.goods_cat.push(item)
           })
           // 更改图片对象里的属性 和回显图片  [{name:'aaa',url:'bb1.png'},{name:'aaa2',url:'bb2.png'},]
           if(res.data.pics.length !==0){
                res.data.pics.forEach(item=>{
                    item.name = item.pics_sma
                    item.url = item.pics_sma_url
                })
                this.flieList= res.data.pics
           }    
           this.addForm = res.data;
       }
    },  
    //添加商品   
   addGoods(){
        // 点击编辑提交按钮
        if(this.$route.query.id){
           this.$refs.addFormRef.validate(async valid => {
                if(!valid)  return this.$message.error('请填写必要的表单项');
                    // 处理静态属性
                    const editNewArr = []
                    this.editOnlyAttr.forEach(item=>{
                        console.log('7777',item)
                        const newInfo = {
                            attr_id:item.attr_id,
                            attr_value:item.attr_vals
                        }
                        editNewArr.push(newInfo)
                    })
                    this.addForm.attrs = editNewArr;
                const {data:res} = await this.$http.put(`/goods/${this.$route.query.id}`,this.addForm)
                if(res.meta.status !== 201) { 
                        return this.$message.error('修改商品失败') 
                }
                this.$message.success('修改商品成功!')
                this.$router.push('/goods')
          })
        }else{
            this.$refs.addFormRef.validate(async valid => {
                if(!valid)  return this.$message.error('请填写必要的表单项');
                const form = _.cloneDeep(this.addForm)  //深拷贝  数据展示需要是数组 发送接口传递的参数需要是字符串 所以要深拷贝
                form.goods_cat = form.goods_cat && form.goods_cat.join(',')
                //处理动态参数
                this.manyTableData.forEach(item=>{
                    const newInfo = {
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals.join(' ')
                    }
                    this.addForm.attrs.push(newInfo)
                })
                // 处理静态属性
                this.onlyTableData.forEach(item=>{
                    const newInfo = {
                        attr_id:item.attr_id,
                        attr_value:item.attr_vals
                    }
                    this.addForm.attrs.push(newInfo)
                })
                form.attrs = this.addForm.attrs;
                //发起请求
                const {data:res} = await this.$http.post('/goods',form)
                if(res.meta.status !== 201) { 
                        return this.$message.error('添加商品失败') 
                }
                this.$message.success('添加商品成功!')
                this.$router.push('/goods')
            });
      }  
   },  
  // 图片上传成功   
  handleSuccess(res){
        // 拼接图片对象 把图片对象Push到pics 数组中
        const picInfo = {
            pic:res.data.tmp_path
        }
        this.addForm.pics.push(picInfo)
  },    
  //删除图片    
  handleRemove(file){
     // 删除的编辑时候的图片
     if(this.$route.query.id){
        const fileEditPath = file.name;
        const i2 = this.addForm.pics.findIndex(x=> x.pic === fileEditPath)
        this.addForm.pics.splice(i2,1)
     }else{
        //获取删除图片的临时路径
        const filePath = file.response.data.tmp_path;
        // 2. 从 pics 数组中找到这个图片的对应的索引值
        const i = this.addForm.pics.findIndex(x=> x.pic === filePath)
        // 3. 调用数组的splice方法,把图片信息对象,从pics数组中移除
        this.addForm.pics.splice(i,1)
     }
     console.log('file',file)
  }, 
  // 图片预览
  handlePreview(file){
    console.log('file',file)
    this.previewPath = file.response.data.url.replace('http://127.0.0.1', 'https://lianghj.top');
    //this.previewPath = file.response.data.url
    this.previewVisible = true;
  },    
  async tabClicked(){
     // 访问的是动态参数面板   商品参数
     if(this.activeIndex ==='1'){
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
               params:{sel:'many'}
            })
            if(res.meta.status !== 200 ) { return this.$message.error('获取动态商品参失败')}
            res.data.forEach(item=>{
                item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',') 
            })
            console.log('manyTableData',res)
            this.manyTableData = res.data;
        // 静态商品属性
     }else if(this.activeIndex ==='2'){
         if(this.$route.query.id){
            this.onlyTableData = this.editOnlyAttr
        }else{
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
               params:{ sel:'only'}
            })
            console.log('onlyTableData',res)
            if(res.meta.status !== 200 ) { return this.$message.error('获取静态商品属性失败')}
            this.onlyTableData = res.data;
        }
     }
   },   
   async getCateList(){
       const {data:res} = await this.$http.get('/categories')
       if(res.meta.status !== 200){ return this.$message.error('获取商品分类失败')}
       this.$message.success('获取商品分类成功')
       console.log('data',res.data)
       this.goodsList = res.data;
    },
    handlerGoodsChange(){
       if(this.addForm.goods_cat.length !== 3){ this.addForm.goods_cat = []}
    },
    // 标签页离开前触发
    beforeTabLeave(newA,oldA){
       if(oldA==='0'&& this.addForm.goods_cat.length !==3||this.addForm.goods_name === ''){
           this.$message.error('请先选择商品分类! 或 填写商品名称')
           return false;
       }
    }
  },
}
</script>

<style lang="less" scoped>

.el-steps{margin:15px 0;}
.el-checkbox{margin:0 10px 0 0!important;}

</style>