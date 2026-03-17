export function isRP2Flow(record) {
    const code = record?.flow?.code
    return ['rp2', 'RIApanelv1multi'].includes(code)
}
