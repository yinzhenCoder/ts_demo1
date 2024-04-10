// const tableMetadata = {
//     tableName: 'Patient',
//     // 其他表元数据
// };
//
// const interfaceInfo = {
//     tableName: 'Patient',
//     // 其他接口信息
// };

const Handlebars = require('handlebars');
const fs = require('fs');


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

// 创建 TableDefinition 对象并填充
// const tableDefinition: TableDefinition = {
//     'name': nameColumn,
//     'age': ageColumn,
// };

// 填充 meta 对象
// const meta = {
//     "patient": {
//         tableProperties: {
//             tableComment: "患者表",
//             tableName: "Patient"
//         },
//         tableDefinition: tableDefinition
//     }
// };

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


// export interface ColumnDefinition {
//     udtName: string,
//     nullable: boolean,
//     tsType?: string,
//     columnComment?: string,
// }
// export interface TableProperties {
//     tableComment: string; // 表的注释
// }
// export interface TableDefinition {
//     [columnName: string]: ColumnDefinition,
// }
//
// export interface SchemaDefinition {
//     [tableName: string]: {
//         tableProperties: TableProperties; // 表的属性
//         tableDefinition: TableDefinition}
// }

// 读取模板文件
const daoTemplateSource = fs.readFileSync('daoTemplate.hbs', 'utf8');
const daoImplTemplateSource = fs.readFileSync('daoImplTemplate.hbs', 'utf8');

// 准备模板
const daoTemplate = Handlebars.compile(daoTemplateSource);
const daoImplTemplate = Handlebars.compile(daoImplTemplateSource);

let tableName = "patient"
// 填充模板
const daoCode = daoTemplate({ meta: meta[`${tableName}`] });
const daoImplCode = daoImplTemplate({ meta: meta[`${tableName}`] });



const globalVars = {};



// 输出代码
//fs.writeFileSync('PatientDAO.ts', daoCode);
//fs.writeFileSync('PatientDAOImpl.ts', daoImplCode);
const path = require('path');

// 获取当前执行脚本的目录作为项目根目录
const outputPath = "com.patient.dao"
const rootPath = path.resolve(__dirname);
console.log("==============rootPath=============\n" + rootPath);
console.log("=====================================")
// 将outputPath转换为正常的包目录结构
const outputPathParts = outputPath.split('.');
const normalizedOutputPath = outputPathParts.join(path.sep);
const fullOutputPath = path.join(rootPath, normalizedOutputPath,"/impl");
const fullOutputPath1 = path.join(rootPath, normalizedOutputPath);
console.log("==========fullOutputPath===========\n" + fullOutputPath);
console.log("=====================================\n");

// 检查目录是否存在，如果不存在则创建
if (!fs.existsSync(fullOutputPath)) {
    fs.mkdirSync(fullOutputPath, {recursive: true});
    console.log("Directory created: \n" + fullOutputPath+"\n");
} else {
    console.log("Directory already exists: \n" + fullOutputPath+"\n");
}

// 使用修改后的完整输出路径保存文件
fs.writeFileSync(path.join(fullOutputPath1, "PatientDAO.ts"), daoCode);
console.log("File saved successfully at: \n" + path.join(fullOutputPath, "PatientDAO.ts")+"\n");
fs.writeFileSync(path.join(fullOutputPath, "PatientDAOImpl.ts"), daoImplCode);
console.log("File saved successfully at: \n" + path.join(fullOutputPath, "PatientDAOImpl.ts")+"\n");

//fs.writeFileSync(fileName, interfaceString);
//console.log(`Interface file for table ${tableName} generated and saved to ${fileName}`+"\n");
