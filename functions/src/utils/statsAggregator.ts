// functions/src/utils/statsAggregator.ts

export const aggregateStats = (raw: any[]) => {
  const stats = {
    total: raw.length,
    keywordCount: {} as Record<string, number>,
    sellerMap: {} as Record<string, number>,
  };

  for (const item of raw) {
    const { sellerId, text } = item;

    // 판매자별 개수 카운트
    stats.sellerMap[sellerId] = (stats.sellerMap[sellerId] || 0) + 1;

    // 키워드 카운트
    const words = text.split(/\s+/);
    for (const word of words) {
      stats.keywordCount[word] = (stats.keywordCount[word] || 0) + 1;
    }
  }

  return stats;
};
