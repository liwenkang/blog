---
title: Debugging a Mysterious ESLint Error
date: "2024-09-05"
tags: ["ESLINT", "REACT"]
draft: false
---

The error message displayed in my terminal was as follows:

```
npx lint-staged

✔ Preparing lint-staged...
⚠ Running tasks for staged files...
  ❯ package.json — 2 files
    ❯ *.{ts,tsx,js,jsx} — 2 files
      ✖ eslint --fix [FAILED]
      ◼ prettier --write
↓ Skipped because of errors from tasks.
✔ Reverting to original state because of errors...
✔ Cleaning up temporary files...

✖ eslint --fix:

D:\web\src\xxx.tsx
  0:0  error  Parsing error: ESLint was configured to run on `<tsconfigRootDir>/src\xxx.tsx` using `parserOptions.project`: <tsconfigRootDir>/tsconfig.json
However, that TSConfig does not include this file. Either:
- Change ESLint's list of included files to not include this file
- Change that TSConfig to include this file
- Create a new TSConfig that includes this file and include it in your parserOptions.project
See the typescript-eslint docs for more info: https://typescript-eslint.io/linting/troubleshooting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file

✖ 1 problem (1 error, 0 warnings)

husky - pre-commit hook exited with code 1 (error)
```

I tried to fix it by following the steps in the error message, but it didn't work.

Then I tried to understand why the xxx.tsx file had a problem while other files were fine.

Surprisingly, I found two files in my 'src' folder: one called "xxx.tsx" and another called 'xxx.ts'.

Yes, you guessed it - the two files had the same name but different extensions.

In the end, I wish the terminal log could have given me a better hint to fix this kind of problem.
