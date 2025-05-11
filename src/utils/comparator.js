function falseCompare() {
    return false
}

export const useComparator = (operator) => {
    const f = {
        '>': (n1, n2) => Number(n1) > Number(n2),
        '<': (n1, n2) => Number(n1) < Number(n2),
        '=': (n1, n2) => Number(n1) === Number(n2),
    }[operator]

    return {
        compare: f || falseCompare,
    }
}

export const useComparatorOptions = () => {
    const options = [
        { label: '>', value: '>', compare: (n1, n2) => Number(n1) > Number(n2) },
        { label: '<', value: '<', compare: (n1, n2) => Number(n1) < Number(n2) },
        { label: '=', value: '=', compare: (n1, n2) => Number(n1) === Number(n2) },
        { label: '>=', value: '>=', compare: (n1, n2) => Number(n1) >= Number(n2) },
        { label: '<=', value: '<=', compare: (n1, n2) => Number(n1) <= Number(n2) },
    ]

    const compare = (operator, a, b) => {
        const option = options.find((opt) => opt.value === operator)
        if (option) {
            return option.compare(a, b)
        }
        return false
    }

    return {
        options,
        compare,
    }
}
