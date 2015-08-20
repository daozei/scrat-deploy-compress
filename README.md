# scrat-deploy-compress

## 说明

提供打包功能, `scrat release -d zip`

## 使用方法

```javascript
fis.config.merge({
  modules: {
    deploy: ['compress']
  },
  settings: {
    deploy: {
      compress: {
        zip: {
          //不配置该项, 则默认为 ../dist/{name}_v{version}_{timestamp}.zip
          file: '../dist/test.zip'
        },
        remote: {
          url: '',
          uploadField: 'files[]',
          formData: {
          },
          auth: {
            username: '',
            password: ''
         }
      }
    }
  }
});
```