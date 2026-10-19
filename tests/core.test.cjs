const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../healthcare-core.js');
for (const [role, def] of Object.entries(G.STAFF)) {
  test(`hire ${role}: exactly the advertised recruiting fee is sufficient`, () => {
    const cost = Math.round(def.wage / 4);
    const state = {...G.create(), cash: cost};
    const copy = structuredClone(state);
    const result = G.perform(state, {type: 'hire', role});
    assert.equal(result.ok, true);
    assert.equal(result.state.cash, 0);
    assert.equal(result.state.staff[role], state.staff[role] + 1);
    assert.equal(G.validate(result.state), true);
    assert.deepEqual(state, copy);
    const short = {...state, cash: cost - 1};
    const rejected = G.perform(short, {type: 'hire', role});
    assert.equal(rejected.ok, false);
    assert.deepEqual(rejected.state, short);
  });
}
test('new-game management loop uses valid, persistent state and settles a day', () => {
  let state = G.create();
  for (const cmd of [{type:'build',building:'ward'}, {type:'hire',role:'rn'}, {type:'admit'}, {type:'unlock',chapter:5}, {type:'action',action:'care'}]) {
    const result = G.perform(state, cmd);
    assert.equal(result.ok, true, JSON.stringify(cmd));
    state = JSON.parse(JSON.stringify(result.state));
    assert.equal(G.validate(state), true);
  }
  const projection = G.metrics(state), before = state.cash;
  const result = G.perform(state, {type:'tick',hours:24});
  assert.equal(result.ok, true);
  assert.equal(result.state.day, 2);
  assert.equal(result.state.cash, before + projection.profit);
  assert.equal(result.state.stats.days, 1);
});
test('construction chooses a vacant footprint without moving existing buildings', () => {
  const state=G.create(),before=structuredClone(state.buildings),result=G.perform(state,{type:'build',building:'ward'});
  assert.equal(result.ok,true);assert.deepEqual(result.state.buildings.slice(0,before.length),before);
  const created=result.state.buildings.at(-1);
  assert.ok(before.every(b=>Math.abs(b.x-created.x)>=2||Math.abs(b.y-created.y)>=2));
});
test('care without residents is rejected without charging', () => {
  const state={...G.create(),chapter:5,residents:0},result=G.perform(state,{type:'action',action:'care'});
  assert.equal(result.ok,false);assert.equal(result.state.cash,state.cash);
});
