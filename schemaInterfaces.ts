import Options from './options'

export interface ColumnDefinition {
    columnName?: string,
    columnRawName?:string,
    udtName: string,
    nullable: boolean,
    tsType?: string,
    columnComment?: string,
}
export interface TableProperties {
    tableComment: string, // 表的注释
    tableName?: string, //驼峰后表名
    tableRawName?: string,
}
export interface TableDefinition {
    [columnName: string]: ColumnDefinition,
}

export interface SchemaDefinition {
    [tableName: string]: {
        tableProperties: TableProperties; // 表的属性
        tableDefinition: TableDefinition}
}
export interface Database {
    connectionString: string
    query (queryString: string): Promise<Object[]>
    getDefaultSchema (): string
    getEnumTypes (schema?: string): any
    //getTableDefinition (tableName: string, tableSchema: string): Promise<TableDefinition>
    myGetTableDefinition (tableName: string, tableSchema: string): Promise<TableDefinition>
    //getTableTypes (tableName: string, tableSchema: string, options: Options): Promise<TableDefinition>
    myGetTableTypes (tableName: string, tableSchema: string, options: Options): Promise<TableDefinition>
    myGetTableComments(tables: string[], tableSchema: string): Promise<SchemaDefinition>
    getSchemaTables (schemaName: string): Promise<string[]>
}
