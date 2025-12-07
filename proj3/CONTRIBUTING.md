# Contributing to NeighborhoodPool

Thank you for your interest in contributing to NeighborhoodPool! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic understanding of React and JavaScript

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Start development server: `npm run dev`

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Test additions/updates
- `refactor/` - Code refactoring

### Commit Messages

Use clear, descriptive commit messages:
- `feat: Add order pooling feature`
- `fix: Resolve location service error handling`
- `docs: Update README with new features`
- `test: Add tests for Order model`

### Code Style

- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and modular

### Testing

- Write tests for new features
- Ensure all tests pass: `npm test`
- Aim for high test coverage
- Test both success and failure cases

### Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update documentation if needed
3. Add tests for new functionality
4. Ensure all tests pass
5. Create a pull request with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots (if applicable)

## Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── services/      # API and business logic
├── hooks/         # Custom React hooks
├── models/        # Data models
└── utils/         # Utility functions

Test/              # Test files
├── components/
├── services/
├── models/
└── hooks/
```

## Coding Standards

### JavaScript/React

- Use functional components with hooks
- Prefer named exports for components
- Use async/await for asynchronous operations
- Handle errors appropriately

### File Organization

- One component per file
- Co-locate related files
- Use index.js for barrel exports when appropriate

### Testing Standards

- Test public APIs, not implementation details
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Mock external dependencies
- Test edge cases and error conditions

## Reporting Issues

When reporting issues, please include:

- Description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (browser, OS, Node version)
- Screenshots (if applicable)

## Questions?

- Open an issue for discussion
- Check existing documentation
- Review existing code examples

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

Thank you for contributing to NeighborhoodPool! 🎉
