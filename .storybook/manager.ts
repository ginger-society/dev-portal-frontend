import { addons } from '@storybook/manager-api'
import { create } from '@storybook/theming'

addons.setConfig({
    theme: create({
        base: 'light',
        brandTitle: 'foo',
        brandUrl: 'https://www.xyz.com/'
    })
})
