const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// 注册 setGlobalVar helper 函数
Handlebars.registerHelper('setGlobalVar', function(name, value) {
    this[name] = value;
});

// 注册 getGlobalVar helper 函数
Handlebars.registerHelper('getGlobalVar', function(name) {
    return this[name];
});

Handlebars.registerHelper('inc', function(value) {
    return parseInt(value) + 1;
});

// 填充 meta 对象
const tableDefinition = {
    'c_name': { columnRawName:'c_name',columnName:'Cname',udtName: 'string', nullable: false, tsType: 'string', columnComment: '姓名' },
    'c_age': {columnRawName:'c_age',columnName:'Cage', udtName: 'number', nullable: false, tsType: 'number', columnComment: '年龄' }
};

const meta = {
    "patient": {
        tableProperties: {
            tableComment: "患者表",
            tableName: "Patient",
            tableRawName:"t_patient"
        },
        tableDefinition: tableDefinition
    }
};

// 准备模板
const test = fs.readFileSync('test.hbs', 'utf8');
const testTemplate = Handlebars.compile(test);

// 填充模板
const testCode = testTemplate({meta: meta["patient"]});
// 获取当前执行脚本的目录作为项目根目录
const outputPath = "com.patient.dao"
const rootPath = path.resolve(__dirname);

// 将outputPath转换为正常的包目录结构
const outputPathParts = outputPath.split('.');
const normalizedOutputPath = outputPathParts.join(path.sep);
const fullOutputPath = path.join(rootPath, normalizedOutputPath, "/impl");

// 检查目录是否存在，如果不存在则创建
if (!fs.existsSync(fullOutputPath)) {
    fs.mkdirSync(fullOutputPath, { recursive: true });
    console.log("Directory created: \n" + fullOutputPath + "\n");
} else {
    console.log("Directory already exists: \n" + fullOutputPath + "\n");
}

// 使用修改后的完整输出路径保存文件
fs.writeFileSync(path.join(fullOutputPath, "testaaa.ts"), testCode);
console.log("File saved successfully at: \n" + path.join(fullOutputPath, "testaaa.ts") + "\n");
