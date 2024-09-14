import { useEffect, useState } from 'react';
import { DB_NAME, DEFAULT_TABLE_SETTINGS, versions } from './settings';
import { formatSelect, testWhere } from './tools';

let comps = [];

const defaultOptions = {
    select: null,
    where: null,
}

class IDB {
    constructor() {
        this.table_key_format = {};

        versions.forEach(tables=>{
            for(const name in tables) {
                const {init} = tables[name];
                this.table_key_format[name] = init && init.keyPath ? 'inline' : 'outline';
            }
        })
    }

    /**
     * Init database so that we can interact with it
     * @returns {Promise<boolean>} `true` if init success, `false` otherwise
     */
    initDB() {
        return new Promise(resolve=>{
            const latest = versions.length;
            const req = window.indexedDB.open(DB_NAME, latest);
    
            req.onsuccess = () => {
                this.instance = req.result;
                resolve(true);
            }
    
            req.onerror = () => {
                resolve(false);
            }
    
            req.onupgradeneeded = (ev) => {
                const dbVersion = req.result;
                const {oldVersion} = ev;
                versions.forEach((tables, index)=>{
                    const version = index+1
                    if(oldVersion >= version) return;
    
                    for(const name in tables) {
                        const {op, columns, init} = tables[name];
                        if(op === 'delete') {
                            dbVersion.deleteObjectStore(name);
                            return;
                        }
                        let tb = op === 'new' ? 
                            dbVersion.createObjectStore(name, init || DEFAULT_TABLE_SETTINGS) :
                            req.transaction.objectStore(name)
                        
                        if(!tb) return;
    
                        columns.forEach(({name, op, settings})=>{
                            if(!op || op === 'new') {
                                tb.createIndex(name, settings);
                            }if(op === 'delete') {
                                tb.deleteIndex(name)
                            }
                        })
                    }
                })
            }
        })
    }

    _getTable(table, mode = 'readonly') {
        return this.instance.transaction(table, mode).objectStore(table);
    }
    
    // CURD

    /**
     * 
     * @param {String} table  table name to do operation
     * @param {"select-one"|"delete-one"|"delete-all"|"update-one"|"update-all"} op 
     * @param {*} where 
     */
    _forEach(table, op, where = null, value = {}) {
        return new Promise(resolve=>{
            const tbl = this._getTable(table, op === "select-one" ? 'readonly' :'readwrite')
            const req = tbl.openCursor();

            let resolved = false;

            req.onsuccess = () => {
                try {
                    const cursor = req.result;
                    if(cursor && !resolved) {
                        if(testWhere(where, cursor.value)) {
                            switch(op) {
                                case "select-one":
                                    resolve(cursor.value); return;
                                case "delete-one":
                                    cursor.delete().onsuccess = () => {
                                        resolve(true);
                                        resolved = true;
                                    }; return;
                                case "update-one":
                                    cursor.update({...cursor.value, ...value}).onsuccess = () => {
                                        resolve(true);
                                        resolved = true;
                                    }; return;
                                case 'delete-all':
                                    cursor.delete().onerror = () => {
                                        resolve(false);
                                        resolved = true;
                                    };
                                    cursor.continue(); return;
                                case 'update-all':
                                    cursor.update({...cursor.value, ...value}).onerror = () => {
                                        resolve(false);
                                        resolved = true;
                                    };
                                    cursor.continue(); return;
                                default:
                                    cursor.continue(); return;
                            }
                        } else cursor.continue();
                    } else {
                        resolve(op.endsWith('all') || null)
                        return;
                    }
                } catch(error) {
                    console.error(error);
                    resolve(null);
                }
            }

            req.onerror = () => {
                resolve(null);
            }
        })
    }

    /**
     * @typedef QueryOptions
     * @property {String[]|null} select list of keys to be selected
     * @property {Array<Array<Object>|Object>|null} where list of key-value pairs, where `array` means `OR` and `object` means `AND`.
     */
    
