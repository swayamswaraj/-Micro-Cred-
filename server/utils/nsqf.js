// simple mapping table
const map = {
  Python: 4,
  Java: 5,
  "Data Science": 7,
  "Machine Learning": 8,
  Excel: 3,
};

export function calculateNSQF(skills) {
  if (!skills?.length) return 1;
  const levels = skills.map((s) => map[s] || 1);
  return Math.max(...levels);
}
