const supportedCurrencies = ['EUR', 'USD'];

module.exports = {
    supportedCurrencies,
    formatAsCurrency,
    msToString,
    roundTo
}

function formatAsCurrency(amount, currency) {
    return amount; // TODO
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

function roundTo(n, digits) {
    let negative = false;

    if (digits === undefined) {
        digits = 0;
    }

    if (n < 0) {
        negative = true;
        n = n * -1;
    }

    let multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(digits);

    if (negative) {
        n = (n * -1).toFixed(digits);
    }

    return n;
}