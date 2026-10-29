// @vitest-environment nuxt
//
// A component test for the application shell (app/app.vue). It renders the real
// component in the Nuxt environment, stubs out page routing, and proves the two
// always-present pieces of the shell work: the logo links home, and the main
// navigation exposes the dashboard route.
//
// This test never opens the database, reads an env file, sends email, or makes a
// network request. Those integrations are intentionally out of scope for the
// baseline (see docs/testing.md).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import App from '../../app/app.vue'

describe('application shell (app.vue)', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Arrange: watch the global fetch so each test can prove the shell renders
    // without reaching the network. spyOn keeps the original implementation, so
    // a real request would still be recorded (and fail the assertion below).
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('links the logo to the home route', async () => {
    // Act: mount the shell, stubbing <NuxtPage /> so no page/route is loaded.
    const wrapper = await mountSuspended(App, {
      global: { stubs: { NuxtPage: true } },
    })

    const logoLink = wrapper.get('a[href="/"]')
    expect(logoLink.get('img').attributes('alt')).toBe('Stronger Women')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('exposes the dashboard in the main navigation', async () => {
    const wrapper = await mountSuspended(App, {
      global: { stubs: { NuxtPage: true } },
    })

    const mainNavigation = wrapper.get('nav[aria-label="Main navigation"]')
    expect(mainNavigation.get('a[href="/dashboard"]').text()).toBe('Dashboard')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
