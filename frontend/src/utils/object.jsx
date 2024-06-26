import { assocPath, isNil } from 'ramda';
import { isNullOrEmpty } from '.';

export const valueByPath = (obj, path,ret=null) => {
    if (isNullOrEmpty(path)){
        return ret;
    }
    const _p = Array.isArray(path) ? path : path.split('.');
    const _v = _p.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    return isNil(_v) ? ret : _v;
}

export const updateByPath = (data, path, value) => {
    const _p = Array.isArray(path) ? path : path.split('.');
    return assocPath(_p, value, data);
}
export const updateData = (data, value) => {
    return {...data,...value};
}

export const nullIfEmpty = (obj) => {
    if (isObjectEmpty(obj)) {
        return null;
    }
    return obj;
}

export const isObjectEmpty = (obj) => {
    if (!obj) {
        return true;
    }

    if (Array.isArray(obj)) {
        return obj.length === 0;
    }

    if (typeof obj === 'object') {
        return Object.keys(obj).length === 0;
    }

    return false;
}

export const firstKeyValue = (obj) => {
    if (isObjectEmpty(obj)){
        return null;
    }
    return obj[Object.keys(obj)[0]];
}
export const firstKey = (obj) => {
    if (isObjectEmpty(obj)){
        return null;
    }
    return Object.keys(obj)[0];
}


export const json = (obj, ret) => {
    try {
        let json = JSON.parse(obj);
        if (!json && ret) {
            return ret;
        }
        return json;
    } catch (e) {
        return (!obj && ret) ? ret : obj;
    }
}

export const arrayItem = (array, index, ret = null) => {
    try {
        return array[index];
    } catch (e) {
        return ret;
    }
}


export const excludeObjectKeys = (value = {}, exclude = []) => {
    if (exclude.includes("*")) {
        return false;
    }
    const _exclude = v => exclude.some(x => {
        if (isNullOrEmpty(x)){
            return false;
        }else if (x.startsWith('%') && x.endsWith('%')) {
            return v.includes(x.replace(/^\%*|\%*$/g, ''));
        } else if (x.startsWith('%')) {
            return v.endsWith(x.replace(/^\%*/g, ''));
        } else if (x.endsWith('%')) {
            return v.startsWith(x.replace(/\%*$/g, ''));
        } else {
            return v === x;
        }
    });
    //let exclude = new Set(exclude);
    return Object.fromEntries(Object.entries(value).filter(e => !_exclude(e[0])));
}

export const includeObjectKeys = (value = {}, include = []) => {
    const _include = v => include.some(x => {
        if (isNullOrEmpty(x)){
            return true;
        }else if (x.startsWith('%') && x.endsWith('%')) {
            return v.includes(x.replace(/^\%*|\%*$/g, ''));
        } else if (x.startsWith('%')) {
            return v.endsWith(x.replace(/^\%*/g, ''));
        } else if (x.endsWith('%')) {
            return v.startsWith(x.replace(/\%*$/g, ''));
        } else {
            return v === x;
        }
    });
    return Object.fromEntries(Object.entries(value).filter(e => _include(e[0])));
}
export const filterObjectKeys = (value = {}, except = []) => {
    const _exclude = v => except.some(x => {
        if (x.startsWith('%') && x.endsWith('%')) {
            return v.includes(x.replace(/^\%*|\%*$/g, ''));
        } else if (x.startsWith('%')) {
            console.log(x.replace(/^\%*/g, ''))
            return v.endsWith(x.replace(/^\%*/g, ''));
        } else if (x.endsWith('%')) {
            return v.startsWith(x.replace(/\%*$/g, ''));
        } else {
            return v === x;
        }
    });
    //let exclude = new Set(except);
    return Object.fromEntries(Object.entries(value).filter(e => !_exclude(e[0])));
}


export const orderObjectKeys = o => Object.keys(json(o)).sort().reduce((r, k) => (r[k] = o[k], r), {});

