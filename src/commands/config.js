const {
    SlashCommandBuilder, ActionRowBuilder, ComponentType,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} = require('discord.js');
const UserModel = require('../lib/db/model/user');
const log = require('../lib/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Change user settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('currency')
                .setDescription('Change the default currency used for your transactions')),
    async execute(interaction) {
        log.info(`${interaction.user.username} used the config command`);

        if (interaction.options.getSubcommand() === 'currency') {
            await handleCurrencySubcommand(interaction);
        }
    }
}

async function handleCurrencySubcommand(interaction) {
    const currencySelectMenu = new StringSelectMenuBuilder()
        .setCustomId('user-currency')
        .setPlaceholder('Choose the currency to use...')
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel('U.S. Dollar: $123,456.78')
                .setValue('USD'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Euro: €123.456,78')
                .setValue('EUR')
        );

    const currencySelectRow = new ActionRowBuilder()
        .addComponents(currencySelectMenu);

    const response = await interaction.reply({
        components: [currencySelectRow],
        ephemeral: true
    });

    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000
    });

    collector.on('collect', async (i) => {
        const value = i.values[0];

        let userRec = await UserModel.findOne({ id: interaction.user.id });
        if (userRec) {
            await userRec.setCurrency(value);
        } else {
            const userdata = {
                id: interaction.user.id,
                username: interaction.user.username,
                currency: value
            };

            userRec = await UserModel.new(userdata);
        }

        i.reply({
            content: `Got it, your currency preference is now set to ${value}!`,
            ephemeral: true
        }).then(msg => {
            setTimeout(() => msg.delete(), 2500)
        });
        interaction.deleteReply();
    });
}
