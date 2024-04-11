import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { typescriptOfSchema } from './index';
import Options, {CAMELCASE_OPTIONS} from "./options"; // 导入生成接口文件的函数

// 读取 generator.yaml 配置文件
const configPath = 'generator.yaml';
const config:any = yaml.load(fs.readFileSync(configPath, 'utf8'));


// 从配置文件中获取 PostgreSQL 连接信息
const { user, host, database, password, port } = config.postgres;
const dbConnectionString = `postgres://${user}:${password}@${host}:${port}/${database}`;

// 获取输出路径
const {orgPath,path} = config.output;
// 获取表列表
const tables = config.tables;
// 调用 typescriptOfSchema 函数生成接口文件
typescriptOfSchema(dbConnectionString, tables, orgPath,path)
    .then((result) => {
        console.log(result);
        console.log("Interface file generated successfully");
        process.exit(0); // 立即结束脚本执行
    })
    .catch((error) => {
        console.error('Error generating interface file:', error);
    });
