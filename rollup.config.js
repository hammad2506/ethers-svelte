export default [
  {
    input: "./src/ethers-store.js",
    output: [
      { file: "dist/index.mjs", format: "es" },
      { file: "dist/index.js", format: "umd", name: "ethersstore" },
    ],
  },
];
