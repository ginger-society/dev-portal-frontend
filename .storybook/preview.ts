import type { Preview } from '@storybook/react'
import '../src/index.css'
import { setupWorker } from 'msw/browser'
import { handlers } from '../src/mocks/handlers'


// adjust this path to your main css file

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    options: {
      showPanel: true
    }
  }
}

if (typeof global.process === 'undefined') {
  const worker = setupWorker(...handlers)

  worker.start()
}
export default preview
