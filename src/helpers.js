let helpers = {};

helpers.convertJSONtoURI = (json) => {
    return encodeURIComponent(JSON.stringify(json));
};

helpers.toCamelCase = (string) => {
    let output = '';
    
    let words = string.split(' ');

    if (words.length === 1) {
        let word = words[0];
        return word[0].toLowerCase() + word.slice(1);
    }

    words.forEach(function (el, i) {
        let word = el.toLowerCase();
        output += (i === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1));
    });

    return output;
};

helpers.strStartsFrom = (string, prefix) => {
    return string.startsWith(prefix);
};

export default helpers;