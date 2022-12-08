import { globalStore } from 'src/stores/global'
import * as _ from 'lodash'

export const getSingleIdentifiers = (samples) => {
    return samples[0].identifier
}

export const getDualIdentifiers = (samples) => {
    return {
        qt: _.get(samples.filter(t => t.sample_meta.is_panel), '[0].identifier'),
        qn: _.get(samples.filter(t => !t.sample_meta.is_panel), '[0].identifier')
    }
}