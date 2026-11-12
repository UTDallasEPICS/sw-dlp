<script setup lang="ts">
    import {ref} from 'vue'

    /* Props for question number, total questions, and prompt used for embedding the variables from the pages folder into the multiple-choice question component.
    This allows for dynamic question rendering based on the page context. */
    const props = defineProps({
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
        },
        correctAnswer: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ''
        },
        showResults: { 
            type: Boolean, 
            default: false 
        }
    })

    /* Emits for updating the selected option in the parent component. 
    This allows for two-way data binding between the multiple-choice question component and its parent. */

    const emit = defineEmits(['update:modelValue'])

    /* Ref for the selected option. 
    This is used to track which option the user has selected and to apply appropriate styling. */

    const selectedOption = ref<string | null>(null)
    
    const answered = computed(() => selectedOption.value !== null)
    const isCorrect = computed(() => selectedOption.value === props.correctAnswer)  

    const selectOption = (option: string) => {
        // Only block changes after results are shown
        if (props.showResults) return
        selectedOption.value = option
        emit('update:modelValue', option)
    }

    const optionState = (option: string) => {
        if (!answered.value) return ''
        // After submitting, shows correct/wrong answer
        if (props.showResults) {
            if (option === props.correctAnswer) return 'correct'
            if (option === selectedOption.value) return 'wrong'
            return 'dimmed'
        }
        // Before submitting, marks the one they clicked
        if (option === selectedOption.value) return 'selected'
        return ''
    }

    const optionClasses = (option: string) => {
        switch (optionState(option)) {
            case 'correct':
                return 'border-2 border-brand-500 bg-pink-50 text-black'
            case 'wrong':
                return 'border-red-500 bg-pink-50 text-black'
            case 'dimmed':
                return 'border-gray-300 bg-gray-100 text-gray-500'
            case 'selected':
                return 'border-brand-500 bg-pink-50 text-black ring-2 ring-brand-500/30'
            default:
                // Hover effect only while the question is still open
                return props.showResults
                    ? 'border border-gray-300'
                    : 'border border-gray-300 hover:border-2 hover:border-brand-500 hover:ring-2 hover:ring-brand-500/30'
        }
    }
</script>

<template>
        <div class="rounded-2xl border border-pink-100 bg-white p-6 shadow-[0_0_24px_rgba(0,0,0,0.20)]">
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
                :disabled="showResults"
                class="text-left w-full border rounded-lg border px-3 py-2 transition-colors"
                :class="optionClasses(option)"
                @click="selectOption(option)">
                    <span>{{ option }}</span>
                    <!-- The Icon only appears after answering the questions and submitting-->
                     <span v-if="showResults && answered" class="ml-3 text-lg leading-none">
                        <span v-if="optionState(option) === 'correct'" class="text-brand-500">✓</span>
                        <span v-else-if="optionState(option) === 'wrong'" class="text-red-500">✗</span>
                        <span v-else class="text-gray-500">✗</span>
                     </span>
                </button>
                <!-- Feedback only after submitting -->
                <div
                    v-if="showResults && answered"
                    class="mt-5 rounded-lg border p-3 text-sm font-semibold"
                    :class="isCorrect ? 'border-brand-500 bg-pink-50 text-brand-600' : 'border-red-600 bg-pink-50 text-red-600'"
                >
                    <span v-if="isCorrect">Correct! {{ description }}</span>
                    <span v-else>Incorrect. The correct answer is: {{ props.correctAnswer }}, because {{ description }}</span>
                </div>
                
            </div>
        </div>

</template>