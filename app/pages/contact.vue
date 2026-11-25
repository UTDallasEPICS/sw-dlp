<script setup lang="ts">
  useHead({ title: 'Contact | Stronger Women' })
</script>

<template>
  <section aria-labelledby="contact-heading" class="bg-brand-600 py-12 sm:py-16 lg:py-24">
    <UContainer class="grid max-w-5xl items-center gap-8 md:grid-cols-[2fr_3fr] md:gap-12">
      <h1 id="contact-heading" class="text-4xl font-bold text-white sm:text-5xl">Contact Us</h1>

      <address class="divide-brand-100 divide-y rounded-3xl bg-white px-5 py-2 not-italic sm:px-8">
        <a
          href="tel:+14693078488"
          class="group flex items-center gap-3 rounded-lg py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:gap-4"
        >
          <span class="bg-brand-50 text-brand-600 grid size-10 shrink-0 place-items-center rounded-full">
            <UIcon name="i-lucide-phone" class="size-5" aria-hidden="true" />
          </span>
          <span class="min-w-0">
            <span class="block text-sm text-gray-600">Phone</span>
            <span class="text-brand-700 block font-semibold group-hover:underline sm:text-lg">
              (469) 307-8488
            </span>
          </span>
        </a>
        <a
          href="mailto:help@strongerwomen.com"
          class="group flex items-center gap-3 rounded-lg py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:gap-4"
        >
          <span class="bg-brand-50 text-brand-600 grid size-10 shrink-0 place-items-center rounded-full">
            <UIcon name="i-lucide-mail" class="size-5" aria-hidden="true" />
          </span>
          <span class="min-w-0">
            <span class="block text-sm text-gray-600">Email</span>
            <span class="text-brand-700 block font-semibold wrap-anywhere group-hover:underline sm:text-lg">
              help@strongerwomen.com
            </span>
          </span>
        </a>
      </address>
    </UContainer>
  </section>
</template>
