/* eslint-disable max-depth -- TODO */ 
import type { RichSection } from "@/types/schema"

interface FAQSchemaEntry {
	'@type': 'Question'
	name: string
	acceptedAnswer: {
		'@type': 'Answer'
		text: string
	}
}

export const generateFaqSchema = (sections: RichSection[], walletName: string): string => {
	// Extract questions and answers from sections
	const faqEntries: FAQSchemaEntry[] = []

	// Process all sections except the first one (details section)
	for (const section of sections.slice(1)) {
		// Only include sections with subsections
		if ((section.subsections != null) && section.subsections.length > 0) {
			// For each attribute in the section, create a FAQ entry
			for (const subsection of section.subsections) {
				// Safely check for caption and body
				if (subsection.caption !== null && subsection.body !== null) {
					try {
						// Get a reasonable question text
						const questionText =
							typeof subsection.title === 'string' && subsection.title !== ''
								? subsection.title
								: 'Feature question'

						// Get a reasonable answer text
						const answerText = `${walletName} supports this feature.`

						// Add to FAQ entries
						faqEntries.push({
							'@type': 'Question',
							name: questionText,
							acceptedAnswer: {
								'@type': 'Answer',
								text: answerText,
							},
						})
					} catch (error) {
						if (process.env.NODE_ENV !== 'production') {
							// eslint-disable-next-line no-console -- We are only logging in dev/testing
							console.error('Error creating FAQ entry:', error)
						}
					}
				}
			}
		}
	}

	// Create the complete FAQ schema
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqEntries,
	}

	return JSON.stringify(faqSchema)
}
