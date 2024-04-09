import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { typescriptOfSchema } from './index';
import Options, {CAMELCASE_OPTIONS} from "./options"; // 导入生成接口文件的函数

// 读取 generator.yaml 配置文件
const configPath = 'generator.yaml';
const config:any = yaml.load(fs.readFileSync(configPath, 'utf8'));

// 从配置文件中获取 PostgreSQL 连接信息
const { user, host, database, password, port, tables, outputPath} = config.postgres;
const dbConnectionString = `postgres://${user}:${password}@${host}:${port}/${database}`;

// 调用 typescriptOfSchema 函数生成接口文件
typescriptOfSchema(dbConnectionString,tables,outputPath)
    .then((result) => {
        console.log( result);
        console.log("Interface file generated successfully:")
    })
    .catch((error) => {
        console.error('Error generating interface file:', error);
    });
