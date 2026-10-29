// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockComponent, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import TableOfContents from '../../app/components/TableOfContents.vue'

const { fetchCatalogue } = vi.hoisted(() => ({ fetchCatalogue: vi.fn() }))
mockNuxtImport('useFetch', () => fetchCatalogue)
mockComponent('NuxtLink', () => ({ props: ['to'], template: '<a :href="to"><slot /></a>' }))
async function mountCatalogue() {
  const wrapper = mount({
    components: { TableOfContents },
    template: '<Suspense><TableOfContents /></Suspense>',
  })
  await flushPromises()
  return wrapper
}
describe('database course catalogue', () => {
  beforeEach(() => {
    fetchCatalogue.mockReturnValue({
      data: ref([
        {
          id: 'section-id',
          title: 'Database section',
          chapters: [{ title: 'Database chapter', slug: 'chapter-1' }],
        },
      ]),
      status: ref('success'),
      error: ref(null),
      refresh: vi.fn(),
    })
  })

  it('renders fetched names and allows sections to collapse', async () => {
    const wrapper = await mountCatalogue()
    expect(fetchCatalogue.mock.calls.at(-1)?.[0]).toBe('/api/course-titles')
    expect(wrapper.get('h2').text()).toBe('Database section')
    expect(wrapper.get('li').text()).toBe('Database chapter')
    expect(wrapper.get('li a').attributes('href')).toBe('/chapters/chapter-1')
    const toggle = wrapper.get('h2 button')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('shows an empty state instead of hardcoded chapters', async () => {
    fetchCatalogue.mockReturnValue({ data: ref([]), status: ref('success'), error: ref(null) })
    const wrapper = await mountCatalogue()
    expect(wrapper.text()).toContain('No chapters are available yet.')
    expect(wrapper.find('li').exists()).toBe(false)
  })

  it('offers a retry when fetching fails', async () => {
    const refresh = vi.fn()
    fetchCatalogue.mockReturnValue({
      data: ref(null),
      status: ref('error'),
      error: ref(new Error('Unavailable')),
      refresh,
    })
    const wrapper = await mountCatalogue()
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load chapters.')
    await wrapper.get('button').trigger('click')
    expect(refresh).toHaveBeenCalledOnce()
  })
})
