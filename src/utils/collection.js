export function toMap(array, keyFunction) {
    const chrs = Array(22).fill(0).map((_,i) => i+1).concat(['X', 'Y'])
    const result = {}
    chrs.forEach(chr => result['chr' + chr] = [])
    array.forEach((t) => {
        const k = keyFunction(t)
        result[k].push(t)
    })
    return result
}


export function partition (section, segments) {
    section = {
        ...section,
        start: 0,
        end: section.value
    }
    // section = {name:, start, end, ratio}
    if (segments.length === 0) {
        return [section]
    }

    function makeSeg (seg) {
        seg.value = seg.end - seg.start
        return seg
    }

    const line = []
    let lastSeg = null
    segments.forEach(((segment, i) => {
        if (lastSeg === null) {
            // 第一个分段 = [基因起点, 第一变异段起点]
            lastSeg = makeSeg({
                name: section.name,
                start: section.start,
                end: segment.start,
                isMutant: false
            })
            line.push(lastSeg)
        } else {
            // 新分段 = [前一分段结束点, 当前变异段起点]
            line.push(makeSeg({
                name: section.name,
                start: lastSeg.end,
                end: segment.start,
                isMutant: false
            }))
        }

        // 新分段 = [当前变异段起点, 当前变异段终点]
        lastSeg = makeSeg({
            name: section.name,
            start: segment.start,
            end: segment.end,
            ratio: segment.ratio,
            isMutant: true
        })
        line.push(lastSeg)
    }))

    line.push(makeSeg({
        name: section.name,
        start: segments[segments.length-1].end,
        end: section.end,
        isMutant: false
    }))

    return line
}
