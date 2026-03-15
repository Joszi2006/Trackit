// Keyword-based career tag fallback — no AI dependency, always returns tags.
const TAG_MAP: Array<[string[], string[]]> = [
  [['machine learning', 'ml engineer', 'deep learning', 'neural'],     ['machine-learning', 'data-science', 'algorithms']],
  [['software engineer', 'developer', 'programmer', 'software dev'],   ['fullstack', 'backend', 'systems']],
  [['data scientist', 'data analyst', 'analytics'],                    ['machine-learning', 'statistics', 'data-science']],
  [['web developer', 'frontend', 'backend', 'full stack'],             ['frontend', 'backend', 'fullstack']],
  [['doctor', 'physician', 'medical', 'medicine'],                     ['biology', 'chemistry', 'health-sciences']],
  [['nurse', 'nursing', 'healthcare'],                                 ['biology', 'anatomy', 'health-sciences']],
  [['lawyer', 'law', 'legal', 'attorney'],                             ['political-science', 'ethics', 'writing']],
  [['accountant', 'accounting', 'auditor', 'cpa'],                     ['accounting', 'finance', 'economics']],
  [['researcher', 'research', 'scientist', 'phd'],                     ['statistics', 'writing', 'methodology']],
  [['biologist', 'biology', 'biochemist'],                             ['biology', 'chemistry', 'research']],
  [['artist', 'designer', 'visual', 'graphic'],                        ['fine-arts', 'design', 'visual-culture']],
  [['musician', 'music', 'composer', 'performer'],                     ['music', 'performance', 'theory']],
  [['business', 'entrepreneur', 'manager', 'mba'],                     ['business', 'finance', 'economics']],
  [['economist', 'economics', 'finance', 'investment'],                ['economics', 'statistics', 'finance']],
]

export function keywordFallback(goal: string): string[] {
  const lower = goal.toLowerCase()
  for (const [keywords, tags] of TAG_MAP) {
    if (keywords.some(kw => lower.includes(kw))) return tags
  }
  return ['general']
}
