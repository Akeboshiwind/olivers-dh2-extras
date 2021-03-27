![](https://img.shields.io/badge/Foundry-v0.7.9-informational)
<!--- TODO: do the below -->

<!--- Downloads @ Latest Badge -->
<!--- replace <user>/<repo> with your username/repository -->
<!--- ![Latest Release Download Count](https://img.shields.io/github/downloads/<user>/<repo>/latest/module.zip) -->

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2F<your-module-name>&colorB=4aa94a) -->

# Oliver's Dark Heresy 2 Extras

An extention to moo-man's excellent [DarkHeresy2E-FoundryVTT](https://github.com/moo-man/DarkHeresy2E-FoundryVTT).

This module only optionally depends on the DH2 System and `about-time`. If
they're not installed then the functions simply won't be loaded.

This module adds some extra functionality to the Actor and DarkHeresyActor classes enabling you do do cool things like:

```javascript
// Let's say that you've ruled that Takedown can only be done once per day
// Otherwise your character get's dizzy

// We need some status effect to indicate that the character is dizzy
// Or at least I like to so that it's visible on the token
const dizzyStatusEffect = "stun";
async main() {
    const actor = game.user.character;

    // You can only use Takedown if you have the talent
    if (actor.hasTalent("Takedown")) {
        if (actor.hasStatusEffect(dizzyStatusEffect)) {
            ui.notification.warn("This character can't perform a Takedown twice inone day");
            // You could use actor.timeUntilStatusEffectExpiry(dizzyStatusEffect)
            // to display how long until they can use Takedown again
        } else {
            // Do stuff for the takedown
            
            actor.enableStatusEffectFor(dizzyStatusEffect, {hours: 1});
        }
    } else {
        ui.notification.warn("This character can't perform a Takedown");
        ui.notification.warn("You'll need to invest in the talent first");
    }
}

main();
```

The docs have more examples and more functions, take a look :)

# Documentation

- [API Docs](./docs/api.md)
- [Deployment](./docs/deploy.md)

<!--- TODO: Add docs for macros -->
<!--- TODO: Auto generate macros into packfile -->
