import { variantToRunsOn, variantToName } from "@/components/variants";
import type { Variant } from "@/schema/variants";
import type { RatedWallet } from "@/schema/wallet";
import type { RichSection } from "@/types/schema";
import { type NonEmptyArray, nonEmptyMap, nonEmptyKeys } from "@/types/utils/non-empty";
import { commaListPrefix } from "@/types/utils/text";
import { ExternalLink } from "@/ui/atoms/ExternalLink";
import { RenderTypographicContent } from "@/ui/atoms/RenderTypographicContent";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import LanguageIcon from '@mui/icons-material/Language'
import GitHubIcon from '@mui/icons-material/GitHub'

export const getSection = ({
	wallet,
	needsVariantFiltering,
	pickedVariant
}: {
	wallet: RatedWallet;
	needsVariantFiltering: boolean;
	pickedVariant: Variant | null
}): NonEmptyArray<RichSection> => [
	{
		header: 'details',
		subHeader: null,
		title: 'Details',
		cornerControl: null,
		caption: null,
		icon: '\u{2139}', // Info
		body: (
			<>
				<RenderTypographicContent
					content={wallet.metadata.blurb.render({})}
					typography={{ variant: 'body1' }}
				/>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						gap: '16px',
						marginTop: '24px',
						marginBottom: '24px',
						alignItems: 'center',
						flexWrap: 'wrap',
						padding: '12px',
						backgroundColor: 'rgba(50, 50, 50, 0.35)',
						border: '1px solid var(--border)',
						borderRadius: '8px',
						'.dark &': {
							backgroundColor: 'rgba(189, 159, 224, 0.15)',
						},
					}}
				>
					<Typography variant="body1" fontWeight="medium">
						Links:
					</Typography>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						<LanguageIcon fontSize="small" sx={{ color: 'var(--accent)' }} />
						<ExternalLink
							url={wallet.metadata.url}
							defaultLabel={`${wallet.metadata.displayName} website`}
							style={{ fontWeight: 500 }}
						/>
					</Box>

					{wallet.metadata.repoUrl !== null && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<GitHubIcon fontSize="small" sx={{ color: 'var(--accent)' }} />
							<ExternalLink
								url={wallet.metadata.repoUrl}
								defaultLabel="GitHub Repository"
								style={{ fontWeight: 500 }}
							/>
						</Box>
					)}
				</Box>
				<Typography variant="body1">
					<React.Fragment key="begin">{wallet.metadata.displayName} runs </React.Fragment>
					{nonEmptyMap(nonEmptyKeys(wallet.variants), (variant, variantIndex) => (
						<React.Fragment key={variant}>
							{commaListPrefix(variantIndex, Object.keys(wallet.variants).length)}
							<strong>{variantToRunsOn(variant)}</strong>
						</React.Fragment>
					))}
					<React.Fragment key="afterVariants">.</React.Fragment>
					{needsVariantFiltering && (
						<React.Fragment key="variantSpecifier">
							<React.Fragment key="variantDisclaimer">
								{' '}
								The ratings below vary depending on the version.{' '}
							</React.Fragment>
							{pickedVariant === null ? (
								<React.Fragment key="variantReminder">
									Select a version to see version-specific ratings.
								</React.Fragment>
							) : (
								<React.Fragment key="variantReminder">
									You are currently viewing the ratings for the{' '}
									<strong>{variantToName(pickedVariant, false)}</strong> version.
								</React.Fragment>
							)}
						</React.Fragment>
					)}
				</Typography>
			</>
		),
	},
];