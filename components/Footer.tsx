"use client";

import { useState } from "react";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const legalDisclaimerContent = `# Legal Disclaimer

The information provided by Synth Patch Library ("we," "us," or "our") on www.synth-patch-library.com (the "Site") is for general informational and educational purposes only.

All information on the Site, including but not limited to patch configurations, module schematics, audio samples, user-generated content, and technical documentation, is provided in good faith. However, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.

## User-Generated Content

The Site allows users to create, share, and access electronic music patches, module configurations, and related content. All user-generated content, including patch schemas, audio samples, images, descriptions, and comments, is the responsibility of the individual users who create and share such content. We do not endorse, verify, or guarantee the accuracy, safety, or effectiveness of any user-generated content.

## Technical and Safety Information

UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SITE OR RELIANCE ON ANY INFORMATION PROVIDED ON THE SITE. YOUR USE OF THE SITE AND YOUR RELIANCE ON ANY INFORMATION ON THE SITE IS SOLELY AT YOUR OWN RISK.

This includes, but is not limited to:
- Damage to electronic equipment or synthesizers
- Loss of data or corrupted patch files
- Electrical damage or safety hazards
- Incompatibility with your specific hardware or software
- Any financial loss resulting from the use of shared patches or configurations

## Data Storage and Security

We are not responsible or liable for any loss or corruption of data, including but not limited to patch configurations, user preferences, audio samples, images, or any other data stored or managed through the Site. Users are strongly advised to maintain their own backups of any important information, patches, or configurations. Data storage relies on third-party providers, and we cannot guarantee the security, integrity, or availability of the data.

## Intellectual Property

Users retain ownership of their original patch creations and content. By sharing content on the Site, users grant us a non-exclusive license to display, distribute, and store such content for the purpose of operating the Site. Users are responsible for ensuring they have the right to share any content they upload, including respect for third-party intellectual property rights.

## External Links and Third-Party Content

The Site may contain (or you may be sent through the Site) links to other websites, audio samples, or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.

## Audio and Media Content

Any audio samples, sound files, or media content shared on the Site may be subject to copyright protection. Users are responsible for ensuring they have the legal right to share such content. We do not monitor or verify the copyright status of shared audio content.

## Professional Advice

The information on this Site is not intended as professional audio engineering, electrical engineering, or legal advice. For professional applications, users should consult with qualified professionals in the relevant fields.

## Limitation of Liability

To the fullest extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Site.

## Changes to Terms

We reserve the right to modify or replace this disclaimer at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.

## Contact Information

If you have any questions about this Legal Disclaimer, please contact us through the Site's contact form.

© 2025 www.synth-patch-library.com - All rights reserved.

---

*Last updated: October 2025*`;

export function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      <footer className="bg-gray-800 text-white mt-12 sm:mt-16 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm sm:text-base">
            &copy; 2025 Synth Patch Library. All rights reserved.{" "}
            <button
              onClick={openModal}
              className="underline hover:text-gray-300 transition-colors"
            >
              Legal Disclaimer
            </button>
          </p>
        </div>
      </footer>

      {/* Legal Disclaimer Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Legal Disclaimer</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h1:text-2xl prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-p:text-gray-700 prose-p:mb-3 prose-li:text-gray-700 prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:mb-4 prose-ol:mb-4">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                        {children}
                      </h2>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-1">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-700">
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {legalDisclaimerContent}
                </ReactMarkdown>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="w-full bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
