/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */

import * as _ from 'lodash'

import {SchemaDefinition, TableDefinition} from './schemaInterfaces'
import Options from './options'

function nameIsReservedKeyword (name: string): boolean {
    const reservedKeywords = [
        'string',
        'number',
        'package'
    ]
    return reservedKeywords.indexOf(name) !== -1
}

function normalizeName (name: string, options: Options): string {
    if (nameIsReservedKeyword(name)) {
        return name + '_'
    } else {
        return name
    }
}
/*
*
* export function generateTableTypes (tableNameRaw: string, tableDefinition: TableDefinition, options: Options) {
    const tableName = options.transformTypeName(tableNameRaw)
    let fields = ''
    Object.keys(tableDefinition).forEach((columnNameRaw) => {
        let type = tableDefinition[columnNameRaw].tsType
        let nullable = tableDefinition[columnNameRaw].nullable ? '| null' : ''
        const columnName = options.transformColumnName(columnNameRaw)
        fields += `export type ${normalizeName(columnName, options)} = ${type}${nullable};\n`
    })

*
* */

export function myGenerateTableInterface (tableNameRaw: string, tableDefinition: TableDefinition, options: Options,schemaDefinition:SchemaDefinition) {
    const tableName = options.transformTypeName(tableNameRaw)
    let members = ''
    Object.keys(tableDefinition).map(c => {
        let type = tableDefinition[c].tsType
        //let nullable = tableDefinition[c].nullable ? '' : ''
        let columnName = tableDefinition[c].nullable ? options.transformColumnName(c)+'?':options.transformColumnName(c)
        let columnComment = tableDefinition[c].columnComment==null|| tableDefinition[c].columnComment== ''?'': `
        /** 
         * ${tableDefinition[c].columnComment} 
         */ `
        members += `
        ${columnComment}
        ${columnName}:${type} ;`
    })

    let tableComment = schemaDefinition[tableNameRaw].tableProperties.tableComment==null
    || schemaDefinition[tableNameRaw].tableProperties.tableComment==''?'':`
    /** 
    * ${schemaDefinition[tableNameRaw].tableProperties.tableComment}
    */`
    return `${tableComment}
        export default interface ${normalizeName(tableName, options)} {
        ${members}
        }`
}

export function generateTableInterface (tableNameRaw: string, tableDefinition: TableDefinition, options: Options) {
    const tableName = options.transformTypeName(tableNameRaw)
    let members = ''
    Object.keys(tableDefinition).map(c => options.transformColumnName(c)).forEach((columnName) => {
        members += `${columnName}: ${tableName}Fields.${normalizeName(columnName, options)};\n`
    })


    return ` export interface ${normalizeName(tableName, options)} {
        ${members}
        }
    `
}

export function generateEnumType (enumObject: any, options: Options) {
    let enumString = ''
    for (let enumNameRaw in enumObject) {
        const enumName = options.transformTypeName(enumNameRaw)
        enumString += `export type ${enumName} = `
        enumString += enumObject[enumNameRaw].map((v: string) => `'${v}'`).join(' | ')
        enumString += ';\n'
    }
    return enumString
}

export function generateTableTypes (tableNameRaw: string, tableDefinition: TableDefinition, options: Options) {
    const tableName = options.transformTypeName(tableNameRaw)
    let fields = ''
    Object.keys(tableDefinition).forEach((columnNameRaw) => {
        let type = tableDefinition[columnNameRaw].tsType
        //let nullable = tableDefinition[columnNameRaw].nullable ? '| null' : ''
        let nullable = tableDefinition[columnNameRaw].nullable ? '' : ''
        const columnName = options.transformColumnName(columnNameRaw)
        fields += `export type ${normalizeName(columnName, options)} = ${type}${nullable};\n`
    })

    return `
        export namespace ${tableName}Fields {
        ${fields}
        }
    `
}
