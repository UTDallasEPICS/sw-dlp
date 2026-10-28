// @vitest-environment nuxt

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime'
import Login from '../../../app/pages/login.vue'

// Mock functions
const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  navigate: vi.fn(),
  toast: vi.fn(),
}))

// Mock authentication
vi.mock('../../../app/utils/auth-client', () => ({
  authClient: {
    signIn: {
      emailOtp: mocks.verify,
    },
  },
}))

// Mock navigation and notifications
mockNuxtImport('navigateTo', () => mocks.navigate)
mockNuxtImport('useToast', () => () => ({
  add: mocks.toast,
}))

// Mock session endpoint for authentication middleware
registerEndpoint('/api/auth/get-session', () => null)

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.verify.mockResolvedValue({ error: null })
  })

  // Test 1: Verification heading
  it('displays the verification code heading', async () => {
    const wrapper = await mountSuspended(Login)

    expect(wrapper.text()).toContain('Enter verification code')
  })

  // Test 2: Email address
  it('displays the user email address', async () => {
    const wrapper = await mountSuspended(Login, {
      route: '/login?email=sally@example.com',
    })

    expect(wrapper.text()).toContain('sally@example.com')
  })

  // Test 3: Login button
  it('displays the login button', async () => {
    const wrapper = await mountSuspended(Login)

    expect(wrapper.text()).toContain('Login')
  })

  // Test 4: Change email button
  it('displays the change email button', async () => {
    const wrapper = await mountSuspended(Login)

    expect(wrapper.text()).toContain('Change email')
  })

  // Test 5: OTP verification
  it('verifies the six-digit OTP', async () => {
    const wrapper = await mountSuspended(Login, {
      route: '/login?email=sally@example.com',
    })

    await wrapper.findComponent({ name: 'UPinInput' }).setValue(['1', '2', '3', '4', '5', '6'])

    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => {
      expect(mocks.verify).toHaveBeenCalledWith({
        email: 'sally@example.com',
        otp: '123456',
      })
    })
  })

  // Test 6: Successful login
  it('redirects to dashboard after successful verification', async () => {
    const wrapper = await mountSuspended(Login, {
      route: '/login?email=sally@example.com',
    })

    await wrapper.findComponent({ name: 'UPinInput' }).setValue(['1', '2', '3', '4', '5', '6'])

    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  // Test 7: Invalid OTP
  it('shows an error when OTP verification fails', async () => {
    mocks.verify.mockResolvedValue({
      error: { message: 'Invalid verification code' },
    })

    const wrapper = await mountSuspended(Login, {
      route: '/login?email=sally@example.com',
    })

    await wrapper.findComponent({ name: 'UPinInput' }).setValue(['1', '2', '3', '4', '5', '6'])

    await wrapper.find('form').trigger('submit')

    await vi.waitFor(() => {
      expect(mocks.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Invalid verification code',
        color: 'error',
      })
    })
  })

  // Test 8: Change email navigation
  it('navigates back when change email is clicked', async () => {
    const wrapper = await mountSuspended(Login)

    await wrapper.get('button[type="button"]').trigger('click')

    expect(mocks.navigate).toHaveBeenCalledWith('/auth')
  })
})
