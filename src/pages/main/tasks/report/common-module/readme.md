

```javascript
// 通用模块配置
{
    "commonModules": [
        // 第一个通用模块
        {
            // 模块标题
            "title": "HLA分析",
            // 描述文件
            "descriptionFile": "/data/bioinfo/task/1/53/20250812/NanOncoPlusPanelv3P/2503/result//HLA/HLA_description_CN.txt",
            // 模块表格, 多个
            "tables": [
                // 第一个表格
                {
                    // 表格标题
                    "name": "肿瘤样本HLA分型表格",
                    // 表格数据文件
                    "file": "/data/bioinfo/task/1/53/20250812/NanOncoPlusPanelv3P/2503/result//HLA/D00001096_final.result.txt",
                    // 表格配置
                    "columns": [ {
                        "name": "HLA allele", // 列标题
                        "type": "image",      // 列类型, image: 图片, file: 文件, text: 文字, link: 链接
                    }]
                }, 
                // 第二个表格
                { }
            ],
            // 图片, 多个
            "images": [
                {
                    "file": "/data/bioinfo/task/1/53/20250812/NanOncoPlusPanelv3P/2503/result//HLA/HLA.png",
                    "descriptionFile": "/data/bioinfo/task/1/53/20250812/NanOncoPlusPanelv3P/2503/result//HLA/HLA.png_CN.txt"
                }
            ]
        },
        // 第二个通用模块
        {}
    ]
}
```