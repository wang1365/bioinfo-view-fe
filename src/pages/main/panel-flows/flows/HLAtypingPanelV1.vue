<template>
    <div class="q-pa-md">
        <q-stepper
            v-model="step"
            header-nav
            ref="stepper"
            done-color="deep-orange"
            active-color="purple"
            inactive-color="secondary"
            animated
        >
            <q-step
                :name="1"
                title="Select campaign settings"
                active-icon="looks_one"
                icon="looks_one"
                :done="0"
            >
                For each ad campaign that you create, you can control how much
                you're willing to spend on clicks and conversions, which
                networks and geographical locations you want your ads to show
                on, and more.

                <q-stepper-navigation>
                    <q-btn
                        @click="
                            () => {
                                done1 = true;
                                step = 2;
                            }
                        "
                        color="primary"
                        label="下一步"
                    />
                </q-stepper-navigation>
            </q-step>

            <q-step
                :name="2"
                title="Create an ad group"
                caption="Optional"
                active-icon="looks_two"
                icon="looks_two"
                :done="0"
            >
                An ad group contains one or more ads which target a shared set
                of keywords.

                <q-stepper-navigation>
                    <q-btn
                        @click="
                            () => {
                                done2 = true;
                                step = 3;
                            }
                        "
                        color="primary"
                        label="下一步"
                    />
                    <q-btn
                        flat
                        @click="step = 1"
                        color="primary"
                        label="后退"
                        class="q-ml-sm"
                    />
                </q-stepper-navigation>
            </q-step>

            <q-step
                :name="3"
                title="Create an ad"
                active-icon="looks_3"
                icon="looks_3"
                :done="0"
            >
                Try out different ad text to see what brings in the most
                customers, and learn how to enhance your ads using features like
                ad extensions. If you run into any problems with your ads, find
                out how to tell if they're running and how to resolve approval
                issues.

                <q-stepper-navigation>
                    <q-btn
                        color="negative"
                        @click="
                            done3 = true;
                            icon = true;
                        "
                        label="使用流程"
                    />
                    <q-btn
                        flat
                        @click="step = 2"
                        color="primary"
                        label="后退"
                        class="q-ml-sm"
                    />
                </q-stepper-navigation>
            </q-step>
        </q-stepper>
    </div>
    <q-dialog v-model="icon">
        <q-card>
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6">Exome Plus Panel v2.0</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum
                repellendus sit voluptate voluptas eveniet porro. Rerum
                blanditiis perferendis totam, ea at omnis vel numquam
                exercitationem aut, natus minima, porro labore.
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script setup>
import { ref } from "vue";

const step = ref(1);
const icon = ref(false);

const steps = ref([]);
</script>
