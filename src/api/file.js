import { api } from 'src/boot/axios'

export function readFileFromDatabaseDir(path) {
    return api({
        url: `/file/database/read`,
        method: 'get',
        params: {
            path,
        },
    })
}
