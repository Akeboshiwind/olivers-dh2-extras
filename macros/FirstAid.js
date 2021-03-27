// TODO: Test works
// >> >> Config

// The id of the status effect we'll use for healing
const healingEffect = "regen";



// >> >> Main

// We have a main function so that we can use `return` to conviniently exit
// early from the macro
async function main() {
    // >> Gather caster info

    const caster = game.user.character;
    const casterInfo = {
        medicaeTotal: caster.data.data.skills.medicae.total,
        intBonus: caster.data.data.characteristics.intelligence.bonus,
        hasSuperiorChirurgeon: caster.hasTalent("Superior Chirurgeon"),
    };


    // >> Heal all targets

    if (game.user.targets.size == 0) {
        return ui.notifications.error("Must select at least 1 target");
    }

    for (let target of game.user.targets) {


        // >> Gather target info

        const tActor = target.actor;
        const tActorInfo = {
            wounds: tActor.data.data.wounds,
        };


        // >> Skip target and warn if effect is already applied

        // @PDF[Dark Heresy 2|page=109]{First Aid}
        // A given individual can only be treated
        // with first aid once every 24 hours
        if (tActor.hasStatusEffect(healingEffect)) {
            // TODO: Handle case when about-time isn't installed
            try {
                const diff = await tActor.timeUntilStatusEffectExpiry(healingEffect);

                ui.notifications.error(`Target [${tActor.name}] already healed expires in [${diff.days}d ${diff.hours}h ${diff.minutes}m ${diff.seconds}s]`);
            } catch (e) {
                console.log("Something went wrong while getting event expiry");
                console.error(e);

                // Send a default notification without expiry info
                ui.notifications.warn(e.message);
                ui.notifications.error(`Target [${tActor.name}] healed in last 24 hours`);
            }
            continue;
        }


        // >> Calculate roll target

        let healingPenalty = "+0";

        // @PDF[Dark Heresy 2|page=109]{First Aid}
        // –10 penalty if his patient is Heavily Damaged
        // or a –10 penalty for every point of Critical Damage
        // if his patient is Critically Damaged.
        if (tActor.isCriticallyDamaged()) {
            console.log("Target is critically wounded");
            // @PDF[Dark Heresy 2|page=131]{Superior Chirurgeon}
            // Only suffer a -10 penalty when the target is critically wounded
            if (casterInfo.hasSuperiorChirurgeon) {
                healingPenalty = "-10";
            } else {
                healingPenalty = (-10 * tActorInfo.wounds.critical).toString()
            }
        } else if (tActor.isHeavilyDamaged()) {
            console.log("Target is critically wounded");
            // @PDF[Dark Heresy 2|page=131]{Superior Chirurgeon}
            // Ignores the penalties for Heavily Damaged patients 
            if (!casterInfo.hasSuperiorChirurgeon) {
                healingPenalty = "-10";
            } 
        }

        // @PDF[Dark Heresy 2|page=109]{First Aid}
        // To perform first aid, a character must make a Challenging (+0)
        // Medicae test (with the penalties above)
        const rollTarget = new Roll("@medicae + @supChir + @penalty",
            {
                medicae: casterInfo.medicaeTotal,
                // @PDF[Dark Heresy 2|page=131]{Superior Chirurgeon}
                // He gains a +20 bonus on all Medicae skill tests
                supChir: casterInfo.hasSuperiorChirurgeon ? "+20" : "+0",
                penalty: healingPenalty,
            }).roll();


        // >> Make the Roll

        const roll = new Roll("1d100").roll();
        const degrees = OUtils.getDegrees(rollTarget.total, roll.total);

        // >> Prepare the message

        let messageContent = `<h1>First Aid</h1>` +
                `<b>Roll:</b> ${roll.total}</br>` +
                `<b>Target:</b> ${rollTarget.total} [${rollTarget.result}]</br>` +
                "@PDF[Dark Heresy 2|page=244]{Healing}" +
                "@PDF[Dark Heresy 2|page=109]{First Aid}" +
                "@PDF[Dark Heresy 2|page=131]{Superior Chirurgeon}</br>";

        if (degrees.success) {

            // >> Calculate Healing

            // @PDF[Dark Heresy 2|page=109]{First Aid}
            // If he succeeds, he removes an amount of damage
            // from his patient equal to his Intelligence bonus,
            // plus one additional point of damage per degree of
            // success he scores on the test
            // (removing Critical damage before normal damage).
            const healing = new Roll("@intBonus + @dos", {
                intBonus: casterInfo.intBonus,
                dos: degrees.degrees,
            }).roll();

            const critToRemove = Math.min(tActorInfo.wounds.critical, healing.total);
            const newCritical = tActorInfo.wounds.critical - critToRemove;
            const woundsToRemove
                = Math.min(healing.total - critToRemove, tActorInfo.wounds.value);
            const newWounds = tActorInfo.wounds.value - woundsToRemove


            // TODO:
            // >> Heal the target


            // >> Add status Effect to character for 24 hours

            // @PDF[Dark Heresy 2|page=109]{First Aid}
            // A given individual can only be treated
            // with first aid once every 24 hours
            tActor.enableStatusEffectFor(healingEffect, {hours: 24});


            // >> Prepare message

            messageContent += `<span style="color:green">Success!</span></br>` +
                `<b>Healing:</b> ${healing.total} [${healing.result}]</br>` +
                `<b>New Wounds:</b> ${newWounds}</br>` +
                `<b>New Critical:</b> ${newCritical}</br>`;
        } else {
            messageContent += `<span style="color:red">Failure!</span>`;
        }


        // >> Send chat message

        ChatMessage.create({
            content: messageContent,
        });
    }
}

main();
