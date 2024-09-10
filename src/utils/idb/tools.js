export function testWhere(clause, condition) {
    if(!clause) return true;
    if(!condition) return false;

    if(Array.isArray(clause)) {
        return clause.map(e=>testWhere(e, condition)).includes(true);
    } else if(typeof clause === 'object') {
        for(const key in clause) {
            if(clause[key] !== condition[key]) return false;
        }
        return true;
    } else {
        return false;
    }
}

export function formatSelect(clause, result) {
    if(!clause || !result) return result;

    const o = {};
    for(const k of clause) {
        o[k] = result[k]
    }
    return o;
}