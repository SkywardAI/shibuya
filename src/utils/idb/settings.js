export const DEFAULT_TABLE_SETTINGS = { autoIncrement: true }

export const DB_NAME = 'shibuya-idb'

export const versions = [
    {
        version: 1,
        tables: {
            'chat-history': {
                op: 'new',
                columns: [
                    { name: 'title' },
                    { name: 'uid' },
                    { name: 'createdAt' },
                    { name: 'updatedAt' },
                ]
            },
            'messages': {
                op: 'new',
                columns: [
                    { name: 'history-uid' },
                    { name: 'role' },
                    { name: 'content' },
                    { name: 'createdAt' }
                ]
            }
        }
    }
]