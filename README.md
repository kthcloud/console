# ☁️ kthcloud/landing-frontend

Welcome to the kthcloud/landing-frontend repository! This project is the React frontend for kthcloud, a free cloud provider at KTH, created by students for students. We warmly welcome your contributions, and we hope this README helps you get started.

## Table of Contents

- [☁️ kthcloud/landing-frontend](#️-kthcloudlanding-frontend)
  - [Table of Contents](#table-of-contents)
  - [External dependencies](#external-dependencies)
  - [Setup](#setup)
  - [Contributing](#contributing)
  - [Formatting](#formatting)
  - [License](#license)

## External dependencies
landing-frontend uses these services for its functionality:
- [sys-api](https://github.com/kthcloud/sys-api): Provides stats and capacities
- [go-deploy](https://github.com/kthcloud/go-deploy): Backend for creation, and management of resources
- [llama](https://llama.app.cloud.cbh.kth.se/): Enables genAI features
- [llama-prefetch](https://github.com/kthcloud/llama-prefetch/): Reduces genAI features latency by prefetching queries

## Setup

Before you start, make sure you have Node.js installed on your system. We recommend using [nvm](https://github.com/nvm-sh/nvm) to install and manage Node.js versions.

We always aim to use the latest LTS version of Node.js. The project is currently developed with Node.js 20. You can switch to the correct Node.js version by running `nvm use <version>` in your terminal.

Once the correct Node.js is installed and loaded, you can set up the project by running the following commands in your terminal:

```bash
git clone https://github.com/kthcloud/landing-frontend.git
cd landing-frontend
npm install
npm start
```

The `npm start` command will start the development server. You can access the application at `http://localhost:3000`.

## Contributing

We are thrilled you are considering contributing to the kthcloud project! We welcome contributions from everyone, and we are here to help you if you need it.

You can find our current issues in the [Issues](https://github.com/kthcloud/landing-frontend/issues) tab. If you have any questions, feel free to ask them in the issue thread.

The `beta` branch is the main development branch, so all pull requests should be created against `beta`.

Before you start coding:

1. Fork the repository.
2. Clone your fork to your local machine.
3. Create a new branch for your feature or bug fix, like `my-new-feature` or `fixing-bug`.

After you've made your changes:

1. Push your changes to your fork.
2. Open a pull request in the original repository, from your fork's branch to `beta`.

Please include a detailed description of your changes in your pull request.

## Formatting

This project uses Prettier as the code formatter. We have a `.prettierrc` file in the repository that sets the formatting rules, so please make sure to format your code before submitting a pull request. You can format your code by using the appropriate extension or plugin in your IDE, or running `npx prettier --write .` in your terminal.

## License

This project is licensed under the MIT License. Feel free to the source code and modify it to your needs.

See the [LICENSE](LICENSE) file for details.
