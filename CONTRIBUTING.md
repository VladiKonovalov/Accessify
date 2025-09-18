# Contributing to Accessify

Thank you for your interest in contributing to Accessify! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Documentation](#documentation)
- [Testing](#testing)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@accessify.dev](mailto:conduct@accessify.dev).

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/accessify.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Git
- A modern web browser
- Basic knowledge of JavaScript, HTML, and CSS
- Understanding of web accessibility principles

### Installation

```bash
# Clone the repository
git clone https://github.com/accessify/accessify.git
cd accessify

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project Structure

```
accessify/
├── src/                    # Source code
│   ├── components/         # Core accessibility components
│   ├── plugins/           # Built-in plugins
│   ├── utils/             # Utility functions
│   └── index.js           # Main entry point
├── dist/                  # Built files
├── types/                 # TypeScript definitions
├── tests/                 # Test files
├── docs/                  # Documentation
├── example.html           # Demo page
└── README.md              # Project documentation
```

## Contributing Guidelines

### General Guidelines

1. **Follow the existing code style** - Use ESLint configuration and Prettier formatting
2. **Write meaningful commit messages** - Use conventional commit format
3. **Keep changes focused** - One feature or bug fix per pull request
4. **Test your changes** - Ensure all tests pass and add new tests as needed
5. **Update documentation** - Keep README, API docs, and comments up to date
6. **Consider accessibility** - All changes should maintain or improve accessibility

### Code Style

- Use ES6+ features
- Follow the existing naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use consistent indentation (2 spaces)

### Commit Message Format

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(visual): add colorblind-friendly theme support
fix(navigation): resolve focus trap issue in modals
docs(api): update configuration examples
test(reading): add text-to-speech tests
```

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the guidelines above
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Run the test suite** and ensure all tests pass
6. **Check accessibility** using the built-in testing tools
7. **Submit a pull request** with a clear description

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Accessibility tests pass
- [ ] Manual testing completed

## Accessibility
- [ ] WCAG 2.1 AA compliance maintained
- [ ] Israeli Standard 5568 compliance maintained
- [ ] RTL support maintained
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility maintained

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or breaking changes documented)
```

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Browser and version** information
5. **Operating system** details
6. **Console errors** (if any)
7. **Screenshots** (if applicable)

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 10, macOS 11, Ubuntu 20.04]
- Browser: [e.g. Chrome 91, Firefox 89, Safari 14]
- Accessify version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

## Feature Requests

When requesting features, please include:

1. **Clear description** of the feature
2. **Use case** and motivation
3. **Accessibility benefits** (if applicable)
4. **Implementation suggestions** (if any)
5. **Related issues** or discussions

### Feature Request Template

```markdown
**Feature Description**
A clear and concise description of the feature you'd like to see.

**Use Case**
Describe the use case and motivation for this feature.

**Accessibility Benefits**
How would this feature improve accessibility?

**Implementation Suggestions**
Any ideas on how this could be implemented?

**Additional Context**
Add any other context or screenshots about the feature request here.
```

## Documentation

### Types of Documentation

1. **API Documentation** - JSDoc comments for all public APIs
2. **User Guide** - How to use Accessify
3. **Developer Guide** - How to contribute and extend
4. **Accessibility Guide** - Best practices and compliance
5. **Plugin Guide** - How to create custom plugins

### Documentation Guidelines

- Use clear, concise language
- Include code examples
- Provide accessibility context
- Keep documentation up to date
- Use consistent formatting

## Testing

### Test Types

1. **Unit Tests** - Test individual functions and components
2. **Integration Tests** - Test component interactions
3. **Accessibility Tests** - Test WCAG and Israeli Standard compliance
4. **Browser Tests** - Test cross-browser compatibility
5. **Manual Tests** - Test user interactions

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run accessibility tests
npm run test:a11y

# Run specific test file
npm test -- tests/accessify.test.js
```

### Writing Tests

- Write tests for all new functionality
- Test both success and error cases
- Include accessibility tests
- Mock external dependencies
- Use descriptive test names
- Keep tests focused and independent

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

All contributions must maintain WCAG 2.1 AA compliance:

- **Perceivable** - Information must be presentable in ways users can perceive
- **Operable** - Interface components must be operable
- **Understandable** - Information and UI operation must be understandable
- **Robust** - Content must be robust enough for various assistive technologies

### Israeli Standard 5568 Compliance

All contributions must maintain Israeli Standard 5568 compliance:

- **RTL Support** - Full right-to-left language support
- **Hebrew Language** - Hebrew language and cultural considerations
- **Text Size** - Minimum 200% zoom capability
- **High Contrast** - Enhanced contrast modes
- **Keyboard Navigation** - Full keyboard accessibility

### Accessibility Testing

Before submitting changes:

1. **Run automated tests** - Use built-in accessibility testing tools
2. **Test with screen readers** - NVDA, JAWS, VoiceOver
3. **Test keyboard navigation** - Ensure all functionality is keyboard accessible
4. **Test with different input methods** - Mouse, keyboard, touch, voice
5. **Test with assistive technologies** - Switch navigation, voice commands
6. **Test RTL languages** - Hebrew, Arabic text and layout

## Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Checklist

1. **Update version** in package.json
2. **Update CHANGELOG.md** with new features and fixes
3. **Run full test suite** and ensure all tests pass
4. **Run accessibility tests** and ensure compliance
5. **Build production files** and verify they work
6. **Update documentation** if needed
7. **Create release notes** with highlights
8. **Tag the release** in Git
9. **Publish to npm** (if applicable)
10. **Update website** and documentation

## Getting Help

If you need help contributing:

1. **Check existing issues** - Your question might already be answered
2. **Read the documentation** - Check README, API docs, and guides
3. **Join discussions** - Use GitHub Discussions for questions
4. **Contact maintainers** - Email [maintainers@accessify.dev](mailto:maintainers@accessify.dev)

## Recognition

Contributors will be recognized in:

- **CONTRIBUTORS.md** - List of all contributors
- **Release notes** - Recognition for significant contributions
- **Documentation** - Credit for documentation improvements
- **Website** - Featured contributors section

Thank you for contributing to Accessify and making the web more accessible for everyone!
