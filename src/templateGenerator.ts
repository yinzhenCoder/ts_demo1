import {SchemaDefinition} from "../schemaInterfaces";
import {Options as ITFOptions} from "typescript-formatter/lib";
import {processString} from "typescript-formatter";

const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// 注册 Handlebars Helper 函数
Handlebars.registerHelper('setGlobalVar', function(name:string, value:any) {
    this[name] = value;
});

Handlebars.registerHelper('getGlobalVar', function(name:string) {
    return this[name];
});

Handlebars.registerHelper('inc', function(value) {
    return parseInt(value) + 1;
});

// 编译模板
function compileTemplate(meta:SchemaDefinition, templatePath:string) {
    // 读取模板文件
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    // 填充模板
    return template({ meta });
}

// 生成文件
// 生成文件
export function generateFiles(meta: SchemaDefinition, table: string,outputPath:string) {
    let data = meta[table];
    console.log(JSON.stringify(meta));
    // 获取 tableName
    const tableName = meta[table].tableProperties.tableName;

    // 准备输出目录
    const fullOutputPath = path.resolve(__dirname, outputPath);
    if (!fs.existsSync(fullOutputPath)) {
        fs.mkdirSync(fullOutputPath, { recursive: true });
        console.log("Directory created: \n" + fullOutputPath + "\n");
    } else {
        console.log("Directory already exists: \n" + fullOutputPath + "\n");
    }

    // 生成 DAO 文件
    const daoCode = compileTemplate({meta: meta[table]}, 'daoTemplate.hbs');
    formatter(`${tableName}DAO.ts`,daoCode);
    fs.writeFileSync(path.join(fullOutputPath, `${tableName}DAO.ts`), daoCode);
    console.log("File saved successfully at: \n" + path.join(fullOutputPath, `${tableName}DAO.ts`) + "\n");

    // 生成 DAO Impl 文件
    const daoImplCode = compileTemplate({meta: meta[table]}, 'daoImplTemplate.hbs');
    formatter(`${tableName}DAOImpl.ts`,daoImplCode);
    fs.writeFileSync(path.join(fullOutputPath, `${tableName}DAOImpl.ts`), daoImplCode);
    console.log("File saved successfully at: \n" + path.join(fullOutputPath, `${tableName}DAOImpl.ts`) + "\n");
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
