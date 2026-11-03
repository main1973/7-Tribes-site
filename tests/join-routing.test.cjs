const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = (path) => fs.readFileSync(path, 'utf8');
const loopAuth = 'https://manus.im/app-auth?appId=YuPg8Y4NgWiboAN2ycZ9Jv&amp;redirectUri=https%3A%2F%2Floop.7trb.com%2Fapi%2Foauth%2Fcallback&amp;state=aHR0cHM6Ly9sb29wLjd0cmIuY29tL2FwaS9vYXV0aC9jYWxsYmFja3wvbG9vcC1wcm9maWxl&amp;type=signIn';
const join = read('join/index.html');
assert.match(join, new RegExp(`id="join-action"[^>]+href="${loopAuth.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
assert.match(join, /Join Loop Free/);
assert.match(join, /Nuru \(optional\)/);
assert.match(join, /not required to join/);
assert.doesNotMatch(join, /manusecosystem:|intent:\/\//);
assert.doesNotMatch(join, /window\.location\.replace/);

const home = read('index.html');
assert.ok(home.includes(`class="btn gold" href="${loopAuth}"`));
assert.ok(home.includes(`href="${loopAuth}" class="btn gold premium-btn"`));
assert.ok(home.includes(`window.location.href='${loopAuth.replaceAll('&amp;', '&')}'`));
assert.match(read('js/nav.js'), /Join Loop Free/);
assert.ok(read('js/nav.js').includes(loopAuth));
assert.match(home, /data-home-account-cta>Create Academy Account/);
assert.match(home, />Join Loop<\/text>/);

const cta = read('js/home-account-cta.js');
assert.match(cta, /Create Academy Account/);
assert.match(cta, /returnTo=%2Facademy%2F/);
const signup = read('account/signup.html');
assert.match(signup, /Create Academy account/);
assert.match(signup, /does not create a Loop or Connect member profile/);
assert.match(signup, /Loop’s browser join flow/);
const academy = read('academy/index.html');
assert.match(academy, /Create Academy Account/);
assert.match(academy, /does not create a Loop or Connect member profile/);
for (const path of ['js/academy-app.js', 'js/academy-lesson2.js', 'js/academy-lesson3.js', 'js/academy-lesson4.js', 'js/academy-lesson5.js', 'js/academy-lesson6.js', 'js/academy-lesson7.js']) {
  assert.doesNotMatch(read(path), /Create a free 7Tribes account/);
}
assert.match(read('ecosystem.html'), /https:\/\/connect\.7trb\.com\/join/);
console.log('Join routing tests passed');
