/**
 *
 * @fileoverview Rule to disallow logging passwords
 * Looks for instances of cy.get("input[type=password]") with chainable "type"
 * and ensures that type includes options object with log set to false.
 *
 */

"use strict"

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: "problem",
    fixable: "code",
    schema: [],
  },
  create: function (context) {
    return {
      ImportDeclaration: function (node) {
        const hasPaletteImport =
          node.source &&
          node.source.type === "Literal" &&
          node.source.value === "@artsy/palette"
        if (hasPaletteImport) {
          context.report({
            node,
            message: `Prefer canonical import form for ${node.source.raw} imports: "@artsy/palette/dist/[...]"`,
          })
        }
      },
    }
  },
}
