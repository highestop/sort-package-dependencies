# sort-package-dependencies

Sort dependencies for package.json

- in root directory
- in every submodule in `packages` directory

Only sort for these members

- `dependencies`
- `devDependencies`
- `peerDependencies`

Will run `prettier` if available after writing every file.

Support two options:

- `--check`: only check for sorted status, no writing files.
- `--quiet`: no console logs during walking through every file.

e.g. `npx sort-package-dependencies --check --quiet`
