 # 系统说明文档
 ## HttpClient
 
目前前端请求Node服务层数据返回格式：
 
  >      {
  >          success:true/false,
  >          code:0-10000,
  >          msg:'',
  >          dataObject:object/array/boolean/string/int
  >      }

**返回数据处理规则：** 

如果返回为`false`，则直接在`loadApi`中被阻断，以通用的展示效果进行提示；

如果返回的是`true`，如果有业务规则需要，通过判断返回的`code`代码进行业务规则的判断，也可以直接判断`code`是否大于0，如果大于0，则直接展示`msg`。
