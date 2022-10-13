// q = {
//     _connector: 'OR',
//     _negated: false,
//     args: [
//         {
//             _connector: 'AND',
//             _negated: false,
//             args: [
//                 ['email', 'admin'],
//                 {
//                     _connector: 'AND',
//                     _negated: false,
//                     args: [['email', 'admin']],
//                     kwargs: {
//                         password__startswith: 'test',
//                         email: 'testemail',
//                     },
//                 },
//             ],
//             kwargs: {
//                 password__startswith: 'test',
//                 email: 'testemail',
//             },
//         },
//         ['username__in', ['admasdfasdfin', 'xadminxxx']],
//     ],
//     kwargs: {
//         username__in: ['adasdfasdfasdfmin', 'xadminxxx'],
//         password: 'test',
//         create_time__gte: '2022-11-01',
//     },
// }
export function buildModelQuery(args = [], kwargs = {}, connector = 'AND', negated = false) {
    let query = {
        _connector: connector,
        _negated: negated,
        args: args,
        kwargs: kwargs,
    }
    return query
}
