const { StringDecoder } = require('string_decoder');

export default class ByteUtils {
    static getShortFromBytes(v) {
        const buf = new ArrayBuffer(2);
        const i = new Uint8Array(buf);
        i[0] = v[0];
        i[1] = v[1];
        const s = new Int16Array(buf);
        return s[0];
    }

    static getFloatFromBytes(v) {
        const buf = new ArrayBuffer(4);
        const i = new Uint8Array(buf);
        i[0] = v[0];
        i[1] = v[1];
        i[2] = v[2];
        i[3] = v[3];
        const f = new Float32Array(buf);
        return f[0];
    }

    static getLongFromBytes(v) {
        const buf = new ArrayBuffer(4);
        const i = new Uint8Array(buf);
        i[0] = v[0];
        i[1] = v[1];
        i[2] = v[2];
        i[3] = v[3];
        const l = new Int32Array(buf);
        return l[0];
    }

    static getStringFromBytes(v) {
        const decoder = new StringDecoder('utf8');
        return decoder.end(v);
    }

    static getBytesFromShort(v) {
        const buf = new ArrayBuffer(2);
        const s = new Int16Array(buf);
        s[0] = v;
        const i = new Uint8Array(buf);
        return [i[0], i[1]];
    }

    static getBytesFromFloat(v) {
        const buf = new ArrayBuffer(4);
        const f = new Float32Array(buf);
        f[0] = v;
        const i = new Uint8Array(buf);
        return [i[0], i[1], i[2], i[3]];
    }

    static getBytesFromLong(v) {
        const buf = new ArrayBuffer(4);
        const l = new Int32Array(buf);
        l[0] = v;
        const i = new Uint8Array(buf);
        return [i[0], i[1], i[2], i[3]];
    }
}
