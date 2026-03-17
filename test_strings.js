const { dictionaries } = require('./lib/i18n/dictionaries');

console.log('Testing ES:');
console.log('contactAdmin:', dictionaries.es.auth.contactAdmin);
console.log('accountRejected:', dictionaries.es.auth.accountRejected);
console.log('Settings title:', dictionaries.es.settings.title);

console.log('Testing PT:');
console.log('contactAdmin:', dictionaries.pt.auth.contactAdmin);
console.log('accountRejected:', dictionaries.pt.auth.accountRejected);
console.log('Settings title:', dictionaries.pt.settings.title);
