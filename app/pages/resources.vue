<script setup lang="ts">
  useHead({ title: 'Emergency Resources | Stronger Women' })

  const hotlines = [
    { name: 'National Domestic Violence Hotline', number: '1-800-799-7233', href: 'tel:+18007997233' },
    { name: '988 Suicide & Crisis Lifeline', number: '988', href: 'tel:988?oai_link_source=model_response_hotline' },
    { name: 'National Sexual Assault Hotline', number: '1-800-656-4673', href: 'tel:+18006564673' },
    { name: 'National Human Trafficking Hotline', number: '1-888-373-7888', href: 'tel:+18883737888' },
    {
      name: 'Love Is Respect (Teen Dating Abuse Helpline)',
      number: '1-866-331-9474',
      href: 'tel:+18663319474',
      text: { keyword: 'LOVEIS', number: '22522' },
    },
  ]
</script>

<template>
  <section aria-labelledby="resources-heading">
    <header class="bg-linear-to-r from-brand-900 to-brand-600 py-9 text-white sm:py-12">
      <UContainer class="max-w-5xl">
        <h1 id="resources-heading" class="text-3xl font-bold sm:text-5xl">Emergency Resources</h1>
      </UContainer>
    </header>

    <UContainer class="max-w-5xl py-8 sm:py-12">
      <div class="rounded-xl border border-brand-200 bg-brand-50 px-5 py-4 sm:px-6">
        <p class="text-lg font-semibold text-brand-900">
          If you are in immediate danger in the U.S.,
          <a href="tel:911" class="whitespace-nowrap underline underline-offset-4">call 911</a>.
        </p>
      </div>

      <h2 class="mt-8 text-xl font-bold text-gray-900">U.S. support hotlines</h2>
      <ul class="mt-4 grid gap-4 sm:grid-cols-2">
        <li
          v-for="hotline in hotlines"
          :key="hotline.name"
          class="rounded-xl border border-gray-200 bg-white p-5"
        >
          <h3 class="font-semibold text-gray-900">{{ hotline.name }}</h3>
          <p class="mt-2 text-brand-700">
            Call <a :href="hotline.href" class="font-semibold underline underline-offset-4">{{ hotline.number }}</a>
          </p>
          <p v-if="hotline.text" class="mt-1 text-brand-700">
            <a :href="`sms:${hotline.text.number}`" class="underline underline-offset-4">
              Text {{ hotline.text.keyword }} to {{ hotline.text.number }}
            </a>
          </p>
        </li>
      </ul>
    </UContainer>
  </section>
</template>
