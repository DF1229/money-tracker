const { Locale, EmbedBuilder, Colors } = require('discord.js');

const supportedCurrencies = ['EUR', 'USD'];

module.exports = {
    supportedCurrencies,
    toCurrency,
    msToString,
    replyError,
    isValidDate
}

/**
 * 
 * @param {Number} amount The number to format as currency
 * @param {Locale} locale The user's locale
 * @param {String} format The currency to format into, defaults to USD
 * @returns {String}
 */
function toCurrency(amount, locale, format = 'USD') {
    let currency = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: format,
    });
    
    return currency.format(amount);
}

function msToString(ms) {
    let seconds = ms / 1000;
    let days = 0, hours = 0, minutes = 0;

    while (seconds > 86400) {
        days++;
        seconds -= 86400;
    }
    while (seconds > 3600) {
        hours++;
        seconds -= 3600;
    }
    while (seconds > 60) {
        minutes++;
        seconds -= 60;
    }

    seconds = Math.round(seconds);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

function replyError(interaction, msg) {
    const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setDescription(`:no_entry_sign: ${msg}`);

    if (interaction.deferred)
        return interaction.followUp({ embeds: [embed], ephemeral: true });
    else
        return interaction.reply({ embeds: [embed], ephemeral: true });
}

function isValidDate(input) {
    return !isNaN(new Date(input));
}