import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.log(err));

// 在 DOMContentLoaded 时运行我们的代码，以使 TransferState 正常工作
document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.log(err));
});