export const xmlToJSON = (function () {

    this.version = "1.3.4";

    var options = { // set up the default options
        mergeCDATA: true, // extract cdata and merge with text
        grokAttr: true, // convert truthy attributes to boolean, etc
        grokText: true, // convert truthy text/attr to boolean, etc
        normalize: true, // collapse multiple spaces to single space
        xmlns: true, // include namespaces as attribute in output
        namespaceKey: '_ns', // tag name for namespace objects
        textKey: '_text', // tag name for text nodes
        valueKey: '_value', // tag name for attribute values
        attrKey: '_attr', // tag for attr groups
        cdataKey: '_cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
        attrsAsObject: true, // if false, key is used as prefix to name, set prefix to '' to merge children and attrs.
        stripAttrPrefix: true, // remove namespace prefixes from attributes
        stripElemPrefix: true, // for elements of same name in diff namespaces, you can enable namespaces and access the nskey property
        childrenAsArray: true // force children into arrays
    };

    var prefixMatch = new RegExp(/(?!xmlns)^.*:/);
    var trimMatch = new RegExp(/^\s+|\s+$/g);

    this.grokType = function (sValue) {
        if (/^\s*$/.test(sValue)) {
            return null;
        }
        if (/^(?:true|false)$/i.test(sValue)) {
            return sValue.toLowerCase() === "true";
        }
        if (isFinite(sValue)) {
            return parseFloat(sValue);
        }
        return sValue;
    };

    this.parseString = function (xmlString, opt) {
        return this.parseXML(this.stringToXML(xmlString), opt);
    }

    this.parseXML = function (oXMLParent, opt) {

        // initialize options
        for (var key in opt) {
            options[key] = opt[key];
        }

        var vResult = {},
            nLength = 0,
            sCollectedTxt = "";

        // parse namespace information
        if (options.xmlns && oXMLParent.namespaceURI) {
            vResult[options.namespaceKey] = oXMLParent.namespaceURI;
        }

        // parse attributes
        // using attributes property instead of hasAttributes method to support older browsers
        if (oXMLParent.attributes && oXMLParent.attributes.length > 0) {
            var vAttribs = {};

            for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
                var oAttrib = oXMLParent.attributes.item(nLength);
                vContent = {};
                var attribName = '';

                if (options.stripAttrPrefix) {
                    attribName = oAttrib.name.replace(prefixMatch, '');

                } else {
                    attribName = oAttrib.name;
                }

                if (options.grokAttr) {
                    vContent[options.valueKey] = this.grokType(oAttrib.value.replace(trimMatch, ''));
                } else {
                    vContent[options.valueKey] = oAttrib.value.replace(trimMatch, '');
                }

                if (options.xmlns && oAttrib.namespaceURI) {
                    vContent[options.namespaceKey] = oAttrib.namespaceURI;
                }

                if (options.attrsAsObject) { // attributes with same local name must enable prefixes
                    vAttribs[attribName] = vContent;
                } else {
                    vResult[options.attrKey + attribName] = vContent;
                }
            }

            if (options.attrsAsObject) {
                vResult[options.attrKey] = vAttribs;
            } else { }
        }

        // iterate over the children
        if (oXMLParent.hasChildNodes()) {
            for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
                oNode = oXMLParent.childNodes.item(nItem);

                if (oNode.nodeType === 4) {
                    if (options.mergeCDATA) {
                        sCollectedTxt += oNode.nodeValue;
                    } else {
                        if (vResult.hasOwnProperty(options.cdataKey)) {
                            if (vResult[options.cdataKey].constructor !== Array) {
                                vResult[options.cdataKey] = [vResult[options.cdataKey]];
                            }
                            vResult[options.cdataKey].push(oNode.nodeValue);

                        } else {
                            if (options.childrenAsArray) {
                                vResult[options.cdataKey] = [];
                                vResult[options.cdataKey].push(oNode.nodeValue);
                            } else {
                                vResult[options.cdataKey] = oNode.nodeValue;
                            }
                        }
                    }
                } /* nodeType is "CDATASection" (4) */
                else if (oNode.nodeType === 3) {
                    sCollectedTxt += oNode.nodeValue;
                } /* nodeType is "Text" (3) */
                else if (oNode.nodeType === 1) { /* nodeType is "Element" (1) */

                    if (nLength === 0) {
                        vResult = {};
                    }

                    // using nodeName to support browser (IE) implementation with no 'localName' property
                    if (options.stripElemPrefix) {
                        sProp = oNode.nodeName.replace(prefixMatch, '');
                    } else {
                        sProp = oNode.nodeName;
                    }

                    vContent = xmlToJSON.parseXML(oNode);

                    if (vResult.hasOwnProperty(sProp)) {
                        if (vResult[sProp].constructor !== Array) {
                            vResult[sProp] = [vResult[sProp]];
                        }
                        vResult[sProp].push(vContent);

                    } else {
                        if (options.childrenAsArray) {
                            vResult[sProp] = [];
                            vResult[sProp].push(vContent);
                        } else {
                            vResult[sProp] = vContent;
                        }
                        nLength++;
                    }
                }
            }
        } else if (!sCollectedTxt) { // no children and no text, return null
            if (options.childrenAsArray) {
                vResult[options.textKey] = [];
                vResult[options.textKey].push(null);
            } else {
                vResult[options.textKey] = null;
            }
        }

        if (sCollectedTxt) {
            if (options.grokText) {
                var value = this.grokType(sCollectedTxt.replace(trimMatch, ''));
                if (value !== null && value !== undefined) {
                    vResult[options.textKey] = value;
                }
            } else if (options.normalize) {
                vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '').replace(/\s+/g, " ");
            } else {
                vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '');
            }
        }

        return vResult;
    }


    // Convert xmlDocument to a string
    // Returns null on failure
    this.xmlToString = function (xmlDoc) {
        try {
            var xmlString = xmlDoc.xml ? xmlDoc.xml : (new XMLSerializer()).serializeToString(xmlDoc);
            return xmlString;
        } catch (err) {
            return null;
        }
    }

    // Convert a string to XML Node Structure
    // Returns null on failure
    this.stringToXML = function (xmlString) {
        try {
            var xmlDoc = null;

            if (window.DOMParser) {

                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(xmlString, "text/xml");

                return xmlDoc;
            } else {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString);

                return xmlDoc;
            }
        } catch (e) {
            return null;
        }
    }

    return this;
}).call({});

