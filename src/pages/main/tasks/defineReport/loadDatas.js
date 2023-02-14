import { api } from 'src/boot/axios'

export async function readTaskMuFile(id, name) {
    let data= await api({
        url: `/task/${id}/mufile/`,
        method: 'get',
        params: {
            name,
        },
    })
    console.log(data)
    return data
}
export async function mutationLoadGermlineData(taskId){
    let res = await readTaskMuFile(taskId,'Mut_germline')
    console.log('mutationLoadGermlineData',res)
}