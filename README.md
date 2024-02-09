# ☁️ kthcloud/console

Welcome to the kthcloud/console repository! This project is the web console for kthcloud, a free cloud provider at KTH, created by students for students. It is built in JavaScript, leveraging React and MUI. We warmly welcome your contributions, and we hope this README helps you get started.

## Table of Contents

- [☁️ kthcloud/console](#️-kthcloudconsole)
  - [Table of Contents](#table-of-contents)
  - [External dependencies](#external-dependencies)
  - [Setup](#setup)
  - [Contributing](#contributing)
  - [Locales and translations](#locales-and-translations)
    - [Other languages](#other-languages)
  - [Formatting](#formatting)
  - [License](#license)

## External dependencies

console uses these services for its functionality.

kthcloud maintained:

-   [go-deploy](https://github.com/kthcloud/go-deploy): Backend for creation, and management of resources
-   [sys-api](https://github.com/kthcloud/sys-api): Provides stats and capacities
-   [llama](https://llama.app.cloud.cbh.kth.se/): Enables genAI features
-   [llama-prefetch](https://github.com/kthcloud/llama-prefetch/): Reduces genAI features latency by prefetching queries

External:

-   [Gravatar](https://gravatar.com): Provides user avatars
-   [Google Fonts](https://fonts.google.com): Provides fonts
-   [SWAMID/KTH SSO](https://login.kth.se): Provides authentication
-   [GitHub SSO](https://github.com): Enables linking GitHub repos for continuous delivery

## Setup

Before you start, make sure you have bun installed on your system. You can install it at https://bun.sh

You can then set up the project by running the following commands in your terminal:

```bash
git clone https://github.com/kthcloud/console.git
cd console
bun install
bun run dev
```

The `bun run dev` command will start the development server. You can access the application at `http://localhost:3000`.

## Contributing

We are thrilled you are considering contributing to the kthcloud project! We welcome contributions from everyone, and we are here to help you if you need it.

You can find our current issues in the [Issues](https://github.com/kthcloud/console/issues) tab. If you have any questions, feel free to discuss in the issue thread.

The `beta` branch is the main development branch, so all pull requests should be created against `beta`.

Before you start coding:

1. Fork the repository.
2. Clone your fork to your local machine.
3. Create a new branch for your feature or bug fix, like `my-new-feature` or `fixing-bug`.

After you've made your changes:

1. Push your changes to your fork.
2. Open a pull request in the original repository, from your fork's branch to `beta`.

Please include a detailed description of your changes in your pull request.

## Locales and translations
Any strings added in the code should be created as entries in the `src/locales` folder, in `en.json`. kthcloud also supports Swedish, and we would be grateful if you could provide translations for both languages. You can add translations in `sv.json`. If you are unsure about the translation, feel free to ask in the issue thread or on Discord.

To add a new string, you can use the `t` function from `react-i18next`. For example:

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
    const { t } = useTranslation();
    return <h1>{t('myString')}</h1>;
}
```

### Other languages
If you would like to add support for another language, please discuss this as an issue first. We would be happy to help you get started, however as this creates a maintenance burden, we would like to discuss the need for the language first.


## Formatting

This project uses Prettier as the code formatter. We have a `.prettierrc` file in the repository that sets the formatting rules, so please make sure to format your code before submitting a pull request. You can format your code by using the appropriate extension or plugin in your IDE, or running `prettier --write .` in your terminal (You can install prettier with `bun install -g prettier`).

## License

This project is licensed under the MIT License. Feel free to use the source code and modify it to your needs.

See the [LICENSE](LICENSE) file for details.
