<script setup lang="ts">
    import {ref} from 'vue'

    /* Props for question number, total questions, and prompt used for embedding the variables from the pages folder into the multiple-choice question component.
    This allows for dynamic question rendering based on the page context. */
    defineProps({
        questionNumber: {
            type: Number,
            required: true
        },
        totalQuestions: {
            type: Number,
            required: true
        },
        prompt: {
            type: String,
            required: true
        },
        options: {
            type: Array as () => string[],
            required: true,
            validator: (value: string[]) => {
                return value.length >= 2
            }
        }
    })

    /* Emits for updating the selected option in the parent component. 
    This allows for two-way data binding between the multiple-choice question component and its parent. */

    const emit = defineEmits(['update:modelValue'])

    /* Ref for the selected option. 
    This is used to track which option the user has selected and to apply appropriate styling. */

    const selectedOption = ref<string | null>(null)
    
    const selectOption = (option: string) => {
        selectedOption.value = option
        emit('update:modelValue', option)
    }
    

</script>

<template>
        <div class="rounded-2xl border border-pink-100 bg-white p-6 shadow-[0_0_24px_rgba(224,0,77,0.12)]">
            <h1 class = "text-lg text-gray-900">
                <b>Question {{ questionNumber }} of {{ totalQuestions }}:</b>
            </h1>

            <h3 class = "mt-3 text-base leading-relaxed text-black">
                {{ prompt }}
            </h3>

            <div class = "flex flex-col space-y-3 mt-5">
                <button 
                v-for="(option, index) in options"
                :key="index"
                class="text-left w-full md:w-auto border border-gray-300 rounded-lg hover:border-brand-500 hover:ring-2 hover:ring-brand-500/30 px-3 py-2"
                :class="selectedOption === option ? 'bg-brand-500 text-white' : ''"
                @click="selectOption(option)">
                    {{ option }}
                </button>
            </div>
        </div>

</template>