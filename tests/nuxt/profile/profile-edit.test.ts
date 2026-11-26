// tests/nuxt/profile/profile-edit.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

import ProfileEditPage from '~/pages/profile-edit/[field].vue'

const originalProfile = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  phoneNumber: '5125551234',
}

const { mockUseFetch, mockNavigateTo, mockFetch, mockUseRoute } = vi.hoisted(() => ({
  mockUseFetch: vi.fn(),
  mockNavigateTo: vi.fn(),
  mockFetch: vi.fn(),
  mockUseRoute: vi.fn(),
}))

mockNuxtImport('useFetch', () => mockUseFetch)
mockNuxtImport('navigateTo', () => mockNavigateTo)
mockNuxtImport('$fetch', () => mockFetch)
mockNuxtImport('useRoute', () => mockUseRoute)

describe('Profile Edit Page', () => {
  let wrapper: any

  async function mountForField(field: 'name' | 'email' | 'phoneNumber') {
    mockUseRoute.mockReturnValue({
      params: { field },
    })

    mockUseFetch.mockReturnValue({
      data: ref({ ...originalProfile }),
      refresh: vi.fn().mockResolvedValue(undefined),
      status: ref('success'),
      error: ref(null),
    })

    mockFetch.mockReset()
    mockFetch.mockResolvedValue({ ...originalProfile })
    mockNavigateTo.mockReset()

    wrapper = await mountSuspended(ProfileEditPage)
    await flushPromises()
    await nextTick()
  }

  async function setFieldValue(value: string) {
    const input = wrapper.find('[data-testid="field-input"]')
    expect(input.exists()).toBe(true)
    await input.setValue(value)
    await nextTick()
    await flushPromises()
  }

  async function clickSave() {
    const form = wrapper.find('form')
    if (form.exists()) {
      await form.trigger('submit.prevent')
    } else {
      await wrapper.find('[data-testid="save-button"]').trigger('click')
    }
    await flushPromises()
  }

  async function clickBack() {
    await wrapper.find('[data-testid="back-button"]').trigger('click')
    await flushPromises()
  }

  // Cancel / Back navigation ----------------------------------------------------------

  it('can enter editing and cancel (go back) for name', async () => {
    await mountForField('name')
    await setFieldValue('Changed Name')
    await clickBack()

    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('can enter editing and cancel (go back) for email', async () => {
    await mountForField('email')
    await setFieldValue('new@example.com')
    await clickBack()

    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('can enter editing and cancel (go back) for phone number', async () => {
    await mountForField('phoneNumber')
    await setFieldValue('7375551234')
    await clickBack()

    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // -------------------------------------------------
  // Name
  // -------------------------------------------------

  it('can change name to 1 or more characters', async () => {
    await mountForField('name')
    await setFieldValue('Jane Doe')
    await clickSave()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users/currentUser',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.objectContaining({
          name: 'Jane Doe',
        }),
      }),
    )
    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
  })

  it('cannot change name to only whitespace', async () => {
    await mountForField('name')
    await setFieldValue('   ')
    await clickSave()

    expect(wrapper.text()).toMatch(/name is required/i)
    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('cannot change name to empty string', async () => {
    await mountForField('name')
    await setFieldValue('')
    await clickSave()

    expect(wrapper.text()).toMatch(/name is required/i)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // Phone number -------------------------------------------------

  it('can change phone number to nothing (remove it)', async () => {
    await mountForField('phoneNumber')
    await setFieldValue('')
    await clickSave()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users/currentUser',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.objectContaining({
          phoneNumber: null,
        }),
      }),
    )
    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
  })

  it('can change phone number to a new one that is not in use', async () => {
    await mountForField('phoneNumber')
    await setFieldValue('7375551234')
    await clickSave()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users/currentUser',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.objectContaining({
          phoneNumber: '7375551234',
        }),
      }),
    )
    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
  })

  it('rejects a phone number that is already in use', async () => {
    await mountForField('phoneNumber')
    
    mockFetch.mockRejectedValueOnce({
      data: { statusMessage: 'Phone number is already in use, please enter another number' },
    })
    
    await setFieldValue('5125559999')
    await clickSave()

    await nextTick()
    await flushPromises()

    expect(wrapper.text()).toMatch(/already in use/i)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('accepts and truncates a +1 country code (11 digits starting with 1)', async () => {
    // Server normalizes +1 / leading 1 → 10-digit number
    await mountForField('phoneNumber')
    await setFieldValue('17375551234') // or '+17375551234'
    await clickSave()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users/currentUser',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.objectContaining({
          // client sends the raw value; server does the truncation
          phoneNumber: '17375551234',
        }),
      }),
    )
  })

  it('rejects numbers that are clearly not a valid US 10-digit number (server-side)', async () => {
    mockFetch.mockRejectedValueOnce({
      data: { statusMessage: 'Phone number must contain 10 digits' },
    })

    await mountForField('phoneNumber')
    await setFieldValue('12345') // too short after normalization
    await clickSave()

    expect(wrapper.text()).toMatch(/phone number must contain 10 digits|valid phone number/i)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  // Email -------------------------------------------------

  it('can change email to a new one not in use and request OTP', async () => {
    await mountForField('email')
    await setFieldValue('newemail@example.com')
    await clickSave()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/email-otp/request-email-change',
      expect.objectContaining({
        method: 'POST',
        body: { newEmail: 'newemail@example.com' },
      }),
    )
    expect(wrapper.find('[data-testid="otp-input"]').exists()).toBe(true)
    // should NOT navigate yet
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('accepts email change when the correct OTP is provided', async () => {
    await mountForField('email')
    await setFieldValue('newemail@example.com')
    await clickSave() // request OTP

    expect(wrapper.find('[data-testid="otp-input"]').exists()).toBe(true)

    const otpInput = wrapper.find('[data-testid="otp-input"]')
    await otpInput.setValue('123456')
    await nextTick()
    await clickSave() // verify

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
    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
  })

  it('rejects email change with wrong OTP and still allows resubmit', async () => {
    await mountForField('email')
    await setFieldValue('newemail@example.com')
    await clickSave() // request OTP

    // first attempt – wrong code
    mockFetch.mockRejectedValueOnce({
      data: { statusMessage: 'Invalid OTP' },
    })

    let otpInput = wrapper.find('[data-testid="otp-input"]')
    await otpInput.setValue('000000')
    await clickSave()

    expect(wrapper.text()).toMatch(/invalid otp/i)
    expect(wrapper.find('[data-testid="otp-input"]').exists()).toBe(true)
    expect(mockNavigateTo).not.toHaveBeenCalled()

    // second attempt – correct code
    mockFetch.mockResolvedValueOnce({}) // change-email succeeds
    otpInput = wrapper.find('[data-testid="otp-input"]')
    await otpInput.setValue('123456')
    await clickSave()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/email-otp/change-email',
      expect.objectContaining({
        body: expect.objectContaining({ otp: '123456' }),
      }),
    )
    expect(mockNavigateTo).toHaveBeenCalledWith('/profile')
  })

  it('rejects email change if the address is already in use', async () => {
    await mountForField('email')
    mockFetch.mockRejectedValueOnce({
      data: { statusMessage: 'This email address is already in use.' },
    })

    await setFieldValue('taken@example.com')
    await clickSave()

    expect(wrapper.text()).toMatch(/this email address is already in use/i)
    expect(wrapper.find('[data-testid="otp-input"]').exists()).toBe(false)
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('rejects an invalid email format', async () => {
    await mountForField('email')
    await setFieldValue('not-an-email')
    await clickSave()

    expect(wrapper.text()).toMatch(/enter a valid email address/i)
    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })
})