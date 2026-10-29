// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockComponent, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import TableOfContents from '../../app/components/TableOfContents.vue'

const { fetchCatalogue, fetchProgress } = vi.hoisted(() => ({
  fetchCatalogue: vi.fn(),
  fetchProgress: vi.fn(),
}))
mockNuxtImport(
  'useFetch',
  () =>
    (...args: unknown[]) =>
      args[0] === '/api/userlessons' ? fetchProgress(...args) : fetchCatalogue(...args)
)
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
    fetchProgress.mockReturnValue({ data: ref({ chapters: [] }), error: ref(null) })
    fetchCatalogue.mockReturnValue({
      data: ref([
        {
          id: 'section-id',
          title: 'Database section',
          chapters: [{ id: 'chapter-id', title: 'Database chapter', slug: 'chapter-1' }],
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

  it('combines database chapter links with completion progress by chapter ID', async () => {
    fetchProgress.mockReturnValue({
      data: ref({
        chapters: [{ id: 'chapter-id', name: 'Different stored name', completed: true }],
      }),
      error: ref(null),
    })
    const wrapper = await mountCatalogue()
    expect(wrapper.get('li').classes()).toContain('text-brand-500')
    expect(wrapper.get('li a').attributes('href')).toBe('/chapters/chapter-1')
    expect(wrapper.get('h2 button').attributes('aria-expanded')).toBe('false')
  })

  it('keeps the database catalogue visible if progress fails', async () => {
    fetchProgress.mockReturnValue({ data: ref(null), error: ref(new Error('Unavailable')) })
    const wrapper = await mountCatalogue()
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load course progress.')
    expect(wrapper.get('li a').text()).toBe('Database chapter')
    expect(wrapper.get('li').classes()).toContain('text-gray-700')
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
