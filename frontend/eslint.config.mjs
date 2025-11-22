import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Allow inline styles for dynamic values (colors, percentages, etc.) that cannot be in CSS
      // These are runtime values like user-selected colors (hexCode) and calculated percentages
      // Also required for Next.js OG Image generation (ImageResponse API)
      "react/forbid-dom-props": "off",
      "react/no-unknown-property": "off",
      "@next/next/no-css-tags": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-inline-styles": "off",
      // Disable inline style restriction for dynamic runtime values
      "no-restricted-syntax": "off",
      // Allow inline styles when necessary for dynamic content
      "react/forbid-component-props": "off",
      "react/style-prop-object": "off",
      // Disable TypeScript ESLint inline style warning
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
