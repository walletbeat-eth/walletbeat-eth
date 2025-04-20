import type { Paper } from "@mui/material"

export interface Section {
	header: string
	subHeader: string | null
}

export interface RichSection extends Section {
	icon: React.ReactNode
	title: string
	cornerControl: React.ReactNode | null
	caption: React.ReactNode | null
	body: React.ReactNode | null
	sx?: React.ComponentProps<typeof Paper>['sx']
	subsections?: RichSection[] // Only one level of nesting is supported.
}