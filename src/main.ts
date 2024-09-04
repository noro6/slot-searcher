import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

const vuetify = createVuetify({
  components,
  directives,
  defaults: {
    global: { density: 'compact', hideDetails: 'true' },
    VBtn: { density: 'default', style: 'text-transform: none;' }
  },
  theme: {
    defaultTheme: 'light'
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  }
});

const app = createApp(App)

app.use(vuetify);
app.mount('#app')