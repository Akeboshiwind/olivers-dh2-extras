// TODO: Test works
// TODO: Add in optional duration
// TODO: Add in optional reminder every turn
let cancelled = true;

new Dialog({
    title: "Toggle Status Effect",
    content:`
        <p>Ensure you have the targets selected</p>
        <form>
            <div class="form-group">
                <label>Status Effect</label>
                <select name="statusEffectId" id="statusEffectId">
                </select>
            </div>
        </form>`,
    buttons: {
        apply: {
            icon: '<i class="fas fa-check"></i>',
            label: "Apply",
            callback: () => { cancelled = false },
        }
    },
    default: "apply",
    jQuery: true,
    render: html => {
        const select = html.find('select[name="statusEffectId"]');
        for (const statusEffect of CONFIG.statusEffects) {
            select.append(`<option value="${statusEffect.id}" style="background-image:url(${statusEffect.icon});">${statusEffect.id}</option>`);
        }
    },
    close: async html => {
        if (cancelled) {
            return;
        }

        const selectedStatusEffect = html.find('select[name="statusEffectId"]').val();
        const statusEffect = OUtils.getStatusEffect(selectedStatusEffect);

        if (statusEffect === null || statusEffect === undefined) {
            return ui.notifications.error("Invalid StatusEffect selected");
        }
        
        for (const targetToken of game.user.targets) {
            try {
                await targetToken.toggleEffect(statusEffect);
            } catch (e) {
            }
        }
    }
}).render(true);
