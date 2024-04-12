import {SchemaDefinition} from "../schemaInterfaces";
import {Options as ITFOptions} from "typescript-formatter/lib";
import {processString} from "typescript-formatter";
import {DirectoryPaths} from "../index";

const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// 注册 Handlebars Helper 函数
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
// 编译模板
function compileTemplate(meta:any,table:string, templatePath:string) {
    // 读取模板文件
    const templatePathJoin = path.join(__dirname, 'templates', templatePath);
    const templateSource = fs.readFileSync(templatePathJoin, 'utf8');
    const template = Handlebars.compile(templateSource);

    // 填充模板
    return template({meta: meta[table]});
}


const tableDefinition = {
    'c_name': { columnRawName:'c_name',columnName:'Cname',udtName: 'string', nullable: false, tsType: 'string', columnComment: '姓名' },
    'c_age': {columnRawName:'c_age',columnName:'Cage', udtName: 'number', nullable: false, tsType: 'number', columnComment: '年龄' }
};

const meta1 = {
    "patient": {
        tableProperties: {
            tableComment: "患者表",
            tableName: "Patient",
            tableRawName:"t_patient"
        },
        tableDefinition: tableDefinition
    }
};



// 生成文件
// 生成文件
export async function generateFiles(meta: SchemaDefinition, table: string, directoryPaths: DirectoryPaths) {
    let data = meta[table];


    // 获取 tableName
    const tableName = meta[table].tableProperties.tableName;



    // 生成 DAO 文件
    const daoCode = compileTemplate(meta,table, 'daoTemplate.hbs');
    let formatterDao = await formatter(`${tableName}DAO.ts`,daoCode);
    fs.writeFileSync(path.join(directoryPaths.daoPath, `${tableName}DAO.ts`), formatterDao);
    console.log("File saved successfully at: \n" + path.join(directoryPaths.daoPath, `${tableName}DAO.ts`) + "\n");

    // 生成 DAO Impl 文件
    const daoImplCode = compileTemplate(meta,table, 'daoImplTemplate.hbs');
    let formatterDaoImpl = await formatter(`${tableName}DAOImpl.ts`,daoImplCode);
    fs.writeFileSync(path.join(directoryPaths.daoImplPath, `${tableName}DAOImpl.ts`), formatterDaoImpl);
    console.log("File saved successfully at: \n" + path.join(directoryPaths.daoImplPath, `${tableName}DAOImpl.ts`) + "\n");
}
async function formatter(fileName: string, output: string) {
    const formatterOption: ITFOptions = {
        replace: false,
        verify: false,
        tsconfig: true,
        tslint: true,
        editorconfig: true,
        tsfmt: true,
        vscode: false,
        tsconfigFile: null,
        tslintFile: null,
        vscodeFile: null,
        tsfmtFile: null
    }

    const processedResult = await processString(fileName, output, formatterOption)
    return processedResult.dest;
}

// 导出函数
module.exports = {
    generateFiles
};
