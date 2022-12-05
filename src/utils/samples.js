import { globalStore } from 'src/stores/global'

export const getSingleIdentifiers = (samples) => {
    return samples[0].identifier
}

export const getDualIdentifiers = (samples) => {
    const qt = samples.filter(t => t.sample_meta.is_panel)[0].identifier
    let qn = null
    if (samples.length > 1) {
        qn = samples.filter(t => !t.sample_meta.is_panel)[0].identifier
    }
    return {qt, qn}
}
