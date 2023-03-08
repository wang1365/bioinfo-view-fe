function falseCompare() {
    return false
}

export const useComparator = (operator) => {
    const f = {
        '>': (n1, n2) => n1 > n2,
        '<': (n1, n2) => n1 < n2,
        '=': (n1, n2) => n1 === n2,
    }[operator]

    return {
        compare: f || falseCompare,
    }
}
