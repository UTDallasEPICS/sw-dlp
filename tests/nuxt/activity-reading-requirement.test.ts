// @vitest-environment happy-dom
import { mockComponent, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { ref } from 'vue'
import ChapterPage from '../../app/pages/chapters/[slug].vue'
import { visibleProgressStep } from '../../shared/utils/readingPages'

const { request, progress, route, navigate } = vi.hoisted(() => ({
  request: vi.fn(),
  progress: { steps: [] as string[], hasActivity: true },
  route: { params: { slug: 'chapter-1' }, query: {} as { step?: string } },
  navigate: vi.fn(),
}))

mockNuxtImport('$fetch', () => request)
mockNuxtImport('useRoute', () => () => route)
mockNuxtImport('navigateTo', () => navigate)
mockNuxtImport('useAsyncData', () => () => ({
  data: ref({
    chapter: { title: 'Chapter 1', videos: [], body: {
      value: [['p', {}, 'First'], ['p', {}, '<--next-->'], ['p', {}, 'Second']],
    } },
    availableSlugs: ['introduction', 'section-1-overview', 'chapter-1', 'wrap-up', 'action-plan'],
  }),
}))
mockNuxtImport('useFetch', () => (url: string) => ({
  data: ref(url.endsWith('/activity-exists') ? { hasActivity: progress.hasActivity }
    : url.endsWith('/progress') ? { completedSteps: progress.steps.map(visibleProgressStep).filter(Boolean) }
    : url === '/api/course-titles' ? [{ chapters: [{ slug: 'introduction' }, { slug: 'chapter-1' }] }]
    : null),
}))
mockComponent('ContentRenderer', () => ({ template: '<div />' }))
mockComponent('UButton', () => ({ template: '<button><slot /></button>' }))
mockComponent('UIcon', () => ({ template: '<span />' }))

it.each([
  { steps: [], label: '0 of 2', locked: true },
  { steps: ['reading-1', 'reading-2'], label: '0 of 2', locked: true },
  { steps: ['reading-scroll-1', 'reading-2'], label: '1 of 2', locked: true },
  { steps: ['reading-scroll-1', 'reading-scroll-2'], label: '2 of 2', locked: false },
])('shows $label completed and sets activity lock to $locked', async ({ steps, label, locked }) => {
  progress.steps = steps
  request.mockReset()
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const wrapper = mount({ components: { ChapterPage }, template: '<Suspense><ChapterPage /></Suspense>' })
  try {
    await flushPromises()
    const next = () => wrapper.get('button[aria-label="Next step"]')
    await next().trigger('click')
    await next().trigger('click')
    expect(request).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain(label + ' reading pages completed')
    const submit = wrapper.findAll('button').find((button) => button.text() === 'Submit Activity')
    expect(submit).toBeDefined()
    expect(submit?.element.disabled).toBe(locked)
    if (!steps.includes('reading-scroll-2')) {
      expect(wrapper.get('button[aria-label="Reading 2"]').classes()).toContain('text-gray-400')
    }
  } finally {
    wrapper.unmount()
    scroll.mockRestore()
  }
})

it('opens the previous chapter at its last step from the first step', async () => {
  const wrapper = mount({ components: { ChapterPage }, template: '<Suspense><ChapterPage /></Suspense>' })
  try {
    await flushPromises()
    const previous = wrapper.get('button[aria-label="Previous chapter"]')
    expect(previous.attributes('disabled')).toBeUndefined()
    await previous.trigger('click')
    expect(navigate).toHaveBeenCalledWith({ path: '/chapters/section-1-overview', query: { step: 'last' } })
  } finally {
    wrapper.unmount()
  }
})

it('starts on the final step when arriving from the next chapter', async () => {
  route.query.step = 'last'
  const wrapper = mount({ components: { ChapterPage }, template: '<Suspense><ChapterPage /></Suspense>' })
  try {
    await flushPromises()
    expect(wrapper.get('button[aria-label="Activity"]').attributes('aria-current')).toBe('step')
    await wrapper.get('button[aria-label="Previous step"]').trigger('click')
    expect(wrapper.find('article').exists()).toBe(true)
  } finally {
    wrapper.unmount()
    delete route.query.step
  }
})

it('records reaching the final page of a chapter without a quiz', async () => {
  progress.hasActivity = false
  progress.steps = []
  request.mockReset()
  const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const wrapper = mount({ components: { ChapterPage }, template: '<Suspense><ChapterPage /></Suspense>' })
  try {
    await flushPromises()
    expect(request).not.toHaveBeenCalled()
    await wrapper.get('button[aria-label="Next step"]').trigger('click')
    await flushPromises()
    expect(request).toHaveBeenCalledExactlyOnceWith('/api/chapters/chapter-1/progress', {
      method: 'POST',
      body: { stepId: 'reading-visit-2' },
    })
    expect(wrapper.text()).toContain('Scroll to finish reading')
  } finally {
    wrapper.unmount()
    scroll.mockRestore()
    progress.hasActivity = true
  }
})
