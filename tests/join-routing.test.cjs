const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = (path) => fs.readFileSync(path, 'utf8');
const loopEntry = 'https://loop.7trb.com/';

const join = read('join/index.html');
assert.match(join, /id="join-action"[^>]+href="https:\/\/loop\.7trb\.com\/"/);
assert.match(join, /Open Loop to register/);
assert.match(join, /Choose Join Free in Loop to register by email in your browser/);
assert.match(join, /Nuru \(optional\)/);
assert.match(join, /not required to join/);
assert.doesNotMatch(join, /manusecosystem:|intent:\/\//);
assert.doesNotMatch(join, /window\.location\.replace/);

const home = read('index.html');
assert.ok(home.includes(`class="btn gold" href="${loopEntry}">Join 7Tribes`));
assert.ok(home.includes(`href="${loopEntry}" class="btn gold premium-btn">Join 7Tribes`));
assert.ok(home.includes(`window.location.href='${loopEntry}'`));
assert.match(home, /data-home-account-cta>Create Academy Account/);
assert.match(home, />Join Loop<\/text>/);

assert.ok(read('js/nav.js').includes(`href="${loopEntry}"`));
assert.ok(read('ecosystem.html').includes(`href="${loopEntry}" class="btn gold">Join Loop Free`));
assert.ok(read('academy/index.html').includes(`href="${loopEntry}">Join 7Tribes`));
assert.ok(read('transparency.html').includes(`href="${loopEntry}">Join 7Tribes`));

const cta = read('js/home-account-cta.js');
assert.match(cta, /Create Academy Account/);
assert.match(cta, /returnTo=%2Facademy%2F/);
const signup = read('account/signup.html');
assert.match(signup, /Create Academy account/);
assert.match(signup, /does not create a Loop or Connect member profile/);
assert.ok(signup.includes(`href="${loopEntry}">Loop’s browser join flow`));
assert.match(signup, /I accept the 7Tribes Terms and Privacy Notice\./);
assert.doesNotMatch(signup, /href="[^"]*(terms|privacy)/i);

const academy = read('academy/index.html');
assert.match(academy, /Create Academy Account/);
assert.match(academy, /does not create a Loop or Connect member profile/);
for (const path of ['js/academy-app.js', 'js/academy-lesson2.js', 'js/academy-lesson3.js', 'js/academy-lesson4.js', 'js/academy-lesson5.js', 'js/academy-lesson6.js', 'js/academy-lesson7.js']) {
  assert.doesNotMatch(read(path), /Create a free 7Tribes account/);
}
for (const path of ['join/index.html', 'index.html', 'js/nav.js', 'ecosystem.html', 'academy/index.html', 'account/signup.html', 'transparency.html']) {
  assert.doesNotMatch(read(path), /app-auth/i);
}
assert.match(read('ecosystem.html'), /https:\/\/connect\.7trb\.com\/join/);
console.log('Join routing tests passed');
