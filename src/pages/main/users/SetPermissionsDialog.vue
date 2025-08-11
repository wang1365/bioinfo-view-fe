<template>
    <q-dialog v-bind="$attrs" ref="dlg" persistent>
        <q-card class="shadow-24" style="width: 800px">
            <q-card-section class="row items-center">
                <span
                    class="q-ml-xs text-primary text-weight-bolder"
                    >{{ $t('PermissionSettings') + ': ' +  props.user.username }}</span
                >
            </q-card-section>

            <q-card-section>
                <q-separator color="primary" />
                <div class="q-ml-lg row items-center">
                    <span class="text-primary col-2">{{$t('Project')+':'}}</span>
                    <q-checkbox class="col-4" v-model="permissions.createProject" :label="$t('Add')+$t('Project')" />
                    <q-checkbox class="col" v-model="permissions.deleteProject" :label="$t('Delete')+$t('Project')" />
                </div>
                <q-separator />
                <div class="q-ml-lg row items-center q-mt-sm">
                    <span class="text-primary col-2">{{$t('Report')+':'}}</span>
                    <q-checkbox class="col-4" v-model="permissions.createReport" :label="$t('Add')+$t('Report')" />
                    <q-checkbox class="col" v-model="permissions.deleteReport" :label="$t('Delete')+$t('Report')" />
                </div>
                <q-separator />
                <div class="q-ml-lg row items-center q-mt-sm">
                    <span class="text-primary col-2">{{$t('Task')+':'}}</span>
                    <q-checkbox class="col-4" v-model="permissions.createTask" :label="$t('Add')+$t('Task')" />
                    <q-checkbox class="col" v-model="permissions.deleteTask" :label="$t('Delete')+$t('Task')" />
                    <q-checkbox
                        class="col"
                        v-model="permissions.deleteTaskTmpFile"
                        :label="$t('TaskPageBtnDeleteTmpFile')"
                    />
                </div>
                <q-separator />
                <div class="q-ml-lg row items-center q-mt-sm">
                    <span class="text-primary col-2">{{$t('Sample')+':'}}</span>
                    <q-checkbox class="col-4" v-model="permissions.createSample" :label="$t('Add')+$t('Sample')" />
                    <q-checkbox class="col" v-model="permissions.deleteSample" :label="$t('Delete')+$t('Sample')" />
                </div>
                <q-separator />
                <div class="q-ml-lg row items-center q-mt-sm">
                    <span class="text-primary col-2">{{$t('Data')+':'}}</span>
                    <q-checkbox class="col-4" v-model="permissions.createData" :label="$t('Add')+$t('Data')" />
                    <q-checkbox class="col" v-model="permissions.deleteData" :label="$t('Delete')+$t('Data')" />
                </div>
                <q-separator />
                <div class="q-ml-lg row items-center q-mt-sm">
                    <span class="text-primary col-2 right">{{$t('Patient')+':'}}</span>
                    <q-checkbox class="col-4" v-model="permissions.createPatient" :label="$t('Add')+$t('Patient')" />
                    <q-checkbox class="col" v-model="permissions.deletePatient" :label="$t('Delete')+$t('Patient')" />
                </div>
                <q-separator />
                <div class="q-ml-lg row items-center q-mt-sm">
                    <span class="text-primary col-2">{{$t('User')+':'}}</span>
                    <q-checkbox class="col-4" v-model="permissions.createUser" :label="$t('Add')+$t('User')" />
                    <q-checkbox class="col" v-model="permissions.deleteUser" :label="$t('Delete')+$t('User')" />
                    <q-checkbox class="col" v-model="permissions.resetPassword" :label="$t('ResetPassword')" />
                </div>
                <q-separator />
                <div class="q-ml-lg row items-center q-mt-sm">
                    <span class="text-primary col-2">{{$t('ReferenceGenome')+':'}}</span>
                    <q-checkbox class="col-4" v-model="permissions.viewReferenceGenome" :label="$t('View')" />
                    <q-checkbox class="col" v-model="permissions.createReferenceGenome" :label="$t('Add')" />
                    <q-checkbox class="col" v-model="permissions.deleteReferenceGenome" :label="$t('Delete')" />
                </div>
                <q-separator color="primary" />
            </q-card-section>

            <q-card-actions align="right">
                <q-btn :label="$t('Cancel')" color="primary" v-close-popup />
                <q-btn :label="$t('Confirm')" color="primary" @click="updatePermissions" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { patchUser } from 'src/api/user'; // 假设你有一个patchUser方法来更新用户信息

const { t } = useI18n();
const dlg = ref(null);
const $q = useQuasar();

const props = defineProps({
    // modelValue: Boolean,
    user: Object
});

// const emit = defineEmits(['update:modelValue']);
//
// const visible = computed({
//     get: () => props.modelValue,
//     set: (value) => emit('update:modelValue', value)
// });

const defaultPermissions = {
    createProject: false,
    deleteProject: false,
    createReport: false,
    deleteReport: false,
    createTask: false,
    deleteTask: false,
    deleteTaskTmpFile: false,
    createSample: false,
    deleteSample: false,
    createData: false,
    deleteData: false,
    createPatient: false,
    deletePatient: false,
    createUser: false,
    deleteUser: false,
    resetPassword: false,
    viewReferenceGenome: false,
    createReferenceGenome: false,
    deleteReferenceGenome: false,
};

const permissions = ref({...defaultPermissions, ...props?.user?.permissions});

watch(
    () => props.user,
    (newUser) => {
        if (newUser) {
            permissions.value = {...defaultPermissions, ...newUser.permissions}
        }
    },
    { immediate: true }
);

const updatePermissions = async () => {
    try {
        await patchUser(props.user.id, {
            permissions: permissions.value
        });
        $q.notify({
            type: 'positive',
            message: t('UpdateSuccess')
        });
        dlg.value.hide()
        // emit('update:modelValue', false); // 关闭对话框
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: t('Update') +  t('Failed')
        });
    }
};
</script>

<style scoped lang="scss"></style>
