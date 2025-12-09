import { useRef, useState, useEffect } from 'react'

import siteMetadata from '@/data/siteMetadata'
import { announceToScreenReader } from '@/lib/focus-management'

const NewsletterForm = ({ title = 'Subscribe to the newsletter' }) => {
  const inputEl = useRef(null)
  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const formId = 'newsletter-form'

  const subscribe = async (e) => {
    e.preventDefault()

    const email = inputEl.current.value.trim()

    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError(true)
      setMessage('Please enter a valid email address')
      announceToScreenReader('Form error: Please enter a valid email address', 'assertive')

      // Focus back to the email input
      if (inputEl.current) {
        inputEl.current.focus()
      }
      return
    }

    try {
      const res = await fetch(`/api/${siteMetadata.newsletter.provider}`, {
        body: JSON.stringify({ email }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const result = await res.json()

      if (result.error) {
        setError(true)
        setMessage(result.error || 'Your e-mail address is invalid or you are already subscribed!')
        announceToScreenReader(`Form error: ${result.error || 'Subscription failed'}`, 'assertive')

        // Focus back to the email input
        if (inputEl.current) {
          inputEl.current.focus()
        }
        return
      }

      // Success
      inputEl.current.value = ''
      setError(false)
      setSubscribed(true)
      setMessage('Successfully! 🎉 You are now subscribed.')
      announceToScreenReader(
        'Subscription successful! You are now subscribed to the newsletter.',
        'polite'
      )
    } catch (err) {
      setError(true)
      setMessage('Something went wrong. Please try again later.')
      announceToScreenReader(
        'Form error: Something went wrong. Please try again later.',
        'assertive'
      )

      if (inputEl.current) {
        inputEl.current.focus()
      }
    }
  }

  return (
    <div>
      <div className="pb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</div>
      <form
        id={formId}
        className="flex flex-col sm:flex-row"
        onSubmit={subscribe}
        noValidate
        aria-label="Newsletter subscription form"
      >
        <div className="flex flex-col">
          <label
            htmlFor="email-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email address
          </label>
          <input
            autoComplete="email"
            className="w-72 rounded-md px-4 py-2 border border-gray-300 dark:border-gray-600 focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-primary-600 dark:bg-black text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            id="email-input"
            name="email"
            type="email"
            placeholder={subscribed ? "You're subscribed! 🎉" : 'Enter your email address'}
            ref={inputEl}
            required
            disabled={subscribed}
            aria-invalid={error}
            aria-describedby={error ? `${formId}-error` : `${formId}-help`}
          />
          <div id={`${formId}-help`} className="sr-only">
            Enter your email address to subscribe to our newsletter
          </div>
        </div>
        <div className="mt-2 flex w-full rounded-md shadow-xs sm:mt-0 sm:ml-3 sm:mt-0">
          <button
            className={`w-full rounded-md bg-primary-500 py-2 px-4 font-medium text-white sm:py-0 transition-colors duration-200 ${
              subscribed
                ? 'cursor-default opacity-75'
                : 'hover:bg-primary-700 dark:hover:bg-primary-400 focus:bg-primary-600 dark:focus:bg-primary-500'
            } focus:outline-hidden focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed`}
            type="submit"
            disabled={subscribed}
            aria-busy={subscribed}
          >
            <span className="sr-only">
              {subscribed ? 'Form submitted, thank you' : 'Submit newsletter subscription'}
            </span>
            {subscribed ? 'Thank you!' : 'Sign up'}
          </button>
        </div>
      </form>
      {error && (
        <div
          id={`${formId}-error`}
          className="w-72 pt-2 text-sm text-red-600 dark:text-red-400 sm:w-96"
          role="alert"
          aria-live="polite"
        >
          <span className="sr-only">Error: </span>
          {message}
        </div>
      )}
    </div>
  )
}

export default NewsletterForm

export const BlogNewsletterForm = ({ title }) => (
  <div className="flex items-center justify-center">
    <div className="bg-gray-100 p-6 dark:bg-gray-800 sm:px-14 sm:py-8">
      <NewsletterForm title={title} />
    </div>
  </div>
)
