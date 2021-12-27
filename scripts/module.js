// TODO: Generate docs into file automatically
Hooks.once('ready', async function() {
    // >> Add utils

    /**
     * A set of useful util functions
     *
     * @alias OUtils
     */
    window.OUtils = {
        /**
         * A convinience function to get an actor, given it's id
         *
         * @param {string} actorId - The id of the actor to get
         * @returns {Actor}
         *
         * @example
         * const actorId = game.user.character._id;
         * const actor = OUtils.getActor(actorId);
         * game.user.character === actor;
         */
        getActor: function(actorId) {
            return game.actors.find(a => a._id == actorId);
        },

        /**
         * A convinience function to list the available StatusEffect ids
         *
         * Useful for finding out what StatusEffects are available or making a
         * menu of available StatusEffects.
         *
         * @returns {string[]}
         */
        listStatusEffectIds: function() {
            return CONFIG.statusEffects.map(e => e.id)
        },

        /**
         * Returns a StatusEffect object
         *
         * This object can then be used to toggle a StatusEffect (the icons on
         * a token).
         *
         * @param {string} effectId
         * @returns {object}
         *
         * @example
         * const token = game.user.character.getActiveTokens()[0];
         * const statusEffect = OUtils.getStatusEffect("bleeding");
         * token.toggleEffect(statusEffect);
         * // The icon on the token for "bleeding" will now have toggled
         */
        getStatusEffect: function(effectId) {
            return CONFIG.statusEffects.find(e => e.id == effectId)
        },

        /**
         * Calculates the result of a DarkHeresy2E roll
         *
         * Returns whether the roll was a success or not along with the degrees
         * of either failure or success
         *
         * @param {number} targetValue - The target the roll was rolled against
         * @param {number} rollValue - The result of the roll
         * @returns {{success: boolean, degrees: number}}
         *
         * @example
         * const target = 55;
         * const roll = 54;
         *
         * const result = OUtils.getDegrees(target, roll);
         * result === {
         *     success: true,
         *     degrees: 1
         * };
         * // You get one degree or passing
         *
         * @example
         * const target = 55;
         * const roll = 70;
         *
         * const result = OUtils.getDegrees(target, roll);
         * result === {
         *     success: false,
         *     degrees: 3
         * };
         * // And an additional degree for the difference in tens
         *
         * @example
         * // A more realistic example
         * const hasRequiredTalent = true;
         * const target = new Roll("@base + @talentBonus", {
         *     base: "+0", // Challenging
         *     talentBonus: hasRequiredTalent ? "+10" : "+0",
         * }).roll();
         * const roll = new Roll("1d100").roll();
         *
         * const result = OUtils.getDegrees(target.total, roll.total);
         *
         * if (result.success) {
         *     console.log("You succeded the check");
         * } else {
         *     console.log("You failed the check");
         * }
         * // And an additional degree for the difference in tens
         */
        getDegrees: function(targetValue, rollValue) {
            const degrees = Math.floor(targetValue / 10) - Math.floor(rollValue / 10);

            // @PDF[Dark Heresy 2|page=22]{Roll Dice}
            // If the result of the percentile roll is less than or
            // equal to the target number, then the test succeeds.
            // Otherwise, the test fails.
            if (rollValue <= targetValue) {
                // @PDF[Dark Heresy 2|page=23]{Skill Tests}
                // If the roll is equal to or lower than the characteristic, the
                // character has gained one degree of success (DoS). He also gains
                // additional degrees of success equal to the tens digit of the target
                // value minus the tens digit of the roll.
                return {
                    success: true,
                    degrees: degrees + 1,
                }
            } else {
                // @PDF[Dark Heresy 2|page=23]{Skill Tests}
                // Conversely, if the roll is higher than the characteristic, the
                // character has gained one degree of failure (DoF), and gains
                // additional degrees of failure equal to the tens digit of the roll
                // minus the tens digit of the target value.
                return {
                    success: false,
                    degrees: Math.abs(degrees) + 1,
                }
            }
        }
    };

    // >> Extend Actor

    /**
     * Extensions to the base Actor class
     *
     * See the {@link https://foundryvtt.com/api/Actor.html|Actor} docs in
     * foundry
     *
     * @name Actor
     * @type {Actor}
     */

    /**
     * A convinience function to get the token for an actor, if there are
     * multiple tokens just the first is returned.
     *
     * @returns {Token}
     *
     * @throws if the actor has no tokens or the first token is null
     */
    Actor.prototype.getToken = function() {
        const tokens = this.getActiveTokens();

        if (tokens.length == 0) {
            throw new Error(`No token found for actor [${this.name}]`);
        }

        return tokens[0];
    }

    // TODO: Support StatusEffect being either objects or string paths to images

    /**
     * Returns the
     * {@link https://foundryvtt.com/api/ActiveEffect.html|ActiveEffect} that
     * represents the StatusEffect on the actor with the given effectId.
     *
     * Under the hood StatusEffects (icons on tokens) are really a class called
     * ActiveEffect. This adds some temporary information to a character that
     * can alter it. In this case it adds an icon overlaying the actor's token.
     *
     * If you can, I suggest *avoiding* using the ActiveEffect and just thinking
     * in terms of StatusEffects as ActiveEffects are poorly documented
     * (currently) and aren't used in moo-man's DarkHeresy2E module (yet).
     *
     * @param {string} effectId - The id of the StatusEffect
     * @returns {ActiveEffect}
     *
     * @example
     * const actor = game.user.character;
     * const activeEffect = actor.getActiveStatusEffect("bleeding");
     * if (activeEffect === null || activeEffect === undefined) {
     *     console.log("Oh no! I'm bleeding");
     * } else {
     *     console.log("Still safe");
     * }
     */
    Actor.prototype.getActiveStatusEffect = function(effectId) {
        return this.effects
            .find(e => e.data.flags.core.statusId == effectId);
    }

    /**
     * Tests to see if the actor has a StatusEffect with the given id
     * applied to it currently.
     *
     * @param {string} effectId - The id of the StatusEffect
     * @returns {boolean}
     *
     * @example
     * const actor = game.user.character;
     * if (actor.hasStatusEffect("bleeding")) {
     *     console.log("Oh no! I'm bleeding");
     * } else {
     *     console.log("Still safe");
     * }
     */
    Actor.prototype.hasStatusEffect = function(effectId) {
        const effect = this.getActiveStatusEffect(effectId);

        return !(effect === null || effect === undefined);
    }

    /**
     * Set's the StatusEffect either on or off
     *
     * Prefer using the wrapper functions:
     * {@link Actor#enableStatusEffect}
     * and {@link Actor#disableStatusEffect}
     *
     * @async
     * @param {string} effectId - The id of the StatusEffect
     * @param {boolean} status - Whether to enable, or disable the StatusEffect
     * @returns {Promise<boolean>}
     *
     * @throws if the actor has no tokens or the first token is null
     * @throws if the StatusEffect doesn't exist
     * 
     * @example
     * const actor = game.user.character;
     * const updated = await actor.setStatusEffect("bleeding", true);
     * if (updated) {
     *     console.log("I'm now bleeding");
     * } else {
     *     console.log("I can't bleed any more than I already am");
     * }
     */
    Actor.prototype.setStatusEffect = async function(effectId, status) {
        // Check if the StatusEffect is in the right state
        if (this.hasStatusEffect(effectId) == status) {
            // If it is, return
            return false;
        }

        // Otherwise toggle the StatusEffect

        const token = this.getToken();

        if (token === null || token === undefined) {
            throw new Error(`Unable to find token for actor [${this.name}]`);
        }

        const statusEffect = OUtils.getStatusEffect(effectId);

        if (statusEffect === null || statusEffect === undefined) {
            throw new Error(`Status effect [${effectId}] not found`);
        }

        // Not much we can do about race conditions here :/
        // Maybe it's not an issue with javascript being single threaded
        await token.toggleEffect(statusEffect)

        return true;
    }

    /**
     * Enable the StatusEffect on the actor
     *
     * @async
     * @param {string} effectId - The id of the StatusEffect
     * @returns {Promise<boolean>}
     *
     * @throws if the actor has no tokens or the first token is null
     * @throws if the StatusEffect doesn't exist
     * 
     * @example
     * const actor = game.user.character;
     * const updated = await actor.enableStatusEffect("bleeding");
     * if (updated) {
     *     console.log("I'm now bleeding");
     * } else {
     *     console.log("I can't bleed any more than I already am");
     * }
     */
    Actor.prototype.enableStatusEffect = async function(effectId) {
        return await this.setStatusEffect(effectId, true);
    }

    /**
     * Disable the StatusEffect on the actor
     *
     * @async
     * @param {string} effectId - The id of the StatusEffect
     * @returns {Promise<boolean>}
     *
     * @throws if the actor has no tokens or the first token is null
     * @throws if the StatusEffect doesn't exist
     * 
     * @example
     * const actor = game.user.character;
     * const updated = actor.disableStatusEffect("bleeding");
     * if (updated) {
     *     console.log("Thank god I've stopped bleeding");
     * } else {
     *     console.log("I wasn't bleeding, but thanks");
     * }
     */
    Actor.prototype.disableStatusEffect = async function(effectId) {
        return await this.setStatusEffect(effectId, false);
    }

    // >> Extend DarkHeresyActor

    if (game.system.data.name == "dark-heresy") {
        /**
         * Extensions to the DarkHeresyActor class
         *
         * See the {@link https://github.com/moo-man/DarkHeresy2E-FoundryVTT/blob/master/script/common/actor.js|DarkHeresyActor} code (no docs yet)
         *
         * Requires the {@link https://github.com/moo-man/DarkHeresy2E-FoundryVTT|Dark Heresy 2E} System to be installed.
         *
         * If the system isn't installed these extensions won't be loaded
         *
         * @name DarkHeresyActor
         * @type {DarkHeresyActor}
         */
        const DarkHeresyActor = CONFIG.Actor.documentClass;

        /**
         * Check if the DarkHeresyActor has the given talent.
         *
         * Requires an exact match
         *
         * @alias DarkHeresyActor#hasTalent
         * @param {string} talentName - The name of the talent to look for (must be exact match)
         * @returns {boolean}
         *
         * @requires moo-man's Dark Heresy 2E System
         *
         * @example
         * const actor = game.user.character;
         * if (actor.hasTalent("Superior Chirurgeon")) {
         *     // Do some stuff to allow for extra healing
         *     // See my FirstAid macro for more
         * }
         */
        DarkHeresyActor.prototype.hasTalent = function(talentName) {
            const talents = this.data.items.filter(i => i.type == "talent");

            return talents.filter(t => t.name == talentName).length >= 1;
        }

        /**
         * The damage levels that a DarkHeresyActor actor can have
         *
         * @alias DarkHeresyActor#damageLevel
         * @type {object}
         * @const
         *
         * @requires moo-man's Dark Heresy 2E System
         */
        DarkHeresyActor.prototype.damageLevel = {
            /**
             * The character hasn't taken any damage at all
             *
             * @type {string}
             * @const
             *
             * @requires moo-man's Dark Heresy 2E System
             */
            NONE: "None",
            /**
             * The character is considered "Lightly Damaged"
             *
             * @PDF[Dark Heresy 2|page=244]{Lightly Damaged}
             * A character is considered Lightly Damaged if he has taken damage
             * equal to or less than twice his Toughness bonus
             *
             * @type {string}
             * @const
             *
             * @requires moo-man's Dark Heresy 2E System
             */
            LIGHTLY_DAMAGED: "Lightly Damaged",
            /**
             * The character is considered "Heavily Damaged"
             *
             * @PDF[Dark Heresy 2|page=244]{Heavily Damaged}
             * A character is considered Heavily Damaged whenever he has taken
             * more damage than twice his Toughness bonus
             *
             * @type {string}
             * @const
             *
             * @requires moo-man's Dark Heresy 2E System
             */
            HEAVILY_DAMAGED: "Heavily Damaged",
            /**
             * The character is considered "Critically Damaged"
             *
             * @PDF[Dark Heresy 2|page=244]{Critically Damaged}
             * A character is Critically Damaged whenever he has taken damage
             * in excess of his wounds
             *
             * @type {string}
             * @const
             *
             * @requires moo-man's Dark Heresy 2E System
             */
            CRITICALLY_DAMAGED: "Critically Damaged",
            /**
             * The character is considered "Dead"
             *
             * There are lots of different ways a character can be considered
             * dead.
             *
             * Like:
             * - From the effect of Critical Damage
             * - From taking Characteristic Damage
             * - From having fatigue exceeding double their threshold
             *
             * There are probably a few more ways beyond these but in the end I
             * don't think it matters as this is more at the discression of the
             * DM and the player anyway.
             *
             * So, because it's too complicated and the DM get's the final say
             * anyway I won't be tracking this.
             *
             * @type {string}
             * @const
             *
             * @requires moo-man's Dark Heresy 2E System
             */
            DEAD: "Dead"
        }

        /**
         * Calculates the level of damage a DarkHeresyActor has taken and
         * returns a string (effectively an enum) of which level it is.
         *
         * See {@link DarkHeresyActor.damageLevel} for the levels
         *
         * There are some wrapper functions which might be easier to use that
         * just return simple booleans:
         *
         * {@link DarkHeresyActor#isLightlyDamaged}
         * {@link DarkHeresyActor#isHeavilyDamaged}
         * {@link DarkHeresyActor#isCriticallyDamaged}
         *
         * These functions only check if a character is in the specified range.
         * i.e. if a character is Critically Damaged then isLightlyDamaged will
         * return false.
         *
         * @alias DarkHeresyActor#getDamageLevel
         * @returns {string}
         *
         * @requires moo-man's Dark Heresy 2E System
         *
         * @example
         * const actor = game.user.character;
         * switch (actor.getDamageLevel()) {
         *     case actor.damageLevel.NONE:
         *         console.log("I'm fine, thanks for asking");
         *         break
         *     case actor.damageLevel.LIGHTLY_DAMAGED:
         *         console.log("Meh, I've had worse");
         *         break
         *     case actor.damageLevel.HEAVILY_DAMAGED:
         *         console.log("Ok, I'll admit. This hurts");
         *         break
         *     case actor.damageLevel.CRITICALLY_DAMAGED:
         *         console.log(":'(");
         *         break
         * }
         */
        DarkHeresyActor.prototype.getDamageLevel = function() {
            const toughnessBonus = this.data.data.characteristics.toughness.bonus;
            const wounds = this.data.data.wounds;

            // We presume that wounds and critical damage are calculated
            // correctly on the Actor
            //
            // So wounds will be from 0 to max wounds
            // and critical wounds will only be populated if wounds is at max

            if (wounds.value <= 0) {
                return this.damageLevel.NONE;
            } else if (wounds.value <= (toughnessBonus * 2)) {
                // @PDF[Dark Heresy 2|page=244]{Lightly Damaged}
                // A character is considered Lightly Damaged if he has taken
                // damage equal to or less than twice his Toughness bonus
                return this.damageLevel.LIGHTLY_DAMAGED;
            } else {
                if (wounds.value >= wounds.max && wounds.critical > 0) {
                    // @PDF[Dark Heresy 2|page=244]{Critically Damaged}
                    // A character is Critically Damaged whenever he has taken damage
                    // in excess of his wounds
                    return this.damageLevel.CRITICALLY_DAMAGED;
                } else {
                    // @PDF[Dark Heresy 2|page=244]{Heavily Damaged}
                    // A character is considered Heavily Damaged whenever he has
                    // taken more damage than twice his Toughness bonus
                    return this.damageLevel.HEAVILY_DAMAGED;
                }
            }
        }

        /**
         * Checks to see if the DarkHeresyActor is Lightly Damaged
         *
         * If the character is any other damage level then this function
         * returns false.
         *
         * @alias DarkHeresyActor#isLightlyDamaged
         * @returns {boolean}
         *
         * @requires moo-man's Dark Heresy 2E System
         *
         * @example
         * const actor = game.user.character;
         * if (actor.isLightlyDamaged()) {
         *     // Do some stuff to reduce how effective FirstAid is
         *     // See the FirstAid macro for more
         * }
         */
        DarkHeresyActor.prototype.isLightlyDamaged = function() {
            return this.getDamageLevel() === this.damageLevel.LIGHTLY_DAMAGED;
        }

        /**
         * Checks to see if the DarkHeresyActor is Heavily Damaged
         *
         * If the character is any other damage level then this function
         * returns false.
         *
         * @alias DarkHeresyActor#isHeavilyDamaged
         * @returns {boolean}
         *
         * @requires moo-man's Dark Heresy 2E System
         *
         * @example
         * const actor = game.user.character;
         * if (actor.isHeavilyDamaged()) {
         *     // Do some stuff to reduce how effective FirstAid is
         *     // See the FirstAid macro for more
         * }
         */
        DarkHeresyActor.prototype.isHeavilyDamaged = function() {
            return this.getDamageLevel() === this.damageLevel.HEAVILY_DAMAGED;
        }

        /**
         * Checks to see if the DarkHeresyActor is Critically Damaged
         *
         * If the character is any other damage level then this function
         * returns false.
         *
         * @alias DarkHeresyActor#isCriticallyDamaged
         * @returns {boolean}
         *
         * @requires moo-man's Dark Heresy 2E System
         *
         * @example
         * const actor = game.user.character;
         * if (actor.isCriticallyDamaged()) {
         *     // Do some stuff to reduce how effective FirstAid is
         *     // See the FirstAid macro for more
         * }
         */
        DarkHeresyActor.prototype.isCriticallyDamaged = function() {
            return this.getDamageLevel() === this.damageLevel.CRITICALLY_DAMAGED;
        }
    }
});
