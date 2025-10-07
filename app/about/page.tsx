"use client";

import { useState } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Navbar } from '@/components/Navbar';
import { Mail, Heart, Loader2, Copy, Check } from 'lucide-react';

function ContactFormContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Execute reCAPTCHA
      if (!executeRecaptcha) {
        setSubmitStatus({ type: 'error', message: 'reCAPTCHA not available. Please refresh the page.' });
        setIsSubmitting(false);
        return;
      }

      const recaptchaToken = await executeRecaptcha('contact_form');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Message sent successfully! We\'ll get back to you soon.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Failed to send message. Please try again.' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const copyToClipboard = async (text: string, addressType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(addressType);
      setTimeout(() => setCopiedAddress(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to Synth Patch Library - keep track of your modular patches.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            Never lose a patch idea again!
          </p>
          <p className="text-gray-700 mb-4">
            Whether you are just starting your modular journey or you are a seasoned patch designer, 
            this web app is here to allow you to track your patches and enjoy your module collection to the fullest.
          </p>
        
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
          </div>
          
          {submitStatus && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Support This Project</h2>
          </div>
          
          <p className="text-gray-700 mb-6">
            This web app is free to use and open for everyone. If you find it useful and would like to support 
            its development and maintenance, please make a donation. Your support helps to keep the servers 
            running!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PayPal Donation */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donate via PayPal</h3>
              <p className="text-sm text-gray-600 mb-4">
                Support us with a donation through PayPal.
              </p>
              <form action="https://www.paypal.com/donate" method="post" target="_top">
                <input type="hidden" name="business" value="RPUSXUVPEDRWC" />
                <input type="hidden" name="no_recurring" value="0" />
                <input type="hidden" name="item_name" value="founder of Synth Patch Library" />
                <input type="hidden" name="currency_code" value="CHF" />
                <input 
                  type="image" 
                  src="https://www.paypalobjects.com/en_US/CH/i/btn/btn_donateCC_LG.gif"
                  name="submit" 
                  title="PayPal - The safer, easier way to pay online!" 
                  alt="Donate with PayPal button"
                  className="border-0 hover:opacity-80 transition-opacity"
                />
                <img 
                  alt="" 
                  src="https://www.paypal.com/en_CH/i/scr/pixel.gif" 
                  width={1} 
                  height={1}
                  className="border-0"
                />
              </form>

            </div>

            {/* Crypto Donation */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donate via Cryptocurrency</h3>
              <p className="text-sm text-gray-600 mb-4">
                Support us with a cryptocurrency donation.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Bitcoin (BTC)</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 p-2 rounded font-mono overflow-x-auto">
                      <div className="text-[11px] whitespace-nowrap">
                        {process.env.NEXT_PUBLIC_BTC_ADDRESS || 'BTC address not configured'}
                      </div>
                    </div>
                    {process.env.NEXT_PUBLIC_BTC_ADDRESS && (
                      <button
                        onClick={() => copyToClipboard(process.env.NEXT_PUBLIC_BTC_ADDRESS!, 'btc')}
                        className="flex-shrink-0 p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                        title="Copy BTC address"
                      >
                        {copiedAddress === 'btc' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Ethereum (ETH)</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 p-2 rounded font-mono overflow-x-auto">
                      <div className="text-[11px] whitespace-nowrap">
                        {process.env.NEXT_PUBLIC_ETH_ADDRESS || 'ETH address not configured'}
                      </div>
                    </div>
                    {process.env.NEXT_PUBLIC_ETH_ADDRESS && (
                      <button
                        onClick={() => copyToClipboard(process.env.NEXT_PUBLIC_ETH_ADDRESS!, 'eth')}
                        className="flex-shrink-0 p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                        title="Copy ETH address"
                      >
                        {copiedAddress === 'eth' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

export default function AboutPage() {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaSiteKey) {
    console.warn('reCAPTCHA site key not configured');
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey || 'test-key'}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      <ContactFormContent />
    </GoogleReCaptchaProvider>
  );
}

