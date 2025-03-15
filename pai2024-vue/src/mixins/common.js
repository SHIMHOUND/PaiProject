export const getIntersection = (array1, array2) => {
    const lookupSet = new Set(array2);
    return array1.filter(element => lookupSet.has(element));
};

export const checkIfInRole = (session = { roles: [0] }, roles = [0]) => {
    if (!session || !Array.isArray(session.roles)) {
        return false;
    }
    let intersection = getIntersection(session.roles, roles);
    return intersection.length > 0;
};

export default {
    methods: {
        checkIfInRole,
    },
};