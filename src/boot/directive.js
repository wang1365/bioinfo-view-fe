import Permission from '../directives/permission.js'

// https://vuejs.org/guide/custom-directive.html#custom-directives
// 'my-directive'将用作'v-my-directive'
export default ({ app }) => {
    app.directive('permission', Permission)
}
