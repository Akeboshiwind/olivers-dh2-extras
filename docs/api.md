## Members

<dl>
<dt><a href="#OUtils">OUtils</a></dt>
<dd></dd>
<dt><a href="#Actor">Actor</a></dt>
<dd><p>Extensions to the base Actor class</p>
<p>See the <a href="https://foundryvtt.com/api/Actor.html">Actor</a> docs in
foundry</p>
</dd>
<dt><a href="#DarkHeresyActor">DarkHeresyActor</a></dt>
<dd><p>Extensions to the DarkHeresyActor class</p>
<p>See the <a href="https://github.com/moo-man/DarkHeresy2E-FoundryVTT/blob/master/script/common/actor.js">DarkHeresyActor</a> code (no docs yet)</p>
</dd>
</dl>

<a name="OUtils"></a>

## OUtils
**Kind**: global variable  

* [OUtils](#OUtils)
    * [.getActor(actorId)](#OUtils.getActor) ⇒ [<code>Actor</code>](#Actor)
    * [.listStatusEffectIds()](#OUtils.listStatusEffectIds) ⇒ <code>Array.&lt;string&gt;</code>
    * [.getStatusEffect(effectId)](#OUtils.getStatusEffect) ⇒ <code>object</code>
    * [.getDegrees(targetValue, rollValue)](#OUtils.getDegrees) ⇒ <code>Object</code>


* * *

<a name="OUtils.getActor"></a>

### OUtils.getActor(actorId) ⇒ [<code>Actor</code>](#Actor)
A convinience function to get an actor, given it's id

**Kind**: static method of [<code>OUtils</code>](#OUtils)  

| Param | Type | Description |
| --- | --- | --- |
| actorId | <code>string</code> | The id of the actor to get |

**Example**  
```js
const actorId = game.user.character._id;
const actor = OUtils.getActor(actorId);
game.user.character === actor;
```

* * *

<a name="OUtils.listStatusEffectIds"></a>

### OUtils.listStatusEffectIds() ⇒ <code>Array.&lt;string&gt;</code>
A convinience function to list the available StatusEffect ids

Useful for finding out what StatusEffects are available or making a
menu of available StatusEffects.

**Kind**: static method of [<code>OUtils</code>](#OUtils)  

* * *

<a name="OUtils.getStatusEffect"></a>

### OUtils.getStatusEffect(effectId) ⇒ <code>object</code>
Returns a StatusEffect object

This object can then be used to toggle a StatusEffect (the icons on
a token).

**Kind**: static method of [<code>OUtils</code>](#OUtils)  

| Param | Type |
| --- | --- |
| effectId | <code>string</code> | 

**Example**  
```js
const token = game.user.character.getActiveTokens()[0];
const statusEffect = OUtils.getStatusEffect("bleeding");
token.toggleEffect(statusEffect);
// The icon on the token for "bleeding" will now have toggled
```

* * *

<a name="OUtils.getDegrees"></a>

### OUtils.getDegrees(targetValue, rollValue) ⇒ <code>Object</code>
Calculates the result of a DarkHeresy2E roll

Returns whether the roll was a success or not along with the degrees
of either failure or success

**Kind**: static method of [<code>OUtils</code>](#OUtils)  

| Param | Type | Description |
| --- | --- | --- |
| targetValue | <code>number</code> | The target the roll was rolled against |
| rollValue | <code>number</code> | The result of the roll |

**Example**  
```js
const target = 55;
const roll = 54;

const result = OUtils.getDegrees(target, roll);
result === {
    success: true,
    degrees: 1
};
// You get one degree or passing
```
**Example**  
```js
const target = 55;
const roll = 70;

const result = OUtils.getDegrees(target, roll);
result === {
    success: false,
    degrees: 3
};
// And an additional degree for the difference in tens
```
**Example**  
```js
// A more realistic example
const hasRequiredTalent = true;
const target = new Roll("@base + @talentBonus", {
    base: "+0", // Challenging
    talentBonus: hasRequiredTalent ? "+10" : "+0",
}).roll();
const roll = new Roll("1d100").roll();

const result = OUtils.getDegrees(target.total, roll.total);

if (result.success) {
    console.log("You succeded the check");
} else {
    console.log("You failed the check");
}
// And an additional degree for the difference in tens
```

* * *

<a name="Actor"></a>

## Actor
Extensions to the base Actor class

See the [Actor](https://foundryvtt.com/api/Actor.html) docs in
foundry

**Kind**: global variable  

* [Actor](#Actor)
    * [.getToken()](#Actor+getToken) ⇒ <code>Token</code>
    * [.getActiveStatusEffect(effectId)](#Actor+getActiveStatusEffect) ⇒ <code>ActiveEffect</code>
    * [.hasStatusEffect(effectId)](#Actor+hasStatusEffect) ⇒ <code>boolean</code>
    * [.setStatusEffect(effectId, status)](#Actor+setStatusEffect) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.enableStatusEffect(effectId)](#Actor+enableStatusEffect) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.disableStatusEffect(effectId)](#Actor+disableStatusEffect) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.enableStatusEffectFor(effectId, duration, [updateExpiry])](#Actor+enableStatusEffectFor) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.getStatusEffectExpiryEvent(effectId)](#Actor+getStatusEffectExpiryEvent) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.timeUntilStatusEffectExpiry(effectId)](#Actor+timeUntilStatusEffectExpiry) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.cancelStatusEffectExpiry(effectId)](#Actor+cancelStatusEffectExpiry) ⇒ <code>Promise.&lt;boolean&gt;</code>


* * *

<a name="Actor+getToken"></a>

### actor.getToken() ⇒ <code>Token</code>
A convinience function to get the token for an actor, if there are
multiple tokens just the first is returned.

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Throws**:

- if the actor has no tokens or the first token is null


* * *

<a name="Actor+getActiveStatusEffect"></a>

### actor.getActiveStatusEffect(effectId) ⇒ <code>ActiveEffect</code>
Returns the
[ActiveEffect](https://foundryvtt.com/api/ActiveEffect.html) that
represents the StatusEffect on the actor with the given effectId.

Under the hood StatusEffects (icons on tokens) are really a class called
ActiveEffect. This adds some temporary information to a character that
can alter it. In this case it adds an icon overlaying the actor's token.

If you can, I suggest *avoiding* using the ActiveEffect and just thinking
in terms of StatusEffects as ActiveEffects are poorly documented
(currently) and aren't used in moo-man's DarkHeresy2E module (yet).

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param | Type | Description |
| --- | --- | --- |
| effectId | <code>string</code> | The id of the StatusEffect |

**Example**  
```js
const actor = game.user.character;
const activeEffect = actor.getActiveStatusEffect("bleeding");
if (activeEffect === null || activeEffect === undefined) {
    console.log("Oh no! I'm bleeding");
} else {
    console.log("Still safe");
}
```

* * *

<a name="Actor+hasStatusEffect"></a>

### actor.hasStatusEffect(effectId) ⇒ <code>boolean</code>
Tests to see if the actor has a StatusEffect with the given id
applied to it currently.

**Kind**: instance method of [<code>Actor</code>](#Actor)  

| Param | Type | Description |
| --- | --- | --- |
| effectId | <code>string</code> | The id of the StatusEffect |

**Example**  
```js
const actor = game.user.character;
if (actor.hasStatusEffect("bleeding")) {
    console.log("Oh no! I'm bleeding");
} else {
    console.log("Still safe");
}
```

* * *

<a name="Actor+setStatusEffect"></a>

### actor.setStatusEffect(effectId, status) ⇒ <code>Promise.&lt;boolean&gt;</code>
Set's the StatusEffect either on or off

Prefer using the wrapper functions:
[enableStatusEffect](#Actor+enableStatusEffect)
and [disableStatusEffect](#Actor+disableStatusEffect)

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Throws**:

- if the actor has no tokens or the first token is null
- if the StatusEffect doesn't exist


| Param | Type | Description |
| --- | --- | --- |
| effectId | <code>string</code> | The id of the StatusEffect |
| status | <code>boolean</code> | Whether to enable, or disable the StatusEffect |

**Example**  
```js
const actor = game.user.character;
const updated = await actor.setStatusEffect("bleeding", true);
if (updated) {
    console.log("I'm now bleeding");
} else {
    console.log("I can't bleed any more than I already am");
}
```

* * *

<a name="Actor+enableStatusEffect"></a>

### actor.enableStatusEffect(effectId) ⇒ <code>Promise.&lt;boolean&gt;</code>
Enable the StatusEffect on the actor

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Throws**:

- if the actor has no tokens or the first token is null
- if the StatusEffect doesn't exist


| Param | Type | Description |
| --- | --- | --- |
| effectId | <code>string</code> | The id of the StatusEffect |

**Example**  
```js
const actor = game.user.character;
const updated = await actor.enableStatusEffect("bleeding");
if (updated) {
    console.log("I'm now bleeding");
} else {
    console.log("I can't bleed any more than I already am");
}
```

* * *

<a name="Actor+disableStatusEffect"></a>

### actor.disableStatusEffect(effectId) ⇒ <code>Promise.&lt;boolean&gt;</code>
Disable the StatusEffect on the actor

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Throws**:

- if the actor has no tokens or the first token is null
- if the StatusEffect doesn't exist


| Param | Type | Description |
| --- | --- | --- |
| effectId | <code>string</code> | The id of the StatusEffect |

**Example**  
```js
const actor = game.user.character;
const updated = actor.disableStatusEffect("bleeding");
if (updated) {
    console.log("Thank god I've stopped bleeding");
} else {
    console.log("I wasn't bleeding, but thanks");
}
```

* * *

<a name="Actor+enableStatusEffectFor"></a>

### actor.enableStatusEffectFor(effectId, duration, [updateExpiry]) ⇒ <code>Promise.&lt;boolean&gt;</code>
Enables the given StatusEffect for the given duration. After the
duration has expired the StatusEffect will be toggled off.

You can supply a third argument `updateExpiry` to force updating the
expiry if the status effect has already been applied.

Requires the [about-time](https://gitlab.com/tposney/about-time)
module to be installed.

If the module isn't installed this function won't be loaded

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Throws**:

- if the actor has no tokens or the first token is null
- if the StatusEffect doesn't exist

**Requires**: <code>module:tposney/about-time</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| effectId | <code>string</code> |  | The id of the StatusEffect |
| duration | <code>object</code> |  | An about-time [DTMod](https://gitlab.com/tposney/about-time/-/blob/master/src/module/calendar/DTMod.ts) |
| [updateExpiry] | <code>boolean</code> | <code>false</code> | If the actor already has the StatusEffect, update the expiry |

**Example**  
```js
const actor = game.user.character;
const updated = actor.enableStatusEffectFor("bleeding", {hours: 1});
if (updated) {
    // The Token will now have the "bleeding" StatusEffect
    // applied, if it wasn't already
    console.log("This is going to suck...");
    actor.hasStatusEffect("bleeding") === true;

    // Presuming you're a GM:
    Gametime.advanceTime(Gametime.DMf({hours: 1, seconds: 1}));

    actor.hasStatusEffect("bleeding") === false;
} else {
    console.log("I'm already there");
    // The StatusEffect has already been applied to the Token
    // As updateExpiry wasn't set to true, the expiry (if there
    // was one) hasn't been updated
}
```
**Example**  
```js
const actor = game.user.character;
const updated = actor.enableStatusEffectFor("bleeding", {hours: 1}, true);
if (updated) {
    // The Token will now have the "bleeding" StatusEffect
    // applied, if it wasn't already
    console.log("This is going to suck...");
    actor.hasStatusEffect("bleeding") === true;

    // Presuming you're a GM:
    Gametime.advanceTime(Gametime.DMf({hours: 1, seconds: 1}));

    actor.hasStatusEffect("bleeding") === false;
} else {
    console.log("More bleeding, really?");
    // The StatusEffect has already been applied to the Token
    // The expiry has been updated to be an hour from now
}
```

* * *

<a name="Actor+getStatusEffectExpiryEvent"></a>

### actor.getStatusEffectExpiryEvent(effectId) ⇒ <code>Promise.&lt;object&gt;</code>
Find the about-time event that will eventually expire the given
StatusEffect

Used internally in [timeUntilStatusEffectExpiry](#Actor+timeUntilStatusEffectExpiry)

Requires the [about-time](https://gitlab.com/tposney/about-time)
module to be installed.

If the module isn't installed this function won't be loaded

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Requires**: <code>module:tposney/about-time</code>  

| Param | Type | Description |
| --- | --- | --- |
| effectId | <code>string</code> | The id of the StatusEffect |

**Example**  
```js
const actor = game.user.character;
const effectId = "bleeding";
actor.enableStatusEffectFor(effectId, {seconds: 1}, true)
    .then(async _updated => {
    const event = await actor.getStatusEffectExpiryEvent(effectId);
    event._time - Gametime.DTNow().toSeconds() === 1;
})
```

* * *

<a name="Actor+timeUntilStatusEffectExpiry"></a>

### actor.timeUntilStatusEffectExpiry(effectId) ⇒ <code>Promise.&lt;number&gt;</code>
Calculates the time in seconds until the StatusEffect expires

Requires the [about-time](https://gitlab.com/tposney/about-time)
module to be installed.

If the module isn't installed this function won't be loaded

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Throws**:

- if StatusEffect is not found
- if event has already expired

**Requires**: <code>module:tposney/about-time</code>  

| Param | Type | Description |
| --- | --- | --- |
| effectId | <code>string</code> | The id of the StatusEffect |

**Example**  
```js
const actor = game.user.character;
const effectId = "bleeding";

await actor.enableStatusEffectFor(effectId, {seconds: 1}, true)

const secs = await actor.timeUntilStatusEffectExpiry(effectId);
secs === 1;
```

* * *

<a name="Actor+cancelStatusEffectExpiry"></a>

### actor.cancelStatusEffectExpiry(effectId) ⇒ <code>Promise.&lt;boolean&gt;</code>
Cancel the expiry of the given StatusEffect on the actor

Requires the [about-time](https://gitlab.com/tposney/about-time)
module to be installed.

If the module isn't installed this function won't be loaded

**Kind**: instance method of [<code>Actor</code>](#Actor)  
**Requires**: <code>module:about-time</code>  

| Param | Type | Description |
| --- | --- | --- |
| effectId | <code>string</code> | The id of the StatusEffect |

**Example**  
```js
const actor = game.user.character;
const effectId = "bleeding";
actor.enableStatusEffectFor(effectId, {seconds: 1}, true)
    .then(async _updated => {
    const effect = actor.getStatusEffectExpiryEvent(effectId);
    effect !== undefined;

    const removed = await actor.cancelStatusEffectExpiry(effectId);

    const effect = actor.getStatusEffectExpiryEvent(effectId);
    effect === undefined;
})
```

* * *

<a name="DarkHeresyActor"></a>

## DarkHeresyActor
Extensions to the DarkHeresyActor class

See the [DarkHeresyActor](https://github.com/moo-man/DarkHeresy2E-FoundryVTT/blob/master/script/common/actor.js) code (no docs yet)

**Kind**: global variable  

* * *

<a name="DarkHeresyActor+hasTalent"></a>

### darkHeresyActor.hasTalent(talentName) ⇒
Cancel the expiry of the given StatusEffect on the actor

Requires the [Dark Heresy 2E](https://github.com/moo-man/DarkHeresy2E-FoundryVTT) System to be installed.

If the system isn't installed this function won't be loaded

**Kind**: instance method of [<code>DarkHeresyActor</code>](#DarkHeresyActor)  
**Returns**: boolean  
**Requires**: <code>module:moo-man&#x27;s</code>  

| Param | Type | Description |
| --- | --- | --- |
| talentName | <code>string</code> | The name of the talent to look for (must be exact match) |

**Example**  
```js
const actor = game.user.character;
if (actor.hasTalent("Superior Chirurgeon")) {
    // Do some stuff to allow for extra healing
    // See my FirstAid macro for more
}
```

* * *

