import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

import ProfilePage from '~/pages/profile.vue'

const originalProfile = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  phoneNumber: '5125551234',
  createdAt: 'Oct 8, 2026, 8:00 AM',
  updatedAt: 'Nov 16, 2026, 12:00 PM',
}

const { mockUseFetch, mockNavigateTo, mockFetch } = vi.hoisted(() => ({
  mockUseFetch: vi.fn(),
  mockNavigateTo: vi.fn(),
  mockFetch: vi.fn(),
}))

mockNuxtImport('useFetch', () => mockUseFetch)
mockNuxtImport('navigateTo', () => mockNavigateTo)
mockNuxtImport('$fetch', () => mockFetch)

describe('Profile Page', () => {
  let wrapper: any

  beforeEach(async () => {
    vi.clearAllMocks()

    mockUseFetch.mockReturnValue({
      data: ref({ ...originalProfile }),
      refresh: vi.fn(),
      status: ref('success'),
      error: ref(null),
    })

    mockFetch.mockReset()
    mockFetch.mockResolvedValue({ ...originalProfile })

    wrapper = await mountSuspended(ProfilePage)
    await flushPromises()
  })

  // ---------- helpers ----------
  async function enterEditMode() {
    await wrapper.find('[data-testid="edit-button"]').trigger('click')
    await nextTick()
    await flushPromises()
  }

  async function setField(testId: string, value: string) {
    const input = wrapper.find(`[data-testid="${testId}"]`)
    expect(input.exists()).toBe(true)
    await input.setValue(value)
    await nextTick()
    await flushPromises()
  }

  async function clickSave() {
    const btn = wrapper.find('[data-testid="save-button"]')
    expect(btn.exists()).toBe(true)
    // Prefer form submit so UForm validation + @submit both run
    const form = wrapper.find('form')
    if (form.exists()) {
      await form.trigger('submit.prevent')
    } else {
      await btn.trigger('click')
    }
    await flushPromises()
  }

  // ---------- Editing and canceling ----------

  it('allows editing profile information after clicking Edit', async () => {
    await enterEditMode()

    expect(wrapper.find('[data-testid="name-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="email-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="phone-input"]').exists()).toBe(true)
  })

  it('should allow editing the name and canceling the changes', async () => {
    await enterEditMode()
    await setField('name-input', 'Changed Name')
    await wrapper.find('[data-testid="cancel-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Test User')
    expect(wrapper.text()).not.toContain('Changed Name')
  })

  it('should allow editing the email and canceling the changes', async () => {
    await enterEditMode()
    await setField('email-input', 'newemail@example.com')
    await wrapper.find('[data-testid="cancel-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('test@example.com')
    expect(wrapper.text()).not.toContain('newemail@example.com')
  })

  it('should allow editing the phone number and canceling the changes', async () => {
    await enterEditMode()
    await setField('phone-input', '7375551234')
    await wrapper.find('[data-testid="cancel-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('(512) 555-1234')
    expect(wrapper.text()).not.toContain('(737) 555-1234')
  })

  // ---------- mobile links ----------

  it('links to the name edit page', () => {
    const link = wrapper.find('[data-testid="mobile-edit-name"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/profile-edit/name')
  })

  it('links to the email edit page', () => {
    const link = wrapper.find('[data-testid="mobile-edit-email"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/profile-edit/email')
  })

  it('links to the phone edit page', () => {
    const link = wrapper.find('[data-testid="mobile-edit-phone"]')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/profile-edit/phoneNumber')
  })

  // ---------- Saving ----------

  it('should not make an API call when saving without changes', async () => {
    await enterEditMode()

    const saveButton = wrapper.find('[data-testid="save-button"]')
    expect(saveButton.exists()).toBe(true)
    expect(saveButton.attributes('disabled')).toBeDefined()

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should allow updating a name with one or more characters', async () => {
    await enterEditMode()
    await setField('name-input', 'Jane Doe')
    await clickSave()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users/currentUser',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.objectContaining({
          name: 'Jane Doe',
          phoneNumber: '5125551234',
        }),
      }),
    )
  })

  it('should reject a name with only whitespaces', async () => {
    await enterEditMode()
    await setField('name-input', '  ')
    await clickSave()

    expect(wrapper.text()).toMatch(/name is required/i)
  })

  // ---------- Email ----------

  it('should request an OTP when changing to an available email', async () => {
    await enterEditMode()
    await setField('email-input', 'newemail@example.com')
    await clickSave()

    expect(wrapper.find('[data-testid="otp-input"]').exists()).toBe(true)
  })

  it('should reject an email address that is already in use', async () => {
    mockFetch.mockRejectedValueOnce({
      data: {
        statusMessage: 'This email address is already in use.',
      },
    })

    await enterEditMode()
    await setField('email-input', 'taken@example.com')
    await clickSave()

    expect(wrapper.text()).toMatch(/this email address is already in use/i)
    expect(wrapper.find('[data-testid="otp-input"]').exists()).toBe(false)
  })

  it('should reject an incorrect email verification code', async () => {
    await enterEditMode()
    await setField('email-input', 'newemail@example.com')
    await clickSave() // request OTP

    expect(wrapper.find('[data-testid="otp-input"]').exists()).toBe(true)

    // verification fails
    mockFetch.mockRejectedValueOnce({
      data: {
        statusMessage: 'Invalid OTP',
      },
    })

    await setField('otp-input', '000000')
    await clickSave()

    expect(wrapper.text()).toMatch(/invalid otp/i)
    expect(wrapper.find('[data-testid="otp-input"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('test@example.com')
  })

  it('should update the email after successful OTP verification', async () => {
    await enterEditMode()
    await setField('email-input', 'newemail@example.com')
    await clickSave() // request OTP

    expect(wrapper.find('[data-testid="otp-input"]').exists()).toBe(true)

    await setField('otp-input', '123456')
    await clickSave() // verify + patch

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/email-otp/request-email-change',
      expect.objectContaining({ method: 'POST' }),
    )

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/email-otp/change-email',
      expect.objectContaining({
        method: 'POST',
        body: {
          newEmail: 'newemail@example.com',
          otp: '123456',
        },
      }),
    )

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users/currentUser',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  // ---------- Phone number ----------

  it('should allow removing the phone number', async () => {
    await enterEditMode()
    await setField('phone-input', '')
    await clickSave()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users/currentUser',
      expect.objectContaining({
        method: 'PATCH',
        body: {
          name: 'Test User',
          phoneNumber: null,
        },
      }),
    )
  })

  it('should reject a phone number that is already in use', async () => {
    mockFetch.mockRejectedValueOnce({
      data: {
        statusMessage: 'Phone number is already in use',
      },
    })

    await enterEditMode()
    await setField('phone-input', '5125559999')
    await clickSave()

    expect(wrapper.text()).toMatch(/phone number.*already in use/i)
  })

  it('should allow updating to a phone number that is not in use', async () => {
    await enterEditMode()
    await setField('phone-input', '7375551234')
    await clickSave()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users/currentUser',
      expect.objectContaining({
        method: 'PATCH',
        body: {
          name: 'Test User',
          phoneNumber: '7375551234',
        },
      }),
    )
  })

  // ---------- Navigation ----------

  it('should discard unsaved changes when navigating away', async () => {
    await enterEditMode()
    await setField('name-input', 'Unsaved Name')

    wrapper.unmount()

    expect(mockFetch).not.toHaveBeenCalled()
  })
})