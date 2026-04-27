# Developer Terms & Conditions

Guidelines for contributing to the BabyBlooming repository.

## 1. Environment & Secrets
- Never commit the `.env` file to version control.
- Use `.env.example` as a template for required keys.

## 2. Dependency Management
- Use `npm` as the primary package manager.
- Avoid mixing `npm` and `pnpm`. Delete `pnpm-lock.yaml` if found to maintain a single source of truth (`package-lock.json`).

## 3. Workflow Requirements
- **Branching**: Create feature branches (`feature/name`) rather than pushing to `main`.
- **Testing**: Run unit tests (`npm test`) before submitting a Pull Request.
- **Build**: Ensure the project builds successfully using `npm run build`.

## 4. Code Quality
- Follow the existing folder structure (`app/`, `components/`, `hooks/`).
- Document complex logic within the code or in specialized `.md` files in the `docs/` folder.
