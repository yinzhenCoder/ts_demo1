
import { mapValues } from 'lodash'
import { keys } from 'lodash'
import Options from './options'
import * as pgPromise from 'pg-promise';
import {TableDefinition, Database, SchemaDefinition} from './schemaInterfaces'

const pgp = pgPromise();

export class PostgresDatabase implements Database {
    private db: pgPromise.IDatabase<{}>

    constructor (public connectionString: string) {
        this.db = pgp(connectionString)
    }



    private static mapTableDefinitionToType (tableDefinition: TableDefinition, customTypes: string[], options: Options): TableDefinition {
        return mapValues(tableDefinition, column => {
            switch (column.udtName) {
                case 'bpchar':
                case 'char':
                case 'varchar':
                case 'text':
                case 'citext':
                case 'uuid':
                case 'bytea':
                case 'inet':
                case 'time':
                case 'timetz':
                case 'interval':
                case 'name':
                    column.tsType = 'string'
                    return column
                case 'int2':
                case 'int4':
                case 'int8':
                case 'float4':
                case 'float8':
                case 'numeric':
                case 'money':
                case 'oid':
                    column.tsType = 'number'
                    return column
                case 'bool':
                    column.tsType = 'boolean'
                    return column
                case 'json':
                case 'jsonb':
                    column.tsType = 'Object'
                    return column
                case 'date':
                case 'timestamp':
                case 'timestamptz':
                    column.tsType = 'Date'
                    return column
                case '_int2':
                case '_int4':
                case '_int8':
                case '_float4':
                case '_float8':
                case '_numeric':
                case '_money':
                    column.tsType = 'Array<number>'
                    return column
                case '_bool':
                    column.tsType = 'Array<boolean>'
                    return column
                case '_varchar':
                case '_text':
                case '_citext':                    
                case '_uuid':
                case '_bytea':
                    column.tsType = 'Array<string>'
                    return column
                case '_json':
                case '_jsonb':
                    column.tsType = 'Array<Object>'
                    return column
                case '_timestamptz':
                    column.tsType = 'Array<Date>'
                    return column
                default:
                    if (customTypes.indexOf(column.udtName) !== -1) {
                        column.tsType = options.transformTypeName(column.udtName)
                        return column
                    } else {
                        console.log(`Type [${column.udtName} has been mapped to [any] because no specific type has been found.`)
                        column.tsType = 'any'
                        return column
                    }
            }
        })
    }

    public query (queryString: string) {
        return this.db.query(queryString)
    }

    public async getEnumTypes (schema?: string) {
        type T = {name: string, value: any}
        let enums: any = {}
        let enumSchemaWhereClause = schema ? pgp.as.format(`where n.nspname = $1`, schema) : ''
        await this.db.each<T>(
             'select n.nspname as schema, t.typname as name, e.enumlabel as value ' +
             'from pg_type t ' +
             'join pg_enum e on t.oid = e.enumtypid ' +
             'join pg_catalog.pg_namespace n ON n.oid = t.typnamespace ' +
             `${enumSchemaWhereClause} ` +
             'order by t.typname asc, e.enumlabel asc;', [],
            (item: T) => {
                if (!enums[item.name]) {
                    enums[item.name] = []
                }
                enums[item.name].push(item.value)
            }
        )
        return enums
    }

    public async getTableDefinition (tableName: string, tableSchema: string) {
        let tableDefinition: TableDefinition = {}
        type T = { column_name: string, udt_name: string, is_nullable: string }
        await this.db.each<T>(
            'SELECT column_name, udt_name, is_nullable ' +
            'FROM information_schema.columns ' +
            'WHERE table_name = $1 and table_schema = $2',
            [tableName, tableSchema],
            (schemaItem: T) => {
                tableDefinition[schemaItem.column_name] = {
                    udtName: schemaItem.udt_name,
                    nullable: schemaItem.is_nullable === 'YES'
                }
            })
        return tableDefinition
    }

    public async myGetTableDefinition (tableName: string, tableSchema: string) {
        let tableDefinition: TableDefinition = {}
        type T = { column_name: string, udt_name: string, is_nullable: string, column_comment: string }
        await this.db.each<T>(
            'SELECT  cols.column_name,' +
            '       cols.udt_name,' +
            '       cols.is_nullable, ' +
            'pgd.description as column_comment ' +
            'FROM information_schema.columns cols ' +
            '  LEFT JOIN' +
            '     pg_catalog.pg_description pgd ON pgd.objsubid = cols.ordinal_position' +
            '         AND pgd.objoid = (SELECT c.oid' +
            '                           FROM pg_catalog.pg_class c' +
            '                           WHERE c.relname = cols.table_name)'+
            'WHERE table_name = $1 and table_schema = $2',
            [tableName, tableSchema],
            (schemaItem: T) => {
                tableDefinition[schemaItem.column_name] = {
                    udtName: schemaItem.udt_name,
                    nullable: schemaItem.is_nullable === 'YES',
                    columnComment: schemaItem.column_comment
                }
            })
        return tableDefinition
    }

    public async getTableTypes (tableName: string, tableSchema: string, options: Options) {
        let enumTypes = await this.getEnumTypes()
        let customTypes = keys(enumTypes)
        return PostgresDatabase.mapTableDefinitionToType(await this.getTableDefinition(tableName, tableSchema), customTypes, options)
    }

    public async myGetTableTypes (tableName: string, tableSchema: string, options: Options) {
        let enumTypes = await this.getEnumTypes()
        let customTypes = keys(enumTypes)
        return PostgresDatabase.mapTableDefinitionToType(await this.myGetTableDefinition(tableName, tableSchema), customTypes, options)
    }

    public async myGetTableComments(tables: string[]): Promise<SchemaDefinition> {
        const schemaDefinition: SchemaDefinition = {};

        const tableComments = await this.db.map<{  relname: string,table_comment: string, }>(
            `SELECT c.relname, 
            NULLIF(d.description,'') AS table_comment
         FROM pg_description d
         JOIN pg_class c ON d.objoid = c.oid
         WHERE c.relkind = 'r'
         AND d.objsubid = 0
         AND c.relname = ANY(array[$1]);`,
            [tables],
            (tableInfo: { relname: string, table_comment: string }) => tableInfo
        );
        //console.log("tableComments:"+tableComments);
        tables.forEach((tableName) => {
            const tableComment = tableComments.find((item) => item.relname === tableName);
            if (tableComment) {
                schemaDefinition[tableName] = {
                    tableProperties: {
                        tableComment: tableComment.table_comment
                    },
                    tableDefinition: {}
                };
            } else {
                // 处理表注释为空的情况，可以设置默认值或者采取其他适当的处理方式
                schemaDefinition[tableName] = {
                    tableProperties: {
                        tableComment: ''
                    },
                    tableDefinition: {}
                };
            }
        });

        return schemaDefinition;
    }
    public async getSchemaTables (schemaName: string): Promise<string[]> {
        return await this.db.map<string>(
            'SELECT table_name ' +
            'FROM information_schema.columns ' +
            'WHERE table_schema = $1 ' +
            'GROUP BY table_name',
            [schemaName],
            (schemaItem: {table_name: string}) => schemaItem.table_name
        )
    }

    getDefaultSchema (): string {
        return 'public'
    }
}
