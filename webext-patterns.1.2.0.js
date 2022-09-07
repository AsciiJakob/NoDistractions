var webextPatterns = (function (exports) {
	'use strict';

	function escapeStringRegexp(string) {
		if (typeof string !== 'string') {
			throw new TypeError('Expected a string');
		}
		return string
			.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
			.replace(/-/g, '\\x2d');
	}

	const patternValidationRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^file:\/\/\/.*$|^resource:\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^about:/;
	const isFirefox = typeof navigator === 'object' && navigator.userAgent.includes('Firefox/');
	const allStarsRegex = isFirefox
	    ? /^(https?|wss?):[/][/][^/]+([/].*)?$/
	    : /^https?:[/][/][^/]+([/].*)?$/;
	const allUrlsRegex = /^(https?|file|ftp):[/]+/;
	function getRawPatternRegex(matchPattern) {
	    if (!patternValidationRegex.test(matchPattern)) {
	        throw new Error(matchPattern + ' is an invalid pattern, it must match ' + String(patternValidationRegex));
	    }
	    let [, protocol, host, pathname] = matchPattern.split(/(^[^:]+:[/][/])([^/]+)?/);
	    protocol = protocol
	        .replace('*', isFirefox ? '(https?|wss?)' : 'https?')
	        .replace(/[/]/g, '[/]');
	    host = (host !== null && host !== void 0 ? host : '')
	        .replace(/^[*][.]/, '([^/]+.)*')
	        .replace(/^[*]$/, '[^/]+')
	        .replace(/[.]/g, '[.]')
	        .replace(/[*]$/g, '[^.]+');
	    pathname = pathname
	        .replace(/[/]/g, '[/]')
	        .replace(/[.]/g, '[.]')
	        .replace(/[*]/g, '.*');
	    return '^' + protocol + host + '(' + pathname + ')?$';
	}
	function patternToRegex(...matchPatterns) {
	    if (matchPatterns.length === 0) {
	        return /$./;
	    }
	    if (matchPatterns.includes('<all_urls>')) {
	        return allUrlsRegex;
	    }
	    if (matchPatterns.includes('*://*/*')) {
	        return allStarsRegex;
	    }
	    return new RegExp(matchPatterns.map(x => getRawPatternRegex(x)).join('|'));
	}
	const globSymbols = /([?*]+)/;
	function splitReplace(part, index) {
	    if (part === '') {
	        return '';
	    }
	    if (index % 2 === 0) {
	        return escapeStringRegexp(part);
	    }
	    if (part.includes('*')) {
	        return '.*';
	    }
	    return [...part].map(() => isFirefox ? '.' : '.?').join('');
	}
	function getRawGlobRegex(glob) {
	    const regexString = glob
	        .split(globSymbols)
	        .map(splitReplace)
	        .join('');
	    return ('^' + regexString + '$')
	        .replace(/^[.][*]/, '')
	        .replace(/[.][*]$/, '')
	        .replace(/^[$]$/, '.+');
	}
	function globToRegex(...globs) {
	    if (globs.length === 0) {
	        return /.*/;
	    }
	    return new RegExp(globs.map(x => getRawGlobRegex(x)).join('|'));
	}

	exports.allStarsRegex = allStarsRegex;
	exports.allUrlsRegex = allUrlsRegex;
	exports.globToRegex = globToRegex;
	exports.patternToRegex = patternToRegex;
	exports.patternValidationRegex = patternValidationRegex;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}));
