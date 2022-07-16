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
                        label="Continue"
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
                        label="Continue"
                    />
                    <q-btn
                        flat
                        @click="step = 1"
                        color="primary"
                        label="Back"
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
                        color="primary"
                        @click="done3 = true"
                        label="Finish"
                    />
                    <q-btn
                        flat
                        @click="step = 2"
                        color="primary"
                        label="Back"
                        class="q-ml-sm"
                    />
                </q-stepper-navigation>
            </q-step>
        </q-stepper>
    </div>
</template>
<script setup>
import { ref } from "vue";

const step = ref(1);
</script>