    /**
     * Retrieve all records in given table, applies `select` and `where` conditions if given.
     * @param {String} table Table name to query from 
     * @param {QueryOptions} options keys to select, other keys will be ignored.
     * @returns {Promise<Object[]>}
     */
    getAll(table, options = {}) {
        return new Promise(resolve=>{
            options = {...defaultOptions, ...options};
            const req = this._getTable(table, 'readonly').getAll();
        
            req.onsuccess = () => {
                let results = req.result;
                if(!results) resolve(null);
                if(!results.length) resolve(results);
    
                if(options.where) {
                    results = results.filter(e=>testWhere(options.where, e))
                }
                if(options.select) {
                    results = results.map(e=>formatSelect(options.select, e))
                }
                resolve(results);
            }
    
            req.onerror = () => {
                resolve(null);
            }
        })
    }
    
    /**
     * Retrieve the first records in given table, applies `select` and `where` conditions if given.
     * @param {String} table Table name to query from 
     * @param {QueryOptions} options keys to select, other keys will be ignored.
     * @returns {Promise<Object>}
     */
    getOne(table, options = {}) {
        return new Promise(resolve=>{
            options = {...defaultOptions, ...options};
            // const tbl = this._getTable(table, 'readonly')
    
            // const req = tbl.openCursor();
            // req.onsuccess = () => {
            //     const cursor = req.result;
            //     const current = cursor.value;
            //     if(!options.where) {
            //         resolve(current);
            //     } else {
            //         if(testWhere(options.where, current)) {
            //             resolve(
            //                 options.select ? 
            //                 formatSelect(options.select, current) : current
            //             );
            //         } else {
            //             cursor.continue();
            //         }
            //     }
            // }
    
            // req.onerror = () => {
            //     resolve(null);
            // }
            this._forEach(table, 'select-one', options.where).then(result=>{
                resolve(result ? formatSelect(options.select, result) : null);
            })
        })
    }
    
    /**
     * Retrieve the record with given `id`
     * @param {String} table Table name to query from 
     * @param {any} id The value of primary key
     * @param {String[]|null} select list of keys to be selected
     * @returns {Promise<Object>}
     */
    getByID(table, id, select = null) {
        return new Promise(resolve=>{
            const req = this._getTable(table, 'readonly').get(id);
            req.onsuccess = () => resolve(formatSelect(select, req.result));
            req.onerror = () => resolve(null);
        })
    }

    insert(table, column, id = null) {
        return new Promise(resolve=>{
            const tbl = this._getTable(table, 'readwrite')
            let req;
            if(this.table_key_format[table] === 'inline' || !id) {
                if(id) column = {...column, [tbl.keyPath]: id}
                req = tbl.add(column)
            } else {
                req = tbl.add(column, id)
            }
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        })
    }

    updateOne(table, column, where) {
        return new Promise(resolve=>{
            this._forEach(table, 'update-one', where, column).then(resolve);
        })
    }

    updateAll(table, column, where = null) {
        return new Promise(resolve=>{
            this._forEach(table, 'update-all', where, column).then(resolve);
        })
    }

    async updateByID(table, id, column, no_auto_insert = false) {
        const record = await this.getByID(table, id);
        if(!record && no_auto_insert) return false;
        return new Promise(resolve=>{
            const tbl = this._getTable(table, 'readwrite');
            let req;
            if(this.table_key_format[table] === 'inline') {
                if(!record) {
                    req = tbl.put({...column, [tbl.keyPath]: id})
                } else {
                    req = tbl.put({...record, ...column});
                }
            } else {
                req = tbl.put({...(record || {}), ...column}, id);
            }
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(false);
        })
    }

    deleteOne(table, where) {
        return new Promise(resolve=>{
            this._forEach(table, 'delete-one', where).then(resolve);
        })
    }

    deleteAll(table, where) {
        return new Promise(resolve=>{
            this._forEach(table, 'delete-all', where).then(resolve);
        })
    }

    deleteByID(table, id) {
        return new Promise(resolve=>{
            const req = this._getTable(table, 'readwrite').delete(id);
            req.onsuccess = () => resolve(true);
            req.onerror = () => resolve(false);
        })
    }

    clearTable(table) {
        return new Promise(resolve=>{
            const req = this._getTable(table, 'readwrite').clear();
            req.onsuccess = () => resolve(true);
            req.onerror = () => resolve(false);
        })
    }

    reopen() {
        this.instance.close();
        this.initDB();
    }
}

export const instance = new IDB();

export default function useIDB() {
    const [idb, setIDB] = useState(instance);

    useEffect(()=>{
        comps.includes(setIDB) || comps.push(setIDB);
        return ()=>{
            comps = comps.filter(e=>e!==setIDB);
        }
    }, [])

    return idb;
}