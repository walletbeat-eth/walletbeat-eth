import type { RichSection } from "@/types/schema"
import { Box } from "@mui/system"

export const ConditionalCornerControl = ({
	section,
	anchorHeader,
}: {
	section: RichSection
	anchorHeader: React.JSX.Element
}): React.JSX.Element => {
	if (section.cornerControl === null) {
		return anchorHeader
	}
	return (
		<Box key="sectionCornerControl" display="flex" flexDirection="row">
			<Box flex="1" display="flex" flexDirection="column" justifyContent="center">
				{anchorHeader}
			</Box>
			<Box flex="0" flexDirection="column" justifyContent="center">
				{section.cornerControl}
			</Box>
		</Box>
	)
}