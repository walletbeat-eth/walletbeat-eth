import type React from 'react'
import { Box, Typography, Tooltip } from '@mui/material'
import { WalletAttribute } from '@/ui/organisms/WalletAttribute'
import { RenderTypographicContent } from '@/ui/atoms/RenderTypographicContent'
import { VariantPicker } from '@/ui/atoms/VariantPicker'
import { blend } from '@mui/system'
import theme from '@/components/ThemeRegistry/theme'
import {
    type AttributeGroup,
    type EvaluatedAttribute,
    type EvaluatedGroup,
    Rating,
    ratingToColor,
    type Value,
    type ValueSet,
} from '@/schema/attributes'
import { VariantSpecificity, type ResolvedWallet } from '@/schema/wallet'
import {
    variantToIcon,
} from '@/components/variants'
import { isNonEmptyArray, nonEmptyValues, nonEmptyMap } from '@/types/utils/non-empty'
import { mapAttributeGroups, getEvaluationFromOtherTree } from '@/schema/attribute-groups'

// eslint-disable-next-line @typescript-eslint/max-params
export function mapAttributeGroupsHelper(
    evalTree: any,
    wallet: any,
    attrToRelevantVariants: Map<string, any>,
    needsVariantFiltering: boolean,
    pickedVariant: any,
    updatePickedVariant: (variant: any) => void,
    sections: any[],
): void {
    mapAttributeGroups(
        evalTree,
        <Vs extends ValueSet>(attrGroup: AttributeGroup<Vs>, evalGroup: EvaluatedGroup<Vs>) => {
            const section = {
                header: attrGroup.id,
                subHeader: null,
                title: attrGroup.displayName,
                icon: attrGroup.icon,
                cornerControl: null,
                caption: (
                    <RenderTypographicContent
                        content={attrGroup.perWalletQuestion.render(wallet.metadata)}
                        typography={{
                            variant: 'caption',
                            fontStyle: 'italic',
                        }}
                    />
                ),
                body: null,
                subsections: mapGroupAttributes<RichSection | null, Vs>(
                    evalGroup,
                    <V extends Value>(evalAttr: EvaluatedAttribute<V>): RichSection | null => {
                        if (evalAttr.evaluation.value.rating === Rating.EXEMPT) {
                            return null
                        }
                        const relevantVariants: Variant[] =
                            attrToRelevantVariants.get(evalAttr.attribute.id) ?? []
                        const {
                            cornerControl,
                            body,
                        }: {
                            cornerControl: React.ReactNode
                            body: React.ReactNode
                        } = (() => {
                            if (!needsVariantFiltering || relevantVariants.length === 0) {
                                return {
                                    cornerControl: null,
                                    body: (
                                        <WalletAttribute
                                            wallet={wallet}
                                            attrGroup={attrGroup}
                                            evalGroup={evalGroup}
                                            evalAttr={evalAttr}
                                            displayedVariant={pickedVariant}
                                            variantSpecificity={VariantSpecificity.ALL_SAME}
                                        />
                                    ),
                                }
                            }
                            if (relevantVariants.length === 1) {
                                const VariantIcon = variantToIcon(relevantVariants[0])
                                return {
                                    cornerControl: (
                                        <Tooltip
                                            title={`Only rated on the ${variantToName(relevantVariants[0], false)} version`}
                                            arrow={true}
                                        >
                                            <Box
                                                key="variantSpecificEval"
                                                display="flex"
                                                flexDirection="row"
                                                alignItems="center"
                                                gap="0.25rem"
                                            >
                                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                    Only
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        opacity: 0.7,
                                                        lineHeight: 1,
                                                        color: blend(
                                                            theme.palette.primary.light,
                                                            ratingToColor(evalAttr.evaluation.value.rating),
                                                            0.25,
                                                            1,
                                                        ),
                                                    }}
                                                >
                                                    <VariantIcon />
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    ),
                                    body: (
                                        <WalletAttribute
                                            wallet={wallet}
                                            attrGroup={attrGroup}
                                            evalGroup={evalGroup}
                                            evalAttr={evalAttr}
                                            displayedVariant={relevantVariants[0]}
                                            variantSpecificity={VariantSpecificity.ONLY_ASSESSED_FOR_THIS_VARIANT}
                                        />
                                    ),
                                }
                            }
                            const pickerVariants = nonEmptyValues<Variant, ResolvedWallet>(
                                wallet.variants,
                            ).filter(
                                resolvedWallet =>
                                    resolvedWallet.variant === pickedVariant ||
                                    relevantVariants.includes(resolvedWallet.variant),
                            )
                            if (!isNonEmptyArray(pickerVariants)) {
                                throw new Error(
                                    `Found no relevant variants to pick from in ${wallet.metadata.id} with picked variant ${pickedVariant}`,
                                )
                            }
                            return {
                                cornerControl: (
                                    <Box
                                        key="variantSpecificEval"
                                        display="flex"
                                        flexDirection="row"
                                        alignItems="center"
                                        gap="0.25rem"
                                    >
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                            {pickedVariant === null ? 'Version' : 'Viewing'}:
                                        </Typography>
                                        <VariantPicker
                                            pickerId={`variantSpecificEval-${evalAttr.attribute.id}`}
                                            variants={nonEmptyMap(
                                                pickerVariants,
                                                (variantWallet: ResolvedWallet): PickableVariant<Variant> => {
                                                    const variantRating = getEvaluationFromOtherTree<V>(
                                                        evalAttr,
                                                        variantWallet.attributes,
                                                    ).evaluation.value.rating
                                                    return {
                                                        id: variantWallet.variant,
                                                        icon: variantToIcon(variantWallet.variant),
                                                        colorTransform: (color: string | undefined): string =>
                                                            blend(
                                                                color ?? theme.palette.primary.light,
                                                                ratingToColor(variantRating),
                                                                0.25,
                                                                1,
                                                            ),
                                                        tooltip:
                                                            pickedVariant !== null && pickedVariant === variantWallet.variant
                                                                ? 'Remove version filter'
                                                                : `View rating for ${variantToName(variantWallet.variant, false)} version`,
                                                        click: () => {
                                                            updatePickedVariant(
                                                                pickedVariant === variantWallet.variant
                                                                    ? null
                                                                    : variantWallet.variant,
                                                            )
                                                        },
                                                    }
                                                },
                                            )}
                                            pickedVariant={pickedVariant}
                                        />
                                    </Box>
                                ),
                                body: (
                                    <WalletAttribute
                                        wallet={wallet}
                                        attrGroup={attrGroup}
                                        evalGroup={evalGroup}
                                        evalAttr={evalAttr}
                                        displayedVariant={pickedVariant}
                                        variantSpecificity={VariantSpecificity.NOT_UNIVERSAL}
                                    />
                                ),
                            }
                        })()
                        return {
                            header: attrGroup.id,
                            subHeader: evalAttr.attribute.id,
                            title: evalAttr.attribute.displayName,
                            icon: evalAttr.evaluation.value.icon ?? evalAttr.attribute.icon,
                            cornerControl,
                            sx: {
                                backgroundColor: blend(
                                    theme.palette.background.paper,
                                    ratingToColor(evalAttr.evaluation.value.rating),
                                    0.2,
                                    1,
                                ),
                            },
                            caption: (
                                <RenderTypographicContent
                                    content={evalAttr.attribute.question.render(wallet.metadata)}
                                    typography={{
                                        variant: 'caption',
                                        fontStyle: 'italic',
                                    }}
                                />
                            ),
                            body,
                        }
                    },
                ).filter(subsection => subsection !== null),
            }
            if (section.subsections.length > 0) {
                sections.push(section)
            }
        },
    )
}