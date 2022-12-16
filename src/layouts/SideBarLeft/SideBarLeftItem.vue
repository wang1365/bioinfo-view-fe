<template v-if="hasPermission">
    <component
        v-if="hasPermission"
        :is="chooseComponent"
        :addRoutesItem="addRoutesItem"
        :initLevel="initLevel"
    >
        <template v-if="addRoutesItem.children && addRoutesItem.children.length">
            <SideBarLeftItem
                :key="item.path"
                :addRoutesItem="item"
                v-for="item in addRoutesItem.children"
                :initLevel="initLevel + 0.3"
            />
        </template>
    </component>
</template>

<script setup>
import ItemSingle from './ItemSingle'
import ItemMultiple from './ItemMultiple'
import { computed, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import { globalStore } from 'src/stores/global'

const store = globalStore()
const { currentUser } = storeToRefs(store)

const props = defineProps({
    addRoutesItem: {
        default: function () {
            return null
        },
        type: Object,
    },
    initLevel: {
        type: Number,
        default: 0,
    },
})
const { addRoutesItem, initLevel } = toRefs(props)
const chooseComponent = computed(() => {
    if (addRoutesItem.value?.children?.length) {
        return ItemMultiple
    } else {
        return ItemSingle
    }
})

const hasPermission = () => {
    console.log('==> 菜单权限check')
    const roles = addRoutesItem.roles
    console.log('==> 菜单权限check：', addRoutesItem)
    if (_.isEmpty(roles)) {
        return true
    }

    const currentUserRoles = currentUser.role_list
    if (_.isEmpty(currentUserRoles)) {
        return false
    }

    for (let role of roles) {
        if (currentUserRoles.includes(role)) {
            return true
        }
    }
    return false
}
</script>
