// TODO: Add documentation comments
let cancelled = true;

new Dialog({
    title:'Toxin Creation',
    content:`
      <form>
        <div class="form-group">
          <label>Sample Availability:</label>
          <select name="sampleAvailability" id="sampleAvailability">
      	  <option value="+0">Scarce</option>
      	  <option value="+10">Rare</option>
      	  <option value="+20">Very Rare</option>
      	  <option value="+30">Extremely Rare</option>
      	</select>
        </div>
        <div class="form-group">
          <label>Sample Craftsmanship:</label>
          <select name="sampleCraftsmanship" id="sampleCraftsmanship">
      	  <option value="-10">Poor</option>
      	  <option value="+0" selected="selected">Common</option>
      	  <option value="+10">Good</option>
      	  <option value="+20">Best</option>
      	</select>
        </div>
        <div class="form-group">
          <label>Sample Quantity</label>
          <select name="sampleQuantity" id="sampleQuantity">
      	  <option value="+0">1</option>
      	  <option value="+10">2-10</option>
      	  <option value="+20">11-50</option>
      	  <option value="+30">51-100</option>
      	</select>
        </div>
        <div class="form-group">
          <label>Workshop Quality</label>
          <select name="workshopQuality" id="workshopQuality">
      	  <option value="-20">Bad</option>
      	  <option value="-10">Poor</option>
      	  <option value="+0" selected="selected">Common</option>
      	  <option value="+10">Good</option>
      	  <option value="+20">Best</option>
      	</select>
        </div>
        <div class="form-group">
          <label>Circumstantial Modifiers</label>
          <select name="circumstantialModifiers" id="circumstantialModifiers">
      	  <option value="+0">None</option>
      	  <option value="+10">Test Subjects</option>
      	  <option value="+30">Self-Test</option>
      	</select>
        </div>
      </form>`,
    buttons: {
        yes: {
            icon: "<i class='fas fa-check'></i>",
            label: "Create Toxin",
            callback: () => { cancelled = false },
        }
    },
    default: 'yes',
    close: async html => {
        if (cancelled) {
            return;
        }
    
        // >> Selection info
        const sampleAvailability = html.find("select[name='sampleAvailability']").val();
        const sampleCraftsmanship = html.find("select[name='sampleCraftsmanship']").val();
        const sampleQuantity = html.find("select[name='sampleQuantity']").val();
        const workshopQuality = html.find("select[name='workshopQuality']").val();
        const circumstantialModifiers = html.find("select[name='circumstantialModifiers']").val();


        // >> Character info

        const character = game.user.character;
        // NOTE: Check if character is not null?
        //       Default to first selected target?
        const medicae = character.data.data.skills.medicae.total;
        const hasSuperiorChirurgeon = character.hasTalent("Superior Chirurgeon");

        const target = await(new Roll("0 + @medicae + @supChir + @sAvail + @sCraft + @sQuant + @wQual + @cirMod",
            {
                medicae: medicae,
                supChir: hasSuperiorChirurgeon ? "+20" : "+0",
                sAvail: sampleAvailability,
                sCraft: sampleCraftsmanship,
                sQuant: sampleQuantity,
                wQual: workshopQuality,
                cirMod: circumstantialModifiers,
            }).roll()).total;

        const roll = await(new Roll("1d100").roll());
        const degrees = OUtils.getDegrees(target, roll.total);


        // >> Send message to chat

        let messageContent = `<h1>Toxin Creation</h1>` +
                `<b>Sample Availability:</b> ${sampleAvailability}</br>` +
                `<b>Sample Craftsmanship:</b> ${sampleCraftsmanship}</br>` +
                `<b>Sample Quantity:</b> ${sampleQuantity}</br>` +
                `<b>Workshop Quality:</b> ${workshopQuality}</br>` +
                `<b>Circumstantial Modifiers:</b> ${circumstantialModifiers}</br>` +
                `<b>Roll:</b> ${roll.total}</br>` +
                `<b>Target:</b> ${target}</br>` +
                `@PDF[Liber Imperium|page=165]{Advanced Poisons & Toxins}` +
                `@PDF[Liber Imperium|page=295]{Toxin Creation}</br>`;

        if (degrees.success) {
            messageContent += `<span style="color:green">Success!</span></br>` +
                `<b>Toxin Creation Points:</b> ${degrees.degrees}`;

        } else {
            messageContent += `<span style="color:red">Failure!</span>`;
        }

        ChatMessage.create({
            content: messageContent,
        });
    }
}).render(true);
