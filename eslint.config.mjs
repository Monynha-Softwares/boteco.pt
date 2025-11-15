import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    ignores: ["node_modules", ".next", "legacy/node_modules"],
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/unsupported-syntax": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
    },
  },
];
