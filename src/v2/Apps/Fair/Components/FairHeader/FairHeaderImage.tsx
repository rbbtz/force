import styled from "styled-components"
import React from "react"
import { ResponsiveValue, system } from "styled-system"
import { Box, Image as __Image__ } from "@artsy/palette"
import { Media } from "v2/Utils/Responsive"
import { createFragmentContainer, graphql } from "react-relay"
import { FairHeaderImage_fair } from "v2/__generated__/FairHeaderImage_fair.graphql"
import { FairHeaderIconFragmentContainer as FairHeaderIcon } from "./FairHeaderIcon"

const ratioPadding = system({
  ratio: {
    property: "paddingBottom",
    transform: n => n * 100 + "%",
  },
})

const AspectRatioBox = styled(Box)<{ ratio?: ResponsiveValue<number> }>`
  position: relative;
  ${ratioPadding}
`

const Container = styled(Box)`
  overflow: hidden;
`

const Image = styled(__Image__)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  img {
    object-fit: cover;
  }
`

interface FairHeaderImageProps {
  fair: FairHeaderImage_fair
}

const ASPECT_WIDTH = 3
const ASPECT_HEIGHT = 4
const HEIGHT_VH = 70
const WIDTH_VH = (ASPECT_WIDTH / ASPECT_HEIGHT) * HEIGHT_VH

export const FairHeaderImage: React.FC<FairHeaderImageProps> = ({
  fair,
  fair: { name, image },
}) => {
  if (!image) return null

  return (
    <>
      <Media at="xs">
        <Box position="relative" mx={-2}>
          <AspectRatioBox ratio={ASPECT_HEIGHT / ASPECT_WIDTH} bg="black10">
            <Image
              src={image._1x.src}
              srcSet={`${image._1x.src} 1x, ${image._2x.src} 2x`}
              alt={name}
              lazyLoad
            />

            <FairHeaderIcon fair={fair} />
          </AspectRatioBox>
        </Box>
      </Media>

      <Media greaterThan="xs">
        <Container
          position="relative"
          mx="auto"
          maxWidth="100%"
          bg="black10"
          width={`${WIDTH_VH}vh`}
          height={`${HEIGHT_VH}vh`}
        >
          <picture>
            <source
              srcSet={`${image.lg_1x.src} 1x, ${image.lg_2x.src} 2x`}
              media="(min-height: 900px)"
            />

            <source srcSet={`${image.md_1x.src} 1x, ${image.md_2x.src} 2x`} />

            <Image src={image.md_1x.src} alt={name} lazyLoad />
          </picture>
          <FairHeaderIcon fair={fair} />
        </Container>
      </Media>
    </>
  )
}

export const FairHeaderImageFragmentContainer = createFragmentContainer(
  FairHeaderImage,
  {
    fair: graphql`
      fragment FairHeaderImage_fair on Fair {
        ...FairHeaderIcon_fair
        name
        image {
          # xs
          _1x: cropped(width: 375, height: 500, version: "wide") {
            src: url
            width
            height
          }
          _2x: cropped(width: 750, height: 1000, version: "wide") {
            src: url
          }
          # > xs
          md_1x: cropped(width: 600, height: 800, version: "wide") {
            src: url
          }
          md_2x: cropped(width: 1200, height: 1600, version: "wide") {
            src: url
          }
          lg_1x: cropped(width: 900, height: 1200, version: "wide") {
            src: url
          }
          lg_2x: cropped(width: 1800, height: 2400, version: "wide") {
            src: url
          }
        }
      }
    `,
  }
)
