/**
 * 序列数据解析工具函数
 * 用于解析host_mapdb_info和sp_mapdb_info数据
 */

/**
 * 解析宿主原序列信息 (host_mapdb_info)
 * @param {string} hostMapdbInfo - 宿主原序列信息字符串
 * @returns {Array} 解析后的宿主序列数据数组
 */
export const parseHostMapdbInfo = (hostMapdbInfo) => {
    if (!hostMapdbInfo) return [];
    
    try {
        const hostLines = hostMapdbInfo.split('\n').filter(line => line.trim());
        return hostLines.map((line, index) => {
            const parts = line.split('\t');
            return {
                key: (index + 1).toString(),
                sequencePath: parts[0] || '',
                speciesName: parts[1] || '',
                sequenceId: parts[2] || '',
                versionInfo: parts[3] || '',
                originalName: parts[4] || ''
            };
        });
    } catch (error) {
        console.error('解析宿主原序列信息失败:', error);
        return [];
    }
};

/**
 * 解析病原原序列信息 (sp_mapdb_info)
 * @param {string} spMapdbInfo - 病原原序列信息字符串
 * @returns {Array} 解析后的病原序列数据数组
 */
export const parseSpMapdbInfo = (spMapdbInfo) => {
    if (!spMapdbInfo) return [];
    
    try {
        const pathogenLines = spMapdbInfo.split('\n').filter(line => line.trim());
        return pathogenLines.map((line, index) => {
            const parts = line.split('\t');
            return {
                key: (index + 1).toString(),
                sequencePath: parts[0] || '',
                strainName: parts[1] || '',
                sequenceId: parts[2] || '',
                classificationInfo: parts[3] || '',
                originalName: parts[4] || ''
            };
        });
    } catch (error) {
        console.error('解析病原原序列信息失败:', error);
        return [];
    }
};